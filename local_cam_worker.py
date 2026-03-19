"""
VisionAIoT — Local Webcam Worker (Presentation Mode)
Uses your laptop's built-in camera (index 0) instead of an IP address.
Ideal for live demos — zero network latency, ~4ms inference.

Requirements (already installed):
    pip install ultralytics opencv-python requests

Run:
    python local_cam_worker.py
"""

import cv2
import base64
import time
import requests
from ultralytics import YOLO

# ─── Configuration ────────────────────────────────────────────────────────────
CAM_ID       = "CAM-04"          # Maps to the Primary Violation Monitor slot
CAM_INDEX    = 0                  # 0 = built-in webcam, 1 = external USB cam
API_ENDPOINT = "http://localhost:4000/api/update-stream"
TARGET_FPS   = 15                 # Higher FPS since there's no network delay
CONF_THRESH  = 0.45

# ─── Indian Red Flag Logic ────────────────────────────────────────────────────
CROWD_THRESHOLD  = 4             # 4+ people = crowd violation
HAZARD_CLASSES   = {             # Harmful materials that trigger ALERT ACTIVE
    "knife",
    "scissors",
    "baseball bat",
    "tennis racket",
}

# ─── Load Model ───────────────────────────────────────────────────────────────
print("⚙️  Loading YOLOv8n model...")
model = YOLO("yolov8n.pt")
print("✅ Model ready. Starting local camera...\n")

# ─── Main Loop ────────────────────────────────────────────────────────────────
def start_local_detection():
    cap = None
    for index in [0, 1, 2]:
        test = cv2.VideoCapture(index)
        if test.isOpened():
            cap = test
            print(f"✅ Camera found at index {index}")
            break
        test.release()

    if cap is None:
        print("❌ No camera found at indices 0, 1, or 2.")
        print("   Check Windows Settings → Privacy → Camera → Allow desktop apps.")
        return

    # Optionally set resolution for better performance
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print(f"📷 Local Webcam active → mapped to {CAM_ID} on dashboard")
    print(f"   Crowd threshold : {CROWD_THRESHOLD}+ persons = 🚩 INDIAN RED FLAG")
    print(f"   Hazard classes  : {', '.join(HAZARD_CLASSES)}\n")

    frame_interval = 1.0 / TARGET_FPS
    last_push = 0

    while True:
        success, frame = cap.read()
        if not success:
            print("⚠️  Camera read failed — retrying...")
            time.sleep(0.1)
            continue

        now = time.time()
        if now - last_push < frame_interval:
            continue
        last_push = now

        t0 = time.time()

        # ── YOLOv8 Inference ──────────────────────────────────────────────────
        results  = model(frame, conf=CONF_THRESH, verbose=False)
        inference_ms = round((time.time() - t0) * 1000, 1)

        person_count = 0
        hazards_found = []

        if results[0].boxes is not None:
            for box in results[0].boxes:
                label = model.names[int(box.cls[0])]
                if label == "person":
                    person_count += 1
                if label in HAZARD_CLASSES:
                    hazards_found.append(label)

        object_count = len(results[0].boxes) if results[0].boxes is not None else 0

        # ── Indian Red Flag Decision ───────────────────────────────────────────
        is_red_flag = person_count >= CROWD_THRESHOLD
        has_hazard  = len(hazards_found) > 0

        if is_red_flag:
            status = "INDIAN_RED_FLAG"
            print(f"🚩 INDIAN RED FLAG — {person_count} persons in frame! | {inference_ms}ms")
        elif has_hazard:
            status = "ALERT ACTIVE"
            print(f"🚨 HAZARD DETECTED: {', '.join(hazards_found)} | {inference_ms}ms")
        else:
            status = "LIVE"
            print(f"✅ Clear | {person_count} person(s) | {object_count} objects | {inference_ms}ms", end="\r")

        details = f"{person_count} Persons" + (f" | Hazards: {', '.join(hazards_found)}" if hazards_found else "")

        # ── Encode annotated frame ────────────────────────────────────────────
        annotated = results[0].plot()
        _, buf     = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 75])
        b64_frame  = base64.b64encode(buf).decode("utf-8")

        # ── Push to backend ───────────────────────────────────────────────────
        try:
            requests.post(
                API_ENDPOINT,
                json={
                    "camId":   CAM_ID,
                    "image":   b64_frame,
                    "objects": object_count,
                    "status":  status,
                    "metrics": {
                        "inferenceTime": inference_ms,
                        "personCount":   person_count,
                        "hazards":       hazards_found,
                        "isRedFlag":     is_red_flag,
                        "details":       details,
                    },
                },
                timeout=0.3,
            )
        except requests.exceptions.ConnectionError:
            print("\n⚠️  Backend not reachable — is 'npm run dev' running in /backend?")
        except Exception:
            pass

    cap.release()
    print("\n🛑 Local camera closed.")


if __name__ == "__main__":
    start_local_detection()
