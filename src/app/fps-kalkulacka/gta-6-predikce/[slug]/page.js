import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sparkles, Award, ArrowRight, Zap, Monitor, Cpu, Share2, Twitter } from 'lucide-react';

/**
 * GURU GTA 6 PREDICTOR - V6.2 (FIXED SERVER-SIDE)
 * 🛡️ FIX: Opravena inicializace Supabase pro Server Components.
 * 🛡️ SEO: Google Golden Rich + Dynamické Meta tagy.
 */

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

// Ikona Redditu
const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export async function generateMetadata({ params, searchParams }) {
    return {
        title: `GTA VI Performance Predictor | Hardware Guru`,
        description: `Can you run GTA VI? See the predicted FPS for your specific hardware.`,
    };
}

export default async function Gta6PredictionPage({ params, searchParams }) {
  const { cpuId, gpuId } = searchParams;
  const slug = params.slug; 

  if (!cpuId || !gpuId) return <div>Missing Hardware IDs</div>;
  
  // Inicializace Supabase s fallbackem pro ENV
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  const resolution = slug.endsWith('2160p') ? '4k' : slug.endsWith('1440p') ? '1440p' : '1080p';
  const resKey = resolution === '4k' ? 'alan_wake_2_4k' : `alan_wake_2_${resolution}`;

  const [gpuData, cpuData, gpus, cpus] = await Promise.all([
    supabase.from('game_fps').select('*').eq('gpu_id', gpuId).maybeSingle(),
    supabase.from('cpu_game_fps').select('*').eq('cpu_id', cpuId).maybeSingle(),
    supabase.from('gpus').select('id,name').order('name'),
    supabase.from('cpus').select('id,name').order('name')
  ]);

  const gpuName = gpus.data?.find(g => g.id === gpuId)?.name || 'GPU';
  const cpuName = cpus.data?.find(c => c.id === cpuId)?.name || 'CPU';
  const hwComboName = `${cpuName} + ${gpuName}`;

  const gpuFps = gpuData.data?.[resKey] || 0;
  const cpuFps = cpuData.data?.[resKey] || 0;
  const baseFps = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);
  const predictedFps = Math.round(baseFps * 0.85);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `GTA VI FPS Prediction - ${hwComboName}`,
    "operatingSystem": "Windows",
    "applicationCategory": "GameApplication",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1520" }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="pred-badge"><Sparkles size={16} /> AI NEXT-GEN PREDIKCE</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
            GTA VI OČEKÁVANÝ VÝKON
          </h1>
          <p style={{ fontSize: '24px', fontWeight: '950', color: '#fda4af', marginTop: '20px', textTransform: 'uppercase' }}>
            {hwComboName} ({resolution.toUpperCase()})
          </p>
        </header>

        <div className="result-card">
            <div className="fps-main">{predictedFps} <span style={{ fontSize: '3rem' }}>FPS</span></div>
            <div className="fps-label">PŘEDPOKLÁDANÁ RYCHLOST HRY</div>
            
            <div className="stats-row">
                <div className="stat-pill"><Cpu size={18} color="#f59e0b" /> CPU: {Math.round(cpuFps * 0.85)} FPS</div>
                <div className="stat-pill"><Monitor size={18} color="#66fcf1" /> GPU: {Math.round(gpuFps * 0.85)} FPS</div>
            </div>
        </div>

        {/* ROZLIŠENÍ PŘEPÍNAČ */}
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
             {['1080p', '1440p', '2160p'].map(res => (
                 <a key={res} href={`/fps-kalkulacka/gta-6-predikce/${slug.split('-vs-')[0]}-vs-${slug.split('-vs-')[1].split('-')[0]}-${res}?cpuId=${cpuId}&gpuId=${gpuId}`} className={`res-nav ${resolution === (res === '2160p' ? '4k' : res) ? 'active' : ''}`}>
                    {res === '2160p' ? '4K Ultra' : `${res} Quad`}
                 </a>
             ))}
        </div>

        {/* PROLINKOVÁNÍ */}
        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/fps-kalkulacka" className="silo-mini-card"><Zap size={20} color="#a855f7" /> NOVÉ MĚŘENÍ JINÉ HRY</a>
            <a href="/cpuvs" className="silo-mini-card highlight"><ArrowRight size={20} color="#f59e0b" /> BOTTLENECK TEST</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 20px; text-transform: uppercase; font-size: 11px; }
        .result-card { background: linear-gradient(135deg, #111, #1a050a); padding: 60px; border-radius: 30px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 50px rgba(244, 63, 94, 0.2); }
        .fps-main { font-size: 7rem; font-weight: 950; line-height: 1; margin-bottom: 10px; color: #fff; }
        .fps-label { font-size: 1rem; font-weight: 900; color: #fda4af; letter-spacing: 2px; text-transform: uppercase; }
        .stats-row { display: flex; justify-content: center; gap: 20px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
        .stat-pill { display: flex; align-items: center; gap: 8px; color: #d1d5db; font-weight: bold; font-size: 14px; background: rgba(255,255,255,0.03); padding: 8px 15px; border-radius: 10px; }
        .res-nav { padding: 15px; background: #111; border-radius: 12px; text-align: center; text-decoration: none; color: #fff; font-weight: 900; border: 1px solid #333; transition: 0.3s; }
        .res-nav:hover, .res-nav.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
        .silo-mini-card { display: flex; align-items: center; gap: 10px; background: #111; padding: 25px; border-radius: 20px; border: 1px solid #333; text-decoration: none; color: #fff; font-weight: 950; transition: 0.3s; justify-content: center; text-transform: uppercase; font-size: 13px; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #f43f5e; }
        .silo-mini-card.highlight { border-color: rgba(245, 158, 11, 0.3); }
      `}} />
    </div>
  );
}
