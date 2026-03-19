"""
VisionAIoT — Multi-Node Launcher
Starts all camera workers in parallel background processes.

Run:
    python start_nodes.py
"""

import subprocess
import sys
import time

# ─── Camera Node Registry ─────────────────────────────────────────────────────
nodes = [
    {"id": "CAM-04", "ip": "http://10.30.56.122:8080/video"},  # Primary Monitor
    {"id": "CAM-01", "ip": "http://10.30.56.118:8080/video"},  # North Entrance
]

# ─── Launch ───────────────────────────────────────────────────────────────────
def launch_all():
    print("🚀 VisionAIoT: Initializing Multi-Node Grid...\n")
    procs = []

    for node in nodes:
        print(f"📡 Connecting {node['id']} → {node['ip']}")
        p = subprocess.Popen(
            [sys.executable, "worker.py", "--ip", node["ip"], "--id", node["id"]],
            stdout=None,   # streams output to this terminal
            stderr=None,
        )
        procs.append(p)
        time.sleep(1.5)   # Stagger connections to avoid socket congestion

    print(f"\n✅ {len(nodes)} nodes launched. Press Ctrl+C to stop all.\n")

    try:
        for p in procs:
            p.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all nodes...")
        for p in procs:
            p.terminate()
        print("✅ All nodes stopped.")

if __name__ == "__main__":
    launch_all()
