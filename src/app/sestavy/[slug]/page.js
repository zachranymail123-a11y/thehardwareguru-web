import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { Home, Lightbulb, Book, PenTool, Cpu, Wallet, Rocket, Share2, Heart, ShieldCheck, ShoppingCart, MessageSquare, MonitorPlay, Youtube, ChevronLeft } from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU SESTAVY ENGINE V1.6 (MOBILE OPTIMIZED & ADS SEPARATION)
 * 🚀 CÍL: Maximální monetizace skrze Seznam Partner a perfektní zobrazení PC buildů na mobilu.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function generateMetadata({ params }) {
  const p = await params;
  const isEn = p.slug.startsWith('en-');
  const cleanSlug = p.slug.replace(/^en-/, '');

  const { data: sestava } = await supabase
    .from('sestavy')
    .select('*')
    .or(`slug.eq."${cleanSlug}",slug.eq."${p.slug}"`)
    .single();

  if (!sestava) return { title: 'Sestava nenalezena | Hardware Guru' };

  const title = isEn ? (sestava.title_en || sestava.title) : sestava.title;

  return {
    title: `${title} | The Hardware Guru`,
    description: isEn 
      ? `Guru component selection for ${sestava.usage} with a budget of ${sestava.total_price} CZK.`
      : `Guru výběr komponent pro ${sestava.usage} s rozpočtem ${sestava.total_price} Kč.`,
    alternates: {
      canonical: `https://www.thehardwareguru.cz/sestavy/${sestava.slug}`,
      languages: {
        'en': `https://www.thehardwareguru.cz/en/sestavy/${sestava.slug}`,
        'cs': `https://www.thehardwareguru.cz/sestavy/${sestava.slug}`
      }
    }
  };
}

export default async function SestavaDetail({ params }) {
  const p = await params;
  const isEn = p.slug.startsWith('en-');
  const cleanSlug = p.slug.replace(/^en-/, '');

  const { data: sestava } = await supabase
    .from('sestavy')
    .select('*')
    .or(`slug.eq."${cleanSlug}",slug.eq."${p.slug}"`)
    .single();

  if (!sestava) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Sestava nenalezena / PC build not found.</div>;

  const displayTitle = isEn ? (sestava.title_en || sestava.title) : sestava.title;
  const displayContent = isEn ? (sestava.content_en || sestava.content) : sestava.content;

  // Google Golden Rich: Product Schema
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": displayTitle,
    "image": sestava.image_url,
    "description": isEn ? `Custom PC Build for ${sestava.usage}` : `Herní PC sestava pro ${sestava.usage}`,
    "brand": { "@type": "Brand", "name": "The Hardware Guru" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "CZK",
      "price": sestava.total_price,
      "availability": "https://schema.org/InStock",
      "url": `https://www.thehardwareguru.cz/sestavy/${sestava.slug}`
    }
  };

  return (
    <div className="guru-sestava-wrapper" style={pageContainerStyle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; margin-bottom: 40px; }
        .ad-mobile-wrapper { display: none; width: 100%; margin-bottom: 30px; }
        
        .comp-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; background: rgba(255,255,255,0.03); border-radius: 18px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; gap: 15px; }
        .comp-item:hover { background: rgba(168, 85, 247, 0.05); border-color: rgba(168, 85, 247, 0.2); transform: translateX(5px); }

        .guru-social-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 25px; border-radius: 14px; font-weight: 900; text-decoration: none; transition: 0.3s; text-transform: uppercase; border: none; font-size: 14px; }
        .guru-social-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }

        @media (max-width: 768px) {
            .guru-sestava-wrapper { background-attachment: scroll !important; }
            .nav-sestavy { gap: 15px !important; padding: 15px !important; overflow-x: auto; justify-content: flex-start !important; }
            .hero-sestava { height: 40vh !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; }
            .glass-card-main { padding: 25px 15px !important; border-radius: 24px !important; margin-bottom: 60px !important; }
            .comp-item { flex-direction: column; align-items: flex-start !important; padding: 15px !important; gap: 12px !important; }
            .comp-price-box { width: 100%; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; border-top: 1px solid rgba(255,255,255,0.05); paddingTop: 12px; }
            .buy-btn-guru { padding: 10px 20px !important; font-size: 12px !important; }
            .sestava-title { font-size: 1.8rem !important; }
            .guru-comment-text { font-size: 1rem !important; line-height: 1.6 !important; }
            .socials-row { flex-direction: column; }
            .guru-social-btn { width: 100%; }
        }
      `}} />

      <nav className="nav-sestavy" style={navStyle}>
        <a href={isEn ? "/?lang=en" : "/"} style={navItemStyle}><Home size={18} /> {isEn ? 'HOME' : 'DOMŮ'}</a>
        <a href={isEn ? "/sestavy?lang=en" : "/sestavy"} style={{...navItemStyle, color: '#a855f7'}}><Cpu size={18} /> {isEn ? 'BUILDS' : 'SESTAVY'}</a>
        <a href={isEn ? "/rady?lang=en" : "/rady"} style={navItemStyle}><PenTool size={18} /> {isEn ? 'GUIDES' : 'RADY'}</a>
      </nav>

      <div className="hero-sestava" style={heroStyle(sestava.image_url)}>
        <div style={heroOverlayStyle}>
          <div style={contentWidthStyle}>
            <div style={badgeStyle}>{sestava.usage}</div>
            <h1 className="sestava-title" style={titleStyle}>{displayTitle}</h1>
            <div style={priceBadgeStyle}><Wallet size={24} /> {sestava.total_price.toLocaleString()} {isEn ? 'CZK' : 'Kč'}</div>
          </div>
        </div>
      </div>

      <main style={contentWidthStyle}>
        
        {/* 🔥 AD SLOT #1: TOP PLACEMENT (STRIKTNÍ SEPARACE) */}
        <div className="ad-desktop-wrapper">
            <SeznamAd zoneId={408654} width={970} height={210} />
        </div>
        <div className="ad-mobile-wrapper">
            <SeznamAd zoneId={408651} width={300} height={250} />
        </div>

        <div className="glass-card-main" style={glassCardStyle}>
          <h2 style={sectionTitleStyle}><Rocket size={24} color="#a855f7" /> {isEn ? 'Component Selection' : 'Výběr komponent'}</h2>
          
          <div style={componentsGridStyle}>
            {sestava.components.map((comp, idx) => (
              <React.Fragment key={idx}>
                <div className="comp-item">
                  <div style={{ flex: 1 }}>
                    <span style={partLabelStyle}>{comp.part}</span>
                    <div style={partNameStyle}>{comp.name}</div>
                  </div>
                  <div className="comp-price-box" style={priceAndActionStyle}>
                    <div style={partPriceStyle}>{comp.price?.toLocaleString()} {isEn ? 'CZK' : 'Kč'}</div>
                    {comp.link && (
                      <a href={comp.link} target="_blank" rel="nofollow sponsored" className="buy-btn-guru" style={buyButtonStyle}>
                        <ShoppingCart size={14} /> {isEn ? 'BUY' : 'KOUPIT'}
                      </a>
                    )}
                  </div>
                </div>

                {/* 🔥 AD SLOT #2: GRID INJECTION (POUZE MOBIL PO 4. POLOŽCE) */}
                {idx === 3 && (
                  <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={250} />
                  </div>
                )}
              </React.Fragment>
            ))}
            
            <div className="comp-item">
              <div style={{ flex: 1 }}>
                <span style={partLabelStyle}>{isEn ? 'PC Case' : 'Case (Skříň)'}</span>
                <div style={partNameStyle}>{isEn ? 'By your preference' : 'Dle vlastního výběru'}</div>
              </div>
              <div className="comp-price-box" style={priceAndActionStyle}>
                <div style={partPriceStyle}>--- {isEn ? 'CZK' : 'Kč'}</div>
                <a href="https://www.alza.cz/skrine/18849057.htm" target="_blank" rel="nofollow sponsored" className="buy-btn-guru" style={buyButtonStyle}>
                  <ShoppingCart size={14} /> {isEn ? 'BROWSE' : 'VYBRAT'}
                </a>
              </div>
            </div>
          </div>

          <hr style={dividerStyle} />

          <h2 style={sectionTitleStyle}><Lightbulb size={24} color="#a855f7" /> {isEn ? 'Guru Commentary' : 'Guru komentář'}</h2>
          <div className="guru-comment-text" style={textContentStyle}>{displayContent}</div>

          <div className="support-card-main" style={supportCardStyle}>
            <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#eab308', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>
                {isEn ? 'Need help with this build?' : 'Chceš tuhle mašinu domů?'}
            </h3>
            <p style={{ color: '#d1d5db', margin: '15px 0 25px', fontSize: '1.1rem' }}>
                {isEn ? 'Join our Discord for custom hardware tuning!' : 'Zastav se u nás na Discordu pro individuální ladění!'}
            </p>
            <div className="socials-row" style={socialsContainerStyle}>
              <a href="https://discord.com/invite/n7xThr8" target="_blank" className="guru-social-btn" style={{ background: '#5865F2', color: '#fff' }}><MessageSquare size={18} /> DISCORD</a>
              <a href="https://kick.com/thehardwareguru" target="_blank" className="guru-social-btn" style={{ background: '#53fc18', color: '#000' }}><MonitorPlay size={18} /> KICK</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const pageContainerStyle = { backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const navStyle = { display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', position: 'sticky', top: 0, zIndex: 100 };
const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' };
const heroStyle = (url) => ({ width: '100%', height: '50vh', position: 'relative', backgroundImage: `linear-gradient(to bottom, rgba(10,11,13,0.2), #0a0b0d), url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' });
const heroOverlayStyle = { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px' };
const contentWidthStyle = { maxWidth: '900px', margin: '0 auto', padding: '0 15px' };
const badgeStyle = { color: '#a855f7', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '11px', marginBottom: '10px', background: 'rgba(168, 85, 247, 0.1)', padding: '5px 12px', borderRadius: '50px', display: 'inline-block', border: '1px solid rgba(168, 85, 247, 0.3)' };
const titleStyle = { fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', lineHeight: '1.1', marginBottom: '20px', textTransform: 'uppercase' };
const priceBadgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(168, 85, 247, 0.2)', padding: '12px 25px', borderRadius: '16px', border: '1px solid #a855f7', fontSize: '22px', fontWeight: '950', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.2)' };
const glassCardStyle = { background: 'rgba(17, 19, 24, 0.85)', padding: '45px', borderRadius: '35px', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: '100px', backdropFilter: 'blur(15px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' };
const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '22px', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' };
const componentsGridStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const priceAndActionStyle = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '140px' };
const partLabelStyle = { color: '#a855f7', fontWeight: '950', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' };
const partNameStyle = { fontWeight: '700', color: '#fff', fontSize: '17px', marginTop: '4px' };
const partPriceStyle = { fontWeight: '950', color: '#fff', fontSize: '18px' };
const buyButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(168, 85, 247, 0.1))', color: '#fff', padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.4)', fontSize: '12px', fontWeight: '900', textDecoration: 'none', transition: '0.2s', whiteSpace: 'nowrap' };
const textContentStyle = { fontSize: '1.1rem', lineHeight: '1.9', color: '#d1d5db', whiteSpace: 'pre-wrap' };
const dividerStyle = { border: 0, borderTop: '1px solid rgba(168, 85, 247, 0.15)', margin: '50px 0' };
const supportCardStyle = { marginTop: '80px', padding: '45px 30px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.2)', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' };
const socialsContainerStyle = { display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' };
