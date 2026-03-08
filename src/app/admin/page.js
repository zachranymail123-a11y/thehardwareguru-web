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
 * 🚀 GURU ADMIN DASHBOARD V9.4 - ULTIMATE STABILITY
 * - Fix pro TypeError: window.swgSubscriptions.attachButton
 * - Odstraněno Supabase (způsobovalo chyby kompilace)
 * - Propojeno s V9.2 AI Backendem (OpenAI scoring)
 * - Styl: Hardware Guru Premium (Czech / English ready)
 */

// 🛡️ GURU GLOBAL SHIELD - Polyfill proti pádům externích skriptů
if (typeof window !== 'undefined') {
  window.swgSubscriptions = window.swgSubscriptions || {};
  if (!window.swgSubscriptions.attachButton) {
    window.swgSubscriptions.attachButton = () => { /* Bypass */ };
  }
}

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('intel-hub'); // Výchozí na Intel Hub
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);

  const [hwIntel, setHwIntel] = useState([]);
  const [gameIntel, setGameIntel] = useState([]);
  const [leaksIntel, setLeaksIntel] = useState([]); 
  const [intelLoading, setIntelLoading] = useState(false);
  const [aiActive, setAiActive] = useState(false); 
  const [aiStatusMsg, setAiStatusMsg] = useState('OFFLINE');

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('guru_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    // Pojistka uvnitř komponenty
    if (typeof window !== 'undefined') {
      window.swgSubscriptions = window.swgSubscriptions || {};
      window.swgSubscriptions.attachButton = window.swgSubscriptions.attachButton || (() => {});
    }
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Bezpečné heslo Guru Mastera
    if (password === 'Wifik500' || password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
      addLog('Systém autorizován. Vítejte, Guru.', 'success');
    } else {
      addLog('Přístup odepřen: Neplatné heslo.', 'error');
    }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    setAiActive(false);
    addLog('Spouštím Unified Intel Engine V9.2 (OpenAI Enabled)...', 'warning');
    
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      
      if (json.success) {
        const items = json.data || [];
        
        // 🚀 INTELIGENTNÍ FILTRACE PRO RADARY
        // Hardware Radar (VideoCardz + HW kličová slova)
        setHwIntel(items.filter(i => 
          i.source === "VideoCardz" || 
          /rtx|amd|intel|cpu|gpu|blackwell|zen|core|benchmark|specs/i.test(i.title)
        ).slice(0, 10));

        // Gaming Radar (Wccftech + Gaming kličová slova)
        setGameIntel(items.filter(i => 
          i.source === "Wccftech" || 
          /gta|ps5|xbox|switch|game|launch|play|nintendo|sony/i.test(i.title)
        ).slice(0, 10));

        // Leaks & Rumors (Reddit + Chiphell)
        setLeaksIntel(items.filter(i => i.source === "Reddit Leaks" || i.source === "Chiphell").slice(0, 15));
        
        // 🧠 AI MOZEK STATUS
        if (json._debug?.ai_active) {
            setAiActive(true);
            setAiStatusMsg('ONLINE');
            addLog('GURU AI: Virální skórování dokončeno pomocí OpenAI.', 'success');
        } else {
            setAiStatusMsg(json._debug?.ai_status || 'ERROR');
            addLog(`AI Mozek: ${json._debug?.ai_status || 'nedostupný'}`, 'error');
        }
      }
    } catch (err) {
      addLog(`Kritická chyba enginu: ${err.message}`, 'error');
    } finally {
      setIntelLoading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center text-white p-6 font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      <form onSubmit={handleLogin} className="bg-[#111318] p-10 rounded-[40px] border border-orange-500/20 text-center max-w-sm w-full shadow-2xl relative z-10">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-600/40">
            <Lock size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black mb-2 mt-6 tracking-tighter uppercase italic">Guru Velín</h1>
        <p className="text-neutral-500 text-[10px] font-bold mb-8 uppercase tracking-widest">Master Authorization Required</p>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="HESLO GURU..." 
          className="w-full p-5 rounded-2xl bg-black border border-neutral-800 text-white mb-6 text-center focus:border-orange-500 transition-all outline-none text-xl tracking-[0.3em]" 
        />
        <button type="submit" className="w-full p-5 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/30 active:scale-95 uppercase">Vstoupit do Hubu</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0d0e12] border-r border-white/5 fixed h-screen p-8 flex flex-col z-20">
         <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Zap size={24} className="text-white" fill="currentColor" />
            </div>
            <div>
                <h2 className="text-xl font-black tracking-tighter leading-none">GURU</h2>
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Command Center</span>
            </div>
         </div>

         <nav className="space-y-4 flex-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-tight transition-all ${activeTab === 'dashboard' ? 'bg-purple-600/10 text-purple-500 border border-purple-600/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
                <LayoutDashboard size={18} /> Přehled
            </button>
            <button onClick={() => setActiveTab('intel-hub')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-tight transition-all ${activeTab === 'intel-hub' ? 'bg-orange-600/10 text-orange-500 border border-orange-600/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
                <Layers size={18} /> Intel Radar Hub
            </button>
         </nav>

         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-auto">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">System Stable</p>
            </div>
            <p className="text-xs font-black text-white">Guru Engine v9.4</p>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12 h-screen overflow-y-auto custom-scrollbar relative">
        {activeTab === 'intel-hub' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end mb-16">
               <div className="flex items-center gap-8">
                  <div className="p-5 bg-orange-600/10 rounded-3xl border border-orange-600/20 shadow-inner group transition-all">
                    <Cpu className="text-orange-500 group-hover:rotate-90 transition-transform duration-500" size={44} />
                  </div>
                  <div>
                    <h2 className="text-6xl font-black tracking-tighter leading-none mb-4 uppercase italic">Intel <span className="text-orange-500">Radar</span></h2>
                    <div className="flex items-center gap-3">
                        {/* 🧠 GURU AI BADGE */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${aiActive ? 'bg-green-600/10 text-green-500 border-green-600/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-red-600/10 text-red-500 border-red-600/30'}`}>
                           <Brain size={14} className={intelLoading ? 'animate-pulse' : ''} />
                           AI MOZEK: {aiActive ? 'ONLINE' : aiStatusMsg}
                        </div>
                        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                            Global Sync: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={fetchIntelFeed} 
                 disabled={intelLoading}
                 className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase flex items-center gap-4 hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50 group"
               >
                 <RefreshCw size={22} className={intelLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                 {intelLoading ? 'Analyzuji svět...' : 'Spustit globální sken'}
               </button>
            </header>

            <div className="grid grid-cols-1 gap-20 pb-40">
                {/* PILÍŘ 1: LEAKS & RUMORS */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-cyan-400 pl-6 py-2">
                        <Ghost className="text-cyan-400" size={36} />
                        <div>
                           <h3 className="font-black uppercase tracking-tighter text-3xl">Leaks & <span className="text-cyan-400 italic">Rumors</span></h3>
                           <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Underground Intelligence Radar</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {leaksIntel.length > 0 ? leaksIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-cyan-400/40 hover:shadow-[0_20px_50px_rgba(34,211,238,0.15)] transition-all group relative flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight">{item.source}</span>
                                    <div className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${item.viral_score > 80 ? 'bg-red-500 text-white animate-pulse' : 'bg-cyan-400 text-black'}`}>
                                        {item.viral_score}%
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                                <div className="mt-auto grid grid-cols-2 gap-3">
                                    <a href={item.link} target="_blank" className="py-3 bg-neutral-900 rounded-2xl text-[10px] font-black text-center text-neutral-500 hover:text-white border border-white/5 uppercase transition-all">Zdroj</a>
                                    <button className="py-3 bg-cyan-400/10 rounded-2xl text-[10px] font-black text-cyan-400 border border-cyan-400/20 uppercase hover:bg-cyan-400 hover:text-black transition-all">Koncept</button>
                                </div>
                            </div>
                        )) : (
                          <div className="col-span-full py-20 text-center text-neutral-800 font-black text-2xl uppercase italic border-2 border-dashed border-white/5 rounded-[40px]">Radar je prázdný. Spusť skenování.</div>
                        )}
                    </div>
                </section>

                {/* PILÍŘ 2: HARDWARE RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-orange-500 pl-6 py-2">
                        <Monitor className="text-orange-500" size={36} />
                        <div>
                           <h3 className="font-black uppercase tracking-tighter text-3xl">Hardware <span className="text-orange-500 italic">Radar</span></h3>
                           <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Silicon & Components Intelligence</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {hwIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-orange-500/40 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase">{item.source}</span>
                                    <div className="px-2.5 py-1 bg-orange-500 text-white rounded-lg font-black text-[11px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-orange-400 transition-colors">{item.title}</h4>
                                <button className="mt-auto w-full py-3.5 bg-orange-500/10 rounded-2xl text-[10px] font-black text-orange-500 border border-orange-500/20 uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all">Vytvořit článek</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PILÍŘ 3: GAMING RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-purple-500 pl-6 py-2">
                        <Play className="text-purple-500" size={36} />
                        <div>
                           <h3 className="font-black uppercase tracking-tighter text-3xl">Gaming <span className="text-purple-500 italic">Radar</span></h3>
                           <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Global Gaming Industry Trends</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {gameIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-purple-500/40 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase">{item.source}</span>
                                    <div className="px-2.5 py-1 bg-purple-500 text-white rounded-lg font-black text-[11px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-purple-400 transition-colors">{item.title}</h4>
                                <button className="mt-auto w-full py-3.5 bg-purple-500/10 rounded-2xl text-[10px] font-black text-purple-500 border border-purple-500/20 uppercase tracking-tighter hover:bg-purple-500 hover:text-white transition-all">Publikovat bleskovku</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
          </div>
        )}
      </main>

      {/* GURU FLOATING CONSOLE */}
      <div className="fixed bottom-8 right-8 w-96 bg-[#0d0e12]/95 backdrop-blur-2xl rounded-[30px] border border-white/10 shadow-2xl overflow-hidden z-50">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-3">
              <Terminal size={16} className="text-neutral-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">Guru System Console</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div className="p-6 h-56 overflow-y-auto space-y-3 font-mono text-[11px] custom-scrollbar">
           {consoleLogs.map((log, i) => (
             <div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-orange-400' : log.type === 'success' ? 'text-green-400' : 'text-neutral-500'} flex gap-3`}>
                <span className="opacity-30 flex-shrink-0">[{log.time}]</span>
                <span className="font-bold tracking-tight">{log.msg}</span>
             </div>
           ))}
           <div ref={logEndRef} />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
