import requests

alert_payload = {
    "type": "INDIAN_RED_FLAG_VIOLENCE",
    "location": "CAM-04",
    "severity": "Critical",
    "details": "ARMED GROUP: 5 individuals detected with knife, baseball bat",
    "confidence": 98.5
}
try:
    res = requests.post("http://localhost:4000/api/alerts/open", json=alert_payload)
    print("Simulated Violence Alert Result:", res.status_code, res.text)
except Exception as e:
    print("Error:", e)
