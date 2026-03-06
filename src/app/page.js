"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, ExternalLink } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [data, setData] = useState({ 
    posts: [], 
    nejnovejsiTipy: [], 
    nejnovejsiTweaky: [], 
    darci: [],
    partneri: [],
    stats: { value: 0 } 
  });
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        await supabase.rpc('increment_total_visits');
        const [p, s, t, tw, d, pa] = await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('stats').select('value').eq('name', 'total_visits').single(),
          supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('darci').select('*').order('amount', { ascending: false }).limit(20),
          supabase.from('partneri').select('*').order('created_at', { ascending: false }).limit(4)
        ]);

        setData({ 
          posts: p.data || [], 
          stats: s.data || { value: 0 }, 
          nejnovejsiTipy: t.data || [],
          nejnovejsiTweaky: tw.data || [],
          darci: d.data || [],
          partneri: pa.data || []
        });
      } catch (err) {
        console.error("Data load fail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10' };
    const isGame = post.type === 'game' || post.title.toLowerCase().includes('recenze');
    if (isGame) return { text: isEn ? 'GAME NEWS' : 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff' };
    return { text: isEn ? 'HW NEWS' : 'HW NOVINKA', color: '#ff0000', textColor: '#fff' };
  };

  return (
    <div style={globalStyles}>
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .tip-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tip-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); border-color: #a855f7; }
        .tweak-card { transition: all 0.3s ease; border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tweak-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(234, 179, 8, 0.3); border-color: #eab308; }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 15px; text-decoration: none; text-transform: uppercase; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border: none; cursor: pointer; }
        .social-btn-main:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 6px 25px rgba(0,0,0,0.5); }
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(234, 179, 8, 0.2); display: inline-block; }
        
        /* GURU FIX: Zvětšené a čitelnější boxy */
        .monetize-box { flex: 1; min-width: 320px; background: rgba(17, 19, 24, 0.9); border-radius: 24px; padding: 40px; border: 1px solid #1f2937; position: relative; overflow: hidden; text-decoration: none; color: #fff; transition: 0.3s; }
        .monetize-box:hover { border-color: #a855f7; transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
        .monetize-box.partners:hover { border-color: #eab308; }
        .monetize-box h2 { font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; }
        .monetize-box p { color: #d1d5db; fontSize: 17px; line-height: 1.6; margin-bottom: 25px; }
        
        .donor-badge { background: rgba(168, 85, 247, 0.15); color: #a855f7; padding: 6px 14px; border-radius: 8px; font-size: 14px; font-weight: 900; border: 1px solid rgba(168, 85, 247, 0.2); }
        .partner-card { background: #000; border: 1px solid #eab308; padding: 20px; borderRadius: 12px; display: flex; align-items: center; gap: 15px; margin-top: 15px; text-decoration: none; transition: 0.2s; }
        .partner-card:hover { transform: scale(1.02); background: #111; }
      `}</style>

      {/* --- BIO SEKCE --- */}
      <header style={{ ...headerStyles, margin: '0 auto 40px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '15px' }}>
              <ShieldCheck size={24} />
              <span style={{ fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>
                {isEn ? 'Your technological base' : 'Vaše technologická základna'}
              </span>
            </div>
            <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', lineHeight: '1.1' }}>
              {isEn ? <>Building the <span style={{ color: '#66fcf1' }}>Ideal Place</span> <br/> for Gamers and Geeks</> : <>Budujeme <span style={{ color: '#66fcf1' }}>Ideální Místo</span> <br/> pro Hráče a Geeky</>}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#e0e0e0', marginBottom: '35px', maxWidth: '750px' }}>
              {isEn 
                ? "Hi, I'm GURU. Hardware expert with 20 years of experience. My mission: eradicate lag, tame FPS, and support the community that keeps this scene alive."
                : "Čau, jsem GURU. S 20 lety praxe v servisu hardware vím, kde každá mašina tlačí. Moje mise: vymýtit lagy, zkrotit FPS a podpořit komunitu, co drží tuhle scénu naživu."
              }
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://kick.com/thehardwareguru" className="social-btn-main" style={{ background: '#53fc18', color: '#000' }}>KICK LIVE</a>
              <Link href={isEn ? "/en/support" : "/support"} className="social-btn-main" style={{ background: '#eab308', color: '#000' }}>
                <Heart size={18} fill="#000" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
            </div>
        </div>
        <div style={avatarStyles}>HG</div>
      </header>

      {/* 🚀 GURU MONETIZACE: DARCI & PARTNERI */}
      <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* OKNO 1: DARCI (SIN SLAVY) */}
        <Link href={isEn ? "/en/sin-slavy" : "/sin-slavy"} className="monetize-box">
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <Trophy color="#a855f7" size={36} />
              <h2>{isEn ? 'HALL OF FAME' : 'SÍŇ SLÁVY'}</h2>
           </div>
           <p>
              {isEn 
                ? 'The legends who keep the Guru engines running. **Big respect!**' 
                : 'Tihle borci drží motory Guruho v chodu. **Maximální respekt!**'}
           </p>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {data.darci.length > 0 ? data.darci.map(darce => (
                <div key={darce.id} className="donor-badge">
                  {darce.name} {darce.amount >= 500 && '💎'} {darce.amount >= 100 && darce.amount < 500 && '🔥'}
                </div>
              )) : (
                <div style={{ color: '#444', fontSize: '15px', fontWeight: 'bold' }}>{isEn ? 'Waiting for the first legends...' : 'Čekáme na první legendy...'}</div>
              )}
           </div>
           <div style={{ marginTop: '30px', fontSize: '14px', color: '#a855f7', fontWeight: '900', textTransform: 'uppercase' }}>
             {isEn ? 'SHOW FULL HALL OF FAME →' : 'ZOBRAZIT CELOU SÍŇ SLÁVY →'}
           </div>
        </Link>

        {/* OKNO 2: PARTNERI (REKLAMA) */}
        <Link href={isEn ? "/en/partneri" : "/partneri"} className="monetize-box partners">
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <Rocket color="#eab308" size={36} />
              <h2>{isEn ? 'PARTNERS' : 'PARTNEŘI'}</h2>
           </div>
           <p>
              {isEn ? (
                <><strong>Ads for web / stream / social media</strong> for supporters over 500 CZK.</>
              ) : (
                <><strong>Reklama na web / stream / sociální sítě</strong> za podporu nad 500 Kč.</>
              )}
           </p>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.partneri.length > 0 ? data.partneri.map(p => (
                <div key={p.id} className="partner-card" onClick={(e) => { e.preventDefault(); window.open(p.url, '_blank'); }}>
                  <div style={{ width: '45px', height: '45px', background: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#eab308', border: '1px solid #eab308' }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '16px', color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{isEn ? p.description_en : p.description}</div>
                  </div>
                  <ExternalLink size={18} color="#eab308" />
                </div>
              )) : (
                <div style={{ color: '#eab308', fontSize: '15px', fontWeight: '900', textDecoration: 'none', border: '2px dashed #eab308', padding: '20px', borderRadius: '16px', textAlign: 'center', textTransform: 'uppercase' }}>
                  {isEn ? '+ GET YOUR AD HERE' : '+ TVŮJ PROJEKT ZDE'}
                </div>
              )}
           </div>
           <div style={{ marginTop: '30px', fontSize: '14px', color: '#eab308', fontWeight: '900', textTransform: 'uppercase' }}>
             {isEn ? 'VIEW ALL PARTNERS →' : 'ZOBRAZIT VŠECHNY PARTNERY →'}
           </div>
        </Link>
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: '#a855f7', fontWeight: '900', fontSize: '24px' }}>GURU IS LOADING...</div>
      ) : (
        <>
          {/* --- TIPY --- */}
          <section style={sectionStyles}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>
                  GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS' : 'TIPY'}</span>
                </h2>
                <Link href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'ALL →' : 'VŠE →'}</Link>
              </div>
            </div>
            <div style={gridStyles}>
              {data.nejnovejsiTipy.map((tip) => (
                <Link href={isEn ? `/en/tipy/${tip.slug}` : `/tipy/${tip.slug}`} key={tip.id} className="tip-card" style={cardBaseStyle}>
                  <div style={cardImageWrapper}><img src={tip.image_url} alt={tip.title} style={imageStyle} /></div>
                  <div style={{ padding: '25px' }}>
                    <h3 style={cardTitleStyle}>{isEn && tip.title_en ? tip.title_en : tip.title}</h3>
                    <p style={cardDescStyle}>{isEn && tip.description_en ? tip.description_en : tip.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* --- TWEAKY --- */}
          <section style={{ ...sectionStyles, marginTop: '40px' }}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>
                  LATEST <span style={{ color: '#eab308' }}>GURU TWEAKS</span>
                </h2>
                <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={{ color: '#eab308', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'ALL →' : 'VŠE →'}</Link>
              </div>
            </div>
            <div style={gridStyles}>
              {data.nejnovejsiTweaky.map((tweak) => (
                <Link href={isEn ? `/en/tweaky/${tweak.slug}` : `/tweaky/${tweak.slug}`} key={tweak.id} className="tweak-card" style={cardBaseStyle}>
                  <div style={cardImageWrapper}><img src={tweak.image_url} alt={tweak.title} style={imageStyle} /></div>
                  <div style={{ padding: '25px' }}>
                    <h3 style={cardTitleStyle}>{isEn && tweak.title_en ? tweak.title_en : tweak.title}</h3>
                    <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px' }}>{isEn ? 'OPEN FIX →' : 'OTEVŘÍT FIX →'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* --- ČLÁNKY --- */}
          <main style={{ ...sectionStyles, marginTop: '80px' }}>
            <div className="section-title-wrapper" style={{ margin: '0 auto 40px', display: 'block', textAlign: 'center', maxWidth: 'fit-content' }}>
              <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
                {isEn ? 'Articles & Videos' : 'Články & Videa'}
              </h2>
            </div>
            <div style={gridStyles}>
              {data.posts.map((post) => {
                const badge = getBadgeInfo(post);
                return (
                  <Link key={post.id} href={isEn ? `/en/clanky/${post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                        <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{badge.text}</div>
                      </div>
                      <div style={{ padding: '25px', flex: 1 }}>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{isEn && post.title_en ? post.title_en : post.title}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>
        </>
      )}

      <footer style={footerStyles}>
          <div style={{ marginBottom: '20px', color: '#a855f7', fontWeight: 'bold' }}>
            VISITED BY <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a855f7' }}>{data.stats.value}</span> FANS 🦾
          </div>
          <p style={{ color: '#9ca3af', opacity: 0.7, fontSize: '0.9rem' }}>© {new Date().getFullYear()} The Hardware Guru.</p>
      </footer>
    </div>
  );
}

const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const headerStyles = { maxWidth: '1200px', padding: '60px 40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '25px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '50px', flexWrap: 'wrap' };
const avatarStyles = { width: '160px', height: '160px', background: '#0b0c10', borderRadius: '50%', border: '5px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#45a29e', fontSize: '3.5rem', fontWeight: 'bold' };
const sectionStyles = { maxWidth: '1200px', margin: '60px auto', padding: '0 20px' };
const gridStyles = { display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' };
const cardBaseStyle = { textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const cardImageWrapper = { position: 'relative', height: '200px', width: '100%', background: '#0b0c10' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const cardTitleStyle = { fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff' };
const cardDescStyle = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' };
const footerStyles = { background: 'rgba(31, 40, 51, 0.95)', padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(168, 85, 247, 0.2)' };
