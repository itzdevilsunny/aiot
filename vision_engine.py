import os
import cv2
import json
import base64
import asyncio
import requests
import socketio
import uvicorn
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

load_dotenv()

# Environment Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")
CAMERA_SRC = os.getenv("CAMERA_SRC", "0") # "0" for webcam, or IP URL http://192.168.0.4:8080/video
CAMERA_ID = os.getenv("CAMERA_ID", "CAM-04")

# Initialize FastAPI & Socket.io for Real-Time UI updates
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])
app.mount("/socket.io", socketio.ASGIApp(sio))

# Socket.IO client connection to Node.js backend
sio_client = socketio.AsyncClient()

print("Loading YOLO11 AI Model (yolo11n.pt)...")
model = YOLO('yolo11n.pt')

last_gemini_analysis_time = 0
ANALYSIS_COOLDOWN_SEC = 10 # Avoid rate limits on Gemini API

def encode_frame_base64(frame):
    """Encodes a cv2 image frame to Base64 JPEG format."""
    _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    return base64.b64encode(buffer).decode('utf-8')

async def analyze_frame_with_gemini(frame, detected_labels):
    """Sends keyframe to Google Gemini Vision API for multimodal anomaly analysis."""
    global last_gemini_analysis_time
    current_time = asyncio.get_event_loop().time()
    
    if current_time - last_gemini_analysis_time < ANALYSIS_COOLDOWN_SEC:
        return None
    
    if not GEMINI_API_KEY:
        print("[Gemini AI] GEMINI_API_KEY not configured. Skipping LLM anomaly verification.")
        return None

    last_gemini_analysis_time = current_time
    base64_image = encode_frame_base64(frame)

    prompt = (
        f"You are a Vision AI Security Monitor. The image features objects: {', '.join(detected_labels)}. "
        "Analyze this image for anomalies such as unauthorized access, parking violations, capacity overflow, "
        "safety gear absence, or suspicious behavior. "
        "Respond ONLY with raw valid JSON in this structure (no markdown fences): "
        '{"is_anomaly": true, "type": "UNAUTHORIZED_ACCESS", "severity": "Critical", "confidence": 0.92, "description": "Brief summary"}'
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/jpeg", "data": base64_image}}
            ]
        }]
    }

    try:
        response = await asyncio.to_thread(requests.post, url, json=payload, timeout=10)
        if response.status_code == 200:
            res_data = response.json()
            text_resp = res_data['candidates'][0]['content']['parts'][0]['text']
            # Clean possible markdown formatting
            clean_json = text_resp.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(clean_json)
            if parsed.get('is_anomaly'):
                parsed['image_url'] = f"data:image/jpeg;base64,{base64_image}"
                return parsed
        else:
            print(f"[Gemini API Error] Status {response.status_code}: {response.text[:200]}")
    except Exception as e:
        print(f"[Gemini Vision Exception] {e}")
    
    return None

async def process_video_stream():
    """Background task to capture video feed, run YOLOv8 detection, and publish real AI telemetry."""
    # Handle webcam index or camera URL
    src = int(CAMERA_SRC) if CAMERA_SRC.isdigit() else CAMERA_SRC
    cap = cv2.VideoCapture(src)

    if not cap.isOpened():
        print(f"[Error] Cannot open video source: {CAMERA_SRC}. Falling back to default webcam (0)...")
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("[Error] No camera device available. Creating synthetic camera canvas for testing...")

    print(f"[AI Pipeline Active] Processing video stream for {CAMERA_ID}...")

    # Connect client to Node backend if available
    try:
        await sio_client.connect(BACKEND_URL)
        print(f"[SocketIO] Connected to Node.js Backend at {BACKEND_URL}")
    except Exception as e:
        print(f"[SocketIO Warning] Backend connection deferred: {e}")

    while True:
        if cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                await asyncio.sleep(0.05)
                continue
        else:
            # Synthetic canvas for headless/no-camera environments
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(frame, "VisionAIoT Feed Active", (140, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            await asyncio.sleep(0.1)

        frame_height, frame_width = frame.shape[:2]

        # Stage 1: Run YOLOv11 Inference
        results = model.predict(frame, conf=0.40, verbose=False)
        boxes_payload = []
        detected_labels = []

        person_count = 0
        has_weapon = False
        has_sharp = False
        has_fire = False

        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = model.names[cls].lower()
                detected_labels.append(label)

                if label == 'person':
                    person_count += 1
                if label in ['knife', 'scissors']:
                    has_sharp = True
                if label in ['gun', 'firearm', 'rifle']:
                    has_weapon = True
                if label in ['fire', 'smoke']:
                    has_fire = True

                x_pct = (x1 / frame_width) * 100
                y_pct = (y1 / frame_height) * 100
                w_pct = ((x2 - x1) / frame_width) * 100
                h_pct = ((y2 - y1) / frame_height) * 100

                color = '#EF4444' if label in ['person', 'knife', 'scissors', 'gun', 'fire'] else '#3B82F6'

                boxes_payload.append({
                    'id': f"box_{cls}_{int(x_pct)}_{int(y_pct)}",
                    'label': label.upper(),
                    'confidence': round(conf, 2),
                    'color': color,
                    'x': round(x_pct, 1),
                    'y': round(y_pct, 1),
                    'width': round(w_pct, 1),
                    'height': round(h_pct, 1)
                })

        # Broadcast live bounding boxes over WebSockets
        if sio_client.connected:
            await sio_client.emit('ai_boxes', {'camera_id': CAMERA_ID, 'boxes': boxes_payload})
        await sio.emit(f'boxes_{CAMERA_ID}', boxes_payload)

        # Direct Heuristic Rules for Instant Anomaly Triggers
        direct_alert_type = None
        if person_count >= 5:
            direct_alert_type = 'CROWD_GATHERING'
            notes = f"Crowd Gathering Alert: {person_count} people detected in camera sector."
        elif has_weapon:
            direct_alert_type = 'WEAPON_GUN'
            notes = "WEAPON ALERT: Firearm / weapon detected by vision engine."
        elif has_sharp:
            direct_alert_type = 'SHARP_OBJECT'
            notes = "HAZARD ALERT: Sharp object / knife detected."
        elif has_fire:
            direct_alert_type = 'FIRE_HAZARD'
            notes = "FIRE HAZARD ALERT: Thermal fire/smoke emissions detected."

        if direct_alert_type:
            base64_img = encode_frame_base64(frame)
            alert_payload = {
                "camera_id": CAMERA_ID,
                "type": direct_alert_type,
                "severity": "Critical",
                "confidence": 0.96,
                "image_url": f"data:image/jpeg;base64,{base64_img}",
                "operator_notes": notes
            }
            print(f"[LIVE AI ALERT DISPATCHED] {direct_alert_type} ({CAMERA_ID})")
            try:
                await asyncio.to_thread(requests.post, f"{BACKEND_URL}/api/alerts/webhook", json=alert_payload, timeout=5)
            except Exception as post_err:
                print(f"[Webhook Error] Failed to dispatch alert: {post_err}")

        # Stage 2: Trigger Gemini Multimodal Anomaly Check when key targets are present
        elif detected_labels and any(k in detected_labels for k in ['person', 'car', 'truck', 'motorcycle']):
            anomaly_data = await analyze_frame_with_gemini(frame, list(set(detected_labels)))
            if anomaly_data:
                alert_payload = {
                    "camera_id": CAMERA_ID,
                    "type": anomaly_data.get("type", "UNAUTHORIZED_VEHICLE"),
                    "severity": anomaly_data.get("severity", "Critical"),
                    "confidence": anomaly_data.get("confidence", 0.9),
                    "image_url": anomaly_data.get("image_url", "")
                }
                print(f"[GEMINI VISION ANOMALY] {alert_payload['type']} - {alert_payload['severity']}")
                try:
                    await asyncio.to_thread(requests.post, f"{BACKEND_URL}/api/alerts/webhook", json=alert_payload, timeout=5)
                except Exception as post_err:
                    print(f"[Webhook Error] Failed to post alert: {post_err}")

        await asyncio.sleep(0.05) # ~20 FPS loop

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(process_video_stream())

if __name__ == "__main__":
    uvicorn.run("vision_engine:app", host="0.0.0.0", port=3000, reload=True)
