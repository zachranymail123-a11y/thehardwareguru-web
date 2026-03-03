import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { ChevronLeft, Play, Heart, Coffee, ShieldCheck } from 'lucide-react';

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

  // 2. Načtení 3 dalších náhodných tipů pro doporučení (nepřidáváme ten samý)
  const { data: dalsiTipy } = await supabase
    .from('tipy')
    .select('*')
    .neq('slug', params.slug)
    .limit(3);

  if (!tip) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Guru tento tip nenašel.</div>;

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
      
      {/* SOCIAL & SUPPORT MENU */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '30px 20px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
        <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" style={{ color: '#53fc18', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: '1px solid #53fc18', padding: '8px 16px', borderRadius: '12px', transition: '0.3s' }}>KICK</a>
        <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: '1px solid #ff0000', padding: '8px 16px', borderRadius: '12px' }}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={{ color: '#5865F2', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: '1px solid #5865F2', padding: '8px 16px', borderRadius: '12px' }}>DISCORD</a>
        <a href="/support" style={{ color: '#eab308', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: '1px solid #eab308', padding: '8px 16px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)' }}>SUPPORT</a>
      </div>

      {/* HERO SECTION */}
      <div style={{ width: '100%', height: '45vh', position: 'relative' }}>
        <img src={tip.image_url} alt={tip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.4' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, #0a0b0d, transparent)', padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <a href="/tipy" style={{ color: '#a855f7', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
              <ChevronLeft size={18} /> ZPĚT DO GURU DATABÁZE
            </a>
            <span style={{ color: '#a855f7', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>{tip.category}</span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', marginTop: '15px', lineHeight: '1.1' }}>{tip.title}</h1>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 100px 20px' }}>
        <div style={{ background: 'rgba(17, 19, 24, 0.8)', padding: '45px', borderRadius: '35px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          {/* TEXT NÁVODU */}
          <div style={{ fontSize: '19px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#e5e7eb' }}>
            {tip.content}
          </div>

          {/* VIDEO BOX */}
          {tip.youtube_id && (
            <div style={{ marginTop: '60px' }}>
              <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
                <div style={{ background: '#ff0000', padding: '6px', borderRadius: '50%' }}><Play size={18} fill="#fff" /></div>
                Video manuál k tématu:
              </h3>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <iframe 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={`https://www.youtube.com/embed/${tip.youtube_id}`} 
                  frameBorder="0" allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* OPRAVENÁ SUPPORT SEKCE PODLE TVÉHO ZADÁNÍ */}
          <div style={{ 
            marginTop: '80px', 
            padding: '40px', 
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(0,0,0,0) 100%)', 
            borderRadius: '28px', 
            border: '1px solid rgba(234, 179, 8, 0.3)', 
            textAlign: 'center' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
               <ShieldCheck size={40} color="#eab308" />
            </div>
            <h3 style={{ color: '#eab308', fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Dalo ti to něco nového?</h3>
            <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>
              Pokud ti tento tip pomohl nebo ses dozvěděl něco úplně nového, zvaž podporu projektu <strong>The Hardware Guru</strong>. Každá podpora nám pomáhá udržet provoz serveru a všech služeb v provozu. Děkujeme za každý dar!
            </p>
            <a href="/support" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: '#eab308', 
              color: '#000', 
              padding: '16px 35px', 
              borderRadius: '16px', 
              fontWeight: '900', 
              textDecoration: 'none',
              boxShadow: '0 10px 20px rgba(234, 179, 8, 0.2)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Heart size={20} fill="#000" /> PODPOŘIT PROJEKT
            </a>
          </div>
        </div>

        {/* DYNAMICKÉ NÁVRHY DALŠÍCH TIPŮ */}
        <div style={{ marginTop: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
            <div style={{ height: '2px', background: '#a855f7', flexGrow: 1, opacity: 0.3 }}></div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '1px' }}>DALŠÍ GURU NÁVODY</h2>
            <div style={{ height: '2px', background: '#a855f7', flexGrow: 1, opacity: 0.3 }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {dalsiTipy?.map((item) => (
              <a href={`/tipy/${item.slug}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ 
                  background: 'rgba(17, 19, 24, 0.6)', 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a855f755';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px' }}>
                    <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold' }}>{item.category}</span>
                    <h4 style={{ fontSize: '17px', fontWeight: 'bold', margin: '10px 0 0 0', lineHeight: '1.3' }}>{item.title}</h4>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
