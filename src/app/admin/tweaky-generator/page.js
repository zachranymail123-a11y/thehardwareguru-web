"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Settings, Save, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import Link from 'next/link';

// Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TweakyGenerator() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Optimalizace', // Dal jsem tu defaultně Optimalizace
    description: '',
    image_url: '',
    content: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // Stav pro načítání AI

  // Automatické generování URL ze jména (např. "GTA 6 Fix" -> "gta-6-fix")
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const autoSlug = newTitle
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Odstraní diakritiku
      .replace(/[^a-z0-9]+/g, '-') // Mezery a znaky na pomlčku
      .replace(/(^-|-$)+/g, ''); // Odstraní pomlčky na začátku a konci

    setFormData({ ...formData, title: newTitle, slug: autoSlug });
  };

  // MAGICKÁ AI FUNKCE
  const generateWithAI = async () => {
    if (!formData.title) {
      setStatus({ type: 'error', message: 'Nejdřív musíš napsat Název Hry (H1), aby AI věděla, co má hledat na PCGamingWiki!' });
      return;
    }

    setAiLoading(true);
    setStatus({ type: '', message: 'Hledám na PCGamingWiki a startuju AI. Tohle může trvat 10-20 sekund...' });

    try {
      const res = await fetch('/api/generate-tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title: formData.title,
            slug: formData.slug 
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Chyba API');

      setFormData(prev => ({
        ...prev,
        description: data.seo_description || '',
        content: data.html_content || '',
        image_url: data.image_url || ''
      }));

      setStatus({ type: 'success', message: 'Guru AI to tam nasypala a obrázek je uložen na tvém serveru! Zkontroluj to a ulož.' });
    } catch (error) {
      setStatus({ type: 'error', message: `AI selhalo: ${error.message}` });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data, error } = await supabase
        .from('tweaky')
        .insert([{
          title: formData.title,
          slug: formData.slug,
          category: formData.category,
          description: formData.description,
          image_url: formData.image_url,
          content: formData.content
        }]);

      if (error) throw error;

      setStatus({ type: 'success', message: 'Tweak byl úspěšně uložen do databáze! RSS a Sitemap ho automaticky natáhly.' });
      setFormData({ title: '', slug: '', category: 'Optimalizace', description: '', image_url: '', content: '' }); // Vyčistí formulář
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: `Chyba při ukládání: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: 'sans-serif', 
      padding: '40px 20px' 
    }}>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* HLAVIČKA GENERÁTORU */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '10px' }}>
            <span style={{ color: '#eab308' }}>Guru</span> AI Generátor
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '16px' }}>
            Rozhraní pro přidávání nových článků s AI podporou.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link href="/" style={{ color: '#eab308', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              ← Zpět na web
            </Link>
          </div>
        </div>

        {/* FORMULÁŘ (GURU SKLENĚNÝ STYL) */}
        <div style={{
          background: 'rgba(17, 19, 24, 0.85)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(234, 179, 8, 0.4)', 
          borderRadius: '28px', 
          padding: '40px',
          boxShadow: '0 0 40px rgba(234, 179, 8, 0.1)'
        }}>
          
          {status.message && (
            <div style={{ 
              padding: '15px', 
              borderRadius: '12px', 
              marginBottom: '25px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              background: status.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : (status.type === 'error' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(234, 179, 8, 0.1)'),
              border: status.type === 'success' ? '1px solid #00e701' : (status.type === 'error' ? '1px solid #ff0000' : '1px solid #eab308'),
              color: status.type === 'success' ? '#00e701' : (status.type === 'error' ? '#ff0000' : '#eab308')
            }}>
              {status.type === 'success' ? <CheckCircle size={20} /> : (status.type === 'error' ? <AlertCircle size={20} /> : <Zap size={20} />)}
              <span style={{ fontWeight: 'bold' }}>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={labelStyle}>Název Hry (AI ho použije pro hledání)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={handleTitleChange} 
                  style={inputStyle} 
                  placeholder="Např. Resident Evil Requiem"
                />
              </div>

              {/* TLAČÍTKO PRO AI MAGII */}
              <button 
                type="button"
                onClick={generateWithAI}
                disabled={aiLoading || !formData.title}
                style={{
                  background: aiLoading ? '#4c1d95' : '#7c3aed',
                  color: '#fff', 
                  border: 'none', 
                  padding: '16px 20px', 
                  borderRadius: '12px', 
                  fontSize: '14px', 
                  fontWeight: '900', 
                  textTransform: 'uppercase', 
                  cursor: (aiLoading || !formData.title) ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  height: '54px', 
                  transition: '0.2s', 
                  opacity: formData.title ? 1 : 0.5
                }}
              >
                <Zap size={18} /> {aiLoading ? 'AI Maká (10-20s)...' : 'Auto-vyplnit přes AI'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={labelStyle}>URL Slug (Generuje se samo)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                  style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }} 
                />
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <label style={labelStyle}>Kategorie</label>
                <input 
                  type="text" 
                  required 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                  style={inputStyle} 
                  placeholder="Např. FPS Boost"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>URL Obrázku (Vygenerováno a nahráno AI)</label>
              <input 
                type="text" 
                value={formData.image_url} 
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                style={inputStyle} 
                placeholder="https://..."
              />
              {formData.image_url && (
                <img 
                  src={formData.image_url} 
                  alt="Náhled" 
                  style={{ marginTop: '15px', height: '120px', borderRadius: '12px', border: '2px solid #eab308' }} 
                />
              )}
            </div>

            <div>
              <label style={labelStyle}>Krátký popis (Pro kartu a Google SEO)</label>
              <textarea 
                required 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                style={{ ...inputStyle, height: '80px', resize: 'vertical' }} 
                placeholder="Krátké shrnutí problému a řešení..."
              />
            </div>

            <div>
              <label style={labelStyle}>Kompletní obsah návodu (HTML)</label>
              <textarea 
                required 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                style={{ ...inputStyle, height: '300px', resize: 'vertical', fontFamily: 'monospace' }} 
                placeholder="<h2>1. Krok</h2><p>Popis fixu...</p>"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || aiLoading}
              style={{
                background: '#eab308',
                color: '#000',
                border: 'none',
                padding: '20px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '900',
                textTransform: 'uppercase',
                cursor: (loading || aiLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '10px',
                opacity: (loading || aiLoading) ? 0.7 : 1
              }}
            >
              <Save size={24} /> {loading ? 'Ukládám do databáze...' : 'Vypublikovat Tweak'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

// INLINE STYLY PRO FORMULÁŘ
const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#eab308',
  fontSize: '14px',
  fontWeight: 'bold',
  textTransform: 'uppercase'
};

const inputStyle = {
  width: '100%',
  padding: '16px 20px',
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(234, 179, 8, 0.3)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};
