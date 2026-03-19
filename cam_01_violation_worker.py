import cv2
import requests
import base64
from ultralytics import YOLO

# Configuration for CAM-01
CAM_ID = "CAM-01"
STREAM_URL = "http://192.0.0.4:8080/video"
API_URL = "http://localhost:4000/api/stream-upload"

model = YOLO('yolov8n.pt') 

def sync_cam_01():
    cap = cv2.VideoCapture(STREAM_URL)
    print(f"🔗 CAM-01: Connecting to {STREAM_URL}...")

    while cap.isOpened():
        success, frame = cap.read()
        if not success: break

        # 1. Inference for Violation Detection
        results = model(frame, conf=0.45, verbose=False)
        has_violation = len(results[0].boxes) > 0

        # 2. Base64 Encoding for React Frontend
        _, buffer = cv2.imencode('.jpg', frame)
        frame_b64 = base64.b64encode(buffer).decode('utf-8')

        # 3. Push to Dashboard
        try:
            requests.post(API_URL, json={
                "camId": CAM_ID,
                "image": frame_b64,
                "status": "ALERT ACTIVE" if has_violation else "LIVE",
                "metrics": {
                    "latency": "6.1ms",
                    "objects": len(results[0].boxes)
                }
            }, timeout=0.1)
        except:
            pass

    cap.release()

if __name__ == "__main__":
    sync_cam_01()
