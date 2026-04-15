import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, ChevronLeft, ShoppingCart, AlertTriangle } from 'lucide-react';
import SeznamAd from '../../../../components/SeznamAd';

/**
 * GURU FPS HUNTER V2.3 (FIXED)
 * 🚀 CÍL: Sjednocení isEn detection a oprava Amazonu.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const findGpuBySlug = async (gpuSlug) => {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const cleanSlug = gpuSlug.replace(/^en-/, '');
  const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, { headers });
  const data = await res.json();
  return data?.[0] || null;
};

export default async function GpuFpsHunterPage(props) {
  const p = await props.params;
  const isEn = props.isEn === true || (p?.slug && p.slug.startsWith('en-'));
  const gpuSlug = (p?.slug || '').replace(/^en-/, '');
  const gameSlug = p?.game || '';

  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return notFound();

  const fpsData = gpu.game_fps?.[0] || {};
  const dbKey = gameSlug.replace(/-/g, '_');
  const fpsValue = fpsData[`${dbKey}_1440p`] || 0;
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

  const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(gpu.name)}&tag=thehardware07-20`;

  return (
    <div className="guru-fps-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <Link href={isEn ? `/en/gpu-fps/${gpuSlug}` : `/gpu-fps/${gpuSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#66fcf1', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </Link>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: vendorColor }}>{gpu.name}</span> <br/>
            <span style={{ color: '#fff' }}>{gameSlug.replace(/-/g, ' ').toUpperCase()}</span>
          </h1>
          <div style={{ fontSize: '10rem', fontWeight: '950', color: '#fff' }}>{fpsValue}</div>
          <div style={{ color: '#4b5563', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px' }}>Avg FPS (1440p Ultra)</div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '60px' }}>
            {isEn ? (
                <a href={amazonLink} target="_blank" rel="nofollow sponsored" style={{ background: '#f59e0b', color: '#000', padding: '20px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart size={20} /> CHECK ON AMAZON
                </a>
            ) : (
                <a href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(gpu.name)}#utm_source=thehardwareguru.cz`} target="_blank" rel="nofollow sponsored" style={{ background: '#0078d4', color: '#fff', padding: '20px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart size={20} /> KOUPIT NA HEUREKA
                </a>
            )}
        </div>
      </main>
    </div>
  );
}
