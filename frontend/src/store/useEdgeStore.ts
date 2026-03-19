import { create } from 'zustand';
import axios from 'axios';

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

interface EdgeState {
    nodes: EdgeNode[];
    setInitialNodes: (nodes: EdgeNode[]) => void;
    updateNodeTelemetry: (id: string, telemetry: { status: string; metrics: EdgeMetrics; timestamp: string }) => void;
    sendDeviceCommand: (id: string, command: 'restart' | 'update_model') => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useEdgeStore = create<EdgeState>((set) => ({
    nodes: [],

    setInitialNodes: (nodes) => set({ nodes }),

    // Fired by Socket.IO every time a node heartbeats
    updateNodeTelemetry: (id, telemetry) =>
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        status: telemetry.status as EdgeNode['status'],
                        metrics: telemetry.metrics,
                        last_heartbeat: telemetry.timestamp,
                    }
                    : node
            ),
        })),

    // Send a remote command to the edge device
    sendDeviceCommand: async (id, command) => {
        try {
            // Optimistic status update
            set((state) => ({
                nodes: state.nodes.map((node) =>
                    node.id === id
                        ? { ...node, status: (command === 'restart' ? 'restarting' : 'updating') as EdgeNode['status'] }
                        : node
                ),
            }));

            await axios.post(`${API_BASE}/api/edge/${id}/command`, { action: command });
        } catch (error) {
            console.error(`Failed to execute ${command} on node ${id}`, error);
            // Revert on failure
            set((state) => ({
                nodes: state.nodes.map((node) =>
                    node.id === id ? { ...node, status: 'online' as EdgeNode['status'] } : node
                ),
            }));
        }
    },
}));
