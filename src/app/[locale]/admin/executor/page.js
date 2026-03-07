"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame, RefreshCw } from 'lucide-react';

/**
 * GURU ENGINE: Bezpečný přístup k environmentálním proměnným.
 * V Next.js klientských komponentách musí být přístup k NEXT_PUBLIC_ proměnným doslovný.
 */
const getEnv = (key) => {
  try {
    // V Next.js klientském kódu jsou tyto hodnoty nahrazeny během buildu
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (key === 'NEXT_PUBLIC_MAKE_WEBHOOK2_URL') return process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL || "";
  } catch (e) {
    return "";
  }
  return "";
};

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const MAKE_WEBHOOK = getEnv('NEXT_PUBLIC_MAKE_WEBHOOK2_URL');

// Bezpečný import useParams a createClient pro prostředí náhledu
let useParams = () => ({ locale: 'cs' });
let createClient = null;

try {
  // Pokus o načtení Next.js navigace
  const nextNav = require('next/navigation');
  if (nextNav && nextNav.useParams) useParams = nextNav.useParams;
  
  // Pokus o načtení Supabase klienta
  const supabaseJs = require('@supabase/supabase-js');
  if (supabaseJs && supabaseJs.createClient) createClient = supabaseJs.createClient;
} catch (e) {
  // V náhledu knihovny chybí, použijeme mockování
}

// Inicializace Supabase klienta s ochranou
const supabase = (createClient && SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : {
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    };

/**
 * App komponenta - Guru Social Executor (Lite verze)
 * Čistý a efektivní nástroj pro distribuci slev.
 */
export default function App() {
  const params = useParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });

  // Načtení dat z databáze game_deals
  const fetchDeals = async () => {
    if (!supabase || !createClient) {
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

  const toggleFeatured = async (e, deal) => {
    e.stopPropagation();
    if (!supabase || !createClient) return;
    
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

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-950/20 border border-red-500 p-10 rounded-[32px] backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h1 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">Konfigurace nebyla načtena!</h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Next.js nevidí tvé proměnné ve Vercelu. Zkontroluj názvy a udělej <strong>Redeploy</strong>.
          </p>
          <div className="text-left bg-black/40 p-4 rounded-xl font-mono text-[10px] text-red-400 space-y-2 mb-8 uppercase tracking-widest border border-red-500/20">
            <div>NEXT_PUBLIC_SUPABASE_URL</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full px-6 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase text-xs tracking-widest shadow-lg shadow-red-600/20">
            Zkusit znovu načíst
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-widest text-xl uppercase italic">Guru Engine Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans selection:bg-red-600"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111318]/95 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Rocket className="text-red-600" size={32} />
              Executor <span className="text-red-600">Lite</span>
            </h1>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              MAKE WEBHOOK 2: 
              <span className={`px-2 py-0.5 rounded ${MAKE_WEBHOOK ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {MAKE_WEBHOOK ? 'READY TO FIRE' : 'DISCONNECTED'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal || !MAKE_WEBHOOK}
            className={`relative z-10 px-12 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center gap-3 shadow-xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              (!selectedDeal || !MAKE_WEBHOOK) ? 'bg-neutral-800 opacity-40 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 hover:scale-[1.02] active:scale-95 shadow-red-600/30'
            }`}
          >
            {status.firing ? 'STŘÍLÍM...' : status.success ? <><Check /> ZÁSAH!</> : <><Send /> ODESLAT NA MAKE</>}
          </button>

          <div className="absolute -right-10 -bottom-10 text-white/5 pointer-events-none transform rotate-12">
            <Rocket size={180} />
          </div>
        </header>

        {status.error && (
          <div className="mb-8 p-5 bg-red-950/40 border border-red-500/50 rounded-2xl text-red-500 text-xs font-black flex items-center gap-3 uppercase tracking-widest animate-pulse backdrop-blur-md">
            <AlertCircle size={20} /> {status.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
             <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.5em] flex items-center gap-3">
               KATALOG NABÍDEK 
               <span className="text-red-600">({deals.filter(d => d.is_featured).length}/3 PŘIPNUTO)</span>
             </h2>
             <button onClick={fetchDeals} className="p-2 text-neutral-500 hover:text-white transition-colors">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
          
          <div className="space-y-3">
            {!createClient ? (
                <div className="p-20 text-center border border-dashed border-white/5 rounded-[40px] bg-black/20">
                    <div className="text-neutral-700 font-black uppercase tracking-[0.3em] mb-4">Mód Náhledu</div>
                    <p className="text-[10px] text-neutral-600 max-w-xs mx-auto leading-relaxed uppercase">
                        Knihovny nejsou v tomto prostředí dostupné. Po nasazení na Vercel se zde zobrazí tvůj seznam slev.
                    </p>
                </div>
            ) : deals.length > 0 ? deals.map(deal => (
              <div 
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className={`group p-5 rounded-[24px] border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                  selectedDeal?.id === deal.id 
                  ? 'border-red-600 bg-red-600/10 shadow-[0_10px_30px_rgba(220,38,38,0.1)]' 
                  : 'border-white/5 bg-[#111318]/60 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black shadow-inner">
                    <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div>
                    <div className={`font-black text-lg uppercase tracking-tight transition-colors ${selectedDeal?.id === deal.id ? 'text-white' : 'text-neutral-300'}`}>
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-red-500 font-black text-sm">{isEn ? deal.price_en : deal.price_cs}</span>
                      {deal.discount_code && (
                        <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest border border-pink-500/30 px-2 py-0.5 rounded bg-pink-500/5">
                          CODE: {deal.discount_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => toggleFeatured(e, deal)}
                      title={deal.is_featured ? "Odepnout z Homepage" : "Připnout na Homepage"}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        deal.is_featured 
                        ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:bg-orange-500' 
                        : 'bg-white/5 text-neutral-700 hover:text-white hover:bg-white/10'
                      }`}
                    >
                        <Flame size={20} fill={deal.is_featured ? "currentColor" : "none"} />
                    </button>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      selectedDeal?.id === deal.id ? 'bg-red-600 text-white rotate-90 scale-110 shadow-lg' : 'bg-white/5 text-neutral-800 opacity-0 group-hover:opacity-100'
                    }`}>
                      <ChevronRight size={18} />
                    </div>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center border border-dashed border-white/5 rounded-[40px] bg-black/20">
                <div className="text-neutral-700 font-black uppercase tracking-[0.3em] mb-4">Databáze je prázdná nebo nepřístupná</div>
                <p className="text-[10px] text-neutral-600 max-w-xs mx-auto leading-relaxed uppercase">
                    Pokud v tabulce <strong>game_deals</strong> data máš, zkontroluj v Supabase 
                    nastavení <strong>RLS Policies</strong> pro veřejné čtení.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
