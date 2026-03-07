"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame, RefreshCw, Gamepad2 } from 'lucide-react';

/**
 * GURU SOCIAL EXECUTOR (DEALS EDITION)
 * Profesionální nástroj pro administraci slev a jejich odesílání na Make.com.
 * Synchronizováno s tabulkou 'game_deals'.
 */

// Inicializace Supabase mimo komponentu pro stabilitu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function App() {
  const params = useParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  // Stavy aplikace
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });

  // Konfigurace Webhooku
  const MAKE_WEBHOOK = process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL;

  // Funkce pro načtení slev
  const fetchDeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
      if (data && data.length > 0 && !selectedDeal) setSelectedDeal(data[0]);
    } catch (err) {
      console.error("Guru Sync Error:", err);
      setStatus(prev => ({ 
        ...prev, 
        error: isEn ? "DATABASE SYNC FAILED!" : "SYNCHRONIZACE S DB SELHALA!" 
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [locale]);

  // Funkce pro "vystřelení" na Make.com
  const fireToMake = async () => {
    if (!MAKE_WEBHOOK) {
      setStatus({ firing: false, success: false, error: "WEBHOOK 2 URL MISSING!" });
      return;
    }
    if (!selectedDeal) return;

    setStatus({ firing: true, success: null, error: null });

    // Payload upravený pro slevy (včetně slevových kódů)
    const payload = {
      id: selectedDeal.id,
      type: "game_deal",
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
        // Po úspěchu na chvíli zobrazíme Checkmark
        setTimeout(() => setStatus(prev => ({ ...prev, success: null })), 3000);
      } else {
        throw new Error(`MAKE STATUS: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, success: false, error: err.message });
    }
  };

  // Funkce pro přepínání připnutí na Homepage
  const toggleFeatured = async (e, deal) => {
    e.stopPropagation();
    const featuredCount = deals.filter(d => d.is_featured).length;
    
    if (!deal.is_featured && featuredCount >= 3) {
      setStatus({ 
        firing: false, 
        success: false, 
        error: isEn ? "MAX 3 DEALS ALLOWED!" : "MAXIMÁLNĚ 3 DEALY NA HP!" 
      });
      setTimeout(() => setStatus(prev => ({ ...prev, error: null })), 3000);
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

  if (loading) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-[0.6em] text-2xl uppercase italic">Guru Scanning Deals...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans selection:bg-orange-600"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-5xl mx-auto">
        {/* HLAVNÍ OVLÁDACÍ PANEL */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#111318]/95 p-10 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 text-white">
              <Rocket className="text-orange-500" size={40} />
              Deals <span className="text-orange-500 italic">Executor</span>
            </h1>
            <p className="text-neutral-500 font-black text-[11px] uppercase tracking-[0.4em] mt-3 flex items-center gap-3">
              TARGET: 
              <span className={`px-2 py-0.5 rounded ${MAKE_WEBHOOK ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                {MAKE_WEBHOOK ? 'WEBHOOK 2 READY' : 'URL MISSING'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal || !MAKE_WEBHOOK}
            className={`relative z-10 px-16 py-7 rounded-2xl font-black text-xl transition-all duration-500 flex items-center gap-4 shadow-2xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              (!selectedDeal || !MAKE_WEBHOOK) ? 'bg-neutral-800 opacity-40 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 hover:scale-[1.03] active:scale-95 shadow-orange-600/40'
            }`}
          >
            {status.firing ? 'PALBA...' : status.success ? <><Check size={28} /> ZÁSAH!</> : <><Send size={28} /> ODREPALOVAT</>}
          </button>
        </header>

        {/* CHYBOVÉ HLÁŠENÍ */}
        {status.error && (
          <div className="mb-10 p-6 bg-red-950/50 border border-red-500/50 rounded-[28px] text-red-500 text-xs font-black flex items-center gap-4 uppercase tracking-[0.2em] animate-bounce-short backdrop-blur-md shadow-2xl">
            <AlertCircle size={24} /> {status.error}
          </div>
        )}

        {/* KATALOG SLEV */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-6">
             <h2 className="text-[12px] font-black text-neutral-500 uppercase tracking-[0.7em] flex items-center gap-4">
               {isEn ? 'AVAILABLE DEALS' : 'KATALOG NABÍDEK'} 
               <span className="text-orange-500">({deals.length})</span>
             </h2>
             <button onClick={fetchDeals} className="p-3 text-neutral-500 hover:text-white transition-all bg-white/5 rounded-xl border border-white/5 hover:border-white/10 shadow-lg">
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
                  ? 'border-orange-500 bg-orange-500/10 shadow-[0_20px_50px_rgba(249,115,22,0.15)]' 
                  : 'border-white/5 bg-[#111318]/70 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-10">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-black shadow-inner relative group-hover:shadow-2xl transition-all duration-500">
                    <img src={deal.image_url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className={`absolute inset-0 transition-opacity duration-300 ${selectedDeal?.id === deal.id ? 'bg-orange-600/10' : 'bg-transparent'}`}></div>
                  </div>
                  <div className="max-w-xl">
                    <div className={`font-black text-2xl uppercase tracking-tighter transition-colors duration-500 truncate ${selectedDeal?.id === deal.id ? 'text-white' : 'text-neutral-400'}`}>
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-6 mt-3">
                      <span className="text-orange-500 font-black text-xl tracking-tight">
                        {isEn ? deal.price_en : deal.price_cs}
                      </span>
                      {deal.discount_code && (
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest border border-pink-500/30 px-3 py-1 rounded-lg bg-pink-500/5">
                          KÓD: {deal.discount_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button 
                      onClick={(e) => toggleFeatured(e, deal)}
                      title={isEn ? "Pin to HP" : "Připnout na HP"}
                      className={`p-5 rounded-2xl transition-all duration-500 ${
                        deal.is_featured 
                        ? 'bg-orange-600 text-white shadow-[0_0_35px_rgba(234,88,12,0.6)] hover:scale-110' 
                        : 'bg-white/5 text-neutral-800 hover:text-white hover:bg-white/10'
                      }`}
                    >
                        <Flame size={28} fill={deal.is_featured ? "currentColor" : "none"} />
                    </button>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 ${
                      selectedDeal?.id === deal.id ? 'bg-orange-600 text-white rotate-90 scale-125 shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'bg-white/5 text-neutral-800 opacity-0 group-hover:opacity-100'
                    }`}>
                      <ChevronRight size={24} />
                    </div>
                </div>
              </div>
            )) : (
              <div className="p-24 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-black/40 text-neutral-700 font-black uppercase tracking-[0.6em] mb-4 text-sm italic leading-relaxed">
                {isEn ? 'GURU SCANNING FOR DEALS...' : 'GURU SYSTÉMY SKENUJÍ NABÍDKY...'}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234,115,22,0.2); border-radius: 10px; }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short { animation: bounce-short 2s infinite; }
      `}</style>
    </div>
  );
}
