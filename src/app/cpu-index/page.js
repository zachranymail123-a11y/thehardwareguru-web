import React from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  Database, 
  Activity, 
  Swords
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU CPU ENGINE - KATALOG PROCESORŮ V1.2 (NEXT.JS 15 SAFE)
 * Cesta: src/app/cpu-index/page.js
 * 🛡️ ARCH: SEO Hub, Řazení dle výkonu, AMD vs Intel rozdělení.
 * 🛡️ FIX 1: nullsFirst: false zajistí, že CPU bez indexu nebudou nahoře.
 * 🛡️ FIX 2: Připraveno pro proxy pattern (přijímá isEn jako explicitní prop).
 */

export const revalidate = 3600; // Cache na 1 hodinu pro rychlost a šetření DB

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn 
      ? 'CPU Database & Performance Index | The Hardware Guru' 
      : 'Katalog Procesorů a Index Výkonu | The Hardware Guru',
    description: isEn
      ? 'Complete database of AMD and Intel processors. Detailed specs, benchmarks, and performance hierarchy.'
      : 'Kompletní databáze procesorů AMD a Intel. Detailní specifikace, benchmarky a hierarchie výkonu.',
    alternates: {
      canonical: 'https://thehardwareguru.cz/cpu-index',
      languages: {
        'en': 'https://thehardwareguru.cz/en/cpu-index',
        'cs': 'https://thehardwareguru.cz/cpu-index',
        'x-default': 'https://thehardwareguru.cz/cpu-index'
      }
    }
  };
}

export default async function CpuIndexPage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch všech CPU seřazených podle hrubého výkonu (nulls padají na konec)
  const { data: cpus, error } = await supabase
    .from('cpus')
    .select('name, slug, vendor, cores, threads, boost_clock_mhz, performance_index')
    .order('performance_index', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true });

  if (error || !cpus) {
    return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CHYBA NAČÍTÁNÍ DATABÁZE PROCESORŮ</div>;
  }

  // 2. Rozdělení na vendory pro vizuální bloky
  const amdCpus = cpus.filter(c => (c.vendor || '').toUpperCase() === 'AMD');
  const intelCpus = cpus.filter(c => (c.vendor || '').toUpperCase() === 'INTEL');

  // Helper pro renderování karet
  const renderCpuCards = (cpuList, vendorColor) => {
    return cpuList.map((cpu, index) => {
      // Zvýrazníme první 3, pokud mají skutečný výkon
      const isTopTier = index < 3 && cpu.performance_index > 0; 
      const safeSlug = cpu.slug || slugify(cpu.name);
      
      return (
        <a 
          key={safeSlug} 
          href={isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`} 
          className="cpu-card"
          style={{ borderTop: `4px solid ${isTopTier ? vendorColor : '#374151'}` }}
        >
          <div className="card-header">
            <h3 style={{ color: isTopTier ? '#fff' : '#d1d5db' }}>{normalizeName(cpu.name)}</h3>
            {isTopTier && <span className="top-badge" style={{ color: vendorColor, borderColor: vendorColor }}>TOP TIER</span>}
          </div>
          
          <div className="card-specs">
            <div className="spec-item">
               <span className="spec-label">CORES</span>
               <span className="spec-val">{cpu.cores || '-'}</span>
            </div>
            <div className="spec-item">
               <span className="spec-label">THREADS</span>
               <span className="spec-val">{cpu.threads || '-'}</span>
            </div>
            <div className="spec-item">
               <span className="spec-label">INDEX</span>
               <span className="spec-val" style={{ color: cpu.performance_index ? vendorColor : '#6b7280' }}>
                 {cpu.performance_index || 'N/A'}
               </span>
            </div>
          </div>
          
          <div className="card-actions">
            <div className="action-btn"><Activity size={14}/> {isEn ? 'Specs' : 'Detaily'}</div>
            <div className="action-btn" style={{ color: '#f59e0b' }}><Swords size={14}/> {isEn ? 'VS Engine' : 'Srovnat'}</div>
          </div>
        </a>
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU BATTLES' : 'ZPĚT NA CPU DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
            <Database size={16} /> GURU HARDWARE DATABASE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CPU' : 'KATALOG'} <br/>
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
              {isEn ? 'DATABASE' : 'PROCESORŮ'}
            </span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn 
              ? 'Complete hierarchy of all processors. Sorted by raw performance index.' 
              : 'Kompletní hierarchie všech procesorů. Seřazeno od nejvýkonnějších po nejslabší.'}
          </div>
        </header>

        {/* 🚀 AMD SECTION */}
        {amdCpus.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#ed1c24' }}>
              <span style={{ color: '#ed1c24' }}>AMD</span> RYZEN
            </h2>
            <div className="cpu-grid">
              {renderCpuCards(amdCpus, '#ed1c24')}
            </div>
          </section>
        )}

        {/* 🚀 INTEL SECTION */}
        {intelCpus.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#0071c5' }}>
              <span style={{ color: '#0071c5' }}>INTEL</span> CORE
            </h2>
            <div className="cpu-grid">
              {renderCpuCards(intelCpus, '#0071c5')}
            </div>
          </section>
        )}

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(245, 158, 11, 0.1); transform: translateX(-5px); }
        
        .vendor-h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid; padding-left: 15px; display: flex; align-items: center; gap: 15px; }
        
        .cpu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .cpu-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border-radius: 16px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; padding: 25px; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .cpu-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.6); background: rgba(25, 27, 31, 0.95); border-color: rgba(255,255,255,0.1); }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; min-height: 50px; }
        .card-header h3 { margin: 0; font-size: 1.3rem; font-weight: 950; text-transform: uppercase; line-height: 1.2; }
        .top-badge { font-size: 9px; font-weight: 950; padding: 3px 8px; border: 1px solid; border-radius: 50px; white-space: nowrap; margin-left: 10px; }
        
        .card-specs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .spec-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .spec-label { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px; }
        .spec-val { font-size: 14px; font-weight: 900; color: #9ca3af; }
        
        .card-actions { display: flex; justify-content: space-between; gap: 10px; }
        .action-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase; transition: 0.2s; }
        .cpu-card:hover .action-btn { color: #d1d5db; }
      `}} />
    </div>
  );
}
