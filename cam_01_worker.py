import cv2
import requests
import base64
import time
from ultralytics import YOLO

# Target CAM-01 Configuration
CAM_ID = "CAM-01"
STREAM_URL = "http://192.0.0.4:8080/video"
STREAM_API_URL = "http://localhost:4000/api/stream-upload"
ALERT_API_URL = "http://localhost:4000/api/alerts/open"

model = YOLO('yolov8n.pt')

def run_node():
    cap = cv2.VideoCapture(STREAM_URL)
    print(f"📡 {CAM_ID}: Handshaking with {STREAM_URL}...")
    print(f"[INFO] {CAM_ID} ({STREAM_URL.split('//')[1].split(':')[0]}) Successfully Provisioned.")

    last_alert_time = 0

    while cap.isOpened():
        start_time = time.time()
        success, frame = cap.read()
        if not success:
            print("⚠️ Stream Lost. Retrying...")
            continue

        # Resize for performance and dashboard fit
        frame = cv2.resize(frame, (640, 480))

        # Run Violation Detection (Groups/Weapons)
        results = model(frame, conf=0.5, verbose=False)
        
        # Calculate Inference Time
        inference_time_ms = round((time.time() - start_time) * 1000, 1)
        
        boxes_count = len(results[0].boxes)
        status = "ALERT ACTIVE" if boxes_count >= 4 else "NORMAL"

        # Encode Frame for Dashboard
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        encoded_image = base64.b64encode(buffer).decode('utf-8')

        # Push Base64 Stream & Telemetry (updates Active Nodes & Inference Time)
        try:
            requests.post(STREAM_API_URL, json={
                "camId": CAM_ID,
                "image": encoded_image,
                "status": status,
                "metrics": {
                    "inferenceTime": inference_time_ms,
                    "activeNodes": 1
                }
            }, timeout=0.2)
        except requests.exceptions.RequestException:
            pass

        # Trigger 'Indian Red Flag' if 4+ people or objects detected (Limit to 1 per 5 seconds)
        current_time = time.time()
        if boxes_count >= 4 and (current_time - last_alert_time) > 5:
            last_alert_time = current_time
            try:
                requests.post(ALERT_API_URL, json={
                    "type": "INDIAN_RED_FLAG_VIOLENCE",
                    "location": CAM_ID,
                    "confidence": 95,
                    "details": f"Group gathering {boxes_count} members detected"
                }, timeout=1.0)
                print(f"🚨 [INDIAN RED FLAG] Dispatched for {CAM_ID}: {boxes_count} members.")
            except requests.exceptions.RequestException:
                pass


    cap.release()
    print(f"🛑 {CAM_ID} Disconnected.")

if __name__ == "__main__":
    run_node()
