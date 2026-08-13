import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Car, Filter, Clock, Download, Eye
} from 'lucide-react';

interface PlateRecord {
    id: string;
    plateNumber: string;
    vehicleType: string;
    color: string;
    cameraId: string;
    cameraName: string;
    zone: string;
    confidence: number;
    timestamp: string;
    thumbnailUrl: string;
    flagged: boolean;
    reason?: string;
}

const MOCK_PLATES: PlateRecord[] = [
    {
        id: 'alpr_1001',
        plateNumber: 'MH-12-AB-1234',
        vehicleType: 'Sedan (Honda City)',
        color: 'Black',
        cameraId: 'CAM-004',
        cameraName: 'CAM-04 Live AI Feed',
        zone: 'Perimeter Security',
        confidence: 0.96,
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        flagged: true,
        reason: 'UNAUTHORIZED_VEHICLE'
    },
    {
        id: 'alpr_1002',
        plateNumber: 'DL-01-XY-9876',
        vehicleType: 'SUV (Toyota Fortuner)',
        color: 'White',
        cameraId: 'CAM-012',
        cameraName: 'CAM-012 (Municipal Parking)',
        zone: 'Municipal Parking',
        confidence: 0.94,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',
        flagged: false
    },
    {
        id: 'alpr_1003',
        plateNumber: 'KA-05-MN-4321',
        vehicleType: 'Truck (Volvo Hauler)',
        color: 'Red',
        cameraId: 'CAM-045',
        cameraName: 'CAM-045 (Cargo Yard Node 6)',
        zone: 'Industrial Cargo Yard',
        confidence: 0.91,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
        flagged: true,
        reason: 'RESTRICTED_HOURS'
    },
    {
        id: 'alpr_1004',
        plateNumber: 'HR-26-DQ-5555',
        vehicleType: 'Hatchback (Hyundai i20)',
        color: 'Silver',
        cameraId: 'CAM-008',
        cameraName: 'CAM-008 (Airport Terminal)',
        zone: 'Airport Terminal',
        confidence: 0.98,
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800',
        flagged: false
    },
    {
        id: 'alpr_1005',
        plateNumber: 'MH-04-ER-7788',
        vehicleType: 'Delivery Van',
        color: 'Yellow',
        cameraId: 'CAM-022',
        cameraName: 'CAM-022 (Highway Junction)',
        zone: 'Highway Junction',
        confidence: 0.95,
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800',
        flagged: false
    }
];

export default function PlateSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedZone, setSelectedZone] = useState('ALL');
    const [onlyFlagged, setOnlyFlagged] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PlateRecord | null>(MOCK_PLATES[0]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredRecords = MOCK_PLATES.filter(rec => {
        const matchesQuery = rec.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rec.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rec.cameraId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesZone = selectedZone === 'ALL' || rec.zone === selectedZone;
        const matchesFlagged = !onlyFlagged || rec.flagged;
        return matchesQuery && matchesZone && matchesFlagged;
    });

    return (
        <div className="p-4 sm:p-6 bg-[#0B0F19] min-h-screen text-white flex flex-col space-y-6 relative">
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-blue-400/40 flex items-center gap-2 animate-bounce">
                    <span>✨ {toastMessage}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111623] p-5 rounded-2xl border border-slate-800 shadow-xl gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Car className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Automated License Plate Recognition (ALPR)</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        License Plate & Vehicle Intelligence Engine
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Search historical OCR plate logs, vehicle classifications, and flag suspicious vehicles across 108 cameras.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Plate (e.g. MH-12-AB) or Type..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#060D1E] border border-slate-700 text-xs font-mono text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between bg-[#111623] p-4 rounded-xl border border-slate-800 gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Filter className="w-3.5 h-3.5 text-blue-400" /> Sector Zone:
                    </div>
                    <select
                        value={selectedZone}
                        onChange={e => setSelectedZone(e.target.value)}
                        className="bg-[#060D1E] border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                    >
                        <option value="ALL">All Municipal Sectors</option>
                        <option value="Perimeter Security">Perimeter Security</option>
                        <option value="Municipal Parking">Municipal Parking</option>
                        <option value="Airport Terminal">Airport Terminal</option>
                        <option value="Highway Junction">Highway Junction</option>
                        <option value="Industrial Cargo Yard">Industrial Cargo Yard</option>
                    </select>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer ml-2">
                        <input
                            type="checkbox"
                            checked={onlyFlagged}
                            onChange={e => setOnlyFlagged(e.target.checked)}
                            className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                        />
                        <span>Flagged / Unauthorized Only</span>
                    </label>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                    Showing <span className="text-white font-bold">{filteredRecords.length}</span> ALPR Index Matches
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* Left Side (2 cols): Plate Logs Table */}
                <div className="lg:col-span-2 space-y-3">
                    {filteredRecords.map((rec) => (
                        <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedRecord(rec)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${selectedRecord?.id === rec.id
                                    ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                    : 'bg-[#111623] border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Thumbnail */}
                                <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                                    <img src={rec.thumbnailUrl} alt={rec.plateNumber} className="w-full h-full object-cover" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-extrabold font-mono tracking-wide text-white bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded-md">
                                            {rec.plateNumber}
                                        </span>
                                        {rec.flagged && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-400 uppercase">
                                                🚨 {rec.reason}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1 font-medium">{rec.vehicleType} • {rec.color}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                        <span>📷 {rec.cameraName}</span>
                                        <span>•</span>
                                        <span>📍 {rec.zone}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                                <span className="text-xs font-mono text-emerald-400 font-bold">{Math.round(rec.confidence * 100)}% Match</span>
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                    <Clock size={12} /> {new Date(rec.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Side (1 col): Selected Plate Detail Card */}
                {selectedRecord && (
                    <div className="bg-[#111623] p-5 rounded-2xl border border-slate-800 space-y-5 h-fit sticky top-6">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Eye size={14} className="text-blue-400" /> ALPR Inspection Detail
                            </h3>
                            <span className="text-xs font-mono text-slate-500">ID: {selectedRecord.id}</span>
                        </div>

                        {/* Snapshot Frame */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-800 group">
                            <img src={selectedRecord.thumbnailUrl} alt={selectedRecord.plateNumber} className="w-full h-48 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                <div>
                                    <p className="text-lg font-black font-mono text-white tracking-widest bg-black/60 px-3 py-1 rounded-lg backdrop-blur-md border border-white/20 inline-block">
                                        {selectedRecord.plateNumber}
                                    </p>
                                    <p className="text-xs text-slate-300 mt-1 font-medium">{selectedRecord.vehicleType}</p>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-400">Camera Node:</span>
                                <span className="font-mono text-white font-bold">{selectedRecord.cameraName}</span>
                            </div>
                            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-400">Sector Zone:</span>
                                <span className="font-mono text-blue-400 font-bold">{selectedRecord.zone}</span>
                            </div>
                            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-400">OCR Confidence:</span>
                                <span className="font-mono text-emerald-400 font-bold">{Math.round(selectedRecord.confidence * 100)}%</span>
                            </div>
                            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-400">Detected Timestamp:</span>
                                <span className="font-mono text-slate-300">{new Date(selectedRecord.timestamp).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => showToast(`Vehicle ${selectedRecord.plateNumber} added to Watchlist!`)}
                                className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                                🚨 Add Plate to Blacklist / Watchlist
                            </button>
                            <button
                                onClick={() => showToast(`Exported ALPR Evidence Record for ${selectedRecord.plateNumber}`)}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                                <Download size={14} /> Download Evidence Snapshot
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
