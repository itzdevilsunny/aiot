import { Activity, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 group-hover:neon-border transition-all duration-300">
                        <Activity className="w-6 h-6 text-neon-blue animate-pulse-slow" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-glow transition-all">
                        Vision<span className="text-neon-blue">AIoT</span>
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <a href="#features" className="hover:text-neon-blue transition-colors">Features</a>
                    <a href="#solutions" className="hover:text-neon-blue transition-colors">Solutions</a>
                    <a href="#roadmap" className="hover:text-neon-blue transition-colors">Roadmap</a>
                </div>

                {/* Call to Action */}
                <div className="hidden md:flex items-center gap-4">
                    <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Read Whitepaper
                    </button>
                    <Link to="/dashboard" className="px-5 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/50 hover:bg-neon-blue/20 hover:neon-border transition-all duration-300 font-medium text-sm flex items-center gap-2">
                        Launch Dashboard
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-slate-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden glass absolute top-full left-0 w-full border-t border-slate-700/50 flex flex-col p-4 gap-4">
                    <a href="#features" className="text-slate-300 hover:text-neon-blue p-2">Features</a>
                    <a href="#solutions" className="text-slate-300 hover:text-neon-blue p-2">Solutions</a>
                    <a href="#roadmap" className="text-slate-300 hover:text-neon-blue p-2">Roadmap</a>
                    <div className="h-px bg-slate-700/50 w-full my-2"></div>
                    <button className="text-slate-300 hover:text-white w-full text-left p-2">
                        Read Whitepaper
                    </button>
                    <Link to="/dashboard" className="w-full text-center px-5 py-3 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/50 font-medium mt-2 block">
                        Launch Dashboard
                    </Link>
                </div>
            )}
        </nav>
    );
}
