import { Request, Response } from 'express';
import { CameraNodeModel } from '../models';
import mongoose from 'mongoose';

export interface CameraNode {
    id: string; // Used for frontend mapping
    name: string;
    ipAddress: string;
    status: 'UP' | 'DOWN' | 'STANDBY';
    sector: number;
    lat: number;
    lng: number;
    lastHeartbeat: string;
}

// ─── Fallback In-Memory Store for 50 Cameras ───
export const cameraStore = new Map<string, CameraNode>();

// Pre-fill the 50 nodes directly into memory so the UI works without Docker MongoDB
for (let i = 1; i <= 50; i++) {
    const id = `CAM-${i.toString().padStart(2, '0')}`;
    const mockIp = id === 'CAM-04' ? '192.168.0.4' 
                 : id === 'CAM-08' ? '10.226.68.44' 
                 : `192.168.1.${100 + i}`;
    const camName = id === 'CAM-08' ? 'Sector 2 - West Gate' : id;
    
    // Randomize around center of Delhi
    const latBase = 28.6139;
    const lngBase = 77.2090;

    cameraStore.set(id, {
        id,
        name: camName,
        ipAddress: mockIp,
        status: 'UP',
        sector: Math.ceil(i / 10),
        lat: latBase + (Math.random() - 0.5) * 0.1,
        lng: lngBase + (Math.random() - 0.5) * 0.1,
        lastHeartbeat: new Date().toISOString()
    });
}

/** GET /api/cameras */
export const getCameras = async (_req: Request, res: Response): Promise<void> => {
    try {
        if (mongoose.connection.readyState === 1) {
            const cameras = await CameraNodeModel.find().sort({ name: 1 });
            res.json(cameras.map(c => ({ ...c.toObject(), id: c.name })));
            return;
        }
    } catch (e) {
        // Fallback below
    }
    
    // Fallback to in-memory store
    res.json(Array.from(cameraStore.values()));
};

/** POST /api/cameras/scan */
export const scanNetworkCameras = async (req: Request, res: Response): Promise<void> => {
    // Simulate aggressive port 8080 sweep across local subnet 192.168.1.X
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulating finding 3 new cameras running edge_node.py
    const newCount = 3;
    const startIndex = cameraStore.size + 1;
    const discovered = [];

    for (let i = startIndex; i < startIndex + newCount; i++) {
        const id = `CAM-${i.toString().padStart(2, '0')}`;
        const mockIp = `192.168.1.${100 + i}`;
        
        const latBase = 28.6139;
        const lngBase = 77.2090;

        const newNode: CameraNode = {
            id,
            name: id,
            ipAddress: mockIp,
            status: 'UP',
            sector: Math.ceil(i / 10),
            lat: latBase + (Math.random() - 0.5) * 0.1,
            lng: lngBase + (Math.random() - 0.5) * 0.1,
            lastHeartbeat: new Date().toISOString()
        };

        cameraStore.set(id, newNode);
        discovered.push(newNode);

        if (mongoose.connection.readyState === 1) {
            try {
                // Upsert to ignore duplicates
                await CameraNodeModel.findOneAndUpdate({ name: id }, {
                    name: id,
                    ipAddress: mockIp,
                    status: 'UP',
                    sector: newNode.sector,
                    lat: newNode.lat,
                    lng: newNode.lng
                }, { upsert: true });
            } catch (e) {
                // Handle duplicate key edge cases if any
            }
        }
    }

    res.json({ message: `Successfully discovered ${newCount} new edge nodes.`, discovered });
};
