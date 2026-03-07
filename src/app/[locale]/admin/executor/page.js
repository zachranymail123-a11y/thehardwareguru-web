"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Send, Check, AlertCircle, ChevronRight, Flame } from 'lucide-react';

// Bezpečný getter pro environmentální proměnné, který předchází ReferenceError: process is not defined
const getEnvVar = (key) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
  } catch (e) {
    // Tichý fallback
  }
  return '';
};

// Pomocná funkce pro bezpečný import useParams z next/navigation
const useSafeParams = () => {
  try {
    const { useParams } = require('next/navigation');
    return useParams();
  } catch (e) {
    // Fallback pro lokální vývoj/preview
    return { locale: 'cs' };
  }
};

// Pomocná funkce pro bezpečné vytvoření Supabase klienta
const getSupabaseClient = () => {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    if (!url || !key) throw new Error("Missing config");
    return createClient(url, key);
  } catch (e) {
    // Mock klient pro prostředí, kde knihovna chybí nebo není konfigurace
    return {
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    };
  }
};

const supabase = getSupabaseClient();
const getMakeWebhook = () => getEnvVar('NEXT_PUBLIC_MAKE_WEBHOOK_URL');

export default function App() {
  const params = useSafeParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ firing: false, success: null, error: null });
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    setWebhookUrl(getMakeWebhook());
    fetchDeals();
  }, []);

  // Načtení dat přímo ze Supabase
  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('game_deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setDeals(data);
    } catch (err) {
      console.error("Guru Data Error:", err);
      setStatus(prev => ({ ...prev, error: "CHYBA SPOJENÍ S DATABÁZÍ!" }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 GURU FEATURE TOGGLE
   * Přepíná, zda má být deal zobrazen na Homepage (is_featured).
   */
  const toggleFeatured = async (e, deal) => {
    e.stopPropagation(); // Zabrání výběru dealu při kliku na plamen
    
    const featuredCount = deals.filter(d => d.is_featured).length;
    
    if (!deal.is_featured && featuredCount >= 3) {
      setStatus({ firing: false, success: false, error: "MAXIMÁLNĚ 3 DEALY NA HOMEPAGE!" });
      setTimeout(() => setStatus(prev => ({ ...prev, error: null })), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from('game_deals')
        .update({ is_featured: !deal.is_featured })
        .eq('id', deal.id);

      if (error) throw error;
      fetchDeals(); // Refresh seznamu
    } catch (err) {
      setStatus({ firing: false, success: false, error: "NEPOVEDLO SE AKTUALIZOVAT PŘIPNUTÍ!" });
    }
  };

  /**
   * 🚀 GURU FIRE TO MAKE
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
        throw new Error(`CHYBA MAKE.COM: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, success: false, error: err.message });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-widest text-xl uppercase">
        GURU ENGINE INITIALIZING...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pt-32 pb-20 px-4 font-sans"
         style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <div className="max-w-4xl mx-auto">
        {/* HORNÍ LIŠTA S AKCÍ */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111318]/90 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Rocket className="text-red-600" size={32} />
              Executor <span className="text-red-600">Lite</span>
            </h1>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
              Direct Link: <span className={webhookUrl ? 'text-green-500' : 'text-red-500'}>
                {webhookUrl ? 'CONNECTED TO MAKE' : 'DISCONNECTED'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={fireToMake}
            disabled={status.firing || !selectedDeal || !webhookUrl}
            className={`px-12 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center gap-3 shadow-xl ${
              status.success ? 'bg-green-600' :
              status.error ? 'bg-red-800' :
              (!selectedDeal || !webhookUrl) ? 'bg-neutral-800 opacity-40 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 active:scale-95'
            }`}
          >
            {status.firing ? 'STŘÍLÍM...' : status.success ? <><Check /> ZÁSAH!</> : <><Send /> ODESLAT NA MAKE</>}
          </button>
        </header>

        {status.error && (
          <div className="mb-8 p-5 bg-red-950/50 border border-red-500 rounded-2xl text-red-500 text-xs font-black flex items-center gap-3 uppercase tracking-widest">
            <AlertCircle size={20} /> {status.error}
          </div>
        )}

        {/* SEZNAM DEALŮ */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
             <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em]">
               KATALOG NABÍDEK ({deals.filter(d => d.is_featured).length}/3 PŘIPNUTO)
             </h2>
          </div>
          
          <div className="space-y-3">
            {deals.length > 0 ? deals.map(deal => (
              <div 
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className={`group p-5 rounded-[24px] border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                  selectedDeal?.id === deal.id 
                  ? 'border-red-600 bg-red-600/10 shadow-[0_0_40px_rgba(220,38,38,0.1)]' 
                  : 'border-white/5 bg-[#111318]/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                    <img src={deal.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-black text-lg uppercase tracking-tight group-hover:text-white transition-colors">
                        {deal.title}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-red-500 font-black text-sm">{isEn ? deal.price_en : deal.price_cs}</span>
                      {deal.discount_code && (
                        <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest border border-pink-500/30 px-2 py-0.5 rounded">
                          CODE: {deal.discount_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* PLAMEN PRO HOMEPAGE */}
                    <button 
                      onClick={(e) => toggleFeatured(e, deal)}
                      className={`p-3 rounded-xl transition-all ${
                        deal.is_featured 
                        ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]' 
                        : 'bg-white/5 text-neutral-700 hover:text-neutral-400'
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
              <div className="p-20 text-center border border-dashed border-white/5 rounded-[40px] text-neutral-800 font-black uppercase tracking-[0.3em]">
                Žádná data v databázi
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
