"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame, RefreshCw } from 'lucide-react';

/**
 * GURU ENGINE - ENVIRONMENT STABILIZER
 * V Next.js MUSÍME k NEXT_PUBLIC_ proměnným přistupovat naprosto přímo, 
 * jinak je kompilátor při buildu na Vercelu "nevidí" a vrací prázdný řetězec.
 */

// Pomocná funkce pro bezpečné získání proměnných bez ReferenceError: process is not defined
const getSafeEnv = (key) => {
  if (typeof window === 'undefined') return ''; // Server-side fallback
  try {
    // Přímé mapování pro Next.js kompilátor (literal replacement)
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (key === 'NEXT_PUBLIC_MAKE_WEBHOOK2_URL') return process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL || "";
  } catch (e) {}
  return "";
};

const SUPABASE_URL = getSafeEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = getSafeEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
// 🔥 GURU UPDATE: Používáme pouze Webhook 2, aby nedocházelo ke kolizím se starým scénářem
const MAKE_WEBHOOK = getSafeEnv('NEXT_PUBLIC_MAKE_WEBHOOK2_URL');

// Dynamický import knihoven pro kompatibilitu s Canvas náhledem i Vercel produkcí
let useParams = () => ({ locale: 'cs' });
let createClient = null;

try {
  const nextNav = require('next/navigation');
  if (nextNav && nextNav.useParams) useParams = nextNav.useParams;
  
  const supabaseJs = require('@supabase/supabase-js');
  if (supabaseJs && supabaseJs.createClient) createClient = supabaseJs.createClient;
} catch (e) {}

// Inicializace Supabase klienta proběhne pouze v produkci nebo s platnými klíči
const supabase = (createClient && SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

/**
 * Guru Social Executor
 * Profesionální nástroj pro administraci slev a automatizaci Make.com.
 */
export default function App() {
  const params = useParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });

  // Načtení dat přímo ze Supabase game_deals
  const fetchDeals = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
      console.error("Guru Sync Error:", err);
      setStatus(prev => ({ ...prev, error: isEn ? "DB CONNECTION FAILED!" : "CHYBA SPOJENÍ S DATABÁZÍ!" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [locale]);

  // Přepínání připnutí na Homepage (Featured)
  const toggleFeatured = async (e, deal) => {
    e.stopPropagation();
    if (!supabase) return;
    
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
      const { error } = await supabase
        .from('game_deals')
        .update({ is_featured: !deal.is_featured })
        .eq('id', deal.id);

      if (error) throw error;
      fetchDeals(); 
    } catch (err) {
      setStatus({ firing: false, success: false, error: "UPDATE FAILED!" });
    }
  };

  // Odpálení na Make.com scénář
  const fireToMake = async () => {
    if (!MAKE_WEBHOOK) {
      setStatus({ firing: false, success: false, error: "CHYBÍ WEBHOOK 2 URL VE VERCELU!" });
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
        throw new Error(`WEBHOOK ERROR: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, success: false, error: err.message });
    }
  };

  // --- GURU SYSTEM DIAGNOSTICS ---
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-950/20 border border-red-500 p-10 rounded-[32px] backdrop-blur-xl shadow-2xl">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter italic">Guru System Error!</h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8 font-medium">
            Next.js v prohlížeči nevidí proměnné z Vercelu. I když je máš v nastavení, musíš provést <strong>Redeploy</strong> (nebo nový Git Push), aby se hodnoty fyzicky "vypálily" do JavaScriptu.
          </p>
          <div className="text-left bg-black/40 p-5 rounded-xl font-mono text-[10px] text-red-400 space-y-3 mb-8 border border-red-900/30 tracking-widest uppercase">
             <div className="flex justify-between"><span>URL:</span> <span className="font-bold">{SUPABASE_URL ? 'NALEZENO ✅' : 'CHYBÍ ❌'}</span></div>
             <div className="flex justify-between"><span>KEY:</span> <span className="font-bold">{SUPABASE_ANON_KEY ? 'NALEZENO ✅' : 'CHYBÍ ❌'}</span></div>
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
      <div className="text-orange-500 font-black animate-pulse tracking-[0.5em] text-xl uppercase italic">Guru Scanning Catalyst...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111318]/95 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
              <Rocket className="text-red-600" size={32} />
              Executor <span className="text-red-600">Lite</span>
            </h1>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              AUTOMATIZACE: 
              <span className={`px-2 py-0.5 rounded font-black ${MAKE_WEBHOOK ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {MAKE_WEBHOOK ? 'WEBHOOK 2 READY' : 'WEBHOOK 2 DISCONNECTED'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal || !MAKE_WEBHOOK}
            className={`relative z-10 px-12 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center gap-3 shadow-xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              (!selectedDeal || !MAKE_WEBHOOK) ? 'bg-neutral-800 opacity-40 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 active:scale-95 shadow-red-600/30'
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
               KATALOG SLEV <span className="text-red-600">({deals.filter(d => d.is_featured).length}/3 PŘIPNUTO)</span>
             </h2>
             <button onClick={fetchDeals} className="p-2 text-neutral-500 hover:text-white transition-all">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
          
          <div className="space-y-3">
            {deals.length > 0 ? deals.map(deal => (
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
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black shadow-inner">
                    <img src={deal.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <div className={`font-black text-lg uppercase tracking-tight transition-colors ${selectedDeal?.id === deal.id ? 'text-white' : 'text-neutral-300'}`}>
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-red-500 font-black text-sm">{isEn ? deal.price_en : deal.price_cs}</span>
                      {deal.discount_code && (
                        <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest border border-pink-500/30 px-2 py-0.5 rounded bg-pink-500/5 shadow-sm">
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
                        ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]' 
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
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-black/20">
                <div className="text-neutral-700 font-black uppercase tracking-[0.3em] mb-4 text-sm">Prázdná Databáze</div>
                <p className="text-[10px] text-neutral-600 max-w-xs mx-auto leading-relaxed">
                    Pokud v tabulce <strong>game_deals</strong> data máš, zkontroluj RLS v Supabase.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
