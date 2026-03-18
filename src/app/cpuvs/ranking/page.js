import React from 'react';
import { 
  ChevronLeft, Trophy, Zap, Swords, Activity, Cpu, Medal, Monitor, Flame, ArrowRight 
} from 'lucide-react';

/**
 * GURU CPU ENGINE - TIER LIST & RANKING V1.4 (NEXT.js 15 STABILITY FIX)
 * 🛡️ FIX: Kompletní ošetření asynchronních props pro Next.js 15 (odstranění Digest chyb).
 * 🛡️ FIX: Robustní fetch s fallbackem pro Supabase.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text?.toLowerCase()
    .replace(/processor|cpu/gi, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim() || '';
};

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export async function generateMetadata(props) {
  // 🛡️ NEXT.js 15 FIX: Params musí být awaitnuty, i když je nepoužíváš přímo
  await props.params; 
  const isEn = props?.isEn === true;

  return {
    title: isEn 
      ? 'CPU Tier List & Performance Ranking 2026 | The Hardware Guru' 
      : 'Žebříček procesorů a absolutní srovnání výkonu | The Hardware Guru',
    description: isEn
      ? 'Ultimate CPU benchmark tier list. All modern processors ranked by raw gaming and productivity performance.'
      : 'Ultimátní žebříček procesorů. Všechny moderní procesory seřazené podle hrubého herního a pracovního výkonu.',
    alternates: {
      canonical: 'https://thehardwareguru.cz/cpuvs/ranking',
      languages: {
        'en': 'https://thehardwareguru.cz/en/cpuvs/ranking',
        'cs': 'https://thehardwareguru.cz/cpuvs/ranking',
        'x-default': 'https://thehardwareguru.cz/cpuvs/ranking'
      }
    }
  };
}

const fetchRankingData = async () => {
    if (!supabaseUrl) return [];
    try {
        const url = `${supabaseUrl}/rest/v1/cpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        const res = await fetch(url, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
};

export default async function CpuRankingPage(props) {
  // 🛡️ NEXT.js 15 FIX: Ošetření asynchronních props
  await props.params;
  const isEn = props?.isEn === true;
  
  const cpus = await fetchRankingData();

  if (!cpus || cpus.length === 0) {
    return (
      <div style={{ color: '#f43f5e', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontWeight: '950' }}>DATABÁZE OFFLINE</h1>
        <p>Guru právě ladí spojení se serverem...</p>
      </div>
    );
  }

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'INTEL' ? '#0071c5' : (v === 'AMD' ? '#ed1c24' : '#f59e0b');
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={28} color="#f59e0b" />;
    if (index === 1) return <Medal size={24} color="#d1d5db" />;
    if (index === 2) return <Medal size={24} color="#b45309" />;
    return <span className="rank-text" style={{ fontSize: '22px', fontWeight: '950', color: '#4b5563' }}>{index + 1}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU BATTLES' : 'ZPĚT NA CPU DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
            <Trophy size={16} /> {isEn ? 'PERFORMANCE LEADERBOARD' : 'ABSOLUTNÍ ŽEBŘÍČEK VÝKONU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CPU' : 'ŽEBŘÍČEK'} <br/>
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
              {isEn ? 'TIER LIST' : 'PROCESORŮ'}
            </span>
          </h1>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cpus.map((cpu, index) => {
            const vendorColor = getVendorColor(cpu.vendor);
            const safeSlug = cpu.slug || slugify(cpu.name);
            const isTop3 = index < 3 && (cpu.performance_index > 0);
            const boostMhz = cpu.boost_clock_mhz || (cpu.boost_clock_ghz ? cpu.boost_clock_ghz * 1000 : null);
            const profileUrl = isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`;

            return (
              <a key={`${safeSlug}-${index}`} href={profileUrl} className="ranking-row" style={{ 
                display: 'flex', alignItems: 'center', background: 'rgba(15, 17, 21, 0.95)', padding: '15px 20px', 
                borderRadius: '16px', border: isTop3 ? `1px solid ${index === 0 ? '#f59e0b' : index === 1 ? '#d1d5db' : '#b45309'}40` : '1px solid rgba(255,255,255,0.05)', 
                textDecoration: 'none', color: '#fff', transition: '0.3s' 
              }}>
                 <div style={{ width: '50px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                   {getRankIcon(index)}
                 </div>

                 <div style={{ width: '4px', height: '40px', borderRadius: '10px', marginRight: '20px', flexShrink: 0, backgroundColor: vendorColor }}></div>

                 <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '950', margin: '0 0 5px 0', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalizeName(cpu.name)}</h2>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', display: 'flex', gap: '8px' }}>
                       <span>{cpu.vendor}</span> • <span>{cpu.cores}C/{cpu.threads}T</span> • <span>{boostMhz ? `${boostMhz} MHz` : 'N/A'}</span>
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 30px', borderLeft: '1px solid rgba(255,255,255,0.05)', margin: '0 20px' }}>
                    <div style={{ fontSize: '9px', fontWeight: '950', color: '#6b7280', letterSpacing: '2px' }}>{isEn ? 'SCORE' : 'SKÓRE'}</div>
                    <div style={{ fontSize: '22px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '6px', color: isTop3 ? '#f59e0b' : '#fff' }}>
                       <Zap size={16} fill={isTop3 ? '#f59e0b' : 'transparent'} />
                       {cpu.performance_index || 'N/A'}
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>
                       {isEn ? 'Detail' : 'Detail'}
                    </div>
                 </div>
              </a>
            );
          })}
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .ranking-row:hover { transform: translateX(5px); background: rgba(25, 27, 31, 0.95) !important; border-color: rgba(255,255,255,0.1) !important; }
      `}} />
    </div>
  );
}
