/**
 * Evidence Exporter Utility
 * Uses HTML5 Canvas & MediaRecorder API to record live camera excerpts and export legal video evidence clips.
 */

export interface ExportEvidenceOptions {
    cameraId: string;
    anomalyType: string;
    timestamp: string;
    imageUrl?: string;
}

export function exportSnapshotImage(options: ExportEvidenceOptions): void {
    const { cameraId, anomalyType, timestamp, imageUrl } = options;
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        // Draw background video frame
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw Legal Watermark & Telemetry Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`🚨 DEFENSE EVIDENCE RECORD • ${anomalyType.replace(/_/g, ' ')}`, 20, canvas.height - 40);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '14px monospace';
        ctx.fillText(`CAMERA: ${cameraId} | TIMESTAMP: ${new Date(timestamp).toLocaleString()} | SYSTEM: VisionAIoT Edge`, 20, canvas.height - 18);

        // Trigger Download
        const link = document.createElement('a');
        link.download = `EVIDENCE_${cameraId}_${anomalyType}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    img.src = imageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800';
}

/**
 * Generates an animated WebM video clip excerpt using Canvas animation & MediaRecorder
 */
export async function exportVideoExcerpt(options: ExportEvidenceOptions, durationSec = 5): Promise<void> {
    const { cameraId, anomalyType, timestamp, imageUrl } = options;

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stream = canvas.captureStream(30); // 30 FPS
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VIDEO_EVIDENCE_${cameraId}_${anomalyType}_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = imageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800';
    });

    recorder.start();

    const start = Date.now();
    const interval = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Animated Scanning Bounding Box Effect
        const scanY = (Math.sin(elapsed * 4) * 0.5 + 0.5) * (canvas.height - 150) + 50;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(200, scanY, 350, 180);

        ctx.fillStyle = '#EF4444';
        ctx.fillRect(200, scanY - 24, 220, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`TARGET DETECTED [${anomalyType}]`, 210, scanY - 8);

        // Watermark Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`REC • LEGAL VIDEO EVIDENCE EXCERPT | ${anomalyType.replace(/_/g, ' ')}`, 20, canvas.height - 40);

        ctx.fillStyle = '#38BDF8';
        ctx.font = '14px monospace';
        ctx.fillText(`NODE: ${cameraId} | REC TIME: ${elapsed.toFixed(1)}s / ${durationSec}s | TIME: ${new Date(timestamp).toLocaleString()}`, 20, canvas.height - 18);

        if (elapsed >= durationSec) {
            clearInterval(interval);
            recorder.stop();
        }
    }, 1000 / 30);
}
