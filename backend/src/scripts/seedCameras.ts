import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load variables from ../../.env (relative to backend/src/scripts)
dotenv.config({ path: path.join(__dirname, '../../../../.env') }); // It actually should be backend/.env but user put everything in process.env... let's just use regular dotenv config from backend
dotenv.config({ path: path.join(__dirname, '../../../.env') }); // backend/.env

// Wait, the correct models import is from '../models/index'
import { CameraNodeModel } from '../models';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/visionaiot';

const seedFiftyCameras = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`📡 Connected to MongoDB at ${MONGO_URI}`);
    
    const cameraNodes = [];
    for (let i = 1; i <= 50; i++) {
        const id = `CAM-${i.toString().padStart(2, '0')}`;
        // Usually, 192.168.1.8 is CAM-04 or just the user's camera. We'll set CAM-04 specifically to their real IP, else mock IPs.
        const mockIp = id === 'CAM-04' ? '192.168.1.8' : `192.168.1.${100 + i}`;
        const latBase = 28.6139;
        const lngBase = 77.2090;

        cameraNodes.push({
            name: id,
            ipAddress: mockIp,
            status: 'UP',
            sector: Math.ceil(i / 10), // Groups of 10 for navigation
            lat: latBase + (Math.random() - 0.5) * 0.1, // Randomized around Delhi
            lng: lngBase + (Math.random() - 0.5) * 0.1,
            lastHeartbeat: new Date()
        });
    }

    await CameraNodeModel.deleteMany({}); // Clear old data
    await CameraNodeModel.insertMany(cameraNodes);
    console.log("✅ 50 Camera Nodes Provisioned in Database");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedFiftyCameras();
