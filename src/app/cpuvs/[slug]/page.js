import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Swords, 
  Calendar,
  Trophy,
  Zap,
  Cpu,
  Activity,
  BarChart3,
  Gamepad2,
  LayoutList,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; // 🚀 GURU: SEO generátor

/**
 * GURU CPU DUELS ENGINE - DETAIL V75.2 (BACKUP DESIGN + SMART SEARCH)
 * 🚀 CÍL: Návrat k tvému originálnímu UI + definitivní fix 404 chyb.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = true;

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl) return [];
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=slug&limit=1000`, {
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

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,cpuA:cpus!cpu_a_id(*,cpu_game_fps!cpu_id(*)),cpuB:cpus!cpu_b_id(*,cpu_game_fps!cpu_id(*))`;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  const performSearch = async (targetSlug, method = 'eq') => {
    const filter = method === 'eq' ? `slug=eq.${targetSlug}` : `slug=ilike.%${targetSlug}%`;
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, { 
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

  // 2. Ořezaná shoda (bez amd-/intel-)
  const vendorless = cleanSlug.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '');
  if (vendorless !== cleanSlug) {
      result = await performSearch(vendorless, 'eq');
      if (result) return result;
  }

  // 3. Agresivní fuzzy vyhledávání (Supabase % wildcard)
  result = await performSearch(vendorless, 'ilike');
  return result;
});

const getRelatedArticles = async (cpuA, cpuB) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(cpuA || '');
    const nameB = normalizeName(cpuB || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%${encodeURIComponent(nameA)}%,title.ilike.%${encodeURIComponent(nameB)}%)&order=created_at.desc&limit=3`, { headers, cache: 'force-cache' });
        const data = await res.json();
        return Array.isArray(data) ? data : [];
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

export async function generateMetadata({ params }) {
  const { slug } = params; // FIX: params není Promise
  const duel = await getDuelData(slug);
  if (!duel) return { title: 'CPU Comparison | The Hardware Guru' };
  const isEn = slug?.startsWith('en-');
  const canonicalUrl = `${baseUrl}/cpuvs/${duel.slug}`;
  return { 
    title: isEn ? `${duel.cpuA.name} vs ${duel.cpuB.name} | The Hardware Guru` : `${duel.cpuA.name} vs ${duel.cpuB.name} | The Hardware Guru`,
    alternates: { canonical: canonicalUrl, languages: { "en": `${baseUrl}/en/cpuvs/${duel.slug}`, "cs": canonicalUrl } }
  };
}

export default async function CpuDuelDetail({ params }) {
  const { slug } = params; // FIX: params není Promise
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={backLink} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
          <a href={isEn ? '/en/cpuvs/ranking' : '/cpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'CPU TIER LIST' : 'ŽEBŘÍČEK PROCESORŮ'}</a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}><Swords size={16} /> ELITNÍ SOUBOJ</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formattedDate}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', lineHeight: '1.1', margin: '0' }}>
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

        <div className="guru-vs-ad-slot">
             <span className="ad-label">Advertisement</span>
             <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
             <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
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

        <div className="guru-vs-ad-slot">
             <span className="ad-label">Sponsored Performance Analysis</span>
             <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
             <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                   <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                   <div className="table-label">{row.label}</div>
                   <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
                 </div>
               ))}
          </div>
        </section>

        {relatedArticles.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <h2 className="section-h2" style={{ borderLeftColor: '#a855f7' }}><Info size={28} color="#a855f7" /> {isEn ? 'GURU NEWS' : 'GURU NOVINKY'}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
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

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-block; }
        .guru-upgrade-pill { display: inline-flex; align-items: center; gap: 10px; padding: 12px 30px; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 50px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-vs-ad-slot { margin: 30px 0; padding: 15px; background: rgba(102, 252, 241, 0.03); border: 1px solid rgba(102, 252, 241, 0.1); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }
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
        .guru-deals-btn, .guru-support-btn { flex: 1; max-width: 300px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .guru-support-btn { background: #eab308; color: #000; }
        @media (max-width: 768px) {
            .ad-desktop { display: none; } .ad-mobile { display: block; }
            .guru-grid-ring { grid-template-columns: 1fr !important; }
            .vs-badge { margin: 10px auto; }
            .spec-row-style { flex-direction: column !important; gap: 10px; padding: 15px 10px !important; }
            .table-label { width: 100%; }
        }
      `}} />
    </div>
  );
}
