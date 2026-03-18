import React from 'react';
import { 
  ChevronLeft, Trophy, Zap, Swords, Activity, Cpu, Medal, Monitor, Flame, ArrowRight, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

/**
 * GURU CPU RANKING V1.6 (ULTIMATE SEO & GOLDEN RICH RESULTS)
 * 🛡️ RULE: Vždy aplikovat Golden Rich Results a maximální prolinkování.
 * 🛡️ FIX: Next.js 15 Async Params Stability.
 * 🛡️ FIX: SiteNavigationElement pro každý řádek žebříčku.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => text?.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() || 'unknown';
const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export async function generateMetadata(props) {
  try { await props.params; } catch(e) {}
  const isEn = props?.isEn === true;
  return {
    title: isEn ? 'CPU Tier List & Performance Ranking 2026 | The Hardware Guru' : 'Žebříček procesorů a srovnání výkonu 2026 | The Hardware Guru',
    description: 'Ultimátní žebříček procesorů seřazený podle herního výkonu. Kompletní specifikace a benchmarky.',
    alternates: {
      canonical: `${baseUrl}/cpuvs/ranking`,
      languages: { 'en': `${baseUrl}/en/cpuvs/ranking`, 'cs': `${baseUrl}/cpuvs/ranking`, 'x-default': `${baseUrl}/cpuvs/ranking` }
    }
  };
}

const fetchRankingData = async () => {
    if (!supabaseUrl) return [];
    try {
        const url = `${supabaseUrl}/rest/v1/cpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        const res = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
};

export default async function CpuRankingPage(props) {
  try { await props.params; } catch(e) {}
  const isEn = props?.isEn === true;
  const cpus = await fetchRankingData();

  if (!cpus || cpus.length === 0) return <div style={{ color: '#fff', background: '#0a0b0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DATABASE OFFLINE</div>;

  // 🚀 GOLDEN RICH RESULTS
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "CPU Ranking" : "Žebříček procesorů", "item": `${baseUrl}/cpuvs/ranking` }
    ]
  };

  const navSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "CPU Tier List Navigation",
    "itemListElement": cpus.slice(0, 20).map((cpu, i) => ({
      "@type": "SiteNavigationElement",
      "position": i + 1,
      "name": cpu.name,
      "url": `${baseUrl}${isEn ? '/en' : ''}/cpu/${cpu.slug || slugify(cpu.name)}`
    }))
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(navSchema) }} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '8px 25px', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '50px', background: 'rgba(245,158,11,0.1)' }}>
            <Trophy size={18} /> GURU RANKING SYSTEM
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: 1.0 }}>
            {isEn ? 'CPU' : 'ŽEBŘÍČEK'} <span style={{ color: '#f59e0b', textShadow: '0 0 40px rgba(245,158,11,0.4)' }}>{isEn ? 'TIER LIST' : 'PROCESORŮ'}</span>
          </h1>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cpus.map((cpu, index) => {
            if (!cpu.name) return null;
            const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24';
            const safeSlug = cpu.slug || slugify(cpu.name);
            const isTop3 = index < 3;

            return (
              <Link key={cpu.id || index} href={isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`} className="ranking-card">
                 <div className="rank-num" style={{ color: isTop3 ? '#f59e0b' : '#4b5563' }}>{index + 1}.</div>
                 <div className="v-bar" style={{ backgroundColor: vendorColor }}></div>
                 <div style={{ flex: 1 }}>
                    <h2 className="cpu-title">{normalizeName(cpu.name)}</h2>
                    <div className="cpu-meta">{cpu.vendor} • {cpu.cores}/{cpu.threads} CORES • {cpu.boost_clock_mhz || 'N/A'} MHz</div>
                 </div>
                 <div className="score-box">
                    <div className="score-label">PERFORMANCE</div>
                    <div className="score-val" style={{ color: isTop3 ? '#f59e0b' : '#fff' }}>
                      <Zap size={18} fill={isTop3 ? '#f59e0b' : 'none'} /> {cpu.performance_index || '0'}
                    </div>
                 </div>
                 <ChevronRight size={20} className="arrow-icon" />
              </Link>
            );
          })}
        </div>

        {/* AGRESIVNÍ SILOING ROZCESTNÍK */}
        <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
           <Link href="/gpuvs/ranking" className="silo-card" style={{ borderLeft: '4px solid #66fcf1' }}>
              <Monitor size={32} color="#66fcf1" />
              <div><h4>ŽEBŘÍČEK GRAFIK</h4><p>Srovnání výkonu GPU</p></div>
           </Link>
           <Link href="/sitemap" className="silo-card" style={{ borderLeft: '4px solid #a855f7' }}>
              <Map size={32} color="#a855f7" />
              <div><h4>MAPA STRÁNEK</h4><p>Všechny sekce Guru</p></div>
           </Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .ranking-card { display: flex; align-items: center; background: rgba(15, 17, 21, 0.98); padding: 20px 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
        .ranking-card:hover { transform: translateX(10px); background: rgba(25, 27, 31, 1); border-color: rgba(245, 158, 11, 0.3); }
        .rank-num { width: 60px; font-size: 24px; font-weight: 950; }
        .v-bar { width: 4px; height: 50px; border-radius: 10px; margin-right: 25px; }
        .cpu-title { font-size: 1.4rem; font-weight: 950; margin: 0; text-transform: uppercase; }
        .cpu-meta { font-size: 11px; color: #6b7280; font-weight: 900; letter-spacing: 1px; margin-top: 5px; }
        .score-box { text-align: center; padding: 0 40px; border-left: 1px solid rgba(255,255,255,0.05); }
        .score-label { font-size: 9px; color: #6b7280; font-weight: 950; letter-spacing: 2px; }
        .score-val { font-size: 26px; font-weight: 950; display: flex; align-items: center; gap: 8px; }
        .arrow-icon { color: #4b5563; transition: 0.3s; }
        .ranking-card:hover .arrow-icon { color: #f59e0b; transform: translateX(5px); }
        .silo-card { background: rgba(15, 17, 21, 0.98); padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 20px; text-decoration: none; color: #fff; transition: 0.3s; }
        .silo-card:hover { transform: translateY(-5px); background: rgba(25, 27, 31, 1); }
        .silo-card h4 { margin: 0; font-weight: 950; text-transform: uppercase; }
        .silo-card p { margin: 5px 0 0 0; color: #6b7280; font-size: 13px; }
      `}} />
    </div>
  );
}
