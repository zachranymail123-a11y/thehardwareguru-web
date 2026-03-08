"use client";
import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost } from 'lucide-react';

/**
 * GURU ENGINE - HOME PAGE V8.27 (Supreme Fix)
 * Změny:
 * 1. Safe Module Loading: Robustní require pro prostředí Canvas.
 * 2. Leaks Support: Neonový Ghost štítek integrovaný do mřížky.
 * 3. Bugfix: Opraveny chyby kompilace z předchozích verzí.
 */

// --- 🛡️ GURU SAFE MODULE LOADER ---
let Link = ({ children, ...props }) => <a {...props}>{children}</a>;
let usePathname = () => '';
let createClient = () => {
  const chain = { 
    select: () => chain, neq: () => chain, eq: () => chain,
    order: () => chain, limit: () => Promise.resolve({ data: [] }),
    single: () => Promise.resolve({ data: null })
  };
  return { from: () => chain, rpc: () => Promise.resolve() };
};

try {
  const NextLink = require('next/link');
  Link = NextLink.default || NextLink;
} catch (e) {}

try {
  const NextNav = require('next/navigation');
  usePathname = NextNav.usePathname;
} catch (e) {}

try {
  const Supa = require('@supabase/supabase-js');
  createClient = Supa.createClient;
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HomePage() {
  const [data, setData] = useState({ 
    posts: [], stats: { value: 0 }, 
    nejnovejsiTipy: [], nejnovejsiTweaky: [], 
    expectedGames: [], featuredDeals: [], 
    darci: [], partneri: [] 
  });
  const [loading, setLoading] = useState(true);

  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  const getThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10' };
    if (post.type === 'leaks') return { text: 'LEAKS & RUMORS', color: '#66fcf1', textColor: '#0b0c10' };
    const isGame = post.type === 'game' || (post.title && post.title.toLowerCase().includes('recenze'));
    if (isGame) return { text: isEn ? 'GAME NEWS' : 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff' };
    return { text: isEn ? 'HW NEWS' : 'HW NOVINKA', color: '#ff0000', textColor: '#fff' };
  };

  useEffect(() => {
    async function fetchData() {
      if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }
      try {
        await supabase.rpc('increment_total_visits');
        const [p, s, t, tw, d, pa, exp, feat] = await Promise.all([
          supabase.from('posts').select('*').neq('type', 'expected').order('created_at', { ascending: false }).limit(6),
          supabase.from('stats').select('value').eq('name', 'total_visits').single(),
          supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('darci').select('*').order('amount', { ascending: false }).limit(20),
          supabase.from('partneri').select('*').order('created_at', { ascending: false }).limit(4),
          supabase.from('posts').select('*').eq('type', 'expected').order('created_at', { ascending: false }).limit(3),
          supabase.from('game_deals').select('*').order('created_at', { ascending: false }).limit(3)
        ]);
        setData({ 
          posts: p.data || [], stats: s.data || { value: 0 }, 
          nejnovejsiTipy: t.data || [], nejnovejsiTweaky: tw.data || [],
          darci: d.data || [], partneri: pa.data || [],
          expectedGames: exp.data || [], featuredDeals: feat.data || []
        });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, [isEn, supabaseUrl]);

  return (
    <div style={globalStyles}>
      <style>{`
        .game-card { transition: 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .deal-hp-card { display: flex; align-items: center; gap: 20px; background: rgba(31, 40, 51, 0.9); padding: 15px 20px; border-radius: 20px; border: 1px solid rgba(249, 115, 22, 0.2); transition: 0.3s; text-decoration: none; }
        .deal-hp-card:hover { transform: translateY(-3px); border-color: #f97316; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.2); }
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(234, 179, 8, 0.2); display: inline-block; }
      `}</style>

      <header style={headerStyles}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '15px' }}>
              <ShieldCheck size={24} />
              <span style={{ fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>{isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'VAŠE TECHNOLOGICKÁ ZÁKLADNA'}</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', lineHeight: '1.1' }}>
              {isEn ? <>BUILDING THE <span style={{ color: '#66fcf1' }}>IDEAL PLACE</span> <br/> FOR GAMERS</> : <>BUDUJEME <span style={{ color: '#66fcf1' }}>IDEÁLNÍ MÍSTO</span> <br/> PRO HRÁČE</>}
            </h1>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#53fc18', color: '#000', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', textDecoration: 'none' }}>{isEn ? 'LIVE' : 'SLEDOVAT LIVE'}</a>
              <Link href={isEn ? "/en/support" : "/support"} style={{ background: '#eab308', color: '#000', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', textDecoration: 'none' }}>{isEn ? 'SUPPORT' : 'PODPOŘIT GURU'}</Link>
            </div>
        </div>
        <div style={avatarStyles}>HG</div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: '#a855f7', fontWeight: 'bold' }}>GURU SKENUJE SYSTÉMY...</div>
      ) : (
        <main style={sectionStyles}>
            <div className="section-title-wrapper" style={{ margin: '0 auto 40px', display: 'block', textAlign: 'center', maxWidth: 'fit-content' }}>
              <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{isEn ? 'Latest from Guru' : 'Nejnovější zprávy'}</h2>
            </div>
            <div style={gridStyles}>
              {data.posts.map((post) => {
                const badge = getBadgeInfo(post);
                return (
                  <Link key={post.id} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                        <img src={getThumbnail(post)} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '6px 14px', borderRadius: '6px', fontWeight: '950', fontSize: '0.7rem', textTransform: 'uppercase', boxShadow: `0 4px 15px ${badge.color}66`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {post.type === 'leaks' && <Ghost size={14} />}
                            {badge.text}
                        </div>
                      </div>
                      <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{isEn ? (post.title_en || post.title) : post.title}</h3>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span style={{ color: '#66fcf1', fontWeight: 'bold' }}>{isEn ? 'READ MORE →' : 'ČÍST VÍCE →'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
        </main>
      )}
    </div>
  );
}

const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const headerStyles = { maxWidth: '1200px', margin: '40px auto', padding: '60px 40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '25px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '50px', flexWrap: 'wrap' };
const avatarStyles = { width: '160px', height: '160px', background: '#0b0c10', borderRadius: '50%', border: '5px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#45a29e', fontSize: '3.5rem', fontWeight: 'bold' };
const sectionStyles = { maxWidth: '1200px', margin: '60px auto', padding: '0 20px' };
const gridStyles = { display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' };
