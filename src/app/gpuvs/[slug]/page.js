import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, Zap, ArrowRight, Activity, ArrowUpCircle, LayoutList, 
  BarChart3, Gamepad2, Coins, CheckCircle2, Swords, Flame, Heart, 
  Monitor, ExternalLink, Info, HelpCircle
} from 'lucide-react';
import GuruGpuCompareText from '../../../components/GuruGpuCompareText'; // 🚀 GURU: Import SEO generátoru

/**
 * GURU GPU DUELS ENGINE - V5.7 (SEO TEXT UPDATE)
 * 🚀 CÍL: Přidán dynamický SEO generátor textu pro odstranění "Thin Content" hlášky z Bingu.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = false;

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl) return [];
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=slug&limit=10000`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return [];
      const duels = await res.json();
      return duels.map((duel) => ({ slug: duel.slug }));
  } catch (e) { return []; }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

const getDuelData = cache(async (rawSlug) => {
  if (!supabaseUrl || !rawSlug) return null;
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'force-cache' });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return null; 
      return data[0];
  } catch (e) { return null; }
});

const getRelatedArticles = async (gpuA_Name, gpuB_Name) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(gpuA_Name || '');
    const nameB = normalizeName(gpuB_Name || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%${encodeURIComponent(nameA)}%,title_en.ilike.%${encodeURIComponent(nameA)}%,title.ilike.%${encodeURIComponent(nameB)}%,title_en.ilike.%${encodeURIComponent(nameB)}%)&order=created_at.desc&limit=3`, { headers, cache: 'no-store' });
        let data = [];
        if (res.ok) data = await res.json();
        if (!data || data.length === 0) {
            const resLatest = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&type=eq.hardware&order=created_at.desc&limit=3`, { headers, cache: 'no-store' });
            if (resLatest.ok) data = await resLatest.json();
        }
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
};

const getMoreDuels = async (currentSlug) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=title_cs,title_en,slug,slug_en&slug=neq.${currentSlug}&order=created_at.desc&limit=3`, { headers, cache: 'no-store' });
        if (res.ok) return await res.json();
        return [];
    } catch(e) { return []; }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const duel = await getDuelData(rawSlug);
  if (!duel) notFound();
  const { gpuA, gpuB } = duel;
  const canonicalUrl = isEn ? `${baseUrl}/en/gpuvs/${duel.slug}` : `${baseUrl}/gpuvs/${duel.slug}`;
  return { 
    title: isEn ? `${gpuA.name} vs ${gpuB.name} – Gaming Benchmarks & Review` : `Srovnání: ${gpuA.name} vs ${gpuB.name} – Výkon, Testy a Parametry`,
    description: isEn ? `Detailed comparison of ${gpuA.name} vs ${gpuB.name}. Benchmarks and analysis.` : `Detailní srovnání ${gpuA.name} vs ${gpuB.name}.`,
    alternates: { canonical: canonicalUrl, languages: { 'en': `${baseUrl}/en/gpuvs/${duel.slug}`, 'cs': `${baseUrl}/gpuvs/${duel.slug}` } }
  };
}

export default async function GpuVsDetailPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const duel = await getDuelData(rawSlug);
  if (!duel) notFound();

  const { gpuA, gpuB } = duel;
  const perfA = gpuA.performance_index || 1;
  const perfB = gpuB.performance_index || 1;
  const winner = perfA > perfB ? gpuA : gpuB;
  const loser = perfA > perfB ? gpuB : gpuA;
  const finalPerfDiff = Math.round((Math.max(perfA, perfB) / Math.min(perfA, perfB) - 1) * 100);

  // Výpočet rozdílu výkonu s ohledem na to, kdo je gpuA a gpuB pro komponentu
  const perfDiffForComponent = perfA > perfB ? -finalPerfDiff : finalPerfDiff;

  const getSafeGpuSlug = (gpu) => gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#ff0055', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const relatedArticles = await getRelatedArticles(gpuA.name, gpuB.name);
  const moreDuels = await getMoreDuels(duel.slug);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO TIER LIST' : 'ZPĚT NA ŽEBŘÍČEK'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0055', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(255, 0, 85, 0.3)', borderRadius: '50px', background: 'rgba(255, 0, 85, 0.1)' }}>
            <Swords size={14} /> GURU VS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {normalizeName(gpuA.name)} <br/>
            <span style={{ color: '#ff0055' }}>VS</span> {normalizeName(gpuB.name)}
          </h1>
          <div className="guru-verdict" style={{ borderColor: '#ff0055', color: '#ff0055', background: 'rgba(255, 0, 85, 0.05)', display: 'inline-block', marginTop: '20px', padding: '10px 25px', borderRadius: '50px', fontWeight: '950', border: '1px solid #ff005540', textTransform: 'uppercase' }}>
              {isEn ? 'PERFORMANCE WINNER:' : 'VÍTĚZ VÝKONU:'} <strong>{normalizeName(winner.name)}</strong> (+{finalPerfDiff}%)
          </div>
        </header>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD VERDIKTEM */}
        <div className="guru-vs-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        {/* 🚀 UPGRADE RING */}
        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '50px' }}>
            <div className="gpu-card" style={{ borderTop: `5px solid ${getVendorColor(gpuA.vendor)}` }}>
                <span style={{ color: getVendorColor(gpuA.vendor) }} className="vendor-tag">{gpuA.vendor} GPU</span>
                <h2 className="gpu-name-h2">{normalizeName(gpuA.name)}</h2>
                <a href={isEn ? `/en/gpu/${getSafeGpuSlug(gpuA)}` : `/gpu/${getSafeGpuSlug(gpuA)}`} className="entity-link" style={{ color: getVendorColor(gpuA.vendor) }}>
                    <Activity size={12} /> {isEn ? 'View Profile' : 'Profil grafiky'}
                </a>
            </div>
            <div className="vs-circle">VS</div>
            <div className="gpu-card" style={{ borderTop: `5px solid ${getVendorColor(gpuB.vendor)}` }}>
                <span style={{ color: getVendorColor(gpuB.vendor) }} className="vendor-tag">{gpuB.vendor} GPU</span>
                <h2 className="gpu-name-h2">{normalizeName(gpuB.name)}</h2>
                <a href={isEn ? `/en/gpu/${getSafeGpuSlug(gpuB)}` : `/gpu/${getSafeGpuSlug(gpuB)}`} className="entity-link" style={{ color: getVendorColor(gpuB.vendor) }}>
                    <Activity size={12} /> {isEn ? 'View Profile' : 'Profil grafiky'}
                </a>
            </div>
        </div>

        {/* 🚀 UPGRADE ANALYSIS BANNER */}
        <section style={{ marginBottom: '60px' }}>
            <div className="upgrade-banner">
                <div>
                    <div className="upgrade-label"><ArrowUpCircle size={16} /> {isEn ? 'UPGRADE ANALYSIS' : 'ANALÝZA UPGRADU'}</div>
                    <h3 className="upgrade-h3">{isEn ? `WORTH UPGRADING TO ${normalizeName(winner.name)}?` : `VYPLATÍ SE UPGRADE NA ${normalizeName(winner.name)}?`}</h3>
                    <p className="upgrade-p">{isEn ? `Find if switching from ${normalizeName(loser.name)} makes sense.` : `Zjisti, jestli dává přechod z ${normalizeName(loser.name)} smysl.`}</p>
                </div>
                <a href={isEn ? `/en/gpu-upgrade/${getSafeGpuSlug(loser)}-to-${getSafeGpuSlug(winner)}` : `/gpu-upgrade/${getSafeGpuSlug(loser)}-to-${getSafeGpuSlug(winner)}`} className="guru-upgrade-btn">
                    {isEn ? 'CALCULATE' : 'SPOČÍTAT'} <ArrowRight size={20} />
                </a>
            </div>
        </section>

        {/* 🚀 DEEP CONTENT S REKLAMOU UPROSTŘED */}
        <section style={{ marginBottom: '60px' }}>
          <div className="content-box-style">
            <h2 className="section-h2-title"><Info size={28} color="#ff0055" /> {isEn ? 'In-Depth Analysis' : 'Hluboká Analýza'}</h2>
            <div className="guru-prose">
              <h3>{isEn ? 'Gaming Benchmark' : 'Herní Benchmarking'}</h3>
              <p>{isEn ? `The ${winner.name} delivers ${finalPerfDiff}% more power.` : `Karta ${winner.name} poskytuje o ${finalPerfDiff}% vyšší výkon.`}</p>
              
              {/* 🚀 GURU: UNIKÁTNÍ SEO TEXT (VLOŽENO ZDE) */}
              <GuruGpuCompareText 
                  gpu1Name={normalizeName(gpuA.name)} 
                  gpu2Name={normalizeName(gpuB.name)} 
                  perfDiff={perfDiffForComponent} 
                  gpu1Vram={gpuA.vram_gb} 
                  gpu2Vram={gpuB.vram_gb} 
                  isEn={isEn} 
              />
              
              {/* 🔥 ADS SLOT #2: MEZI ODSTAVCI ANALÝZY */}
              <div className="guru-vs-ad-slot" style={{ margin: '40px 0' }}>
                  <span className="ad-label">Sponsored Performance Data</span>
                  <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                  <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
              </div>

              <h3>{isEn ? 'Architecture & VRAM' : 'Architektura a VRAM'}</h3>
              <p>{isEn ? `Comparison of architectures and ${gpuA.vram_gb}GB vs ${gpuB.vram_gb}GB memory.` : `Srovnání architektur a pamětí ${gpuA.vram_gb}GB vs ${gpuB.vram_gb}GB.`}</p>
            </div>
          </div>
        </section>

        {/* 🚀 PARAMETRY */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2-title"><LayoutList size={28} color="#ff0055" /> {isEn ? 'SPECIFICATIONS' : 'PARAMETRY'}</h2>
          <div className="specs-table-container">
             {[
               { label: 'VRAM', valA: `${gpuA.vram_gb} GB`, valB: `${gpuB.vram_gb} GB`, winA: gpuA.vram_gb, winB: gpuB.vram_gb },
               { label: 'TDP', valA: `${gpuA.tdp_w} W`, valB: `${gpuB.tdp_w} W`, winA: gpuA.tdp_w, winB: gpuB.tdp_w, lower: true },
               { label: 'CLOCK', valA: `${gpuA.boost_clock_mhz} MHz`, valB: `${gpuB.boost_clock_mhz} MHz`, winA: gpuA.boost_clock_mhz, winB: gpuB.boost_clock_mhz }
             ].map((row, i) => (
               <div key={i} className="spec-row">
                 <div style={getWinnerStyle(row.winA, row.winB, row.lower)} className="spec-val-left">{row.valA}</div>
                 <div className="spec-label">{row.label}</div>
                 <div style={getWinnerStyle(row.winB, row.winA, row.lower)} className="spec-val-right">{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        {/* 🚀 SILOING */}
        <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2-title" style={{ borderLeftColor: '#a855f7' }}><Info size={28} color="#a855f7" /> {isEn ? 'RELATED' : 'SOUVISEJÍCÍ'}</h2>
            <div className="related-grid-vs">
                {relatedArticles.map(art => (
                    <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} className="rel-card">
                        <img src={art.image_url} alt={art.title} />
                        <div className="rel-content"><h3>{isEn && art.title_en ? art.title_en : art.title}</h3></div>
                    </a>
                ))}
            </div>
        </section>

        <div className="global-cta-vs">
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
            <a href="/support" className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #ff0055; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(255, 0, 85, 0.3); transition: 0.3s; }
        
        .guru-vs-ad-slot { margin: 30px 0; padding: 15px; background: rgba(255, 0, 85, 0.03); border: 1px solid rgba(255, 0, 85, 0.1); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }

        .guru-grid-ring { display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; margin-bottom: 50px; }
        .gpu-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; textAlign: center; }
        .vendor-tag { fontSize: 11px; fontWeight: 950; textTransform: uppercase; letterSpacing: 3px; display: block; margin-bottom: 10px; }
        .gpu-name-h2 { fontSize: clamp(1.6rem, 3.5vw, 2.5rem); fontWeight: 950; color: #fff; textTransform: uppercase; margin: 0 0 15px 0; }
        .vs-circle { background: #0a0b0d; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justifyContent: center; color: #ff0055; border: 2px solid #ff0055; fontWeight: 950; fontSize: 24px; }
        
        .upgrade-banner { background: linear-gradient(135deg, rgba(102, 252, 241, 0.1) 0%, rgba(15, 17, 21, 0.95) 100%); border: 1px solid rgba(102, 252, 241, 0.3); padding: 30px; border-radius: 24px; display: flex; align-items: center; justifyContent: space-between; flexWrap: wrap; gap: 20px; }
        .upgrade-label { display: flex; align-items: center; gap: 10px; color: #66fcf1; fontWeight: 950; textTransform: uppercase; fontSize: 12px; }
        .upgrade-h3 { fontSize: 1.8rem; fontWeight: 950; color: #fff; margin: 10px 0; textTransform: uppercase; }
        .guru-upgrade-btn { background: #66fcf1; color: #000; padding: 16px 30px; border-radius: 16px; fontWeight: 950; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; }

        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .section-h2-title { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .guru-prose { color: #d1d5db; font-size: 1.1rem; line-height: 1.8; }
        .guru-prose h3 { color: #fff; font-size: 1.4rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 3px solid #ff0055; padding-left: 12px; }

        .specs-table-container { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-val-left { flex: 1; text-align: right; font-size: 16px; }
        .spec-label { width: 150px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; }
        .spec-val-right { flex: 1; text-align: left; font-size: 18px; }

        .related-grid-vs { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .rel-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; text-decoration: none; display: block; transition: 0.3s; }
        .rel-card:hover { transform: translateY(-5px); border-color: #a855f7; }
        .rel-card img { width: 100%; height: 160px; object-fit: cover; }
        .rel-content { padding: 20px; }
        .rel-content h3 { color: #fff; font-size: 1.1rem; font-weight: 950; margin: 0; }

        .global-cta-vs { margin-top: 80px; display: flex; gap: 20px; justifyContent: center; }
        .guru-deals-btn, .guru-support-btn { flex: 1; max-width: 300px; display: flex; align-items: center; justifyContent: center; gap: 12px; padding: 18px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .guru-support-btn { background: #eab308; color: #000; }

        @media (max-width: 768px) {
            .ad-desktop { display: none; } .ad-mobile { display: block; }
            .guru-grid-ring { grid-template-columns: 1fr; }
            .spec-row { padding: 15px; }
            .spec-label { width: 100px; }
            .global-cta-vs { flex-direction: column; }
            .guru-deals-btn, .guru-support-btn { max-width: 100%; }
        }
      `}} />
    </div>
  );
}
