import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, Zap, ArrowRight, Activity, ArrowUpCircle, LayoutList, 
  BarChart3, Gamepad2, Coins, CheckCircle2, Swords, Flame, Heart, 
  Monitor, ExternalLink, Info, HelpCircle
} from 'lucide-react';
import GuruGpuCompareText from '../../../components/GuruGpuCompareText'; // 🚀 GURU: Import SEO generátoru

/**
 * GURU GPU DUELS ENGINE - DETAIL V5.9 (UI REVERT & ULTRA SMART SEARCH)
 * 🚀 CÍL: Definitivní fix 404 chyb pomocí wildcard vyhledávání při zachování původního UI.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = true;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateStaticParams() {
  if (!supabaseUrl) return [];
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=slug&limit=1000`, {
          headers, next: { revalidate: 86400 }
      });
      if (!res.ok) return [];
      const duels = await res.json();
      return duels.map((duel) => ({ slug: duel.slug }));
  } catch (e) { return []; }
}

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  const performSearch = async (targetSlug, method = 'eq') => {
    // 🔥 GURU FIX: Supabase REST vyžaduje % pro ilike vyhledávání
    const filter = method === 'eq' ? `slug=eq.${targetSlug}` : `slug=ilike.%${targetSlug}%`;
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, { 
          headers, cache: 'no-store' 
        });
        if (res.ok) {
           const data = await res.json();
           if (data && data.length > 0) return data[0];
        }
    } catch (e) {}
    return null;
  };

  // 1. Přesná shoda
  let result = await performSearch(cleanSlug, 'eq');
  if (result) return result;

  // 2. Ořezaná shoda (bez výrobců)
  const vendorless = cleanSlug.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '');
  if (vendorless !== cleanSlug) {
      result = await performSearch(vendorless, 'eq');
      if (result) return result;
  }

  // 3. Agresivní fuzzy vyhledávání (wildcard %)
  result = await performSearch(vendorless, 'ilike');
  if (result) return result;

  // 4. Poslední záchrana - hledání podle názvu první GPU
  const firstPart = vendorless.split('-vs-')[0];
  if (firstPart) {
      result = await performSearch(firstPart, 'ilike');
  }
  
  return result;
});

const getRelatedArticles = async (gpuA_Name, gpuB_Name) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(gpuA_Name || '');
    const nameB = normalizeName(gpuB_Name || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%${encodeURIComponent(nameA)}%,title_en.ilike.%${encodeURIComponent(nameA)}%,title.ilike.%${encodeURIComponent(nameB)}%,title_en.ilike.%${encodeURIComponent(nameB)}%)&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
        let data = [];
        if (res.ok) data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
};

const getMoreDuels = async (currentSlug) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=title_cs,title_en,slug,slug_en&slug=neq.${currentSlug}&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
        if (res.ok) return await res.json();
        return [];
    } catch(e) { return []; }
};

export async function generateMetadata({ params }) {
  const { slug } = params; // 🛡️ FIX: params není Promise
  const duel = await getDuelData(slug);
  if (!duel || !duel.gpuA) return { title: 'GPU Comparison | Hardware Guru' };
  
  const isEn = slug?.startsWith('en-');
  const canonicalUrl = isEn ? `${baseUrl}/en/gpuvs/${duel.slug}` : `${baseUrl}/gpuvs/${duel.slug}`;
  return { 
    title: isEn ? `${duel.gpuA.name} vs ${duel.gpuB.name} – Gaming Benchmarks` : `Srovnání: ${duel.gpuA.name} vs ${duel.gpuB.name} – Výkon a Testy`,
    alternates: { canonical: canonicalUrl, languages: { 'en': `${baseUrl}/en/gpuvs/${duel.slug}`, 'cs': `${baseUrl}/gpuvs/${duel.slug}` } }
  };
}

export default async function GpuVsDetailPage({ params }) {
  const { slug } = params; // 🛡️ FIX: params není Promise
  const duel = await getDuelData(slug);
  
  if (!duel) notFound();

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const perfA = gpuA.performance_index || 1;
  const perfB = gpuB.performance_index || 1;
  const winner = perfA > perfB ? gpuA : gpuB;
  const loser = perfA > perfB ? gpuB : gpuA;
  const finalPerfDiff = Math.round((Math.max(perfA, perfB) / Math.min(perfA, perfB) - 1) * 100);
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

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '50px' }}>
            <div className="gpu-card" style={{ borderTop: `5px solid ${getVendorColor(gpuA.vendor)}`, background: 'rgba(15, 17, 21, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}>
                <span style={{ color: getVendorColor(gpuA.vendor), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: '10px' }} className="vendor-tag">{gpuA.vendor} GPU</span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0 0 15px 0' }} className="gpu-name-h2">{normalizeName(gpuA.name)}</h2>
                <a href={isEn ? `/en/gpu/${getSafeGpuSlug(gpuA)}` : `/gpu/${getSafeGpuSlug(gpuA)}`} className="entity-link" style={{ color: getVendorColor(gpuA.vendor), textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Activity size={12} /> {isEn ? 'View Profile' : 'Profil grafiky'}
                </a>
            </div>
            <div style={{ background: '#0a0b0d', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0055', border: '2px solid #ff0055', fontWeight: '950', fontSize: '24px' }} className="vs-circle">VS</div>
            <div className="gpu-card" style={{ borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, background: 'rgba(15, 17, 21, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}>
                <span style={{ color: getVendorColor(gpuB.vendor), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: '10px' }} className="vendor-tag">{gpuB.vendor} GPU</span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0 0 15px 0' }} className="gpu-name-h2">{normalizeName(gpuB.name)}</h2>
                <a href={isEn ? `/en/gpu/${getSafeGpuSlug(gpuB)}` : `/gpu/${getSafeGpuSlug(gpuB)}`} className="entity-link" style={{ color: getVendorColor(gpuB.vendor), textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Activity size={12} /> {isEn ? 'View Profile' : 'Profil grafiky'}
                </a>
            </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
            <div className="upgrade-banner" style={{ background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.1) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(102, 252, 241, 0.3)', padding: '30px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px' }} className="upgrade-label"><ArrowUpCircle size={16} /> {isEn ? 'UPGRADE ANALYSIS' : 'ANALÝZA UPGRADU'}</div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff', margin: '10px 0', textTransform: 'uppercase' }} className="upgrade-h3">{isEn ? `WORTH UPGRADING TO ${normalizeName(winner.name)}?` : `VYPLATÍ SE UPGRADE NA ${normalizeName(winner.name)}?`}</h3>
                    <p style={{ color: '#9ca3af', margin: 0 }} className="upgrade-p">{isEn ? `Find if switching from ${normalizeName(loser.name)} makes sense.` : `Zjisti, jestli dává přechod z ${normalizeName(loser.name)} smysl.`}</p>
                </div>
                <a href={isEn ? `/en/gpu-upgrade/${getSafeGpuSlug(loser)}-to-${getSafeGpuSlug(winner)}` : `/gpu-upgrade/${getSafeGpuSlug(loser)}-to-${getSafeGpuSlug(winner)}`} style={{ background: '#66fcf1', color: '#000', padding: '16px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }} className="guru-upgrade-btn">
                    {isEn ? 'CALCULATE' : 'SPOČÍTAT'} <ArrowRight size={20} />
                </a>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <div className="content-box-style" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase', borderLeft: '4px solid #ff0055', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }} className="section-h2-title"><Info size={28} color="#ff0055" /> {isEn ? 'In-Depth Analysis' : 'Hluboká Analýza'}</h2>
            <div className="guru-prose" style={{ color: '#d1d5db', fontSize: '1.1rem', lineHeight: '1.8' }}>
              <GuruGpuCompareText 
                  gpu1Name={normalizeName(gpuA.name)} 
                  gpu2Name={normalizeName(gpuB.name)} 
                  perfDiff={perfDiffForComponent} 
                  gpu1Vram={gpuA.vram_gb} 
                  gpu2Vram={gpuB.vram_gb} 
                  isEn={isEn} 
              />
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase', borderLeft: '4px solid #ff0055', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }} className="section-h2-title"><LayoutList size={28} color="#ff0055" /> {isEn ? 'SPECIFICATIONS' : 'PARAMETRY'}</h2>
          <div className="specs-table-container" style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
             {[
               { label: 'VRAM', valA: `${gpuA.vram_gb} GB`, valB: `${gpuB.vram_gb} GB`, winA: gpuA.vram_gb, winB: gpuB.vram_gb },
               { label: 'TDP', valA: `${gpuA.tdp_w} W`, valB: `${gpuB.tdp_w} W`, winA: gpuA.tdp_w, winB: gpuB.tdp_w, lower: true },
               { label: 'CLOCK', valA: `${gpuA.boost_clock_mhz} MHz`, valB: `${gpuB.boost_clock_mhz} MHz`, winA: gpuA.boost_clock_mhz, winB: gpuB.boost_clock_mhz }
             ].map((row, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="spec-row">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '16px' }} className="spec-val-left">{row.valA}</div>
                 <div style={{ width: '150px', textAlign: 'center', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase' }} className="spec-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }} className="spec-val-right">{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        <div className="global-cta-vs" style={{ marginTop: '80px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" style={{ flex: '1', maxWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '18px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff' }} className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
            <a href="/support" style={{ flex: '1', maxWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '18px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', background: '#eab308', color: '#000' }} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #ff0055; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(255, 0, 85, 0.3); transition: 0.3s; }
        
        @media (max-width: 768px) {
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
