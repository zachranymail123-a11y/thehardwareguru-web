"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame, RefreshCw } from 'lucide-react';

/**
 * GURU SUPREME EXECUTOR - CSP-SAFE & STABLE EDITION
 * Tento komponent využívá "Data Bridge" (div#guru-env-bridge) k získání konfigurace.
 * Tato metoda obchází problémy s Content Security Policy (CSP) a nespolehlivým inliningem proměnných.
 */

// Dynamické importy pro kompatibilitu s prostředím Vercelu a lokálním vývojem
// Pokud prostředí náhledu (sandbox) nemůže moduly najít, použijeme bezpečné handlování
let useParams = () => ({ locale: 'cs' });
let createClient = null;

// Pokusíme se bezpečně načíst moduly bez použití varovné funkce eval
try {
  // Tyto moduly jsou standardní součástí Next.js a Supabase projektů
  const nextNav = require('next/navigation');
  if (nextNav && nextNav.useParams) useParams = nextNav.useParams;
  
  const supabaseJs = require('@supabase/supabase-js');
  if (supabaseJs && supabaseJs.createClient) createClient = supabaseJs.createClient;
} catch (e) {
  // Moduly nejsou v tomto konkrétním prostředí dostupné, použijeme fallbacky výše
  console.log("Informace: Některé moduly jsou dostupné až po nasazení do reálného projektu.");
}

export default function App() {
  const params = useParams() || { locale: 'cs' };
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });
  const [supabaseClient, setSupabaseClient] = useState(null);
  
  // Stav pro uložení konfigurace prostředí
  const [env, setEnv] = useState({ 
    url: '', 
    key: '', 
    webhook: '', 
    isLoaded: false 
  });

  /**
   * 🛡️ GURU DATA BRIDGE RESOLVER
   * Čte data z HTML elementu, který server vypsal v layout.js.
   * Tato metoda je plně kompatibilní s CSP a řeší problém se statickým nahrazováním proměnných.
   */
  const getEnvFromBridge = () => {
    if (typeof window === 'undefined') return { url: '', key: '', webhook: '' };
    
    const bridge = document.getElementById('guru-env-bridge');
    if (!bridge) {
      return { url: '', key: '', webhook: '' };
    }

    return {
      url: bridge.getAttribute('data-url') || '',
      key: bridge.getAttribute('data-key') || '',
      webhook: bridge.getAttribute('data-webhook') || ''
    };
  };

  useEffect(() => {
    const bootstrap = async () => {
      // 1. Vyzvednutí dat z mostu (Bridge)
      const config = getEnvFromBridge();
      
      // 2. Příprava finálních hodnot s fallbackem na standardní process.env
      const finalUrl = config.url || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : "");
      const finalKey = config.key || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : "");
      const finalWebhook = config.webhook || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL : "");

      setEnv({ url: finalUrl, key: finalKey, webhook: finalWebhook, isLoaded: true });

      // 3. Inicializace Supabase klienta
      if (finalUrl && finalKey && createClient) {
        try {
          const client = createClient(finalUrl, finalKey);
          setSupabaseClient(client);
          
          const { data, error } = await client
            .from('game_deals')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setDeals(data || []);
          if (data && data.length > 0) setSelectedDeal(data[0]);
        } catch (err) {
          console.error("Guru Sync Error:", err);
          setStatus(prev => ({ 
            ...prev, 
            error: isEn ? "DATABASE CONNECTION FAILED!" : "SPOJENÍ S DATABÁZÍ SELHALO!" 
          }));
        }
      }
      setLoading(false);
    };

    // Čekáme na kompletní vykreslení DOMu
    const timer = setTimeout(bootstrap, 200);
    return () => clearTimeout(timer);
  }, [locale]);

  const handleRefresh = async () => {
    if (!supabaseClient) return;
    setLoading(true);
    try {
      const { data } = await supabaseClient
        .from('game_deals')
        .select('*')
        .order('created_at', { ascending: false });
      setDeals(data || []);
    } catch (e) {}
    setLoading(false);
  };

  const toggleFeatured = async (e, deal) => {
    e.stopPropagation();
    if (!supabaseClient) return;
    
    const featuredCount = deals.filter(d => d.is_featured).length;
    if (!deal.is_featured && featuredCount >= 3) {
      setStatus({ 
        firing: false, 
        success: false, 
        error: isEn ? "MAX 3 DEALS ON HOMEPAGE!" : "MAXIMÁLNĚ 3 DEALY NA HOMEPAGE!" 
      });
      setTimeout(() => setStatus(prev => ({ ...prev, error: null })), 4000);
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('game_deals')
        .update({ is_featured: !deal.is_featured })
        .eq('id', deal.id);

      if (error) throw error;
      handleRefresh(); 
    } catch (err) {
      setStatus({ firing: false, success: false, error: "UPDATE FAILED!" });
    }
  };

  const fireToMake = async () => {
    if (!env.webhook) {
      setStatus({ firing: false, success: false, error: isEn ? "WEBHOOK MISSING!" : "CHYBÍ WEBHOOK!" });
      return;
    }
    if (!selectedDeal) return;

    setStatus({ firing: true, success: null, error: null });

    const payload = {
      id: selectedDeal.id,
      title: selectedDeal.title,
      price: isEn ? selectedDeal.price_en : selectedDeal.price_cs,
      link: selectedDeal.affiliate_link,
      image: selectedDeal.image_url,
      code: selectedDeal.discount_code || "N/A",
      description: isEn ? selectedDeal.description_en : selectedDeal.description_cs,
      locale: locale,
      fired_at: new Date().toISOString()
    };

    try {
      const response = await fetch(env.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus({ firing: false, success: true, error: null });
        setTimeout(() => setStatus(prev => ({ ...prev, success: null })), 3000);
      } else {
        throw new Error(`MAKE.COM ERROR: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, success: false, error: err.message });
    }
  };

  // --- DIAGNOSTIKA ---
  if (!loading && env.isLoaded && (!env.url || !env.key)) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-950/20 border border-red-500 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-black text-white uppercase mb-4 italic tracking-tighter">Bridge Diagnosis</h2>
          <p className="text-neutral-400 text-sm mb-8 leading-relaxed font-bold uppercase tracking-widest">
            Kód je připraven k nasazení. Pokud v produkci vidíš tuto zprávu, zkontroluj konfiguraci Vercelu a vypni build cache.
          </p>
          <div className="text-left bg-black/50 p-5 rounded-2xl font-mono text-[10px] space-y-3 mb-8 border border-red-900/30">
            <div className="flex justify-between uppercase"><span>Bridge Status:</span> <span className={typeof document !== 'undefined' && document.getElementById('guru-env-bridge') ? "text-green-500" : "text-red-500"}>{typeof document !== 'undefined' && document.getElementById('guru-env-bridge') ? "DETECTED ✅" : "NOT FOUND ❌"}</span></div>
            <div className="flex justify-between uppercase"><span>Keys:</span> <span className={env.url ? "text-green-500" : "text-red-500"}>{env.url ? "INJECTED ✅" : "WAITING ❌"}</span></div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase text-xs tracking-widest shadow-lg shadow-red-600/30">
            Obnovit Guru Systém
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-[0.6em] text-2xl uppercase italic">Guru System Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-5xl mx-auto">
        {/* HLAVNÍ HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#111318]/95 p-10 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 text-white">
              <Rocket className="text-red-600" size={40} />
              Executor <span className="text-red-600 italic">Lite</span>
            </h1>
            <p className="text-neutral-500 font-black text-[11px] uppercase tracking-[0.4em] mt-3 flex items-center gap-3">
              BRIDGE STATUS: 
              <span className={`px-2 py-0.5 rounded ${env.webhook ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                {env.webhook ? 'NUCLEAR READY' : 'DISCONNECTED'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal || !env.webhook}
            className={`relative z-10 px-16 py-7 rounded-2xl font-black text-xl transition-all duration-500 flex items-center gap-4 shadow-2xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              (!selectedDeal || !env.webhook) ? 'bg-neutral-800 opacity-40 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 hover:scale-[1.03] active:scale-95 shadow-red-600/40'
            }`}
          >
            {status.firing ? 'PALBA...' : status.success ? <><Check size={28} /> ZÁSAH!</> : <><Send size={28} /> ODESLAT NA MAKE</>}
          </button>
        </header>

        {status.error && (
          <div className="mb-10 p-6 bg-red-950/50 border border-red-500/50 rounded-[28px] text-red-500 text-xs font-black flex items-center gap-4 uppercase tracking-[0.2em] animate-bounce-short backdrop-blur-md shadow-2xl">
            <AlertCircle size={24} /> {status.error}
          </div>
        )}

        <div className="space-y-5">
          <div className="flex justify-between items-center px-6">
             <h2 className="text-[12px] font-black text-neutral-500 uppercase tracking-[0.7em] flex items-center gap-4">
               {isEn ? 'DEALS CATALOG' : 'KATALOG NABÍDEK'} 
               <span className="text-red-600">({deals.filter(d => d.is_featured).length}/3 PINNED)</span>
             </h2>
             <button onClick={handleRefresh} className="p-3 text-neutral-500 hover:text-white transition-all bg-white/5 rounded-xl border border-white/5 hover:border-white/10 shadow-lg">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
          
          <div className="space-y-4">
            {deals.length > 0 ? deals.map(deal => (
              <div 
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className={`group p-6 rounded-[36px] border transition-all duration-500 flex items-center justify-between cursor-pointer ${
                  selectedDeal?.id === deal.id 
                  ? 'border-red-600 bg-red-600/10 shadow-[0_20px_50px_rgba(220,38,38,0.15)]' 
                  : 'border-white/5 bg-[#111318]/70 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-10">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-black shadow-inner relative group-hover:shadow-2xl transition-all duration-500">
                    <img src={deal.image_url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className={`absolute inset-0 transition-opacity duration-500 ${selectedDeal?.id === deal.id ? 'bg-red-600/10' : 'bg-transparent'}`}></div>
                  </div>
                  <div>
                    <div className={`font-black text-2xl uppercase tracking-tighter transition-colors duration-500 ${selectedDeal?.id === deal.id ? 'text-white' : 'text-neutral-400'}`}>
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-6 mt-3">
                      <span className="text-red-500 font-black text-xl tracking-tight">{isEn ? deal.price_en : deal.price_cs}</span>
                      {deal.discount_code && (
                        <span className="text-[11px] font-black text-pink-500 uppercase tracking-[0.2em] border border-pink-500/30 px-4 py-1.5 rounded-full bg-pink-500/5 shadow-inner">
                          {isEn ? 'CODE' : 'KÓD'}: {deal.discount_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button onClick={(e) => toggleFeatured(e, deal)} title={deal.is_featured ? "Odepnout" : "Připnout"}
                      className={`p-5 rounded-2xl transition-all duration-500 ${deal.is_featured ? 'bg-orange-600 text-white shadow-[0_0_35px_rgba(234,88,12,0.6)] hover:scale-110' : 'bg-white/5 text-neutral-800 hover:text-white hover:bg-white/10'}`}
                    >
                        <Flame size={28} fill={deal.is_featured ? "currentColor" : "none"} />
                    </button>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 ${selectedDeal?.id === deal.id ? 'bg-red-600 text-white rotate-90 scale-125 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-white/5 text-neutral-800 opacity-0 group-hover:opacity-100'}`}>
                      <ChevronRight size={24} />
                    </div>
                </div>
              </div>
            )) : (
              <div className="p-24 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-black/40 text-neutral-700 font-black uppercase tracking-[0.6em] mb-4 text-sm italic leading-relaxed">
                {isEn ? 'NO DATA FOUND IN DATABASE' : 'V DATABÁZI NEBYLA NALEZENA ŽÁDNÁ DATA'}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
