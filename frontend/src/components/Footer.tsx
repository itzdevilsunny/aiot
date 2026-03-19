import { Activity, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                            <div className="p-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/30 group-hover:neon-border transition-all">
                                <Activity className="w-5 h-5 text-neon-blue" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white group-hover:text-glow transition-all">
                                Vision<span className="text-neon-blue">AIoT</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Real-Time Anomaly Detection at the Edge.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-neon-blue transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-neon-blue transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-neon-blue transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Edge Inference</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Smart Alerts</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Integrations</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Whitepaper</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-neon-blue transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-neon-blue transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} VisionAIoT Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-slate-500 text-sm">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
