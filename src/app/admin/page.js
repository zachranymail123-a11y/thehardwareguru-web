"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, Cpu, Lock, Terminal,
  LayoutDashboard, Layers, ChevronRight, Play,
  Smartphone, Monitor, ArrowLeft, Star, Heart, Ghost, Brain
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V9.1
 * - Opravena chyba s neexistující knihovnou Supabase.
 * - Plná implementace vizualizace AI Scoringu (Hardware, Gaming, Leaks).
 * - Propojeno s V9.0 Backend API.
 */

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);

  const [hwIntel, setHwIntel] = useState([]);
  const [gameIntel, setGameIntel] = useState([]);
  const [leaksIntel, setLeaksIntel] = useState([]); 
  const [intelLoading, setIntelLoading] = useState(false);
  const [aiActive, setAiActive] = useState(false); 
  const [aiStatusMsg, setAiStatusMsg] = useState('');

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('guru_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Heslo pro Guru Mastera
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'Wifik500') {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
    }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    setAiActive(false);
    addLog('Spouštím Guru Unified Intel Engine V9.0...', 'warning');
    
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      
      if (json.success) {
        const items = json.data || [];
        
        // 🚀 FILTRACE PRO RADARY
        // Hardware Radar: VideoCardz nebo Wccftech (obsahující HW slova)
        setHwIntel(items.filter(i => 
          i.source === "VideoCardz" || 
          (i.source === "Wccftech" && /rtx|intel|amd|cpu|gpu|blackwell/i.test(item.title))
        ).slice(0, 10));

        // Gaming Radar: Wccftech nebo Reddit (o hrách/konzolích)
        setGameIntel(items.filter(i => 
          i.source === "Wccftech" || 
          (i.source === "Reddit Leaks" && /ps5|xbox|switch|gta|game/i.test(item.title))
        ).slice(0, 10));

        // Leaks & Rumors: Vše z Redditu a Chiphellu
        setLeaksIntel(items.filter(i => i.source === "Reddit Leaks" || i.source === "Chiphell").slice(0, 15));
        
        // 🧠 AI Status Check z backendu
        if (json._debug?.ai_active) {
            setAiActive(true);
            setAiStatusMsg('ONLINE');
            addLog('GURU AI MOZEK: Skórování trendů dokončeno.', 'success');
        } else {
            setAiStatusMsg(json._debug?.ai_status || 'OFFLINE');
            addLog(`AI Mozek: ${json._debug?.ai_status || 'nedostupný'}`, 'error');
        }
      }
    } catch (err) {
      addLog(`Chyba Enginu: ${err.message}`, 'error');
    } finally {
      setIntelLoading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center text-white p-6">
      <form onSubmit={handleLogin} className="bg-[#111318] p-10 rounded-[30px] border border-[#eab30866] text-center max-w-sm w-full shadow-2xl">
        <Lock size={50} className="text-orange-500 mx-auto mb-6" />
        <h1 className="text-2xl font-black mb-6 tracking-tighter uppercase">Guru Velín</h1>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Zadej přístupový kód..." 
          className="w-full p-4 rounded-xl bg-black border border-neutral-800 text-white mb-6 text-center focus:border-orange-500 transition-all outline-none" 
        />
        <button type="submit" className="w-full p-4 bg-orange-600 text-white rounded-xl font-black hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/30">VSTOUPIT</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0d0e12] border-r border-white/5 fixed h-screen p-6">
         <div className="flex items-center gap-3 mb-10">
            <Zap className="text-purple-500" fill="currentColor" />
            <h2 className="text-xl font-black tracking-tighter">GURU <span className="text-purple-500">ADMIN</span></h2>
         </div>
         <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black text-sm uppercase transition-all ${activeTab === 'dashboard' ? 'bg-purple-600/10 text-purple-500 border border-purple-600/20' : 'text-neutral-500 hover:text-white'}`}>
                <LayoutDashboard size={18} /> Přehled
            </button>
            <button onClick={() => setActiveTab('intel-hub')} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black text-sm uppercase transition-all ${activeTab === 'intel-hub' ? 'bg-orange-600/10 text-orange-500 border border-orange-600/20' : 'text-neutral-500 hover:text-white'}`}>
                <Layers size={18} /> Intel Hub
            </button>
         </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12 overflow-y-auto">
        {activeTab === 'intel-hub' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-orange-600/20 rounded-2xl border border-orange-600/30 shadow-inner">
                    <Cpu className="text-orange-500" size={32} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter">Intel <span className="text-orange-500">Hub</span></h2>
                    <div className="flex items-center gap-3 mt-2">
                        {/* 🧠 GURU AI BADGE */}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${aiActive ? 'bg-green-600/10 text-green-500 border-green-600/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-red-600/10 text-red-500 border-red-600/30'}`}>
                           <Brain size={12} className={intelLoading ? 'animate-pulse' : ''} />
                           AI MOZEK: {aiActive ? 'ONLINE' : aiStatusMsg || 'OFFLINE'}
                        </div>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={fetchIntelFeed} 
                 disabled={intelLoading}
                 className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase flex items-center gap-3 hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95 disabled:opacity-50"
               >
                 <RefreshCw size={18} className={intelLoading ? 'animate-spin' : ''} />
                 {intelLoading ? 'Skenuji svět...' : 'Skenovat trendy'}
               </button>
            </header>

            {/* RADARY */}
            <div className="space-y-16">
                {/* RADAR 1: LEAKS & RUMORS */}
                <section>
                    <div className="flex items-center gap-4 mb-8 border-l-4 border-cyan-400 pl-4">
                        <Ghost className="text-cyan-400" size={24} />
                        <h3 className="font-black uppercase tracking-widest text-lg">Leaks & <span className="text-cyan-400">Rumors Radar</span></h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {leaksIntel.length > 0 ? leaksIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-5 rounded-3xl border border-white/5 hover:border-cyan-400/40 hover:shadow-[0_8px_30px_rgb(34,211,238,0.1)] transition-all group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter">{item.source}</span>
                                    <div className={`px-2 py-1 rounded font-black text-[10px] ${item.viral_score > 80 ? 'bg-red-500 text-white' : 'bg-cyan-400 text-black'}`}>
                                        {item.viral_score}%
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold leading-snug mb-6 h-14 overflow-hidden group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <a href={item.link} target="_blank" className="py-2.5 bg-neutral-900 rounded-xl text-[10px] font-black text-center text-neutral-400 hover:text-white border border-white/5 transition-all uppercase">Zdroj</a>
                                    <button className="py-2.5 bg-cyan-400/10 rounded-xl text-[10px] font-black text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400 hover:text-black transition-all uppercase">Koncept</button>
                                </div>
                            </div>
                        )) : (
                          <div className="col-span-full py-10 text-center text-neutral-600 font-bold border-2 border-dashed border-white/5 rounded-3xl">Radar je zatím čistý. Spusť sken.</div>
                        )}
                    </div>
                </section>

                {/* RADAR 2: HARDWARE RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-8 border-l-4 border-orange-500 pl-4">
                        <Cpu className="text-orange-500" size={24} />
                        <h3 className="font-black uppercase tracking-widest text-lg">Hardware <span className="text-orange-500">Radar</span></h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {hwIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-5 rounded-3xl border border-white/5 hover:border-orange-500/40 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-neutral-500 uppercase">{item.source}</span>
                                    <div className="px-2 py-1 bg-orange-500 text-white rounded font-black text-[10px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-snug mb-6 h-14 overflow-hidden group-hover:text-orange-400 transition-colors">{item.title}</h4>
                                <button className="w-full py-2.5 bg-orange-500/10 rounded-xl text-[10px] font-black text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all uppercase">Vytvořit článek</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RADAR 3: GAMING RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-8 border-l-4 border-purple-500 pl-4">
                        <Monitor className="text-purple-500" size={24} />
                        <h3 className="font-black uppercase tracking-widest text-lg">Gaming <span className="text-purple-500">Radar</span></h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-20">
                        {gameIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-5 rounded-3xl border border-white/5 hover:border-purple-500/40 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-neutral-500 uppercase">{item.source}</span>
                                    <div className="px-2 py-1 bg-purple-500 text-white rounded font-black text-[10px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-snug mb-6 h-14 overflow-hidden group-hover:text-purple-400 transition-colors">{item.title}</h4>
                                <button className="w-full py-2.5 bg-purple-500/10 rounded-xl text-[10px] font-black text-purple-500 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all uppercase">Vytvořit bleskovku</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING LOGS */}
      <div className="fixed bottom-6 right-6 w-80 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50">
        <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-neutral-900/50">
           <Terminal size={14} className="text-neutral-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Guru Console</span>
        </div>
        <div className="p-4 h-40 overflow-y-auto space-y-2 font-mono text-[10px]">
           {consoleLogs.map((log, i) => (
             <div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-orange-400' : 'text-neutral-500'}`}>
                <span className="opacity-50 mr-2">[{log.time}]</span> {log.msg}
             </div>
           ))}
           <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
