import { useNavigate } from 'react-router-dom';

export const ViolenceModal = ({ alert, onClose }: { alert: any; onClose: () => void }) => {
  if (!alert) return null;
  const navigate = useNavigate();

  const handlePoliceDispatch = () => {
    onClose();
    // Navigate to Zone Map and pass the camera ID as a dispatch signal
    navigate(`/dashboard/map?dispatch=${encodeURIComponent(alert.camera_id)}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-red-950/90 flex items-center justify-center backdrop-blur-md">
      <div className="bg-[#0d0e12] border-2 border-red-600 p-8 rounded-2xl max-w-2xl w-full text-center shadow-[0_0_80px_rgba(220,38,38,0.7)]">
        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse relative">
            <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-75"></div>
            <span className="text-5xl text-white relative z-10">⚠️</span>
        </div>
        
        <h2 className="text-4xl font-black text-red-500 mb-2 uppercase tracking-widest animate-pulse">
            Indian Red Flag
        </h2>
        
        <p className="text-2xl text-white font-bold mb-4">
            {alert.camera_id} - Sector 9
        </p>
        
        <div className="bg-red-900/40 p-5 rounded-lg mb-6 border border-red-500/30">
          <p className="text-red-100 font-mono text-lg">{alert.details || "CRITICAL VIOLENCE OR CROWD DETECTED"}</p>
          <div className="flex justify-between text-xs text-red-300 mt-4 border-t border-red-500/20 pt-3">
             <span>THREAT SCORE: HIGH (+100)</span>
             <span>CONFIDENCE: {(alert.confidence * 100).toFixed(1)}%</span>
             <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-white transition tracking-wider text-xs"
          >
            ACKNOWLEDGE
          </button>
          
          <button 
            onClick={() => {
                window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/reports/incident/${alert.id || 'current'}`, '_blank');
            }}
            className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold text-white shadow-[0_0_15px_rgba(217,119,6,0.5)] transition tracking-wider text-xs"
          >
            EXPORT PDF
          </button>

          <button 
            onClick={handlePoliceDispatch}
            className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-lg font-black text-white shadow-[0_0_15px_rgba(220,38,38,0.8)] transition tracking-wider text-xs flex items-center justify-center gap-2"
          >
            🚔 DISPATCH POLICE
          </button>
        </div>
        
        <p className="mt-6 text-xs text-red-500 font-mono uppercase tracking-widest">
            Automated SMS Notification Sent to HackOps Crew
        </p>
      </div>
    </div>
  );
};
