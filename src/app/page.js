import React from 'react';
import Script from 'next/script';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords, Cpu, Gamepad2, Layers, MessageSquare, Award, Bell, Bookmark, Share2, Clock, Compass, Shuffle, Link2 } from 'lucide-react';
import HeurekaButtons from '../components/HeurekaButtons';

/**
 * GURU HOMEPAGE V22.1 - CLEANUP DUPES
 * 🚀 CÍL: Odstranění duplicitní VIP Sestavy a banneru z page.js (nyní plně řízeno z layout.js).
 */

// --- DYNAMICKÁ METADATA PRO ABSOLUTNÍ CANONICAL A BING TRUST ---
export async function generateMetadata({ params, isEn: isEnProp }) {
  const locale = params?.locale || params?.lang || 'cs';
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

export default async function HomePage({ params, isEn: isEnProp }) {
  const locale = params?.locale || params?.lang || 'cs';
  const isEn = isEnProp === true || locale === 'en';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const getHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  
  // ✅ FIX: revalidate 60 pro maximální konzistenci v CDN (žádný "stale" pro Bing)
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
  } catch (err) {
    console.error("Data load critical fail:", err);
  }

  // ✅ FIX: Záchranná síť zaručuje, že crawler nikdy nedostane prázdnou stránku.
  const data = { 
    posts: p && Array.isArray(p) && p.length > 0 ? p : STATIC_SNAPSHOT_POSTS, 
    stats: (s && Array.isArray(s) && s.length > 0) ? s[0] : { value: 0 }, 
    latestDuels: duelsRes && Array.isArray(duelsRes) && duelsRes.length > 0 ? duelsRes : STATIC_SNAPSHOT_CPU_DUELS,
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
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
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

  // ✅ FIX: Doplnění 'name' vlastnosti pro striktní ItemList schema, jinak ho Bing odmítá.
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
      
      {/* GOOGLE ADSENSE - HLAVNÍ STRÁNKA */}
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous" strategy="afterInteractive" />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
      {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />}
      {articleSchemas.map((schema, i) => (
         <script key={`article-schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(schema) }} />
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        /* 🔥 AGRESIVNÍ SKRYTÍ POSTRANNÍCH SKLIK REKLAM (BRANDING/SKIN) NA HOMEPAGE 🔥 */
        body > div[id^="ssp-zone"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
        body > iframe[id^="ssp-zone"], body > iframe[name^="ssp-zone"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
        .ssp-branding, .branding-ssp { display: none !important; }
        
        /* 🤖 SKRYTÍ AI MOZKU (GURU PRŮVODCE) POUZE NA HOMEPAGE */
        #guru-chat, #guru-pruvodce, .guru-pruvodce, .chat-widget, [id*="chat"], [class*="chat"], [id*="mozek"], [class*="mozek"], iframe[src*="chat"] {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        
        .expected-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .expected-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.25); border-color: #66fcf1; }

        .guru-hero-section {
            max-width: 1200px; margin: 40px auto; padding: 60px 50px;
            background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%);
            border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2);
            display: flex; align-items: center; gap: 50px; flex-wrap: wrap;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(102, 252, 241, 0.05);
            position: relative; overflow: hidden; backdrop-filter: blur(15px);
        }
        .social-btn-main {
            padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid transparent; cursor: pointer; letter-spacing: 1px;
        }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn-main.live:hover { background: #53fc18; color: #000; box-shadow: 0 10px 25px rgba(83, 252, 24, 0.4); transform: translateY(-3px); }

        .social-btn-main.duels { background: rgba(255, 0, 85, 0.1); color: #ff0055; border-color: rgba(255, 0, 85, 0.3); }
        .social-btn-main.duels:hover { background: #ff0055; color: #fff; box-shadow: 0 10px 25px rgba(255, 0, 85, 0.4); transform: translateY(-3px); }

        .social-btn-main.cpuduels { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: rgba(102, 252, 241, 0.3); }
        .social-btn-main.cpuduels:hover { background: #66fcf1; color: #000; box-shadow: 0 10px 25px rgba(102, 252, 241, 0.4); transform: translateY(-3px); }

        .social-btn-main.fpscalc { background: rgba(168, 85, 247, 0.1); color: #a855f7; border-color: rgba(168, 85, 247, 0.3); }
        .social-btn-main.fpscalc:hover { background: #a855f7; color: #fff; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4); transform: translateY(-3px); }

        .social-btn-main.bottleneck { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); }
        .social-btn-main.bottleneck:hover { background: #38bdf8; color: #000; box-shadow: 0 10px 25px rgba(56, 189, 248, 0.4); transform: translateY(-3px); }

        .social-btn-main.poradna { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.3); }
        .social-btn-main.poradna:hover { background: #3b82f6; color: #fff; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4); transform: translateY(-3px); }

        .social-btn-main.deals { background: rgba(249, 115, 22, 0.1); color: #f97316; border-color: rgba(249, 115, 22, 0.3); }
        .social-btn-main.deals:hover { background: #f97316; color: #fff; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.4); transform: translateY(-3px); }

        .social-btn-main.support { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3); }
        .social-btn-main.support:hover { background: #eab308; color: #000; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.4); transform: translateY(-3px); }

        .deal-hp-card { display: flex; align-items: center; gap: 20px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(249, 115, 22, 0.05) 100%); padding: 20px; border-radius: 24px; border: 1px solid rgba(249, 115, 22, 0.2); transition: 0.4s; text-decoration: none; overflow: hidden; position: relative; }
        .deal-hp-card:hover { transform: translateY(-5px); border-color: #f97316; box-shadow: 0 15px 35px rgba(249, 115, 22, 0.25); }

        .duel-hp-card { display: flex; align-items: center; gap: 20px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(255, 0, 85, 0.05) 100%); padding: 20px; border-radius: 24px; border: 1px solid rgba(255, 0, 85, 0.2); transition: 0.4s; text-decoration: none; overflow: hidden; position: relative; }
        .duel-hp-card:hover { transform: translateY(-5px); border-color: #ff0055; box-shadow: 0 15px 35px rgba(255, 0, 85, 0.25); }

        .cpu-duel-hp-card { display: flex; align-items: center; gap: 20px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(102, 252, 241, 0.05) 100%); padding: 20px; border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.2); transition: 0.4s; text-decoration: none; overflow: hidden; position: relative; }
        .cpu-duel-hp-card:hover { transform: translateY(-5px); border-color: #66fcf1; box-shadow: 0 15px 35px rgba(102, 252, 241, 0.25); }

        .tip-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tip-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); border-color: #a855f7; }
        .tweak-card { transition: all 0.3s ease; border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tweak-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(234, 179, 8, 0.3); border-color: #eab308; }
        
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(234, 179, 8, 0.2); display: inline-block; }
        
        .monetize-hero-card { background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(10, 11, 13, 0.98) 100%); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 40px 30px; text-decoration: none; color: #fff; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); position: relative; overflow: hidden; backdrop-filter: blur(20px); }
        .monetize-hero-card.hof { border-top: 4px solid #a855f7; }
        .monetize-hero-card.hof:hover { border-color: #a855f7; box-shadow: 0 25px 60px rgba(168, 85, 247, 0.3); transform: translateY(-8px); }
        .monetize-hero-card.partners { border-top: 4px solid #eab308; }
        .monetize-hero-card.partners:hover { border-color: #eab308; box-shadow: 0 25px 60px rgba(234, 179, 8, 0.3); transform: translateY(-8px); }

        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: scale(1.05); }

        .seo-link-pill {
            display: inline-block; padding: 8px 16px; margin: 0 10px 10px 0;
            background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px; color: #9ca3af; font-size: 13px; text-decoration: none;
            transition: 0.2s ease;
        }
        .seo-link-pill:hover { background: rgba(102, 252, 241, 0.1); border-color: #66fcf1; color: #fff; }

        .seo-hard-text-block {
            max-width: 1200px; margin: 0 auto; padding: 40px; 
            background: rgba(15, 17, 21, 0.8); border-radius: 24px; 
            border: 1px solid rgba(102, 252, 241, 0.15); color: #9ca3af; 
            line-height: 1.8; font-size: 16px; backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .seo-hard-text-block h2 { color: #fff; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 900; }
        .seo-hard-text-block h3 { color: #fff; font-size: 18px; margin-top: 30px; margin-bottom: 15px; font-weight: bold; }
        .seo-hard-text-block ul { list-style-type: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
        .seo-hard-text-block li { margin-bottom: 10px; padding-left: 20px; position: relative; }
        .seo-hard-text-block li::before { content: '→'; color: #66fcf1; position: absolute; left: 0; top: 0; font-weight: bold; }
        .seo-hard-text-block a { color: #66fcf1; text-decoration: none; font-weight: bold; transition: 0.2s; border-bottom: 1px solid rgba(102, 252, 241, 0.3); padding-bottom: 1px; }
        .seo-hard-text-block a:hover { color: #fff; border-bottom-color: #fff; }

        /* 🔥 GURU PARTNER CTA BUTTON */
        .guru-partner-button {
          background: linear-gradient(90deg, rgba(168, 85, 247, 0.15) 0%, rgba(102, 252, 241, 0.15) 100%);
          border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px; padding: 25px 35px;
          display: flex; align-items: center; justify-content: space-between;
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer;
          box-shadow: 0 15px 35px rgba(0,0,0,0.4); text-decoration: none; margin-bottom: 60px;
        }
        .guru-partner-button:hover { transform: scale(1.02); border-color: #a855f7; background: rgba(168, 85, 247, 0.25); }
        .partner-btn-text { font-size: clamp(14px, 2vw, 17px); font-weight: 950; color: #fff; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; }

        @media (max-width: 768px) {
          .guru-hero-section { padding: 40px 20px; text-align: center; justify-content: center; margin-bottom: 20px; }
          .social-btn-main { width: 100%; }
          .guru-partner-button { padding: 20px; }
        }
      `}} />

      {/* --- 🚀 HERO SEKCE S HEUREKA TLAČÍTKY NA OČÍCH --- */}
      <header className="guru-hero-section" style={{ marginTop: '40px' }}>
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} />
              <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>
                {isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'Vaše technologická základna'}
              </span>
            </div>
            
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1', textShadow: '0 0 20px rgba(102, 252, 241, 0.3)' }}>
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
              
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="social-btn-main fpscalc">
                <Gamepad2 size={18}/> {isEn ? 'CAN I RUN IT?' : 'ROZJEDU TO?'}
              </a>

              <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="social-btn-main bottleneck">
                <Layers size={18}/> {isEn ? 'BOTTLENECK' : 'BOTTLENECK'}
              </a>

              <a href={isEn ? "/en/poradna" : "/poradna"} className="social-btn-main poradna">
                <MessageSquare size={18}/> {isEn ? 'V.I.P HELP DESK' : 'V.I.P PORADNA'}
              </a>

              <a href={isEn ? "/en/deals" : "/cs/deals"} className="social-btn-main deals"><Flame size={18}/> {isEn ? 'GAME DEALS' : 'SLEVY NA HRY'}</a>
              <a href={isEn ? "/en/support" : "/support"} className="social-btn-main support"><Heart size={18}/> {isEn ? 'SUPPORT' : 'PODPOŘIT GURU'}</a>
            </div>
        </div>
        
        {/* TADY JE TEN BOX MÍSTO HG LOGA - 100% PŘIPRAVENO VYDĚLÁVAT HNED NA OČÍCH */}
        <div style={{ flexShrink: 0, width: '100%', maxWidth: '420px', zIndex: 10, alignSelf: 'center' }}>
            <HeurekaButtons isEn={isEn} />
        </div>
      </header>

      {/* --- 🚀 NOVÉ DLOUHÉ PARTNER TLAČÍTKO (CTR OPTIMIZED) --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <a href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-partner-button">
          <div className="partner-btn-text">
            <Award color="#a855f7" size={32} />
            <span>
              {isEn 
                ? "OUR PARTNERS: Support Hardware Guru by shopping through our verified links" 
                : "naši partneri: nákupem přes tyto odkazy podpoříte provoz webu Hardware Guru"}
            </span>
          </div>
          <ChevronRight size={32} color="#a855f7" />
        </a>
      </section>

      {/* --- HARD TEXT BLOCK PŘESUNUTÝ NAHORU + VÍCE STATICKÝCH ODKAZŮ PROTI PRÁZDNÉ DOMÉNĚ --- */}
      <section className="seo-hard-text-block" style={{ marginBottom: '60px' }}>
        {isEn ? (
          <>
            <h2>Hardware Guru – CPU, GPU comparison and FPS calculator</h2>
            <p>
              Welcome to The Hardware Guru, a leading tech portal focused on detailed <a href="/en/gpuvs">graphics card (GPU) comparisons</a> and <a href="/en/cpuvs">processor (CPU) comparisons</a>. Whether you are building a new gaming PC or planning an upgrade, our tools will help you make the right decision.
            </p>
            <p>
              Try our unique <a href="/en/fps-calculator">FPS calculator</a> to find out how the latest games will run, or test your rig with our <a href="/en/bottleneck-calculator">Bottleneck calculator</a> to eliminate any weak points in your PC. We also provide daily <a href="/en/clanky">technology news</a>, reviews, and performance optimization tips. For inspiration, check out our <a href="/en/sestavy">recommended PC builds</a>.
            </p>
            <h3>🔥 Essential Hardware Guides:</h3>
            <ul>
              <li><a href="/en/gpu-index">Katalog Grafických Karet a Index Výkonu</a></li>
              <li><a href="/en/cpu-index">Katalog Procesorů a Index Výkonu</a></li>
              <li><a href="/en/bottleneck-calculator">Bottleneck Calculator (Find your PC limits)</a></li>
              <li><a href="/en/fps-calculator">FPS Calculator (Can I run it?)</a></li>
              <li><a href="/en/sestavy">Best PC Builds for Gaming (Updated)</a></li>
              <li><a href="/en/slovnik">Tech Dictionary (Hardware terms explained)</a></li>
            </ul>
          </>
        ) : (
          <>
            <h2>Hardware Guru – CPU, GPU srovnání a FPS kalkulačka</h2>
            <p>
              Vítejte na The Hardware Guru, předním českém portálu zaměřeném na detailní <a href="/gpuvs">srovnání grafických karet (GPU)</a> a <a href="/cpuvs">procesorů (CPU)</a>. Ať už skládáte nový herní počítač, nebo plánujete upgrade, naše nástroje vám pomohou udělat to správné rozhodnutí.
            </p>
            <p>
              Vyzkoušejte naši unikátní <a href="/fps-kalkulacka">FPS kalkulačku</a> pro zjištění, jak vám poběží nejnovější hry, nebo otestujte svou sestavu přes náš <a href="/bottleneck-kalkulátor">Bottleneck kalkulátor</a>, abyste eliminovali slabá místa vašeho PC. Nechybí ani denně aktualizované <a href="/clanky">technologické novinky</a>, recenze a tipy pro optimalizaci výkonu. Pro inspiraci si prohlédněte naše <a href="/sestavy">doporučené PC sestavy</a>.
            </p>
            <h3>🔥 Nejdůležitější hardwarové průvodce a nástroje:</h3>
            <ul>
              <li><a href="/gpu-index">Katalog Grafických Karet a Index Výkonu</a></li>
              <li><a href="/cpu-index">Katalog Procesorů a Index Výkonu</a></li>
              <li><a href="/bottleneck-kalkulacka">Výpočet Bottlenecku (Kalkulačka úzkého hrdla)</a></li>
              <li><a href="/fps-kalkulacka">FPS Kalkulačka (Otestuj si výkon PC)</a></li>
              <li><a href="/sestavy">Doporučené herní PC sestavy (Aktualizováno)</a></li>
              <li><a href="/slovnik">Slovník pojmů (Vysvětlení hardwarových výrazů)</a></li>
            </ul>
          </>
        )}
      </section>

      {/* --- SEO: CATEGORY HUB --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
          <a href={isEn ? "/en/clanky" : "/clanky"} className="seo-link-pill"><Compass size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {isEn ? 'Hardware News' : 'HW Novinky'}</a>
          <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="seo-link-pill"><Layers size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {isEn ? 'GPU Catalog' : 'Katalog Grafických Karet a Index Výkonu'}</a>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="seo-link-pill"><Cpu size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {isEn ? 'CPU Catalog' : 'Katalog Procesorů a Index Výkonu'}</a>
          <a href={isEn ? "/en/slovnik" : "/slovnik"} className="seo-link-pill"><MessageSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {isEn ? 'Tech Dictionary' : 'HW Slovník Pojmů'}</a>
          <a href={isEn ? "/en/sestavy" : "/sestavy"} className="seo-link-pill"><Gamepad2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {isEn ? 'PC Builds' : 'Doporučené PC Sestavy'}</a>
        </div>
      </section>

      {/* --- SDÍLET & ODEBÍRAT LIŠTA --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Award size={32} color="#a855f7" />
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '950', margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>{isEn ? 'SHARE & SUBSCRIBE' : 'SDÍLET & ODEBÍRAT'}</h3>
              <p style={{ margin: '5px 0 0 0', color: '#a855f7', fontSize: '13px', fontWeight: 'bold' }}>{isEn ? 'Help other geeks find the truth' : 'Pomoz ostatním geekům najít pravdu'}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button id="guru-os-btn" title={isEn ? "Subscribe to notifications" : "Odebírat upozornění webu"} className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', border: 'none', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)', textDecoration: 'none' }}>
              <Bell size={20} fill="#fff" />
            </button>
            <Script id="onesignal-init" strategy="lazyOnload">
              {`
                if (typeof window !== 'undefined') {
                  var checkBtn = setInterval(function() {
                    var btn = document.getElementById('guru-os-btn');
                    if (btn && !btn.hasAttribute('data-bound')) {
                      btn.setAttribute('data-bound', 'true');
                      btn.onclick = function(e) {
                        e.preventDefault();
                        if (window.OneSignal) {
                          if (window.OneSignal.Slidedown && window.OneSignal.Slidedown.promptPush) {
                            window.OneSignal.Slidedown.promptPush(); 
                          } else if (window.OneSignal.showSlidedownPrompt) {
                            window.OneSignal.showSlidedownPrompt(); 
                          } else if (window.OneSignal.push) {
                            window.OneSignal.push(function() { window.OneSignal.showSlidedownPrompt(); }); 
                          }
                        }
                      };
                      clearInterval(checkBtn);
                    }
                  }, 500);
                }
              `}
            </Script>

            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" title={isEn ? "Join our Discord" : "Připojit se na Discord"} className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', border: 'none', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(217, 119, 6, 0.4)', textDecoration: 'none' }}><Bookmark size={20} fill="#fff" /></a>
            
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }}></div>
            
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://thehardwareguru.cz" target="_blank" rel="noreferrer" title={isEn ? "Share on Facebook" : "Sdílet na Facebooku"} className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', border: 'none', background: '#9333ea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)', textDecoration: 'none' }}><Share2 size={20} /></a>
            <a href="https://twitter.com/intent/tweet?url=https://thehardwareguru.cz&text=Mrkni%20na%20Hardware%20Guru!%20Nejlep%C5%A1%C3%AD%20tech%20web." target="_blank" rel="noreferrer" title={isEn ? "Share on X" : "Sdílet na X"} className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', border: 'none', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.150h-1.91z"/></svg>
            </a>
            <a href="https://www.reddit.com/submit?url=https://thehardwareguru.cz&title=The%20Hardware%20Guru%20-%20Tech%20Web" target="_blank" rel="noreferrer" title={isEn ? "Share on Reddit" : "Sdílet na Redditu"} className="hover-scale" style={{ width: '48px', height: '48px', borderRadius: '16px', border: 'none', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(234, 88, 12, 0.4)', textDecoration: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.505 1.12-.823 2.686-1.373 4.417-1.469l.865-4.053c.036-.164.19-.283.359-.283h.032l2.914.613a1.256 1.256 0 0 1 1.434-1.315zm-9.043 8.354a1.26 1.26 0 0 0-1.26 1.26c0 .695.564 1.26 1.26 1.26.695 0 1.26-.565 1.26-1.26a1.26 1.26 0 0 0-1.26-1.26zm8.066 0a1.26 1.26 0 0 0-1.26 1.26c0 .695.564 1.26 1.26 1.26.695 0 1.26-.565 1.26-1.26a1.26 1.26 0 0 0-1.26-1.26zm-4.032 4.148c-1.503 0-2.698-.387-2.836-.431a.333.333 0 0 0-.197.636c.036.012 1.348.462 3.033.462 1.684 0 2.996-.45 3.032-.462a.333.333 0 0 0-.197-.636c-.138.044-1.333.431-2.835.431z"/></svg>
            </a>
          </div>
      </section>

      {/* --- SEO: STABILNÍ RANDOM LINK BLOCK (Crawler Magnet) --- */}
      {randomPosts.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '30px 20px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(102, 252, 241, 0.1)', borderRadius: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            <Shuffle size={16} /> {isEn ? 'DISCOVER MORE CONTENT' : 'OBJEVTE DALŠÍ OBSAH'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {randomPosts.map((post, idx) => (
              <a key={`rand-${idx}`} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} className="seo-link-pill">
                {isEn ? (post.title_en || post.title) : post.title}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* --- MONETIZACE --- */}
      {data.darci.length > 0 && data.partneri.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '60px' }}>
            <a href={isEn ? "/en/sin-slavy" : "/sin-slavy"} className="monetize-hero-card hof" style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <Trophy size={40} color="#a855f7" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))' }} />
              </div>
              <h2 className="monetize-title">{isEn ? 'HALL OF FAME' : 'SÍŇ SLÁVY'}</h2>
              <p style={{ fontSize: '15px', color: '#9ca3af', maxWidth: '85%', margin: '0 auto', lineHeight: '1.5', fontWeight: 'bold' }}>
                  {data.darci.slice(0, 5).map(d => d.name).join(', ')}...
              </p>
            </a>
            <a href={isEn ? "/en/partneri" : "/partneri"} className="monetize-hero-card partners" style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <Rocket size={40} color="#eab308" style={{ filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.6))' }} />
              </div>
              <h2 className="monetize-title">{isEn ? 'GURU PARTNERS' : 'NAŠI PARTNEŘI'}</h2>
              <p style={{ fontSize: '15px', color: '#9ca3af', maxWidth: '85%', margin: '0 auto', lineHeight: '1.5', fontWeight: 'bold' }}>
                  {data.partneri.slice(0, 3).map(p => p.name).join(' • ')}
              </p>
              <div style={{ marginTop: '25px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '10px 20px', borderRadius: '12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', border: '1px solid rgba(234, 179, 8, 0.3)', transition: '0.3s' }}>
                {isEn ? 'VIEW BENEFITS' : 'ZOBRAZIT VÝHODY'} <ChevronRight size={16} />
              </div>
            </a>
        </section>
      )}

      {/* --- SLEVY --- */}
      {data.featuredDeals.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px', borderColor: 'rgba(234, 115, 22, 0.3)', borderLeft: '4px solid #f97316' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Flame color="#f97316" fill="#f97316" /> {isEn ? 'GURU HOT DEALS' : 'GURU ŽHAVÉ SLEVY'}
                  </h2>
                  <a href={isEn ? "/en/deals" : "/cs/deals"} style={{ color: '#f97316', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase', fontSize: '14px' }}>
                    {isEn ? 'ALL DEALS →' : 'VŠECHNY SLEVY →'}
                  </a>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {data.featuredDeals.map(deal => (
                    <a key={deal.id} href={deal.affiliate_link} target="_blank" rel="nofollow sponsored" className="deal-hp-card group">
                        <div style={{ position: 'relative', width: '100px', height: '60px', flexShrink: 0 }}>
                          <img src={deal.image_url} alt={`${deal.title} - ${isEn ? 'Game deal' : 'Sleva na hru'}`} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} loading="lazy" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '900', fontSize: '14px', color: '#fff', textTransform: 'uppercase', marginBottom: '2px', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{deal.title}</div>
                            <div style={{ color: '#f97316', fontWeight: '950', fontSize: '18px' }}>{isEn ? deal.price_en : deal.price_cs}</div>
                        </div>
                        <div style={{ background: '#f97316', color: '#fff', padding: '12px 18px', borderRadius: '14px', fontWeight: '950', fontSize: '12px', transition: '0.3s' }} className="group-hover:scale-105">{isEn ? 'BUY' : 'KOUPIT'}</div>
                    </a>
                ))}
            </div>
        </section>
      )}

      {/* --- GPU DUELY (Vizuální) --- */}
      {visualGpuDuels.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginBottom: '30px' }}>
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
                {visualGpuDuels.map(duel => (
                    <a key={duel.id} href={`/${isEn ? 'en/' : ''}gpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} style={{ textDecoration: 'none' }}>
                        <div className="duel-hp-card group">
                            <div style={{ background: '#ff0055', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0, boxShadow: '0 0 15px rgba(255,0,85,0.4)' }}>
                                <Swords size={24} color="#fff" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#ff0055', fontSize: '10px', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>{isEn ? 'HARDWARE BATTLE' : 'HARDWARE SOUBOJ'}</div>
                                <div style={{ fontWeight: '900', fontSize: '16px', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', lineHeight: '1.2' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</div>
                            </div>
                            <ChevronRight color="#ff0055" className="transition-transform group-hover:translate-x-2" />
                        </div>
                    </a>
                ))}
            </div>
        </section>
      )}

      {/* --- SEO: DEEP LINKS (GPU) --- */}
      {deepGpuDuels.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginRight: '10px', display: 'flex', alignItems: 'center' }}><Link2 size={12} style={{marginRight:'5px'}}/> {isEn ? 'TRENDING COMPARISONS:' : 'HLEDANÁ SROVNÁNÍ:'}</span>
            {deepGpuDuels.map(duel => (
              <a key={duel.id} href={`/${isEn ? 'en/' : ''}gpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} className="seo-link-pill" style={{ margin: '0 5px 5px 0', padding: '4px 10px', fontSize: '11px', borderRadius: '8px' }}>
                {isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* --- CPU DUELY (Vizuální) --- */}
      {visualCpuDuels.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginBottom: '30px' }}>
            <div className="section-title-wrapper" style={{ marginBottom: '30px', borderColor: 'rgba(102, 252, 241, 0.3)', borderLeft: '4px solid #66fcf1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Cpu color="#66fcf1" /> {isEn ? 'LATEST CPU BATTLES' : 'NEJNOVĚJŠÍ CPU DUELY'}
                  </h2>
                  <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ color: '#66fcf1', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase', fontSize: '14px' }}>
                    {isEn ? 'CPU ENGINE →' : 'CPU ENGINE →'}
                  </a>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {visualCpuDuels.map(duel => (
                    <a key={duel.id} href={`/${isEn ? 'en/' : ''}cpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} style={{ textDecoration: 'none' }}>
                        <div className="cpu-duel-hp-card group">
                            <div style={{ background: '#66fcf1', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0, boxShadow: '0 0 15px rgba(102,252,241,0.4)' }}>
                                <Cpu size={24} color="#000" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#66fcf1', fontSize: '10px', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>{isEn ? 'PROCESSOR BATTLE' : 'SOUBOJ PROCESORŮ'}</div>
                                <div style={{ fontWeight: '900', fontSize: '16px', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', lineHeight: '1.2' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</div>
                            </div>
                            <ChevronRight color="#66fcf1" className="transition-transform group-hover:translate-x-2" />
                        </div>
                    </a>
                ))}
            </div>
        </section>
      )}

      {/* --- SEO: DEEP LINKS (CPU) --- */}
      {deepCpuDuels.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginRight: '10px', display: 'flex', alignItems: 'center' }}><Link2 size={12} style={{marginRight:'5px'}}/> {isEn ? 'DEEP CPU LINKS:' : 'CPU SROVNÁNÍ:'}</span>
            {deepCpuDuels.map(duel => (
              <a key={duel.id} href={`/${isEn ? 'en/' : ''}cpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} className="seo-link-pill" style={{ margin: '0 5px 5px 0', padding: '4px 10px', fontSize: '11px', borderRadius: '8px' }}>
                {isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* OČEKÁVANÉ HRY */}
      {data.expectedGames.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginBottom: '60px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {data.expectedGames.map((game) => {
               const displayTitle = (isEn && game.title_en) ? game.title_en : game.title;
               const displaySlug = (isEn && game.slug_en) ? game.slug_en : game.slug;
               const hasVideo = game.trailer || (game.video_id && game.video_id.length > 5);

               return (
                 <a href={isEn ? `/en/ocekavane-hry/${displaySlug}` : `/ocekavane-hry/${displaySlug}`} key={game.id} className="expected-card" style={{ textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', height: '220px', width: '100%', background: '#0b0c10' }}>
                       {hasVideo && <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#ff0055', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px' }}><Play size={10} fill="#fff"/> VIDEO</div>}
                       {game.release_date && (
                         <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: '#eab308', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', zIndex: 10, display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                           <Clock size={12} /> {new Date(game.release_date).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                         </div>
                       )}
                       <img src={getThumbnail(game, supabaseUrl)} alt={`${displayTitle} - ${isEn ? 'Hardware Guru game review' : 'Hardware Guru recenze hry'}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} loading="lazy" />
                    </div>
                    <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ color: '#66fcf1', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', marginBottom: '10px' }}>{isEn ? 'TECH PREVIEW' : 'TECHNICKÝ ROZBOR'}</span>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2', marginBottom: '15px' }}>{displayTitle}</h3>
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
      {data.nejnovejsiTipy.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
          <div className="section-title-wrapper" style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS' : 'TIPY & TRIKY'}</span></h2>
              <a href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'ARCHIVE →' : 'ARCHIV TIPŮ →'}</a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {data.nejnovejsiTipy.map((tip, idx) => (
              <a href={isEn ? `/en/tipy/${tip.slug_en || tip.slug}` : `/tipy/${tip.slug}`} key={tip.id} className="tip-card" style={{ textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '220px', width: '100%', background: '#0b0c10' }}>
                  {idx === 0 && <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#a855f7', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '10px', zIndex: 10 }}>{isEn ? 'NEW 🔥' : 'NOVINKA 🔥'}</div>}
                  <img src={getSafeImage(tip.image_url)} alt={`${tip.title} - ${isEn ? 'Hardware PC tips' : 'Hardware PC tipy'}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '25px' }}>
                  <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold' }}>{isEn ? (tip.category_en || 'HARDWARE') : tip.category}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2' }}>{isEn ? (tip.title_en || tip.title) : tip.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' }}>{isEn ? (tip.description_en || tip.description) : tip.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* TWEAKY */}
      {data.nejnovejsiTweaky.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginTop: '40px' }}>
          <div className="section-title-wrapper" style={{ marginBottom: '30px', borderColor: 'rgba(234, 179, 8, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff' }}>{isEn ? 'LATEST' : 'POSLEDNÍ'} <span style={{ color: '#eab308' }}>GURU TWEAKY</span></h2>
              <a href={isEn ? "/en/tweaky" : "/tweaky"} style={{ color: '#eab308', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'ALL →' : 'VŠECHNY TWEAKY →'}</a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {data.nejnovejsiTweaky.map((tweak) => (
              <a href={isEn ? `/en/tweaky/${tweak.slug_en || tweak.slug}` : `/tweaky/${tweak.slug}`} key={tweak.id} className="tweak-card" style={{ textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '180px', width: '100%', background: '#0b0c10' }}>
                  <img src={getSafeImage(tweak.image_url)} alt={`${tweak.title} - ${isEn ? 'PC optimization tweak' : 'PC optimalizace tweak'}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}><Activity size={14} /> {isEn ? 'OPTIMIZATION' : 'OPTIMALIZACE'}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2' }}>{isEn ? (tweak.title_en || tweak.title) : tweak.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' }}>{isEn ? (tweak.description_en || tweak.description) : tweak.description}</p>
                  <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px', marginTop: '15px' }}>{isEn ? 'OPEN GURU FIX →' : 'OTEVŘÍT GURU FIX →'}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ČLÁNKY (Content Grid) */}
      {latestPosts.length > 0 && (
        <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginTop: '80px' }}>
          <div className="section-title-wrapper" style={{ marginBottom: '40px', borderColor: 'rgba(102, 252, 241, 0.2)', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
                {isEn ? 'Latest Articles & Videos' : 'Nejnovější články & Videa'}
              </h2>
              <a href={isEn ? "/en/clanky" : "/clanky"} style={{ color: '#66fcf1', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase', fontSize: '14px' }}>
                {isEn ? 'ALL ARTICLES →' : 'VŠECHNY ČLÁNKY →'}
              </a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {latestPosts.map((post, idx) => {
              const badge = getBadgeInfo(post, isEn);
              const getPostHref = (p) => {
                const s = isEn ? (p.slug_en || p.slug) : p.slug;
                if (s.startsWith('../../')) return isEn ? `/en/${s.replace('../../', '')}` : `/${s.replace('../../', '')}`;
                return isEn ? `/en/clanky/${s}` : `/clanky/${s}`;
              };
              return (
                <a key={post.id} href={getPostHref(post)} style={{ textDecoration: 'none' }}>
                  <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#0b0c10' }}>
                      <img src={getThumbnail(post, supabaseUrl)} alt={`${post.title}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading={idx < 3 ? "eager" : "lazy"} />
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
        </main>
      )}

      <footer style={{ background: '#050505', padding: '40px 20px', borderTop: '1px solid rgba(102, 252, 241, 0.2)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#6b7280' }}>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? "GPU Database and Performance Index" : "Katalog Grafických Karet a Index Výkonu"}</a>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? "CPU Database and Performance Index" : "Katalog Procesorů a Index Výkonu"}</a>
            <a href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? "HW Glossary" : "HW Slovník"}</a>
            <a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? "Expected Games" : "Očekávané Hry"}</a>
            <a href={isEn ? "/en/deals" : "/deals"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? "Deals" : "Slevy"}</a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ color: '#6b7280', textDecoration: 'none' }}>{isEn ? "Bottleneck Calculator" : "Bottleneck Kalkulačka"}</a>
        </div>
        <div style={{ marginTop: '20px', color: '#4b5563', fontSize: '11px' }}>
          &copy; {new Date().getFullYear()} The Hardware Guru. {isEn ? "All rights reserved." : "Všechna práva vyhrazena."}
        </div>
      </footer>
      
    </div>
  );
}
