import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            if (email === 'admin@visionaiot.com' && password === 'admin') {
                const mockUser = { id: 'usr_1', email: 'admin@visionaiot.com', role: 'Admin' as const };
                const mockToken = 'mock_jwt_token_for_demo';
                setAuth(mockUser, mockToken);
                navigate('/dashboard/citizen-hub');
            } else {
                setError('Invalid credentials. Use admin@visionaiot.com / admin');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans text-slate-100 selection:bg-cyan-500/30"
            style={{ backgroundColor: '#050505' }}
        >
            {/* ── Animated Background Blobs ── */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px]"
                    style={{ background: 'rgba(0,242,255,0.18)', animation: 'pulse-slow 8s cubic-bezier(0.4,0,0.6,1) infinite' }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px]"
                    style={{ background: 'rgba(188,19,254,0.18)', animation: 'pulse-slow 8s cubic-bezier(0.4,0,0.6,1) infinite', animationDelay: '-2s' }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
                    style={{ background: 'rgba(255,94,0,0.10)', animation: 'pulse-slow 8s cubic-bezier(0.4,0,0.6,1) infinite', animationDelay: '-4s' }}
                />
                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #00f2ff 1px, transparent 0)', backgroundSize: '32px 32px' }}
                />
            </div>

            {/* Pulse animation keyframes */}
            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                }
            `}</style>

            {/* ── Header ── */}
            <header className="relative z-10 flex items-center justify-between px-6 lg:px-20 py-8">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div
                            className="absolute -inset-1 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
                            style={{ background: 'linear-gradient(to right, #00f2ff, #bc13fe, #ff5e00)' }}
                        />
                        <div className="relative bg-black p-2.5 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic">Vision AIoT</h2>
                </div>
                <div>
                    <span
                        className="text-xs font-mono tracking-widest opacity-80 px-3 py-1.5 rounded-full border"
                        style={{ color: '#00f2ff', backgroundColor: 'rgba(0,242,255,0.1)', borderColor: 'rgba(0,242,255,0.2)' }}
                    >
                        SYSTEM_v4.2 // ONLINE
                    </span>
                </div>
            </header>

            {/* ── Main Login Card ── */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[480px]">
                    <div
                        className="rounded-2xl shadow-2xl p-10 lg:p-14 relative overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {/* Top gradient line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px] opacity-50"
                            style={{ background: 'linear-gradient(to right, transparent, #00f2ff, transparent)' }}
                        />

                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                                Initiate{' '}
                                <span
                                    style={{
                                        background: 'linear-gradient(90deg,#00f2ff,#bc13fe,#ff5e00)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Protocol
                                </span>
                            </h1>
                            <p className="text-slate-400 font-medium">Authentication required for industrial nodes</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">

                            {/* Error */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400 font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Identity Tag</label>
                                <div className="relative group">
                                    <svg
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@node.io"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-600"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,242,255,0.5)')}
                                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Key</label>
                                    <a
                                        className="text-xs font-bold transition-colors underline underline-offset-4"
                                        style={{ color: '#bc13fe', textDecorationColor: 'rgba(188,19,254,0.3)' }}
                                        href="#"
                                    >
                                        Key Recovery?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <svg
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors duration-300"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2m-2-2v2m0 0H8m4 0v4m0-4a4 4 0 01-4-4V7a4 4 0 014-4h0a4 4 0 014 4v4a4 4 0 01-4 4z" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-12 pr-12 py-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-600"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(188,19,254,0.5)')}
                                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-3 px-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-5 h-5 rounded cursor-pointer accent-cyan-400"
                                />
                                <label className="text-sm font-medium text-slate-400 cursor-pointer select-none" htmlFor="remember">
                                    Maintain persistency (30 days)
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="relative group pt-2">
                                <div
                                    className="absolute -inset-1 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition duration-500 group-hover:duration-200"
                                    style={{ background: 'linear-gradient(to right, #00f2ff, #bc13fe, #ff5e00)' }}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full text-white font-black py-5 rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#030712' }}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-widest text-sm">Authorize Access</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Demo credentials hint */}
                        <div className="mt-10 pt-6 border-t border-white/5 text-center space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Demo Credentials</p>
                            <p className="text-xs font-mono text-slate-500">admin@visionaiot.com / admin</p>
                        </div>

                        {/* Request access */}
                        <div className="mt-6 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Unauthorized unit?{' '}
                                <a
                                    href="#"
                                    className="font-bold transition-colors ml-2 inline-flex items-center gap-1 group"
                                    style={{ color: '#ff5e00' }}
                                >
                                    Apply for Node ID
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Trust Footer */}
                    <div className="mt-10 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-8 text-slate-500">
                            <div className="flex items-center gap-2 cursor-help group">
                                <svg className="w-5 h-5 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Quantum Safe</span>
                            </div>
                            <div className="w-px h-3 bg-white/10" />
                            <div className="flex items-center gap-2 cursor-help group">
                                <svg className="w-5 h-5 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Neural Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 px-6 py-10 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
                    © 2024 Vision AIoT Systems <span className="mx-3 opacity-30">//</span>
                    <a className="hover:text-cyan-400 transition-colors" href="#">Legal</a>
                    <span className="mx-3 opacity-30">//</span>
                    <a className="hover:text-purple-400 transition-colors" href="#">Infrastructure</a>
                </p>
            </footer>
        </div>
    );
}
