import { Request, Response } from 'express';

export interface EdgeMetrics {
    cpu_usage: number;
    ram_usage: number;
    temperature: number;
    uptime: number;
}

export interface EdgeNode {
    id: string;
    mac_address: string;
    name: string;
    status: 'online' | 'offline' | 'updating' | 'restarting';
    model_version: string;
    last_heartbeat: string;
    metrics: EdgeMetrics;
}

// In-memory edge node registry (simulate 3 Jetson nodes)
export const edgeNodes = new Map<string, EdgeNode>([
    ['edge-jetson-01', {
        id: 'edge-jetson-01',
        mac_address: 'A4:3B:FA:12:C8:01',
        name: 'Jetson-Gateway-Alpha',
        status: 'online',
        model_version: '8.1.2',
        last_heartbeat: new Date().toISOString(),
        metrics: { cpu_usage: 45, ram_usage: 62, temperature: 58, uptime: 86400 },
    }],
    ['edge-jetson-02', {
        id: 'edge-jetson-02',
        mac_address: 'A4:3B:FA:12:C8:02',
        name: 'Jetson-Perimeter-Beta',
        status: 'online',
        model_version: '8.1.2',
        last_heartbeat: new Date().toISOString(),
        metrics: { cpu_usage: 72, ram_usage: 78, temperature: 71, uptime: 172800 },
    }],
    ['edge-jetson-03', {
        id: 'edge-jetson-03',
        mac_address: 'A4:3B:FA:12:C8:03',
        name: 'Jetson-Parking-Gamma',
        status: 'offline',
        model_version: '8.0.9',
        last_heartbeat: new Date(Date.now() - 3600000).toISOString(),
        metrics: { cpu_usage: 0, ram_usage: 0, temperature: 32, uptime: 0 },
    }],
]);

/** GET /api/edge — List all registered edge nodes */
export const getEdgeNodes = (_req: Request, res: Response): void => {
    res.json(Array.from(edgeNodes.values()));
};

/** POST /api/edge/:id/command — Send command to edge device */
export const sendEdgeCommand = (req: Request, res: Response): void => {
    const id = req.params.id as string;
    const { action } = req.body as { action: 'restart' | 'update_model' };

    const node = edgeNodes.get(id);
    if (!node) {
        res.status(404).json({ error: 'Edge node not found' });
        return;
    }

    if (action === 'restart') {
        node.status = 'restarting';
        // Simulate restart: go offline briefly, then back online after 8s
        setTimeout(() => {
            node.status = 'online';
            node.metrics = { ...node.metrics, uptime: 0 };
            node.last_heartbeat = new Date().toISOString();
        }, 8000);
    } else if (action === 'update_model') {
        node.status = 'updating';
        // Simulate model update: takes ~12s
        setTimeout(() => {
            node.status = 'online';
            const [major, minor, patch] = node.model_version.split('.').map(Number);
            node.model_version = `${major}.${minor}.${patch + 1}`;
            node.last_heartbeat = new Date().toISOString();
        }, 12000);
    } else {
        res.status(400).json({ error: 'Invalid command. Use restart or update_model' });
        return;
    }

    res.json({ success: true, node_id: id, action, new_status: node.status });
};

/** POST /api/edge/heartbeat — receive heartbeat from python Edge Node */
export const updateHeartbeat = (req: Request, res: Response): void => {
    const { node } = req.body;
    
    if (!node) {
         res.status(400).json({ error: 'Node ID required' });
         return;
    }

    let edgeNode = edgeNodes.get(node);
    
    if (!edgeNode) {
        // Auto-register new nodes
        edgeNode = {
            id: node,
            mac_address: `VTX-AUTO-${Math.floor(Math.random() * 9999)}`,
            name: `${node} (Auto-Registered)`,
            status: 'online',
            model_version: '1.0.0',
            last_heartbeat: new Date().toISOString(),
            metrics: { cpu_usage: 45, ram_usage: 62, temperature: 58, uptime: 10 },
        };
        edgeNodes.set(node, edgeNode);
    } else {
        // Update existing node
        edgeNode.status = 'online';
        edgeNode.last_heartbeat = new Date().toISOString();
        // Simulate minor metric shift to prove it's live
        edgeNode.metrics.cpu_usage = Math.max(10, Math.min(95, edgeNode.metrics.cpu_usage + (Math.random() * 10 - 5)));
        edgeNodes.set(node, edgeNode);
    }
    
    res.json({ success: true, node: edgeNode });
};
