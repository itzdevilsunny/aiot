"""
Vision Engine — Edge Node Script
Runs YOLOv8 inference on a camera stream and sends anomalies + heartbeats
to the Node.js backend, which then broadcasts them via WebSocket to the
React Command Center dashboard.

Usage:
    python vision_engine.py

Requires:
    pip install ultralytics opencv-python requests python-socketio
"""

import cv2
import requests
import time
import asyncio
import socketio
from ultralytics import YOLO

# ─── Configuration ───────────────────────────────────────────────────────────
BACKEND_API = "http://localhost:4000"         # Your Node.js backend
ANOMALY_ENDPOINT = f"{BACKEND_API}/api/alerts"
HEARTBEAT_ENDPOINT = f"{BACKEND_API}/api/edge/heartbeat"
WS_URL = BACKEND_API                          # Socket.io for bounding boxes

NODE_ID = "CAM-04"
CAMERA_URL = "http://192.168.1.8:8080/video"  # Your real IP Webcam
MODEL_PATH = "yolov8n.pt"                     # Change to your custom .pt file
CONFIDENCE_THRESHOLD = 0.50
ANOMALY_LABELS = ["person", "car", "truck", "unauthorized", "missing-gear"]
ANOMALY_CONFIDENCE = 0.75                     # Minimum to trigger an alert POST

TOKEN = "PASTE_YOUR_GENERATED_TOKEN_HERE"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

DYNAMIC_CONFIDENCE = ANOMALY_CONFIDENCE

# ─── Load Model ──────────────────────────────────────────────────────────────
print(f"[Edge Node {NODE_ID}] Loading YOLOv8 Model: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print(f"[Edge Node {NODE_ID}] Model loaded. Classes: {list(model.names.values())[:10]}...")

# ─── Socket.IO Client (for pushing bounding boxes to React) ─────────────────
sio = socketio.Client(reconnection=True, reconnection_delay=2)

@sio.event
def connect():
    print(f"[Edge Node {NODE_ID}] Connected to backend WebSocket.")

@sio.event
def disconnect():
    print(f"[Edge Node {NODE_ID}] Disconnected from backend WebSocket.")

# ─── Helper Functions ────────────────────────────────────────────────────────

def report_anomaly(label: str, conf: float):
    """POST an anomaly detection to the backend REST API."""
    payload = {
        "type": label.upper().replace(" ", "_"),
        "location": NODE_ID,
        "confidence": round(float(conf) * 100, 2),
        "timestamp": time.time()
    }
    try:
        resp = requests.post(ANOMALY_ENDPOINT, json=payload, headers=HEADERS, timeout=5)
        if resp.status_code == 201:
            print(f"  [ALERT SENT] {label} → Conf: {conf:.2%}")
        else:
            print(f"  [ALERT FAILED] Status {resp.status_code}")
    except Exception as e:
        print(f"  [CONNECTION ERROR] {e}")


def send_heartbeat():
    """POST a heartbeat to keep the System Health metric at 100%."""
    try:
        requests.post(HEARTBEAT_ENDPOINT, json={"node": NODE_ID}, headers=HEADERS, timeout=3)
        print(f"  [HEARTBEAT] {NODE_ID} → OK")
    except Exception as e:
        print(f"  [HEARTBEAT FAILED] {e}")


def sync_settings():
    """Fetch the latest global configuration from the Command Center."""
    global DYNAMIC_CONFIDENCE
    try:
        res = requests.get(f"{BACKEND_API}/api/settings", timeout=3)
        if res.status_code == 200:
            config = res.json()
            new_thresh = float(config.get('anomalyThreshold', ANOMALY_CONFIDENCE))
            if new_thresh != DYNAMIC_CONFIDENCE:
                DYNAMIC_CONFIDENCE = new_thresh
                print(f"  [SETTINGS SYNC] Global Threshold updated to {DYNAMIC_CONFIDENCE:.2f}")
    except Exception as e:
        pass


# ─── Main Inference Loop ─────────────────────────────────────────────────────

def run_inference():
    """Process the camera stream, run YOLO, push boxes via WS, post anomalies via REST."""

    # Connect Socket.IO
    try:
        sio.connect(WS_URL)
    except Exception as e:
        print(f"[Edge Node {NODE_ID}] WebSocket connect failed: {e}")
        print(f"[Edge Node {NODE_ID}] Will continue without WS bounding box streaming.")

    # Open camera
    print(f"[Edge Node {NODE_ID}] Opening camera: {CAMERA_URL}")
    cap = cv2.VideoCapture(CAMERA_URL if isinstance(CAMERA_URL, str) and CAMERA_URL.startswith("http") else int(CAMERA_URL))

    if not cap.isOpened():
        print(f"[Edge Node {NODE_ID}] ERROR: Cannot open camera at {CAMERA_URL}")
        print(f"[Edge Node {NODE_ID}] Falling back to USB webcam (device 0)...")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print(f"[Edge Node {NODE_ID}] FATAL: No camera available. Exiting.")
            return

    print(f"[Edge Node {NODE_ID}] Camera opened. Starting inference loop...")
    send_heartbeat()  # Initial heartbeat
    sync_settings()   # Initial settings pull

    last_heartbeat = time.time()
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue

        frame_count += 1
        frame_height, frame_width = frame.shape[:2]

        # Run YOLOv8 Inference
        results = model.predict(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)

        boxes_payload = []
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = model.names[cls]

                # Convert to percentages for React scaling
                x_pct = (x1 / frame_width) * 100
                y_pct = (y1 / frame_height) * 100
                w_pct = ((x2 - x1) / frame_width) * 100
                h_pct = ((y2 - y1) / frame_height) * 100

                # Color coding
                color = '#EF4444' if label in ['person', 'car', 'unauthorized'] else '#22C55E'

                boxes_payload.append({
                    'id': f"{cls}-{x_pct:.1f}",
                    'label': label.upper(),
                    'confidence': conf,
                    'color': color,
                    'x': x_pct,
                    'y': y_pct,
                    'width': w_pct,
                    'height': h_pct
                })

                # If critical detection → POST to REST API
                if label in ANOMALY_LABELS and conf > DYNAMIC_CONFIDENCE:
                    report_anomaly(label, conf)

        # Push bounding boxes via WebSocket (for LiveInferenceFeed component)
        if sio.connected and boxes_payload:
            try:
                sio.emit(f'boxes_{NODE_ID}', boxes_payload)
            except Exception:
                pass  # Non-critical, silently fail

        # Heartbeat every 30 seconds
        now = time.time()
        if now - last_heartbeat >= 30:
            send_heartbeat()
            sync_settings()
            last_heartbeat = now

        # Target ~30 FPS
        time.sleep(0.033)

    cap.release()
    if sio.connected:
        sio.disconnect()
    print(f"[Edge Node {NODE_ID}] Camera released. Shutting down.")


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print(f"  Vision AIoT Edge Node — {NODE_ID}")
    print(f"  Backend: {BACKEND_API}")
    print(f"  Camera:  {CAMERA_URL}")
    print(f"  Model:   {MODEL_PATH}")
    print("=" * 60)
    run_inference()
