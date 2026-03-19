
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0b] text-[#f3f4f6] font-sans antialiased overflow-x-hidden min-h-screen">
      {/* BEGIN: Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-brandBorder bg-brandDark/80 backdrop-blur-md" data-purpose="main-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-custom flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight">VISION <span className="text-primary">AIoT</span></span>
            </div>
            <div className="hidden md:flex space-x-10 text-sm font-medium text-gray-400">
              <a className="hover:text-white transition-colors" href="#features">Features</a>
              <a className="hover:text-white transition-colors" href="#solutions">Solutions</a>
              <a className="hover:text-white transition-colors" href="#dashboard">Platform</a>
              <a className="hover:text-white transition-colors" href="#enterprise">Enterprise</a>
            </div>
            <div>
              <Link to="/citizen/login" className="bg-red-600 hover:bg-red-500 px-6 py-2.5 rounded-custom text-sm font-bold transition-all shadow-lg shadow-red-600/20 inline-block text-white mr-4">
                Citizen SOS
              </Link>
              <Link to="/login" className="bg-primary hover:bg-primary-dark px-6 py-2.5 rounded-custom text-sm font-bold transition-all shadow-lg shadow-primary/20 inline-block text-white">
                Admin Center
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* END: Navigation */}

      {/* BEGIN: Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden" id="hero">
        <div className="hero-glow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-8 uppercase tracking-widest">
            Powered by YOLOv8 Edge
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Real-Time <span className="gradient-text">Edge Intelligence</span><br />
            for Industrial Safety
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Proactively detect unauthorized access and PPE violations at the edge.
            Zero latency. Total privacy. Enterprise-grade security for the modern factory floor.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/login" className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-custom font-bold text-lg shadow-xl shadow-primary/25 transition-all inline-block text-white text-center flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Admin Command Center
            </Link>
            <Link to="/citizen/login" className="px-8 py-4 bg-red-600 text-white hover:bg-red-500 rounded-custom font-bold text-lg transition-all inline-block text-center shadow-xl shadow-red-600/25 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Citizen Safety Portal
            </Link>
          </div>
        </div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Edge Advantage Section */}
      <section className="py-24 bg-brandSurface/30 border-y border-brandBorder" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Edge Advantage</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Eliminate cloud dependency with local inference that keeps your data secure and your response times instant.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-custom hover:border-primary/50 transition-colors" data-purpose="advantage-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Ultra-Low Latency</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Processing happens on-site. Detect safety violations and trigger alarms in under 30ms—critical for immediate hazard prevention.</p>
            </div>
            <div className="glass-card p-8 rounded-custom hover:border-primary/50 transition-colors" data-purpose="advantage-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Privacy First</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Sensitive video feeds never leave your local network. Only metadata and alerts are transmitted to the centralized dashboard.</p>
            </div>
            <div className="glass-card p-8 rounded-custom hover:border-primary/50 transition-colors" data-purpose="advantage-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Bandwidth Efficiency</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Reduce cloud egress costs by 90%. Avoid streaming 24/7 high-res video; only upload critical incident snapshots.</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: Edge Advantage Section */}

      {/* BEGIN: Solutions Section */}
      <section className="py-24" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-4">Intelligent Detection Models</h2>
              <p className="text-gray-400 max-w-xl">Pre-trained on diverse industrial datasets for unmatched precision.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="relative rounded-custom overflow-hidden group">
                <img alt="PPE Detection" className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-ndfiFv6L1bXs6xyp0AdBCvz6I1RbPYm-8spPWn8Zp3z295EuShFu6lZhuiBbBpJy0RJcA3TV2echEaJEnv3m08RJTfdtgdPdQ5UgoDmHjCURnRaZ4V8bV6vW61qnpwIYtaz9vl9ALhPedMU1vuPOQdqOP-8zsSqOASpmPjJhezQbiZ5-1UDScMwLb3upnR2wxXZH_UGwQrCQJ6IOCV5rzOQ07xRifJeAJJXqTxDasNUvHsIu-2MmFu9KtfTYgEcrlrhU_jy4zy6M" />
                <div className="bounding-box" style={{ top: '20%', left: '40%', width: '15%', height: '35%' }}>
                  <span className="label-tag">VEST: 98%</span>
                </div>
                <div className="bounding-box" style={{ top: '15%', left: '42%', width: '10%', height: '10%', borderColor: '#f87171', background: 'rgba(248, 113, 113, 0.1)' }}>
                  <span className="label-tag" style={{ background: '#f87171' }}>MISSING_HELMET</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">PPE Compliance Monitoring</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Real-time auditing of safety gear including hard hats, high-visibility vests, and eye protection. Instantly flag non-compliant personnel entering hazardous zones.
                </p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span> Automated safety reporting</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span> Custom gear detection training</li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative rounded-custom overflow-hidden group">
                <img alt="Security Detection" className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmyr2KACdCt7kzr1B0JVWQEhqj7FTuWBoNMgkJCQhNEcY_HtZOR8FfAUbtLsWjdNmlWptfCvflTbG2lcFTPWwlxuxYUSFljh-mE1JJznEenIa5v1khffc6l2n6caBS5vCDJi8BvXZBrZPXApYNAcTfb7FxBx5h_KYyeuBmX_dkeBVkJnsTiqijys_LIG7I5qJqyhCY3Lf1oxrlAYmQGZltghaS0-RFykWrEJgpzclpsmYbN2emLAoTj6SnYG64iHp5j5GgD93cFu4i" />
                <div className="bounding-box" style={{ top: '30%', left: '20%', width: '20%', height: '50%', borderColor: '#facc15', background: 'rgba(250, 204, 21, 0.1)' }}>
                  <span className="label-tag" style={{ background: '#facc15' }}>UNAUTHORIZED_ACCESS</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Smart Perimeter Security</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Differentiate between authorized personnel, vehicles, and wildlife. Reduce false alarms by 85% compared to traditional motion-based security systems.
                </p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span> Loitering detection</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span> Time-of-day access control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Solutions Section */}

      {/* BEGIN: Interactive Dashboard Preview */}
      <section className="py-24 bg-brandDark" id="dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-1 rounded-xl shadow-2xl shadow-primary/5">
            <div className="bg-brandDark rounded-lg overflow-hidden border border-brandBorder">
              <div className="h-12 border-b border-brandBorder bg-brandSurface flex items-center justify-between px-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Global Ops Command Center</div>
                <div className="w-12"></div>
              </div>
              <div className="grid grid-cols-12 h-[500px]">
                <aside className="col-span-3 border-r border-brandBorder p-6 bg-brandSurface/20">
                  <div className="text-xs font-bold text-gray-500 mb-6 uppercase">Active Nodes</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Factory-Floor-A1</span>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-sm">Warehouse-North</span>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-sm">Loading-Dock-B</span>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    </div>
                  </div>
                  <div className="mt-12">
                    <div className="text-xs font-bold text-gray-500 mb-4 uppercase">Alert History</div>
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-200 mb-2">
                      [14:22:10] PPE Violation Zone 4
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-[10px] text-yellow-200">
                      [14:18:05] Entry: Person detected
                    </div>
                  </div>
                </aside>
                <main className="col-span-9 p-8 bg-[#0d0d0f] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                    <h4 className="text-lg font-bold">Live Stream: Node-A1</h4>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] rounded font-bold">YOLOv8-S INFERENCE</span>
                      <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] rounded font-bold">FPS: 28.4</span>
                    </div>
                  </div>
                  <div className="relative h-64 bg-gray-900/50 rounded-lg flex items-center justify-center border border-brandBorder group">
                    <img alt="Live Feed" className="object-cover w-full h-full opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBGd0c4orRgWtLP27uMUcmLbFXW9VsRVp83RNUX_qHzlBOjJUN0QIGa2vXXODPCxik-ep03tOBbQtWeMoYUsZr1BiU06VBqEQUi0oupW9_lJZczukDwsO6bb86fP89rwNd-yKhtD643dZAgC-1HoNiFNHHSyiU9YWUkha79-adZy-t8jVh_J9vOfLpuvTVqtX7-PnLSg3uwitIbFJqWLSQOMEVQMZ0eUCZRaztxKm49z9c_kxqOjeaugcjd2gXl-aXC9SeR0S3T2q7" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-4 w-full px-12">
                        <div className="h-1 bg-primary/20 rounded"></div>
                        <div className="h-1 bg-primary/40 rounded"></div>
                        <div className="h-1 bg-primary/20 rounded"></div>
                      </div>
                    </div>
                    <svg className="absolute w-12 h-12 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" /></svg>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-6">
                    <div className="p-4 bg-brandSurface rounded border border-brandBorder">
                      <div className="text-xs text-gray-500 mb-1">Detections/Min</div>
                      <div className="text-xl font-bold">42</div>
                    </div>
                    <div className="p-4 bg-brandSurface rounded border border-brandBorder">
                      <div className="text-xs text-gray-500 mb-1">Accuracy</div>
                      <div className="text-xl font-bold">99.2%</div>
                    </div>
                    <div className="p-4 bg-brandSurface rounded border border-brandBorder">
                      <div className="text-xs text-gray-500 mb-1">Inference Speed</div>
                      <div className="text-xl font-bold">22ms</div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Interactive Dashboard Preview */}

      {/* BEGIN: Smart Features Section */}
      <section className="py-24 border-t border-brandBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <h4 className="text-xl font-bold mb-3">ROI Geofencing</h4>
              <p className="text-gray-400 text-sm">Define Region of Interest (ROI) polygons directly in the UI to monitor specific high-risk machinery areas.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <h4 className="text-xl font-bold mb-3">One-Click Model Swap</h4>
              <p className="text-gray-400 text-sm">OTA updates allow you to deploy new custom-trained models to edge devices without physical intervention.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <h4 className="text-xl font-bold mb-3">Real-Time Alerts</h4>
              <p className="text-gray-400 text-sm">Trigger webhooks, mobile push notifications, or MQTT messages to integrate with existing facility alarms.</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: Smart Features Section */}

      {/* BEGIN: Enterprise Section */}
      <section className="py-24 bg-brandSurface" id="enterprise">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 rounded-2xl flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h2 className="text-4xl font-extrabold mb-6 leading-tight">Built for Industrial Scale</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Our platform is hardware-agnostic, supporting NVIDIA Jetson, Intel OpenVINO, and Hailo-8 accelerators. Whether you have 5 cameras or 5,000, Vision AIoT scales with your infrastructure.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                  <span>On-premise Docker deployment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                  <span>Encrypted RTSP/WebRTC streams</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                  <span>Full REST API integration</span>
                </div>
              </div>
            </div>
            <div className="lg:w-5/12 grid grid-cols-2 gap-4">
              <div className="p-6 bg-brandDark border border-brandBorder rounded-lg flex flex-col items-center justify-center">
                <div className="text-primary font-bold text-2xl mb-1">Jetson</div>
                <div className="text-[10px] text-gray-500">OPTIMIZED</div>
              </div>
              <div className="p-6 bg-brandDark border border-brandBorder rounded-lg flex flex-col items-center justify-center">
                <div className="text-primary font-bold text-2xl mb-1">Docker</div>
                <div className="text-[10px] text-gray-500">CONTAINERIZED</div>
              </div>
              <div className="p-6 bg-brandDark border border-brandBorder rounded-lg flex flex-col items-center justify-center">
                <div className="text-primary font-bold text-2xl mb-1">MQTT</div>
                <div className="text-[10px] text-gray-500">MESSAGING</div>
              </div>
              <div className="p-6 bg-brandDark border border-brandBorder rounded-lg flex flex-col items-center justify-center">
                <div className="text-primary font-bold text-2xl mb-1">REST</div>
                <div className="text-[10px] text-gray-500">GATEWAY</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Enterprise Section */}

      {/* BEGIN: Footer */}
      <footer className="py-12 border-t border-brandBorder bg-brandDark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded-custom flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <span className="text-lg font-bold tracking-tight">VISION <span className="text-primary">AIoT</span></span>
            </div>
            <div className="flex space-x-8 text-sm text-gray-500">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#">Contact</a>
            </div>
            <div className="mt-6 md:mt-0 text-gray-500 text-xs">
              © 2023 Vision AIoT Technologies. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}
