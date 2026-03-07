"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame } from 'lucide-react';

/**
 * GURU HELPER: Bezpečný přístup k ENV proměnným.
 * NEXT_PUBLIC_* proměnné jsou v Next.js automaticky dostupné na straně klienta.
 */
const getEnv = (key) => {
  if (typeof window !== 'undefined') {
    try {
      // Bezpečné načtení z process.env bez pádu v izolovaném prostředí
      return (typeof process !== 'undefined' && process.env) ? process.env[key] || '' : '';
    } catch (e) {
      return '';
    }
  }
  return '';
};

// Dynamické importy pro navigaci a Supabase
let useParams;
try { useParams = require('next/navigation').useParams; } catch (e) { useParams = () => ({ locale: 'cs' }); }

let createClient;
try { createClient = require('@supabase/supabase-js').createClient; } catch (e) {
  createClient = () => ({
    from: () => ({ 
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) })
    })
  });
}

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
);

// Webhook URL z tvého Vercelu
const MAKE_WEBHOOK = getEnv('NEXT_PUBLIC_MAKE_WEBHOOK_URL');

export default function App() {
  const params = useParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });

  // Funkce pro načtení čerstvých dat
  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('game_deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDeals(data);
      }
    } catch (err) {
      console.error("Guru Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  /**
   * 🔥 GURU FEATURE TOGGLE
   * Přepíná, zda má být deal zobrazen na Homepage (is_featured).
   * Omezeno na maximálně 3 kusy.
   */
  const toggleFeatured = async (deal) => {
    const featuredCount = deals.filter(d => d.is_featured).length;
    
    // Pokud chce připnout víc než 3, zastavíme ho
    if (!deal.is_featured && featuredCount >= 3) {
      setStatus({ firing: false, success: false, error: "MAXIMÁLNĚ 3 DEALY NA HOMEPAGE! NEJDŘÍV NĚJAKÝ OD-PINUJ." });
      setTimeout(() => setStatus(prev => ({ ...prev, error: null })), 4000);
      return;
    }

    const { error } = await supabase
      .from('game_deals')
      .update({ is_featured: !deal.is_featured })
      .eq('id', deal.id);

    if (!error) {
      // Okamžitý refresh lokálního stavu
      fetchDeals();
    } else {
      setStatus({ firing: false, success: false, error: "CHYBA PŘI AKTUALIZACI DATABÁZE!" });
    }
  };

  /**
   * 🚀 GURU FIRE TO MAKE
   * Odešle vybraný deal na Make.com webhook.
   */
  const fireToMake = async () => {
    if (!MAKE_WEBHOOK) {
      setStatus({ firing: false, success: false, error: "CHYBÍ WEBHOOK URL VE VERCELU!" });
      return;
    }
    if (!selectedDeal) {
      setStatus({ firing: false, success: false, error: "NEJDŘÍVE VYBER NABÍDKU ZE SEZNAMU!" });
      return;
    }

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
        throw new Error(`Webhook Error: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, success: false, error: err.message });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center text-orange-500 font-black animate-pulse uppercase italic">
      Guru Engine Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-[32px] border border-white/10 backdrop-blur-md shadow-2xl">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Rocket className="text-red-600" size={36} />
              Executor <span className="text-red-600">Lite</span>
            </h1>
            <p className="text-neutral-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">
              {isEn ? 'DEAL MANAGEMENT & AUTOMATION' : 'SPRÁVA A ODPALOVÁNÍ SLEV'}
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal}
            className={`px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 flex items-center gap-3 shadow-xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              !selectedDeal ? 'bg-neutral-800 opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 active:scale-95'
            }`}
          >
            {status.firing ? 'POSÍLÁM...' : status.success ? <><Check /> ZÁSAH!</> : <><Send /> ODESLAT</>}
          </button>
        </header>

        {status.error && (
          <div className="mb-8 p-5 bg-red-950/50 border border-red-500 rounded-2xl text-red-500 text-xs font-black flex items-center gap-3 uppercase tracking-widest">
            <AlertCircle size={20} /> {status.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
             <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em]">
               Katalog slev ({deals.filter(d => d.is_featured).length}/3 Připnuto)
             </h2>
          </div>
          
          <div className="space-y-3">
            {deals.map(deal => (
              <div 
                key={deal.id}
                className={`group p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between ${
                  selectedDeal?.id === deal.id 
                  ? 'border-red-600 bg-red-600/10 shadow-[0_0_30px_rgba(220,38,38,0.15)]' 
                  : 'border-white/5 bg-[#111318]/80'
                }`}
              >
                {/* Klikací část pro výběr */}
                <div className="flex items-center gap-6 cursor-pointer flex-1" onClick={() => setSelectedDeal(deal)}>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                    <img src={deal.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-black text-lg uppercase tracking-tight group-hover:text-white transition-colors">
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-red-500 font-black text-sm">{isEn ? deal.price_en : deal.price_cs}</span>
                    </div>
                  </div>
                </div>
                
                {/* Akční část (Pin & Status) */}
                <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleFeatured(deal)}
                      className={`p-3 rounded-xl transition-all ${
                        deal.is_featured 
                        ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' 
                        : 'bg-white/5 text-neutral-700 hover:text-neutral-400'
                      }`}
                      title={deal.is_featured ? "Odepnout z Homepage" : "Připnout na Homepage"}
                    >
                        <Flame size={20} fill={deal.is_featured ? "currentColor" : "none"} />
                    </button>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      selectedDeal?.id === deal.id ? 'bg-red-600 text-white rotate-90' : 'bg-white/5 text-neutral-800'
                    }`}>
                      <ChevronRight size={18} />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
