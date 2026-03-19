import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

interface CameraNode {
  id: string;
  name: string;
  ipAddress: string;
  status: 'UP' | 'DOWN' | 'STANDBY';
  sector: number;
}

interface CameraGridViewProps {
  allCameras: CameraNode[];
  activeAlerts: any[];
}

const CameraGridView: React.FC<CameraGridViewProps> = ({ allCameras, activeAlerts }) => {
  // Track which cameras have a live socket-driven flash
  const [flashingCams, setFlashingCams] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ['websocket', 'polling'], autoConnect: false });
    socketRef.current = socket;
    socket.connect();

    const handler = (anomaly: any) => {
      const camId = anomaly.camera_id || anomaly.location;
      if (!camId) return;
      setFlashingCams(prev => new Set(prev).add(camId));
      setTimeout(() => {
        setFlashingCams(prev => {
          const next = new Set(prev);
          next.delete(camId);
          return next;
        });
      }, 5000);
    };

    socket.on('new_anomaly', handler);
    return () => {
      socket.off('new_anomaly', handler);
      socket.disconnect();
    };
  }, []);

  // Sort: cameras with active alerts or live flashes first
  const sortedCameras = [...allCameras].sort((a, b) => {
    const aHot = activeAlerts.some(alert => alert.camera_id === a.name) || flashingCams.has(a.name);
    const bHot = activeAlerts.some(alert => alert.camera_id === b.name) || flashingCams.has(b.name);
    return (bHot ? 1 : 0) - (aHot ? 1 : 0);
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-[#0B0F19]">
      {sortedCameras.map((cam) => {
        const hasAlert = activeAlerts.some(alert => alert.camera_id === cam.name);
        const isFlashing = flashingCams.has(cam.name);
        const isHot = hasAlert || isFlashing;

        return (
          <div key={cam.name} className={`relative rounded-lg border-2 transition-all overflow-hidden ${
            isHot
            ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : 'border-gray-800'
          }`}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 py-1 px-2 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center text-[10px] z-10 w-full">
              <span className="text-white font-bold tracking-wider">{cam.name}</span>
              <span className={`font-bold flex items-center gap-1 ${cam.status === 'UP' ? 'text-green-400' : 'text-red-500'}`}>
                {cam.status === 'UP' ? '● LIVE' : '● DOWN'}
              </span>
            </div>

            {/* Stream: Grid view shows status only — live feed is in Primary Monitor */}
            <div className="w-full h-28 bg-[#0d1018] flex flex-col items-center justify-center relative">
               {cam.status === 'UP' ? (
                 <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                   <span className="text-[9px] text-green-400/70 font-mono uppercase tracking-widest">Live</span>
                   <span className="text-[8px] text-gray-600 font-mono">{cam.ipAddress}:8080</span>
                 </div>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-800/50 border border-red-800" />
                   <span className="text-[9px] text-red-700/60 font-mono uppercase tracking-widest">Offline</span>
                 </div>
               )}
               {isHot && (
                  <div className="absolute inset-0 border-4 border-red-600 animate-pulse pointer-events-none"></div>
               )}
            </div>

            {/* Inference Overlay */}
            <div className="absolute bottom-1 right-1 text-[8px] bg-black/80 px-1.5 py-0.5 rounded text-gray-300 border border-gray-700">
              YOLOv8m | {isHot ? '12ms' : '8ms'}
            </div>
            {isHot && (
                <div className="absolute bottom-1 left-1 text-[8px] bg-red-600/90 text-white font-bold px-1.5 py-0.5 rounded shadow animate-pulse">
                    🚨 ALERT ACTIVE
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CameraGridView;

