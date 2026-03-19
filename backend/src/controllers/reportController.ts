import { Request, Response } from 'express';
import { alertStore } from './alertController';
import PDFDocument from 'pdfkit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Since there's no actual MongoDB/Prisma hooked up to the mocked anomalies yet in index.ts, we use the in-memory store
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export const generateDailyReport = async (req: Request, res: Response) => {
    try {
        // 1. Fetch Real Data from last 24h (from our mocked in-memory store)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const logs = Array.from(alertStore.values()).filter((l) => new Date(l.timestamp) >= yesterday);

        // 2. Format data for the AI
        const logSummary = logs.map(l => `${l.type} at ${l.camera_id} (Conf: ${l.confidence * 100}%)`).join(", ");
        
        let executiveBrief = "AI Summarization unavailable (Missing GEMINI_API_KEY). Based on the raw data, there are " + logs.length + " logged anomalies in the last 24h.";

        // 3. Get AI Executive Summary if API key is present
        if (process.env.GEMINI_API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Summarize these security logs into a professional 3-sentence executive brief for a site manager: ${logSummary || 'No anomalies detected today.'}`;
                const aiResult = await model.generateContent(prompt);
                executiveBrief = aiResult.response.text();
            } catch (aiError) {
                console.warn("Gemini API call failed:", aiError);
                executiveBrief += " [AI Generation Failed]";
            }
        }

        // 4. Generate PDF Stream
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Daily_Report.pdf');

        doc.fontSize(20).text('Command Center: Security Report', { align: 'center' });
        doc.moveDown().fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown().fillColor('blue').text('Executive Summary (AI Generated):');
        doc.fillColor('black').text(executiveBrief);
        
        doc.moveDown().text('--- Detailed Logs ---');
        logs.forEach(log => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            doc.text(`[${timeStr}] ${log.type} - ${log.camera_id} (${(log.confidence * 100).toFixed(0)}%)`);
        });
        
        doc.pipe(res);
        doc.end();

    } catch (err) {
        console.error("Failed to generate report:", err);
        res.status(500).json({ error: "Failed to generate report" });
    }
};

export const generateIncidentReport = async (req: Request, res: Response) => {
    try {
        const alertId = req.params.alertId as string;
        const incident = alertStore.get(alertId) || req.body.incident;

        if (!incident) {
            return res.status(404).json({ error: "Incident not found" });
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Incident_${incident.id}.pdf`);

        // Report Header
        doc.rect(0, 0, 612, 120).fill('#5f0f0f');
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('INDIAN RED FLAG VIOLATION', 50, 40);
        doc.fontSize(12).font('Helvetica').text('Urban Pulse AI: HackOps Crew Municipal Report', 50, 70);

        doc.moveDown(5);
        doc.fillColor('black').fontSize(16).font('Helvetica-Bold').text('INCIDENT DETAILS');
        doc.moveTo(50, 160).lineTo(560, 160).stroke();

        doc.moveDown(1).fontSize(12).font('Helvetica');
        doc.text(`Incident ID: ${incident.id}`);
        doc.text(`Camera Node: ${incident.camera_id} (Sector 9)`);
        doc.text(`Timestamp: ${new Date(incident.timestamp || Date.now()).toLocaleString()}`);
        doc.text(`Violation Type: ${incident.type.replace(/_/g, ' ')}`);
        doc.text(`Confidence Score: ${(incident.confidence * 100).toFixed(1)}%`);
        doc.text(`Threat Level: ${incident.severity.toUpperCase()}`);

        // Additional Context Matrix
        doc.moveDown(2).fontSize(16).font('Helvetica-Bold').text('TELEMETRY & METADATA');
        doc.moveTo(50, 310).lineTo(560, 310).stroke();
        
        doc.moveDown(1).fontSize(12).font('Helvetica');
        const details = req.body.details || incident.operator_notes || incident.details || "Multi-class violation identified.";
        doc.text(`System Analysis: ${details}`);
        doc.text(`Action Taken: SMS/WhatsApp Warning dispatched to Response Team.`);
        doc.text(`Status: Escalated to Municipal Authorities.`);

        doc.moveDown(4).fontSize(10).font('Helvetica-Oblique').fillColor('gray').text('This document was automatically generated by the VisionAIoT Edge Computing Pipeline.', { align: 'center' });

        doc.pipe(res);
        doc.end();

    } catch (err) {
        console.error("Failed to generate incident PDF:", err);
        res.status(500).json({ error: "PDF Generation Failed" });
    }
};
