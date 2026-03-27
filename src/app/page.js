import React from 'react';
import Script from 'next/script';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords, Cpu, Gamepad2, Layers, MessageSquare, Award, Bell, Bookmark, Share2, Clock, Compass, Shuffle, Link2 } from 'lucide-react';
import SeznamAd from '../components/SeznamAd';

/**
 * GURU HOMEPAGE V18.7 - FINAL ROUTE & BADGE LOGIC FIX
 * Cesta: src/app/page.js
 */

export async function generateMetadata({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
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

// --- TVRDÝ STATICKÝ SNAPSHOT ---
const STATIC_SNAPSHOT_POSTS = [
  { id: 'snap-1', title: 'Katalog Grafických Karet a Index Výkonu', title_en: 'GPU Database and Performance Index', slug: 'gpu-index', slug_en: 'gpu-index', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-2', title: 'Katalog Procesorů a Index Výkonu', title_en: 'CPU Database and Performance Index', slug: 'cpu-index', slug_en: 'cpu-index', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-3', title: 'Co je to Bottleneck a jak ho vyřešit?', title_en: 'What is a Bottleneck and how to fix it?', slug: 'co-je-bottleneck', slug_en: 'what-is-bottleneck', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-4', title: 'Doporučené PC sestavy pro hráče', title_en: 'Recommended PC Builds for Gamers', slug: 'doporucene-herni-pc-sestavy', slug_en: 'recommended-gaming-pc-builds', created_at: new Date().toISOString(), type: 'article' }
];

const STATIC_SNAPSHOT_GPU_DUELS = [
  { id: 'sdg-1', title_cs: 'RTX 4090 vs RX 7900 XTX', title_en: 'RTX 4090 vs RX 7900 XTX', slug: 'rtx-4090-vs-rx-7900-xtx', slug_en: 'rtx-4090-vs-rx-7900-xtx' },
  { id: 'sdg-2', title_cs: 'RTX 4070 vs RX 7800 XT', title_en: 'RTX 4070 vs RX 7800 XT', slug: 'rtx-4070-vs-rx-7800-xt', slug_en: 'rtx-4070-vs-rx-7800-xt' },
  { id: 'sdg-3', title_cs: 'RTX 4060 vs RX 7600', title_en: 'RTX 4060 vs RX 7600', slug: 'rtx-4060-vs-rx-7600', slug_en: 'rtx-4060-vs-rx-7600' }
];

const STATIC_SNAPSHOT_CPU_DUELS = [
  { id: 'sdc-1', title_cs: 'Ryzen 7 7800X3D vs Core i9-14900K', title_en: 'Ryzen 7 7800X3D vs Core i9-14900K', slug: 'ryzen-7-7800x3d-vs-core-i9-14900k', slug_en: 'ryzen-7-7800x3d-vs-core-i9-14900k' },
  { id: 'sdc-2', title_cs: 'Ryzen 5 7600X vs Core i5-13600K', title_en: 'Ryzen 5 7600X vs Core i5-13600K', slug: 'ryzen-5-7600x-vs-core-i5-13600k', slug_en: 'ryzen-5-7600x-vs-core-i5-13600k' },
  { id: 'sdc-3', title_cs: 'Ryzen 7 5800X3D vs Ryzen 7 7800X3D', title_en: 'Ryzen 7 5800X3D vs Ryzen 7 7800X3D', slug: 'ryzen-7-5800x3d-vs-ryzen-7-7800x3d', slug_en: 'ryzen-7-5800x3d-vs-ryzen-7-7800x3d' }
];

// --- POMOCNÁ FUNKCE PRO GENERUJÍCÍ ODKAZY (ZABRÁNÍ 404) ---
const getPostHref = (post, isEn) => {
  const slug = isEn ? (post.slug_en || post.slug) : post.slug;
  // Pokud je to katalog, odkazuje přímo na root
  if (slug === 'gpu-index' || slug === 'cpu-index') {
    return isEn ? `/en/${slug}` : `/${slug}`;
  }
  // Standardní články
  return isEn ? `/en/clanky/${slug}` : `/clanky/${slug}`;
};

export default async function HomePage({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
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
  } catch (err) {}

  const data = { 
    posts: p && Array.isArray(p) && p.length > 0 ? p : STATIC_SNAPSHOT_POSTS, 
    stats: (s && Array.isArray(s) && s.length > 0) ? s[0] : { value: 0 }, 
    latestDuels: duelsRes && Array.isArray(duelsRes) && duelsRes.length > 0 ? duelsRes : STATIC_SNAPSHOT_GPU_DUELS,
    latestCpuDuels: cpuDuelsRes && Array.isArray(cpuDuelsRes) && cpuDuelsRes.length > 0 ? cpuDuelsRes : STATIC_SNAPSHOT_CPU_DUELS,
    expectedGames: exp || [], nejnovejsiTipy: t || [], nejnovejsiTweaky: tw || [], darci: d || [], partneri: pa || [], featuredDeals: feat || []
  };

  const latestPosts = data.posts.slice(0, 20);
  const randomPosts = data.posts.length > 20 ? data.posts.slice(20, 35) : data.posts; 
  const visualGpuDuels = data.latestDuels.slice(0, 3);
  const deepGpuDuels = data.latestDuels.slice(3, 11);
  const visualCpuDuels = data.latestCpuDuels.slice(0, 3);
  const deepCpuDuels = data.latestCpuDuels.slice(3, 11);

  const baseUrl = "https://thehardwareguru.cz";
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "name": "The Hardware Guru", "url": isEn ? `${baseUrl}/en` : baseUrl };
  const articleSchemas = latestPosts.slice(0, 3).map(post => ({ "@context": "https://schema.org", "@type": "Article", "headline": isEn ? (post.title_en || post.title) : post.title, "datePublished": post.created_at, "image": getThumbnail(post, supabaseUrl) }));
  
  const itemListSchema = latestPosts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": latestPosts.map((post, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${baseUrl}${getPostHref(post, isEn)}`,
      "name": isEn ? (post.title_en || post.title) : post.title
    }))
  } : null;

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />
      {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />}
      {articleSchemas.map((schema, i) => ( <script key={`article-schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(schema) }} /> ))}

      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .expected-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .expected-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.25); border-color: #66fcf1; }
        .guru-hero-section { max-width: 1200px; margin: 40px auto; padding: 60px 50px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%); border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2); display: flex; align-items: center; gap: 50px; flex-wrap: wrap; box-shadow: 0 30px 60px rgba(0,0,0,0.8); position: relative; overflow: hidden; backdrop-filter: blur(15px); }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid transparent; cursor: pointer; letter-spacing: 1px; }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn-main.live:hover { background: #53fc18; color: #000; box-shadow: 0 10px 25px rgba(83, 252, 24, 0.4); transform: translateY(-3px); }
        .social-btn-main.duels { background: rgba(255, 0, 85, 0.1); color: #ff0055; border-color: rgba(255, 0, 85, 0.3); }
        .social-btn-main.duels:hover { background: #ff0055; color: #fff; box-shadow: 0 10px 25px rgba(255, 0, 85, 0.4); transform: translateY(-3px); }
        .social-btn-main.cpuduels { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: rgba(102, 252, 241, 0.3); }
        .social-btn-main.cpuduels:hover { background: #66fcf1; color: #000; box-shadow: 0 10px 25px rgba(102, 252, 241, 0.4); transform: translateY(-3px); }
        .seo-link-pill { display: inline-block; padding: 8px 16px; margin: 0 10px 10px 0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; color: #9ca3af; font-size: 13px; text-decoration: none; transition: 0.2s ease; }
        .seo-link-pill:hover { background: rgba(102, 252, 241, 0.1); border-color: #66fcf1; color: #fff; }
        .seo-hard-text-block { max-width: 1200px; margin: 0 auto 60px auto; padding: 40px; background: rgba(15, 17, 21, 0.8); border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.15); color: #9ca3af; line-height: 1.8; font-size: 16px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .seo-hard-text-block h2 { color: #fff; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 900; }
        .seo-hard-text-block a { color: #66fcf1; text-decoration: none; font-weight: bold; border-bottom: 1px solid rgba(102, 252, 241, 0.3); padding-bottom: 1px; }
        @media (max-width: 768px) { .guru-hero-section { padding: 40px 20px; text-align: center; } .social-btn-main { width: 100%; } }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px', display: 'flex', justifyContent: 'center' }}>
        <SeznamAd zoneId={408654} width={970} height={210} />
      </div>

      <header className="guru-hero-section">
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} /> <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>Vaše technologická základna</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1' }}>
              {isEn ? <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU COMPARISON</span>, FPS CALCULATOR & PC BUILDS</> 
                     : <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU SROVNÁNÍ</span>, FPS KALKULAČKA A PC SESTAVY</>}
            </h1>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#9ca3af', marginBottom: '40px', maxWidth: '700px' }}>Hardware expert s 20 lety praxe. Moje mise: vymýtit lagy, zkrotit FPS a vytvořit web, kde se každý geek cítí jako doma.</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn-main live"><Activity size={18}/> {isEn ? 'LIVE' : 'SLEDOVAT LIVE'}</a>
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="social-btn-main duels"><Swords size={18}/> {isEn ? 'GPU BATTLES' : 'SOUBOJE GPU'}</a>
              <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="social-btn-main cpuduels"><Cpu size={18}/> {isEn ? 'CPU BATTLES' : 'SOUBOJE CPU'}</a>
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="social-btn-main cpuduels" style={{backgroundColor:'rgba(168,85,247,0.1)', color:'#a855f7', borderColor:'rgba(168,85,247,0.3)'}}><Gamepad2 size={18}/> {isEn ? 'CAN I RUN IT?' : 'ROZJEDU TO?'}</a>
            </div>
        </div>
        <div style={{ width: '180px', height: '180px', background: 'linear-gradient(135deg, #0b0c10 0%, #1a1c23 100%)', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#66fcf1', fontSize: '4rem', fontWeight: '950', flexShrink: 0 }}>HG</div>
      </header>

      {/* --- SEO TEXT BLOCK --- */}
      <section className="seo-hard-text-block" style={{ marginBottom: '60px' }}>
        {isEn ? (
          <>
            <h2>Hardware Guru – CPU, GPU comparison and FPS calculator</h2>
            <p>Welcome to The Hardware Guru, a tech portal focused on detailed <a href="/en/gpu-index">GPU Database and Performance Index</a> and <a href="/en/cpu-index">CPU Database and Performance Index</a>.</p>
            <ul>
              <li><a href="/en/gpu-index">GPU Database and Performance Index</a></li>
              <li><a href="/en/cpu-index">CPU Database and Performance Index</a></li>
              <li><a href="/en/clanky/nejlepsi-graficke-karty-gpu-velky-test">Best Graphics Cards (GPU) – Mega Test & Comparison</a></li>
            </ul>
          </>
        ) : (
          <>
            <h2>Hardware Guru – CPU, GPU srovnání a FPS kalkulačka</h2>
            <p>Vítejte na The Hardware Guru, portálu zaměřeném na <a href="/gpu-index">Katalog Grafických Karet a Index Výkonu</a> a <a href="/cpu-index">Katalog Procesorů a Index Výkonu</a>.</p>
            <ul>
              <li><a href="/gpu-index">Katalog Grafických Karet a Index Výkonu</a></li>
              <li><a href="/cpu-index">Katalog Procesorů a Index Výkonu</a></li>
              <li><a href="/clanky/nejlepsi-graficke-karty-gpu-velky-test">Nejlepší grafické karty (GPU) – Velký test a srovnání</a></li>
            </ul>
          </>
        )}
      </section>

      {/* --- SEO: CATEGORY HUB --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
          <a href={isEn ? "/en/clanky" : "/clanky"} className="seo-link-pill"><Compass size={14} style={{marginRight:'5px'}}/> {isEn ? 'Hardware News' : 'HW Novinky'}</a>
          <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="seo-link-pill"><Layers size={14} style={{marginRight:'5px'}}/> {isEn ? 'GPU Catalog' : 'Katalog Grafických Karet a Index Výkonu'}</a>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="seo-link-pill"><Cpu size={14} style={{marginRight:'5px'}}/> {isEn ? 'CPU Catalog' : 'Katalog Procesorů a Index Výkonu'}</a>
          <a href={isEn ? "/en/doporucene-sestavy" : "/doporucene-sestavy"} className="seo-link-pill"><Gamepad2 size={14} style={{marginRight:'5px'}}/> {isEn ? 'PC Builds' : 'Doporučené PC Sestavy'}</a>
        </div>
      </section>

      {/* --- ČLÁNKY GRID --- */}
      {latestPosts.length > 0 && (
        <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginTop: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {latestPosts.map((post, idx) => {
              const badge = getBadgeInfo(post, isEn);
              return (
                <a key={post.id} href={getPostHref(post, isEn)} style={{ textDecoration: 'none' }}>
                  <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#0b0c10' }}>
                      <img src={getThumbnail(post, supabaseUrl)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading={idx < 3 ? "eager" : "lazy"} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{badge.text}</div>
                    </div>
                    <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{isEn ? (post.title_en || post.title) : post.title}</h3>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span style={{ color: '#66fcf1', fontWeight: 'bold' }}>ČÍST ČLÁNEK →</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </main>
      )}

      {/* --- FOOTER --- */}
      <footer style={{ background: '#050505', padding: '40px 20px', borderTop: '1px solid rgba(102, 252, 241, 0.2)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#6b7280' }}>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} style={{ color: '#6b7280', textDecoration: 'none' }}>Katalog Grafických Karet a Index Výkonu</a>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} style={{ color: '#6b7280', textDecoration: 'none' }}>Katalog Procesorů a Index Výkonu</a>
            <a href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#6b7280', textDecoration: 'none' }}>HW Slovník</a>
            <a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"} style={{ color: '#6b7280', textDecoration: 'none' }}>Očekávané Hry</a>
            <a href={isEn ? "/en/bottleneck-kalkulacka" : "/bottleneck-kalkulacka"} style={{ color: '#6b7280', textDecoration: 'none' }}>Bottleneck Kalkulačka</a>
        </div>
        <div style={{ marginTop: '20px', color: '#4b5563', fontSize: '11px' }}>&copy; {new Date().getFullYear()} The Hardware Guru. Všechna práva vyhrazena.</div>
      </footer>
    </div>
  );
}
