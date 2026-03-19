# cam_08_worker.py — Dedicated Edge Worker for CAM-08
# Runs YOLOv8 inference on the IP Webcam at 10.226.68.44 and pushes
# real-time anomaly data to the VisionAIoT dashboard.
#
# Usage:   python cam_08_worker.py
# Prereqs: pip install ultralytics opencv-python requests

import cv2
import requests
import time
import json
import os
from ultralytics import YOLO

# ─── Configuration ───────────────────────────────────────────
CAM_ID = "CAM-08"
STREAM_URL = "http://10.226.68.44:8080/video"
API_ENDPOINT = "http://localhost:4000/api/alerts/open"
HEARTBEAT_URL = "http://localhost:4000/api/edge/heartbeat"
SETTINGS_URL = "http://localhost:4000/api/settings"
OFFLINE_LOG = "offline_logs/CAM-08_cache.json"

os.makedirs("offline_logs", exist_ok=True)

model = YOLO("yolov8n.pt")  # Nano for real-time speed

# Dynamic threshold (synced from dashboard settings)
THRESHOLD = 0.75

def sync_settings():
    global THRESHOLD
    try:
        res = requests.get(SETTINGS_URL, timeout=3)
        if res.status_code == 200:
            new_t = float(res.json().get('anomalyThreshold', THRESHOLD))
            if new_t != THRESHOLD:
                THRESHOLD = new_t
                print(f"  [SETTINGS] Threshold → {THRESHOLD:.2f}")
    except:
        pass

def send_heartbeat():
    try:
        requests.post(HEARTBEAT_URL, json={"node": CAM_ID}, timeout=2)
    except:
        pass

def cache_alert(payload):
    cache = []
    if os.path.exists(OFFLINE_LOG):
        with open(OFFLINE_LOG) as f:
            cache = json.load(f)
    cache.append(payload)
    with open(OFFLINE_LOG, "w") as f:
        json.dump(cache, f)
    return len(cache)

def flush_cache():
    if not os.path.exists(OFFLINE_LOG):
        return
    with open(OFFLINE_LOG) as f:
        cache = json.load(f)
    if not cache:
        return
    remaining = []
    for p in cache:
        try:
            r = requests.post(API_ENDPOINT, json=p, timeout=2)
            if r.status_code in (200, 201):
                print(f"  [FLUSH] Sent cached: {p['type']}")
            else:
                remaining.append(p)
        except:
            remaining.append(p)
            break
    with open(OFFLINE_LOG, "w") as f:
        json.dump(remaining, f)

def start_stream():
    print("=" * 50)
    print(f"  VisionAIoT Edge Worker — {CAM_ID}")
    print(f"  Stream:  {STREAM_URL}")
    print(f"  API:     {API_ENDPOINT}")
    print("=" * 50)

    send_heartbeat()
    sync_settings()
    flush_cache()

    cap = cv2.VideoCapture(STREAM_URL)
    if not cap.isOpened():
        print(f"⚠ Cannot open {STREAM_URL}. Falling back to webcam (0)...")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("FATAL: No camera available.")
            return

    print(f"✓ {CAM_ID} connected. Detecting...")
    last_hb = time.time()

    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            print(f"⚠ Stream lost. Reconnecting in 5s...")
            cap.release()
            time.sleep(5)
            cap = cv2.VideoCapture(STREAM_URL)
            continue

        results = model.predict(frame, conf=0.5, verbose=False)

        for r in results:
            for box in r.boxes:
                label = model.names[int(box.cls[0])]
                conf = float(box.conf[0])

                if conf >= THRESHOLD:
                    payload = {
                        "location": CAM_ID,
                        "type": label.upper().replace(' ', '_'),
                        "confidence": round(conf * 100, 2),
                        "timestamp": time.time()
                    }
                    try:
                        resp = requests.post(API_ENDPOINT, json=payload, timeout=2)
                        if resp.status_code in (200, 201):
                            print(f"  ✓ {label.upper()} ({conf:.0%})")
                    except:
                        queued = cache_alert(payload)
                        print(f"  📁 Offline — {queued} cached")

        # Local preview (uncomment to see the feed)
        # cv2.imshow(f"Live Feed: {CAM_ID}", frame)
        # if cv2.waitKey(1) & 0xFF == ord('q'): break

        now = time.time()
        if now - last_hb >= 30:
            send_heartbeat()
            sync_settings()
            flush_cache()
            last_hb = now

        time.sleep(0.033)

    cap.release()
    cv2.destroyAllWindows()
    print(f"{CAM_ID} shut down.")

if __name__ == "__main__":
    start_stream()
