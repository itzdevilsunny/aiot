#!/bin/bash

# Configuration
BASE_IP="192.168.1"
START_ID=1
END_ID=50

echo "🚀 VisionAIoT: Launching 50 Edge Nodes..."

mkdir -p logs

for i in $(seq $START_ID $END_ID)
do
   # Formatting ID as CAM-01, CAM-02, etc.
   CAM_NAME=$(printf "CAM-%02d" $i)
   NODE_IP="$BASE_IP.$((100 + i))"
   
   echo "Connecting $CAM_NAME at $NODE_IP..."
   
   # Launch each node in the background (Screen or Nohup)
   # Redirecting logs to individual files for debugging
   nohup python edge_node.py --ip $NODE_IP --cam_id $CAM_NAME > logs/$CAM_NAME.log 2>&1 &
done

echo "✅ All 50 Nodes are now detecting and reporting to the Dashboard."
