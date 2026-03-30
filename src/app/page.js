import React from 'react';
import Script from 'next/script';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords, Cpu, Gamepad2, Layers, MessageSquare, Award, Bell, Bookmark, Share2, Clock, Compass, Shuffle, Link2, Monitor, Smartphone, Tv } from 'lucide-react';
import SeznamAd from '../components/SeznamAd';

/**
 * GURU HOMEPAGE V19.3 - THE ONLY ALLOWED MONEY UPDATE
 * 🚀 CÍL: 100% integrita tvé zálohy V18.6 + Seznam Ad + eHUB (ID: 71c85dea).
 */

// --- DYNAMICKÁ METADATA PRO ABSOLUTNÍ CANONICAL A BING TRUST ---
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
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
      bingBot: { 
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    alternates: {
      canonical: isEn ? `${baseUrl}/en` : `${baseUrl}/`, 
      languages: {
        'cs-CZ': `${baseUrl}/`,
        'en-US': `${baseUrl}/en`,
      }
    },
    openGraph: {
      title,
      description,
      url: isEn ? `${baseUrl}/en` : `${baseUrl}/`,
      siteName: 'The Hardware Guru',
      locale: isEn ? 'en_US' : 'cs_CZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

const LEAK_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';

// --- POMOCNÉ FUNKCE PRO SSR ---
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

// ✅ FIX: Zvýšený timeout na 12000ms pro pomalé crawlery (Bing)
const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response.json();
  } catch (error) {
    clearTimeout(id);
    console.warn(`[TIMEOUT OR FETCH ERROR] ${url}`);
    return null; 
  }
};

// --- TVRDÝ STATICKÝ SNAPSHOT (NEJLEPŠÍ ZÁCHRANNÁ SÍŤ PRO BING) ---
const STATIC_SNAPSHOT_POSTS = [
  { id: 'snap-1', title: 'Katalog Grafických Karet a Index Výkonu', title_en: 'GPU Database and Performance Index', slug: '../../gpu-index', slug_en: '../../gpu-index', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-2', title: 'Katalog Procesorů a Index Výkonu', title_en: 'CPU Database and Performance Index', slug: '../../cpu-index', slug_en: '../../cpu-index', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-3', title: 'Co je to Bottleneck a jak ho vyřešit?', title_en: 'What is a Bottleneck and how to fix it?', slug: 'co-je-bottleneck', slug_en: 'what-is-bottleneck', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-4', title: 'Doporučené PC sestavy pro hráče', title_en: 'Recommended PC Builds for Gamers', slug: '../../sestavy', slug_en: '../../sestavy', created_at: new Date().toISOString(), type: 'article' }
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

// =====================================================================
// HLAVNÍ STRÁNKA (TVRDÝ SERVER RENDER BEZ SUSPENSE)
// =====================================================================

export default async function HomePage({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const getHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const fetchOpts = { headers: getHeaders, next: { revalidate: 60 } };

  // 🔥 OSTRÉ EHUB TRACKING LINKY (71c85dea)
  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";

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
  } catch (err) {
    console.error("Data load critical fail:", err);
  }

  const data = { 
    posts: p && Array.isArray(p) && p.length > 0 ? p : STATIC_SNAPSHOT_POSTS, 
    stats: (s && Array.isArray(s) && s.length > 0) ? s[0] : { value: 0 }, 
    latestDuels: duelsRes && Array.isArray(duelsRes) && duelsRes.length > 0 ? duelsRes : STATIC_SNAPSHOT_GPU_DUELS,
    latestCpuDuels: cpuDuelsRes && Array.isArray(cpuDuelsRes) && cpuDuelsRes.length > 0 ? cpuDuelsRes : STATIC_SNAPSHOT_CPU_DUELS,
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

  const baseUrl = "https://thehardwareguru.cz";
  const currentUrl = isEn ? `${baseUrl}/en` : baseUrl;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Hardware Guru",
    "url": currentUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${baseUrl}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Hardware Guru",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "image": [`${baseUrl}/logo.png`],
    "sameAs": ["https://kick.com/thehardwareguru", "https://discord.com/invite/n7xThr8", "https://youtube.com/@TheHardwareGuru_Czech"]
  };

  const articleSchemas = latestPosts.slice(0, 3).map(post => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": isEn ? (post.title_en || post.title) : post.title,
    "datePublished": post.created_at,
    "image": getThumbnail(post, supabaseUrl)
  }));

  const itemListSchema = latestPosts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": latestPosts.map((post, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": isEn ? `${baseUrl}/en/clanky/${post.slug_en || post.slug}` : `${baseUrl}/clanky/${post.slug}`,
      "name": isEn ? (post.title_en || post.title) : post.title
    }))
  } : null;

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
      {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />}
      {articleSchemas.map((schema, i) => (
         <script key={`article-schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(schema) }} />
      ))}

      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .expected-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .expected-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.25); border-color: #66fcf1; }
        .guru-hero-section { max-width: 1200px; margin: 40px auto; padding: 60px 50px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%); border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2); display: flex; align-items: center; gap: 50px; flex-wrap: wrap; box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(102, 252, 241, 0.05); position: relative; overflow: hidden; backdrop-filter: blur(15px); }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid transparent; cursor: pointer; letter-spacing: 1px; }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn-main.live:hover { background: #53fc18; color: #000; box-shadow: 0 10px 25px rgba(83, 252, 24, 0.4); transform: translateY(-3px); }
        .social-btn-main.duels { background: rgba(255, 0, 85, 0.1); color: #ff0055; border-color: rgba(255, 0, 85, 0.3); }
        .social-btn-main.cpuduels { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: rgba(102, 252, 241, 0.3); }
        .social-btn-main.fpscalc { background: rgba(168, 85, 247, 0.1); color: #a855f7; border-color: rgba(168, 85, 247, 0.3); }
        .social-btn-main.bottleneck { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); }
        .social-btn-main.poradna { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.3); }
        .social-btn-main.deals { background: rgba(249, 115, 22, 0.1); color: #f97316; border-color: rgba(249, 115, 22, 0.3); }
        .social-btn-main.support { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3); }
        .deal-hp-card { display: flex; align-items: center; gap: 20px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(249, 115, 22, 0.05) 100%); padding: 20px; border-radius: 24px; border: 1px solid rgba(249, 115, 22, 0.2); transition: 0.4s; text-decoration: none; overflow: hidden; position: relative; }
        .duel-hp-card { display: flex; align-items: center; gap: 20px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(255, 0, 85, 0.05) 100%); padding: 20px; border-radius: 24px; border: 1px solid rgba(255, 0, 85, 0.2); transition: 0.4s; text-decoration: none; overflow: hidden; position: relative; }
        .cpu-duel-hp-card { display: flex; align-items: center; gap: 20px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(102, 252, 241, 0.05) 100%); padding: 20px; border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.2); transition: 0.4s; text-decoration: none; overflow: hidden; position: relative; }
        .tip-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tweak-card { transition: all 0.3s ease; border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(234, 179, 8, 0.2); display: inline-block; }
        .monetize-hero-card { background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(10, 11, 13, 0.98) 100%); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 40px 30px; text-decoration: none; color: #fff; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); position: relative; overflow: hidden; backdrop-filter: blur(20px); }
        .seo-link-pill { display: inline-block; padding: 8px 16px; margin: 0 10px 10px 0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; color: #9ca3af; font-size: 13px; text-decoration: none; transition: 0.2s ease; }
        .seo-hard-text-block { max-width: 1200px; margin: 0 auto; padding: 40px; background: rgba(15, 17, 21, 0.8); border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.15); color: #9ca3af; line-height: 1.8; font-size: 16px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        /* 🔥 STICKY ANCHOR CSS */
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        
        .ehub-hp-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1200px; margin: 0 auto 60px; padding: 0 20px; }
        .ehub-hp-card { background: rgba(15, 17, 21, 0.8); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; transition: 0.3s; }
        .ehub-hp-card:hover { transform: translateY(-3px); border-color: rgba(168, 85, 247, 0.4); }
        .ehub-hp-tag { font-size: 10px; font-weight: 950; color: #a855f7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: block; }
        .ehub-hp-link { color: #fff; text-decoration: none; font-weight: 900; font-size: 13px; display: flex; align-items: center; gap: 5px; margin-top: 15px; }

        @media (max-width: 768px) { .ad-desktop-wrapper { display: none; } .ad-mobile-wrapper { display: flex; justify-content: center; } .ehub-hp-bar { grid-template-columns: 1fr; } }
      `}</style>

      {/* 🔥 TOP AD SLOT - 100% Viewability */}
      <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
        <div className="ad-mobile-wrapper" style={{ margin: '0 -20px' }}><SeznamAd zoneId={408651} width={300} height={250} /></div>
      </div>

      {/* --- 🚀 HERO SEKCE (RANNÍ V18.6) --- */}
      <header className="guru-hero-section">
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} />
              <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>{isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'Vaše technologická základna'}</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1', textShadow: '0 0 20px rgba(102, 252, 241, 0.3)' }}>
              {isEn ? <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU COMPARISON</span>, FPS CALCULATOR & PC BUILDS</> : <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU SROVNÁNÍ</span>, FPS KALKULAČKA A PC SESTAVY</>}
            </h1>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#9ca3af', marginBottom: '40px', maxWidth: '700px' }}>
              {isEn ? "Hardware expert with 20 years of experience. Mission: eradicate lag, optimize FPS." : "S 20 lety praxe v servisu hardware vím, kde každá mašina tlačí. Moje mise je jasná: vymýtit lagy, zkrotit FPS a vytvořit web, kde se každý geek cítí jako doma."}
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn-main live"><Activity size={18}/> {isEn ? 'LIVE' : 'SLEDOVAT LIVE'}</a>
              <a href="/gpuvs" className="social-btn-main duels"><Swords size={18}/> {isEn ? 'GPU BATTLES' : 'SOUBOJE GPU'}</a>
              <a href="/cpuvs" className="social-btn-main cpuduels"><Cpu size={18}/> {isEn ? 'CPU BATTLES' : 'SOUBOJE CPU'}</a>
              <a href="/fps-kalkulacka" className="social-btn-main fpscalc"><Gamepad2 size={18}/> {isEn ? 'CAN I RUN IT?' : 'ROZJEDU TO?'}</a>
              <a href="/bottleneck-kalkulacka" className="social-btn-main bottleneck"><Layers size={18}/> {isEn ? 'BOTTLENECK' : 'BOTTLENECK'}</a>
              <a href="/poradna" className="social-btn-main poradna"><MessageSquare size={18}/> {isEn ? 'HELP DESK' : 'V.I.P PORADNA'}</a>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="social-btn-main deals"><Flame size={18}/> {isEn ? 'DEALS' : 'SLEVY NA HRY'}</a>
              <a href="/support" className="social-btn-main support"><Heart size={18}/> {isEn ? 'SUPPORT' : 'PODPOŘIT GURU'}</a>
            </div>
        </div>
        <div style={{ width: '180px', height: '180px', background: 'linear-gradient(135deg, #0b0c10 0%, #1a1c23 100%)', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#66fcf1', fontSize: '4rem', fontWeight: '950', flexShrink: 0, boxShadow: '0 0 40px rgba(102, 252, 241, 0.4)' }}>HG</div>
      </header>

      {/* 💰 EHUB AFFILIATE STRIP (ID: 71c85dea) */}
      <section className="ehub-hp-bar">
        <div className="ehub-hp-card">
           <span className="ehub-hp-tag">GURU EXKLUZIVNĚ</span>
           <h3 style={{ fontSize: '20px', fontWeight: '950' }}>SHOPCOM.CZ</h3>
           <p style={{ color: '#6b7280', fontSize: '14px' }}>Komponenty a PC sestavy za nejlepší ceny.</p>
           <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="ehub-hp-link">KOUPIT HARDWARE <ChevronRight size={14} /></a>
        </div>
        <div className="ehub-hp-card">
           <span className="ehub-hp-tag" style={{ color: '#66fcf1' }}>PROVĚŘENO GURUEM</span>
           <h3 style={{ fontSize: '20px', fontWeight: '950' }}>CUBENEST</h3>
           <p style={{ color: '#6b7280', fontSize: '14px' }}>Doplňky na stůl a MagSafe nabíječky.</p>
           <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="ehub-hp-link">VYBAVIT SETUP <ChevronRight size={14} /></a>
        </div>
      </section>

      {/* --- SEO TEXT BLOCK (RANNÍ V18.6) --- */}
      <section className="seo-hard-text-block" style={{ marginBottom: '60px' }}>
        <h2>Hardware Guru – CPU, GPU srovnání a FPS kalkulačka</h2>
        <p>Vítejte na The Hardware Guru, předním českém portálu zaměřeném na hardware.</p>
        <ul>
          <li><a href="/gpu-index">Katalog Grafických Karet a Index Výkonu</a></li>
          <li><a href="/cpu-index">Katalog Procesorů a Index Výkonu</a></li>
          <li><a href="/bottleneck-kalkulacka">Výpočet Bottlenecku</a></li>
          <li><a href="/fps-kalkulacka">FPS Kalkulačka</a></li>
          <li><a href="/sestavy">Doporučené herní PC sestavy</a></li>
          <li><a href="/slovnik">Slovník pojmů</a></li>
        </ul>
      </section>

      {/* --- SEO: CATEGORY HUB --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px', textAlign: 'center' }}>
          <a href="/clanky" className="seo-link-pill"><Compass size={14} style={{ marginRight: '5px' }}/> HW Novinky</a>
          <a href="/gpu-index" className="seo-link-pill"><Layers size={14} style={{ marginRight: '5px' }}/> GPU Katalog</a>
          <a href="/cpu-index" className="seo-link-pill"><Cpu size={14} style={{ marginRight: '5px' }}/> CPU Katalog</a>
          <a href="/slovnik" className="seo-link-pill"><MessageSquare size={14} style={{ marginRight: '5px' }}/> HW Slovník Pojmů</a>
          <a href="/sestavy" className="seo-link-pill"><Gamepad2 size={14} style={{ marginRight: '5px' }}/> Doporučené PC Sestavy</a>
      </section>

      {/* --- SDÍLET & ODEBÍRAT LIŠTA --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}><Award size={32} color="#a855f7" /><div><h3 style={{ fontSize: '20px', fontWeight: '950', margin: 0 }}>{isEn ? 'SHARE & SUBSCRIBE' : 'SDÍLET & ODEBÍRAT'}</h3></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button id="guru-os-btn" className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}><Bell size={20} fill="#fff" /></button>
            <Script id="onesignal-init" strategy="lazyOnload">{`if (typeof window !== 'undefined') { var checkBtn = setInterval(function() { var btn = document.getElementById('guru-os-btn'); if (btn && !btn.hasAttribute('data-bound')) { btn.setAttribute('data-bound', 'true'); btn.onclick = function(e) { e.preventDefault(); if (window.OneSignal) window.OneSignal.showSlidedownPrompt(); }; clearInterval(checkBtn); } }, 500); }`}</Script>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bookmark size={20} fill="#fff" /></a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://thehardwareguru.cz" target="_blank" rel="noreferrer" className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Share2 size={20} /></a>
          </div>
      </section>

      {/* --- SEO: STABILNÍ RANDOM LINK BLOCK --- */}
      {randomPosts.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '30px 20px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(102, 252, 241, 0.1)', borderRadius: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}><Shuffle size={16} /> {isEn ? 'DISCOVER MORE' : 'OBJEVTE DALŠÍ OBSAH'}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {randomPosts.map((post, idx) => ( <a key={`rand-${idx}`} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} className="seo-link-pill">{isEn ? (post.title_en || post.title) : post.title}</a> ))}
          </div>
        </section>
      )}

      {/* --- MONETIZACE A VIZUÁLNÍ SEKCE (RANNÍ V18.6) --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px' }}>
        
        {/* HALL OF FAME */}
        {data.darci.length > 0 && (
          <section style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '60px' }}>
              <a href={isEn ? "/en/sin-slavy" : "/sin-slavy"} className="monetize-hero-card" style={{ flex: 1, minWidth: '300px' }}>
                <Trophy size={40} color="#a855f7" />
                <h2 style={{ fontSize: '20px', fontWeight: '950', margin: '15px 0' }}>{isEn ? 'HALL OF FAME' : 'SÍŇ SLÁVY'}</h2>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>{data.darci.slice(0, 5).map(d => d.name).join(', ')}...</p>
              </a>
              <a href={isEn ? "/en/partneri" : "/partneri"} className="monetize-hero-card" style={{ flex: 1, minWidth: '300px', borderTop: '4px solid #eab308' }}>
                <Rocket size={40} color="#eab308" />
                <h2 style={{ fontSize: '20px', fontWeight: '950', margin: '15px 0' }}>{isEn ? 'PARTNERS' : 'PARTNEŘI'}</h2>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>{data.partneri.slice(0, 3).map(p => p.name).join(' • ')}</p>
              </a>
          </section>
        )}

        {/* SLEVY */}
        {data.featuredDeals.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '950', marginBottom: '30px' }}><Flame color="#f97316" fill="#f97316" /> {isEn ? 'HOT DEALS' : 'GURU ŽHAVÉ SLEVY'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {data.featuredDeals.map(deal => (
                <a key={deal.id} href={deal.affiliate_link} target="_blank" rel="nofollow sponsored" className="deal-hp-card">
                  <img src={deal.image_url} style={{ width: '100px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} alt="" />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: '900', fontSize: '14px' }}>{deal.title}</div><div style={{ color: '#f97316', fontWeight: '950', fontSize: '18px' }}>{isEn ? deal.price_en : deal.price_cs}</div></div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* GPU DUELY */}
        {visualGpuDuels.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '950', marginBottom: '30px' }}><Swords color="#ff0055" /> {isEn ? 'GPU BATTLES' : 'NEJNOVĚJŠÍ GPU DUELY'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {visualGpuDuels.map(duel => (
                <a key={duel.id} href={isEn ? `/en/gpuvs/${duel.slug_en || duel.slug}` : `/gpuvs/${duel.slug}`} className="duel-hp-card"><Swords size={24} color="#ff0055" /><div><div style={{ fontWeight: '900' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</div></div></a>
              ))}
            </div>
          </section>
        )}

        {/* ČLÁNKY GRID (RANNÍ V18.6) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {latestPosts.slice(0, 12).map(post => {
            const badge = getBadgeInfo(post, isEn);
            return (
              <a key={post.id} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="game-card" style={{ borderRadius: '16px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img src={getThumbnail(post, supabaseUrl)} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{badge.text}</div>
                  </div>
                  <div style={{ padding: '20px', flex: 1 }}><h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{isEn ? (post.title_en || post.title) : post.title}</h3></div>
                </div>
              </a>
            )
          })}
        </section>
      </main>

      {/* 🔥 STICKY BOTTOM ANCHOR */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
          <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
      </div>

      <footer style={{ background: '#050505', padding: '40px 20px', borderTop: '1px solid rgba(102, 252, 241, 0.2)', textAlign: 'center' }}>
        <div style={{ color: '#4b5563', fontSize: '11px' }}>&copy; {new Date().getFullYear()} The Hardware Guru. Všechna práva vyhrazena.</div>
      </footer>
    </div>
  );
}
