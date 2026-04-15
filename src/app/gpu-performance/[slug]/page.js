import React from 'react';
import { headers } from 'next/headers';
import Script from 'next/script';
import { 
 ChevronLeft, Monitor, Database, Gamepad2, ArrowRight, ExternalLink, 
 Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Info, Cpu, Zap, AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU GPU PERFORMANCE ENGINE V3.9 (BUILD FIX & SEO)
 * 🚀 CÍL: Fix importů (3 tečky), oprava detekce isEn a Google Golden Rich.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const cleanSlug = gpuSlug.replace(/^en-/, '');
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, { headers: authHeaders, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      const cleanString = cleanSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res3 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers: authHeaders, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata(props) {
  const p = await props.params;
  const isEn = props.isEn === true || (p?.slug && p.slug.startsWith('en-'));
  const gpu = await findGpuBySlug(p.slug || '');
  if (!gpu) return { title: '404 | Hardware Guru' };
  const safeSlug = gpu.slug || slugify(gpu.name);
  return {
    title: isEn ? `${gpu.name} Performance & Technical Specs` : `${gpu.name} Výkon a Technické Parametry`,
    alternates: { canonical: `https://thehardwareguru.cz${isEn ? '/en' : ''}/gpu-performance/${safeSlug}` }
  };
}

export default async function GpuPerformancePage(props) {
  const p = await props.params;
  const isEn = props.isEn === true || (p?.slug && p.slug.startsWith('en-'));
  const gpu = await findGpuBySlug(p.slug || '');

  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>GPU NOT FOUND</div>;

  const cleanGpuName = normalizeName(gpu.name);
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';
  const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(cleanGpuName)}&tag=thehardware07-20`;

  // Google Golden Rich
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": gpu.name,
    "description": isEn ? `Technical specs for ${gpu.name}` : `Technické specifikace pro ${gpu.name}`
  };

  return (
    <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', paddingTop: '120px', paddingBottom: '160px', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase' }}>
            <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
            {isEn ? 'SPECS & PERFORMANCE' : 'VÝKON A PARAMETRY'}
          </h1>
        </header>

        <section style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px', borderRadius: '24px', textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '12px', fontWeight: '950', color: '#66fcf1', marginBottom: '15px' }}>{isEn ? 'GAMING PERFORMANCE INDEX' : 'INDEX HERNÍHO VÝKONU'}</div>
            <div style={{ fontSize: '80px', fontWeight: '950' }}>{gpu.performance_index ?? 'N/A'} <span style={{ fontSize: '24px', color: '#66fcf1' }}>PTS</span></div>
        </section>

        <div className="affiliate-cta" style={{ background: 'rgba(0,0,0,0.4)', padding: '35px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ marginBottom: '25px', fontWeight: '950', color: vendorColor }}>{isEn ? `BUY ${cleanGpuName}` : `KOUPIT ${cleanGpuName}`}</div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                {isEn ? (
                    <a href={amazonLink} target="_blank" rel="nofollow sponsored" style={{ background: '#f59e0b', color: '#000', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}><ShoppingCart size={16} /> BUY ON AMAZON</a>
                ) : (
                    <a href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(gpu.name)}#utm_source=thehardwareguru.cz`} target="_blank" rel="nofollow sponsored" style={{ background: '#0078d4', color: '#fff', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}><ShoppingCart size={16} /> KOUPIT NA HEUREKA</a>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
