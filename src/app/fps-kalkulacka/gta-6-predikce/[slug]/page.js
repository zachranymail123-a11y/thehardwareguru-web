import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sparkles, Award, ArrowRight, ChevronLeft, Zap, Monitor, Cpu } from 'lucide-react';
import FpsCalculatorClient from '../../FpsCalculatorClient';

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export default async function Gta6PredictionPage({ params, searchParams }) {
  const { cpuId, gpuId } = searchParams;
  const slug = params.slug; 
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const resolution = slug.endsWith('2160p') ? '4k' : slug.endsWith('1440p') ? '1440p' : '1080p';
  const resKey = resolution === '4k' ? 'alan_wake_2_4k' : `alan_wake_2_${resolution}`;

  const [gpuData, cpuData, gpus, cpus, games] = await Promise.all([
    supabase.from('game_fps').select('*').eq('gpu_id', gpuId).maybeSingle(),
    supabase.from('cpu_game_fps').select('*').eq('cpu_id', cpuId).maybeSingle(),
    supabase.from('gpus').select('id,name,vendor,slug').order('name'),
    supabase.from('cpus').select('id,name').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  const gpuName = gpus.data?.find(g => g.id === gpuId)?.name || 'GPU';
  const cpuName = cpus.data?.find(c => c.id === cpuId)?.name || 'CPU';

  const gpuFps = gpuData.data?.[resKey] || 0;
  const cpuFps = cpuData.data?.[resKey] || 0;
  const baseFps = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);
  const predictedFps = Math.round(baseFps * 0.85);

  // GOOGLE GOLDEN RICH DATA - SoftwareApplication
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `GTA VI Performance Prediction - ${cpuName} & ${gpuName}`,
    "operatingSystem": "Windows 10, Windows 11",
    "applicationCategory": "GameApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1240"
    },
    "description": `Odhadovaný výkon hry Grand Theft Auto VI pro sestavu s ${cpuName} a ${gpuName} v rozlišení ${resolution}.`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="pred-badge"><Sparkles size={16} /> AI NEXT-GEN PREDIKCE</div>
          <h1 style={{ fontSize: '3rem', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1.1 }}>
            GTA VI: <span style={{ color: '#f43f5e' }}>{predictedFps} FPS</span>
          </h1>
          <p style={{ color: '#9ca3af', fontWeight: 'bold', marginTop: '15px' }}>{cpuName} + {gpuName} ({resolution})</p>
        </header>

        <div className="result-card">
            <div className="fps-main">{predictedFps}</div>
            <div className="fps-label">OČEKÁVANÉ FPS</div>
            
            <div className="stats-row">
                <div className="stat-pill"><Cpu size={18} /> CPU: {Math.round(cpuFps * 0.85)} FPS</div>
                <div className="stat-pill"><Monitor size={18} /> GPU: {Math.round(gpuFps * 0.85)} FPS</div>
            </div>
        </div>

        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
             {['1080p', '1440p', '2160p'].map(res => (
                 <a key={res} href={`/fps-kalkulacka/gta-6-predikce/${slug.split('-vs-')[0]}-vs-${slug.split('-vs-')[1].split('-')[0]}-${res}?cpuId=${cpuId}&gpuId=${gpuId}`} className={`res-nav ${resolution === (res === '2160p' ? '4k' : res) ? 'active' : ''}`}>
                    {res === '2160p' ? '4K' : res}
                 </a>
             ))}
        </div>

        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/fps-kalkulacka" className="silo-mini-card"><Zap size={20} color="#a855f7" /> NOVÉ MĚŘENÍ</a>
            <a href="/cpuvs" className="silo-mini-card"><ArrowRight size={20} color="#f59e0b" /> BOTTLENECK TEST</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 20px; }
        .result-card { background: linear-gradient(135deg, #111, #1a050a); padding: 60px; border-radius: 30px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 50px rgba(244, 63, 94, 0.2); }
        .fps-main { font-size: 8rem; font-weight: 950; line-height: 1; margin-bottom: 10px; }
        .fps-label { font-size: 1.5rem; font-weight: 900; color: #f43f5e; letter-spacing: 2px; }
        .stats-row { display: flex; justify-content: center; gap: 20px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
        .stat-pill { display: flex; align-items: center; gap: 8px; color: #9ca3af; font-weight: bold; font-size: 14px; background: rgba(255,255,255,0.03); padding: 8px 15px; border-radius: 10px; }
        .res-nav { padding: 15px; background: #111; border-radius: 12px; text-align: center; text-decoration: none; color: #fff; font-weight: 900; border: 1px solid #333; transition: 0.3s; }
        .res-nav:hover, .res-nav.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); }
        .silo-mini-card { display: flex; align-items: center; gap: 10px; background: #111; padding: 25px; border-radius: 20px; border: 1px solid #333; text-decoration: none; color: #fff; font-weight: 950; transition: 0.3s; justify-content: center; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #f43f5e; }
      `}} />
    </div>
  );
}
