import React from 'react';
import Script from 'next/script';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords, Cpu, Gamepad2, Layers, MessageSquare, Award, Bell, Bookmark, Share2, Clock, Compass, Shuffle, Link2 } from 'lucide-react';
import HeurekaButtons from '../components/HeurekaButtons';

/**
 * GURU HOMEPAGE V22.2 - FINAL MULTILANG FIX
 * 🚀 CÍL: 100% funkční překlad vnitřku stránky při zachování designu.
 */

export async function generateMetadata({ params, isEn: isEnProp }) {
  const locale = params?.locale || 'cs';
  const isEn = isEnProp === true || locale === 'en';
  const baseUrl = 'https://thehardwareguru.cz';

  const title = isEn ? 'Hardware Guru – CPU, GPU comparison, FPS calculator and PC Builds' : 'Hardware Guru – CPU, GPU srovnání, FPS kalkulačka a PC Sestavy';
  const description = isEn ? 'Your technology base for CPU, GPU comparison, bottleneck calculation, PC builds and latest HW news.' : 'Vaše technologická základna pro srovnání CPU, GPU, výpočet bottlenecku, PC sestavy a nejnovější HW novinky.';

  return {
    title, 
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
      bingBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 }
    },
    alternates: {
      canonical: isEn ? `${baseUrl}/en` : `${baseUrl}/`, 
      languages: { 'cs-CZ': `${baseUrl}/`, 'en-US': `${baseUrl}/en` }
    },
    openGraph: { title, description, url: isEn ? `${baseUrl}/en` : `${baseUrl}/`, siteName: 'The Hardware Guru', locale: isEn ? 'en_US' : 'cs_CZ', type: 'website' },
    twitter: { card: 'summary_large_image', title, description }
  };
}

const LEAK_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';

const getSafeImage = (url) => {
  if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
  return url;
};

const getThumbnail = (post, supabaseUrl) => {
  const typeStr = (post.type || '').toLowerCase().trim();
  if (typeStr.includes('leak')) return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png` : LEAK_PLACEHOLDER_URL;
  if (post.image_url) return post.image_url;
  if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/hqdefault.jpg`;
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

const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response.json();
  } catch (error) {
    clearTimeout(id);
    return null; 
  }
};

const STATIC_SNAPSHOT_POSTS = [
  { id: 'snap-1', title: 'Katalog Grafických Karet a Index Výkonu', title_en: 'GPU Database and Performance Index', slug: '../../gpu-index', slug_en: '../../gpu-index', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-2', title: 'Katalog Procesorů a Index Výkonu', title_en: 'CPU Database and Performance Index', slug: '../../cpu-index', slug_en: '../../cpu-index', created_at: new Date().toISOString(), type: 'article' }
];

export default async function HomePage({ params, isEn: isEnProp }) {
  const locale = params?.locale || 'cs';
  // ✅ DETEKCE: Prioritu má prop isEn z proxy stránky
  const isEn = isEnProp === true || locale === 'en';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const getHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const fetchOpts = { headers: getHeaders, next: { revalidate: 60 } };

  let p = [], s = [], duelsRes = [], cpuDuelsRes = [], exp = [], t = [], tw = [], d = [], pa = [], feat = [];

  try {
    [p, s, duelsRes, cpuDuelsRes, exp, t, tw, d, pa, feat] = await Promise.all([
      fetchWithTimeout(`${supabaseUrl}/rest/v1/posts?select=id,title,title_en,slug,slug_en,created_at,image_url,video_id,type&type=neq.expected&order=created_at.desc&limit=35`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/stats?select=value&name=eq.total_visits&limit=1`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/gpu_duels?select=id,title_cs,title_en,slug,slug_en,created_at&order=created_at.desc&limit=11`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/cpu_duels?select=id,title_cs,title_en,slug,slug_en,created_at&order=created_at.desc&limit=11`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/posts?select=*&type=eq.expected&order=created_at.desc&limit=3`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/tipy?select=*&order=created_at.desc&limit=3`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/tweaky?select=*&order=created_at.desc&limit=3`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/darci?select=*&order=amount.desc&limit=20`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/partneri?select=*&order=created_at.desc&limit=4`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/game_deals?select=*&order=created_at.desc&limit=3`, fetchOpts)
    ]);
  } catch (err) { console.error("Data load fail:", err); }

  const data = { 
    posts: p && Array.isArray(p) && p.length > 0 ? p : STATIC_SNAPSHOT_POSTS, 
    stats: (s && Array.isArray(s) && s.length > 0) ? s[0] : { value: 0 }, 
    latestDuels: duelsRes && Array.isArray(duelsRes) ? duelsRes : [],
    latestCpuDuels: cpuDuelsRes && Array.isArray(cpuDuelsRes) ? cpuDuelsRes : [],
    expectedGames: exp && Array.isArray(exp) ? exp : [],
    nejnovejsiTipy: t && Array.isArray(t) ? t : [],
    nejnovejsiTweaky: tw && Array.isArray(tw) ? tw : [],
    darci: d && Array.isArray(d) ? d : [],
    partneri: pa && Array.isArray(pa) ? pa : [],
    featuredDeals: feat && Array.isArray(feat) ? feat : []
  };

  const latestPosts = data.posts.slice(0, 20);
  const randomPosts = data.posts.length > 20 ? data.posts.slice(20, 35) : data.posts; 
  const visualGpuDuels = data.latestDuels.slice(0, 3);
  const deepGpuDuels = data.latestDuels.slice(3, 11);
  const visualCpuDuels = data.latestCpuDuels.slice(0, 3);
  const deepCpuDuels = data.latestCpuDuels.slice(3, 11);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        body > div[id^="ssp-zone"] { display: none !important; }
        #guru-chat, #guru-pruvodce, .guru-pruvodce { display: none !important; }
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .guru-hero-section { max-width: 1200px; margin: 40px auto; padding: 60px 50px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%); border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2); display: flex; align-items: center; gap: 50px; flex-wrap: wrap; position: relative; overflow: hidden; backdrop-filter: blur(15px); }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; letter-spacing: 1px; }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border: 1px solid rgba(83, 252, 24, 0.3); }
        .social-btn-main.duels { background: rgba(255, 0, 85, 0.1); color: #ff0055; border: 1px solid rgba(255, 0, 85, 0.3); }
        .social-btn-main.cpuduels { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid rgba(102, 252, 241, 0.3); }
        .social-btn-main.fpscalc { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
        .social-btn-main.bottleneck { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
        .social-btn-main.poradna { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
        .social-btn-main.deals { background: rgba(249, 115, 22, 0.1); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
        .social-btn-main.support { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); }
        .monetize-hero-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 40px 30px; text-decoration: none; color: #fff; transition: 0.4s; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .monetize-hero-card.hof { border-top: 4px solid #a855f7; }
        .monetize-hero-card.partners { border-top: 4px solid #eab308; }
        .seo-link-pill { display: inline-block; padding: 8px 16px; margin: 0 10px 10px 0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; color: #9ca3af; font-size: 13px; text-decoration: none; transition: 0.2s; }
        .seo-link-pill:hover { background: rgba(102, 252, 241, 0.1); border-color: #66fcf1; color: #fff; }
        .seo-hard-text-block { max-width: 1200px; margin: 0 auto 60px auto; padding: 40px; background: rgba(15, 17, 21, 0.8); border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.15); color: #9ca3af; line-height: 1.8; }
        .guru-partner-button { background: linear-gradient(90deg, rgba(168, 85, 247, 0.15) 0%, rgba(102, 252, 241, 0.15) 100%); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px; padding: 25px 35px; display: flex; align-items: center; justify-content: space-between; transition: 0.4s; cursor: pointer; text-decoration: none; margin-bottom: 60px; }
        @media (max-width: 768px) { .guru-hero-section { padding: 40px 20px; text-align: center; } .social-btn-main { width: 100%; } }
      `}} />

      {/* --- 🚀 HERO SEKCE --- */}
      <header className="guru-hero-section" style={{ marginTop: '40px' }}>
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} />
              <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>
                {isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'Vaše technologická základna'}
              </span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1' }}>
              {isEn ? <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU COMPARISON</span>, FPS CALCULATOR & PC BUILDS</> 
                     : <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU SROVNÁNÍ</span>, FPS KALKULAČKA A PC SESTAVY</>}
            </h1>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#9ca3af', marginBottom: '40px', maxWidth: '700px' }}>
              {isEn ? "Hardware expert with 20 years of experience. Mission: eradicate lag, optimize FPS, and build a place where every geek feels at home." 
                     : "S 20 lety praxe v servisu hardware vím, kde každá mašina tlačí. Moje mise je jasná: vymýtit lagy, zkrotit FPS a vytvořit web, kde se každý geek cítí jako doma."}
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn-main live"><Activity size={18}/> {isEn ? 'WATCH LIVE' : 'SLEDOVAT LIVE'}</a>
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="social-btn-main duels"><Swords size={18}/> {isEn ? 'GPU BATTLES' : 'SOUBOJE GPU'}</a>
              <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="social-btn-main cpuduels"><Cpu size={18}/> {isEn ? 'CPU BATTLES' : 'SOUBOJE CPU'}</a>
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="social-btn-main fpscalc"><Gamepad2 size={18}/> {isEn ? 'CAN I RUN IT?' : 'ROZJEDU TO?'}</a>
              <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="social-btn-main bottleneck"><Layers size={18}/> {isEn ? 'BOTTLENECK' : 'BOTTLENECK'}</a>
              <a href={isEn ? "/en/poradna" : "/poradna"} className="social-btn-main poradna"><MessageSquare size={18}/> {isEn ? 'V.I.P HELP DESK' : 'V.I.P PORADNA'}</a>
              <a href={isEn ? "/en/deals" : "/cs/deals"} className="social-btn-main deals"><Flame size={18}/> {isEn ? 'GAME DEALS' : 'SLEVY NA HRY'}</a>
              <a href={isEn ? "/en/support" : "/support"} className="social-btn-main support"><Heart size={18}/> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
            </div>
        </div>
        <div style={{ flexShrink: 0, width: '100%', maxWidth: '420px', zIndex: 10 }}>
            <HeurekaButtons isEn={isEn} />
        </div>
      </header>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <a href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-partner-button">
          <div style={{ fontSize: '17px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Award color="#a855f7" size={32} />
            <span>{isEn ? "OUR PARTNERS: Support Hardware Guru by shopping through our verified links" : "naši partneri: nákupem přes tyto odkazy podpoříte provoz webu Hardware Guru"}</span>
          </div>
          <ChevronRight size={32} color="#a855f7" />
        </a>
      </section>

      {/* SEO BLOCK */}
      <section className="seo-hard-text-block">
        {isEn ? (
          <>
            <h2>Hardware Guru – CPU, GPU comparison and FPS calculator</h2>
            <p>Welcome to The Hardware Guru, a leading tech portal focused on detailed <a href="/en/gpuvs">graphics card (GPU) comparisons</a> and <a href="/en/cpuvs">processor (CPU) comparisons</a>. Whether you are building a new gaming PC or planning an upgrade, our tools will help you make the right decision.</p>
          </>
        ) : (
          <>
            <h2>Hardware Guru – CPU, GPU srovnání a FPS kalkulačka</h2>
            <p>Vítejte na The Hardware Guru, předním českém portálu zaměřeném na detailní <a href="/gpuvs">srovnání grafických karet (GPU)</a> a <a href="/cpuvs">procesorů (CPU)</a>.</p>
          </>
        )}
      </section>

      {/* ČLÁNKY */}
      {latestPosts.length > 0 && (
        <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
              {isEn ? 'Latest Articles & Videos' : 'Nejnovější články & Videa'}
            </h2>
            <a href={isEn ? "/en/clanky" : "/clanky"} style={{ color: '#66fcf1', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'ALL ARTICLES →' : 'VŠECHNY ČLÁNKY →'}</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {latestPosts.map((post) => {
              const badge = getBadgeInfo(post, isEn);
              return (
                <a key={post.id} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#0b0c10' }}>
                      <img src={getThumbnail(post, supabaseUrl)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{badge.text}</div>
                    </div>
                    <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{isEn ? (post.title_en || post.title) : post.title}</h3>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#45a29e' }}>{new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
                        <span style={{ color: '#66fcf1', fontWeight: 'bold' }}>{isEn ? 'READ MORE →' : 'ČÍST ČLÁNEK →'}</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#050505', padding: '40px 20px', borderTop: '1px solid rgba(102, 252, 241, 0.2)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#6b7280' }}>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? 'GPU Index & Catalog' : 'Katalog Grafických Karet a Index Výkonu'}</a>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? 'CPU Index & Catalog' : 'Katalog Procesorů a Index Výkonu'}</a>
            <a href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? 'Tech Dictionary' : 'HW Slovník'}</a>
            <a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? 'Expected Games' : 'Očekávané Hry'}</a>
            <a href={isEn ? "/en/deals" : "/deals"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? 'Game Deals' : 'Slevy'}</a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? 'Bottleneck Calculator' : 'Bottleneck Kalkulačka'}</a>
        </div>
        <div style={{ marginTop: '20px', color: '#4b5563', fontSize: '11px' }}>
          &copy; {new Date().getFullYear()} The Hardware Guru. {isEn ? 'All rights reserved.' : 'Všechna práva vyhrazena.'}
        </div>
      </footer>
    </div>
  );
}
