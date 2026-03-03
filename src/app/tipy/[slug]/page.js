import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { ChevronLeft, Play, Heart, ShieldCheck, Home, Lightbulb, Book, PenTool } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 1. ZDE JE MAGIE PRO GOOGLE DISCOVER A SOCIÁLNÍ SÍTĚ
export async function generateMetadata({ params }) {
  const { data: tip } = await supabase
    .from('tipy')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tip) return { title: 'Tip nenalezen | The Hardware Guru' };

  return {
    title: `${tip.title} | The Hardware Guru`,
    description: tip.description,
    openGraph: {
      title: tip.title,
      description: tip.description,
      url: `https://www.thehardwareguru.cz/tipy/${tip.slug}`,
      siteName: 'The Hardware Guru',
      images: [
        {
          url: tip.image_url, // Tady si to vezme tu širokou fotku
          width: 1792,
          height: 1024,
          alt: tip.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image', // Nutí to Google a sítě použít velký náhled
      title: tip.title,
      description: tip.description,
      images: [tip.image_url],
    },
  };
}

export default async function TipDetail({ params }) {
  // 1. Načtení aktuálního tipu
  const { data: tip } = await supabase
    .from('tipy')
    .select('*')
    .eq('slug', params.slug)
    .single();

  // 2. Načtení 3 dalších náhodných tipů
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
      
      {/* 2. ZDE JE DRUHÁ ČÁST MAGIE - JSON-LD (NewsArticle Schema) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": tip.title,
            "image": [
              tip.image_url
            ],
            "datePublished": tip.created_at,
            "author": [{
                "@type": "Person",
                "name": "The Hardware Guru",
                "url": "https://www.thehardwareguru.cz"
              }],
            "publisher": {
              "@type": "Organization",
              "name": "The Hardware Guru",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.thehardwareguru.cz/logo.png" // Uprav, pokud máš logo jinde
              }
            }
          })
        }}
      />

      {/* HLAVNÍ NAVIGACE WEBU */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '25px', 
        padding: '20px', 
        background: 'rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <a href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</a>
        <a href="/tipy" style={{...navItemStyle, color: '#a855f7'}}><Lightbulb size={18} /> TIPY</a>
        <a href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</a>
        <a href="/rady" style={navItemStyle}><PenTool size={18} /> PRAKTICKÉ RADY</a>
      </nav>

      {/* SOCIAL & SUPPORT MENU */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '20px' }}>
        <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
        <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
        <a href="/support" style={socialBtnStyle('#eab308', true)}>SUPPORT</a>
      </div>

      {/* HERO SECTION */}
      <div style={{ width: '100%', height: '40vh', position: 'relative' }}>
        <img src={tip.image_url} alt={tip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.4' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, #0a0b0d, transparent)', padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <span style={{ color: '#a855f7', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>{tip.category}</span>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', marginTop: '15px', lineHeight: '1.1' }}>{tip.title}</h1>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 100px 20px' }}>
        <div style={{ background: 'rgba(17, 19, 24, 0.8)', padding: '40px', borderRadius: '35px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          
          <div style={{ fontSize: '19px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#e5e7eb' }}>
            {tip.content}
          </div>

          {tip.youtube_id && (
            <div style={{ marginTop: '60px' }}>
              <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Play size={20} fill="#ff0000" color="#ff0000" /> Video manuál:
              </h3>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '25px' }}>
                <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} src={`https://www.youtube.com/embed/${tip.youtube_id}`} frameBorder="0" allowFullScreen></iframe>
              </div>
            </div>
          )}

          {/* SUPPORT SEKCE */}
          <div style={{ marginTop: '80px', padding: '40px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center' }}>
            <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#eab308', fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Dalo ti to něco nového?</h3>
            <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              Pokud ti tento tip pomohl nebo ses dozvěděl něco úplně nového, zvaž podporu projektu <strong>The Hardware Guru</strong>. Každá podpora nám pomáhá udržet provoz serveru a všech služeb v provozu. Děkujeme za každý dar!
            </p>
            <a href="/support" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#eab308', color: '#000', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
              <Heart size={20} fill="#000" /> PODPOŘIT PROJEKT
            </a>
          </div>
        </div>

        {/* NÁVRHY DALŠÍCH TIPŮ */}
        <div style={{ marginTop: '80px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px', textAlign: 'center', opacity: 0.8 }}>DALŠÍ GURU NÁVODY</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {dalsiTipy?.map((item) => (
              <a href={`/tipy/${item.slug}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: 'rgba(17, 19, 24, 0.6)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0 }}>{item.title}</h4>
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

const navItemStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: '0.2s'
};

const socialBtnStyle = (color, isSupport = false) => ({
  color: color,
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '11px',
  border: `1px solid ${color}`,
  padding: '8px 16px',
  borderRadius: '12px',
  background: isSupport ? `${color}1a` : 'transparent'
});
