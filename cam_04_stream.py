# cam_04_stream.py — WebSocket Frame Streamer for CAM-04
# Sends base64-encoded JPEG frames to the React "Primary Surveillance" window.
#
# Usage:   python cam_04_stream.py
# Prereqs: pip install opencv-python "python-socketio[client]"

import cv2
import base64
import socketio
import time

# Configuration
CAM_ID = "CAM-04"
STREAM_URL = "http://192.168.0.4:8080/video"
BACKEND_WS = "http://localhost:4000"

sio = socketio.Client(reconnection=True, reconnection_delay=2)

@sio.event
def connect():
    print(f"✅ [{CAM_ID}] Connected to VisionAIoT Command Center")

@sio.event
def disconnect():
    print(f"⚠ [{CAM_ID}] Disconnected from Command Center")

def stream_to_dashboard():
    print("=" * 50)
    print(f"  VisionAIoT Frame Streamer — {CAM_ID}")
    print(f"  Camera:  {STREAM_URL}")
    print(f"  Backend: {BACKEND_WS}")
    print("=" * 50)

    # Connect to backend WebSocket
    try:
        sio.connect(BACKEND_WS)
    except Exception as e:
        print(f"❌ Cannot connect to {BACKEND_WS}: {e}")
        return

    # Open camera stream
    cap = cv2.VideoCapture(STREAM_URL)
    if not cap.isOpened():
        print(f"⚠ Cannot open {STREAM_URL}. Falling back to webcam 0...")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("FATAL: No camera available.")
            sio.disconnect()
            return

    print(f"📡 Streaming {CAM_ID} to dashboard at ~30 FPS...")
    frame_count = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print(f"⚠ Stream dropped. Reconnecting in 3s...")
            cap.release()
            time.sleep(3)
            cap = cv2.VideoCapture(STREAM_URL)
            continue

        frame_count += 1

        # Resize for bandwidth efficiency (480p)
        frame_resized = cv2.resize(frame, (640, 480))

        # Encode to JPEG then base64
        _, buffer = cv2.imencode('.jpg', frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 60])
        frame_b64 = base64.b64encode(buffer).decode('utf-8')

        # Emit to backend → relayed to all React clients
        try:
            sio.emit('primary_stream_update', {
                'camId': CAM_ID,
                'frame': frame_b64,
                'fps': 30
            })
        except:
            pass

        # ~30 FPS
        time.sleep(0.033)

    cap.release()
    sio.disconnect()
    print(f"[{CAM_ID}] Stream ended.")

if __name__ == "__main__":
    stream_to_dashboard()
