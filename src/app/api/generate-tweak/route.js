"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Zap, Globe, CheckCircle, AlertCircle } from 'lucide-react';

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
      const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const res = await fetch('/api/generate-tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, pin })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generování selhalo');

      // 🚀 GURU FIX: Zde se mění magie. Data z AI přepisují "title"
      // Takže pokud AI pošle "The Legend of Khiimori", nahradí to tvé "the legend of khiimori"
      setAiResult({ title, slug, ...data });
      
      setStatus({ type: 'success', msg: 'GURU AI: CZ i EN verze připraveny k revizi!' });
    } catch (e) { 
      setStatus({ type: 'error', msg: e.message }); 
    } finally { 
      setAiLoading(false); 
    }
  };

  const save = async () => {
    try {
      const { error } = await supabase.from('tweaky').insert([{
        title: aiResult.title, // Tohle už bude ten správný velký/malý název
        slug: aiResult.slug,
        description: aiResult.seo_description,
        content: aiResult.html_content,
        meta_title: aiResult.meta_title,
        seo_keywords: aiResult.seo_keywords,
        title_en: aiResult.title_en,
        slug_en: aiResult.slug_en,
        description_en: aiResult.description_en,
        content_en: aiResult.content_en,
        meta_title_en: aiResult.meta_title_en,
        seo_keywords_en: aiResult.seo_keywords_en,
        image_url: aiResult.image_url,
        og_image: aiResult.image_url, 
        category: 'Optimalizace',
        tweak_plan: 'planned'
      }]);

      if (error) throw error;

      setStatus({ type: 'success', msg: 'BUM! SEO Tweak odeslán do plánovače. 🚀' });
      setAiResult(null); 
      setTitle('');
    } catch (e) { 
      setStatus({ type: 'error', msg: e.message }); 
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <h1 style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: '900', color: '#eab308', fontSize: '36px' }}>
          GURU AI MULTI-GENERATOR
        </h1>

        <div style={{ background: 'rgba(17,19,24,0.95)', padding: '30px', borderRadius: '24px', border: '1px solid #eab308', marginTop: '30px' }}>
          
          {status.msg && (
            <div style={{ 
              background: status.type === 'error' ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,0,0.1)',
              border: `1px solid ${status.type === 'error' ? '#ff4444' : '#00ff00'}`,
              padding: '15px', borderRadius: '12px', color: status.type === 'error' ? '#ff4444' : '#00ff00', marginBottom: '20px' 
            }}>
              {status.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input placeholder="Název hry (např. gta v)" value={title} onChange={e => setTitle(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }} />
            <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ width: '100px', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', textAlign: 'center' }} />
            <button onClick={generate} disabled={aiLoading} style={{ background: '#7c3aed', padding: '15px 30px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              {aiLoading ? 'GURU MAKOÁ...' : 'GENEROVAT VŠE'}
            </button>
          </div>

          {aiResult && (
            <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '30px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
                   <h4 style={{ color: '#eab308', margin: '0 0 10px 0' }}><Globe size={14} /> CZ SEO</h4>
                   <p style={{ fontSize: '13px' }}><strong>Title:</strong> {aiResult.meta_title}</p>
                   <p style={{ fontSize: '11px', color: '#9ca3af' }}>{aiResult.seo_keywords}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
                   <h4 style={{ color: '#a855f7', margin: '0 0 10px 0' }}><Globe size={14} /> EN SEO</h4>
                   <p style={{ fontSize: '13px' }}><strong>Title:</strong> {aiResult.meta_title_en}</p>
                   <p style={{ fontSize: '11px', color: '#9ca3af' }}>{aiResult.seo_keywords_en}</p>
                </div>
              </div>

              {/* Tady už se zobrazí krásně formátovaný název z AI */}
              <h2 style={{ fontSize: '28px', color: '#eab308' }}>{aiResult.title}</h2>
              {aiResult.image_url !== 'EMPTY' && <img src={aiResult.image_url} style={{ width: '100%', borderRadius: '12px', margin: '20px 0' }} />}
              
              <div dangerouslySetInnerHTML={{ __html: aiResult.html_content }} style={{ color: '#ccc', lineHeight: '1.6' }} />
              
              <button 
                onClick={save} 
                style={{ 
                  width: '100%', padding: '20px', background: '#eab308', color: '#000', borderRadius: '12px', 
                  fontWeight: '900', marginTop: '30px', cursor: 'pointer', border: 'none'
                }}
              >
                ULOŽIT DO PLÁNOVAČE 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
