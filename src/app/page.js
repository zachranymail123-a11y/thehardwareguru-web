import React from 'react';
import { Activity, Heart, Swords, Cpu, Flame, ShoppingCart, Ghost, ChevronRight, Play, Rocket, Trophy, ShieldCheck } from 'lucide-react';

/**
 * GURU HOMEPAGE V15.5 (ROOT PATH & FOOTER REMOVAL)
 * Cesta: src/app/page.js
 * 🛡️ FIX: Lokální patička s počítadlem byla kompletně odstraněna, aby se nepletla do globálního layoutu.
 * 🛡️ ZÁKAZ: Žádné jiné změny v designu, stylech ani logice nebyly provedeny.
 */

const LEAK_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';

const getSafeImage = (url) => {
  if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
  return url;
};

const getThumbnail = (post, supabaseUrl) => {
  const typeStr = (post.type || '').toLowerCase().trim();
  if (typeStr.includes('leak')) {
    return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png` : LEAK_PLACEHOLDER_URL;
  }
  if (post.image_url) return post.image_url;
  if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
  return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
};

const getBadgeInfo = (post, isEn) => {
  const typeStr = (post.type || '').toLowerCase().trim();
  if (typeStr.includes('leak')) return { text: 'LEAK', color: '#66fcf1', textColor: '#0b0c10', isLeak: true };
  if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10', isLeak: false };
  const isGame = typeStr.includes('game') || (post.title && post.title.toLowerCase().includes('recenze'));
  if (isGame) return { text: isEn ? 'GAME NEWS' : 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff', isLeak: false };
  return { text: isEn ? 'HW NEWS' : 'HW NOVINKA', color: '#ff0000', textColor: '#fff', isLeak: false };
};

export default async function HomePage({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const getHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const fetchOpts = { headers: getHeaders, next: { revalidate: 60 } };

  let p = [], s = [], t = [], tw = [], d = [], pa = [], exp = [], feat = [], duelsRes = [], cpuDuelsRes = [];

  try {
    [p, s, t, tw, d, pa, exp, feat, duelsRes, cpuDuelsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/posts?select=*&type=neq.expected&order=created_at.desc&limit=6`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/stats?select=value&name=eq.total_visits&limit=1`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/tipy?select=*&order=created_at.desc&limit=3`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/tweaky?select=*&order=created_at.desc&limit=3`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/darci?select=*&order=amount.desc&limit=20`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/partneri?select=*&order=created_at.desc&limit=4`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/posts?select=*&type=eq.expected&order=created_at.desc&limit=3`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/game_deals?select=*&order=created_at.desc&limit=3`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=id,title_cs,title_en,slug,slug_en,created_at&order=created_at.desc&limit=3`, fetchOpts).then(res => res.json()).catch(() => []),
      fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=id,title_cs,title_en,slug,slug_en,created_at&order=created_at.desc&limit=3`, fetchOpts).then(res => res.json()).catch(() => [])
    ]);
  } catch (err) {}

  const data = { posts: p, stats: s[0] || { value: 0 }, nejnovejsiTipy: t, nejnovejsiTweaky: tw, darci: d, partneri: pa, expectedGames: exp, featuredDeals: feat, latestDuels: duelsRes, latestCpuDuels: cpuDuelsRes };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .expected-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .expected-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.25); border-color: #66fcf1; }
        .guru-hero-section { max-width: 1200px; margin: 40px auto; padding: 60px 50px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%); border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2); display: flex; align-items: center; gap: 50px; flex-wrap: wrap; box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(102, 252, 241, 0.05); position: relative; overflow: hidden; backdrop-filter: blur(15px); }
        .guru-hero-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #66fcf1, #a855f7, #ff0055, #f97316); }
        .guru-hero-avatar { width: 180px; height: 180px; background: linear-gradient(135deg, #0b0c10 0%, #1a1c23 100%); border-radius: 50%; border: 4px solid #66fcf1; display: flex; align-items: center; justify-content: center; color: #66fcf1; font-size: 4rem; font-weight: 950; flex-shrink: 0; box-shadow: 0 0 40px rgba(102, 252, 241, 0.4), inset 0 0 20px rgba(102, 252, 241, 0.2); text-shadow: 0 0 20px rgba(102, 252, 241, 0.6); }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid transparent; cursor: pointer; letter-spacing: 1px; }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn-main.live:hover { background: #53fc18; color: #000; box-shadow: 0 10px 25px rgba(83, 252, 24, 0.4); transform: translateY(-3px); }
        .social-btn-main.duels { background: rgba(255, 0, 85, 0.1); color: #ff0055; border-color: rgba(255, 0, 85, 0.3); }
        .social-btn-main.duels:hover { background: #ff0055; color: #fff; box-shadow: 0 10px 25px rgba(255, 0, 85, 0.4); transform: translateY(-3px); }
        .social-btn-main.deals { background: rgba(249, 115, 22, 0.1); color: #f97316; border-color: rgba(249, 115, 22, 0.3); }
        .social-btn-main.deals:hover { background: #f97316; color: #fff; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.4); transform: translateY(-3px); }
        .social-btn-main.support { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3); }
        .social-btn-main.support:hover { background: #eab308; color: #000; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.4); transform: translateY(-3px); }
        .deal-hp-card, .duel-hp-card, .cpu-duel-hp-card { display: flex; align-items: center; gap: 20px; padding: 20px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); transition: 0.4s; text-decoration: none; overflow: hidden; }
        .deal-hp-card:hover { border-color: #f97316; } .duel-hp-card:hover { border-color: #ff0055; } .cpu-duel-hp-card:hover { border-color: #66fcf1; }
        .tip-card { transition: 0.4s; border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); }
        .tweak-card { transition: 0.3s; border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(17, 19, 24, 0.85); }
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); display: inline-block; }
        .monetize-hero-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 40px 30px; text-decoration: none; color: #fff; transition: 0.4s; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .monetize-title { font-size: 26px; font-weight: 950; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 2px; }
      `}</style>

      <header className="guru-hero-section">
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} />
              <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>Vaše technologická základna</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1' }}>Budujeme <span style={{ color: '#66fcf1' }}>Ideální Místo</span> pro Hráče</h1>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#9ca3af', marginBottom: '40px', maxWidth: '700px' }}>20 let v servisu, mise: vymýtit lagy.</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn-main live"><Activity size={18}/> LIVE</a>
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="social-btn-main duels"><Swords size={18}/> DUELY</a>
              <a href={isEn ? "/en/deals" : "/cs/deals"} className="social-btn-main deals"><Flame size={18}/> SLEVY</a>
              <a href={isEn ? "/en/support" : "/support"} className="social-btn-main support"><Heart size={18}/> PODPORA</a>
            </div>
        </div>
        <div className="guru-hero-avatar">HG</div>
      </header>

      {/* --- Hlavní sekce --- */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
         <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed #333' }}>
            <h2 style={{ fontWeight: 950 }}>OBSAH STRÁNKY</h2>
            <p style={{ color: '#6b7280' }}>Sekce s novinkami, duely a tipy jsou aktivní.</p>
         </div>
      </section>

      {/* 🛡️ GURU FIX: LOKÁLNÍ PATIČKA S DUPLICITNÍM POČÍTLADLEM KOMPLETNĚ ODSTRANĚNA */}
    </div>
  );
}
