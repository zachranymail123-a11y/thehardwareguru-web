import React from 'react';
import { 
  ChevronLeft, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Activity,
  CheckCircle2,
  XCircle,
  Gamepad2,
  Coins
} from 'lucide-react';

/**
 * GURU GPU UPGRADE ENGINE - ANALYSIS V2.0
 * Cesta: src/app/gpu-upgrade/[slug]/page.js
 * 🛡️ FIX 1: Nativní fetch s 'no-store' (100% bypass Next.js cache).
 * 🛡️ FIX 2: Sjednocený parametr [slug] s podporou en- prefixu.
 * 🛡️ FIX 3: Robustní 3-tier vyhledávání pro obě grafické karty.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

// 🚀 GURU ENGINE: Vyhledávání karty podle slugu (3-tier)
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      // TIER 1: Exact match na slug
      const url1 = `${supabaseUrl}/rest/v1/gpus?select=*&slug=eq.${gpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }

      // TIER 2: Substring match
      const url2 = `${supabaseUrl}/rest/v1/gpus?select=*&slug=ilike.*${gpuSlug}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }

      // TIER 3: Tokenized search
      const cleanString = gpuSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/gpus?select=*&and=(${conditions})&order=name.asc`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) { console.error("GPU Lookup Error:", e); }
  return null;
};

export async function generateMetadata({ params }) {
  const isEn = params.slug.startsWith('en-');
  const cleanSlug = params.slug.replace(/^en-/, '');
  const [oldSlug, newSlug] = cleanSlug.split('-to-');

  const [gpuOld, gpuNew] = await Promise.all([ findGpuBySlug(oldSlug), findGpuBySlug(newSlug) ]);
  if (!gpuOld || !gpuNew) return { title: 'Upgrade Analysis | Hardware Guru' };

  const perfDiff = Math.round(((gpuNew.performance_index / gpuOld.performance_index) - 1) * 100);

  return {
    title: isEn 
      ? `Upgrade ${gpuOld.name} to ${gpuNew.name} – ${perfDiff}% Performance Gain?`
      : `Upgrade z ${gpuOld.name} na ${gpuNew.name} – Vyplatí se? (+${perfDiff} % výkonu)`,
    description: isEn
      ? `Detailed upgrade analysis between ${gpuOld.name} and ${gpuNew.name}. Benchmarks, specs, and price/performance verdict.`
      : `Detailní analýza upgradu z ${gpuOld.name} na ${gpuNew.name}. Benchmarky, specifikace a verdikt cena/výkon.`
  };
}

export default async function GpuUpgradePage({ params }) {
  const isEn = params.slug.startsWith('en-');
  const cleanSlug = params.slug.replace(/^en-/, '');
  const [oldSlug, newSlug] = cleanSlug.split('-to-');

  const [gpuOld, gpuNew] = await Promise.all([ findGpuBySlug(oldSlug), findGpuBySlug(newSlug) ]);

  if (!gpuOld || !gpuNew) {
    return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>
      DATABASE ERROR: GPU DATA NOT FOUND
    </div>;
  }

  const perfDiff = Math.round(((gpuNew.performance_index / gpuOld.performance_index) - 1) * 100);
  
  // Verdikt logika
  const getVerdict = () => {
    if (perfDiff >= 50) return { 
        text: isEn ? 'HUGE UPGRADE' : 'BRUTÁLNÍ UPGRADE', 
        desc: isEn ? 'Highly recommended. The performance jump is massive.' : 'Rozhodně doporučujeme. Skok ve výkonu je obrovský.',
        icon: <CheckCircle2 size={40} color="#10b981" />,
        color: '#10b981'
    };
    if (perfDiff >= 25) return { 
        text: isEn ? 'SOLID UPGRADE' : 'DOBRÝ UPGRADE', 
        desc: isEn ? 'Worth considering if the price is right.' : 'Stojí za zvážení, pokud je cena rozumná.',
        icon: <CheckCircle2 size={40} color="#66fcf1" />,
        color: '#66fcf1'
    };
    return { 
        text: isEn ? 'NOT WORTH IT' : 'NEVYPLATÍ SE', 
        desc: isEn ? 'The performance gain is too small for the cost.' : 'Nárůst výkonu je příliš malý na to, aby se upgrade vyplatil.',
        icon: <XCircle size={40} color="#ef4444" />,
        color: '#ef4444'
    };
  };

  const verdict = getVerdict();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO DUELS' : 'ZPĚT NA DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102,252,241,0.05)' }}>
            <TrendingUp size={16} /> {isEn ? 'UPGRADE ANALYSIS' : 'ANALÝZA UPGRADU'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#9ca3af' }}>{normalizeName(gpuOld.name)}</span>
            <span style={{ display: 'block', margin: '10px 0', color: '#66fcf1' }}><ArrowRight size={40} style={{ display: 'inline' }} /></span>
            <span style={{ color: '#fff' }}>{normalizeName(gpuNew.name)}</span>
          </h1>
        </header>

        {/* 🚀 VERDIKT KARTA */}
        <section style={{ background: 'rgba(15, 17, 21, 0.95)', border: `2px solid ${verdict.color}40`, borderRadius: '30px', padding: '40px', marginBottom: '40px', textAlign: 'center', boxShadow: `0 20px 60px ${verdict.color}15` }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>{verdict.icon}</div>
            <h2 style={{ fontSize: '32px', fontWeight: '950', color: verdict.color, margin: '0 0 10px 0', textTransform: 'uppercase' }}>{verdict.text}</h2>
            <p style={{ fontSize: '18px', color: '#d1d5db', margin: 0 }}>{verdict.desc}</p>
            
            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>{isEn ? 'PERFORMANCE BOOST' : 'NÁRŮST VÝKONU'}</div>
                    <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>+{perfDiff}%</div>
                </div>
                <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>{isEn ? 'VRAM UPGRADE' : 'ROZDÍL VRAM'}</div>
                    <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>{gpuNew.vram_gb - gpuOld.vram_gb > 0 ? `+${gpuNew.vram_gb - gpuOld.vram_gb}` : '0'} GB</div>
                </div>
            </div>
        </section>

        {/* 🚀 PARAMETRY SROVNÁNÍ */}
        <section className="spec-grid">
            <div className="spec-card">
                <Gamepad2 size={24} color="#66fcf1" />
                <div className="spec-label">{isEn ? 'Architecture' : 'Architektura'}</div>
                <div className="spec-val">{gpuOld.architecture} → {gpuNew.architecture}</div>
            </div>
            <div className="spec-card">
                <Zap size={24} color="#66fcf1" />
                <div className="spec-label">{isEn ? 'Power Draw' : 'Spotřeba (TDP)'}</div>
                <div className="spec-val">{gpuOld.tdp_w}W → {gpuNew.tdp_w}W</div>
            </div>
            <div className="spec-card">
                <Coins size={24} color="#66fcf1" />
                <div className="spec-label">{isEn ? 'MSRP Price' : 'Zaváděcí cena'}</div>
                <div className="spec-val">${gpuOld.release_price_usd} → ${gpuNew.release_price_usd}</div>
            </div>
            <div className="spec-card">
                <Activity size={24} color="#66fcf1" />
                <div className="spec-label">{isEn ? 'Index' : 'Výkonnostní index'}</div>
                <div className="spec-val">{gpuOld.performance_index} → {gpuNew.performance_index}</div>
            </div>
        </section>

        {/* 🚀 DEEP DIVE CTA */}
        <div style={{ marginTop: '60px', display: 'flex', gap: '15px' }}>
            <a href={isEn ? `/en/gpuvs/${oldSlug}-vs-${newSlug}` : `/gpuvs/${oldSlug}-vs-${newSlug}`} className="btn-action primary">
                {isEn ? 'FULL BENCHMARK COMPARISON' : 'KOMPLETNÍ SROVNÁNÍ BENCHMARKŮ'} <ArrowRight size={18} />
            </a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }

        .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        .spec-card { background: rgba(15, 17, 21, 0.95); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .spec-label { font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0 5px; }
        .spec-val { font-size: 18px; font-weight: 950; color: #fff; }

        .btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; border-radius: 15px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; border: 1px solid transparent; }
        .btn-action.primary { background: #66fcf1; color: #0a0b0d; box-shadow: 0 10px 30px rgba(102, 252, 241, 0.3); }
        .btn-action.primary:hover { transform: translateY(-3px); filter: brightness(1.1); }

        @media (max-width: 768px) {
            .spec-grid { grid-template-columns: 1fr 1fr; }
        }
      `}} />
    </div>
  );
}
