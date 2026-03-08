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
 * 🚀 GURU ULTIMATE COMMAND CENTER V9.4 - NUCLEAR STABILITY FIX
 * - Polyfill pro SWG (Subscribe with Google) proti pádům UI.
 * - Oprava filtrace Radarů a synchronizace s AI skórováním.
 * - Odstraněny neexistující závislosti (Supabase-js).
 */

// 🛡️ GURU GLOBAL SHIELD - Prevence TypeError dřív než začne React
if (typeof window !== 'undefined') {
  window.swgSubscriptions = window.swgSubscriptions || {};
  if (!window.swgSubscriptions.attachButton) {
    window.swgSubscriptions.attachButton = () => {};
  }
}

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
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'Wifik500') {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
      addLog('Přihlášení úspěšné. Vítej ve velíně.', 'success');
    } else {
      addLog('Nesprávné heslo!', 'error');
    }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    setAiActive(false);
    addLog('Spouštím Guru Unified Intel Engine V9.2...', 'warning');
    
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      
      if (json.success) {
        const items = json.data || [];
        
        // 🚀 FILTRACE PRO RADARY (Chytřejší dělení dle zdrojů)
        setHwIntel(items.filter(i => 
          i.source === "VideoCardz" || 
          (i.source === "Wccftech" && /rtx|amd|intel|cpu|gpu|gpu|ti|leak|blackwell|zen|core/i.test(i.title))
        ).slice(0, 10));

        setGameIntel(items.filter(i => 
          i.source === "IGN" || 
          (i.source === "Wccftech" && !/rtx|amd|intel|cpu|gpu/i.test(i.title)) ||
          (i.source === "Reddit Leaks" && /gta|ps5|xbox|switch|game|launch|play|exclusive/i.test(i.title))
        ).slice(0, 10));

        setLeaksIntel(items.filter(i => i.source === "Reddit Leaks" || i.source === "Chiphell").slice(0, 15));
        
        // 🧠 SYNCHRONIZACE AI STAVU (Zobrazení AI MOZEK: ONLINE)
        if (json._debug?.ai_active) {
            setAiActive(true);
            setAiStatusMsg('ONLINE');
            addLog('GURU AI: Skórování trendů na základě globálních statistik hotovo.', 'success');
        } else {
            setAiStatusMsg(json._debug?.ai_status || 'OFFLINE');
            addLog(`AI Mozek: ${json._debug?.ai_status}`, 'error');
        }
      }
    } catch (err) {
      addLog(`Chyba Enginu: ${err.message}`, 'error');
    } finally {
      setIntelLoading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center text-white p-6 font-sans">
      <form onSubmit={handleLogin} className="bg-[#111318] p-10 rounded-[40px] border border-[#eab30833] text-center max-w-sm w-full shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600"></div>
        <Lock size={48} className="text-orange-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">Guru Velín</h1>
        <p className="text-neutral-500 text-[10px] font-bold mb-8 uppercase tracking-widest">Zadej autorizační kód</p>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••" 
          className="w-full p-5 rounded-2xl bg-black border border-neutral-800 text-white mb-6 text-center focus:border-orange-500 transition-all outline-none text-xl tracking-widest" 
        />
        <button type="submit" className="w-full p-5 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/30 active:scale-95 uppercase tracking-tighter">Vstoupit</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0d0e12] border-r border-white/5 fixed h-screen p-8 flex flex-col">
         <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Zap size={20} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-xl font-black tracking-tighter">GURU <span className="text-purple-500 italic">HUB</span></h2>
         </div>

         <nav className="space-y-3 flex-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-tight transition-all ${activeTab === 'dashboard' ? 'bg-purple-600/10 text-purple-500 border border-purple-600/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
                <LayoutDashboard size={18} /> Přehled
            </button>
            <button onClick={() => setActiveTab('intel-hub')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-tight transition-all ${activeTab === 'intel-hub' ? 'bg-orange-600/10 text-orange-500 border border-orange-600/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
                <Layers size={18} /> Intel Radar Hub
            </button>
         </nav>

         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-auto">
            <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2 text-center tracking-widest">Verze 9.4 Stable</p>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12 h-screen overflow-y-auto custom-scrollbar">
        {activeTab === 'intel-hub' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end mb-16">
               <div className="flex items-center gap-8">
                  <div className="p-5 bg-orange-600/10 rounded-3xl border border-orange-600/20 shadow-inner group transition-all">
                    <Cpu className="text-orange-500 group-hover:scale-110 transition-transform" size={40} />
                  </div>
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter leading-none mb-4 uppercase">Intel <span className="text-orange-500 italic">Radar</span></h2>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${aiActive ? 'bg-green-600/10 text-green-500 border-green-600/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-red-600/10 text-red-500 border-red-600/30'}`}>
                           <Brain size={14} className={intelLoading ? 'animate-pulse' : ''} />
                           AI MOZEK: {aiActive ? 'ONLINE' : aiStatusMsg || 'OFFLINE'}
                        </div>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={fetchIntelFeed} 
                 disabled={intelLoading}
                 className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase flex items-center gap-3 hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50 group"
               >
                 <RefreshCw size={20} className={intelLoading ? 'animate-spin' : ''} />
                 {intelLoading ? 'Skenuji...' : 'Spustit sken trendů'}
               </button>
            </header>

            <div className="space-y-20 pb-32">
                {/* RADAR: LEAKS & RUMORS */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-cyan-400 pl-6 py-2">
                        <Ghost className="text-cyan-400" size={32} />
                        <h3 className="font-black uppercase tracking-tighter text-2xl">Leaks & <span className="text-cyan-400 italic">Rumors</span></h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {leaksIntel.length > 0 ? leaksIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-cyan-400/40 transition-all group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase">{item.source}</span>
                                    <div className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${item.viral_score > 80 ? 'bg-red-500 text-white' : 'bg-cyan-400 text-black'}`}>
                                        {item.viral_score}%
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-cyan-400">{item.title}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <a href={item.link} target="_blank" className="py-3 bg-neutral-900 rounded-2xl text-[10px] font-black text-center text-neutral-500 hover:text-white border border-white/5 uppercase">Zdroj</a>
                                    <button className="py-3 bg-cyan-400/10 rounded-2xl text-[10px] font-black text-cyan-400 border border-cyan-400/20 uppercase hover:bg-cyan-400 hover:text-black">Koncept</button>
                                </div>
                            </div>
                        )) : <div className="col-span-full py-10 text-center text-neutral-700 font-bold uppercase italic opacity-50">Žádná data. Spusť sken.</div>}
                    </div>
                </section>

                {/* RADAR: HARDWARE RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-orange-500 pl-6 py-2">
                        <Monitor className="text-orange-500" size={32} />
                        <h3 className="font-black uppercase tracking-tighter text-2xl">Hardware <span className="text-orange-500 italic">Radar</span></h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {hwIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-orange-500/40 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase">{item.source}</span>
                                    <div className="px-2.5 py-1 bg-orange-500 text-white rounded-lg font-black text-[11px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-orange-400">{item.title}</h4>
                                <button className="w-full py-3 bg-orange-500/10 rounded-2xl text-[10px] font-black text-orange-500 border border-orange-500/20 uppercase tracking-tighter hover:bg-orange-500 hover:text-white">Vytvořit článek</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RADAR: GAMING RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-purple-500 pl-6 py-2">
                        <Play className="text-purple-500" size={32} />
                        <h3 className="font-black uppercase tracking-tighter text-2xl">Gaming <span className="text-purple-500 italic">Radar</span></h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {gameIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-purple-500/40 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase">{item.source}</span>
                                    <div className="px-2.5 py-1 bg-purple-500 text-white rounded-lg font-black text-[11px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-purple-400">{item.title}</h4>
                                <button className="w-full py-3 bg-purple-500/10 rounded-2xl text-[10px] font-black text-purple-500 border border-purple-500/20 uppercase tracking-tighter hover:bg-purple-500 hover:text-white">Bleskovka</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
          </div>
        )}
      </main>

      {/* GURU FLOATING CONSOLE */}
      <div className="fixed bottom-8 right-8 w-96 bg-[#0d0e12]/90 backdrop-blur-2xl rounded-[30px] border border-white/10 shadow-2xl overflow-hidden z-50">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-3">
              <Terminal size={16} className="text-neutral-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">Guru Console</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div className="p-6 h-48 overflow-y-auto space-y-2.5 font-mono text-[11px] custom-scrollbar">
           {consoleLogs.map((log, i) => (
             <div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-orange-400' : log.type === 'success' ? 'text-green-400' : 'text-neutral-500'}`}>
                <span className="opacity-40 mr-3">[{log.time}]</span>
                <span className="font-bold tracking-tight">{log.msg}</span>
             </div>
           ))}
           <div ref={logEndRef} />
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
