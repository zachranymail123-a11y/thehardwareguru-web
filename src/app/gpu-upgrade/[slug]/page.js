import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { 
 ChevronLeft, Zap, ArrowRight, Activity, ArrowUpCircle, LayoutList, 
 BarChart3, Gamepad2, Coins, CheckCircle2, Swords, Flame, Heart, 
 Monitor, ExternalLink, Info, HelpCircle, Trophy, ShoppingCart, AlertTriangle
} from 'lucide-react';
import GuruGpuCompareText from '../../../components/GuruGpuCompareText';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU GPU UPGRADE ENGINE - DETAIL V121.6 (EN DETECTION + AMAZON + TOOLS)
 * 🚀 CÍL: Fix EN detekce, Amazon affiliate a kalkulačky hned nahoře.
 */

export const runtime = "nodejs";
export const revalidate = 0; 
export const dynamicParams = true;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateStaticParams() {
  if (!supabaseUrl) return [];
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=slug&limit=1000`, {
          headers: authHeaders, next: { revalidate: 86400 }
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
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'no-store' 
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.[0] || null;
  } catch { return null; }
});

const getRelatedArticles = async (gpuA_Name, gpuB_Name) => {
    if (!supabaseUrl) return [];
    const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(gpuA_Name || '');
    const nameB = normalizeName(gpuB_Name || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.*${encodeURIComponent(nameA)}*,title_en.ilike.*${encodeURIComponent(nameA)}*,title.ilike.*${encodeURIComponent(nameB)}*,title_en.ilike.*${encodeURIComponent(nameB)}*)&order=created_at.desc&limit=3`, { headers: authHeaders, cache: 'force-cache' });
        if (res.ok) return await res.json();
    } catch (e) { return []; }
};

const getMoreUpgrades = async (currentSlug) => {
    if (!supabaseUrl) return [];
    const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=title_cs,title_en,slug,slug_en&slug=neq.${currentSlug}&order=created_at.desc&limit=3`, { headers: authHeaders, cache: 'force-cache' });
        if (res.ok) return await res.json();
    } catch(e) { return []; }
};

export async function generateMetadata(props) {
  const resolvedParams = await props.params;
  const rawSlug = resolvedParams?.slug || '';
  const headersList = headers();
  const fullUrl = headersList.get('x-url') || headersList.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || rawSlug.startsWith('en-');
  const upgrade = await getUpgradeData(rawSlug);
  if (!upgrade || !upgrade.oldGpu) return { title: 'GPU Upgrade | Hardware Guru' };
  const { oldGpu, newGpu } = upgrade;
  const perfDiff = Math.round(((newGpu.performance_index / oldGpu.performance_index) - 1) * 100);
  return { title: isEn ? `Upgrade ${oldGpu.name} to ${newGpu.name} (+${perfDiff}% Perf)` : `Upgrade z ${oldGpu.name} na ${newGpu.name} (+${perfDiff} % výkonu)` };
}

export default async function GpuUpgradePage(props) {
  const resolvedParams = await props.params;
  const rawSlug = resolvedParams?.slug || '';
  const headersList = headers();
  const fullUrl = headersList.get('x-url') || headersList.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || rawSlug.startsWith('en-');

  const upgrade = await getUpgradeData(rawSlug);
  if (!upgrade) notFound();

  const { oldGpu: gpuA, newGpu: gpuB } = upgrade;
  const finalPerfDiff = Math.round(((gpuB.performance_index / gpuA.performance_index) - 1) * 100);
  const relatedArticles = await getRelatedArticles(gpuA.name, gpuB.name);
  const moreUpgrades = await getMoreUpgrades(upgrade.slug);

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const searchName = normalizeName(gpuB.name).trim();
  const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(searchName)}&tag=thehardware07-20`;
  const smartyLink = `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(searchName)}`)}`;
  const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(searchName)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

  return (
    <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="upgrade-badge"><ArrowUpCircle size={14} /> {isEn ? 'GURU UPGRADE ANALYSIS' : 'GURU ANALÝZA UPGRADU'}</div>
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

        {/* 🔥 AFFILIATE BOMB 🔥 */}
        <div className="affiliate-cta-grid" style={{ marginBottom: '40px', borderLeft: '4px solid #66fcf1' }}>
            <div className="affiliate-col">
                <div className="affiliate-col-title" style={{ color: '#66fcf1' }}><ShoppingCart size={16} /> {isEn ? `BUY ${normalizeName(gpuB.name)}` : `KOUPIT ${normalizeName(gpuB.name)}`}</div>
                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn"><ShoppingCart size={16} /> Check Price on Amazon</a>
                    ) : (
                        <>
                            <a href={smartyLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={16} /> Smarty.cz</a>
                            <a href={heurekaLink} data-trixam-positionid="276026" data-trixam-codetype="link" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link"><ShoppingCart size={16} /> Heureka.cz</a>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* 🔥 GURU TOOLS CTA (FPS + BOTTLENECK) - MOVED TO TOP 🔥 */}
        <section style={{ marginBottom: '40px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><AlertTriangle size={16} /> {isEn ? 'SYSTEM CHECK' : 'KONTROLA SYSTÉMU'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK CALCULATOR' : 'BOTTLENECK KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `Will your CPU handle the ${normalizeName(gpuB.name)}?` : `Bude tvůj procesor stačit na grafiku ${normalizeName(gpuB.name)}?`}</p>
                    </div>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn hover-scale-purple">{isEn ? 'TEST BOTTLENECK' : 'ZJISTIT BOTTLENECK'}</a>
                </div>
                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><Gamepad2 size={16} /> {isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `How many FPS will ${normalizeName(gpuB.name)} push in games?` : `Kolik FPS ti dá ${normalizeName(gpuB.name)} v oblíbených hrách?`}</p>
                    </div>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn hover-scale-cyan">{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div className="analysis-card" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info size={24} color="#66fcf1" /> {isEn ? 'Upgrade Analysis' : 'Analýza upgradu'}
                </h2>
                <GuruGpuCompareText gpu1Name={normalizeName(gpuA.name)} gpu2Name={normalizeName(gpuB.name)} perfDiff={finalPerfDiff} gpu1Vram={gpuA.vram_gb} gpu2Vram={gpuB.vram_gb} isEn={isEn} />
            </div>
        </section>

        {!isEn && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                <HeurekaButtons isEn={false} manualSearch={gpuB.name} positionId="276026" />
            </div>
        )}

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
          </div>
        </section>

        <div className="cta-row-upgrade" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="btn-guru deals"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href="/support" className="btn-guru support"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <SeznamAd zoneId={408654} width={970} height={90} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .upgrade-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 16px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.1); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .upgrade-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; border-top: 5px solid #374151; }
        .box-label { font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; display: block; margin-bottom: 10px; color: #6b7280; }
        .box-title { font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 950; color: #d1d5db; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .perf-gain { font-size: 16px; font-weight: 950; color: #66fcf1; margin-top: 10px; text-transform: uppercase; }
        .vs-badge { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; color: #66fcf1; border: 2px solid #66fcf1; background: #0a0b0d; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-val-side { flex: 1; font-size: 16px; }
        .spec-val-side:first-child { text-align: right; }
        .spec-val-side:last-child { text-align: left; }
        .table-label { width: 150px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
        .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; }
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }
        .btn-guru { flex: 1; max-width: 300px; padding: 18px; border-radius: 16px; font-weight: 950; text-transform: uppercase; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
        .btn-guru.deals { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .btn-guru.support { background: #eab308; color: #000; }
        .tool-btn { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; text-align: center; color: #fff; text-decoration: none; font-weight: 950; display: block; width: 100%; }
        .hover-scale-purple:hover { background: rgba(168, 85, 247, 0.2) !important; transform: translateY(-2px); }
        .hover-scale-cyan:hover { background: rgba(102, 252, 241, 0.2) !important; transform: translateY(-2px); }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        @media (max-width: 768px) {
            .guru-grid-ring { grid-template-columns: 1fr !important; }
            .vs-badge { margin: 10px auto; transform: rotate(90deg); width: 50px; height: 50px; }
            .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
            .guru-buy-winner-btn { max-width: 100%; width: 100%; }
            .cta-row-upgrade { flex-direction: column; }
            .btn-guru { max-width: 100%; }
        }
      `}} />
    </div>
  );
}
