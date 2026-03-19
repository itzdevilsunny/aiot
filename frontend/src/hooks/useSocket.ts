import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useVisionStore } from '../store/useVisionStore';
import { useEdgeStore } from '../store/useEdgeStore';
import { useNotificationStore } from '../store/useNotificationStore';

import { WS_URL } from '../config/api';

const SOCKET_URL = WS_URL;

export const useSocket = () => {
    const { addAlert, setCameras, updateCameraStatus } = useVisionStore();
    // NOTE: addLiveAlert is intentionally NOT called here. DashboardOverview handles it directly
    // to prevent dual-listener duplicate key warnings.
    const updateNodeTelemetry = useEdgeStore((s) => s.updateNodeTelemetry);
    const addLiveNotification = useNotificationStore((s) => s.addLiveNotification);

    useEffect(() => {
        // Prevent localhost connection errors on Vercel demo
        if (window.location.hostname.includes('vercel.app')) return;

        const socket = io(SOCKET_URL, {
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
        });

        socket.on('connect', () => {
            console.log('Connected to VisionAIoT Edge Node Gateway', socket.id);
        });

        // Listen for anomaly events — only push to vision store (not alert store, that's handled upstream)
        socket.on('new_anomaly', (alertData) => {
            addAlert(alertData);
        });

        socket.on('camera_status', (data) => {
            updateCameraStatus(data.cameraId, data.status);
        });

        socket.on('init_cameras', (cameraList) => {
            setCameras(cameraList);
        });

        socket.on('edge_heartbeat', (data) => {
            updateNodeTelemetry(data.id, data);
        });

        socket.on('system_alert', (data) => {
            console.log('System Alert:', data.title);
            addLiveNotification(data);
        });

        socket.on('disconnect', () => {
            console.warn('Disconnected from AIoT Gateway');
        });

        return () => {
            socket.disconnect();
        };
    }, [addAlert, setCameras, updateCameraStatus, updateNodeTelemetry, addLiveNotification]);

    return null;
};
