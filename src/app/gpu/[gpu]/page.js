import React from 'react';
import { headers } from 'next/headers';
import { 
 ChevronLeft, Monitor, Database, Gamepad2, ArrowRight, ExternalLink, 
 Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Info, Cpu, Zap
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU GPU ENGINE - DETAIL GRAFIKY V3.4 (EN DETECTION FIX + AMAZON)
 * 🚀 CÍL: Spolehlivá detekce angličtiny z URL adresy + Amazon tlačítka.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const getCleanSearchName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '').trim();

const getRelatedArticles = async (gpuName) => {
    if (!supabaseUrl) return [];
    const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const name = normalizeName(gpuName || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%${encodeURIComponent(name)}%,title_en.ilike.%${encodeURIComponent(name)}%)&order=created_at.desc&limit=3`, { headers: authHeaders, cache: 'no-store' });
        let data = [];
        if (res.ok) data = await res.json();
        if (!data || data.length === 0) {
            const resLatest = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&order=created_at.desc&limit=3`, { headers: authHeaders, cache: 'no-store' });
            if (resLatest.ok) data = await resLatest.json();
        }
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
};

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug || gpuSlug === 'undefined') return null;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers: authHeaders, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      const clean = gpuSlug.replace(/-/g, " ").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers: authHeaders, cache: 'no-store' });
          if (res2.ok) { const data2 = await res2.json(); return data2[0] || null; }
      }
  } catch(e) {}
  return null;
};

const getInternalLinksData = async (gpuId) => {
  if (!supabaseUrl || !gpuId) return { similarGpus: [], recommendedCpus: [] };
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  let similarGpus = [];
  let recommendedCpus = [];
  try {
      const gpuRes = await fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug&id=neq.${gpuId}&order=performance_index.desc&limit=6`, { headers: authHeaders, cache: 'no-store' });
      if (gpuRes.ok) similarGpus = await gpuRes.json();
      const cpuRes = await fetch(`${supabaseUrl}/rest/v1/cpus?select=name,slug&order=performance_index.desc&limit=6`, { headers: authHeaders, cache: 'no-store' });
      if (cpuRes.ok) recommendedCpus = await cpuRes.json();
  } catch(e) {}
  return { similarGpus, recommendedCpus };
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  
  // 🔥 GURU OPRAVA: Spolehlivá detekce angličtiny z URL hlavičky
  const headersList = headers();
  const referer = headersList.get('referer') || "";
  const isEn = rawSlug.startsWith('en-') || referer.includes('/en') || props.isEn === true;

  const gpuSlug = rawSlug.replace(/^en-/, '');
  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };
  
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const canonicalUrl = isEn ? `${baseUrl}/en/gpu/${safeSlug}` : `${baseUrl}/gpu/${safeSlug}`;
  
  return {
    title: isEn ? `${gpu.name} Specs & Performance | The Hardware Guru` : `${gpu.name} Specifikace a Výkon | The Hardware Guru`,
    alternates: { canonical: canonicalUrl, languages: { 'en': `${baseUrl}/en/gpu/${safeSlug}`, 'cs': `${baseUrl}/gpu/${safeSlug}`, 'x-default': `${baseUrl}/gpu/${safeSlug}` } }
  };
}

export default async function GpuDetailPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  
  // 🔥 GURU OPRAVA: Spolehlivá detekce angličtiny z URL hlavičky (jako v layout.js)
  const headersList = headers();
  const referer = headersList.get('referer') || "";
  const isEn = rawSlug.startsWith('en-') || referer.includes('/en') || props.isEn === true;

  const gpuSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return <div style={{ color: '#ef4444', textAlign: 'center', padding: '100px', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GPU NOT FOUND</div>;

  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const relatedArticles = await getRelatedArticles(gpu.name);
  const { similarGpus, recommendedCpus } = await getInternalLinksData(gpu.id);

  // 🔥 GENERÁTOR AFFILIATE LINKŮ S UTM 🔥
  const searchName = getCleanSearchName(gpu.name);
  const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
  const getHeurekaLink = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
  const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": normalizeName(gpu.name),
    "image": [`${baseUrl}/logo.png`],
    "description": isEn ? `Specifications for ${gpu.name}.` : `Specifikace pro ${gpu.name}.`,
    "brand": { "@type": "Brand", "name": gpu.vendor || "Hardware" },
    "sku": safeSlug,
    "offers": { 
      "@type": "Offer", "priceCurrency": "USD", "price": Number(gpu.release_price_usd) || 499,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}gpu/${safeSlug}`,
      "availability": "https://schema.org/InStock"
    }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div className="guru-gpu-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />

      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="gpu-badge">
            <Monitor size={16} /> {isEn ? 'GPU PROFILE' : 'PROFIL GRAFIKY'}
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.1rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{gpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        {/* 🔥 GURU AFFILIATE BOMB GRID (Amazon vs CZ tlačítka) 🔥 */}
        <div className="affiliate-cta-grid" style={{ marginBottom: '30px', borderColor: `${vendorColor}40` }}>
            <div className="affiliate-col">
                <div className="affiliate-col-title" style={{ color: vendorColor }}>
                    <ShoppingCart size={16} /> {isEn ? `BUY ${normalizeName(gpu.name)}` : `KOUPIT ${normalizeName(gpu.name)}`}
                </div>
                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={getAmazonLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                            <ShoppingCart size={16} /> Check Price on Amazon
                        </a>
                    ) : (
                        <>
                            <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                <ShoppingCart size={16} /> Smarty.cz
                            </a>
                            <a 
                                href={getHeurekaLink(searchName)} 
                                data-trixam-positionid="276026" 
                                data-trixam-codetype="link" 
                                target="_blank" 
                                rel="nofollow sponsored" 
                                className="guru-buy-winner-btn heureka-btn heureka-hn-link"
                            >
                                <ShoppingCart size={16} /> Heureka.cz
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Heureka Buttons widget (Skryto pro EN) */}
        {!isEn && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                <HeurekaButtons isEn={false} manualSearch={gpu.name} positionId="276026" />
            </div>
        )}

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <section className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card"><div className="label">VRAM</div><div className="val">{gpu.vram_gb || '-'} GB</div></div>
            <div className="stat-card"><div className="label">TDP</div><div className="val">{gpu.tdp_w || '-'} W</div></div>
            <div className="stat-card"><div className="label">PERFORMANCE</div><div className="val">{gpu.performance_index || '-'} PTS</div></div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div className="deep-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color={vendorColor} />
                  <div>
                      <h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3>
                      <p>{isEn ? 'Full specs and benchmarks.' : 'Technické specifikace a testy.'}</p>
                  </div>
              </a>
              <a href={isEn ? `/en/gpu-recommend/${safeSlug}` : `/gpu-recommend/${safeSlug}`} className="deep-link-card">
                  <CheckCircle2 size={32} color="#10b981" />
                  <div>
                      <h3>{isEn ? 'Guru Verdict' : 'Guru Verdikt'}</h3>
                      <p>{isEn ? 'Is it worth buying?' : 'Vyplatí se koupit?'}</p>
                  </div>
              </a>
          </div>
        </section>

        {similarGpus.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
              <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Swords size={28} /> {isEn ? 'COMPARISONS' : 'SROVNÁNÍ'}</h2>
              <div className="silo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  {similarGpus.map(otherGpu => (
                    <a key={otherGpu.slug} href={isEn ? `/en/gpuvs/${safeSlug}-vs-${otherGpu.slug}` : `/gpuvs/${safeSlug}-vs-${otherGpu.slug}`} className="silo-link-card">
                        <span style={{ fontWeight: '900' }}>VS {normalizeName(otherGpu.name)}</span>
                        <ArrowRight size={16} className="silo-arrow" />
                    </a>
                  ))}
              </div>
          </section>
        )}

        {recommendedCpus.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
              <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Zap size={28} /> {isEn ? 'CPU PAIRINGS' : 'PROCESORY K TÉTO GPU'}</h2>
              <div className="silo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  {recommendedCpus.map(cpu => (
                    <a key={cpu.slug} href={isEn ? `/en/bottleneck/${cpu.slug}-with-${safeSlug}` : `/bottleneck/${cpu.slug}-with-${safeSlug}`} className="silo-link-card" style={{ borderLeftColor: '#a855f7' }}>
                        <span style={{ fontWeight: '900' }}>+ {normalizeName(cpu.name)}</span>
                        <Cpu size={16} className="silo-arrow" />
                    </a>
                  ))}
              </div>
          </section>
        )}

        <div className="footer-btns" style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .gpu-badge { display: inline-flex; align-items: center; gap: 8px; color: #fff; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; background: rgba(255,255,255,0.05); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; }
        .label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .val { font-size: 32px; font-weight: 950; }

        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; }
        .deep-link-card h3 { font-size: 18px; font-weight: 950; margin: 0 0 5px 0; }
        .deep-link-card p { font-size: 13px; color: #9ca3af; margin: 0; }
        
        .silo-link-card { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 18px 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; transition: 0.3s; border-left: 3px solid #6b7280; }
        .silo-link-card:hover { transform: translateX(5px); background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }

        .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; transition: 0.3s; text-transform: uppercase; }
        .guru-support-btn { background: #eab308; color: #000; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }

        .sticky-bottom-anchor {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 11, 13, 0.98);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
        }

        /* 🔥 CSS PRO AFFILIATE GRID A TLAČÍTKA 🔥 */
        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
        .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
        
        @keyframes pulse-smarty { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
        @keyframes pulse-heureka { 0% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 120, 212, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0); } }
        
        .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; animation: pulse-smarty 2s infinite; }
        .smarty-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 15px 30px rgba(234, 179, 8, 0.5); }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; animation: pulse-heureka 2s infinite; animation-delay: 1s; }
        .heureka-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 10px 20px rgba(0, 120, 212, 0.5); }

        /* 🔥 NOVÉ: CSS PRO AMAZON TLAČÍTKO 🔥 */
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }
        .amazon-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 15px 30px rgba(245, 158, 11, 0.5); }

        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-gpu-wrapper { paddingTop: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.8rem !important; }
            .stats-grid { grid-template-columns: 1fr !important; gap: 15px; }
            .stat-card { padding: 20px !important; border-radius: 18px; }
            .val { font-size: 24px; }
            .deep-links-grid { grid-template-columns: 1fr !important; }
            .deep-link-card { padding: 20px !important; }
            .silo-grid { grid-template-columns: 1fr !important; }
            .footer-btns { flex-direction: column; }
            .guru-deals-btn, .guru-support-btn { width: 100% !important; }
            .affiliate-cta-grid { padding: 20px; }
            .affiliate-col-title { font-size: 14px; margin-bottom: 20px; }
            .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
            .guru-buy-winner-btn { max-width: 100%; width: 100%; padding: 16px; font-size: 15px; }
        }
      `}} />
    </div>
  );
}
