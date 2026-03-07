"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

// Inicializace Supabase klienta pro frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminAddDeal() {
  const params = useParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  // Stav formuláře
  const [formData, setFormData] = useState({
    title: '',
    description_cs: '',
    description_en: '',
    price_cs: '',
    price_en: '',
    image_url: '',
    affiliate_link: ''
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  // Zpracování změn v políčkách
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Odeslání formuláře do databáze
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    const { error } = await supabase
      .from('game_deals')
      .insert([formData]);

    if (error) {
      console.error("Chyba při ukládání:", error);
      setStatus({ loading: false, error: error.message, success: false });
    } else {
      setStatus({ loading: false, error: null, success: true });
      // Vyčištění formuláře po úspěšném přidání
      setFormData({
        title: '', description_cs: '', description_en: '', price_cs: '', price_en: '', image_url: '', affiliate_link: ''
      });
      // Skrytí hlášky o úspěchu po 3 vteřinách
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);
    }
  };

  // Texty administrace podle jazyka (Guru style)
  const t = {
    title: isEn ? "Add New Game Deal" : "Přidat novou slevu na hru",
    gameName: isEn ? "Game Title" : "Název hry",
    imgUrl: isEn ? "Image URL" : "URL obrázku (Odkaz)",
    link: isEn ? "HRK Affiliate Link" : "HRK Affiliate Odkaz",
    priceCs: isEn ? "Price (CZ - e.g. 1 100 Kč)" : "Cena (CZ - např. 1 100 Kč)",
    priceEn: isEn ? "Price (EN - e.g. 45 €)" : "Cena (EN - např. 45 €)",
    descCs: isEn ? "Short description (CZ)" : "Krátký popis (CZ)",
    descEn: isEn ? "Short description (EN)" : "Krátký popis (EN)",
    saveBtn: isEn ? "Save Deal" : "Uložit slevu",
    saving: isEn ? "Saving..." : "Ukládám...",
    success: isEn ? "Deal added successfully!" : "Sleva byla úspěšně přidána!",
    errorMsg: isEn ? "Error saving deal." : "Chyba při ukládání slevy."
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-neutral-900 p-8 rounded-2xl shadow-xl border border-neutral-800">
        
        <h1 className="text-3xl font-black text-white mb-8 border-b border-neutral-800 pb-4">
          <span className="text-orange-500">🔥</span> {t.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Název hry a Obrázek */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t.gameName} *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                placeholder="Např. Cyberpunk 2077"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t.imgUrl}</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* HRK Affiliate Link */}
          <div>
            <label className="block text-sm font-bold text-orange-500 mb-2">{t.link} *</label>
            <input
              type="url"
              name="affiliate_link"
              required
              value={formData.affiliate_link}
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-orange-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              placeholder="https://www.hrkgame.com/cs/games/.../?ref=thehardwareguru"
            />
          </div>

          {/* Ceny (CZ a EN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t.priceCs}</label>
              <input
                type="text"
                name="price_cs"
                value={formData.price_cs}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t.priceEn}</label>
              <input
                type="text"
                name="price_en"
                value={formData.price_en}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Popisky (CZ a EN) */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t.descCs}</label>
              <textarea
                name="description_cs"
                rows="3"
                value={formData.description_cs}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">{t.descEn}</label>
              <textarea
                name="description_en"
                rows="3"
                value={formData.description_en}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              ></textarea>
            </div>
          </div>

          {/* Chybové a úspěšné hlášky */}
          {status.error && (
            <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
              {t.errorMsg} {status.error}
            </div>
          )}
          {status.success && (
            <div className="p-4 bg-green-900/50 border border-green-500 text-green-200 rounded-lg">
              {t.success}
            </div>
          )}

          {/* Tlačítko pro odeslání */}
          <button
            type="submit"
            disabled={status.loading}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
              status.loading 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 hover:shadow-orange-500/40'
            }`}
          >
            {status.loading ? t.saving : t.saveBtn}
          </button>

        </form>
      </div>
    </div>
  );
}
