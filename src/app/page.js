import React from 'react';
import Script from 'next/script';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, Play, Flame, ShoppingCart, Ghost, Swords, Cpu, Gamepad2, Layers, MessageSquare, Award, Bell, Bookmark, Share2, Clock, Compass, Shuffle, Link2 } from 'lucide-react';
import SeznamAd from '../components/SeznamAd';

/**
 * GURU HOMEPAGE V18.8 - FINAL ROUTE & LABEL FIX
 * Cesta: src/app/page.js
 * 🚀 CÍL: Fix cest na /gpu-db a /cpu-db + aplikace přesných názvů katalogů pro maximální SEO relevanci.
 */

// --- DYNAMICKÁ METADATA ---
export async function generateMetadata({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  const baseUrl = 'https://thehardwareguru.cz';

  const title = isEn ? 'Hardware Guru – CPU, GPU comparison, FPS calculator and PC Builds' : 'Hardware Guru – CPU, GPU srovnání, FPS kalkulačka a PC Sestavy';
  const description = isEn ? 'Your technology base for CPU, GPU comparison, bottleneck calculation, PC builds and latest HW news.' : 'Vaše technologická základna pro srovnání CPU, GPU, výpočet bottlenecku, PC sestavy a nejnovější HW novinky.';

  return {
    title, 
    description,
    robots: { index: true, follow: true, bingBot: { index: true, follow: true } },
    alternates: {
      canonical: isEn ? `${baseUrl}/en` : `${baseUrl}/`, 
      languages: { 'cs-CZ': `${baseUrl}/`, 'en-US': `${baseUrl}/en` }
    },
    openGraph: { title, description, url: isEn ? `${baseUrl}/en` : `${baseUrl}/`, siteName: 'The Hardware Guru', type: 'website' },
    twitter: { card: 'summary_large_image', title, description }
  };
}

const LEAK_PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';

const getThumbnail = (post, supabaseUrl) => {
  const typeStr = (post.type || '').toLowerCase().trim();
  if (typeStr.includes('leak')) return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png` : LEAK_PLACEHOLDER_URL;
  if (post.image_url) return post.image_url;
  if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000';
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
  { id: 'snap-1', title: 'Katalog Grafických Karet a Index Výkonu', title_en: 'GPU Database and Performance Index', slug: 'nejlepsi-graficke-karty-gpu-velky-test', slug_en: 'best-graphics-cards-gpu-mega-test', created_at: new Date().toISOString(), type: 'article' },
  { id: 'snap-2', title: 'Katalog Procesorů a Index Výkonu', title_en: 'CPU Database and Performance Index', slug: 'jak-vybrat-procesor-cpu', slug_en: 'how-to-choose-cpu', created_at: new Date().toISOString(), type: 'article' }
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
    posts: p?.length > 0 ? p : STATIC_SNAPSHOT_POSTS, 
    stats: s?.[0] || { value: 0 }, 
    latestDuels: duelsRes?.length > 0 ? duelsRes : [],
    latestCpuDuels: cpuDuelsRes?.length > 0 ? cpuDuelsRes : [],
    expectedGames: exp || [], nejnovejsiTipy: t || [], nejnovejsiTweaky: tw || [], darci: d || [], partneri: pa || [], featuredDeals: feat || []
  };

  const latestPosts = data.posts.slice(0, 20);
  const randomPosts = data.posts.length > 20 ? data.posts.slice(20, 35) : data.posts;
  const baseUrl = "https://thehardwareguru.cz";

  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "name": "The Hardware Guru", "url": isEn ? `${baseUrl}/en` : baseUrl };
  const articleSchemas = latestPosts.slice(0, 3).map(post => ({ "@context": "https://schema.org", "@type": "Article", "headline": isEn ? (post.title_en || post.title) : post.title, "datePublished": post.created_at, "image": getThumbnail(post, supabaseUrl) }));

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />
      {articleSchemas.map((schema, i) => ( <script key={`article-schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(schema) }} /> ))}

      <style>{`
        .game-card { transition: 0.3s; border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(31, 40, 51, 0.95); border-radius: 12px; overflow: hidden; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .guru-hero-section { max-width: 1200px; margin: 40px auto; padding: 60px 50px; background: linear-gradient(145deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%); border-radius: 30px; border: 1px solid rgba(102, 252, 241, 0.2); display: flex; align-items: center; gap: 50px; flex-wrap: wrap; backdrop-filter: blur(15px); }
        .social-btn-main { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid transparent; cursor: pointer; }
        .social-btn-main.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn-main.live:hover { background: #53fc18; color: #000; transform: translateY(-3px); }
        .social-btn-main.duels { background: rgba(255, 0, 85, 0.1); color: #ff0055; border-color: rgba(255, 0, 85, 0.3); }
        .social-btn-main.duels:hover { background: #ff0055; color: #fff; transform: translateY(-3px); }
        .social-btn-main.cpuduels { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: rgba(102, 252, 241, 0.3); }
        .social-btn-main.cpuduels:hover { background: #66fcf1; color: #000; transform: translateY(-3px); }
        .seo-link-pill { display: inline-block; padding: 8px 16px; margin: 0 10px 10px 0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; color: #9ca3af; font-size: 13px; text-decoration: none; transition: 0.2s; }
        .seo-link-pill:hover { background: rgba(102, 252, 241, 0.1); border-color: #66fcf1; color: #fff; }
        .seo-hard-text-block { max-width: 1200px; margin: 0 auto 60px auto; padding: 40px; background: rgba(15, 17, 21, 0.8); border-radius: 24px; border: 1px solid rgba(102, 252, 241, 0.15); color: #9ca3af; line-height: 1.8; font-size: 16px; backdrop-filter: blur(10px); }
        .seo-hard-text-block h2 { color: #fff; font-size: 24px; margin-bottom: 20px; font-weight: 900; }
        .seo-hard-text-block a { color: #66fcf1; text-decoration: none; font-weight: bold; border-bottom: 1px solid rgba(102, 252, 241, 0.3); }
        @media (max-width: 768px) { .guru-hero-section { padding: 40px 20px; text-align: center; } .social-btn-main { width: 100%; } }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px', display: 'flex', justifyContent: 'center' }}>
        <SeznamAd zoneId={408654} width={970} height={210} />
      </div>

      <header className="guru-hero-section">
        <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
              <ShieldCheck size={20} /> <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px' }}>Vaše technologická základna</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '950', lineHeight: '1.1' }}>
              {isEn ? <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU COMPARISON</span>, FPS CALCULATOR & PC BUILDS</> 
                     : <>HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU, GPU SROVNÁNÍ</span>, FPS KALKULAČKA A PC SESTAVY</>}
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#9ca3af', marginBottom: '40px' }}>Hardware expert s 20 lety praxe. Moje mise: vymýtit lagy, zkrotit FPS a vytvořit web, kde se každý geek cítí jako doma.</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn-main live"><Activity size={18}/> {isEn ? 'LIVE' : 'SLEDOVAT LIVE'}</a>
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="social-btn-main duels"><Swords size={18}/> {isEn ? 'GPU BATTLES' : 'SOUBOJE GPU'}</a>
              <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="social-btn-main cpuduels"><Cpu size={18}/> {isEn ? 'CPU BATTLES' : 'SOUBOJE CPU'}</a>
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="social-btn-main cpuduels" style={{backgroundColor:'rgba(168,85,247,0.1)', color:'#a855f7', borderColor:'rgba(168,85,247,0.3)'}}><Gamepad2 size={18}/> {isEn ? 'CAN I RUN IT?' : 'ROZJEDU TO?'}</a>
            </div>
        </div>
        <div style={{ width: '180px', height: '180px', background: 'linear-gradient(135deg, #0b0c10 0%, #1a1c23 100%)', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#66fcf1', fontSize: '4rem', fontWeight: '950', flexShrink: 0 }}>HG</div>
      </header>

      {/* --- SEO TEXT BLOCK S OPRAVENÝMI NÁZVY A CESTAMI --- */}
      <section className="seo-hard-text-block">
        <h2>{isEn ? 'Hardware Guru – CPU, GPU comparison and FPS calculator' : 'Hardware Guru – CPU, GPU srovnání a FPS kalkulačka'}</h2>
        <p>Vítejte na The Hardware Guru, portálu zaměřeném na <a href={isEn ? "/en/gpu-db" : "/gpu-db"}>Katalog Grafických Karet a Index Výkonu</a> a <a href={isEn ? "/en/cpu-db" : "/cpu-db"}>Katalog Procesorů a Index Výkonu</a>. Naše nástroje jako <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"}>FPS kalkulačka</a> a <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}>Bottleneck kalkulátor</a> vám pomohou optimalizovat váš herní zážitek.</p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          <li><a href={isEn ? "/en/gpu-db" : "/gpu-db"}>→ Katalog Grafických Karet a Index Výkonu</a></li>
          <li><a href={isEn ? "/en/cpu-db" : "/cpu-db"}>→ Katalog Procesorů a Index Výkonu</a></li>
          <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"}>→ Srovnání výkonu grafických karet (GPU VS)</a></li>
          <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}>→ Srovnání výkonu procesorů (CPU VS)</a></li>
        </ul>
      </section>

      {/* --- SEO: CATEGORY HUB (FIXED ROUTES) --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
          <a href={isEn ? "/en/clanky" : "/clanky"} className="seo-link-pill"><Compass size={14} style={{marginRight:'5px'}}/> {isEn ? 'Hardware News' : 'HW Novinky'}</a>
          <a href={isEn ? "/en/gpu-db" : "/gpu-db"} className="seo-link-pill"><Layers size={14} style={{marginRight:'5px'}}/> {isEn ? 'GPU Catalog' : 'Katalog Grafických Karet'}</a>
          <a href={isEn ? "/en/cpu-db" : "/cpu-db"} className="seo-link-pill"><Cpu size={14} style={{marginRight:'5px'}}/> {isEn ? 'CPU Catalog' : 'Katalog Procesorů'}</a>
          <a href={isEn ? "/en/doporucene-sestavy" : "/doporucene-sestavy"} className="seo-link-pill"><Gamepad2 size={14} style={{marginRight:'5px'}}/> {isEn ? 'PC Builds' : 'Doporučené PC Sestavy'}</a>
        </div>
      </section>

      {/* --- ČLÁNKY GRID --- */}
      {latestPosts.length > 0 && (
        <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '30px' }}>
            {latestPosts.map((post, idx) => {
              const badge = getBadgeInfo(post, isEn);
              return (
                <a key={post.id} href={isEn ? `/en/clanky/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="game-card">
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#0b0c10' }}>
                      <img src={getThumbnail(post, supabaseUrl)} alt={`${post.title} - srovnání benchmark`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading={idx < 3 ? "eager" : "lazy"} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{badge.text}</div>
                    </div>
                    <div style={{ padding: '25px' }}>
                      <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{isEn ? (post.title_en || post.title) : post.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* --- FOOTER (FIXED ROUTES) --- */}
      <footer style={{ background: '#050505', padding: '40px 20px', borderTop: '1px solid rgba(102, 252, 241, 0.2)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#6b7280' }}>
            <a href={isEn ? "/en/gpu-db" : "/gpu-db"} style={{ color: '#6b7280', textDecoration: 'none' }}>Katalog Grafických Karet</a>
            <a href={isEn ? "/en/cpu-db" : "/cpu-db"} style={{ color: '#6b7280', textDecoration: 'none' }}>Katalog Procesorů</a>
            <a href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#6b7280', textDecoration: 'none' }}>HW Slovník</a>
            <a href={isEn ? "/en/bottleneck-kalkulacka" : "/bottleneck-kalkulacka"} style={{ color: '#6b7280', textDecoration: 'none' }}>Bottleneck Kalkulačka</a>
        </div>
        <div style={{ marginTop: '20px', color: '#4b5563', fontSize: '11px' }}>&copy; {new Date().getFullYear()} The Hardware Guru. Všechna práva vyhrazena.</div>
      </footer>

      {/* ONESIGNAL POJISTKA */}
      <Script id="onesignal-init" strategy="lazyOnload">
        {`if (typeof window !== 'undefined') {
          var checkBtn = setInterval(function() {
            var btn = document.getElementById('guru-os-btn');
            if (btn && !btn.hasAttribute('data-bound')) {
              btn.setAttribute('data-bound', 'true');
              btn.onclick = function(e) {
                if (window.OneSignal) { window.OneSignal.showSlidedownPrompt(); }
              };
              clearInterval(checkBtn);
            }
          }, 500);
        }`}
      </Script>
    </div>
  );
}
