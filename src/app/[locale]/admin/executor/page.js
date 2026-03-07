"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame, RefreshCw, database } from 'lucide-react';

/**
 * GURU ENGINE: Přímý přístup k environmentálním proměnným.
 * V Next.js klientských komponentách musí být přístup k NEXT_PUBLIC_ proměnným DOSLOVNÝ,
 * aby je kompilátor mohl během buildu na Vercelu nahradit skutečnými hodnotami.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const MAKE_WEBHOOK = process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL || "";

// Dynamický import createClient (ošetření pro prostředí náhledu i produkce)
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  createClient = null;
}

/**
 * Inicializace klienta proběhne bezpečně. Pokud proměnné chybí, klient se nevytvoří,
 * což zabrání pádu aplikace (ReferenceError/TypeError), který způsoboval černou obrazovku.
 */
const supabase = (createClient && SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

/**
 * App komponenta - Guru Social Executor (Lite verze)
 * Nástroj pro výběr slev k odeslání na Make.com a připínání na Homepage.
 */
export default function App() {
  // Lokální detekce jazyka
  const [locale, setLocale] = useState('cs');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.includes('en')) setLocale('en');
    }
  }, []);

  const isEn = locale === 'en';

  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });

  // Funkce pro načtení dat z tabulky game_deals
  const fetchDeals = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus(prev => ({ ...prev, error: null }));

    try {
      const { data, error } = await supabase
        .from('game_deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeals(data || []);
      
      // Pokud máme data a nic není vybráno, vybereme první
      if (data && data.length > 0 && !selectedDeal) {
        setSelectedDeal(data[0]);
      }
    } catch (err) {
      console.error("Guru Data Error:", err);
      setStatus(prev => ({ 
        ...prev, 
        error: isEn ? `DB Error: ${err.message}` : `Chyba DB: ${err.message}` 
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [locale]);

  /**
   * Toggle is_featured (připnutí na Homepage)
   */
  const toggleFeatured = async (e, deal) => {
    e.stopPropagation();
    if (!supabase) return;
    
    const featuredCount = deals.filter(d => d.is_featured).length;
    
    if (!deal.is_featured && featuredCount >= 3) {
      setStatus({ 
        firing: false, 
        success: false, 
        error: isEn 
          ? "MAX 3 DEALS ON HOMEPAGE!" 
          : "MAXIMÁLNĚ 3 DEALY NA HOMEPAGE!" 
      });
      setTimeout(() => setStatus(prev => ({ ...prev, error: null })), 4000);
      return;
    }

    try {
      const { error } = await supabase
        .from('game_deals')
        .update({ is_featured: !deal.is_featured })
        .eq('id', deal.id);

      if (error) throw error;
      await fetchDeals(); 
    } catch (err) {
      setStatus({ firing: false, success: false, error: "UPDATE FAILED!" });
    }
  };

  /**
   * Odeslání dat na Make.com přes Webhook 2
   */
  const fireToMake = async () => {
    if (!MAKE_WEBHOOK) {
      setStatus({ firing: false, success: false, error: "CHYBÍ NEXT_PUBLIC_MAKE_WEBHOOK2_URL!" });
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
      const response = await fetch(MAKE_WEBHOOK, {
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

  // --- ZÁCHRANNÁ BRZDA: UI pro případ, že proměnné ve Vercelu nejsou dostupné pro JS ---
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-950/20 border border-red-500 p-10 rounded-[32px] backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h1 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter italic">Guru Konfigurace Chybí!</h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Next.js nemůže v kódu najít tvé environmentální proměnné. Ujisti se, že se ve Vercelu jmenují přesně takto a že jsou <strong>veřejně přístupné</strong> (NEXT_PUBLIC_ prefix):
          </p>
          <div className="text-left bg-black/40 p-5 rounded-xl font-mono text-[10px] text-red-400 space-y-3 mb-8 border border-red-500/20 tracking-widest">
            <div>NEXT_PUBLIC_SUPABASE_URL</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
            <div>NEXT_PUBLIC_MAKE_WEBHOOK2_URL</div>
          </div>
          <p className="text-xs text-neutral-500 mb-8 italic">Po úpravě proměnných musíš udělat "Redeploy" aktuálního buildu.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase text-xs tracking-[0.2em]"
          >
            Zkusit znovu načíst
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans selection:bg-red-600"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-5xl mx-auto">
        {/* HLAVNÍ OVLÁDACÍ PANEL */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111318]/95 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Rocket className="text-red-600" size={36} />
              Executor <span className="text-red-600">Lite</span>
            </h1>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              MAKE WEBHOOK 2: 
              <span className={`px-3 py-1 rounded-lg font-black ${MAKE_WEBHOOK ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                {MAKE_WEBHOOK ? 'READY TO FIRE' : 'DISCONNECTED'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal || !MAKE_WEBHOOK}
            className={`relative z-10 px-14 py-6 rounded-2xl font-black text-xl transition-all duration-300 flex items-center gap-4 shadow-2xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              (!selectedDeal || !MAKE_WEBHOOK) ? 'bg-neutral-800 opacity-40 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 hover:scale-[1.02] active:scale-95 shadow-red-600/30'
            }`}
          >
            {status.firing ? 'STŘÍLÍM...' : status.success ? <><Check size={24} /> ZÁSAH!</> : <><Send size={24} /> STŘELIT NA MAKE</>}
          </button>

          {/* Background dekorace pro Guru vibe */}
          <div className="absolute -right-16 -bottom-16 text-white/5 pointer-events-none transform rotate-12 scale-150 opacity-20">
            <Rocket size={240} />
          </div>
        </header>

        {status.error && (
          <div className="mb-8 p-6 bg-red-950/40 border border-red-500/50 rounded-[24px] text-red-500 text-xs font-black flex items-center gap-4 uppercase tracking-[0.2em] animate-pulse backdrop-blur-md">
            <AlertCircle size={24} /> {status.error}
          </div>
        )}

        {/* SEZNAM NABÍDEK */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-6">
             <h2 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.6em] flex items-center gap-3">
               KATALOG NABÍDEK 
               <span className="text-red-600">({deals.filter(d => d.is_featured).length}/3 PŘIPNUTO NA HP)</span>
             </h2>
             <button 
                onClick={fetchDeals} 
                className="p-3 text-neutral-500 hover:text-white transition-all bg-white/5 rounded-xl border border-white/5 hover:border-white/10"
             >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
                <div className="p-24 text-center text-neutral-600 font-black uppercase tracking-[0.4em] text-sm animate-pulse">
                    Guru Engine skenuje databázi...
                </div>
            ) : deals.length > 0 ? deals.map(deal => (
              <div 
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className={`group p-6 rounded-[32px] border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                  selectedDeal?.id === deal.id 
                  ? 'border-red-600 bg-red-600/10 shadow-[0_15px_45px_rgba(220,38,38,0.15)]' 
                  : 'border-white/5 bg-[#111318]/70 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-black shadow-2xl relative">
                    <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className={`absolute inset-0 transition-opacity duration-300 ${selectedDeal?.id === deal.id ? 'bg-red-600/10' : 'bg-transparent'}`}></div>
                  </div>
                  <div>
                    <div className={`font-black text-xl uppercase tracking-tight transition-colors duration-300 ${selectedDeal?.id === deal.id ? 'text-white' : 'text-neutral-300'}`}>
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-5 mt-2">
                      <span className="text-red-500 font-black text-lg tracking-tighter">{isEn ? deal.price_en : deal.price_cs}</span>
                      {deal.discount_code && (
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest border border-pink-500/30 px-3 py-1 rounded-lg bg-pink-500/5 shadow-inner">
                          CODE: {deal.discount_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* PLAMEN PRO HOMEPAGE (FEATURED TOGGLE) */}
                    <button 
                      onClick={(e) => toggleFeatured(e, deal)}
                      title={deal.is_featured ? "Odepnout z Homepage" : "Připnout na Homepage"}
                      className={`p-4 rounded-2xl transition-all duration-500 ${
                        deal.is_featured 
                        ? 'bg-orange-600 text-white shadow-[0_0_25px_rgba(234,88,12,0.5)] hover:scale-110' 
                        : 'bg-white/5 text-neutral-700 hover:text-white hover:bg-white/10'
                      }`}
                    >
                        <Flame size={24} fill={deal.is_featured ? "currentColor" : "none"} />
                    </button>
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      selectedDeal?.id === deal.id ? 'bg-red-600 text-white rotate-90 scale-125 shadow-xl shadow-red-600/20' : 'bg-white/5 text-neutral-800 opacity-0 group-hover:opacity-100'
                    }`}>
                      <ChevronRight size={20} />
                    </div>
                </div>
              </div>
            )) : (
              <div className="p-24 text-center border-2 border-dashed border-white/5 rounded-[48px] bg-black/30">
                <div className="text-neutral-700 font-black uppercase tracking-[0.5em] mb-6 text-xl italic">Databáze je Prázdná</div>
                <div className="max-w-md mx-auto space-y-4">
                    <p className="text-[11px] text-neutral-500 font-bold uppercase leading-relaxed tracking-widest">
                        Pokud v tabulce <strong>game_deals</strong> data máš, ale zde se neukazují, 
                        musíš v Supabase povolit veřejné čtení.
                    </p>
                    <div className="bg-black/50 p-6 rounded-2xl border border-white/5 text-left">
                        <p className="text-[9px] text-orange-500 font-black mb-3 uppercase tracking-widest">SQL FIX pro Supabase:</p>
                        <code className="text-[10px] text-neutral-400 font-mono break-all opacity-80">
                            CREATE POLICY "Povolit čtení" ON "public"."game_deals" FOR SELECT USING (true);
                        </code>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220,38,38,0.2); }
      `}</style>
    </div>
  );
}
