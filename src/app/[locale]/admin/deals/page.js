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
    affiliate_link: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  // Zpracování změn v textových políčkách
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Zpracování výběru souboru
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Odeslání formuláře a nahrání obrázku
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ loading: false, error: isEn ? "Please select an image!" : "Vyber prosím obrázek!", success: false });
      return;
    }

    setStatus({ loading: true, error: null, success: false });

    try {
      // 1. Nahrání obrázku do Supabase Storage (Bucket: game-deals)
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('game-deals')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // 2. Získání veřejné URL nahraného obrázku
      const { data: { publicUrl } } = supabase.storage
        .from('game-deals')
        .getPublicUrl(filePath);

      // 3. Uložení všech dat do databáze
      const { error: dbError } = await supabase
        .from('game_deals')
        .insert([{
          ...formData,
          image_url: publicUrl
        }]);

      if (dbError) throw dbError;

      // Úspěch!
      setStatus({ loading: false, error: null, success: true });
      setFormData({
        title: '', description_cs: '', description_en: '', price_cs: '', price_en: '', affiliate_link: ''
      });
      setImageFile(null);
      // Reset inputu pro soubor
      e.target.reset();

      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);

    } catch (error) {
      console.error("Guru Error:", error);
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  // Texty administrace (Guru style)
  const t = {
    title: isEn ? "ADD NEW GAME DEAL (UPLOAD MODE)" : "PŘIDAT NOVOU SLEVU (MÓD NAHRÁVÁNÍ)",
    gameName: isEn ? "Game Title" : "Název hry",
    fileLabel: isEn ? "Upload Banner (16:9)" : "Nahrát Banner (16:9)",
    link: isEn ? "HRK Affiliate Link (DeepLink)" : "HRK Affiliate Odkaz (DeepLink)",
    priceCs: isEn ? "Price (CZ - e.g. 1 100 Kč)" : "Cena (CZ - např. 1 100 Kč)",
    priceEn: isEn ? "Price (EN - e.g. 45 €)" : "Cena (EN - např. 45 €)",
    descCs: isEn ? "Short description (CZ)" : "Krátký popis (CZ)",
    descEn: isEn ? "Short description (EN)" : "Krátký popis (EN)",
    saveBtn: isEn ? "UPLOAD AND PUBLISH" : "NAHRÁT A ZVEŘEJNIT",
    saving: isEn ? "UPLOADING TO GURU CLOUD..." : "NAHRÁVÁM DO GURU CLOUDU...",
    success: isEn ? "IMAGE STORED AND DEAL PUBLISHED! 🔥" : "OBRÁZEK ULOŽEN A SLEVA ZVEŘEJNĚNA! 🔥"
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

  return (
    <div style={globalStyles}>
      <style>{`
        .guru-input:focus { border-color: #eab308 !important; box-shadow: 0 0 15px rgba(234, 179, 8, 0.2) !important; }
        .guru-submit-btn {
          width: 100%; padding: 20px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff !important; font-weight: 900; font-size: 1.2rem;
          text-transform: uppercase; letter-spacing: 2px; border-radius: 16px;
          border: 2px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .guru-submit-btn:hover:not(:disabled) { transform: translateY(-3px) scale(1.01); box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6); }
      `}</style>

      <div className="max-w-4xl mx-auto px-4">
        <div style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '40px', borderRadius: '25px', border: '1px solid rgba(234, 179, 8, 0.3)', backdropFilter: 'blur(10px)' }}>
          <h1 className="text-3xl font-black mb-8 border-b border-neutral-800 pb-6">
            <span style={{ color: '#eab308' }}>🔥</span> {t.title}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase">{t.gameName} *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="guru-input w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 mb-2 uppercase">{t.fileLabel} *</label>
                <input type="file" accept="image/*" required onChange={handleFileChange} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-orange-500 file:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-orange-500 mb-2 uppercase">{t.link} *</label>
              <input type="url" name="affiliate_link" required value={formData.affiliate_link} onChange={handleChange} className="guru-input w-full p-4 bg-black/50 border border-orange-500/30 rounded-xl text-white outline-none" placeholder="https://..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="price_cs" value={formData.price_cs} onChange={handleChange} placeholder={t.priceCs} className="guru-input w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none" />
              <input type="text" name="price_en" value={formData.price_en} onChange={handleChange} placeholder={t.priceEn} className="guru-input w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none" />
            </div>

            <div className="space-y-6">
              <textarea name="description_cs" rows="2" value={formData.description_cs} onChange={handleChange} placeholder={t.descCs} className="guru-input w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none"></textarea>
              <textarea name="description_en" rows="2" value={formData.description_en} onChange={handleChange} placeholder={t.descEn} className="guru-input w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none"></textarea>
            </div>

            {status.error && <div className="p-4 bg-red-900 border border-red-500 text-white rounded-xl font-bold uppercase">{status.error}</div>}
            {status.success && <div className="p-4 bg-green-900 border border-green-500 text-green-400 rounded-xl font-black text-center">{t.success}</div>}

            <button type="submit" disabled={status.loading} className="guru-submit-btn">
              {status.loading ? t.saving : t.saveBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
