# cam_04_violence_worker.py — Multi-Threat Detection Engine
# Tracks group gatherings (4+ members) and weapon signatures using YOLOv8.

import cv2
import requests
import time
from ultralytics import YOLO

# Configuration
CAM_ID = "CAM-04"
STREAM_URL = "http://192.168.0.4:8080/video"
API_ENDPOINT = "http://localhost:4000/api/alerts/open"

# YOLOv8m (medium) is better for detecting smaller objects like knives
# Fallback to yolov8n.pt if performance is an issue
model = YOLO('yolov8n.pt') 

print(f"🚀 Initializing Indian Red Flag: Violence Detection Pipeline on {CAM_ID}")

# Threat definitions
WEAPON_CLASSES = ['knife', 'baseball bat', 'scissors', 'weapon', 'gun', 'sword']
GROUP_THRESHOLD = 4

# Cooldown to prevent spamming the Express backend
cooldown_timer = 0

def analyze_violence_threat():
    global cooldown_timer
    
    cap = cv2.VideoCapture(STREAM_URL)
    if not cap.isOpened():
        print(f"❌ Cannot connect to {STREAM_URL}")
        cap = cv2.VideoCapture(0)
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success: 
            print("Stream lost, reconnecting in 3s...")
            time.sleep(3)
            cap = cv2.VideoCapture(STREAM_URL)
            continue

        # Reduce resolution slightly for faster inference if needed
        frame = cv2.resize(frame, (640, 480))
        
        # Run Detection
        results = model.predict(frame, stream=True, conf=0.45, verbose=False)
        
        person_count = 0
        detected_weapons = []
        max_weapon_conf = 0.0
        
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                label = model.names[cls_id]
                conf = float(box.conf[0])
                
                # Logic 1: Crowd Detection
                if label == 'person':
                    person_count += 1
                
                # Logic 2: Harmful Materials
                if label in WEAPON_CLASSES:
                    detected_weapons.append(label)
                    if conf > max_weapon_conf:
                        max_weapon_conf = conf

        now = time.time()
        
        # TRIGGER DECISION ENGINE
        # If cooldown has passed and threshold is met
        if (now - cooldown_timer) > 2.0:
            if person_count >= GROUP_THRESHOLD or len(detected_weapons) > 0:
                print(f"🚨 INDIAN RED FLAG: {person_count} persons, Weapons: {detected_weapons}")
                trigger_indian_red_flag(person_count, detected_weapons, max_weapon_conf)
                cooldown_timer = now
                
        time.sleep(0.033) # Keep loop ~30FPS

    cap.release()

def trigger_indian_red_flag(count, weapons, conf):
    # Determine the primary threat for the 'type' field
    alert_type = "INDIAN_RED_FLAG_VIOLENCE"
    
    # Priority 1: Armed Groups
    details = ""
    if len(weapons) > 0 and count >= 4:
        details = f"ARMED GROUP: {count} individuals detected with {', '.join(weapons)}"
    elif len(weapons) > 0:
        details = f"WEAPON DETECTED: {', '.join(weapons)}"
    elif count >= 4:
        details = f"CROWD GATHERING: {count} members detected"

    alert_payload = {
        "location": CAM_ID,   # Matched to Express backend schema
        "type": alert_type,
        "confidence": conf * 100 if conf > 0 else 85.0, # Percent scale
        # Passing extra details in timestamp or as a note if your backend supports it
        # For our schema, we'll embed the detail in the event payload
        "details": details 
    }
    
    try:
        res = requests.post(API_ENDPOINT, json=alert_payload, timeout=2)
        if res.status_code in (200, 201):
            print(f"   ✓ Pushed to dashboard: {details}")
    except Exception as e:
        print(f"   ❌ Failed to reach backend: {e}")

if __name__ == "__main__":
    analyze_violence_threat()
