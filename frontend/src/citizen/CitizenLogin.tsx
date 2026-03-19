import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CitizenLogin() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone) {
            localStorage.setItem('citizen_session', JSON.stringify({ name, phone }));
            navigate('/citizen/report');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm mx-auto z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-[0_0_30px_rgba(75,43,238,0.2)]">
                        <div className="w-full h-full bg-[#040D21] rounded-2xl flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Secure Authentication</h2>
                    <p className="text-sm text-slate-400">Enter your details to access the portal and track your civic reports.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rajan Sharma"
                            className="w-full bg-[#040D21] border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="tel" 
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-[#040D21] border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        Access Portal <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-[10px] text-slate-500 mt-4 leading-relaxed">
                        By continuing, you agree to the Civic Shield terms of service and privacy policy. Your data is encrypted end-to-end.
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
