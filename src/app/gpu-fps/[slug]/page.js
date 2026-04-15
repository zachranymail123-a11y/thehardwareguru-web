import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, Monitor, ChevronRight, ShoppingCart, Zap, AlertTriangle, Swords } from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const findGpuBySlug = async (gpuSlug) => {
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const cleanGpuSlug = gpuSlug.replace(/^en-/, ''); 
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanGpuSlug}&limit=1`, { headers });
    const data = await res.json();
    return data?.[0] || null;
};

export default async function GpuFpsOverviewPage({ params }) {
    const p = await params;
    const rawSlug = p.slug || '';
    const isEn = rawSlug.startsWith('en-');
    const cleanSlug = rawSlug.replace(/^en-/, '');

    const gpu = await findGpuBySlug(cleanSlug);
    if (!gpu) return notFound();

    const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

    const gamesToShow = [
        { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
        { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
        { id: 'starfield', name: 'Starfield', key: 'starfield' },
        { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' },
        { id: 'gta-v', name: 'GTA V', key: 'gta_v' }
    ];

    return (
        <div className="guru-fps-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div className="hunter-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
                        <Monitor size={16} /> GURU FPS HUNTER
                    </div>
                    <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: vendorColor }}>{gpu.name}</span> <br/>
                        <span style={{ color: '#d1d5db' }}>{isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON A FPS'}</span>
                    </h1>
                </header>

                <div className="fps-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '60px' }}>
                    {gamesToShow.map((game) => {
                        const dbKey = game.key;
                        const fpsValue = Number(fpsData[`${dbKey}_1440p`] || fpsData[`${dbKey}_1080p`] || 0);
                        return (
                            <Link key={game.id} href={isEn ? `/en/gpu-fps/${rawSlug}/${game.id}` : `/gpu-fps/${rawSlug}/${game.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="game-fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', transition: '0.3s', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{game.name}</h3>
                                        <span style={{ fontSize: '10px', fontWeight: '950', color: '#10b981', letterSpacing: '1px' }}>1440p ULTRA</span>
                                    </div>
                                    <div className="fps-val" style={{ fontSize: '4rem', fontWeight: '950', color: '#fff' }}>{fpsValue || '??'} <span style={{ fontSize: '1.2rem', color: '#4b5563' }}>FPS</span></div>
                                    <div style={{ marginTop: '15px', color: '#66fcf1', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{isEn ? 'VIEW ANALYSIS' : 'ZOBRAZIT ANALÝZU'}</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {!isEn && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                        <HeurekaButtons isEn={false} manualSearch={gpu.name} positionId="276026" />
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}><Gamepad2 size={28} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
                    <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}><AlertTriangle size={28} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
                </div>

            </main>

            <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .game-fps-card:hover { transform: translateY(-5px); border-color: #a855f7 !important; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.2); }
            `}} />
        </div>
    );
}
