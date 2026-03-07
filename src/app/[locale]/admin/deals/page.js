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
    title: isEn ? "ADD NEW GAME DEAL" : "PŘIDAT NOVOU SLEVU NA HRU",
    gameName: isEn ? "Game Title" : "Název hry",
    imgUrl: isEn ? "Image URL (16:9)" : "URL obrázku (Banner 16:9)",
    link: isEn ? "HRK Affiliate Link (DeepLink)" : "HRK Affiliate Odkaz (DeepLink)",
    priceCs: isEn ? "Price (CZ - e.g. 1 100 Kč)" : "Cena (CZ - např. 1 100 Kč)",
    priceEn: isEn ? "Price (EN - e.g. 45 €)" : "Cena (EN - např. 45 €)",
    descCs: isEn ? "Short description (CZ)" : "Krátký popis (CZ)",
    descEn: isEn ? "Short description (EN)" : "Krátký popis (EN)",
    saveBtn: isEn ? "SAVE DEAL TO DATABASE" : "ULOŽIT SLEVU DO DATABÁZE",
    saving: isEn ? "SAVING DATA..." : "UKLÁDÁM DATA...",
    success: isEn ? "GURU DEAL SECURED AND PUBLISHED! 🔥" : "GURU SLEVA BYLA ÚSPĚŠNĚ ZVEŘEJNĚNA! 🔥",
    errorMsg: isEn ? "SYSTEM ERROR:" : "CHYBA SYSTÉMU:"
  };

  // --- GURU MASTER STYLES ---
  const globalStyles = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    color: '#fff', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed',
    paddingTop: '100px',
    paddingBottom: '80px'
  };

  const formCardStyles = {
    background: 'rgba(31, 40, 51, 0.95)',
    padding: '40px',
    borderRadius: '25px',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    boxShadow: '0 15px 45px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)'
  };

  const inputStyles = {
    width: '100%',
    background: 'rgba(10, 11, 13, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '14px 20px',
    color: '#fff',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={globalStyles}>
      <style>{`
        .guru-input:focus {
          border-color: #eab308 !important;
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.2) !important;
        }
        .guru-submit-btn {
          width: 100%;
          padding: 20px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff !important;
          font-weight: 900;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          border-radius: 16px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .guru-submit-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
          border-color: #fbd38d;
        }
        .guru-submit-btn:disabled {
          background: #333;
          box-shadow: none;
          border-color: #555;
          color: #888 !important;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div style={formCardStyles}>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-8 border-b border-neutral-800 pb-6 uppercase tracking-wide">
            <span style={{ color: '#eab308', textShadow: '0 0 15px rgba(234, 179, 8, 0.5)' }}>🔥</span> {t.title}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Název hry a Obrázek */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase tracking-wider">{t.gameName} *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="guru-input"
                  style={inputStyles}
                  placeholder="Např. Cyberpunk 2077"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase tracking-wider">{t.imgUrl}</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="guru-input"
                  style={inputStyles}
                  placeholder={isEn ? "https://... (ideal 16:9)" : "https://... (ideálně 16:9)"}
                />
              </div>
            </div>

            {/* HRK Affiliate Link */}
            <div>
              <label className="block text-xs font-black mb-2 uppercase tracking-wider" style={{ color: '#f97316' }}>{t.link} *</label>
              <input
                type="url"
                name="affiliate_link"
                required
                value={formData.affiliate_link}
                onChange={handleChange}
                className="guru-input"
                style={{ ...inputStyles, border: '1px solid rgba(249, 115, 22, 0.4)' }}
                placeholder="https://www.hrkgame.com/cs/games/.../?ref=thehardwareguru"
              />
            </div>

            {/* Ceny (CZ a EN) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase tracking-wider">{t.priceCs}</label>
                <input
                  type="text"
                  name="price_cs"
                  value={formData.price_cs}
                  onChange={handleChange}
                  className="guru-input"
                  style={inputStyles}
                  placeholder="1 100 Kč"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase tracking-wider">{t.priceEn}</label>
                <input
                  type="text"
                  name="price_en"
                  value={formData.price_en}
                  onChange={handleChange}
                  className="guru-input"
                  style={inputStyles}
                  placeholder="45 €"
                />
              </div>
            </div>

            {/* Popisky (CZ a EN) */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase tracking-wider">{t.descCs}</label>
                <textarea
                  name="description_cs"
                  rows="3"
                  value={formData.description_cs}
                  onChange={handleChange}
                  className="guru-input"
                  style={inputStyles}
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase tracking-wider">{t.descEn}</label>
                <textarea
                  name="description_en"
                  rows="3"
                  value={formData.description_en}
                  onChange={handleChange}
                  className="guru-input"
                  style={inputStyles}
                ></textarea>
              </div>
            </div>

            {/* Chybové a úspěšné hlášky */}
            {status.error && (
              <div className="p-5 bg-red-950/80 border border-red-500 text-red-200 rounded-xl font-bold uppercase tracking-wider">
                {t.errorMsg} {status.error}
              </div>
            )}
            {status.success && (
              <div className="p-5 bg-green-950/80 border border-green-500 text-green-400 rounded-xl font-black uppercase tracking-wider text-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                {t.success}
              </div>
            )}

            {/* Tlačítko pro odeslání */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={status.loading}
                className="guru-submit-btn"
              >
                {status.loading ? t.saving : t.saveBtn}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
