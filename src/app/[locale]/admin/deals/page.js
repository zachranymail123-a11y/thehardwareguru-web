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

  // Stav formuláře (včetně nového discount_code)
  const [formData, setFormData] = useState({
    title: '',
    description_cs: '',
    description_en: '',
    price_cs: '',
    price_en: '',
    affiliate_link: '',
    discount_code: '' 
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
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, imageFile);

      if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

      // 2. Získání veřejné URL nahraného souboru
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
      setFormData({ 
        title: '', description_cs: '', description_en: '', 
        price_cs: '', price_en: '', affiliate_link: '', discount_code: '' 
      });
      setImageFile(null);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 4000);

    } catch (error) {
      console.error("Guru Admin Error:", error);
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  // --- GURU DESIGN SYSTEM ---
  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    fontSize: '14px',
    marginTop: '5px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: '950',
    color: '#eab308',
    textTransform: 'uppercase',
    letterSpacing: '1.5px'
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
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      
      <style>{`
        .guru-admin-card {
          background: rgba(15, 17, 21, 0.95);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(234, 179, 8, 0.4);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
        }
        .guru-grid-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }
        @media (max-width: 768px) {
          .guru-grid-row { grid-template-columns: 1fr; }
        }
        .guru-input:focus {
          border-color: #eab308 !important;
          box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
        }
        .guru-submit-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff !important;
          font-weight: 900;
          font-size: 1.1rem;
          text-transform: uppercase;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
          transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          letter-spacing: 1px;
        }
        .guru-submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5);
        }
        .guru-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4">
        <div className="guru-admin-card">
          <h1 style={{ fontSize: '1.8rem', fontWeight: '950', marginBottom: '35px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', letterSpacing: '1px' }}>
            <span style={{ color: '#eab308' }}>GURU</span> SPRÁVA: CENY S KÓDEM
          </h1>

          <form onSubmit={handleSubmit}>
            
            {/* 1. LAJNA: Název a Obrázek */}
            <div className="guru-grid-row">
              <div>
                <label style={labelStyle}>{isEn ? "GAME TITLE *" : "NÁZEV HRY *"}</label>
                <input 
                  type="text" name="title" required 
                  value={formData.title} onChange={handleChange} 
                  className="guru-input" style={inputStyle} 
                  placeholder="Např. Resident Evil Requiem"
                />
              </div>
              <div>
                <label style={labelStyle}>{isEn ? "BANNER (16:9) *" : "BANNER (16:9) *"}</label>
                <input 
                  type="file" accept="image/*" required 
                  onChange={handleFileChange} 
                  className="guru-input"
                  style={{...inputStyle, padding: '10px'}}
                />
              </div>
            </div>

            {/* 2. LAJNA: Affiliate a Slevový Kód */}
            <div className="guru-grid-row">
              <div>
                <label style={{...labelStyle, color: '#f97316'}}>{isEn ? "AFFILIATE LINK (DEEPLINK) *" : "AFFILIATE ODKAZ (DEEPLINK) *"}</label>
                <input 
                  type="url" name="affiliate_link" required 
                  value={formData.affiliate_link} onChange={handleChange} 
                  className="guru-input" style={{...inputStyle, borderColor: 'rgba(249, 115, 22, 0.3)'}} 
                  placeholder="https://www.hrkgame.com/..."
                />
              </div>
              <div>
                <label style={{...labelStyle, color: '#ff0055'}}>{isEn ? "🔥 DISCOUNT CODE (IF ANY)" : "🔥 SLEVOVÝ KÓD (POKUD JE)"}</label>
                <input 
                  type="text" name="discount_code" 
                  value={formData.discount_code} onChange={handleChange} 
                  className="guru-input" style={{...inputStyle, borderColor: '#ff0055', background: 'rgba(255,0,85,0.05)'}} 
                  placeholder="Např. AKSGURU"
                />
              </div>
            </div>

            {/* 3. LAJNA: Ceny */}
            <div className="guru-grid-row">
              <div>
                <label style={labelStyle}>{isEn ? "PRICE CZ (FINAL WITH CODE)" : "CENA CZ (VÝSLEDNÁ S KÓDEM)"}</label>
                <input 
                  type="text" name="price_cs" 
                  value={formData.price_cs} onChange={handleChange} 
                  className="guru-input" style={inputStyle} 
                  placeholder="1 014 Kč"
                />
              </div>
              <div>
                <label style={labelStyle}>{isEn ? "PRICE EN (FINAL WITH CODE)" : "CENA EN (FINAL S KÓDEM)"}</label>
                <input 
                  type="text" name="price_en" 
                  value={formData.price_en} onChange={handleChange} 
                  className="guru-input" style={inputStyle} 
                  placeholder="42 €"
                />
              </div>
            </div>

            {/* 4. LAJNA: Popisy */}
            <div className="guru-grid-row">
              <div>
                <label style={labelStyle}>{isEn ? "DESCRIPTION CZ" : "POPIS CZ"}</label>
                <textarea 
                  name="description_cs" rows="2" 
                  value={formData.description_cs} onChange={handleChange} 
                  className="guru-input" style={{...inputStyle, resize: 'none'}}
                />
              </div>
              <div>
                <label style={labelStyle}>{isEn ? "DESCRIPTION EN" : "POPIS EN"}</label>
                <textarea 
                  name="description_en" rows="2" 
                  value={formData.description_en} onChange={handleChange} 
                  className="guru-input" style={{...inputStyle, resize: 'none'}}
                />
              </div>
            </div>

            {/* STATUSY */}
            <div style={{ marginBottom: '20px' }}>
              {status.error && (
                <div style={{ padding: '15px', background: 'rgba(153, 27, 27, 0.8)', color: '#fecaca', borderRadius: '10px', border: '1px solid #ef4444', fontWeight: 'bold', fontSize: '13px' }}>
                  ❌ {status.error}
                </div>
              )}
              {status.success && (
                <div style={{ padding: '15px', background: 'rgba(22, 101, 52, 0.8)', color: '#bbf7d0', borderRadius: '10px', border: '1px solid #22c55e', fontWeight: '900', textAlign: 'center' }}>
                  ✅ GURU SLEVA ZVEŘEJNĚNA! 🔥
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <button 
              type="submit" 
              disabled={status.loading} 
              className="guru-submit-btn"
            >
              {status.loading ? (isEn ? "UPLOADING DATA..." : "NAHRÁVÁM DATA...") : (isEn ? "PUBLISH DEAL" : "ZVEŘEJNIT NABÍDKU")}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
