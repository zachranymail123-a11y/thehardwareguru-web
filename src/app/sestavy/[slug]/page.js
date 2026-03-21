import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { Home, Lightbulb, Book, PenTool, Cpu, Wallet, Rocket, Share2, Heart, ShieldCheck, ShoppingCart, MessageSquare, MonitorPlay, Youtube } from 'lucide-react';

/**
 * GURU SESTAVY ENGINE V1.4 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Monetizace detailů sestav skrze strategické A-ADS sloty.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function generateMetadata({ params }) {
  const p = await params;
  const { data: sestava } = await supabase
    .from('sestavy')
    .select('*')
    .eq('slug', p.slug)
    .single();

  if (!sestava) return { title: 'Sestava nenalezena | Hardware Guru' };

  return {
    title: `${sestava.title} | The Hardware Guru`,
    description: `Guru výběr komponent pro ${sestava.usage} s rozpočtem ${sestava.total_price} Kč.`,
    alternates: {
      canonical: `https://www.thehardwareguru.cz/sestavy/${sestava.slug}`,
    }
  };
}

export default async function SestavaDetail({ params }) {
  const p = await params;
  const { data: sestava } = await supabase
    .from('sestavy')
    .select('*')
    .eq('slug', p.slug)
    .single();

  if (!sestava) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Sestava nenalezena.</div>;

  return (
    <div style={pageContainerStyle}>
      <nav style={navStyle}>
        <a href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</a>
        <a href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</a>
        <a href="/sestavy" style={{...navItemStyle, color: '#a855f7'}}><Cpu size={18} /> SESTAVY</a>
        <a href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</a>
      </nav>

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
        {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD HERO SEKCI */}
        <div className="guru-sestava-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <div style={glassCardStyle}>
          <h2 style={sectionTitleStyle}><Rocket size={24} color="#a855f7" /> Výběr komponent</h2>
          <div style={componentsGridStyle}>
            {sestava.components.map((comp, idx) => (
              <React.Fragment key={idx}>
                <div style={componentItemStyle}>
                  <div style={{ flex: 1 }}>
                    <span style={partLabelStyle}>{comp.part}</span>
                    <div style={partNameStyle}>{comp.name}</div>
                  </div>
                  <div style={priceAndActionStyle}>
                    <div style={partPriceStyle}>{comp.price?.toLocaleString()} Kč</div>
                    {comp.link && (
                      <a href={comp.link} target="_blank" rel="nofollow sponsored" style={buyButtonStyle}>
                        <ShoppingCart size={14} /> KOUPIT
                      </a>
                    )}
                  </div>
                </div>

                {/* 🔥 ADS SLOT #2: MID-COMPONENTS INJECTION (PO 4. KOMPONENTĚ) */}
                {idx === 3 && (
                  <div className="guru-sestava-ad-slot" style={{ border: 'none', margin: '15px 0' }}>
                    <span className="ad-label">Sponsored Hardware Link</span>
                    <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                    <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                  </div>
                )}
              </React.Fragment>
            ))}
            
            <div style={componentItemStyle}>
              <div style={{ flex: 1 }}>
                <span style={partLabelStyle}>Case (Skříň)</span>
                <div style={partNameStyle}>Dle vlastního výběru</div>
              </div>
              <div style={priceAndActionStyle}>
                <div style={partPriceStyle}>--- Kč</div>
                <a href="https://www.alza.cz/skrine/18849057.htm?evt=re&exps=case" target="_blank" rel="nofollow sponsored" style={buyButtonStyle}>
                  <ShoppingCart size={14} /> VYBRAT
                </a>
              </div>
            </div>
          </div>

          <hr style={dividerStyle} />

          <h2 style={sectionTitleStyle}><Lightbulb size={24} color="#a855f7" /> Guru komentář</h2>
          <div style={textContentStyle}>{sestava.content}</div>

          <div style={supportCardStyle}>
            <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#eab308', fontSize: '24px', fontWeight: 'bold' }}>Chceš tuhle mašinu domů?</h3>
            <p style={{ color: '#d1d5db', margin: '15px 0 25px' }}>Zastav se u nás na Discordu pro individuální ladění!</p>
            <div style={socialsContainerStyle}>
              <a href="https://discord.com/invite/n7xThr8" target="_blank" style={socialBtnStyle('#5865F2')}><MessageSquare size={16} /> DISCORD</a>
              <a href="https://kick.com/thehardwareguru" target="_blank" style={socialBtnStyle('#53fc18', '#000')}><MonitorPlay size={16} /> KICK</a>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-sestava-ad-slot { margin-bottom: 30px; padding: 15px; background: rgba(168, 85, 247, 0.02); border: 1px solid rgba(168, 85, 247, 0.1); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }
        @media (max-width: 768px) { .ad-desktop { display: none; } .ad-mobile { display: block; } }
      `}} />
    </div>
  );
}

const pageContainerStyle = { backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const navStyle = { display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', position: 'sticky', top: 0, zIndex: 100 };
const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
const heroStyle = (url) => ({ width: '100%', height: '50vh', position: 'relative', backgroundImage: `linear-gradient(to bottom, transparent, #0a0b0d), url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' });
const heroOverlayStyle = { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px' };
const contentWidthStyle = { maxWidth: '900px', margin: '0 auto' };
const badgeStyle = { color: '#a855f7', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', marginBottom: '10px' };
const titleStyle = { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px' };
const priceBadgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(168, 85, 247, 0.2)', padding: '10px 20px', borderRadius: '15px', border: '1px solid #a855f7', fontSize: '20px', fontWeight: 'bold' };
const glassCardStyle = { background: 'rgba(17, 19, 24, 0.8)', padding: '40px', borderRadius: '35px', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: '100px', backdropFilter: 'blur(10px)' };
const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '24px', fontWeight: '900', marginBottom: '30px' };
const componentsGridStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const componentItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', gap: '15px' };
const priceAndActionStyle = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '120px' };
const partLabelStyle = { color: '#a855f7', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' };
const partNameStyle = { fontWeight: '500', color: '#e5e7eb', fontSize: '16px', marginTop: '4px' };
const partPriceStyle = { fontWeight: 'bold', color: '#fff', fontSize: '17px' };
const buyButtonStyle = { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.4)', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', transition: '0.2s', whiteSpace: 'nowrap' };
const textContentStyle = { fontSize: '18px', lineHeight: '1.8', color: '#d1d5db', whiteSpace: 'pre-wrap' };
const dividerStyle = { border: 0, borderTop: '1px solid rgba(168, 85, 247, 0.1)', margin: '40px 0' };
const supportCardStyle = { marginTop: '60px', padding: '40px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center' };
const socialsContainerStyle = { display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' };
const socialBtnStyle = (bgColor, textColor = '#fff') => ({ display: 'inline-flex', alignItems: 'center', gap: '8px', background: bgColor, color: textColor, padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' });
