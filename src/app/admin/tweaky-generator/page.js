"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Zap, Lock, AlertCircle, CheckCircle, Globe, Search, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TweakyGenerator() {
  const [title, setTitle] = useState('');
  const [pin, setPin] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [aiResult, setAiResult] = useState(null);

  const generate = async () => {
    setAiLoading(true);
    setAiResult(null);
    setStatus({ type: '', msg: '' });

    try {
      // Příprava slugů
      const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const res = await fetch('/api/generate-tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, pin })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generování selhalo');

      // AI nám teď vrací CZ i EN data
      setAiResult({ ...data, title, slug });
      setStatus({ type: 'success', msg: 'GURU AI: Vše připraveno v CZ i EN. Zkontroluj to níže.' });
    } catch (e) { 
      setStatus({ type: 'error', msg: e.message }); 
    } finally { 
      setAiLoading(false); 
    }
  };

  const save = async () => {
    try {
      const { error } = await supabase.from('tweaky').insert([{
        // --- ČESKÁ SEKCE ---
        title: aiResult.title,
        slug: aiResult.slug,
        description: aiResult.seo_description, // Meta desc CZ
        content: aiResult.html_content,       // Obsah CZ
        meta_title: aiResult.meta_title || `${aiResult.title} - Guru Tweak Guide`,
        seo_keywords: aiResult.seo_keywords,
        
        // --- ANGLICKÁ SEKCE ---
        title_en: aiResult.title_en || aiResult.title,
        slug_en: aiResult.slug_en || aiResult.slug,
        description_en: aiResult.description_en, // Meta desc EN
        content_en: aiResult.content_en,         // Obsah EN
        meta_title_en: aiResult.meta_title_en || `${aiResult.title_en} Optimization Guide`,
        seo_keywords_en: aiResult.seo_keywords_en,

        // --- SPOLEČNÉ ---
        image_url: aiResult.image_url,
        og_image: aiResult.image_url, // Pro začátek stejné
        category: 'Optimalizace',
        tweak_plan: 'planned' // Vždy do plánovače!
      }]);

      if (error) throw error;

      setStatus({ type: 'success', msg: 'BUM! SEO Tweak (CZ+EN) uložen do plánovače. 🚀' });
      setAiResult(null); 
      setTitle('');
    } catch (e) { 
      setStatus({ type: 'error', msg: e.message }); 
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontStyle: 'italic', fontWeight: '900', fontSize: '42px', color: '#eab308', textTransform: 'uppercase', letterSpacing: '2px' }}>
            GURU AI TOVÁRNA <span style={{ color: '#fff', fontSize: '20px' }}>v3.0</span>
          </h1>
          <p style={{ color: '#9ca3af' }}>Multijazyčný SEO generátor herních optimalizací</p>
        </header>

        <div style={{ background: 'rgba(17,19,24,0.95)', padding: '35px', borderRadius: '32px', border: '1px solid #eab308', boxShadow: '0 0 50px rgba(234,179,8,0.1)' }}>
          
          {/* STATUS BAR */}
          {status.msg && (
            <div style={{ 
              background: status.type === 'error' ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,0,0.1)',
              border: `1px solid ${status.type === 'error' ? '#ff4444' : '#00ff00'}`,
              padding: '15px', borderRadius: '15px', color: status.type === 'error' ? '#ff4444' : '#00ff00', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />} {status.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
               <input placeholder="Název hry (např. Resident Evil 4)" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '16px', background: '#000', border: '1px solid #333', color: '#fff', outline: 'none', fontSize: '16px' }} />
            </div>
            <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ width: '100px', padding: '18px', borderRadius: '16px', background: '#000', border: '1px solid #333', color: '#fff', textAlign: 'center' }} />
            <button onClick={generate} disabled={aiLoading} style={{ background: '#7c3aed', padding: '0 40px', borderRadius: '16px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {aiLoading ? 'GURU MAKOÁ...' : <><Zap size={20} /> GENEROVAT</>}
            </button>
          </div>

          {aiResult && (
            <div style={{ marginTop: '50px', borderTop: '2px solid #333', paddingTop: '40px' }}>
              
              {/* --- NÁHLED CZ / EN --- */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div>
                  <h3 style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> ČESKÁ VERZE</h3>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid #333', marginTop: '10px' }}>
                    <p><strong>Meta Title:</strong> {aiResult.meta_title}</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}><strong>Keywords:</strong> {aiResult.seo_keywords}</p>
                  </div>
                </div>
                <div>
                  <h3 style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> ENGLISH VERSION</h3>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid #333', marginTop: '10px' }}>
                    <p><strong>Meta Title:</strong> {aiResult.meta_title_en}</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}><strong>Keywords:</strong> {aiResult.seo_keywords_en}</p>
                  </div>
                </div>
              </div>

              {/* HLAVNÍ OBRÁZEK */}
              {aiResult.image_url !== 'EMPTY' && (
                <div style={{ marginBottom: '30px' }}>
                   <p style={{ marginBottom: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '5px' }}><ImageIcon size={16} /> Hlavní obrázek:</p>
                   <img src={aiResult.image_url} style={{ width: '100%', borderRadius: '20px', border: '1px solid #eab308' }} />
                </div>
              )}

              {/* OBSAH CZ */}
              <div style={{ background: 'rgba(10,11,13,0.5)', padding: '30px', borderRadius: '20px', border: '1px solid #333' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#eab308' }}>{aiResult.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: aiResult.html_content }} style={{ color: '#ccc', lineHeight: '1.7' }} />
              </div>

              <button 
                onClick={save} 
                style={{ 
                  width: '100%', padding: '25px', background: '#eab308', color: '#000', borderRadius: '20px', 
                  fontWeight: '900', marginTop: '40px', cursor: 'pointer', border: 'none', fontSize: '18px',
                  boxShadow: '0 10px 30px rgba(234, 179, 8, 0.2)', textTransform: 'uppercase', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                }}
              >
                <Save size={22} /> POSLAT DO PLÁNOVAČE K REVIZI 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
