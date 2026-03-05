"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Lightbulb, ChevronRight, Play, Search, Newspaper, Book, PenTool, Home, Wrench, Activity, Heart, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [data, setData] = useState({ 
    posts: [], 
    nejnovejsiTipy: [], 
    nejnovejsiTweaky: [], 
    stats: { value: 0 } 
  });
  const [loading, setLoading] = useState(true);

  // --- STAV PRO INTELIGENTNÍ VYHLEDÁVÁNÍ ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // --- NEPRŮSTŘELNÉ FUNKCE ---
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

  useEffect(() => {
    async function fetchData() {
      try {
        await supabase.rpc('increment_total_visits');
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
      } catch (err) {
        console.error("Data load fail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- EFEKT PRO INTELIGENTNÍ VYHLEDÁVÁNÍ ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [pRes, tipRes, tweakRes] = await Promise.all([
          supabase.from('posts').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tipy').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tweaky').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3)
        ]);

        let results = [];
        if (pRes.data) results = [...results, ...pRes.data.map(x => ({ ...x, category: 'Článek', link: `/clanky/${x.slug}` }))];
        if (tipRes.data) results = [...results, ...tipRes.data.map(x => ({ ...x, category: 'Tip', link: `/tipy/${x.slug}` }))];
        if (tweakRes.data) results = [...results, ...tweakRes.data.map(x => ({ ...x, category: 'Tweak', link: `/tweaky/${x.slug}` }))];

        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 15px; text-decoration: none; text-transform: uppercase; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border: none; cursor: pointer; }
        .social-btn-main:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 6px 25px rgba(0,0,0,0.5); }
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(234, 179, 8, 0.2); display: inline-block; }
        .search-result-item:hover { background: rgba(102, 252, 241, 0.1); }
      `}</style>

      {/* --- NAVIGACE --- */}
      <nav style={navStyles}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a855f7', letterSpacing: '1px' }}>HARDWARE GURU</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Link href="/" className="nav-link"><Home size={16}/> DOMŮ</Link>
          <Link href="/clanky" className="nav-link"><Newspaper size={16}/> ČLÁNKY</Link>
          <Link href="/tipy" className="nav-link"><Lightbulb size={16}/> TIPY</Link>
          <Link href="/tweaky" className="nav-link" style={{color: '#eab308'}}><Wrench size={16}/> GURU TWEAKY</Link>
          <Link href="/slovnik" className="nav-link"><Book size={16}/> SLOVNÍK</Link>
          <Link href="/rady" className="nav-link"><PenTool size={16}/> RADY</Link>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
          <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn-main" style={{ background: '#53fc18', color: '#000', padding: '6px 14px', fontSize: '12px' }}>KICK</a>
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-btn-main" style={{ background: '#ff0000', color: '#fff', padding: '6px 14px', fontSize: '12px' }}>YOUTUBE</a>
          <a href="https://discord.gg/n7xThr8" target="_blank" className="social-btn-main" style={{ background: '#5865F2', color: '#fff', padding: '6px 14px', fontSize: '12px' }}>DISCORD</a>
          <Link href="/support" className="nav-link" style={{color: '#eab308'}}><Heart size={16}/> PODPORA</Link>
        </div>
      </nav>

      {/* --- INTELIGENTNÍ VYHLEDÁVÁNÍ (ZÚŽENÉ POLE) --- */}
      <div style={{ maxWidth: '400px', margin: '30px auto 0', position: 'relative', padding: '0 20px', zIndex: 999 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(17, 19, 24, 0.95)', border: '1px solid #66fcf1', borderRadius: '12px', padding: '10px 15px', boxShadow: '0 0 15px rgba(102, 252, 241, 0.2)' }}>
          <Search size={18} color="#66fcf1" style={{ marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Hledat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', fontSize: '15px', outline: 'none' }}
          />
          {isSearching && <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: 'bold', marginLeft: '10px' }}>Hledám...</span>}
        </div>

        {searchQuery.trim() !== '' && (
          <div style={{ position: 'absolute', top: '100%', left: '20px', right: '20px', background: 'rgba(31, 40, 51, 0.98)', border: '1px solid #66fcf1', borderRadius: '12px', marginTop: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            {searchResults.length > 0 ? (
              searchResults.map((res, i) => (
                <Link href={res.link} key={i} className="search-result-item" style={{ display: 'block', padding: '12px 15px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }}>
                  <div style={{ fontSize: '10px', color: '#66fcf1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px' }}>{res.category}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{res.title}</div>
                </Link>
              ))
            ) : (
              !isSearching && <div style={{ padding: '15px', color: '#9ca3af', textAlign: 'center', fontSize: '13px' }}>Nic jsme nenašli.</div>
            )}
          </div>
        )}
      </div>

      {/* --- BIO SEKCE --- */}
      <header style={headerStyles}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '15px' }}>
              <ShieldCheck size={24} />
              <span style={{ fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>Vaše technologická základna</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', lineHeight: '1.1', textShadow: '0 0 15px rgba(102, 252, 241, 0.5)' }}>
              Budujeme <span style={{ color: '#66fcf1' }}>Ideální Místo</span> <br/> pro Hráče a Geeky
            </h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#e0e0e0', marginBottom: '35px', maxWidth: '750px' }}>
              Čau, jsem GURU. S 20 lety praxe v servisu hardware vím, kde každá mašina tlačí. Moje mise je jasná: <strong>vymýtit lagy, zkrotit FPS a vytvořit web, kde se každý geek cítí jako doma.</strong> Tady nejde o žádný suchý návody, jde o čistou vášeň pro železo a služby, co drží tuhle scénu naživu.
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn-main" style={{ background: '#53fc18', color: '#000' }}>SLEDOVAT LIVE</a>
              <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-btn-main" style={{ background: '#ff0000', color: '#fff' }}>GURU YOUTUBE</a>
              <Link href="/support" className="social-btn-main" style={{ background: '#eab308', color: '#000' }}>PODPOŘIT WEB A SLUŽBY</Link>
            </div>
        </div>
        <div style={avatarStyles}>HG</div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: '#a855f7', fontWeight: 'bold' }}>GURU aktualizuje systémy...</div>
      ) : (
        <>
          {/* --- TIPY --- */}
          <section style={sectionStyles}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>GURU <span style={{ color: '#a855f7' }}>TIPY & TRIKY</span></h2>
                <Link href="/tipy" style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>ARCHIV TIPŮ →</Link>
              </div>
            </div>
            <div style={gridStyles}>
              {data.nejnovejsiTipy.map((tip, idx) => (
                <Link href={`/tipy/${tip.slug}`} key={tip.id} className="tip-card" style={cardBaseStyle}>
                  <div style={cardImageWrapper}>
                    {idx === 0 && <div style={newBadgeStyle}>NOVINKA 🔥</div>}
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

          {/* --- TWEAKY --- */}
          <section style={{ ...sectionStyles, marginTop: '40px' }}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>POSLEDNÍ <span style={{ color: '#eab308' }}>GURU TWEAKY</span></h2>
                <Link href="/tweaky" style={{ color: '#eab308', fontWeight: 'bold', textDecoration: 'none' }}>VŠECHNY TWEAKY →</Link>
              </div>
            </div>
            <div style={gridStyles}>
              {data.nejnovejsiTweaky.map((tweak) => (
                <Link href={`/tweaky/${tweak.slug}`} key={tweak.id} className="tweak-card" style={cardBaseStyle}>
                  <div style={{ ...cardImageWrapper, height: '180px' }}>
                    <img src={getSafeImage(tweak.image_url)} alt={tweak.title} style={imageStyle} loading="lazy" />
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                      <Activity size={14} /> OPTIMALIZACE
                    </div>
                    <h3 style={cardTitleStyle}>{tweak.title}</h3>
                    <p style={cardDescStyle}>{tweak.description}</p>
                    <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px', marginTop: '15px' }}>OTEVŘÍT GURU FIX →</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* --- ČLÁNKY --- */}
          <main style={{ ...sectionStyles, marginTop: '80px' }}>
            <div className="section-title-wrapper" style={{ margin: '0 auto 40px', display: 'block', textAlign: 'center', maxWidth: 'fit-content' }}>
              <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>Nejnovější články & Videa</h2>
            </div>
            <div style={gridStyles}>
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
                          <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{new Date(post.created_at).toLocaleDateString('cs-CZ')}</span>
                          <span style={{ color: '#66fcf1', fontWeight: 'bold' }}>ČÍST ČLÁNEK →</span>
                        </div>
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
            KOMUNITNÍ WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a855f7' }}>{data.stats.value}</span> FANOUŠKŮ 🦾
          </div>
          <p style={{ color: '#9ca3af', opacity: 0.7, fontSize: '0.8rem' }}>© {new Date().getFullYear()} The Hardware Guru. Pro hráče, s láskou k železu.</p>
      </footer>
    </div>
  );
}

// --- STYLY ---
const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const navStyles = { padding: '20px 40px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap', gap: '20px' };
const headerStyles = { maxWidth: '1200px', margin: '40px auto', padding: '60px 40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '25px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '50px', flexWrap: 'wrap', boxShadow: '0 15px 45px rgba(0,0,0,0.6)' };
const avatarStyles = { width: '160px', height: '160px', background: '#0b0c10', borderRadius: '50%', border: '5px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#45a29e', fontSize: '3.5rem', fontWeight: 'bold', boxShadow: '0 0 30px rgba(102, 252, 241, 0.4)' };
const sectionStyles = { maxWidth: '1200px', margin: '60px auto', padding: '0 20px' };
const gridStyles = { display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' };
const cardBaseStyle = { textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const cardImageWrapper = { position: 'relative', height: '220px', width: '100%', background: '#0b0c10' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const cardTitleStyle = { fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2' };
const cardDescStyle = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' };
const footerStyles = { background: 'rgba(31, 40, 51, 0.95)', padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(168, 85, 247, 0.2)' };
const newBadgeStyle = { position: 'absolute', top: '15px', left: '15px', background: '#a855f7', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' };
