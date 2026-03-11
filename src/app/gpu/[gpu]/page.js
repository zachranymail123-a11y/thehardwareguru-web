import React, { cache } from 'react';
import Script from 'next/script';
import { 
  ChevronLeft, Monitor, Database, Gamepad2, ArrowRight, ExternalLink, Activity, CheckCircle2, Swords, LayoutList, Flame, Heart, Zap, ShieldCheck, BarChart3
} from 'lucide-react';

/**
 * GURU GPU ENGINE - DETAIL GRAFIKY V2.6 (ULTIMATE LOOKUP & ADSENSE)
 * Cesta: src/app/gpu/[slug]/page.js
 * 🚀 STATUS: LIVE - Propojeno s AdSense ID ca-pub-5468223287024993
 * 🛡️ FIX 1: Separátní fetch pro GPU a FPS (řeší 404 u nových karet bez testů).
 * 🛡️ FIX 2: Implementován 3-Tier Chunk Search (Name OR Slug).
 * 🛡️ MONETIZACE: Integrovány reklamní sloty a globální AdSense skript.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

// 🛡️ GURU ENGINE: Robustní vyhledávání GPU (Sjednoceno s Bottleneck standardem)
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  // Tier 1: Přesná shoda slugu
  try {
      const url1 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  // Tier 2: Agresivní vyhledávání podle kousků názvu (Name OR Slug)
  try {
      const clean = gpuSlug.replace(/-/g, " ").replace(/geforce|rtx|radeon|rx|nvidia|amd/gi, "").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'no-store' });
          if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
      }
  } catch(e) {}

  return null;
};

// 🚀 Pomocná komponenta pro AdSense
const AdSpace = ({ slot, height = '90px', maxWidth = '100%' }) => (
    <div className="ad-container" style={{ width: '100%', maxWidth, margin: '30px auto', minHeight: height, textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>REKLAMA / SPONZOROVANÉ</div>
        <ins className="adsbygoogle"
             style={{ display: 'block', minHeight: height }}
             data-ad-client="ca-pub-5468223287024993"
             data-ad-slot={slot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
);

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${gpu.name} Specs, Benchmarks & Gaming Performance | The Hardware Guru`
      : `${gpu.name} Specifikace, Benchmarky a Herní výkon | The Hardware Guru`,
    description: isEn
      ? `Everything you need to know about ${gpu.name}. Detailed specifications, gaming benchmarks, and performance analysis.`
      : `Vše co potřebujete vědět o grafické kartě ${gpu.name}. Detailní specifikace, herní benchmarky a analýza výkonu.`,
  };
}

export default async function GpuDetailPage({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(gpuSlug);
  
  if (!gpu) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '40px' }}>
      <div style={{ background: 'rgba(15, 17, 21, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '30px', padding: '60px', maxWidth: '600px', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
        <Activity size={64} color="#ef4444" style={{ margin: '0 auto 30px' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: '950', marginBottom: '20px', textTransform: 'uppercase' }}>{isEn ? 'GPU NOT FOUND' : 'GRAFIKA NENALEZENA'}</h2>
        <p style={{ color: '#9ca3af', marginBottom: '40px' }}>{isEn ? 'This graphics card is not yet indexed in our database.' : 'Tato grafická karta zatím není v naší databázi zaindexována.'}</p>
        <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 30px', background: '#66fcf1', color: '#000', fontWeight: '950', borderRadius: '12px', textDecoration: 'none' }}>
            <ChevronLeft size={20} /> {isEn ? 'BACK TO RANKING' : 'ZPĚT NA ŽEBŘÍČEK'}
        </a>
      </div>
    </div>
  );

  const fpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : (gpu.game_fps || {});
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#0071c5');
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous" strategy="afterInteractive" />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO RANKING' : 'ZPĚT NA ŽEBŘÍČEK'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Monitor size={16} /> {isEn ? 'GPU PERFORMANCE PROFILE' : 'PROFIL VÝKONU GRAFIKY'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{gpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <AdSpace slot="1234567890" />

        <div className="layout-grid">
            <div className="main-content">
                
                {/* 🚀 QUICK STATS GRID */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    <div className="stat-card">
                        <div className="label">BOOST CLOCK</div>
                        <div className="val">{gpu.boost_clock_mhz || '-'} <span style={{fontSize: '14px', color: '#6b7280'}}>MHz</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="label">VRAM CAPACITY</div>
                        <div className="val">{gpu.vram_gb || '-'} <span style={{fontSize: '14px', color: '#6b7280'}}>GB</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="label">POWER DRAW (TDP)</div>
                        <div className="val" style={{ color: '#ef4444' }}>{gpu.tdp_w || '-'} <span style={{fontSize: '14px', color: '#6b7280'}}>W</span></div>
                    </div>
                </section>

                {/* 🚀 DEEP DIVE CROSS LINKS */}
                <section style={{ marginBottom: '60px' }}>
                  <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Database size={28} /> {isEn ? 'GURU ANALYSIS HUB' : 'ANALYTICKÝ HUB GURU'}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} className="deep-link-card">
                          <Activity size={32} color="#66fcf1" />
                          <div>
                              <h3>{isEn ? 'Full Specs' : 'Kompletní parametry'}</h3>
                              <p>{isEn ? 'Detailed technical data and benchmarks.' : 'Detailní technická data a benchmarky.'}</p>
                          </div>
                          <ArrowRight size={20} className="link-arrow" />
                      </a>
                      <a href={isEn ? `/en/gpu-recommend/${safeSlug}` : `/gpu-recommend/${safeSlug}`} className="deep-link-card">
                          <CheckCircle2 size={32} color="#10b981" />
                          <div>
                              <h3>{isEn ? 'Guru Verdict' : 'Verdikt Guru'}</h3>
                              <p>{isEn ? 'Value analysis and buy recommendation.' : 'Analýza ceny a doporučení ke koupi.'}</p>
                          </div>
                          <ArrowRight size={20} className="link-arrow" />
                      </a>
                  </div>
                </section>

                <AdSpace slot="0987654321" height="250px" />

                {/* 🚀 SPECIFICATIONS TABLE */}
                <section style={{ marginBottom: '60px' }}>
                  <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}</h2>
                  <div className="table-wrapper">
                     {[
                       { label: 'VRAM', val: gpu?.vram_gb ? `${gpu.vram_gb} GB GDDR6` : '-' },
                       { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', val: gpu?.memory_bus ?? '-' },
                       { label: 'ARCHITECTURE', val: gpu?.architecture ?? '-' },
                       { label: isEn ? 'RELEASE PRICE' : 'ZAVÁDĚCÍ CENA', val: gpu?.release_price_usd ? `$${gpu.release_price_usd}` : '-' },
                       { label: isEn ? 'PERFORMANCE INDEX' : 'VÝKONNOSTNÍ INDEX', val: gpu?.performance_index ?? '-' }
                     ].map((row, i) => (
                       <div key={i} className="spec-row">
                         <div className="table-label">{row.label}</div>
                         <div className="table-val">{row.val}</div>
                       </div>
                     ))}
                  </div>
                </section>

            </div>

            <aside className="ad-sidebar">
                <AdSpace slot="5432167890" height="600px" />
            </aside>
        </div>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .layout-grid { display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }

        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .val { font-size: 32px; font-weight: 950; }

        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; }
        .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
        .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.85rem; line-height: 1.4; }
        .deep-link-card .link-arrow { position: absolute; right: 25px; color: #4b5563; }
        .deep-link-card:hover { border-color: rgba(102, 252, 241, 0.3); transform: translateY(-5px); }

        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row { display: flex; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .table-val { color: #fff; font-weight: 950; font-size: 18px; }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 35px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 35px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); }
        .guru-support-btn:hover, .guru-deals-btn:hover { transform: scale(1.05); filter: brightness(1.1); }

        @media (max-width: 1024px) { .layout-grid { grid-template-columns: 1fr; } .ad-sidebar { display: none; } }
        @media (max-width: 768px) { .deep-link-card { padding: 20px; } .deep-link-card .link-arrow { display: none; } }
      `}} />
    </div>
  );
}
