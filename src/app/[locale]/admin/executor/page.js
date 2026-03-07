"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame, RefreshCw } from 'lucide-react';

/**
 * GURU ENGINE: Bezpečný přístup k environmentálním proměnným.
 * V prostředí prohlížeče (Canvas preview) nemusí být objekt 'process' definován.
 */
const getSafeEnv = (key) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || "";
    }
  } catch (e) {
    // Tichý fallback
  }
  return "";
};

// Načtení klíčů
const supabaseUrl = getSafeEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getSafeEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const webhookUrl = getSafeEnv('NEXT_PUBLIC_MAKE_WEBHOOK2_URL') || getSafeEnv('NEXT_PUBLIC_MAKE_WEBHOOK_URL');

/**
 * Dynamické importy s fallbackem.
 * Řeší chybu "Could not resolve", pokud knihovny nejsou v bundleru náhledu dostupné.
 */
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
  // Knihovny nejsou v tomto prostředí dostupné
}

// Inicializace klienta
const supabase = (createClient && supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : {
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    };

/**
 * Guru Social Executor - Lite & Powerful Edition
 * Správa slev, odesílání na Make.com a připínání na Homepage.
 */
export default function App() {
  const params = useParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });

  // Načtení dat z tabulky game_deals
  const fetchDeals = async () => {
    if (!createClient || !supabaseUrl) {
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

  /**
   * Toggle is_featured status (připnutí na Homepage)
   */
  const toggleFeatured = async (e, deal) => {
    e.stopPropagation();
    if (!createClient || !supabaseUrl) return;
    
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
      setStatus({ firing: false, success: false, error: "FAILED TO PIN!" });
    }
  };

  /**
   * Odeslání dat na Webhook (Make.com)
   */
  const fireToMake = async () => {
    if (!webhookUrl) {
      setStatus({ firing: false, success: false, error: "CHYBÍ WEBHOOK URL VE VERCELU!" });
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
      const response = await fetch(webhookUrl, {
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

  // ZÁCHRANNÁ BRZDA: Pokud proměnné vůbec nejsou v JS kontextu
  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-950/20 border border-red-500 p-10 rounded-[32px] backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h1 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter italic">Guru System Error!</h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Next.js v prohlížeči nevidí proměnné z Vercelu. Jsou buď špatně pojmenované, nebo jsi neudělal <strong>Redeploy</strong> po jejich přidání.
          </p>
          <div className="text-left bg-black/40 p-4 rounded-xl font-mono text-[10px] text-red-400 space-y-2 mb-8 uppercase tracking-widest border border-red-900/30">
             <div>URL: {supabaseUrl ? 'NALEZENO ✅' : 'CHYBÍ ❌'}</div>
             <div>KEY: {supabaseKey ? 'NALEZENO ✅' : 'CHYBÍ ❌'}</div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase text-xs tracking-widest">
            Zkusit znovu načíst
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-widest text-xl uppercase italic">Guru Scanning Deals...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111318]/95 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Rocket className="text-red-600" size={32} />
              Executor <span className="text-red-600">Lite</span>
            </h1>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              AUTOMATIZACE: 
              <span className={`px-2 py-0.5 rounded font-black ${webhookUrl ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {webhookUrl ? 'READY TO FIRE' : 'DISCONNECTED'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal || !webhookUrl}
            className={`relative z-10 px-12 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center gap-3 shadow-xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              (!selectedDeal || !webhookUrl) ? 'bg-neutral-800 opacity-40 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 active:scale-95 shadow-red-600/30'
            }`}
          >
            {status.firing ? 'POSÍLÁM...' : status.success ? <><Check /> ZÁSAH!</> : <><Send /> STŘELIT NA MAKE</>}
          </button>
        </header>

        {status.error && (
          <div className="mb-8 p-5 bg-red-950/40 border border-red-500/50 rounded-2xl text-red-500 text-xs font-black flex items-center gap-3 uppercase tracking-widest animate-pulse backdrop-blur-md">
            <AlertCircle size={20} /> {status.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
             <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em] flex items-center gap-3">
               Katalog Slev <span className="text-red-600">({deals.filter(d => d.is_featured).length}/3 Připnuto na HP)</span>
             </h2>
             <button onClick={fetchDeals} className="p-2 text-neutral-500 hover:text-white transition-all">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
          
          <div className="space-y-3">
            {!createClient ? (
                <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-black/20">
                    <div className="text-neutral-700 font-black uppercase tracking-[0.5em] mb-4">Režim náhledu</div>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase leading-relaxed tracking-widest">
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
                  : 'border-white/5 bg-[#111318]/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                    <img src={deal.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <div className={`font-black text-lg uppercase tracking-tight transition-colors ${selectedDeal?.id === deal.id ? 'text-white' : 'text-neutral-300'}`}>
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-red-500 font-black text-sm">{isEn ? deal.price_en : deal.price_cs}</span>
                      {deal.discount_code && (
                        <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest border border-pink-500/30 px-2 py-0.5 rounded bg-pink-500/5">
                          KÓD: {deal.discount_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => toggleFeatured(e, deal)}
                      title={deal.is_featured ? "Odepnout z Homepage" : "Připnout na Homepage"}
                      className={`p-3 rounded-xl transition-all ${
                        deal.is_featured 
                        ? 'bg-orange-600 text-white shadow-[0_0_25px_rgba(234,88,12,0.4)]' 
                        : 'bg-white/5 text-neutral-700 hover:text-white hover:bg-white/10'
                      }`}
                    >
                        <Flame size={20} fill={deal.is_featured ? "currentColor" : "none"} />
                    </button>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      selectedDeal?.id === deal.id ? 'bg-red-600 text-white rotate-90 scale-110' : 'bg-white/5 text-neutral-800 opacity-0 group-hover:opacity-100'
                    }`}>
                      <ChevronRight size={18} />
                    </div>
                </div>
              </div>
            )) : (
              <div className="p-24 text-center border-2 border-dashed border-white/5 rounded-[48px] bg-black/30 text-neutral-700 font-black uppercase tracking-[0.5em] mb-4">
                Databáze je Prázdná
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
