import React, { useState } from 'react';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; ip: string; model: string }) => void;
}

const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', ip: '', model: 'YOLOv8m-parking' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1c23] border border-gray-700 p-8 rounded-xl w-[400px] shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Provision New Edge Node</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase">Node Name</label>
            <input 
              type="text" 
              className="w-full bg-[#0d0e12] border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
              placeholder="e.g. North Parking Entrance"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase">Stream URL (RTSP/IP)</label>
            <input 
              type="text" 
              className="w-full bg-[#0d0e12] border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
              placeholder="192.168.0.XX"
              value={formData.ip}
              onChange={(e) => setFormData({...formData, ip: e.target.value})}
            />
          </div>
           <div>
            <label className="text-xs text-gray-400 uppercase">AI Model</label>
            <select 
              className="w-full bg-[#0d0e12] border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
            >
                <option value="YOLOv8m-parking">YOLOv8m Parking Analytics</option>
                <option value="YOLOv8m-safety">YOLOv8m Safety Gear Detector</option>
                <option value="YOLOv8n-general">YOLOv8n General Purpose</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 rounded hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => onAdd(formData)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition font-bold"
          >
            Deploy Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;
