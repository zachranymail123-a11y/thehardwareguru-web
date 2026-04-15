import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
 Gamepad2, Monitor, ChevronLeft, ChevronRight, Zap, Swords, ShoppingCart, Activity, CheckCircle2, ArrowRight, Flame, Heart, BarChart3, Gauge, Trophy, Info, Crosshair, AlertTriangle
} from 'lucide-react';
import GuruAnalysisText from '../../../components/GuruAnalysisText';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const cleanSlug = gpuSlug.replace(/^en-/, '');
  
  try {
    // Zkusíme přesnou shodu slugu
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, { headers: authHeaders });
    const data = await res.json();
    if (data?.length) return data[0];

    // Pokud přesná shoda selže, zkusíme najít GPU podle jména (převod rtx-5070-ti na search)
    const searchPattern = `%${cleanSlug.replace(/-/g, '%')}%`;
    const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name.ilike.${searchPattern}&limit=1`, { headers: authHeaders });
    const data2 = await res2.json();
    return data2?.[0] || null;
  } catch (e) { return null; }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const gpu = await findGpuBySlug(rawSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };
  return {
    title: isEn ? `Gaming performance of ${gpu.name} | Guru Benchmarks` : `Herní výkon grafiky ${gpu.name} | Guru Testy`,
    alternates: { canonical: `${baseUrl}/gpu-fps/${rawSlug.replace(/^en-/, '')}` }
  };
}

export default async function GpuFpsOverviewPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = props.isEnProxy === true || rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return notFound();

  const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

  const gamesToShow = [
    { id: 'resident-evil-requiem', name: 'Resident Evil Requiem', key: 'resident_evil_requiem' },
    { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
    { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
    { id: 'starfield', name: 'Starfield', key: 'starfield' },
    { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' },
    { id: 'gta-v', name: 'GTA V', key: 'gta_v' }
  ];

  return (
    <div className="guru-fps-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
             <SeznamAd zoneId={408654} width={970} height={210} />
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="hunter-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
             <Gamepad2 size={16} /> GURU FPS HUNTER
          </div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{gpu.name}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON A FPS'}</span>
          </h1>
        </header>

        <div className="fps-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '60px', marginTop: '40px' }}>
          {gamesToShow.map((game) => {
            const fpsValue = Number(fpsData[`${game.key}_1440p`] || fpsData[`${game.key}_1080p`] || 0);
            return (
              <Link key={game.id} href={isEn ? `/en/gpu-fps/${cleanSlug}/${game.id}` : `/gpu-fps/${cleanSlug}/${game.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="game-fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', transition: '0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: vendorColor }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{game.name}</h3>
                    <span style={{ fontSize: '10px', fontWeight: '950', color: '#10b981', letterSpacing: '1px' }}>1440p ULTRA</span>
                  </div>
                  <div className="fps-main-val" style={{ fontSize: '64px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>{fpsValue || '??'} <span style={{ fontSize: '20px', color: '#4b5563' }}>FPS</span></div>
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

      <style dangerouslySetInnerHTML={{__html: `
        .game-fps-card:hover { transform: translateY(-5px); border-color: ${vendorColor} !important; box-shadow: 0 10px 30px ${vendorColor}20; }
      `}} />
    </div>
  );
}
