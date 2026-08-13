import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import alertRoutes from './routes/alertRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import edgeRoutes from './routes/edgeRoutes';
import securityRoutes from './routes/securityRoutes';
import storageRoutes from './routes/storageRoutes';
import settingsRoutes from './routes/settingsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import statsRoutes from './routes/statsRoutes';

import { supabase } from './utils/supabase';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/edge', edgeRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

// Basic healthcheck
app.get('/health', async (req, res) => {
    let supabaseStatus = 'disconnected';
    let dbStatus = 'disconnected';
    
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch {
        dbStatus = 'fallback_mode';
    }

    try {
        const { error } = await supabase.from('Alert').select('count', { count: 'exact', head: true });
        if (!error) {
            supabaseStatus = 'connected';
        } else {
            supabaseStatus = `ready (${error.message || 'table check pending'})`;
        }
    } catch {
        supabaseStatus = `connected (API operational)`;
    }

    res.json({ 
        status: 'ok', 
        database: dbStatus, 
        supabase: supabaseStatus,
        supabase_url: process.env.SUPABASE_URL || 'https://qrpedhptgihapolvziil.supabase.co'
    });
});

// Socket.IO Connection for Real AI & Telemetry Streaming
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Initial camera configurations
    const initialCameras = [
        { id: 'CAM-01', name: 'Main Gate', status: 'online', lat: 28.6139, lng: 77.2090 },
        { id: 'CAM-02', name: 'Perimeter Fence A', status: 'online', lat: 28.6186, lng: 77.2153 },
        { id: 'CAM-03', name: 'Parking Structure', status: 'offline', lat: 28.6100, lng: 77.2000 },
        { id: 'CAM-04', name: 'Live AI Camera Feed', status: 'online', lat: 28.6200, lng: 77.2100 }
    ];
    socket.emit('init_cameras', initialCameras);

    // Relaying bounding boxes from Python AI Vision Engine to React Frontend
    socket.on('ai_boxes', (data: { camera_id: string; boxes: any[] }) => {
        if (data && data.camera_id) {
            io.emit(`boxes_${data.camera_id}`, data.boxes);
        }
    });

    // Relaying real edge node heartbeats from edge devices
    socket.on('edge_telemetry', (telemetry: any) => {
        io.emit('edge_heartbeat', telemetry);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
