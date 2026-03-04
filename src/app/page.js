"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Lightbulb, ChevronRight, Play, Search, Newspaper, Book, PenTool, Home, Wrench, Activity } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState({ 
    posts: [], 
    nejnovejsiTipy: [], 
    nejnovejsiTweaky: [], 
    stats: { value: 0 } 
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function fetchData() {
      // 1. Přičtení návštěvy (RPC volání)
      await supabase.rpc('increment_total_visits');
      
      // 2. Stažení dat pro všechny sekce s Guru limity
      const [p, s, t, tw] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('stats').select('value').eq('name', 'total_visits').single(),
        supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(3)
      ]);

      setData({ 
        posts: p.data || [], 
        stats: s.data || { value: 0 }, 
        nejnovejsiTipy: t.data || [],
        nejnovejsiTweaky: tw.data || []
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  const getSafeImage = (url) => {
    if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
    return url;
  };

  const getThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10' };
    const isGame = post.type === 'game' || post.title.toLowerCase().includes('recenze');
    if (isGame) return { text: 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff' };
    return { text: 'HW NOVINKA', color: '#ff0000', textColor: '#fff' };
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

        .nav-link { margin: 0 10px; color: #fff; text-decoration: none; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #a855f7; }
        
        .social-btn { padding: 6px 14px; border-radius: 8px; font-weight: 900; font-size: 12px; text-decoration: none; text-transform: uppercase; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .social-btn:hover { transform: scale(1.05); }

        .new-badge { position: absolute; top: 15px; left: 15px; background: #a855f7; color: #fff; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 900; z-index: 10; letter-spacing: 1px; }
      `}</style>

      {/* --- HLAVIČKA --- */}
      <nav style={navStyles}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a855f7', letterSpacing: '1px' }}>HARDWARE GURU</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Link href="/" className="nav-link"><Home size={16}/> DOMŮ</Link>
          <Link href="/clanky" className="nav-link"><Newspaper size={16}/> ČLÁNKY</Link>
          <Link href="/tipy" className="nav-link"><Lightbulb size={16}/> TIPY</Link>
          <Link href="/tweaky" className="nav-link" style={{color: '#eab308'}}><Wrench size={16}/> GURU TWEAKY</Link>
          <Link href="/slovnik" className="nav-link"><Book size={16}/> SLOVNÍK</Link>
          
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
          
          <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#53fc18', color: '#000' }}>KICK</a>
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-btn" style={{ background: '#ff0000', color: '#fff' }}>YOUTUBE</a>
          <a href="https://discord.gg/n7xThr8" target="_blank" className="social-btn" style={{ background: '#5865F2', color: '#fff' }}>DISCORD</a>
        </div>
      </nav>

      {/* --- BIO --- */}
      <header style={headerStyles}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '900' }}>The Hardware Guru</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#e0e0e0' }}>
              Čau pařani! Jsem 45letý HW servisák s 20letou praxí. Tady najdeš vyladěné sestavy, technický slovník a AI návody, co tvýmu PC zachrání krk.
            </p>
        </div>
        <div style={avatarStyles}>HG</div>
      </header>

      {/* --- SEKCE 1: GURU TIPY & TRIKY (3 kousky) --- */}
      <section style={sectionStyles}>
        <div style={sectionHeaderStyles}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>GURU <span style={{ color: '#a855f7' }}>TIPY & TRIKY</span></h2>
          <Link href="/tipy" style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>VŠECHNY TIPY →</Link>
        </div>
        <div style={gridStyles(3)}>
          {data.nejnovejsiTipy.map((tip, index) => (
            <Link href={`/tipy/${tip.slug}`} key={tip.id} className="tip-card" style={cardBaseStyle}>
              <div style={cardImageWrapper}>
                {index === 0 && <div className="new-badge">NOVINKA 🔥</div>}
                <img src={getSafeImage(tip.image_url)} alt={tip.title} style={imageStyle} loading="lazy" />
              </div>
              <div style={{ padding: '25px' }}>
                <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold' }}>{tip.category}</span>
                <h3 style={cardTitleStyle}>{tip.title}</h3>
                <p style={cardDescStyle}>{tip.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- SEKCE 2: GURU TWEAKY (3 kousky) --- */}
      <section style={{ ...sectionStyles, marginTop: '40px' }}>
        <div style={sectionHeaderStyles}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>POSLEDNÍ <span style={{ color: '#eab308' }}>GURU TWEAKY</span></h2>
          <Link href="/tweaky" style={{ color: '#eab308', fontWeight: 'bold', textDecoration: 'none' }}>VŠECHNY TWEAKY →</Link>
        </div>
        <div style={gridStyles(3)}>
          {data.nejnovejsiTweaky.map((tweak) => (
            <Link href={`/tweaky/${tweak.slug}`} key={tweak.id} className="tweak-card" style={cardBaseStyle}>
              <div style={{ ...cardImageWrapper, height: '180px' }}>
                <img src={tweak.image_url && tweak.image_url !== 'EMPTY' ? tweak.image_url : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000'} alt={tweak.title} style={imageStyle} loading="lazy" />
              </div>
              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <Activity size={14} /> OPTIMALIZACE
                </div>
                <h3 style={cardTitleStyle}>{tweak.title}</h3>
                <p style={cardDescStyle}>{tweak.description}</p>
                <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px', marginTop: '15px' }}>OTEVŘÍT NÁVOD →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- SEKCE 3: ČLÁNKY & VIDEA (6 kousků) --- */}
      <main style={{ ...sectionStyles, marginTop: '80px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase' }}>
          Nejnovější články & Videa
        </h2>
        <div style={gridStyles(3)}>
          {data.posts.map((post) => {
            const badge = getBadgeInfo(post);
            return (
              <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{badge.text}</div>
                  </div>
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{post.title}</h3>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{post.created_at ? new Date(post.created_at).toLocaleDateString('cs-CZ') : ''}</span>
                      <span style={{ color: '#66fcf1', fontWeight: 'bold' }}>ČÍST →</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Link href="/clanky" className="archive-btn">ARCHIV ČLÁNKŮ</Link>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer style={footerStyles}>
          <div style={{ marginBottom: '20px', color: '#a855f7', fontWeight: 'bold' }}>
            WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a855f7' }}>{data.stats.value}</span> GURU FANOUŠKŮ 🦾
          </div>
          <p style={{ color: '#9ca3af', opacity: 0.7, fontSize: '0.8rem' }}>© {new Date().getFullYear()} The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>
    </div>
  );
}

// STYLY (SPOJENÉ PRO PŘEHLEDNOST)
const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const navStyles = { padding: '20px 40px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap', gap: '20px' };
const headerStyles = { maxWidth: '1200px', margin: '40px auto', padding: '40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const avatarStyles = { width: '120px', height: '120px', background: '#0b0c10', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#45a29e', fontSize: '2.5rem', fontWeight: 'bold' };
const sectionStyles = { maxWidth: '1200px', margin: '60px auto', padding: '0 20px' };
const sectionHeaderStyles = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const gridStyles = (cols) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '25px' });
const cardBaseStyle = { textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const cardImageWrapper = { position: 'relative', height: '200px', width: '100%', background: '#0b0c10' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const cardTitleStyle = { fontSize: '19px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2' };
const cardDescStyle = { color: '#9ca3af', fontSize: '14px', lineHeight: '1.5', marginBottom: '10px' };
const footerStyles = { background: 'rgba(31, 40, 51, 0.95)', padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(168, 85, 247, 0.2)' };
