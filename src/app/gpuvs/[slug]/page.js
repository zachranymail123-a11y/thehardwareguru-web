import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { 
 ChevronLeft, Zap, ArrowRight, Activity, ArrowUpCircle, LayoutList, 
 BarChart3, Gamepad2, Coins, CheckCircle2, Swords, Flame, Heart, 
 Monitor, ExternalLink, Info, HelpCircle, ChevronRight, ShoppingCart, AlertTriangle
} from 'lucide-react';
import GuruGpuCompareText from '../../../components/GuruGpuCompareText';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import GuruInContentOffer from '../../../components/GuruInContentOffer';

/**
 * GURU GPU DUELS ENGINE - V12.3 (NEXT.JS 15 AWAIT HEADERS FIX)
 * 🚀 CÍL: Oprava pádu (Error 500) kvůli asynchronním headers() a 100% detekce EN.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = true;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateStaticParams() {
  if (!supabaseUrl) return [];
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=slug&limit=1000`, {
          headers: authHeaders, next: { revalidate: 86400 }
      });
      if (!res.ok) return [];
      const duels = await res.json();
      return duels.map((duel) => ({ slug: duel.slug }));
  } catch (e) { return []; }
}

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

const getDuelData = cache(async (rawSlug) => {
  if (!supabaseUrl || !rawSlug) return null;
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  const performSearch = async (filterStr) => {
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&${filterStr}&limit=1`, { 
          headers: authHeaders, cache: 'no-store' 
        });
        if (res.ok) {
           const data = await res.json();
           if (data && data.length > 0) return data[0];
        }
    } catch (e) {}
    return null;
  };

  let result = await performSearch(`slug=eq.${cleanSlug}`);
  if (result) return result;

  const parts = cleanSlug.split('-vs-');
  if (parts.length === 2) {
      const cleanPart = (p) => p.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '').replace(/-[0-9]+gb/gi, '').trim();
      const p1 = cleanPart(parts[0]);
      const p2 = cleanPart(parts[1]);
      
      if (p1 && p2) {
          result = await performSearch(`and=(slug.ilike.*${p1}*,slug.ilike.*${p2}*)`);
          if (result) return result;
      }
      if (p1) { result = await performSearch(`slug=ilike.*${p1}*`); }
  }
  return result;
});

const getRelatedArticles = async (gpuA_Name, gpuB_Name) => {
    if (!supabaseUrl) return [];
    const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(gpuA_Name || '');
    const nameB = normalizeName(gpuB_Name || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.*${encodeURIComponent(nameA)}*,title_en.ilike.*${encodeURIComponent(nameA)}*,title.ilike.*${encodeURIComponent(nameB)}*,title_en.ilike.*${encodeURIComponent(nameB)}*)&order=created_at.desc&limit=3`, { headers: authHeaders, cache: 'force-cache' });
        let data = [];
        if (res.ok) data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
};

export async function generateMetadata(props) {
  const { slug } = await props.params; 
  // 🔥 FIX: AWAIT HEADERS pro Next.js 15
  const h = await headers();
  const fullUrl = h.get('x-url') || h.get('referer') || h.get('x-invoke-path') || "";
  const isEn = props.isEnProxy === true || props.isEn === true || slug?.startsWith('en-') || fullUrl.includes('/en/');

  const cleanSlug = slug.replace(/^en-/, '');
  const duel = await getDuelData(cleanSlug);
  if (!duel || !duel.gpuA) return { title: 'GPU Comparison | Hardware Guru' };
  const canonicalUrl = isEn ? `${baseUrl}/en/gpuvs/${duel.slug}` : `${baseUrl}/gpuvs/${duel.slug}`;
  return { 
    title: isEn ? `${duel.gpuA.name} vs ${duel.gpuB.name} – Gaming Benchmarks` : `Srovnání: ${duel.gpuA.name} vs ${duel.gpuB.name} – Výkon a Testy`,
    alternates: { canonical: canonicalUrl, languages: { 'en': `${baseUrl}/en/gpuvs/${duel.slug}`, 'cs': `${baseUrl}/gpuvs/${duel.slug}` } }
  };
}

export default async function GpuVsDetailPage(props) {
  const { slug } = await props.params; 
  // 🔥 FIX: AWAIT HEADERS pro Next.js 15
  const h = await headers();
  const fullUrl = h.get('x-url') || h.get('referer') || h.get('x-invoke-path') || "";
  const isEn = props.isEnProxy === true || props.isEn === true || slug?.startsWith('en-') || fullUrl.includes('/en/');

  const cleanSlug = slug.replace(/^en-/, '');
  const duel = await getDuelData(cleanSlug);
  
  if (!duel) notFound();

  const { gpuA, gpuB } = duel;
  const perfA = gpuA.performance_index || 1;
  const perfB = gpuB.performance_index || 1;
  const winner = perfA > perfB ? gpuA : gpuB;
  const loser = perfA > perfB ? gpuB : gpuA;
  const finalPerfDiff = Math.round((Math.max(perfA, perfB) / Math.min(perfA, perfB) - 1) * 100);
  const perfDiffForComponent = perfA > perfB ? -finalPerfDiff : finalPerfDiff;

  const getSafeGpuSlug = (gpu) => {
      const raw = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
      return raw.replace(/^en-/, '');
  };
  
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

  const isWinnerUltimate = winner.name.includes('4090') || winner.name.includes('5090') || winner.name.includes('5080') || winner.name.includes('7900 XTX');
  const upgradeProduct = isWinnerUltimate ? "AMD Ryzen 7 9800X3D" : "NVIDIA RTX 5080";
  const upgradeCategory = isWinnerUltimate ? "cpu" : "gpu";

  const searchName = normalizeName(winner.name).trim();
  const amazonAffiliateLink = `https://www.amazon.com/s?k=${encodeURIComponent(searchName)}&tag=thehardware07-20&ascsubtag=v10-gpuvs`;
  const smartyAffiliateLink = `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(searchName)}`)}`;
  const heurekaAffiliateLink = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeURIComponent(searchName + ' grafická karta')}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=GpuVsDetail&o=3`;

  return (
    <div className="guru-duel-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div className="engine-badge"><Swords size={14} /> GURU VS ENGINE</div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {normalizeName(gpuA.name)} <br/>
            <span style={{ color: '#ff0055' }}>VS</span> {normalizeName(gpuB.name)}
          </h1>
          <div className="guru-verdict" style={{ borderColor: '#ff0055', color: '#ff0055', background: 'rgba(255, 0, 85, 0.05)', display: 'inline-block', marginTop: '20px', padding: '10px 25px', borderRadius: '50px', fontWeight: '950', border: '1px solid #ff005540', textTransform: 'uppercase' }}>
              {isEn ? 'PERFORMANCE WINNER:' : 'VÍTĚZ VÝKONU:'} <strong>{normalizeName(winner.name)}</strong> (+{finalPerfDiff}%)
          </div>

          <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            {isEn ? (
                <a href={amazonAffiliateLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn"><ShoppingCart size={20} /> CHECK PRICE ON AMAZON</a>
            ) : (
                <>
                    <a href={smartyAffiliateLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={20} /> KOUPIT NA SMARTY.CZ</a>
                    <a href={heurekaAffiliateLink} data-trixam-positionid="276026" data-trixam-codetype="link" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link"><ShoppingCart size={20} /> KOUPIT NA HEUREKA.CZ</a>
                </>
            )}
          </div>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '50px' }}>
            <div className="compare-card" style={{ borderTop: `5px solid ${getVendorColor(gpuA.vendor)}`, background: 'rgba(15, 17, 21, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}>
                <span className="vendor-tag" style={{ color: getVendorColor(gpuA.vendor), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: '10px' }}>{gpuA.vendor} GPU</span>
                <h2 className="gpu-name-h2" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0 0 15px 0' }}>{normalizeName(gpuA.name)}</h2>
                <a href={isEn ? `/en/gpu/${getSafeGpuSlug(gpuA)}` : `/gpu/${getSafeGpuSlug(gpuA)}`} className="entity-link" style={{ color: getVendorColor(gpuA.vendor), textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Activity size={12} /> {isEn ? 'Profile' : 'Profil'}</a>
            </div>
            <div className="vs-circle" style={{ background: '#0a0b0d', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0055', border: '2px solid #ff0055', fontWeight: '950', fontSize: '24px' }}>VS</div>
            <div className="compare-card" style={{ borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, background: 'rgba(15, 17, 21, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}>
                <span className="vendor-tag" style={{ color: getVendorColor(gpuB.vendor), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: '10px' }}>{gpuB.vendor} GPU</span>
                <h2 className="gpu-name-h2" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0 0 15px 0' }}>{normalizeName(gpuB.name)}</h2>
                <a href={isEn ? `/en/gpu/${getSafeGpuSlug(gpuB)}` : `/gpu/${getSafeGpuSlug(gpuB)}`} className="entity-link" style={{ color: getVendorColor(gpuB.vendor), textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Activity size={12} /> {isEn ? 'Profile' : 'Profil'}</a>
            </div>
        </div>

        <div style={{ margin: '40px 0' }}>
            <GuruInContentOffer 
                productName={upgradeProduct} 
                category={upgradeCategory} 
                reason="upgrade"
                isEn={isEn}
                subId={`gpuvs-smart-path-${slugify(winner.name)}`}
            />
        </div>

        <section style={{ marginBottom: '60px' }}>
            <div className="upgrade-banner" style={{ background: 'linear-gradient(135deg, rgba(255, 0, 85, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(255, 0, 85, 0.2)', padding: '30px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff0055', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px' }}><ArrowUpCircle size={16} /> {isEn ? 'UPGRADE ANALYSIS' : 'ANALÝZA UPGRADU'}</div>
                    <h3 className="banner-h3" style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff', margin: '10px 0', textTransform: 'uppercase' }}>{isEn ? `WORTH UPGRADING TO ${normalizeName(winner.name)}?` : `VYPLATÍ SE UPGRADE NA ${normalizeName(winner.name)}?`}</h3>
                    <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `Find if switching from ${normalizeName(loser.name)} makes sense.` : `Zjisti, jestli dává přechod z ${normalizeName(loser.name)} smysl.`}</p>
                </div>
                <a href={isEn ? `/en/gpu-upgrade/${getSafeGpuSlug(loser)}-to-${getSafeGpuSlug(winner)}` : `/gpu-upgrade/${getSafeGpuSlug(loser)}-to-${getSafeGpuSlug(winner)}`} className="btn-upgrade-calc" style={{ background: '#ff0055', color: '#fff', padding: '16px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
                    {isEn ? 'CALCULATE' : 'SPOČÍTAT'} <ArrowRight size={20} />
                </a>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><AlertTriangle size={16} /> {isEn ? 'SYSTEM CHECK' : 'KONTROLA SYSTÉMU'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK CALCULATOR' : 'BOTTLENECK KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `Will your CPU handle the ${normalizeName(winner.name)}?` : `Nebude tvůj procesor brzdit grafiku ${normalizeName(winner.name)}?`}</p>
                    </div>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn hover-scale-purple" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#a855f7', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', textAlign: 'center' }}>{isEn ? 'TEST BOTTLENECK' : 'ZJISTIT BOTTLENECK'}</a>
                </div>
                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><Gamepad2 size={16} /> {isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `How many FPS will ${normalizeName(winner.name)} push in games?` : `Kolik FPS ti dá ${normalizeName(winner.name)} v oblíbených hrách?`}</p>
                    </div>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn hover-scale-cyan" style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)', color: '#66fcf1', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', textAlign: 'center' }}>{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div className="analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={24} color="#f59e0b" /> {isEn ? 'Performance Analysis' : 'Analýza výkonu'}</h2>
                <GuruGpuCompareText gpu1Name={normalizeName(gpuA.name)} gpu2Name={normalizeName(gpuB.name)} perfDiff={perfDiffForComponent} gpu1Vram={gpuA.vram_gb} gpu2Vram={gpuB.vram_gb} isEn={isEn} />
            </div>
        </section>

        {!isEn && (<div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}><HeurekaButtons isEn={false} manualSearch={winner.name} positionId="276026" /></div>)}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#ff0055' }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}</h2>
          <div className="table-wrapper">
               {[
                 { label: 'VRAM', valA: `${gpuA.vram_gb} GB`, valB: `${gpuB.vram_gb} GB`, winA: gpuA.vram_gb, winB: gpuB.vram_gb },
                 { label: 'TDP', valA: `${gpuA.tdp_w} W`, valB: `${gpuB.tdp_w} W`, winA: gpuA.tdp_w, winB: gpuB.tdp_w, lower: true },
                 { label: 'CLOCK', valA: `${gpuA.boost_clock_mhz} MHz`, valB: `${gpuB.boost_clock_mhz} MHz`, winA: gpuA.boost_clock_mhz, winB: gpuB.boost_clock_mhz }
               ].map((row, i) => (
                 <div key={i} className="spec-row-style">
                   <div className="spec-val-side" style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                   <div className="table-label">{row.label}</div>
                   <div className="spec-val-side" style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
                 </div>
               ))}
               <div className="ad-mobile-wrapper" style={{ padding: '20px 0' }}><SeznamAd zoneId={408651} width={300} height={250} /></div>
          </div>
        </section>

        <section className="massive-seo-hub" style={{ marginBottom: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>{isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}</h2>
            <div className="seo-hub-grid">
                <div className="hub-column">
                    <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                        <li><a href={isEn ? "/en/gpu-index" : "/gpu-index"}><ChevronRight size={16} /> {isEn ? 'Graphics Cards Database' : 'Katalog Grafických Karet'}</a></li>
                    </ul>
                </div>
                <div className="hub-column">
                    <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'Bottleneck Test' : 'Bottleneck Test'}</a></li>
                        <li><a href={isEn ? "/en/tipy" : "/tipy"}><ChevronRight size={16} /> {isEn ? 'GURU Tips' : 'GURU Tipy'}</a></li>
                    </ul>
                </div>
            </div>
        </section>

        {relatedArticles.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <h2 className="section-h2" style={{ borderLeftColor: '#a855f7' }}><Info size={28} color="#a855f7" /> {isEn ? 'GURU NEWS' : 'GURU NOVINKY'}</h2>
                <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {relatedArticles.map((art) => (
                        <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} className="related-card-style">
                            <div className="related-img-box"><img src={art.image_url} alt={art.title} loading="lazy" /></div>
                            <div className="related-content-box">
                                <span className="related-tag">{isEn ? 'TECH NEWS' : 'HW NOVINKA'}</span>
                                <h3 className="related-title-text">{isEn && art.title_en ? art.title_en : art.title}</h3>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        )}

        <div className="footer-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <SeznamAd zoneId={408654} width={970} height={90} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .engine-badge { display: inline-flex; align-items: center; gap: 8px; color: #ff0055; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; padding: 6px 16px; border: 1px solid rgba(255, 0, 85, 0.3); border-radius: 50px; background: rgba(255, 0, 85, 0.1); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #ff0055; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(255, 0, 85, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .guru-buy-winner-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 15px; text-transform: uppercase; transition: transform 0.3s ease; letter-spacing: 1px; color: #000; }
        .smarty-btn { background: #facc15; border: 2px solid #fef08a; }
        .heureka-btn { background: #3b82f6; color: #fff; border: 2px solid #60a5fa; }
        .amazon-btn { background: #f59e0b; border: 2px solid #fbbf24; }
        .tool-btn { display: block; width: 100%; box-sizing: border-box; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; border-radius: 16px; padding: 18px 30px; text-decoration: none; font-weight: 950; text-transform: uppercase; }
        .guru-support-btn { background: #eab308; color: #000; border-radius: 16px; padding: 18px 30px; text-decoration: none; font-weight: 950; text-transform: uppercase; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        @media (max-width: 768px) {
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .guru-grid-ring { grid-template-columns: 1fr !important; gap: 10px; }
            .vs-circle { margin: 10px auto; }
            .spec-row-style { flex-direction: column !important; gap: 10px; }
            .table-label { width: 100%; order: -1; }
            .seo-hub-grid { grid-template-columns: 1fr; }
        }
      `}} />

      <Script id="v10-hl-script" strategy="lazyOnload">
          {`
              if (typeof window !== 'undefined') {
                  document.addEventListener('click', function(e) {
                      const btn = e.target.closest('.v10-hl-btn, .v10-hl-container a, .v10-hl-container button');
                      if (btn) {
                          const container = e.target.closest('.v10-hl-container');
                          const subId = btn.getAttribute('data-subid') || (container ? container.getAttribute('data-subid') : 'unknown');
                          const cat = btn.getAttribute('data-cat') || (container ? container.getAttribute('data-cat') : 'gpu_duel');
                          const targetUrl = btn.href || (btn.tagName === 'A' ? btn.href : null);
                          
                          if (navigator.sendBeacon && targetUrl) {
                              navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: cat, sub_id: subId, page: window.location.pathname }));
                          }
                      }
                  });
              }
          `}
      </Script>
    </div>
  );
}
