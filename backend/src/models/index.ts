import mongoose from 'mongoose';

// Ensure the connection is established somewhere in your main backend startup (e.g. index.ts)
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/visionaiot')
  .then(() => console.log('✅ Connected to MongoDB (Persistence Layer)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// For the "Active Edge Nodes" 0/3 metric
const nodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ['UP', 'DOWN', 'MAINTENANCE'], default: 'UP' },
  modelConfig: { type: String, default: 'YOLOv8m-parking' },
  lastHeartbeat: { type: Date, default: Date.now }
});

export const NodeModel = mongoose.model('Node', nodeSchema);

// For the "Priority Alerts" sidebar
const anomalySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "UNAUTHORIZED VEHICLE"
  location: { type: String, required: true }, // e.g., "CAM-01"
  confidence: { type: Number, required: true }, // e.g., 0.87
  timestamp: { type: Date, default: Date.now },
  imageUrl: String, // Path to the frame capture for admin review
  resolved: { type: Boolean, default: false }
});

export const AnomalyModel = mongoose.model('Anomaly', anomalySchema);

// For the "Security Dashboard"
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Operator', 'Viewer'], required: true },
  created_at: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' }
});

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor_email: { type: String, required: true },
  ip_address: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const edgeTokenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  token_prefix: { type: String, required: true },
  scopes: { type: [String], default: ['inference:push'] },
  created_at: { type: Date, default: Date.now },
  last_used: { type: Date, default: null },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' }
});

export const UserModel = mongoose.model('User', userSchema);
export const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
export const TokenModel = mongoose.model('EdgeToken', edgeTokenSchema);

// ─── Camera Grid / Nodes ────────────────────────────────────
const cameraNodeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ['UP', 'DOWN', 'STANDBY'], default: 'UP' },
  sector: { type: Number, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  lastHeartbeat: { type: Date, default: null }
});

export const CameraNodeModel = mongoose.model('CameraNode', cameraNodeSchema);

// ─── Global Configuration / Settings ───────────────────────
const settingsSchema = new mongoose.Schema({
  systemName: { type: String, default: 'VisionAIoT Campus Alpha' },
  aiConfidenceThreshold: { type: Number, default: 72 },
  activeModel: { type: String, default: 'yolov8m-municipal-parking' },
  enableEmailAlerts: { type: Boolean, default: true },
  enablePushNotifications: { type: Boolean, default: false },
  autoAcknowledgeLowSeverity: { type: Boolean, default: true },
  
  anomalyThreshold: { type: Number, default: 0.75 }, 
  storageRetentionDays: { type: Number, default: 30 },
  activeSectors: { type: [Number], default: [1, 2, 3, 4, 5] },
  aiModelPrecision: { type: String, enum: ['FP16', 'INT8'], default: 'FP16' },
  notificationEmail: { type: String, default: 'admin@visionaiot.dev' }
});

export const SettingsModel = mongoose.model('Settings', settingsSchema);

