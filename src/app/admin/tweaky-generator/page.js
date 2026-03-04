"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Zap, Lock, AlertCircle, CheckCircle } from 'lucide-react';
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
    try {
      const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await fetch('/api/generate-tweak', {
        method: 'POST',
        body: JSON.stringify({ title, slug, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiResult({ ...data, title, slug });
      setStatus({ type: 'success', msg: 'AI to připravila. Zkontroluj náhled níže.' });
    } catch (e) { setStatus({ type: 'error', msg: e.message }); }
    finally { setAiLoading(false); }
  };

  const save = async () => {
    try {
      const { error } = await supabase.from('tweaky').insert([{
        title: aiResult.title, slug: aiResult.slug, description: aiResult.seo_description,
        content: aiResult.html_content, image_url: aiResult.image_url, category: 'Optimalizace'
      }]);
      if (error) throw error;
      setStatus({ type: 'success', msg: 'BUM! Tweak je online.' });
      setAiResult(null); setTitle('');
    } catch (e) { setStatus({ type: 'error', msg: e.message }); }
  };

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: '900' }}>GURU AI TOVÁRNA</h1>
        <div style={{ background: 'rgba(17,19,24,0.9)', padding: '30px', borderRadius: '24px', border: '1px solid #eab308', marginTop: '30px' }}>
          {status.msg && <div style={{ color: status.type === 'error' ? '#ff4444' : '#00ff00', marginBottom: '20px' }}>{status.msg}</div>}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input placeholder="Název hry" value={title} onChange={e => setTitle(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }} />
            <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ width: '100px', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }} />
            <button onClick={generate} disabled={aiLoading} style={{ background: '#7c3aed', padding: '15px 30px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              {aiLoading ? 'MAKOVÁNÍ...' : 'GENEROVAT'}
            </button>
          </div>

          {aiResult && (
            <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '30px' }}>
              <h2>{aiResult.title}</h2>
              {aiResult.image_url !== 'EMPTY' && <img src={aiResult.image_url} style={{ width: '100%', borderRadius: '12px' }} />}
              <div dangerouslySetInnerHTML={{ __html: aiResult.html_content }} style={{ color: '#ccc', marginTop: '20px' }} />
              <button onClick={save} style={{ width: '100%', padding: '20px', background: '#eab308', color: '#000', borderRadius: '12px', fontWeight: '900', marginTop: '30px', cursor: 'pointer' }}>PUBLIKOVAT</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
