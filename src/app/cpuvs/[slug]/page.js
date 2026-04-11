import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
 ChevronLeft, ShieldCheck, Flame, Heart, Swords, Calendar,
 Trophy, Zap, Cpu, Activity, BarChart3, Gamepad2, LayoutList,
 TrendingUp, ArrowRight, ExternalLink, Info, ChevronRight, ShoppingCart, AlertTriangle
} from 'lucide-react';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; 
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU CPU DUELS ENGINE - DETAIL V76.10 (DEFINITIVE HEUREKA 404 FIX)
 * 🚀 CÍL: Fix Heureka linků na www.heureka.cz s parametrem h[fraze] + Amazon pro EN.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = true;

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl) return [];
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=slug&limit=10000`, {
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

const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/Intel |AMD |Ryzen |Core /gi, '');

const getRelatedArticles = async (cpuA, cpuB) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(cpuA || '');
    const nameB = normalizeName(cpuB || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.*${encodeURIComponent(nameA)}*,title.ilike.*${encodeURIComponent(nameB)}*)&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
        const data = await res.json();
        if (!data || data.length === 0) {
            const resLatest = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&type=eq.hardware&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
            return await resLatest.json();
        }
        return data;
    } catch (e) { return []; }
};

const getSimilarDuels = async (cpuId, currentSlug) => {
    if (!supabaseUrl || !cpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=title_cs,title_en,slug,slug_en&or=(cpu_a_id.eq.${cpuId},cpu_b_id.eq.${cpuId})&slug=neq.${currentSlug}&limit=4`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'force-cache' });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,cpuA:cpus!cpu_a_id(*),cpuB:cpus!cpu_b_id(*)`;

  const performSearch = async (targetSlug, method = 'eq') => {
    const filter = method === 'eq' ? `slug=eq.${targetSlug}` : `slug=ilike.*${targetSlug}*`;
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, { 
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, 
          cache: 'no-store' 
        });
        if (res.ok) {
           const data = await res.json();
           if (data && data.length > 0) return data[0];
        }
    } catch (e) {}
    return null;
  };

  let result = await performSearch(cleanSlug, 'eq');
  if (result) return result;
  const vendorlessSlug = cleanSlug.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '');
  if (vendorlessSlug !== cleanSlug) {
      result = await performSearch(vendorlessSlug, 'eq');
      if (result) return result;
  }
  result = await performSearch(vendorlessSlug, 'ilike');
  if (result) return result;
  const firstPart = vendorlessSlug.split('-vs-')[0];
  if (firstPart) { result = await performSearch(firstPart, 'ilike'); }
  return result;
});

export async function generateMetadata(props) {
  const { slug } = props.params;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | The Hardware Guru' };
  const isEn = slug?.startsWith('en-');
  const { cpuA, cpuB } = duel;
  const canonicalUrl = `${baseUrl}/cpuvs/${duel.slug}`;
  return { 
    title: isEn ? `${cpuA.name} vs ${cpuB.name} | The Hardware Guru` : `${cpuA.name} vs ${cpuB.name} | The Hardware Guru`,
    alternates: { canonical: canonicalUrl, languages: { "en": `${baseUrl}/en/cpuvs/${(duel.slug_en || `en-${duel.slug}`).replace(/^en-en-/,'en-')}`, "cs": canonicalUrl } }
  };
}

export default async function CpuDuelDetail(props) {
  const { slug } = props.params;
  const duel = await getDuelData(slug);
  if (!duel) notFound();

  const isEn = slug?.startsWith('en-');
  const { cpuA, cpuB } = duel;
  const backLink = isEn ? '/en/cpuvs' : '/cpuvs';
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(duel.created_at || Date.now()));
  
  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'INTEL' ? '#0071c5' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const hasPerfData = cpuA.performance_index > 0 && cpuB.performance_index > 0;
  let perfWinner = null, perfLoser = null, perfDiff = 0;
  if (hasPerfData) {
    if (cpuA.performance_index > cpuB.performance_index) {
      perfWinner = cpuA; perfLoser = cpuB;
      perfDiff = Math.round(((cpuA.performance_index / cpuB.performance_index) - 1) * 100);
    } else if (cpuB.performance_index > cpuA.performance_index) {
      perfWinner = cpuB; perfLoser = cpuA;
      perfDiff = Math.round(((cpuB.performance_index / cpuA.performance_index) - 1) * 100);
    }
  }

  const upgradeUrl = perfWinner && perfLoser ? `/${isEn ? 'en/' : ''}cpu-upgrade/${slugify(perfLoser.name)}-to-${slugify(perfWinner.name)}` : null;
  const similar = await (cpuA?.id ? getSimilarDuels(cpuA.id, duel.slug) : Promise.resolve([]));
  const relatedArticles = await getRelatedArticles(cpuA.name, cpuB.name);

  // 🔥 VÝPOČET DYNAMICKÝCH AFFILIATE ODKAZŮ PRO VÍTĚZE 🔥
  const winnerName = perfWinner ? perfWinner.name : cpuA.name;
  const searchName = normalizeName(winnerName).trim();
  const encodedQuery = encodeURIComponent(searchName);
  
  const smartyAffiliateLink = `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodedQuery}`)}`;
  
  // 🔥 DEFINITIVNÍ FIX DLE TVÝCH SCREENŮ 🔥
  const heurekaAffiliateLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodedQuery}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=CpuVsDetail`;
  
  const amazonAffiliateLink = `https://www.amazon.com/s?k=${encodedQuery}&tag=thehardware07-20`;

  return (
    <div className="guru-duel-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={backLink} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
          <a href={isEn ? '/en/cpuvs/ranking' : '/cpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'TIER LIST' : 'ŽEBŘÍČEK'}</a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}><Swords size={16} /> ELITNÍ SOUBOJ</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formattedDate}</span>
          </div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', lineHeight: '1.1', margin: '0' }}>
            {cpuA.name} <span style={{ color: '#ff0055' }}>vs</span> {cpuB.name}
          </h1>
          {perfWinner && <div className="guru-verdict">{perfWinner.name} {isEn ? 'is about' : 'je přibližně'} <strong>{perfDiff}%</strong> {isEn ? 'faster in games' : 'výkonnější ve hrách'}</div>}
          
          <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            {isEn ? (
                <a href={amazonAffiliateLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn"><ShoppingCart size={20} /> CHECK PRICE ON AMAZON</a>
            ) : (
                <>
                    <a href={smartyAffiliateLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={20} /> Smarty.cz</a>
                    <a href={heurekaAffiliateLink} data-trixam-positionid="276027" data-trixam-codetype="link" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link"><ShoppingCart size={20} /> Heureka.cz</a>
                </>
            )}
          </div>

          {upgradeUrl && (
            <div style={{ marginTop: '35px' }}>
              <a href={upgradeUrl} className="guru-upgrade-pill"><Zap size={14} fill="currentColor" /> {isEn ? `WORTH UPGRADING?` : `VYPLATÍ SE UPGRADE?`} <ArrowRight size={14} /></a>
            </div>
          )}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div className="cpu-box" style={{ borderTop: `5px solid ${getVendorColor(cpuA.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(cpuA.vendor) }}>{cpuA.vendor}</span>
                <h2 className="cpu-name-text">{normalizeName(cpuA.name)}</h2>
            </div>
            <div className="vs-badge">VS</div>
            <div className="cpu-box" style={{ borderTop: `5px solid ${getVendorColor(cpuB.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(cpuB.vendor) }}>{cpuB.vendor}</span>
                <h2 className="cpu-name-text">{normalizeName(cpuB.name)}</h2>
            </div>
        </div>

        <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <section style={{ marginBottom: '60px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><AlertTriangle size={16} /> {isEn ? 'SYSTEM CHECK' : 'KONTROLA SYSTÉMU'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK CALCULATOR' : 'BOTTLENECK KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `Will your GPU handle the ${normalizeName((perfWinner || cpuA).name)}?` : `Bude tvá grafika stačit na procesor ${normalizeName((perfWinner || cpuA).name)}?`}</p>
                    </div>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#a855f7', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', textAlign: 'center' }} className="tool-btn hover-scale-purple">{isEn ? 'TEST BOTTLENECK' : 'ZJISTIT BOTTLENECK'}</a>
                </div>
                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><Gamepad2 size={16} /> {isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `How many FPS will ${normalizeName((perfWinner || cpuA).name)} push in games?` : `Kolik FPS ti dá ${normalizeName((perfWinner || cpuA).name)} v oblíbených hrách?`}</p>
                    </div>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)', color: '#66fcf1', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', textAlign: 'center' }} className="tool-btn hover-scale-cyan">{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div className="analysis-card" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={24} color="#f59e0b" /> {isEn ? 'Performance Analysis' : 'Analýza výkonu'}</h2>
                <GuruCpuCompareText cpu1Name={normalizeName(cpuA.name)} cpu2Name={normalizeName(cpuB.name)} perfDiff={cpuA.performance_index > cpuB.performance_index ? -perfDiff : perfDiff} cpu1Cores={cpuA.cores} cpu2Cores={cpuB.cores} isEn={isEn} />
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#66fcf1' }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}</h2>
          <div className="table-wrapper">
                {[
                  { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
                  { label: 'BOOST CLOCK', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz`, winA: cpuA.boost_clock_mhz, winB: cpuB.boost_clock_mhz },
                  { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W`, winA: cpuA.tdp_w, winB: cpuB.tdp_w, lower: true }
                ].map((row, i) => (
                  <div key={i} className="spec-row-style">
                    <div className="spec-val-box" style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                    <div className="table-label">{row.label}</div>
                    <div className="spec-val-box" style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
                  </div>
                ))}
          </div>
        </section>

        {!isEn && (<div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}><HeurekaButtons isEn={false} /></div>)}

        <section className="massive-seo-hub" style={{ marginBottom: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>{isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}</h2>
            <div className="seo-hub-grid">
                <div className="hub-column">
                    <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                        <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"}><ChevronRight size={16} /> {isEn ? 'Graphics Card Battles' : 'Souboje Grafických Karet'}</a></li>
                    </ul>
                </div>
                <div className="hub-column">
                    <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'Bottleneck Test' : 'Bottleneck Test'}</a></li>
                        <li><a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"}><ChevronRight size={16} /> {isEn ? 'Game Archive' : 'Archiv her'}</a></li>
                    </ul>
                </div>
            </div>
        </section>

        <div className="footer-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
          <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-block; }
        @keyframes pulse-smarty { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
        @keyframes pulse-heureka { 0% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 120, 212, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0); } }
        .guru-buy-winner-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 15px; text-transform: uppercase; transition: transform 0.3s ease; letter-spacing: 1px; color: #000; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); border: 2px solid #fef08a; animation: pulse-smarty 2s infinite; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; animation: pulse-heureka 2s infinite; animation-delay: 1s; }
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: 2px solid #fbbf24; }
        .cpu-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; flex: 1; }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 5px solid #0f1115; color: #fff; z-index: 10; margin: 0 -15px; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .seo-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .hub-column { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
        .hub-links-list { list-style: none; padding: 0; }
        .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 15px; font-weight: bold; transition: 0.3s; }
        .hub-links-list a:hover { color: #66fcf1; transform: translateX(10px); }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        @media (max-width: 768px) {
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .guru-grid-ring { grid-template-columns: 1fr !important; gap: 10px; }
            .vs-badge { margin: 10px auto; }
            .spec-row-style { flex-direction: column !important; gap: 10px; }
            .table-label { width: 100%; order: -1; }
            .seo-hub-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}
