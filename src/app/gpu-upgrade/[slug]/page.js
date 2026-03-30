import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
 ChevronLeft, Zap, ArrowRight, Activity, ArrowUpCircle, LayoutList, 
 BarChart3, Gamepad2, Coins, CheckCircle2, Swords, Flame, Heart, 
 Monitor, ExternalLink, Info, HelpCircle, Trophy
} from 'lucide-react';
import GuruGpuCompareText from '../../../components/GuruGpuCompareText';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU GPU UPGRADE ENGINE - DETAIL V121.2 (MONEY FIX UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchoru, eliminace hluchých míst.
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
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=slug&limit=1000`, {
          headers, next: { revalidate: 86400 }
      });
      if (!res.ok) return [];
      const upgrades = await res.json();
      return upgrades.map((upg) => ({ slug: upg.slug }));
  } catch (e) { return []; }
}

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

const getUpgradeData = cache(async (rawSlug) => {
  if (!supabaseUrl || !rawSlug) return null;

  const cleanSlug = rawSlug.replace(/^en-/, '');
  const selectQuery = `*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))`;

  const performSearch = async (filterStr) => {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&${filterStr}&limit=1`,
        {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          cache: 'no-store' 
        }
      );

      if (!res.ok) return null;
      const data = await res.json();
      return data?.[0] || null;
    } catch {
      return null;
    }
  };

  let result = await performSearch(`slug=eq.${cleanSlug}`);
  if (result) return result;

  const parts = cleanSlug.split('-to-');
  if (parts.length === 2) {
      const cleanPart = (p) => p.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '').replace(/-[0-9]+gb/gi, '').trim();
      const p1 = cleanPart(parts[0]);
      const p2 = cleanPart(parts[1]);
      
      if (p1 && p2) {
          result = await performSearch(`and=(slug.ilike.*${p1}*,slug.ilike.*${p2}*)`);
          if (result) return result;
      }
      
      if (p1) {
          result = await performSearch(`slug=ilike.*${p1}*`);
      }
  }

  return result;
});

const getRelatedArticles = async (gpuA_Name, gpuB_Name) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(gpuA_Name || '');
    const nameB = normalizeName(gpuB_Name || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.*${encodeURIComponent(nameA)}*,title_en.ilike.*${encodeURIComponent(nameA)}*,title.ilike.*${encodeURIComponent(nameB)}*,title_en.ilike.*${encodeURIComponent(nameB)}*)&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
        let data = [];
        if (res.ok) data = await res.json();
        if (!data || data.length === 0) {
            const resLatest = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&type=eq.hardware&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
            if (resLatest.ok) data = await resLatest.json();
        }
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
};

const getMoreUpgrades = async (currentSlug) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=title_cs,title_en,slug,slug_en&slug=neq.${currentSlug}&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
        if (res.ok) return await res.json();
        return [];
    } catch(e) { return []; }
};

export async function generateMetadata(props) {
  const { slug } = await props.params; 
  const rawSlug = slug || '';
  const isEn = rawSlug.startsWith('en-');
  const upgrade = await getUpgradeData(rawSlug);
  if (!upgrade || !upgrade.oldGpu) return { title: 'GPU Upgrade | Hardware Guru' };
  
  const { oldGpu, newGpu } = upgrade;
  const perfDiff = Math.round(((newGpu.performance_index / oldGpu.performance_index) - 1) * 100);
  return { 
    title: isEn ? `Upgrade ${oldGpu.name} to ${newGpu.name} (+${perfDiff}% Perf)` : `Upgrade z ${oldGpu.name} na ${newGpu.name} (+${perfDiff} % výkonu)`
  };
}

export default async function GpuUpgradePage(props) {
  const { slug } = await props.params; 
  const rawSlug = slug || '';
  const isEn = rawSlug.startsWith('en-');
  const upgrade = await getUpgradeData(rawSlug);
  
  if (!upgrade) notFound();

  const { oldGpu: gpuA, newGpu: gpuB } = upgrade;
  const finalPerfDiff = Math.round(((gpuB.performance_index / gpuA.performance_index) - 1) * 100);

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const relatedArticles = await getRelatedArticles(gpuA.name, gpuB.name);
  const moreUpgrades = await getMoreUpgrades(upgrade.slug);

  return (
    <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="upgrade-badge">
            <ArrowUpCircle size={14} /> GURU UPGRADE ANALYSIS
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span className="title-prefix" style={{ color: '#6b7280', fontSize: '0.6em', display: 'block', marginBottom: '10px' }}>{isEn ? 'UPGRADING FROM' : 'UPGRADE Z'}</span>
            {normalizeName(gpuA.name)} <br/>
            <span className="title-mid" style={{ color: '#66fcf1', fontSize: '0.6em', display: 'block', margin: '15px 0 10px 0' }}>{isEn ? 'TO' : 'NA'}</span>
            {normalizeName(gpuB.name)}
          </h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="upgrade-box current-box" style={{ opacity: 0.7 }}>
                <span className="box-label">{isEn ? 'CURRENT' : 'STÁVAJÍCÍ'}</span>
                <h2 className="box-title">{normalizeName(gpuA.name)}</h2>
            </div>
            <div className="vs-badge">➜</div>
            <div className="upgrade-box target-box" style={{ borderTopColor: '#66fcf1', boxShadow: '0 0 40px rgba(102, 252, 241, 0.2)' }}>
                <span className="box-label" style={{ color: '#66fcf1' }}>{isEn ? 'NEW UPGRADE' : 'NOVÝ UPGRADE'}</span>
                <h2 className="box-title">{normalizeName(gpuB.name)}</h2>
                <div className="perf-gain">+{finalPerfDiff}% {isEn ? 'PERF' : 'VÝKONU'}</div>
            </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
            <div className="analysis-card" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info size={24} color="#66fcf1" /> {isEn ? 'Upgrade Analysis' : 'Analýza upgradu'}
                </h2>
                <GuruGpuCompareText 
                    gpu1Name={normalizeName(gpuA.name)} 
                    gpu2Name={normalizeName(gpuB.name)} 
                    perfDiff={finalPerfDiff} 
                    gpu1Vram={gpuA.vram_gb} 
                    gpu2Vram={gpuB.vram_gb} 
                    isEn={isEn} 
                />
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#66fcf1' }}><LayoutList size={28} /> {isEn ? 'UPGRADE SPECIFICATIONS' : 'POROVNÁNÍ PARAMETRŮ'}</h2>
          <div className="table-wrapper">
              {[
                { label: 'VRAM', valA: `${gpuA.vram_gb} GB`, valB: `${gpuB.vram_gb} GB`, winA: gpuA.vram_gb, winB: gpuB.vram_gb },
                { label: 'CLOCK', valA: `${gpuA.boost_clock_mhz} MHz`, valB: `${gpuB.boost_clock_mhz} MHz`, winA: gpuA.boost_clock_mhz, winB: gpuB.boost_clock_mhz },
                { label: 'TDP', valA: `${gpuA.tdp_w} W`, valB: `${gpuB.tdp_w} W`, winA: gpuA.tdp_w, winB: gpuB.tdp_w, lower: true }
              ].map((row, i) => (
                <div key={i} className="spec-row-style">
                  <div style={getWinnerStyle(row.winA, row.winB, row.lower)} className="spec-val-side">{row.valA}</div>
                  <div className="table-label">{row.label}</div>
                  <div style={getWinnerStyle(row.winB, row.winA, row.lower)} className="spec-val-side">{row.valB}</div>
                </div>
              ))}

              {[
                { label: 'ARCHITECTURE', valA: gpuA.architecture, valB: gpuB.architecture },
                { label: 'RELEASE YEAR', valA: new Date(gpuA.release_date).getFullYear(), valB: new Date(gpuB.release_date).getFullYear() }
              ].map((row, i) => (
                <div key={i+10} className="spec-row-style">
                  <div className="spec-val-side">{row.valA}</div>
                  <div className="table-label">{row.label}</div>
                  <div className="spec-val-side" style={{ color: '#66fcf1' }}>{row.valB}</div>
                </div>
              ))}
          </div>
        </section>

        {relatedArticles.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <h2 className="section-h2" style={{ borderLeftColor: '#a855f7' }}><Info size={28} color="#a855f7" /> {isEn ? 'RELATED NEWS' : 'SOUVISEJÍCÍ NOVINKY'}</h2>
                <div className="related-grid-upgrade">
                    {relatedArticles.map(art => (
                        <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} className="rel-card">
                            <img src={art.image_url} alt={art.title} />
                            <div className="rel-content"><h3>{isEn && art.title_en ? art.title_en : art.title}</h3></div>
                        </a>
                    ))}
                </div>
            </section>
        )}

        {moreUpgrades.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <h2 className="section-h2" style={{ borderLeftColor: '#66fcf1' }}><ArrowUpCircle size={28} color="#66fcf1" /> {isEn ? 'OTHER UPGRADES' : 'DALŠÍ UPGRADY'}</h2>
                <div className="more-upg-grid">
                    {moreUpgrades.map(upg => (
                        <a key={upg.slug} href={isEn ? `/en/gpu-upgrade/${upg.slug_en || upg.slug}` : `/gpu-upgrade/${upg.slug}`} className="silo-link">
                            <span>{isEn && upg.title_en ? upg.title_en : upg.title_cs}</span>
                            <ArrowRight size={16} color="#66fcf1" />
                        </a>
                    ))}
                </div>
            </section>
        )}

        <div className="cta-row-upgrade">
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="btn-guru deals"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href="/support" className="btn-guru support"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .upgrade-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 16px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.1); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        
        .upgrade-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; border-top: 5px solid #374151; }
        .box-label { font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; display: block; margin-bottom: 10px; color: #6b7280; }
        .box-title { font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 950; color: #d1d5db; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .perf-gain { font-size: 16px; font-weight: 950; color: #66fcf1; margin-top: 10px; text-transform: uppercase; }
        .vs-badge { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; color: #66fcf1; border: 2px solid #66fcf1; background: #0a0b0d; }

        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-val-side { flex: 1; font-size: 16px; }
        .spec-val-side:first-child { text-align: right; }
        .spec-val-side:last-child { text-align: left; }
        .table-label { width: 150px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }

        .related-grid-upgrade { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .rel-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; text-decoration: none; transition: 0.3s; }
        .rel-card:hover { transform: translateY(-5px); border-color: #a855f7; }
        .rel-card img { width: 100%; height: 160px; object-fit: cover; }
        .rel-content { padding: 20px; }
        .rel-content h3 { color: #fff; font-size: 1rem; font-weight: 950; margin: 0; }

        .more-upg-grid { display: grid; gap: 10px; }
        .silo-link { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 15px 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; transition: 0.3s; font-weight: 900; text-transform: uppercase; font-size: 13px; }
        .silo-link:hover { background: rgba(255,255,255,0.05); transform: translateX(5px); color: #fff; }

        .cta-row-upgrade { display: flex; gap: 20px; justify-content: center; margin-top: 50px; }
        .btn-guru { flex: 1; max-width: 300px; padding: 18px; border-radius: 16px; font-weight: 950; text-transform: uppercase; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
        .btn-guru.deals { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .btn-guru.support { background: #eab308; color: #000; }
        .btn-guru:hover { filter: brightness(1.1); transform: scale(1.02); }

        /* 🔥 STICKY BOTTOM ANCHOR CSS */
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

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-upgrade-wrapper { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.6rem !important; }
            .guru-grid-ring { grid-template-columns: 1fr !important; gap: 10px; }
            .upgrade-box { padding: 25px 15px !important; border-radius: 20px !important; }
            .vs-badge { margin: 10px auto; transform: rotate(90deg); width: 50px; height: 50px; font-size: 20px; }
            .analysis-card { padding: 25px 15px !important; border-radius: 20px !important; }
            .section-h2 { font-size: 1.4rem !important; }
            .spec-row-style { padding: 15px 10px; }
            .table-label { width: 100px; }
            .spec-val-side { font-size: 14px; }
            .cta-row-upgrade { flex-direction: column; gap: 15px; }
            .btn-guru { max-width: 100%; }
        }
      `}} />
    </div>
  );
}
