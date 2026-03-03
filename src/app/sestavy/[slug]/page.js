import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { Home, Lightbulb, Book, PenTool, Cpu, Wallet, Rocket, Share2, Heart, ShieldCheck, ShoppingCart } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. SEO METADATA PRO GOOGLE DISCOVER
export async function generateMetadata({ params }) {
  const { data: sestava } = await supabase
    .from('sestavy')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!sestava) return { title: 'Sestava nenalezena | The Hardware Guru' };

  return {
    title: `${sestava.title} | The Hardware Guru`,
    description: `Guru výběr komponent pro ${sestava.usage} s rozpočtem ${sestava.total_price} Kč. Podívej se na nejlepší aktuální hardware!`,
    openGraph: {
      title: sestava.title,
      description: `Profesionálně sestavený herní stroj od Guru. Cena: ${sestava.total_price} Kč.`,
      url: `https://www.thehardwareguru.cz/sestavy/${sestava.slug}`,
      images: [{ url: sestava.image_url, width: 1200, height: 630 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: sestava.title,
      images: [sestava.image_url],
    },
  };
}

export default async function SestavaDetail({ params }) {
  const { data: sestava } = await supabase
    .from('sestavy')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!sestava) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Guru tuhle sestavu v databázi nenašel.</div>;

  return (
    <div style={pageContainerStyle}>
      {/* JSON-LD PRO GOOGLE */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": sestava.title,
            "image": [sestava.image_url],
            "datePublished": sestava.created_at,
            "author": { "@type": "Person", "name": "The Hardware Guru" },
            "description": sestava.description
          })
        }}
      />

      {/* NAVIGACE */}
      <nav style={navStyle}>
        <a href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</a>
        <a href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</a>
        <a href="/sestavy" style={{...navItemStyle, color: '#a855f7'}}><Cpu size={18} /> SESTAVY</a>
        <a href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</a>
      </nav>

      {/* HERO SEKCE */}
      <div style={heroStyle(sestava.image_url)}>
        <div style={heroOverlayStyle}>
          <div style={contentWidthStyle}>
            <div style={badgeStyle}>{sestava.usage}</div>
            <h1 style={titleStyle}>{sestava.title}</h1>
            <div style={priceBadgeStyle}><Wallet size={24} /> {sestava.total_price.toLocaleString()} Kč</div>
          </div>
        </div>
      </div>

      <main style={contentWidthStyle}>
        <div style={glassCardStyle}>
          {/* SEZNAM KOMPONENT */}
          <h2 style={sectionTitleStyle}><Rocket size={24} color="#a855f7" /> Výběr komponent (Ověřené ceny)</h2>
          <div style={componentsGridStyle}>
            {sestava.components.map((comp, idx) => (
              <div key={idx} style={componentItemStyle}>
                <div style={{ flex: 1 }}>
                  <span style={partLabelStyle}>{comp.part}</span>
                  <div style={partNameStyle}>{comp.name}</div>
                </div>
                
                <div style={priceAndActionStyle}>
                  <div style={partPriceStyle}>{comp.price?.toLocaleString()} Kč</div>
                  {comp.link && (
                    <a 
                      href={comp.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={buyButtonStyle}
                    >
                      <ShoppingCart size={14} /> KOUPIT
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <hr style={dividerStyle} />

          {/* GURU VYSVĚTLENÍ */}
          <h2 style={sectionTitleStyle}><Lightbulb size={24} color="#a855f7" /> Guru komentář</h2>
          <div style={textContentStyle}>
            {sestava.content}
          </div>

          {/* SUPPORT SEKCE */}
          <div style={supportCardStyle}>
            <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#eab308', fontSize: '24px', fontWeight: 'bold' }}>Chceš tuhle mašinu domů?</h3>
            <p style={{ color: '#d1d5db', margin: '15px 0 30px' }}>
              Tato sestava využívá aktuální ceny z českých e-shopů. Pokud ti nějaký komponent chybí nebo chceš úpravu na míru, stav se u nás na Discordu!
            </p>
            <a href="https://discord.gg/TheHardwareGuru" target="_blank" style={ctaButtonStyle}>
              <Share2 size={20} /> SDÍLET SESTAVU
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- STYLY ---

const pageContainerStyle = {
  backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff',
  fontFamily: 'sans-serif', backgroundImage: 'url("/bg-guru.png")',
  backgroundSize: 'cover', backgroundAttachment: 'fixed'
};

const navStyle = {
  display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px',
  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(168, 85, 247, 0.2)', position: 'sticky', top: 0, zIndex: 100
};

const navItemStyle = {
  color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold',
  display: 'flex', alignItems: 'center', gap: '8px'
};

const heroStyle = (url) => ({
  width: '100%', height: '50vh', position: 'relative',
  backgroundImage: `linear-gradient(to bottom, transparent, #0a0b0d), url(${url})`,
  backgroundSize: 'cover', backgroundPosition: 'center'
});

const heroOverlayStyle = { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px' };
const contentWidthStyle = { maxWidth: '900px', margin: '0 auto' };
const badgeStyle = { color: '#a855f7', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', marginBottom: '10px' };
const titleStyle = { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px' };
const priceBadgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(168, 85, 247, 0.2)', padding: '10px 20px', borderRadius: '15px', border: '1px solid #a855f7', fontSize: '20px', fontWeight: 'bold' };
const glassCardStyle = { background: 'rgba(17, 19, 24, 0.8)', padding: '40px', borderRadius: '35px', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: '100px', backdropFilter: 'blur(10px)' };
const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '24px', fontWeight: '900', marginBottom: '30px' };
const componentsGridStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };

const componentItemStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', gap: '15px'
};

const priceAndActionStyle = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '120px' };

const partLabelStyle = { color: '#a855f7', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' };
const partNameStyle = { fontWeight: '500', color: '#e5e7eb', fontSize: '16px', marginTop: '4px' };
const partPriceStyle = { fontWeight: 'bold', color: '#fff', fontSize: '17px' };

const buyButtonStyle = {
  display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(168, 85, 247, 0.2)',
  color: '#a855f7', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.4)',
  fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', transition: '0.2s'
};

const textContentStyle = { fontSize: '18px', lineHeight: '1.8', color: '#d1d5db', whiteSpace: 'pre-wrap' };
const dividerStyle = { border: 0, borderTop: '1px solid rgba(168, 85, 247, 0.1)', margin: '40px 0' };
const supportCardStyle = { marginTop: '60px', padding: '40px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center' };
const ctaButtonStyle = { display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#eab308', color: '#000', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' };
