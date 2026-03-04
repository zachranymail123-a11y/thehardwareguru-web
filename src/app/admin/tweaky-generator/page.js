"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, AlertCircle, CheckCircle, Zap, Lock } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TweakyGenerator() {
  const [title, setTitle] = useState('');
  const [pin, setPin] = useState(''); // PIN napíšeš přímo do políčka
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [aiResult, setAiResult] = useState(null); 

  const generateWithAI = async () => {
    if (!title || !pin) {
      setStatus({ type: 'error', message: 'Musíš zadat Název hry i Guru PIN!' });
      return;
    }

    setAiLoading(true);
    setStatus({ type: '', message: 'AI a Serper makají. Tohle potrvá cca 15-20 sekund...' });
    setAiResult(null);

    try {
      const autoSlug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const res = await fetch('/api/generate-tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title: title,
            slug: autoSlug,
            pin: pin // Pošle PIN z tvého políčka přímo na backend
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server spadl (error 500). Zkontroluj klíče na Vercelu (OPENAI, SERPER).");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Neznámá chyba API');

      setAiResult({
        title: title,
        slug: autoSlug,
        description: data.seo_description,
        content: data.html_content,
        image_url: data.image_url,
        category: 'Optimalizace',
        source: data.source
      });

      setStatus({ type: 'success', message: `Guru AI to sepsala (Zdroj: ${data.source}). Zkontroluj a ulož.` });
    } catch (error) {
      setStatus({ type: 'error', message: `Chyba: ${error.message}` });
    } finally {
      setAiLoading(false);
    }
  };

  const saveToDb = async () => {
    if (!aiResult) return;
    setSaving(true);
    setStatus({ type: '', message: 'Ukládám do databáze...' });

    try {
      const dataToSave = {
        title: aiResult.title,
        slug: aiResult.slug,
        category: aiResult.category,
        description: aiResult.description,
        image_url: aiResult.image_url,
        content: aiResult.content
      };

      const { error } = await supabase.from('tweaky').insert([dataToSave]);
      if (error) throw error;

      setStatus({ type: 'success', message: 'BUM! Tweak je online.' });
      setAiResult(null);
      setTitle('');
    } catch (error) {
      setStatus({ type: 'error', message: `Chyba při ukládání: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '10px' }}>
            <span style={{ color: '#eab308' }}>Guru</span> AI Továrna
          </h1>
          <div style={{ marginTop: '20px' }}><Link href="/" style={{ color: '#eab308', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>← Zpět na web</Link></div>
        </div>

        <div style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '28px', padding: '40px', boxShadow: '0 0 40px rgba(234, 179, 8, 0.1)' }}>
          
          {status.message && (
            <div style={{ padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', background: status.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : (status.type === 'error' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(234, 179, 8, 0.1)'), border: status.type === 'success' ? '1px solid #00e701' : (status.type === 'error' ? '1px solid #ff0000' : '1px solid #eab308'), color: status.type === 'success' ? '#00e701' : (status.type === 'error' ? '#ff0000' : '#eab308') }}>
              {status.type === 'success' ? <CheckCircle size={20} /> : (status.type === 'error' ? <AlertCircle size={20} /> : <Zap size={20} />)}
              <span style={{ fontWeight: 'bold' }}>{status.message}</span>
            </div>
          )}

          {/* DVE POLÍČKA A DOST */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={labelStyle}>Název Hry</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} disabled={aiLoading || saving} placeholder="Např. Resident Evil Requiem" />
            </div>
            <div style={{ flex: '0 1 150px' }}>
              <label style={{...labelStyle, color: '#ef4444'}}>GURU PIN</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#ef4444" style={{ position: 'absolute', left: '15px', top: '18px' }} />
                <input type="password" required value={pin} onChange={(e) => setPin(e.target.value)} style={{ ...inputStyle, paddingLeft: '45px', borderColor: '#ef4444' }} disabled={aiLoading || saving} placeholder="••••" />
              </div>
            </div>
            <button type="button" onClick={generateWithAI} disabled={aiLoading || saving || !title || !pin} style={{ background: aiLoading ? '#4c1d95' : '#7c3aed', color: '#fff', border: 'none', padding: '16px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', cursor: (aiLoading || saving || !title || !pin) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '54px', transition: '0.2s' }}>
              <Zap size={18} /> {aiLoading ? 'Makám...' : 'Vytvořit'}
            </button>
          </div>

          {/* NÁHLED PŘED ULOŽENÍM */}
          {aiResult && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', marginTop: '10px' }}>
              <h3 style={{ color: '#eab308', textTransform: 'uppercase', marginBottom: '20px', fontSize: '18px' }}>Náhled před publikací</h3>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {aiResult.image_url && (
                  <img src={aiResult.image_url} alt="Cover" style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #eab308' }} />
                )}
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '28px', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{aiResult.title}</h2>
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' }}><strong>SEO Popis:</strong> {aiResult.description}</p>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div dangerouslySetInnerHTML={{ __html: aiResult.content }} style={{ fontSize: '14px', color: '#ccc' }} />
              </div>

              <button type="button" onClick={saveToDb} disabled={saving} style={{ background: '#eab308', color: '#000', border: 'none', padding: '20px', borderRadius: '12px', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
                <Save size={24} /> {saving ? 'Ukládám do Supabase...' : 'Publikovat Tweak na web'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '8px', color: '#eab308', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '16px 20px', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
