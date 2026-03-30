import React from 'react';
import Script from 'next/script';
import Link from 'next/link'; // 🔥 FIX: Chybějící import Linku opraven
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords, Cpu, Gamepad2, Layers, MessageSquare, Award, Bell, Bookmark, Share2, Clock, Compass, Shuffle, Link2, Monitor, Smartphone, Tv } from 'lucide-react';
import SeznamAd from '../components/SeznamAd';

/**
 * GURU HOMEPAGE V19.1 - BUILD FIX & MONEY ANCHOR
 * 🚀 CÍL: Oprava Link erroru, integrace Sticky Anchoru, 100% zachování ranního vzhledu V18.6.
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
    posts: p && p.length > 0 ? p : STATIC_SNAPSHOT_POSTS, 
    stats: s?.[0] || { value: 0 }, 
    latestDuels: duelsRes && duelsRes.length > 0 ? duelsRes : STATIC_SNAPSHOT_GPU_DUELS,
    latestCpuDuels: cpuDuelsRes && cpuDuelsRes.length > 0 ? cpuDuelsRes : STATIC_SNAPSHOT_CPU_DUELS,
    expectedGames: exp || [], nejnovejsiTipy: t || [], nejnovejsiTweaky: tw || [], darci: d || [], partneri: pa || [], featuredDeals: feat || []
  };

  const latestPosts = data.posts.slice(0, 20);
  const randomPosts = data.posts.length > 20 ? data.posts.slice(20, 35) : data.posts;
  const visualGpuDuels = data.latestDuels.slice(0, 3);
  const deepGpuDuels = data.latestDuels.slice(3, 11);
  const visualCpuDuels = data.latestCpuDuels.slice(0, 3);
  const deepCpuDuels = data.latestCpuDuels.slice(3, 11);

  const baseUrl = "https://thehardwareguru.cz";
  const currentUrl = isEn ? `${baseUrl}/en` : baseUrl;

  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "name": "The Hardware Guru", "url": currentUrl };
  const organizationSchema = { "@context": "https://schema.org", "@type": "Organization", "name": "The Hardware Guru", "url": baseUrl, "logo": `${baseUrl}/logo.png` };
  const articleSchemas = latestPosts.slice(0, 3).map(post => ({ "@context": "https://schema.org", "@type": "Article", "headline": isEn ? (post.title_en || post.title) : post.title, "datePublished": post.created_at, "image": getThumbnail(post, supabaseUrl) }));
  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
      {articleSchemas.map((schema, i) => ( <script key={`article-schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(schema) }} /> ))}

      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .expected-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .guru-hero-section { max-width: 1200px; margin: 40px auto; padding: 60px 50px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%); border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2); display: flex; align-items: center; gap: 50px; flex-wrap: wrap; box-shadow: 0 30px 60px rgba(0,0,0,0.8); backdrop-filter: blur(15px); }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; border: 1px solid transparent; }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .deal-hp-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 20px; border-radius: 24px; border: 1px solid rgba(249, 115, 22, 0.2); text-decoration: none; }
        .duel-hp-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 20px; border-radius: 24px; border: 1px solid rgba(255, 0, 85, 0.2); text-decoration: none; }
        .cpu-duel-hp-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 20px; border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.2); text-decoration: none; }
        .monetize-hero-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 40px 30px; text-decoration: none; color: #fff; text-align: center; }
        .seo-link-pill { display: inline-block; padding: 8px 16px; margin: 0 10px 10px 0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; color: #9ca3af; font-size: 13px; text-decoration: none; }
        .seo-hard-text-block { max-width: 1200px; margin: 0 auto; padding: 40px; background: rgba(15, 17, 21, 0.8); border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.15); color: #9ca3af; line-height: 1.8; }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        /* 🔥 STICKY ANCHOR CSS */
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        @media (max-width: 768px) { .ad-desktop-wrapper { display: none; } .ad-mobile-wrapper { display: flex; justify-content: center; } }
      `}</style>

      {/* --- TOP AD (Z ranní verze) --- */}
      <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
        <div className="ad-mobile-wrapper" style={{ margin: '0 -20px' }}><SeznamAd zoneId={408651} width={300} height={250} /></div>
      </div>

      {/* --- 🚀 HERO SEKCE (Původní vzhled) --- */}
      <header className="guru-hero-section">
        <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} />
              <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>{isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'Vaše technologická základna'}</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1' }}>
              {isEn ? <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU COMPARISON</span>, FPS CALCULATOR & PC BUILDS</> : <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU SROVNÁNÍ</span>, FPS KALKULAČKA A PC SESTAVY</>}
            </h1>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#9ca3af', marginBottom: '40px', maxWidth: '700px' }}>
              {isEn ? "Hardware expert with 20 years of experience. Mission: eradicate lag, optimize FPS." : "S 20 lety praxe v servisu hardware vím, kde každá mašina tlačí. Moje mise je jasná: vymýtit lagy, zkrotit FPS a vytvořit web, kde se každý geek cítí jako doma."}
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn-main live"><Activity size={18}/> {isEn ? 'LIVE' : 'SLEDOVAT LIVE'}</a>
              <Link href="/gpuvs" className="social-btn-main" style={{color: '#ff0055', borderColor: '#ff005550'}}><Swords size={18}/> SOUBOJE GPU</Link>
              <Link href="/cpuvs" className="social-btn-main" style={{color: '#66fcf1', borderColor: '#66fcf150'}}><Cpu size={18}/> SOUBOJE CPU</Link>
              <Link href="/fps-kalkulacka" className="social-btn-main" style={{color: '#a855f7', borderColor: '#a855f750'}}><Gamepad2 size={18}/> ROZJEDU TO?</Link>
              <Link href="/bottleneck-kalkulacka" className="social-btn-main" style={{color: '#38bdf8', borderColor: '#38bdf850'}}><Layers size={18}/> BOTTLENECK</Link>
              <Link href="/support" className="social-btn-main" style={{color: '#eab308', borderColor: '#eab30850'}}><Heart size={18}/> PODPOŘIT GURU</Link>
            </div>
        </div>
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#66fcf1', fontSize: '4rem', fontWeight: '950' }}>HG</div>
      </header>

      {/* --- SEO TEXT BLOCK (Původní) --- */}
      <section className="seo-hard-text-block" style={{ marginBottom: '60px' }}>
        <h2>Hardware Guru – CPU, GPU srovnání a FPS kalkulačka</h2>
        <p>Vítejte na The Hardware Guru, předním českém portálu zaměřeném na hardware.</p>
        <ul>
          <li><a href="/gpu-index">Katalog Grafických Karet</a></li>
          <li><a href="/cpu-index">Katalog Procesorů</a></li>
          <li><a href="/sestavy">Doporučené herní PC sestavy</a></li>
        </ul>
      </section>

      {/* --- KATEGORIE HUB --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', textAlign: 'center' }}>
          <Link href="/clanky" className="seo-link-pill">HW Novinky</Link>
          <Link href="/gpu-index" className="seo-link-pill">GPU Katalog</Link>
          <Link href="/cpu-index" className="seo-link-pill">CPU Katalog</Link>
          <Link href="/slovnik" className="seo-link-pill">HW Slovník</Link>
          <Link href="/sestavy" className="seo-link-pill">PC Sestavy</Link>
      </section>

      {/* --- MONETIZACE A DUELY (Původní vizuál) --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px' }}>
        
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
                <Link key={duel.id} href={`/gpuvs/${duel.slug}`} className="duel-hp-card"><Swords size={24} color="#ff0055" /><div><div style={{ fontWeight: '900' }}>{duel.title_cs}</div></div></Link>
              ))}
            </div>
          </section>
        )}

        {/* ČLÁNKY GRID (Původní) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {latestPosts.slice(0, 9).map(post => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <img src={getThumbnail(post, supabaseUrl)} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}><h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{isEn ? post.title_en : post.title}</h3></div>
              </div>
            </Link>
          ))}
        </section>
      </main>

      {/* --- STICKY BOTTOM ANCHOR (Today's Change) --- */}
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
