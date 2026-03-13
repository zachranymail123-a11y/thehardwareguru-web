import React from 'react';
import { 
  ChevronLeft, 
  Monitor, 
  Database, 
  Activity, 
  Swords 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU GPU ENGINE - KATALOG GRAFIK V1.0
 * Cesta: src/app/gpu-index/page.js
 * 🛡️ ARCH: SEO Hub, Řazení dle výkonu, NVIDIA vs AMD rozdělení.
 * 🛡️ FIX: Chybějící index grafik doplněn (parita s CPU).
 */

export const revalidate = 3600; // Cache na 1 hodinu pro rychlost a šetření DB

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

export async function generateMetadata({ isEn = false }) {
  return {
    title: isEn 
      ? 'GPU Database & Performance Index | The Hardware Guru' 
      : 'Katalog Grafických Karet a Index Výkonu | The Hardware Guru',
    description: isEn
      ? 'Complete database of NVIDIA and AMD graphics cards. Detailed specs, benchmarks, and performance hierarchy.'
      : 'Kompletní databáze grafických karet NVIDIA a AMD. Detailní specifikace, benchmarky a hierarchie výkonu.',
    alternates: {
      canonical: 'https://thehardwareguru.cz/gpu-index',
      languages: {
        'en': 'https://thehardwareguru.cz/en/gpu-index',
        'cs': 'https://thehardwareguru.cz/gpu-index'
      }
    }
  };
}

export default async function GpuIndexPage({ isEn = false }) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch všech GPU seřazených podle hrubého výkonu
  const { data: gpus, error } = await supabase
    .from('gpus')
    .select('name, slug, vendor, vram_gb, memory_bus, performance_index')
    .order('performance_index', { ascending: false });

  if (error || !gpus) {
    return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>CHYBA NAČÍTÁNÍ DATABÁZE GRAFIK</div>;
  }

  // 2. Rozdělení na vendory pro vizuální bloky
  const nvidiaGpus = gpus.filter(g => (g.vendor || '').toUpperCase() === 'NVIDIA');
  const amdGpus = gpus.filter(g => (g.vendor || '').toUpperCase() === 'AMD');

  // Helper pro renderování karet
  const renderGpuCards = (gpuList, vendorColor) => {
    return gpuList.map((gpu, index) => {
      const isTopTier = index < 3; // Zvýraznění TOP 3 grafik v dané kategorii
      const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
      
      return (
        <a 
          key={safeSlug} 
          href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} 
          className="gpu-card"
          style={{ borderTop: `4px solid ${isTopTier ? vendorColor : '#374151'}` }}
        >
          <div className="card-header">
            <h3 style={{ color: isTopTier ? '#fff' : '#d1d5db' }}>{normalizeName(gpu.name)}</h3>
            {isTopTier && <span className="top-badge" style={{ color: vendorColor, borderColor: vendorColor }}>TOP TIER</span>}
          </div>
          
          <div className="card-specs">
            <div className="spec-item">
               <span className="spec-label">VRAM</span>
               <span className="spec-val">{gpu.vram_gb ? `${gpu.vram_gb} GB` : '-'}</span>
            </div>
            <div className="spec-item">
               <span className="spec-label">BUS</span>
               <span className="spec-val">{gpu.memory_bus || '-'}</span>
            </div>
            <div className="spec-item">
               <span className="spec-label">INDEX</span>
               <span className="spec-val" style={{ color: vendorColor }}>{gpu.performance_index || '-'}</span>
            </div>
          </div>
          
          <div className="card-actions">
            <div className="action-btn"><Activity size={14}/> {isEn ? 'Specs' : 'Detaily'}</div>
            <div className="action-btn" style={{ color: vendorColor }}><Swords size={14}/> {isEn ? 'VS Engine' : 'Srovnat'}</div>
          </div>
        </a>
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU BATTLES' : 'ZPĚT NA GPU DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Database size={16} /> GURU HARDWARE DATABASE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'GPU' : 'KATALOG'} <br/>
            <span style={{ color: '#66fcf1', textShadow: '0 0 30px rgba(102, 252, 241, 0.5)' }}>
              {isEn ? 'DATABASE' : 'GRAFIK'}
            </span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn 
              ? 'Complete hierarchy of all graphics cards. Sorted by raw gaming performance index.' 
              : 'Kompletní hierarchie všech grafických karet. Seřazeno od nejvýkonnějších po nejslabší.'}
          </div>
        </header>

        {/* 🚀 NVIDIA SECTION */}
        {nvidiaGpus.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#76b900' }}>
              <span style={{ color: '#76b900' }}>NVIDIA</span> GEFORCE
            </h2>
            <div className="gpu-grid">
              {renderGpuCards(nvidiaGpus, '#76b900')}
            </div>
          </section>
        )}

        {/* 🚀 AMD SECTION */}
        {amdGpus.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#ed1c24' }}>
              <span style={{ color: '#ed1c24' }}>AMD</span> RADEON
            </h2>
            <div className="gpu-grid">
              {renderGpuCards(amdGpus, '#ed1c24')}
            </div>
          </section>
        )}

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .vendor-h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid; padding-left: 15px; display: flex; align-items: center; gap: 15px; }
        
        .gpu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .gpu-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border-radius: 16px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; padding: 25px; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .gpu-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.6); background: rgba(25, 27, 31, 0.95); }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; min-height: 50px; }
        .card-header h3 { margin: 0; font-size: 1.3rem; font-weight: 950; text-transform: uppercase; line-height: 1.2; }
        .top-badge { font-size: 9px; font-weight: 950; padding: 3px 8px; border: 1px solid; border-radius: 50px; white-space: nowrap; margin-left: 10px; }
        
        .card-specs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .spec-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .spec-label { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px; }
        .spec-val { font-size: 14px; font-weight: 900; color: #9ca3af; }
        
        .card-actions { display: flex; justify-content: space-between; gap: 10px; }
        .action-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase; transition: 0.2s; }
        .gpu-card:hover .action-btn { color: #d1d5db; }
      `}} />
    </div>
  );
}
