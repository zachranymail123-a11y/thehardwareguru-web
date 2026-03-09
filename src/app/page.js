"use client";

import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords } from 'lucide-react';

/**
 * GURU HOMEPAGE V12.0 - PURE NATIVE API
 * Update: Nahrazeno next/link, next/navigation a @supabase/supabase-js za nativní ekvivalenty (<a>, window.location, fetch).
 * Zajišťuje 100% stabilitu v náhledu i na produkci bez pádů kompilace.
 */

// 🚀 GURU: Fallback URL pro Leaky
const LEAK_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';

export default function HomePage() {
  const [data, setData] = useState({ 
    posts: [], 
    nejnovejsiTipy: [], 
    nejnovejsiTweaky: [], 
    expectedGames: [], 
    featuredDeals: [],
    latestDuels: [],
    darci: [],
    partneri: [],
    stats: { value: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const [isEn, setIsEn] = useState(false);

  // Detekce jazyka na klientovi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEn(window.location.pathname.startsWith('/en'));
    }
  }, []);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // --- NEPRŮSTŘELNÉ FUNKCE (RECOVERY) ---
  const getSafeImage = (url) => {
    if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
    return url;
  };

  const getThumbnail = (post) => {
    const typeStr = (post.type || '').toLowerCase().trim();
    if (typeStr.includes('leak')) {
      return `${supabaseUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png`;
    }
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    const typeStr = (post.type || '').toLowerCase().trim();
    if (typeStr.includes('leak')) return { text: 'LEAK', color: '#66fcf1', textColor: '#0b0c10', isLeak: true };
    if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10', isLeak: false };
    
    const isGame = typeStr.includes('game') || (post.title && post.title.toLowerCase().includes('recenze'));
    if (isGame) return { text: isEn ? 'GAME NEWS' : 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff', isLeak: false };
    
    return { text: isEn ? 'HW NEWS' : 'HW NOVINKA', color: '#ff0000', textColor: '#fff', isLeak: false };
  };

  // 🚀 GURU: Nativní FETCH databáze (Odolné proti pádům)
  useEffect(() => {
    async function fetchData() {
      try {
        if (!supabaseUrl || !supabaseKey) return setLoading(false);

        const headers = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };

        // Zvýšení návštěv
        fetch(`${supabaseUrl}/rest/v1/rpc/increment_total_visits`, { method: 'POST', headers }).catch(() => {});

        const [p, s, t, tw, d, pa, exp, feat, duelsRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/posts?select=*&type=neq.expected&order=created_at.desc&limit=6`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/stats?select=value&name=eq.total_visits&limit=1`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/tipy?select=*&order=created_at.desc&limit=3`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/tweaky?select=*&order=created_at.desc&limit=3`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/darci?select=*&order=amount.desc&limit=20`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/partneri?select=*&order=created_at.desc&limit=4`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/posts?select=*&type=eq.expected&order=created_at.desc&limit=3`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/game_deals?select=*&order=created_at.desc&limit=3`, { headers }).then(res => res.json()),
          fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=id,title_cs,title_en,slug,slug_en,created_at&order=created_at.desc&limit=3`, { headers }).then(res => res.json())
        ]);
        
        setData({ 
          posts: Array.isArray(p) ? p : [], 
          stats: (Array.isArray(s) && s.length > 0) ? s[0] : { value: 0 }, 
          nejnovejsiTipy: Array.isArray(t) ? t : [],
          nejnovejsiTweaky: Array.isArray(tw) ? tw : [],
          darci: Array.isArray(d) ? d : [],
          partneri: Array.isArray(pa) ? pa : [],
          expectedGames: Array.isArray(exp) ? exp : [],
          featuredDeals: Array.isArray(feat) ? feat : [],
          latestDuels: Array.isArray(duelsRes) ? duelsRes : []
        });
      } catch (err) {
        console.error("Data load fail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn, supabaseUrl, supabaseKey]);

  return (
    <div style={globalStyles}>
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        
        .expected-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .expected-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.25); border-color: #66fcf1; }

        .deal-hp-card { 
          display: flex; align-items: center; gap: 20px; 
          background: rgba(31, 40, 51, 0.9); padding: 15px 20px; 
          border-radius: 20px; border: 1px solid rgba(249, 115, 22, 0.2); 
          transition: 0.3s; text-decoration: none; 
        }
        .deal-hp-card:hover { transform: translateY(-3px); border-color: #f97316; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.2); }

        /* 🔥 GURU DUEL HP STYLES 🔥 */
        .duel-hp-card { 
          display: flex; align-items: center; gap: 20px; 
          background: rgba(31, 40, 51, 0.9); padding: 15px 20px; 
          border-radius: 20px; border: 1px solid rgba(255, 0, 85, 0.2); 
          transition: 0.3s; text-decoration: none; 
        }
        .duel-hp-card:hover { transform: translateY(-3px); border-color: #ff0055; box-shadow: 0 10px 25px rgba(255, 0, 85, 0.2); }

        .tip-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tip-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); border-color: #a855f7; }
        .tweak-card { transition: all 0.3s ease; border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tweak-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(234, 179, 8, 0.3); border-color: #eab308; }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 15px; text-decoration: none; text-transform: uppercase; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border: none; cursor: pointer; }
        .social-btn-main:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 6px 25px rgba(0,0,0,0.5); }
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(234, 179, 8, 0.2); display: inline-block; }
        
        .monetize-hero-card {
            background: linear-gradient(145deg, rgba(17, 19, 24, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
            border: 2px solid rgba(255,255,255,0.05);
            border-radius: 24px;
            padding: 35px 30px;
            text-decoration: none;
            color: #fff;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(15px);
        }
        .monetize-hero-card.hof:hover { border-color: #a855f7; box-shadow: 0 20px 50px rgba(168, 85, 247, 0.25); transform: translateY(-8px); }
        .monetize-hero-card.partners:hover { border-color: #eab308; box-shadow: 0 20px 50px rgba(234, 179, 8, 0.25); transform: translateY(-8px); }
        .monetize-hero-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
        .monetize-hero-card.hof::before { background: #a855f7; }
        .monetize-hero-card.partners::before { background: #eab308; }
      `}</style>

      {/* HERO */}
      <header style={headerStyles}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '15px' }}><ShieldCheck size={24} /><span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}>{isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'TECHNOLOGICKÁ ZÁKLADNA'}</span></div>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', lineHeight: '1.1' }}>GURU <span style={{ color: '#66fcf1' }}>STATION</span></h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#e0e0e0', marginBottom: '35px' }}>{isEn ? "Eradicate lag, optimize FPS, and build a place for geeks." : "Vymýtíme lagy, zkrotíme FPS a vytvoříme web pro pravé geeky."}</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn-main" style={{ background: '#53fc18', color: '#000' }}>{isEn ? 'LIVE' : 'SLEDOVAT LIVE'}</a>
              
              {/* 🚀 GURU: Obří tlačítko GPU Duelů v Hero sekci */}
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="social-btn-main" style={{ background: '#ff0055', color: '#fff' }}>{isEn ? '⚔️ GPU BATTLES' : '⚔️ SOUBOJE GPU'}</a>
              
              <a href={isEn ? "/en/deals" : "/cs/deals"} className="social-btn-main" style={{ background: '#f97316', color: '#fff' }}>{isEn ? '🔥 GAME DEALS' : '🔥 SLEVY NA HRY'}</a>
              <a href={isEn ? "/en/support" : "/support"} className="social-btn-main" style={{ background: '#eab308', color: '#000' }}>{isEn ? 'SUPPORT' : 'PODPOŘIT GURU'}</a>
              
              <div style={{ background: '#fff', borderRadius: '12px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '48px' }}>
                <button swg-standard-button="contribution" style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
              </div>
            </div>
        </div>
      </header>

      {loading ? null : (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px' }}>
          
          {/* SLEVY */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '950', marginBottom: '30px', borderLeft: '4px solid #f97316', paddingLeft: '15px' }}>ŽHAVÉ SLEVY</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {data.featuredDeals.map(deal => (
                    <a key={deal.id} href={deal.affiliate_link} target="_blank" rel="nofollow sponsored" className="deal-hp-card">
                        <img src={deal.image_url} style={{ width: '80px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                        <div style={{ flex: 1 }}><div style={{ fontWeight: '900', color: '#fff' }}>{deal.title}</div><div style={{ color: '#f97316', fontWeight: '950' }}>{isEn ? deal.price_en : deal.price_cs}</div></div>
                        <div style={{ background: '#f97316', color: '#fff', padding: '8px 12px', borderRadius: '10px', fontWeight: '950', fontSize: '11px' }}>BUY</div>
                    </a>
                ))}
            </div>
          </section>

          {/* 🚀 GURU DUELY (NOVÁ SEKCE NA HOMEPAGE) */}
          {data.latestDuels.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <div className="section-title-wrapper" style={{ marginBottom: '30px', borderColor: 'rgba(255, 0, 85, 0.3)', borderLeft: '4px solid #ff0055' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                      <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Swords color="#ff0055" /> {isEn ? 'LATEST GPU BATTLES' : 'NEJNOVĚJŠÍ GPU DUELY'}
                      </h2>
                      <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ color: '#ff0055', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase', fontSize: '14px' }}>
                        {isEn ? 'VS ENGINE →' : 'GURU VS ENGINE →'}
                      </a>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {data.latestDuels.map(duel => (
                        <a key={duel.id} href={`/${isEn ? 'en/' : ''}gpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} style={{ textDecoration: 'none' }}>
                            <div className="duel-hp-card">
                                <div style={{ background: '#ff0055', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Swords size={24} color="#fff" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#ff0055', fontSize: '10px', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>{isEn ? 'HARDWARE BATTLE' : 'HARDWARE SOUBOJ'}</div>
                                    <div style={{ fontWeight: '900', fontSize: '15px', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', lineHeight: '1.2' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</div>
                                </div>
                                <ChevronRight color="#ff0055" />
                            </div>
                        </a>
                    ))}
                </div>
            </section>
          )}

          {/* OČEKÁVANÉ HRY */}
          {data.expectedGames && data.expectedGames.length > 0 && (
            <section style={{ ...sectionStyles, marginBottom: '60px' }}>
              <div className="section-title-wrapper" style={{ marginBottom: '30px', borderColor: 'rgba(102, 252, 241, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>
                    {isEn ? 'EXPECTED' : 'OČEKÁVANÉ'} <span style={{ color: '#66fcf1' }}>{isEn ? 'HITS' : 'HRY'}</span>
                  </h2>
                  <a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"} style={{ color: '#66fcf1', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase', fontSize: '14px' }}>
                    {isEn ? 'FULL ARCHIVE →' : 'ARCHIV HER →'}
                  </a>
                </div>
              </div>
              <div style={gridStyles}>
                {data.expectedGames.map((game) => {
                   const displayTitle = (isEn && game.title_en) ? game.title_en : game.title;
                   const displaySlug = (isEn && game.slug_en) ? game.slug_en : game.slug;
                   const hasVideo = game.trailer || (game.video_id && game.video_id.length > 5);

                   return (
                     <a href={isEn ? `/en/ocekavane-hry/${displaySlug}` : `/ocekavane-hry/${displaySlug}`} key={game.id} className="expected-card" style={cardBaseStyle}>
                        <div style={cardImageWrapper}>
                           {hasVideo && <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#ff0055', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px' }}><Play size={10} fill="#fff"/> VIDEO</div>}
                           <img src={getThumbnail(game)} alt={displayTitle} style={{...imageStyle, opacity: 0.8}} loading="lazy" />
                        </div>
                        <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ color: '#66fcf1', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', marginBottom: '10px' }}>
                            {isEn ? 'TECH PREVIEW' : 'TECHNICKÝ ROZBOR'}
                          </span>
                          <h3 style={{ ...cardTitleStyle, marginBottom: '15px' }}>{displayTitle}</h3>
                          <div style={{ color: '#66fcf1', fontWeight: '900', fontSize: '13px', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             {isEn ? 'VIEW ANALYSIS' : 'ZOBRAZIT ROZBOR'} <ChevronRight size={16} />
                          </div>
                        </div>
                     </a>
                   )
                })}
              </div>
            </section>
          )}

          {/* TIPY */}
          <section style={sectionStyles}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS' : 'TIPY & TRIKY'}</span></h2>
                <a href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'ARCHIVE →' : 'ARCHIV TIPŮ →'}</a>
              </div>
            </div>
            <div style={gridStyles}>
              {data.nejnovejsiTipy.map((tip, idx) => (
                <a href={isEn ? `/en/tipy/${tip.slug_en || tip.slug}` : `/tipy/${tip.slug}`} key={tip.id} className="tip-card" style={cardBaseStyle}>
                  <div style={cardImageWrapper}>
                    {idx === 0 && <div style={newBadgeStyle}>{isEn ? 'NEW 🔥' : 'NOVINKA 🔥'}</div>}
                    <img src={getSafeImage(tip.image_url)} alt={tip.title} style={imageStyle} loading="lazy" />
                  </div>
                  <div style={{ padding: '25px' }}>
                    <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold' }}>{isEn ? (tip.category_en || 'HARDWARE') : tip.category}</span>
                    <h3 style={cardTitleStyle}>{isEn ? (tip.title_en || tip.title) : tip.title}</h3>
                    <p style={cardDescStyle}>{isEn ? (tip.description_en || tip.description) : tip.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* TWEAKY */}
          <section style={{ ...sectionStyles, marginTop: '40px' }}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px', borderColor: 'rgba(234, 179, 8, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>{isEn ? 'LATEST' : 'POSLEDNÍ'} <span style={{ color: '#eab308' }}>GURU TWEAKY</span></h2>
                <a href={isEn ? "/en/tweaky" : "/tweaky"} style={{ color: '#eab308', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'ALL →' : 'VŠECHNY TWEAKY →'}</a>
              </div>
            </div>
            <div style={gridStyles}>
              {data.nejnovejsiTweaky.map((tweak) => (
                <a href={isEn ? `/en/tweaky/${tweak.slug_en || tweak.slug}` : `/tweaky/${tweak.slug}`} key={tweak.id} className="tweak-card" style={cardBaseStyle}>
                  <div style={{ ...cardImageWrapper, height: '180px' }}>
                    <img src={getSafeImage(tweak.image_url)} alt={tweak.title} style={imageStyle} loading="lazy" />
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                      <Activity size={14} /> {isEn ? 'OPTIMIZATION' : 'OPTIMALIZACE'}
                    </div>
                    <h3 style={cardTitleStyle}>{isEn ? (tweak.title_en || tweak.title) : tweak.title}</h3>
                    <p style={cardDescStyle}>{isEn ? (tweak.description_en || tweak.description) : tweak.description}</p>
                    <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px', marginTop: '15px' }}>{isEn ? 'OPEN GURU FIX →' : 'OTEVŘÍT GURU FIX →'}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* ČLÁNKY */}
          <section style={{ ...sectionStyles, marginTop: '80px' }}>
            <div className="section-title-wrapper" style={{ margin: '0 auto 40px', display: 'block', textAlign: 'center', maxWidth: 'fit-content' }}>
              <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{isEn ? 'Latest Articles & Videos' : 'Nejnovější články & Videa'}</h2>
            </div>
            <div style={gridStyles}>
              {data.posts.map((post) => {
                const badge = getBadgeInfo(post);
                return (
                  <a key={post.id} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                        <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {badge.isLeak && <Ghost size={14} />} {badge.text}
                        </div>
                      </div>
                      <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{isEn ? (post.title_en || post.title) : post.title}</h3>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
                          <span style={{ color: '#66fcf1', fontWeight: 'bold' }}>{isEn ? 'READ MORE →' : 'ČÍST ČLÁNEK →'}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

// --- GURU MASTER STYLES ---
const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const headerStyles = { maxWidth: '1200px', margin: '40px auto', padding: '60px 40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '25px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '50px', flexWrap: 'wrap', boxShadow: '0 15px 45px rgba(0,0,0,0.6)' };
const sectionStyles = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' };
const gridStyles = { display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' };
const cardBaseStyle = { textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const cardImageWrapper = { position: 'relative', height: '220px', width: '100%', background: '#0b0c10' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const cardTitleStyle = { fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2' };
const cardDescStyle = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' };
const newBadgeStyle = { position: 'absolute', top: '15px', left: '15px', background: '#a855f7', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '10px', zIndex: 10 };
