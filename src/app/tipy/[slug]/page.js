import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { ChevronLeft, Play, Heart } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function TipDetail({ params }) {
  // 1. Načtení aktuálního tipu
  const { data: tip } = await supabase
    .from('tipy')
    .select('*')
    .eq('slug', params.slug)
    .single();

  // 2. Načtení 3 dalších náhodných tipů pro doporučení
  const { data: dalsiTipy } = await supabase
    .from('tipy')
    .select('*')
    .neq('slug', params.slug)
    .limit(3);

  if (!tip) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Tip nenalezen.</div>;

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: 'sans-serif',
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed'
    }}>
      
      {/* SOCIAL & SUPPORT BAR */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '30px 20px' }}>
        <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" style={{ color: '#53fc18', textDecoration: 'none', fontWeight: 'bold', fontSize: '10px', border: '1px solid #53fc18', padding: '6px 12px', borderRadius: '10px' }}>KICK</a>
        <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '10px', border: '1px solid #ff0000', padding: '6px 12px', borderRadius: '10px' }}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={{ color: '#5865F2', textDecoration: 'none', fontWeight: 'bold', fontSize: '10px', border: '1px solid #5865F2', padding: '6px 12px', borderRadius: '10px' }}>DISCORD</a>
        <a href="/support" style={{ color: '#eab308', textDecoration: 'none', fontWeight: 'bold', fontSize: '10px', border: '1px solid #eab308', padding: '6px 12px', borderRadius: '10px' }}>SUPPORT</a>
      </div>

      {/* HEADER ČLÁNKU */}
      <div style={{ width: '100%', height: '40vh', position: 'relative' }}>
        <img src={tip.image_url} alt={tip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.4' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '900px' }}>
          <a href="/tipy" style={{ color: '#a855f7', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
            <ChevronLeft size={16} /> ZPĚT NA VŠECHNY TIPY
          </a>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', lineHeight: '1.1' }}>{tip.title}</h1>
        </div>
      </div>

      {/* HLAVNÍ OBSAH */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: 'rgba(17, 19, 24, 0.8)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <div style={{ fontSize: '18px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#d1d5db' }}>
            {tip.content}
          </div>

          {/* VIDEO */}
          {tip.youtube_id && (
            <div style={{ marginTop: '50px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Play size={20} color="#ff0000" /> Video návod:</h3>
              <iframe width="100%" height="450" src={`https://www.youtube.com/embed/${tip.youtube_id}`} frameBorder="0" allowFullScreen style={{ borderRadius: '20px', border: '1px solid #333' }}></iframe>
            </div>
          )}

          {/* SUPPORT VÝZVA */}
          <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '24px', border: '1px dashed #eab308', textAlign: 'center' }}>
            <Heart size={32} color="#eab308" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#eab308', marginBottom: '10px' }}>Dalo ti to něco nového?</h3>
            <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '20px' }}>Pokud ti tento tip pomohl nebo ses dozvěděl něco úplně nového, zvaž podporu projektu <strong>The Hardware Guru</strong>. Každá podpora nám pomáhá udržet automat a AI v chodu.</p>
            <a href="/support" style={{ display: 'inline-block', background: '#eab308', color: '#000', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}>PODPOŘIT GURU PROJEKT</a>
          </div>
        </div>

        {/* NÁVRHY DALŠÍCH TIPŮ */}
        <div style={{ marginTop: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px', textAlign: 'center' }}>DALŠÍ GURU TIPY PRO TEBE</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {dalsiTipy?.map((item) => (
              <a href={`/tipy/${item.slug}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'rgba(17, 19, 24, 0.6)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={item.image_url} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{item.title}</h4>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
