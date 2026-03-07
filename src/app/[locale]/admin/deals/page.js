"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

// GURU ENGINE: Inicializace Supabase
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

  // Handlery
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ loading: false, error: isEn ? "Select image!" : "Vyber obrázek!", success: false });
      return;
    }

    setStatus({ loading: true, error: null, success: false });

    try {
      // 1. Nahrání obrázku do bucketu 'images'
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, imageFile);

      if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

      // 2. Získání veřejné URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // 3. Uložení dat do tabulky game_deals
      const { error: dbError } = await supabase
        .from('game_deals')
        .insert([{
          ...formData,
          image_url: publicUrl
        }]);

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);

      // Úspěch!
      setStatus({ loading: false, error: null, success: true });
      setFormData({ title: '', description_cs: '', description_en: '', price_cs: '', price_en: '', affiliate_link: '' });
      setImageFile(null);
      e.target.reset();

      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);

    } catch (error) {
      console.error("Guru Admin Error:", error);
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  // --- GURU DESIGN SYSTEM ---
  const inputStyle = {
    width: '100%',
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    fontSize: '15px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '900',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")', 
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed',
      paddingTop: '120px',
      paddingBottom: '80px',
      color: '#fff'
    }}>
      
      <style>{`
        .guru-admin-card {
          background: rgba(31, 40, 51, 0.98);
          padding: 50px;
          border-radius: 25px;
          border: 1px solid #eab308;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          backdrop-filter: blur(15px);
        }
        .guru-field:focus {
          border-color: #eab308 !important;
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
        }
        .guru-btn {
          width: 100%;
          padding: 20px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff !important;
          font-weight: 900;
          font-size: 1.2rem;
          text-transform: uppercase;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          transition: 0.3s;
        }
        .guru-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }
        .guru-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4">
        <div className="guru-admin-card">
          <h1 className="text-3xl font-black mb-10 border-b border-neutral-800 pb-6 tracking-wider uppercase">
            <span style={{ color: '#eab308' }}>GURU</span> SYSTÉM: PŘIDÁNÍ SLEVY
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Název a Obrázek */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label style={labelStyle}>{isEn ? "GAME TITLE *" : "NÁZEV HRY *"}</label>
                <input 
                  type="text" name="title" required 
                  value={formData.title} onChange={handleChange} 
                  className="guru-field" style={inputStyle} 
                  placeholder="Např. Resident Evil Requiem"
                />
              </div>
              <div>
                <label style={labelStyle}>{isEn ? "BANNER (16:9) *" : "BANNER (16:9) *"}</label>
                <input 
                  type="file" accept="image/*" required 
                  onChange={handleFileChange} 
                  className="guru-field"
                  style={{...inputStyle, padding: '12px'}}
                />
              </div>
            </div>

            {/* Affiliate Link */}
            <div>
              <label style={{...labelStyle, color: '#f97316'}}>{isEn ? "HRK AFFILIATE LINK (DEEPLINK) *" : "HRK AFFILIATE ODKAZ (DEEPLINK) *"}</label>
              <input 
                type="url" name="affiliate_link" required 
                value={formData.affiliate_link} onChange={handleChange} 
                className="guru-field" style={{...inputStyle, borderColor: 'rgba(249, 115, 22, 0.4)'}} 
                placeholder="https://www.hrkgame.com/cs/games/product/.../?a_aid=TheHardwareGuru"
              />
            </div>

            {/* Ceny */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label style={labelStyle}>{isEn ? "PRICE CZ (e.g. 1 100 Kč)" : "CENA CZ (např. 1 100 Kč)"}</label>
                <input 
                  type="text" name="price_cs" 
                  value={formData.price_cs} onChange={handleChange} 
                  className="guru-field" style={inputStyle} 
                  placeholder="1 100 Kč"
                />
              </div>
              <div>
                <label style={labelStyle}>{isEn ? "PRICE EN (e.g. 45 €)" : "CENA EN (např. 45 €)"}</label>
                <input 
                  type="text" name="price_en" 
                  value={formData.price_en} onChange={handleChange} 
                  className="guru-field" style={inputStyle} 
                  placeholder="45 €"
                />
              </div>
            </div>

            {/* Popisy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label style={labelStyle}>{isEn ? "DESCRIPTION CZ" : "POPIS CZ"}</label>
                <textarea 
                  name="description_cs" rows="3" 
                  value={formData.description_cs} onChange={handleChange} 
                  className="guru-field" style={{...inputStyle, resize: 'none'}}
                />
              </div>
              <div>
                <label style={labelStyle}>{isEn ? "DESCRIPTION EN" : "POPIS EN"}</label>
                <textarea 
                  name="description_en" rows="3" 
                  value={formData.description_en} onChange={handleChange} 
                  className="guru-field" style={{...inputStyle, resize: 'none'}}
                />
              </div>
            </div>

            {/* Statusy */}
            {status.error && (
              <div className="p-4 bg-red-950/80 border border-red-500 text-red-200 rounded-xl font-bold text-sm uppercase">
                {isEn ? "SYSTEM ERROR: " : "CHYBA SYSTÉMU: "} {status.error}
              </div>
            )}
            {status.success && (
              <div className="p-4 bg-green-950/80 border border-green-500 text-green-400 rounded-xl font-black text-center uppercase tracking-wider">
                {isEn ? "GURU DEAL SECURED AND PUBLISHED! 🔥" : "GURU SLEVA ÚSPĚŠNĚ ZVEŘEJNĚNA! 🔥"}
              </div>
            )}

            {/* Submit */}
            <button 
              type="submit" 
              disabled={status.loading} 
              className="guru-btn"
            >
              {status.loading ? (isEn ? "UPLOADING DATA..." : "NAHRÁVÁM DATA...") : (isEn ? "PUBLISH DEAL" : "ZVEŘEJNIT NABÍDKU")}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
