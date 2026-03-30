import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
 ChevronLeft, ShieldCheck, Flame, Heart, Swords, Calendar,
 Trophy, Zap, Cpu, Activity, BarChart3, Gamepad2, LayoutList,
 TrendingUp, ArrowRight, ExternalLink, Info, ChevronRight
} from 'lucide-react';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; 
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU CPU DUELS ENGINE - DETAIL V76.2 (MOBILE OPTIMIZED + MASSIVE SEO HUB)
 * 🚀 CÍL: Maximální monetizace skrze Seznam Partner a eliminace dead-endů přidáním SEO hubu.
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
  if (firstPart) {
      result = await performSearch(firstPart, 'ilike');
  }
  
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

  let perfDiffForComponent = 0;
  if (hasPerfData) {
      perfDiffForComponent = cpuA.performance_index > cpuB.performance_index ? -perfDiff : perfDiff;
  }

  const upgradeUrl = perfWinner && perfLoser ? `/${isEn ? 'en/' : ''}cpu-upgrade/${slugify(perfLoser.name)}-to-${slugify(perfWinner.name)}` : null;
  const similar = await (cpuA?.id ? getSimilarDuels(cpuA.id, duel.slug) : Promise.resolve([]));
  const relatedArticles = await getRelatedArticles(cpuA.name, cpuB.name);

  return (
    <div className="guru-duel-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={backLink} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
          <a href={isEn ? '/en/cpuvs/ranking' : '/cpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'TIER LIST' : 'ŽEBŘÍČEK'}</a>
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
          
          {upgradeUrl && (
            <div style={{ marginTop: '25px' }}>
              <a href={upgradeUrl} className="guru-upgrade-pill">
                  <Zap size={14} fill="currentColor" /> {isEn ? `WORTH UPGRADING?` : `VYPLATÍ SE UPGRADE?`} <ArrowRight size={14} />
              </a>
            </div>
          )}
        </header>

        {/* 🔥 SEZNAM AD #1: TOP PLACEMENT (STRIKTNÍ SEPARACE) */}
        <div style={{ marginBottom: '40px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

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

        {/* 🔥 SEZNAM AD #2: MID PLACEMENT (STRIKTNÍ SEPARACE) */}
        <div style={{ marginBottom: '60px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
            <div className="analysis-card" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info size={24} color="#f59e0b" /> {isEn ? 'Performance Analysis' : 'Analýza výkonu'}
                </h2>
                <GuruCpuCompareText 
                    cpu1Name={normalizeName(cpuA.name)} 
                    cpu2Name={normalizeName(cpuB.name)} 
                    perfDiff={perfDiffForComponent} 
                    cpu1Cores={cpuA.cores} 
                    cpu2Cores={cpuB.cores} 
                    isEn={isEn} 
                />
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

        <section style={{ marginBottom: '60px' }}>
            <div className="bottleneck-cta" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK CHECK' : 'KONTROLA BOTTLENECKU'}</h3>
                    <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `Will your GPU handle the ${normalizeName((perfWinner || cpuA).name)}?` : `Bude tvá grafika stačit na procesor ${normalizeName((perfWinner || cpuA).name)}?`}</p>
                </div>
                <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} style={{ background: 'transparent', border: '2px solid #f59e0b', color: '#f59e0b', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase' }}>{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
            </div>
        </section>

        {/* 🚀 MASSIVE SEO HUB PRO ELIMINACI DEAD ENDU A BOUNCE RATE */}
        <section className="massive-seo-hub" style={{ marginBottom: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>
                {isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}
            </h2>
            <div className="seo-hub-grid">
                <div className="hub-column">
                    <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                        <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"}><ChevronRight size={16} /> {isEn ? 'Graphics Card Battles' : 'Souboje Grafických Karet'}</a></li>
                        <li><a href={isEn ? "/en/cpu-index" : "/cpu-index"}><ChevronRight size={16} /> {isEn ? 'Processor Database' : 'Katalog Procesorů'}</a></li>
                        <li><a href={isEn ? "/en/gpu-index" : "/gpu-index"}><ChevronRight size={16} /> {isEn ? 'Graphics Cards Database' : 'Katalog Grafických Karet'}</a></li>
                    </ul>
                </div>
                <div className="hub-column">
                    <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'Bottleneck Test' : 'Bottleneck Test'}</a></li>
                        <li><a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"}><ChevronRight size={16} /> {isEn ? 'Game Archive' : 'Archiv her'}</a></li>
                        <li><a href={isEn ? "/en/clanky" : "/clanky"}><ChevronRight size={16} /> {isEn ? 'News & Articles' : 'Články a Novinky'}</a></li>
                        <li><a href={isEn ? "/en/tipy" : "/tipy"}><ChevronRight size={16} /> {isEn ? 'GURU Tips' : 'GURU Tipy'}</a></li>
                    </ul>
                </div>
            </div>
        </section>

        {relatedArticles.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <h2 className="section-h2" style={{ borderLeftColor: '#a855f7' }}><Info size={28} color="#a855f7" /> {isEn ? 'GURU NEWS' : 'GURU NOVINKY'}</h2>
                <div className="articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
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

        {/* 🔥 SEZNAM AD #3: KONEC STRÁNKY (STRIKTNÍ SEPARACE) */}
        <div style={{ marginBottom: '40px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408658} width={480} height={300} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <div className="footer-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-block; }
        .guru-upgrade-pill { display: inline-flex; align-items: center; gap: 10px; padding: 12px 30px; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 50px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .cpu-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; flex: 1; }
        .vendor-label { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; display: block; }
        .cpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(255,0,85,0.6); color: #fff; z-index: 10; margin: 0 -15px; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .related-card-style { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; text-decoration: none; transition: 0.3s; }
        .related-img-box { height: 160px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .related-img-box img { width: 100%; height: 100%; object-fit: cover; }
        .related-content-box { padding: 20px; }
        .related-tag { color: #a855f7; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 10px; }
        .related-title-text { color: #fff; font-size: 1.1rem; font-weight: 950; margin: 0; line-height: 1.3; }

        /* 🚀 SEO HUB CSS */
        .seo-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .hub-column { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
        .hub-links-list { list-style: none; padding: 0; margin: 0; }
        .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 15px; font-weight: bold; transition: 0.3s; }
        .hub-links-list a:hover { color: #66fcf1; transform: translateX(10px); }

        .guru-deals-btn, .guru-support-btn { flex: 1; max-width: 300px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .guru-support-btn { background: #eab308; color: #000; }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-duel-wrapper { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-h1 { font-size: 1.8rem !important; }
            .guru-verdict { font-size: 14px; padding: 8px 15px; }
            .guru-grid-ring { grid-template-columns: 1fr !important; gap: 10px; }
            .cpu-box { padding: 25px 15px; }
            .vs-badge { margin: 10px auto; width: 50px; height: 50px; font-size: 18px; }
            .analysis-card { padding: 25px 15px !important; border-radius: 20px !important; }
            .spec-row-style { flex-direction: column !important; gap: 10px; padding: 15px 10px !important; }
            .table-label { width: 100%; }
            .spec-val-box { font-size: 16px !important; }
            .section-h2 { font-size: 1.4rem !important; }
            .bottleneck-cta { padding: 25px 15px !important; text-align: center; justify-content: center !important; }
            .guru-deals-btn, .guru-support-btn { max-width: 100% !important; }
            .seo-hub-grid { grid-template-columns: 1fr; }
            .hub-column { padding: 25px; }
        }
      `}} />
    </div>
  );
}
