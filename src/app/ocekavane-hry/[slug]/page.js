"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { Monitor, ArrowLeft, Loader2, Zap, Activity, Share2, Play } from 'lucide-react';
import Link from 'next/link';

/**
 * 🚀 GURU EXPECTED GAME DETAIL ENGINE
 * Srdce sekce Očekávané hry. Zobrazuje hloubkové technické analýzy budoucích hitů.
 * Vizuál: Cyan Neon (Future Tech)
 */

// GURU CORE: Inicializace klienta
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ExpectedGameDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname?.startsWith('/en');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from('posts').select('*');
        
        // GURU SLUG ENGINE: V angličtině prohledáme oba sloupce pro maximální stabilitu
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);
        
        const pageTitle = (isEn && data.title_en) ? data.title_en : data.title;
        document.title = `${pageTitle} | Guru Technical Preview`;
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return <div style={center}><Loader2 className="animate-spin" size={48} color="#66fcf1" /></div>;
  if (!item) return <div style={center}><h1>{isEn ? 'PREVIEW NOT FOUND' : 'PREVIEW NENALEZENO'}</h1></div>;

  const title = (isEn && item.title_en) ? item.title_en : item.title;
  const description = (isEn && item.description_en) ? item.description_en : item.description;
  const content = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <div style={pageWrapper}>
      <style>{`
        .article-body h2 { color: #66fcf1; margin: 40px 0 20px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid rgba(102, 252, 241, 0.2); padding-bottom: 10px; }
        .article-body p { line-height: 1.8; margin-bottom: 25px; font-size: 1.15rem; color: #e5e7eb; }
        .article-body ul { margin-bottom: 30px; list-style: none; padding-left: 0; }
        .article-body li { position: relative; padding-left: 30px; margin-bottom: 12px; font-size: 1.1rem; }
        .article-body li::before { content: "⚡"; position: absolute; left: 0; color: #66fcf1; }
        .article-body pre { background: #000 !important; border: 1px solid #333; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 20px 0; }
        .article-body code { color: #66fcf1; font-family: monospace; }
        .guru-video-container { margin: 50px 0; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 24px; overflow: hidden; background: #000; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
      `}</style>

      <article style={container}>
        <div style={contentBoxStyle}>
          <header style={{ marginBottom: '50px' }}>
            <Link href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"} style={backLink}>
              <ArrowLeft size={16} /> {isEn ? 'BACK TO PREVIEWS' : 'ZPĚT NA PREVIEW'}
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#66fcf1', marginTop: '30px', marginBottom: '20px' }}>
                <Monitor size={40} />
                <span style={badgeStyle}>{isEn ? 'TECHNICAL PREVIEW' : 'TECHNICKÝ ROZBOR'}</span>
            </div>
            
            <h1 style={mainTitle}>{title}</h1>
          </header>

          {/* 🚀 TECH BRIEF PANEL (GURU INSIGHT) */}
          {description && (
            <div style={descPanel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '15px' }}>
                <Activity size={20} />
                <span style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>Guru Technical Insight</span>
              </div>
              <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '600', lineHeight: '1.5' }}>
                {description}
              </div>
            </div>
          )}

          {/* 🖼️ HERO IMAGE */}
          {item.image_url && !item.trailer && (
            <div style={imageWrapper}>
                <img src={item.image_url} alt={title} style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }} />
            </div>
          )}

          {/* 📝 HLAVNÍ TEXT ANALÝZY */}
          <div 
            className="article-body" 
            dangerouslySetInnerHTML={{ __html: content || '...' }} 
          />

          {/* 🛡️ VIDEO FALLBACK: Pokud video není v textu, ale máme ho v DB sloupci 'trailer' */}
          {item.trailer && !content.includes('iframe') && !content.includes('video') && (
             <div className="guru-video-container">
                <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontWeight: '900', background: 'rgba(255,255,255,0.02)' }}>
                   <Play size={18} fill="#66fcf1" /> {isEn ? 'OFFICIAL MEDIA' : 'OFICIÁLNÍ MÉDIA'}
                </div>
                <div style={{ aspectRatio: '16/9' }}>
                   {item.trailer.includes('youtube.com') || item.trailer.includes('youtu.be')
                     ? <iframe width="100%" height="100%" src={item.trailer} frameBorder="0" allowFullScreen></iframe>
                     : <video width="100%" height="100%" controls style={{ display: 'block' }}><source src={item.trailer} type="video/mp4"></video>
                   }
                </div>
             </div>
          )}

          {/* 🛡️ GURU SUPPORT SHIELD */}
          <div style={guruShield}>
            <Zap size={44} color="#66fcf1" fill="#66fcf1" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(102, 252, 241, 0.4))' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
              {isEn ? 'SUPPORT GURU TECH' : 'PODPOŘ GURU TECHNOLOGIE'}
            </h3>
            <p style={{ color: '#d1d5db', margin: '0 auto 35px', maxWidth: '600px', fontSize: '16px' }}>
              {isEn 
                ? 'Keep this independent analysis system running. No ads, just pure hardware data.' 
                : 'Udržuj tento nezávislý analytický systém v chodu. Bez reklam, jen čistá technická fakta.'}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
                DARY / REVOLUT
              </Link>
              
              {/* 📰 GOOGLE CONTRIBUTION BUTTON */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '48px' }}>
                <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
              </div>

              <button 
                onClick={() => {
                  const dummy = document.createElement('input');
                  document.body.appendChild(dummy);
                  dummy.value = window.location.href;
                  dummy.select();
                  document.execCommand('copy');
                  document.body.removeChild(dummy);
                  // Použití custom UI místo alert() by bylo lepší, ale pro rychlou odezvu necháváme standardní Guru feedback
                }} 
                style={shareBtn}
              >
                <Share2 size={18} /> {isEn ? 'SHARE' : 'SDÍLET'}
              </button>
            </div>
          </div>
        </div>
      </article>
      
      <footer style={{ padding: '80px 20px 40px', textAlign: 'center', opacity: 0.4 }}>
         <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '900', letterSpacing: '2px' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE PREVIEW ENGINE
         </p>
      </footer>
    </div>
  );
}

// --- MASTER STYLES ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px 40px' };
const container = { maxWidth: '950px', margin: '0 auto' };
const contentBoxStyle = { background: 'rgba(10, 11, 13, 0.97)', padding: '60px 50px', borderRadius: '45px', border: '1px solid rgba(102, 252, 241, 0.15)', boxShadow: '0 50px 120px rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 68px)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '0.95', letterSpacing: '-2px' };
const badgeStyle = { background: 'rgba(102, 252, 241, 0.1)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '950', border: '1px solid #66fcf1', letterSpacing: '1px' };
const descPanel = { background: 'rgba(255,255,255,0.03)', borderLeft: '5px solid #66fcf1', padding: '35px', margin: '40px 0 60px 0', borderRadius: '0 24px 24px 0', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)' };
const imageWrapper = { margin: '50px 0 70px' };
const guruShield = { marginTop: '100px', padding: '60px 40px', background: 'rgba(102, 252, 241, 0.04)', borderRadius: '40px', border: '1px solid #66fcf1', textAlign: 'center', boxShadow: '0 0 50px rgba(102, 252, 241, 0.1)' };
const supportBtn = { background: '#66fcf1', color: '#0b0c10', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', fontSize: '14px', transition: '0.2s', display: 'inline-flex', alignItems: 'center' };
const shareBtn = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #333', padding: '14px 25px', borderRadius: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '900', fontSize: '14px' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' };
