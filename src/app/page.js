import React from 'react';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords, Cpu } from 'lucide-react';

/**
 * GURU HOMEPAGE V15.4 - FULL SSR & GOLDEN RICH RESULTS FIX
 * Cesta: src/app/page.js
 * 🛡️ FIX 1: Komponenta next/image odstraněna kvůli chybám při kompilaci v aktuálním prostředí.
 * 🛡️ FIX 2: Změněno z "use client" na asynchronní Server Component pro 100% SEO indexaci Googlem.
 * 🛡️ FIX 3: Odstraněno serverové volání increment_total_visits (zamezení nafukování statistik z crawlerů).
 * 🛡️ FIX 4: Opraven format WebSite (EntryPoint) a přidáno masivní FAQ schema pro Brand SEO.
 */

const LEAK_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';

// --- POMOCNÉ FUNKCE PRO SSR ---
const getSafeImage = (url) => {
  if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
  return url;
};

// Získává supabaseUrl jako argument, protože už nejsme v client scope
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

// 🚀 GURU: SERVER COMPONENT HOMEPAGE
export default async function HomePage({ params }) {
  // Detekce jazyka na serveru přes parametry URL
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  
  // Zabezpečený přístup k proměnným prostředí na serveru
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const getHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  // Nativní server-side fetch s revalidací každých 60 vteřin (kompromis mezi rychlostí a čerstvými daty)
  const fetchOpts = { headers: getHeaders, next: { revalidate: 60 } };

  let p = [], s = [], t = [], tw = [], d = [], pa = [], exp = [], feat = [], duelsRes = [], cpuDuelsRes = [];

  try {
    // Paralelní Server-Side načtení všech dat (odstraněn rpc increment_total_visits pro ochranu statistik)
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
  } catch (err) {
    console.error("Data load fail:", err);
  }

  // Příprava datových objektů pro šablony
  const data = { 
    posts: Array.isArray(p) ? p : [], 
    stats: (Array.isArray(s) && s.length > 0) ? s[0] : { value: 0 }, 
    nejnovejsiTipy: Array.isArray(t) ? t : [],
    nejnovejsiTweaky: Array.isArray(tw) ? tw : [],
    darci: Array.isArray(d) ? d : [],
    partneri: Array.isArray(pa) ? pa : [],
    expectedGames: Array.isArray(exp) ? exp : [],
    featuredDeals: Array.isArray(feat) ? feat : [],
    latestDuels: Array.isArray(duelsRes) ? duelsRes : [],
    latestCpuDuels: Array.isArray(cpuDuelsRes) ? cpuDuelsRes : []
  };

  // 🚀 ZLATÁ GSC SEO SCHÉMATA PRO HOMEPAGE (GOLDEN RICH RESULTS FIX)
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
    "sameAs": [
      "https://kick.com/thehardwareguru"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? "What is The Hardware Guru?" : "Co je to The Hardware Guru?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isEn ? "The Hardware Guru is an official technology base and database for gamers. We provide detailed CPU and GPU benchmarks, bottleneck analysis, and hardware reviews." : "The Hardware Guru je technologická základna a databáze pro hráče. Poskytujeme detailní benchmarky procesorů a grafických karet, analýzu bottlenecku a hardwarové recenze."
        }
      },
      {
        "@type": "Question",
        "name": isEn ? "How does the Bottleneck Calculator work?" : "Jak funguje kalkulačka bottlenecku?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isEn ? "Our engine compares raw hardware performance indexes and real-world gaming data to determine if your CPU is holding back your GPU (or vice versa) in specific resolutions." : "Náš engine porovnává indexy hrubého výkonu a reálná herní data, aby určil, zda váš procesor brzdí grafickou kartu (nebo naopak) v konkrétním rozlišení."
        }
      }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />

      <style>{`
        /* --- GURU GLOBÁLNÍ STYLY A KARTY --- */
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        
        .expected-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .expected-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.25); border-color: #66fcf1; }

        /* 🔥 GURU HERO SEKCE 🔥 */
        .guru-hero-section {
            max-width: 1200px; margin: 40px auto; padding: 60px 50px;
            background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%);
            border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2);
            display: flex; align-items: center; gap: 50px; flex-wrap: wrap;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(102, 252, 241, 0.05);
            position: relative; overflow: hidden; backdrop-filter: blur(15px);
        }
        .guru-hero-section::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, #66fcf1, #a855f7, #ff0055, #f97316);
        }

        .guru-hero-avatar {
            width: 180px; height: 180px; background: linear-gradient(135deg, #0b0c10 0%, #1a1c23 100%);
            border-radius: 50%; border: 4px solid #66fcf1; display: flex; align-items: center; justify-content: center;
            color: #66fcf1; font-size: 4rem; font-weight: 950; flex-shrink: 0;
            box-shadow: 0 0 40px rgba(102, 252, 241, 0.4), inset 0 0 20px rgba(102, 252, 241, 0.2);
            text-shadow: 0 0 20px rgba(102, 252, 241, 0.6);
        }

        /* Tlačítka v Hero */
        .social-btn-main {
            padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid transparent; cursor: pointer; letter-spacing: 1px;
        }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn-main.live:hover { background: #53fc18; color: #000; box-shadow: 0 10px 25px rgba(83, 252, 24, 0.4); transform: translateY(-3px); }

        .social-btn-main.duels { background: rgba(255, 0, 85, 0.1); color: #ff0055; border-color: rgba(255, 0, 85, 0.3); }
        .social-btn-main.duels:hover { background: #ff0055; color: #fff; box-shadow: 0 10px 25px rgba(255, 0, 85, 0.4); transform: translateY(-3px); }

        .social-btn-main.deals { background: rgba(249, 115, 22, 0.1); color: #f97316; border-color: rgba(249, 115, 22, 0.3); }
        .social-btn-main.deals:hover { background: #f97316; color: #fff; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.4); transform: translateY(-3px); }

        .social-btn-main.support { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3); }
        .social-btn-main.support:hover { background: #eab308; color: #000; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.4); transform: translateY(-3px); }

        /* Karty Slev a Duelů */
        .deal-hp-card { 
          display: flex; align-items: center; gap: 20px; 
          background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(249, 115, 22, 0.05) 100%); 
          padding: 20px; border-radius: 24px; border: 1px solid rgba(249, 115, 22, 0.2); 
          transition: 0.4s; text-decoration: none; overflow: hidden; position: relative;
        }
        .deal-hp-card:hover { transform: translateY(-5px); border-color: #f97316; box-shadow: 0 15px 35px rgba(249, 115, 22, 0.25); }

        .duel-hp-card { 
          display: flex; align-items: center; gap: 20px; 
          background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(255, 0, 85, 0.05) 100%); 
          padding: 20px; border-radius: 24px; border: 1px solid rgba(255, 0, 85, 0.2); 
          transition: 0.4s; text-decoration: none; overflow: hidden; position: relative;
        }
        .duel-hp-card:hover { transform: translateY(-5px); border-color: #ff0055; box-shadow: 0 15px 35px rgba(255, 0, 85, 0.25); }

        /* 🚀 GURU: CSS pro CPU Duely */
        .cpu-duel-hp-card { 
          display: flex; align-items: center; gap: 20px; 
          background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(102, 252, 241, 0.05) 100%); 
          padding: 20px; border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.2); 
          transition: 0.4s; text-decoration: none; overflow: hidden; position: relative;
        }
        .cpu-duel-hp-card:hover { transform: translateY(-5px); border-color: #66fcf1; box-shadow: 0 15px 35px rgba(102, 252, 241, 0.25); }

        .tip-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tip-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); border-color: #a855f7; }
        .tweak-card { transition: all 0.3s ease; border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tweak-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(234, 179, 8, 0.3); border-color: #eab308; }
        
        .section-title-wrapper { background: rgba(0,0,0,0.7); padding: 18px 35px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(234, 179, 8, 0.2); display: inline-block; }
        
        /* 🚀 GURU MONETIZATION REDESIGN 🚀 */
        .monetize-hero-card {
            background: linear-gradient(145deg, rgba(15, 17, 21, 0.95) 0%, rgba(10, 11, 13, 0.98) 100%);
            border: 1px solid rgba(255,255,255,0.05); 
            border-radius: 30px; padding: 40px 30px;
            text-decoration: none; color: #fff; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6); position: relative; overflow: hidden; backdrop-filter: blur(20px);
        }
        .monetize-hero-card.hof { border-top: 4px solid #a855f7; }
        .monetize-hero-card.hof:hover { border-color: #a855f7; box-shadow: 0 25px 60px rgba(168, 85, 247, 0.3); transform: translateY(-8px); background: linear-gradient(145deg, rgba(20, 15, 30, 0.95) 0%, rgba(10, 11, 13, 0.98) 100%); }
        
        .monetize-hero-card.partners { border-top: 4px solid #eab308; }
        .monetize-hero-card.partners:hover { border-color: #eab308; box-shadow: 0 25px 60px rgba(234, 179, 8, 0.3); transform: translateY(-8px); background: linear-gradient(145deg, rgba(30, 25, 10, 0.95) 0%, rgba(10, 11, 13, 0.98) 100%); }

        .monetize-title { font-size: 26px; font-weight: 950; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 2px; font-style: italic; }
        .hof .monetize-title { color: #a855f7; text-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
        .partners .monetize-title { color: #eab308; text-shadow: 0 0 15px rgba(234, 179, 8, 0.4); }

        @media (max-width: 768px) {
          .guru-hero-section { padding: 40px 20px; text-align: center; justify-content: center; }
          .guru-hero-avatar { margin: 0 auto 30px; }
        }
      `}</style>

      {/* --- 🚀 PŘEDĚLANÁ HERO SEKCE --- */}
      <header className="guru-hero-section">
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} />
              <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>
                {isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'Vaše technologická základna'}
              </span>
            </div>
            
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1', textShadow: '0 0 20px rgba(102, 252, 241, 0.3)' }}>
              {isEn ? <>BUILDING THE <span style={{ color: '#66fcf1' }}>IDEAL PLACE</span> <br/> FOR GAMERS & GEEKS</> 
                     : <>Budujeme <span style={{ color: '#66fcf1' }}>Ideální Místo</span> <br/> pro Hráče a Geeky</>}
            </h1>
            
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#9ca3af', marginBottom: '40px', maxWidth: '700px' }}>
              {isEn ? "Hardware expert with 20 years of experience. Mission: eradicate lag, optimize FPS, and build a place where every geek feels at home." 
                     : "S 20 lety praxe v servisu hardware vím, kde každá mašina tlačí. Moje mise je jasná: vymýtit lagy, zkrotit FPS a vytvořit web, kde se každý geek cítí jako doma."}
            </p>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn-main live"><Activity size={18}/> {isEn ? 'LIVE' : 'SLEDOVAT LIVE'}</a>
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="social-btn-main duels"><Swords size={18}/> {isEn ? 'GPU BATTLES' : 'SOUBOJE GPU'}</a>
              <a href={isEn ? "/en/deals" : "/cs/deals"} className="social-btn-main deals"><Flame size={18}/> {isEn ? 'GAME DEALS' : 'SLEVY NA HRY'}</a>
              <a href={isEn ? "/en/support" : "/support"} className="social-btn-main support"><Heart size={18}/> {isEn ? 'SUPPORT' : 'PODPOŘIT GURU'}</a>
              
              <div style={{ background: '#fff', borderRadius: '14px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '50px', border: '1px solid #ddd' }}>
                <button swg-standard-button="contribution" style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
              </div>
            </div>
        </div>
        <div className="guru-hero-avatar">HG</div>
      </header>

      {/* --- 🚀 MONETIZACE: GURU STYLE REDESIGN --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '-30px', marginBottom: '60px' }}>
          <a href={isEn ? "/en/sin-slavy" : "/sin-slavy"} className="monetize-hero-card hof" style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <Trophy size={40} color="#a855f7" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))' }} />
            </div>
            <h2 className="monetize-title">
              {isEn ? 'HALL OF FAME' : 'SÍŇ SLÁVY'}
            </h2>
            <p style={{ fontSize: '15px', color: '#9ca3af', maxWidth: '85%', margin: '0 auto', lineHeight: '1.5', fontWeight: 'bold' }}>
                {data.darci.slice(0, 5).map(d => d.name).join(', ')}...
            </p>
          </a>
          <a href={isEn ? "/en/partneri" : "/partneri"} className="monetize-hero-card partners" style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <Rocket size={40} color="#eab308" style={{ filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.6))' }} />
            </div>
            <h2 className="monetize-title">
              {isEn ? 'GURU PARTNERS' : 'NAŠI PARTNEŘI'}
            </h2>
            <p style={{ fontSize: '15px', color: '#9ca3af', maxWidth: '85%', margin: '0 auto', lineHeight: '1.5', fontWeight: 'bold' }}>
                {data.partneri.slice(0, 3).map(p => p.name).join(' • ')}
            </p>
            <div style={{ marginTop: '25px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '10px 20px', borderRadius: '12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', border: '1px solid rgba(234, 179, 8, 0.3)', transition: '0.3s' }}>
              {isEn ? 'VIEW BENEFITS' : 'ZOBRAZIT VÝHODY'} <ChevronRight size={16} />
            </div>
          </a>
      </section>

      {/* --- 🚀 GURU ŽHAVÉ SLEVY --- */}
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
                          <img src={deal.image_url} alt={deal.title} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} loading="lazy" />
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

      {/* --- 🚀 GURU GPU DUELY --- */}
      {data.latestDuels.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginBottom: '60px' }}>
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
                        <div className="duel-hp-card group">
                            <div style={{ background: '#ff0055', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 15px rgba(255,0,85,0.4)' }}>
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

      {/* --- 🚀 GURU CPU DUELY --- */}
      {data.latestCpuDuels.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginBottom: '60px' }}>
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
                {data.latestCpuDuels.map(duel => (
                    <a key={duel.id} href={`/${isEn ? 'en/' : ''}cpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} style={{ textDecoration: 'none' }}>
                        <div className="cpu-duel-hp-card group">
                            <div style={{ background: '#66fcf1', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 15px rgba(102,252,241,0.4)' }}>
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
                       <img src={getThumbnail(game, supabaseUrl)} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} loading="lazy" />
                    </div>
                    <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ color: '#66fcf1', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', marginBottom: '10px' }}>
                        {isEn ? 'TECH PREVIEW' : 'TECHNICKÝ ROZBOR'}
                      </span>
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
                  <img src={getSafeImage(tip.image_url)} alt={tip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
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
                  <img src={getSafeImage(tweak.image_url)} alt={tweak.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                    <Activity size={14} /> {isEn ? 'OPTIMIZATION' : 'OPTIMALIZACE'}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2' }}>{isEn ? (tweak.title_en || tweak.title) : tweak.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' }}>{isEn ? (tweak.description_en || tweak.description) : tweak.description}</p>
                  <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px', marginTop: '15px' }}>{isEn ? 'OPEN GURU FIX →' : 'OTEVŘÍT GURU FIX →'}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ČLÁNKY */}
      {data.posts.length > 0 && (
        <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', marginTop: '80px' }}>
          <div className="section-title-wrapper" style={{ margin: '0 auto 40px', display: 'block', textAlign: 'center', maxWidth: 'fit-content' }}>
            <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{isEn ? 'Latest Articles & Videos' : 'Nejnovější články & Videa'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {data.posts.map((post, idx) => {
              const badge = getBadgeInfo(post, isEn);
              return (
                <a key={post.id} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#0b0c10' }}>
                      <img src={getThumbnail(post, supabaseUrl)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading={idx < 3 ? "eager" : "lazy"} />
                      
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

    </div>
  );
}
