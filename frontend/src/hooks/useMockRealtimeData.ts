import { useState, useEffect } from 'react';

export interface Alert {
    id: string;
    type: string;
    camera: string;
    time: string;
    severity: 'critical' | 'warning' | 'info';
    confidence: string;
}

export interface DetectionBox {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
    color: string;
}

export interface MockDataState {
    inferenceMs: number;
    anomalies: number;
    trendData: any[];
    detections: DetectionBox[];
    alerts: Alert[];
}

const INITIAL_ALERTS: Alert[] = [
    { id: 'ALT-892', type: 'Intrusion Detected', camera: 'CAM-04 (Sector 7G)', time: '2 mins ago', severity: 'critical', confidence: '98%' },
    { id: 'ALT-891', type: 'Thermal Anomaly', camera: 'CAM-12 (Server Room)', time: '15 mins ago', severity: 'warning', confidence: '85%' },
];

const INITIAL_TREND = [
    { time: '10:00', value: 12 }, { time: '10:05', value: 15 },
    { time: '10:10', value: 18 }, { time: '10:15', value: 14 },
    { time: '10:20', value: 22 }, { time: '10:25', value: 30 },
    { time: '10:30', value: 28 }, { time: '10:35', value: 25 },
];

export function useMockRealtimeData() {
    const [data, setData] = useState<MockDataState>({
        inferenceMs: 12.4,
        anomalies: 1207,
        trendData: INITIAL_TREND,
        detections: [
            { id: 'det-1', x: 20, y: 30, width: 15, height: 40, label: 'Worker', confidence: 98, color: 'text-emerald-400 border-emerald-400' },
            { id: 'det-2', x: 60, y: 50, width: 10, height: 20, label: 'Missing Safety Gear', confidence: 91, color: 'text-red-400 border-red-400' },
        ],
        alerts: INITIAL_ALERTS,
    });

    useEffect(() => {
        const kpiInterval = setInterval(() => {
            setData(prev => {
                // Flux KPIs
                const newInference = +(12.4 + (Math.random() * 0.4 - 0.2)).toFixed(1);

                // Jitter boxes
                const newDetections = prev.detections.map(det => ({
                    ...det,
                    x: det.x + (Math.random() * 1 - 0.5),
                    y: det.y + (Math.random() * 1 - 0.5),
                    confidence: Math.max(80, Math.min(99, Math.round(det.confidence + (Math.random() * 2 - 1))))
                }));

                return {
                    ...prev,
                    inferenceMs: newInference,
                    detections: newDetections,
                };
            });
        }, 2000);

        const alertInterval = setInterval(() => {
            setData(prev => {
                const newAnomalies = prev.anomalies + 1;
                const newAlert: Alert = {
                    id: `ALT-${Math.floor(Math.random() * 1000)}`,
                    type: ['Intrusion Detected', 'Thermal Anomaly', 'Unattended Object'][Math.floor(Math.random() * 3)],
                    camera: `CAM-${Math.floor(Math.random() * 20).toString().padStart(2, '0')}`,
                    time: 'Just now',
                    severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)] as 'critical' | 'warning' | 'info',
                    confidence: `${Math.floor(Math.random() * 20 + 80)}%`
                };

                const newTrend = [...prev.trendData.slice(1), {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    value: Math.floor(Math.random() * 20 + 10)
                }];

                return {
                    ...prev,
                    anomalies: newAnomalies,
                    alerts: [newAlert, ...prev.alerts].slice(0, 5),
                    trendData: newTrend
                };
            });
        }, 12000);

        return () => {
            clearInterval(kpiInterval);
            clearInterval(alertInterval);
        };
    }, []);

    return data;
}
