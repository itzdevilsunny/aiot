import { Request, Response } from 'express';
import { SettingsModel } from '../models';
import mongoose from 'mongoose';

const DEFAULT_SETTINGS = {
    systemName: 'VisionAIoT Campus Alpha',
    aiConfidenceThreshold: 72,
    activeModel: 'yolov8m-municipal-parking',
    enableEmailAlerts: true,
    enablePushNotifications: false,
    autoAcknowledgeLowSeverity: true,
    
    anomalyThreshold: 0.75,
    storageRetentionDays: 30,
    activeSectors: [1, 2, 3, 4, 5],
    aiModelPrecision: 'FP16',
    notificationEmail: 'admin@visionaiot.dev'
};

// In-Memory Fallback if MongoDB is not active
let fallbackSettings = { ...DEFAULT_SETTINGS };

/** GET /api/settings */
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
    try {
        if (mongoose.connection.readyState === 1) {
            let doc = await SettingsModel.findOne();
            if (!doc) {
                // Seed default
                doc = await SettingsModel.create(DEFAULT_SETTINGS);
            }
            res.json(doc);
            return;
        }
    } catch (e) {
        // Fallback
    }
    
    res.json(fallbackSettings);
};

/** PUT /api/settings/update */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { anomalyThreshold, storageRetentionDays } = req.body;
        
        // Also support old alias names from frontend if provided
        const thresholdVal = anomalyThreshold ?? req.body.threshold ?? fallbackSettings.anomalyThreshold;
        const retentionVal = storageRetentionDays ?? req.body.retention ?? fallbackSettings.storageRetentionDays;

        let newConfig = {
            systemName: req.body.systemName ?? fallbackSettings.systemName,
            aiConfidenceThreshold: req.body.aiConfidenceThreshold ?? fallbackSettings.aiConfidenceThreshold,
            activeModel: req.body.activeModel ?? fallbackSettings.activeModel,
            enableEmailAlerts: req.body.enableEmailAlerts ?? fallbackSettings.enableEmailAlerts,
            enablePushNotifications: req.body.enablePushNotifications ?? fallbackSettings.enablePushNotifications,
            autoAcknowledgeLowSeverity: req.body.autoAcknowledgeLowSeverity ?? fallbackSettings.autoAcknowledgeLowSeverity,
            
            anomalyThreshold: thresholdVal,
            storageRetentionDays: retentionVal,
            activeSectors: fallbackSettings.activeSectors,
            aiModelPrecision: fallbackSettings.aiModelPrecision,
            notificationEmail: fallbackSettings.notificationEmail,
        };

        if (mongoose.connection.readyState === 1) {
            let doc = await SettingsModel.findOne();
            if (doc) {
                Object.assign(doc, newConfig);
                await doc.save();
                res.json(doc);
                return;
            } else {
                doc = await SettingsModel.create(newConfig);
                res.json(doc);
                return;
            }
        }
        
        // Fallback store update
        fallbackSettings = { ...fallbackSettings, ...newConfig };
        res.json(fallbackSettings);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
