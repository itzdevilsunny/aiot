import cv2
import requests
import base64
from ultralytics import YOLO

# Config for CAM-04
CAMERA_URL = "http://192.0.0.4:8080/video"
DASHBOARD_API = "http://localhost:4000/api/update-stream"

# Load the model tuned for violations
model = YOLO('yolov8n.pt') 

def start_violation_monitor():
    cap = cv2.VideoCapture(CAMERA_URL)
    print("📡 Connecting to CAM-04 @ 192.0.0.4...")

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("⚠️ Stream Lost. Retrying...")
            continue

        # 1. Real-time Detection
        results = model(frame, conf=0.5, verbose=False)
        
        # 2. Process Detections for Logic (Unauthorized Access, etc.)
        detections = []
        for r in results[0].boxes:
            conf = float(r.conf[0])
            label = model.names[int(r.cls[0])]
            detections.append({"label": label, "conf": conf})

        # 3. Encode Frame for Dashboard
        _, buffer = cv2.imencode('.jpg', frame)
        encoded_image = base64.b64encode(buffer).decode('utf-8')

        # 4. Push to VisionAIoT Overview
        try:
            requests.post(DASHBOARD_API, json={
                "camId": "CAM-04",
                "image": encoded_image,
                "objects": len(detections),
                "status": "ALERT ACTIVE" if len(detections) > 0 else "NORMAL"
            }, timeout=0.1)
        except:
            pass

    cap.release()

if __name__ == "__main__":
    start_violation_monitor()
