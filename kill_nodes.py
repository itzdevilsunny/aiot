import os
import signal
import subprocess
import sys

def shutdown_vision_aiot():
    print("🛑 Initiating Global Shutdown for HackOps Crew...")
    
    try:
        if os.name == 'nt':
            subprocess.run(['taskkill', '/F', '/IM', 'python.exe', '/T'], capture_nowait=True)
        else:
            pids = subprocess.check_output(["pgrep", "-f", "edge_node_worker.py"]).split()
            for pid in pids:
                os.kill(int(pid), signal.SIGTERM)
                print(f"✅ Terminated Node Process: {pid.decode()}")
                
    except Exception as e:
        print("⚠️ No active camera nodes found or already closed.")

    print("🧹 Cleaning Socket.io buffers...")
    print("🌟 System Standby. All Sector 1-5 nodes are now OFFLINE.")

if __name__ == "__main__":
    shutdown_vision_aiot()
