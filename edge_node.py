import cv2
import requests
import argparse
import time
import json
import os
from ultralytics import YOLO

# ─── CLI Arguments ───────────────────────────────────────────
parser = argparse.ArgumentParser(description="VisionAIoT Universal Edge Worker")
parser.add_argument("--ip", required=True, help="IP of Web Cam (e.g. 10.226.68.44)")
parser.add_argument("--cam_id", required=True, help="Camera ID (e.g. CAM-08)")
parser.add_argument("--port", default="8080", help="Port of the camera stream (default: 8080)")
parser.add_argument("--endpoint", default="/video", help="Stream endpoint path (default: /video)")
parser.add_argument("--backend", default="http://localhost:4000", help="Dashboard backend URL")
args = parser.parse_args()

# ─── Configuration ───────────────────────────────────────────
API_URL = f"{args.backend}/api/alerts/open"
HEARTBEAT_URL = f"{args.backend}/api/edge/heartbeat"
SETTINGS_URL = f"{args.backend}/api/settings"
STREAM_URL = f"http://{args.ip}:{args.port}{args.endpoint}"
OFFLINE_CACHE_DIR = "offline_logs"
OFFLINE_CACHE_FILE = os.path.join(OFFLINE_CACHE_DIR, f"{args.cam_id}_cache.json")

# Ensure offline logs directory exists
os.makedirs(OFFLINE_CACHE_DIR, exist_ok=True)

# Load model
model = YOLO("yolov8n.pt")

# Dynamic threshold (synced from dashboard settings)
DYNAMIC_CONFIDENCE = 0.75

# ─── Offline Cache ───────────────────────────────────────────

def load_offline_cache():
    """Load cached alerts from disk."""
    if os.path.exists(OFFLINE_CACHE_FILE):
        with open(OFFLINE_CACHE_FILE, "r") as f:
            return json.load(f)
    return []

def save_offline_cache(cache):
    """Persist cached alerts to disk."""
    with open(OFFLINE_CACHE_FILE, "w") as f:
        json.dump(cache, f)

def flush_offline_cache():
    """Try to send all cached alerts to the dashboard."""
    cache = load_offline_cache()
    if not cache:
        return
    
    remaining = []
    for payload in cache:
        try:
            resp = requests.post(API_URL, json=payload, timeout=2)
            if resp.status_code in (200, 201):
                print(f"  [CACHE FLUSH] Sent cached alert: {payload['type']}")
            else:
                remaining.append(payload)
        except:
            remaining.append(payload)
            break  # Stop trying if server is still down
    
    save_offline_cache(remaining)
    if not remaining:
        print(f"  [CACHE FLUSH] All cached alerts sent successfully!")

# ─── Network Helpers ─────────────────────────────────────────

def send_heartbeat():
    """POST a heartbeat to keep System Health at 100%."""
    try:
        requests.post(HEARTBEAT_URL, json={"node": args.cam_id}, timeout=2)
    except:
        pass

def sync_settings():
    """Fetch the latest global configuration from the Command Center."""
    global DYNAMIC_CONFIDENCE
    try:
        res = requests.get(SETTINGS_URL, timeout=3)
        if res.status_code == 200:
            config = res.json()
            new_thresh = float(config.get('anomalyThreshold', DYNAMIC_CONFIDENCE))
            if new_thresh != DYNAMIC_CONFIDENCE:
                DYNAMIC_CONFIDENCE = new_thresh
                print(f"  [SETTINGS SYNC] Threshold updated → {DYNAMIC_CONFIDENCE:.2f}")
    except:
        pass

def send_alert(payload):
    """POST an alert to the dashboard. Cache locally if offline."""
    try:
        resp = requests.post(API_URL, json=payload, timeout=2)
        if resp.status_code in (200, 201):
            print(f"  [{args.cam_id}] ✓ Alert: {payload['type']} ({payload['confidence']}%)")
            return True
        else:
            raise Exception(f"Status {resp.status_code}")
    except Exception as e:
        # OFFLINE MODE: Cache to disk
        cache = load_offline_cache()
        cache.append(payload)
        save_offline_cache(cache)
        print(f"  [{args.cam_id}] 📁 Offline Mode — Cached alert locally ({len(cache)} queued)")
        return False

# ─── Main Inference Loop ─────────────────────────────────────

def start_detection():
    print(f"─" * 50)
    print(f"  VisionAIoT Edge Worker — {args.cam_id}")
    print(f"  Stream:  {STREAM_URL}")
    print(f"  Backend: {args.backend}")
    print(f"─" * 50)

    # Initial sync
    send_heartbeat()
    sync_settings()
    flush_offline_cache()

    # Connect to camera (with auto-reconnect)
    cap = None
    reconnect_attempts = 0
    MAX_RECONNECT = 10
    
    while reconnect_attempts < MAX_RECONNECT:
        print(f"[{args.cam_id}] 📡 Connecting to {STREAM_URL}...")
        cap = cv2.VideoCapture(STREAM_URL)
        
        if cap.isOpened():
            print(f"[{args.cam_id}] ✓ Stream connected!")
            reconnect_attempts = 0
            break
        else:
            reconnect_attempts += 1
            print(f"[{args.cam_id}] ⚠ Connection failed. Retry {reconnect_attempts}/{MAX_RECONNECT} in 5s...")
            time.sleep(5)

    if cap is None or not cap.isOpened():
        print(f"[{args.cam_id}] Falling back to USB webcam (device 0)...")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print(f"[{args.cam_id}] FATAL: No camera available. Exiting.")
            return

    last_heartbeat = time.time()
    frame_count = 0
    dashboard_online = True

    while cap.isOpened():
        success, frame = cap.read()
        
        if not success:
            # Auto-reconnect on stream drop
            print(f"[{args.cam_id}] ⚠ Stream dropped. Reconnecting in 5s...")
            cap.release()
            time.sleep(5)
            cap = cv2.VideoCapture(STREAM_URL)
            if not cap.isOpened():
                print(f"[{args.cam_id}] ⚠ Reconnect failed. Retrying...")
                time.sleep(5)
                continue
            else:
                print(f"[{args.cam_id}] ✓ Stream reconnected!")
                continue

        frame_count += 1

        # Run YOLOv8 Inference
        results = model.predict(frame, conf=0.5, verbose=False)

        for r in results:
            for box in r.boxes:
                label = model.names[int(box.cls[0])]
                confidence = float(box.conf[0])

                # Only alert if above the dynamic threshold from global settings
                if confidence >= DYNAMIC_CONFIDENCE:
                    payload = {
                        "location": args.cam_id,
                        "type": label.upper().replace(' ', '_'),
                        "confidence": round(confidence * 100, 2),
                        "timestamp": time.time()
                    }
                    was_sent = send_alert(payload)
                    if not was_sent:
                        dashboard_online = False

        # Heartbeat + settings sync + offline flush every 30 seconds
        now = time.time()
        if now - last_heartbeat >= 30:
            send_heartbeat()
            sync_settings()
            
            # Try to flush offline cache when dashboard comes back
            if not dashboard_online:
                flush_offline_cache()
                cache = load_offline_cache()
                if not cache:
                    dashboard_online = True
                    print(f"[{args.cam_id}] ✓ Dashboard reconnected. All cached alerts flushed.")

            last_heartbeat = now

        time.sleep(0.033)  # ~30 FPS

    cap.release()
    cv2.destroyAllWindows()
    print(f"[{args.cam_id}] Camera released. Shutting down.")

# ─── Entry Point ─────────────────────────────────────────────

if __name__ == "__main__":
    start_detection()
