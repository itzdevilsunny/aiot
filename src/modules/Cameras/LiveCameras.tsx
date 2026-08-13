import { useState, useEffect, useMemo } from 'react';
import { useCameraStore } from '../../store/useCameraStore';
import IPWebcamPlayer from './IPWebcamPlayer';
import CameraBigScreenModal from './CameraBigScreenModal';
import {
    Grid, LayoutGrid, Maximize, Plus, X, Video,
    Search, Activity, Cpu, ShieldCheck, ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveCameras() {
    const {
        cameras, gridLayout, setGridLayout, fetchCameras,
        addCamera, selectedCameraId, setSelectedCameraId
    } = useCameraStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedZone, setSelectedZone] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'online' | 'offline'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Add Camera Form State
    const [newCam, setNewCam] = useState({ name: '', ip_url: 'http://', zone: 'Perimeter Security' });

    useEffect(() => {
        fetchCameras();
    }, [fetchCameras]);

    // Unique Zones list
    const zones = useMemo(() => {
        const set = new Set(cameras.map(c => c.zone));
        return Array.from(set);
    }, [cameras]);

    // Filtered Cameras
    const filteredCameras = useMemo(() => {
        return cameras.filter(cam => {
            const matchesSearch = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cam.zone.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesZone = selectedZone === 'all' || cam.zone === selectedZone;
            const matchesStatus = selectedStatus === 'all' || cam.status === selectedStatus;
            return matchesSearch && matchesZone && matchesStatus;
        });
    }, [cameras, searchQuery, selectedZone, selectedStatus]);

    // Paginated Cameras
    const totalPages = Math.ceil(filteredCameras.length / pageSize) || 1;
    const paginatedCameras = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredCameras.slice(start, start + pageSize);
    }, [filteredCameras, currentPage]);

    const handleAddCamera = (e: React.FormEvent) => {
        e.preventDefault();
        addCamera(newCam);
        setIsModalOpen(false);
        setNewCam({ name: '', ip_url: 'http://', zone: 'Perimeter Security' });
    };

    const selectedCameraObj = useMemo(() => {
        return cameras.find(c => c.id === selectedCameraId) || null;
    }, [cameras, selectedCameraId]);

    // Dynamic Grid CSS based on selected layout
    const gridClasses = {
        1: 'grid-cols-1 md:grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        4: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
    };

    const onlineCount = cameras.filter(c => c.status === 'online').length;

    return (
        <div className="p-4 sm:p-6 bg-[#0B0F19] min-h-screen text-white flex flex-col space-y-6">

            {/* Big Screen Focus Modal */}
            <CameraBigScreenModal
                camera={selectedCameraObj}
                onClose={() => setSelectedCameraId(null)}
            />

            {/* Top Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#111623] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg">
                        <Video size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Total AI Cameras</p>
                        <p className="text-xl font-bold text-white">{cameras.length}</p>
                    </div>
                </div>

                <div className="bg-[#111623] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Active Online Streams</p>
                        <p className="text-xl font-bold text-emerald-400">{onlineCount} / {cameras.length}</p>
                    </div>
                </div>

                <div className="bg-[#111623] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Primary Inference Model</p>
                        <p className="text-sm font-bold text-purple-300">YOLO11 Nano</p>
                    </div>
                </div>

                <div className="bg-[#111623] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-600/20 text-cyan-400 rounded-lg">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Multimodal AI Engine</p>
                        <p className="text-sm font-bold text-cyan-300">Gemini 2.5 Flash</p>
                    </div>
                </div>
            </div>

            {/* Header Controls, Filters & Layout Switcher */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-[#111623] p-4 rounded-xl border border-slate-800 shadow-md">

                {/* Left: Search & Filter Inputs */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search 108+ cameras..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#060D1E] border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Zone Selector */}
                    <div className="relative">
                        <select
                            value={selectedZone}
                            onChange={e => { setSelectedZone(e.target.value); setCurrentPage(1); }}
                            className="bg-[#060D1E] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="all">All Zones ({zones.length})</option>
                            {zones.map(z => (
                                <option key={z} value={z}>{z}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Pills */}
                    <div className="flex items-center bg-[#060D1E] p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                            onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${selectedStatus === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            All ({cameras.length})
                        </button>
                        <button
                            onClick={() => { setSelectedStatus('online'); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${selectedStatus === 'online' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Online ({onlineCount})
                        </button>
                    </div>
                </div>

                {/* Right: Layout Switcher & Add Button */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center bg-[#060D1E] p-1 rounded-xl border border-slate-800">
                        <button onClick={() => setGridLayout(1)} className={`p-1.5 rounded-lg transition cursor-pointer ${gridLayout === 1 ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`} title="1 Column">
                            <Maximize size={16} />
                        </button>
                        <button onClick={() => setGridLayout(2)} className={`p-1.5 rounded-lg transition cursor-pointer ${gridLayout === 2 ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`} title="2 Columns">
                            <Grid size={16} />
                        </button>
                        <button onClick={() => setGridLayout(3)} className={`p-1.5 rounded-lg transition cursor-pointer ${gridLayout === 3 ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`} title="4 Columns">
                            <LayoutGrid size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
                    >
                        <Plus size={16} /> Register Node
                    </button>
                </div>
            </div>

            {/* Instruction Tip for Big Screen Mode */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs text-blue-300">
                <div className="flex items-center gap-2">
                    <Maximize2 size={16} className="shrink-0 text-blue-400" />
                    <span><strong>Big Screen Mode:</strong> Click any camera card below to open its full-screen live feed with PTZ controls and YOLO11 AI bounding boxes.</span>
                </div>
                <span className="font-semibold text-slate-400">Showing Page {currentPage} of {totalPages}</span>
            </div>

            {/* Camera Cards Grid */}
            {paginatedCameras.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-xl bg-[#060D1E] text-center">
                    <Video size={48} className="text-slate-600 mb-4" />
                    <h2 className="text-xl font-bold text-slate-400">No Cameras Found</h2>
                    <p className="text-slate-500 mt-2 text-xs">Try adjusting your search query or zone filter.</p>
                </div>
            ) : (
                <div className={`grid gap-4 flex-grow ${gridClasses[gridLayout]}`}>
                    {paginatedCameras.map((camera) => (
                        <div
                            key={camera.id}
                            onClick={() => setSelectedCameraId(camera.id)}
                            className="cursor-pointer group transform hover:-translate-y-1 transition-all duration-200"
                        >
                            <IPWebcamPlayer camera={camera} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Control Bar */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-[#111623] p-4 rounded-xl border border-slate-800 text-xs">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <div className="flex items-center gap-1 overflow-x-auto max-w-md px-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${currentPage === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Add Camera Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl text-white"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Register New IP Node</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleAddCamera} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-400 mb-1">Node Identifier</label>
                                    <input
                                        required type="text" placeholder="e.g., CAM-109 (North Gate)"
                                        value={newCam.name} onChange={e => setNewCam({ ...newCam, name: e.target.value })}
                                        className="w-full bg-[#060D1E] border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-400 mb-1">Local IPv4 Address & Port</label>
                                    <input
                                        required type="url" placeholder="http://192.168.1.100:8080"
                                        value={newCam.ip_url} onChange={e => setNewCam({ ...newCam, ip_url: e.target.value })}
                                        className="w-full bg-[#060D1E] border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-400 mb-1">Monitoring Zone</label>
                                    <select
                                        value={newCam.zone} onChange={e => setNewCam({ ...newCam, zone: e.target.value })}
                                        className="w-full bg-[#060D1E] border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none cursor-pointer"
                                    >
                                        {zones.map(z => (
                                            <option key={z} value={z}>{z}</option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition mt-4 cursor-pointer">
                                    Register & Connect Node
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
