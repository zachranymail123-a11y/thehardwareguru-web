import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Gamepad2, 
  Monitor, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Swords, 
  ShoppingCart, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Heart,
  BarChart3,
  Gauge,
  Trophy,
  Info,
  Crosshair
} from 'lucide-react';
import GuruAnalysisText from '../../../components/GuruAnalysisText';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU FPS HUNTER V1.4 (SEZNAM ADS INTEGRATION)
 * 🚀 CÍL: Rozcestník grafické karty (oprava 404) + Seznam Partner reklamy.
 * Cesta: src/app/gpu-fps/[slug]/page.js
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      const clean = gpuSlug.replace(/-/g, " ").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'force-cache' });
          if (res2.ok) { const data2 = await res2.json(); return data2[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | The Hardware Guru' };
  const safeSlug = gpu.slug || slugify(gpu.name);
  return {
    title: isEn ? `How much FPS does ${gpu.name} get? | Guru Benchmarks` : `Kolik FPS má ${gpu.name} ve hrách? | Guru Testy`,
    alternates: { canonical: `${baseUrl}/gpu-fps/${safeSlug}`, languages: { 'en': `${baseUrl}/en/gpu-fps/${safeSlug}`, 'cs': `${baseUrl}/gpu-fps/${safeSlug}` } }
  };
}

export default async function GpuFpsHunterPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) notFound();

  const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');
  const safeSlug = gpu.slug || slugify(gpu.name);

  const gamesToShow = [
    { id: 'resident_evil_requiem', name: 'Resident Evil Requiem', key: 'resident_evil_requiem' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
    { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
    { id: 'starfield', name: 'Starfield', key: 'starfield' },
    { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' }
  ];

  const getVerdict = (fps) => {
    if (fps >= 100) return { text: isEn ? 'ULTIMATE EXPERIENCE' : 'ULTIMÁTNÍ ZÁŽITEK', color: '#10b981' };
    if (fps >= 60) return { text: isEn ? 'SMOOTH GAMING' : 'PLYNULÉ HRANÍ', color: '#66fcf1' };
    if (fps >= 30) return { text: isEn ? 'PLAYABLE' : 'HRATELNÉ', color: '#eab308' };
    return { text: isEn ? 'NOT RECOMMENDED' : 'NEDOSTATEČNÝ VÝKON', color: '#ef4444' };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Gamepad2 size={16} /> GURU FPS HUNTER
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{normalizeName(gpu.name)}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON A FPS'}</span>
          </h1>
        </header>

        {/* 🔥 SEZNAM AD #1: TOP BANNER POD HLAVIČKOU */}
        <SeznamAd zoneId={408654} width={970} height={210} />

        {/* 🚀 HLAVNÍ FPS MATRIX S REKLAMOU UPROSTŘED */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '60px', marginTop: '40px' }}>
          {gamesToShow.map((game, index) => {
            const fpsValue = Number(fpsData[`${game.key}_1440p`] || fpsData[`${game.key}_1080p`] || 0);
            const verdict = getVerdict(fpsValue);

            return (
              <React.Fragment key={game.id}>
                <a href={`/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}/${game.id.replace(/_/g, '-')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="game-fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: '0.3s' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: verdict.color }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{game.name}</h3>
                      <span style={{ fontSize: '10px', fontWeight: '950', color: verdict.color, letterSpacing: '1px' }}>1440p ULTRA</span>
                    </div>
                    <div style={{ fontSize: '64px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>
                      {fpsValue > 0 ? fpsValue : 'N/A'} <span style={{ fontSize: '20px', color: '#4b5563' }}>FPS</span>
                    </div>
                    <div style={{ marginTop: '15px', color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{verdict.text}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </a>

                {/* 🔥 SEZNAM AD #2: GRID INJECTION PO 2. KARTĚ */}
                {index === 1 && (
                  <SeznamAd zoneId={408651} width={300} height={250} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 🚀 GURU: UNIKÁTNÍ SEO TEXT */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950' }}>{isEn ? 'Performance Analysis' : 'Analýza výkonu'}</h2>
                <GuruAnalysisText 
                    cpuName="Intel Core i9-14900K" 
                    gpuName={gpu.name} 
                    gameName="modern games" 
                    resolution="1440p" 
                    bottleneckPercent={0} 
                    isCpuBound={false} 
                    fps={Number(fpsData['cyberpunk_2077_1440p'] || 0)} 
                    isEn={isEn} 
                />

                {/* 🔥 SEZNAM AD #3: POD ANALÝZOU */}
                <div style={{ marginTop: '40px' }}>
                  <SeznamAd zoneId={408651} width={300} height={250} />
                </div>
            </div>
        </section>

        {/* 🚀 SÉMANTICKÝ ROZCESTNÍK */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <a href={`/${isEn ? 'en/' : ''}bottleneck/${safeSlug}-with-ryzen-7-7800x3d`} className="deep-link-card" style={{ borderTop: '4px solid #ff0055' }}>
                <Gauge size={32} color="#ff0055" />
                <h3>Bottleneck Radar</h3>
                <p>{isEn ? 'Is your CPU bottlenecking this GPU?' : 'Nezpomaluje tvůj procesor tuhle grafiku?'}</p>
                <ChevronRight className="arrow" />
            </a>
            <a href={`/${isEn ? 'en/' : ''}gpuvs`} className="deep-link-card" style={{ borderTop: '4px solid #a855f7' }}>
                <Swords size={32} color="#a855f7" />
                <h3>GPU Srovnávač</h3>
                <p>{isEn ? 'Compare against the competition.' : 'Srovnej tuhle kartu s konkurencí.'}</p>
                <ChevronRight className="arrow" />
            </a>
            <a href={`/${isEn ? 'en/' : ''}gpu/${safeSlug}`} className="deep-link-card" style={{ borderTop: '4px solid #66fcf1' }}>
                <Activity size={32} color="#66fcf1" />
                <h3>Detailní Profil</h3>
                <p>{isEn ? 'Full specs and architecture.' : 'Kompletní technické specifikace.'}</p>
                <ChevronRight className="arrow" />
            </a>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> DEALS</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        
        .game-fps-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2) !important; box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
        .deep-link-card { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; }
        .deep-link-card h3 { font-size: 18px; fontWeight: 950; margin: 15px 0 10px 0; text-transform: uppercase; }
        .deep-link-card p { font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0; }
        .deep-link-card .arrow { position: absolute; bottom: 30px; right: 30px; opacity: 0.2; }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; border-radius: 16px; text-decoration: none; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; border-radius: 16px; text-decoration: none; }

        @media (max-width: 768px) {
            .guru-deals-btn, .guru-support-btn { width: 100%; }
        }
      `}} />
    </div>
  );
}
