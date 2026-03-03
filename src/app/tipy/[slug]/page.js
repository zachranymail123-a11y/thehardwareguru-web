import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { ChevronLeft, Play, Cpu } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function TipDetail({ params }) {
  // Načteme konkrétní tip podle slug z URL
  const { data: tip, error } = await supabase
    .from('tipy')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tip || error) {
    return (
      <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '64px' }}>404</h1>
          <p>Guru tento návod v databázi nenašel.</p>
          <a href="/tipy" style={{ color: '#a855f7', textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>Zpět na všechny tipy</a>
        </div>
      </div>
    );
  }

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
      {/* HEADER S OBRÁZKEM */}
      <div style={{ width: '100%', height: '50vh', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={tip.image_url} 
          alt={tip.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.3' }} 
        />
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          background: 'linear-gradient(to top, #0a0b0d, transparent)',
          padding: '60px 20px'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <a href="/tipy" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
              <ChevronLeft size={16} /> ZPĚT NA TIPY
            </a>
            <span style={{ color: '#a855f7', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>{tip.category}</span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', margin: '15px 0', lineHeight: '1.1' }}>{tip.title}</h1>
          </div>
        </div>
      </div>

      {/* OBSAH ČLÁNKU */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ 
          background: 'rgba(17, 19, 24, 0.7)', 
          backdropFilter: 'blur(15px)', 
          padding: '40px', 
          borderRadius: '32px', 
          border: '1px solid rgba(168, 85, 247, 0.2)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          {/* ÚVODNÍ SHRNUTÍ */}
          <p style={{ 
            fontSize: '20px', 
            color: '#d1d5db', 
            lineHeight: '1.6', 
            marginBottom: '40px', 
            borderLeft: '4px solid #a855f7', 
            paddingLeft: '25px',
            fontStyle: 'italic'
          }}>
            {tip.description}
          </p>

          {/* HLAVNÍ NÁVOD - CONTENT */}
          <div style={{ 
            fontSize: '18px', 
            lineHeight: '1.8', 
            color: '#e5e7eb',
            whiteSpace: 'pre-wrap' // Zachová odřádkování z databáze
          }}>
            {tip.content ? tip.content : "Guru pro tento tip připravuje podrobný návod..."}
          </div>

          {/* VIDEO SEKCE */}
          {tip.youtube_id && (
            <div style={{ marginTop: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#ff0000', padding: '8px', borderRadius: '50%' }}>
                  <Play size={16} fill="#fff" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Video Manuál</h3>
              </div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(255,0,0,0.2)' }}>
                <iframe 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={`https://www.youtube.com/embed/${tip.youtube_id}`}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ČLÁNKU */}
        <div style={{ marginTop: '40px', textAlign: 'center', opacity: '0.6', fontSize: '14px' }}>
          <p>© 2026 The Hardware Guru | Všechny návody jsou generovány AI expertem na hardware.</p>
        </div>
      </main>
    </div>
  );
}
