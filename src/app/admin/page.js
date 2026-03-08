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
 * GURU ULTIMATE COMMAND CENTER V9.3
 * - Opravena chyba kompilace odstraněním nedostupné knihovny Supabase.
 * - Zachována logika přihlášení a správy dat přes Intel Engine.
 * - Plná integrace AI Status Badge pro monitoring skórování.
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
    // 🛡️ GURU UI SHIELD: Ochrana proti pádům způsobeným nefunkčním SWG skriptem
    if (typeof window !== 'undefined' && window.swgSubscriptions && !window.swgSubscriptions.attachButton) {
        window.swgSubscriptions.attachButton = () => { console.warn("SWG bypass: attachButton is missing."); };
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'Wifik500') {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
      addLog('Přihlášení úspěšné. Vítej zpět, Guru.', 'success');
    } else {
      addLog('Nesprávné heslo! Přístup odepřen.', 'error');
    }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    setAiActive(false);
    addLog('Skenuji globální sítě (V9.1 Backend)...', 'warning');
    
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      
      if (json.success) {
        const items = json.data || [];
        
        // 🚀 FILTRACE PRO RADARY DLE ZDROJŮ A OBSAHU
        setHwIntel(items.filter(i => 
          i.source === "VideoCardz" || 
          i.source === "Tom's Hardware" ||
          (i.source === "Wccftech" && /rtx|amd|intel|cpu|gpu|gpu|ti|leak|blackwell/i.test(i.title))
        ).slice(0, 10));

        setGameIntel(items.filter(i => 
          i.source === "IGN" || 
          i.source === "Gamespot" ||
          (i.source === "Wccftech" && !/rtx|amd|intel|cpu|gpu/i.test(i.title)) ||
          (i.source === "Reddit Leaks" && /gta|ps5|xbox|switch|game|launch|play/i.test(i.title))
        ).slice(0, 10));

        setLeaksIntel(items.filter(i => i.source === "Reddit Leaks" || i.source === "Chiphell").slice(0, 15));
        
        // 🧠 SYNCHRONIZACE AI STAVU
        if (json._debug?.ai_active) {
            setAiActive(true);
            setAiStatusMsg('ONLINE');
            addLog('GURU AI: Trendy úspěšně ohodnoceny.', 'success');
        } else {
            setAiStatusMsg(json._debug?.ai_status || 'OFFLINE');
            addLog(`AI Mozek: ${json._debug?.ai_status || 'chyba komunikace'}`, 'error');
        }
      }
    } catch (err) {
      addLog(`Chyba Intel Enginu: ${err.message}`, 'error');
    } finally {
      setIntelLoading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center text-white p-6">
      <form onSubmit={handleLogin} className="bg-[#111318] p-10 rounded-[40px] border border-[#eab30833] text-center max-w-sm w-full shadow-2xl relative overflow-hidden">
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
        <button type="submit" className="w-full p-5 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/30 active:scale-95 uppercase tracking-tighter">Vstoupit do systému</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex font-sans">
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
                <LayoutDashboard size={18} /> Přehled Systému
            </button>
            <button onClick={() => setActiveTab('intel-hub')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-tight transition-all ${activeTab === 'intel-hub' ? 'bg-orange-600/10 text-orange-500 border border-orange-600/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
                <Layers size={18} /> Intel Radar Hub
            </button>
         </nav>

         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-auto">
            <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Aktuální verze</p>
            <p className="text-xs font-black text-white">Guru Master v9.3</p>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12 overflow-y-auto">
        {activeTab === 'intel-hub' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end mb-16">
               <div className="flex items-center gap-8">
                  <div className="p-5 bg-orange-600/10 rounded-3xl border border-orange-600/20 shadow-inner group transition-all">
                    <Cpu className="text-orange-500 group-hover:scale-110 transition-transform" size={40} />
                  </div>
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter leading-none mb-4">Intel <span className="text-orange-500 italic">Radar</span></h2>
                    <div className="flex items-center gap-3">
                        {/* 🧠 GURU AI BADGE - DYNAMICKÝ STAV */}
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${aiActive ? 'bg-green-600/10 text-green-500 border-green-600/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-red-600/10 text-red-500 border-red-600/30'}`}>
                           <Brain size={14} className={intelLoading ? 'animate-pulse' : ''} />
                           AI MOZEK: {aiActive ? 'ONLINE' : aiStatusMsg || 'OFFLINE'}
                        </div>
                        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-neutral-400 uppercase tracking-widest">
                            Sync: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={fetchIntelFeed} 
                 disabled={intelLoading}
                 className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase flex items-center gap-3 hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50 group"
               >
                 <RefreshCw size={20} className={`${intelLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                 {intelLoading ? 'Analýza světa...' : 'Spustit globální sken'}
               </button>
            </header>

            <div className="space-y-20">
                {/* PILÍŘ 1: LEAKS & RUMORS */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-cyan-400 pl-6 py-2">
                        <Ghost className="text-cyan-400" size={32} />
                        <div>
                           <h3 className="font-black uppercase tracking-tighter text-2xl">Leaks & <span className="text-cyan-400 italic">Rumors</span></h3>
                           <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Šeptanda ze zákulisí a úniky z Reddit / Chiphell</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {leaksIntel.length > 0 ? leaksIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-cyan-400/40 hover:shadow-[0_15px_40px_rgb(34,211,238,0.15)] transition-all group relative">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight">{item.source}</span>
                                    <div className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${item.viral_score > 80 ? 'bg-red-500 text-white animate-pulse' : 'bg-cyan-400 text-black'}`}>
                                        {item.viral_score}%
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <a href={item.link} target="_blank" className="py-3 bg-neutral-900 rounded-2xl text-[10px] font-black text-center text-neutral-500 hover:text-white border border-white/5 transition-all">ZDROJ</a>
                                    <button className="py-3 bg-cyan-400/10 rounded-2xl text-[10px] font-black text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400 hover:text-black transition-all">DETAIL</button>
                                </div>
                            </div>
                        )) : (
                          <div className="col-span-full py-20 text-center text-neutral-700 font-black text-xl uppercase italic opacity-30">
                            Radar Leaks je zatím prázdný...
                          </div>
                        )}
                    </div>
                </section>

                {/* PILÍŘ 2: HARDWARE RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-orange-500 pl-6 py-2">
                        <Monitor className="text-orange-500" size={32} />
                        <div>
                           <h3 className="font-black uppercase tracking-tighter text-2xl">Hardware <span className="text-orange-500 italic">Radar</span></h3>
                           <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Křemík, čipy a komponenty pod drobnohledem</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {hwIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-orange-500/40 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase">{item.source}</span>
                                    <div className="px-2.5 py-1 bg-orange-500 text-white rounded-lg font-black text-[11px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-orange-400 transition-colors">{item.title}</h4>
                                <button className="w-full py-3 bg-orange-500/10 rounded-2xl text-[10px] font-black text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all uppercase tracking-tighter">Vytvořit článek</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PILÍŘ 3: GAMING RADAR */}
                <section>
                    <div className="flex items-center gap-4 mb-10 border-l-8 border-purple-500 pl-6 py-2">
                        <Play className="text-purple-500" size={32} />
                        <div>
                           <h3 className="font-black uppercase tracking-tighter text-2xl">Gaming <span className="text-purple-500 italic">Radar</span></h3>
                           <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Svět her, konzolí a digitální zábavy</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pb-24">
                        {gameIntel.map((item, i) => (
                            <div key={i} className="bg-[#111318] p-6 rounded-[35px] border border-white/5 hover:border-purple-500/40 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase">{item.source}</span>
                                    <div className="px-2.5 py-1 bg-purple-500 text-white rounded-lg font-black text-[11px]">{item.viral_score}%</div>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-8 h-16 overflow-hidden group-hover:text-purple-400 transition-colors">{item.title}</h4>
                                <button className="w-full py-3 bg-purple-500/10 rounded-2xl text-[10px] font-black text-purple-500 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all uppercase tracking-tighter">Vytvořit bleskovku</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
          </div>
        )}
      </main>

      {/* GURU FLOATING LOGS */}
      <div className="fixed bottom-8 right-8 w-96 bg-[#0d0e12]/90 backdrop-blur-2xl rounded-[30px] border border-white/10 shadow-2xl overflow-hidden z-50">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-3">
              <Terminal size={16} className="text-neutral-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">Guru Console</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div className="p-6 h-48 overflow-y-auto space-y-2.5 font-mono text-[11px]">
           {consoleLogs.map((log, i) => (
             <div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-orange-400' : log.type === 'success' ? 'text-green-400' : 'text-neutral-500'}`}>
                <span className="opacity-40 mr-3">[{log.time}]</span>
                <span className="font-bold tracking-tight">{log.msg}</span>
             </div>
           ))}
           <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
