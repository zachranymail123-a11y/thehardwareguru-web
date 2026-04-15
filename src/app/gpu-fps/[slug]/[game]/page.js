import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
 Gamepad2, Monitor, ChevronLeft, ChevronRight, Zap, Swords, ShoppingCart, Activity, CheckCircle2, ArrowRight, Flame, Heart, BarChart3, Gauge, Trophy, Info, Crosshair, AlertTriangle
} from 'lucide-react';
import GuruAnalysisText from '../../../../components/GuruAnalysisText';
import SeznamAd from '../../../../components/SeznamAd';
import HeurekaButtons from '../../../../components/HeurekaButtons'; 

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const cleanSlug = gpuSlug.replace(/^en-/, '');
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, { headers: authHeaders });
    const data = await res.json();
    if (data?.length) return data[0];

    const searchPattern = `%${cleanSlug.replace(/-/g, '%')}%`;
    const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name.ilike.${searchPattern}&limit=1`, { headers: authHeaders });
    const data2 = await res2.json();
    return data2?.[0] || null;
  } catch (e) { return null; }
};

export default async function GameSpecificFpsPage({ params, props = {} }) {
    const p = await params;
    const rawSlug = p.slug || '';
    const isEn = props.isEnProxy === true || rawSlug.startsWith('en-');
    const cleanSlug = rawSlug.replace(/^en-/, '');
    const gameSlug = p.game || '';

    const gpu = await findGpuBySlug(cleanSlug);
    if (!gpu) return notFound();

    const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
    // 🔥 Dynamické mapování na sloupce v DB (cyberpunk-2077 -> cyberpunk_2077_1440p)
    const dbKey = gameSlug.replace(/-/g, '_');
    const fpsValue = fpsData[`${dbKey}_1440p`] || fpsData[`${dbKey}_1080p`] || 0;
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

    const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(gpu.name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-game-detail`;
    const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(gpu.name)}&tag=thehardware07-20&ascsubtag=game-detail`;

    return (
        <div className="guru-fps-detail-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <Link href={isEn ? `/en/gpu-fps/${cleanSlug}` : `/gpu-fps/${cleanSlug}`} className="guru-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#66fcf1', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                        <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU' : 'ZPĚT NA GRAFIKU'}
                    </Link>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="hunter-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
                        <Gamepad2 size={16} /> GURU FPS ANALYSIS
                    </div>
                    <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: vendorColor }}>{gpu.name}</span> <br/>
                        <span style={{ color: '#fff' }}>{gameSlug.replace(/-/g, ' ').toUpperCase()}</span>
                    </h1>
                </header>

                <div className="result-card" style={{ background: 'rgba(15,17,21,0.95)', padding: '60px 40px', borderRadius: '32px', border: `2px solid ${vendorColor}`, textAlign: 'center', marginBottom: '60px', boxShadow: `0 0 50px ${vendorColor}20` }}>
                    <div style={{ fontSize: '10rem', fontWeight: '950', color: '#fff', lineHeight: '1' }}>{fpsValue || '??'}</div>
                    <div style={{ fontSize: '20px', color: '#4b5563', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px' }}>Avg FPS (1440p Ultra)</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '60px' }}>
                    <a href={isEn ? amazonLink : heurekaLink} target="_blank" rel="nofollow sponsored" style={{ background: isEn ? '#f59e0b' : '#0078d4', color: isEn ? '#000' : '#fff', padding: '20px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                        <ShoppingCart size={20} /> {isEn ? 'CHECK PRICE' : 'ZJISTIT CENU KARTY'}
                    </a>
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '60px' }}>
                    <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950' }}>{isEn ? 'Performance Analysis' : 'Analýza výkonu'}</h2>
                    <GuruAnalysisText 
                        cpuName="High-end Gaming CPU" 
                        gpuName={gpu.name} 
                        gameName={gameSlug.replace(/-/g, ' ')} 
                        resolution="1440p" 
                        fps={fpsValue} 
                        isEn={isEn} 
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}><Gamepad2 size={28} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
                    <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}><AlertTriangle size={28} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
                </div>

            </main>

            <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>
        </div>
    );
}
