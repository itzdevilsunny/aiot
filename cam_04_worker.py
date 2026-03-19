"""
VisionAIoT — CAM-04 Edge Worker
Streams from your IP Webcam, runs YOLOv8 inference, and pushes
live frames + detections to the Node.js backend (port 4000).

Requirements:
    pip install ultralytics opencv-python requests

Run:
    python cam_04_worker.py
"""

import cv2
import base64
import time
import requests
from ultralytics import YOLO

# ─── Configuration ───────────────────────────────────────────────────────────
CAM_ID       = "CAM-04"
CAMERA_URL   = "http://10.30.56.122:8080/video"   # CAM-04 confirmed IP
API_ENDPOINT = "http://localhost:4000/api/update-stream"  # Backend port 4000
TARGET_FPS   = 10
CONF_THRESH  = 0.45

# Indian Red Flag: triggers when 4+ people detected simultaneously
INDIAN_RED_FLAG_THRESHOLD = 4

# Violation-relevant YOLO classes
VIOLATION_CLASSES = {
    0:  "Person",
    2:  "Vehicle",
    67: "Phone",
    73: "Laptop",
    76: "Scissors",
}

# ─── Load Model ──────────────────────────────────────────────────────────────
print("⚙️  Loading YOLOv8n model...")
model = YOLO("yolov8n.pt")   # Downloads automatically on first run
print("✅ Model ready.")

# ─── Stream Loop ─────────────────────────────────────────────────────────────
def start_node_bridge():
    cap = cv2.VideoCapture(CAMERA_URL)

    if not cap.isOpened():
        print(f"❌ Cannot connect to {CAMERA_URL}")
        print("   Make sure IP Webcam app is running on your phone and")
        print("   both devices are on the same Wi-Fi network.")
        return

    print(f"📡 Handshaking with {CAM_ID} @ 192.0.0.4...")
    frame_interval = 1.0 / TARGET_FPS
    last_push = 0

    while True:
        success, frame = cap.read()
        if not success:
            print("⚠️  Stream sync lost — retrying in 1s...")
            time.sleep(1)
            cap = cv2.VideoCapture(CAMERA_URL)
            continue

        now = time.time()
        if now - last_push < frame_interval:
            continue
        last_push = now

        t0 = time.time()

        # ── Run YOLOv8 Inference ──────────────────────────────────────────
        results = model(frame, conf=CONF_THRESH, verbose=False)
        inference_ms = round((time.time() - t0) * 1000, 1)

        detections = results[0].boxes
        detected_classes = set()
        person_count = 0

        if detections is not None and len(detections):
            for cls_idx in detections.cls.cpu().numpy().astype(int):
                if cls_idx in VIOLATION_CLASSES:
                    detected_classes.add(VIOLATION_CLASSES[cls_idx])
                if cls_idx == 0:  # person class
                    person_count += 1

        object_count = len(detections) if detections is not None else 0

        # Indian Red Flag: 4+ people = crowd violation
        is_red_flag = person_count >= INDIAN_RED_FLAG_THRESHOLD
        status = "INDIAN_RED_FLAG" if is_red_flag else ("ALERT ACTIVE" if detected_classes else "LIVE")

        if is_red_flag:
            print(f"🚩 [{CAM_ID}] INDIAN RED FLAG — {person_count} persons detected! | {inference_ms}ms")
        elif detected_classes:
            print(f"🚨 [{CAM_ID}] VIOLATION: {', '.join(detected_classes)} | {object_count} objects | {inference_ms}ms")
        else:
            print(f"✅ [{CAM_ID}] Clear    | {object_count} objects | {inference_ms}ms", end="\r")

        # ── Annotate and encode frame ─────────────────────────────────────
        annotated = results[0].plot()
        _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
        b64_frame = base64.b64encode(buf).decode("utf-8")

        # ── Push to backend ───────────────────────────────────────────────
        try:
            requests.post(
                API_ENDPOINT,
                json={
                    "camId":   CAM_ID,
                    "image":   b64_frame,
                    "objects": object_count,
                    "status":  status,
                    "metrics": {
                        "inferenceTime":  inference_ms,
                        "violations":     list(detected_classes),
                        "personCount":    person_count,
                        "isRedFlag":      is_red_flag,
                    },
                },
                timeout=0.5,
            )
        except requests.exceptions.ConnectionError:
            print("\n⚠️  Backend not reachable — is 'npm run dev' running in /backend?")
        except Exception:
            pass  # Keep streaming even if one push fails

    cap.release()
    print("\n🛑 Stream closed.")


if __name__ == "__main__":
    start_node_bridge()
