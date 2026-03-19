"""
VisionAIoT — Universal Camera Worker
Accepts --ip and --id arguments so it works for any camera node.

Run directly:
    python worker.py --ip http://10.30.56.122:8080/video --id CAM-04

Or use start_nodes.py to launch all nodes at once.
"""

import cv2
import base64
import time
import requests
import argparse
from ultralytics import YOLO

# ─── Args ─────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="VisionAIoT Edge Node Worker")
parser.add_argument("--ip", required=True, help="Camera stream URL")
parser.add_argument("--id", required=True, help="Camera ID (e.g. CAM-04)")
args = parser.parse_args()

# ─── Config ───────────────────────────────────────────────────────────────────
API_ENDPOINT          = "http://localhost:4000/api/update-stream"
TARGET_FPS            = 10
CONF_THRESH           = 0.45
CROWD_THRESHOLD       = 4       # Indian Red Flag: 4+ persons
HAZARD_CLASSES        = {"knife", "scissors", "baseball bat"}

# ─── Load Model ───────────────────────────────────────────────────────────────
print(f"[{args.id}] ⚙️  Loading YOLOv8n...")
model = YOLO("yolov8n.pt")
print(f"[{args.id}] ✅ Model ready — connecting to {args.ip}")

# ─── Stream Loop ──────────────────────────────────────────────────────────────
def monitor():
    cap = cv2.VideoCapture(args.ip)

    if not cap.isOpened():
        print(f"[{args.id}] ❌ Cannot connect to {args.ip}")
        return

    print(f"[{args.id}] 📡 Stream connected. Pushing to dashboard...")

    frame_interval = 1.0 / TARGET_FPS
    last_push = 0

    while True:
        success, frame = cap.read()
        if not success:
            print(f"[{args.id}] ⚠️  Stream lost — retrying...")
            time.sleep(1)
            cap = cv2.VideoCapture(args.ip)
            continue

        now = time.time()
        if now - last_push < frame_interval:
            continue
        last_push = now

        t0 = time.time()
        results = model(frame, conf=CONF_THRESH, verbose=False)
        inference_ms = round((time.time() - t0) * 1000, 1)

        person_count  = 0
        hazards_found = []

        if results[0].boxes is not None:
            for box in results[0].boxes:
                label = model.names[int(box.cls[0])]
                if label == "person":
                    person_count += 1
                if label in HAZARD_CLASSES:
                    hazards_found.append(label)

        object_count = len(results[0].boxes) if results[0].boxes is not None else 0
        is_red_flag  = person_count >= CROWD_THRESHOLD

        if is_red_flag:
            status = "INDIAN_RED_FLAG"
            print(f"🚩 [{args.id}] RED FLAG — {person_count} persons! | {inference_ms}ms")
        elif hazards_found:
            status = "ALERT ACTIVE"
            print(f"🚨 [{args.id}] HAZARD: {', '.join(hazards_found)} | {inference_ms}ms")
        else:
            status = "LIVE"
            print(f"✅ [{args.id}] Clear | {person_count}p | {inference_ms}ms", end="\r")

        annotated = results[0].plot()
        _, buf    = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 72])
        b64_frame = base64.b64encode(buf).decode("utf-8")

        try:
            requests.post(API_ENDPOINT, json={
                "camId":   args.id,
                "image":   b64_frame,
                "objects": object_count,
                "status":  status,
                "metrics": {
                    "inferenceTime": inference_ms,
                    "personCount":   person_count,
                    "hazards":       hazards_found,
                    "isRedFlag":     is_red_flag,
                },
            }, timeout=0.5)
        except requests.exceptions.ConnectionError:
            print(f"\n[{args.id}] ⚠️  Backend unreachable (port 4000) — retrying next frame")
        except Exception:
            pass

    cap.release()

if __name__ == "__main__":
    monitor()
