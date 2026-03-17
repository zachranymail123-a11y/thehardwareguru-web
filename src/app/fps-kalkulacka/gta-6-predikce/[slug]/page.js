import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sparkles, Award, ArrowRight, ChevronLeft, Zap, Monitor, Cpu } from 'lucide-react';
import FpsCalculatorClient from '../../FpsCalculatorClient'; // Pro možnost nového výpočtu

export const dynamic = 'force-dynamic';

export default async function Gta6PredictionPage({ params, searchParams }) {
  const { cpuId, gpuId } = searchParams;
  const slug = params.slug; // amd-ryzen-7-7800x3d-vs-rtx-4080-1440p
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // 1. Zjistíme rozlišení ze slug
  const resolution = slug.endsWith('2160p') ? '4k' : slug.endsWith('1440p') ? '1440p' : '1080p';
  const resKey = resolution === '4k' ? 'alan_wake_2_4k' : `alan_wake_2_${resolution}`;

  // 2. Fetch data pro Alana (náš base engine)
  const [gpuData, cpuData, gpus, cpus, games] = await Promise.all([
    supabase.from('game_fps').select('*').eq('gpu_id', gpuId).maybeSingle(),
    supabase.from('cpu_game_fps').select('*').eq('cpu_id', cpuId).maybeSingle(),
    supabase.from('gpus').select('id,name,vendor,slug').order('name'),
    supabase.from('cpus').select('id,name').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  const gpuFps = gpuData.data?.[resKey] || 0;
  const cpuFps = cpuData.data?.[resKey] || 0;
  
  // 🚀 GURU PREDICTION MATH: Alan Wake 2 FPS * 0.85 (daň za GTA 6 open-world)
  const baseFps = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);
  const predictedFps = Math.round(baseFps * 0.85);

  const hwName = `${cpus.data?.find(c => c.id === cpuId)?.name} + ${gpus.data?.find(g => g.id === gpuId)?.name}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', paddingTop: '120px', color: '#fff' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="pred-badge"><Sparkles size={16} /> AI NEXT-GEN PREDIKCE</div>
          <h1 style={{ fontSize: '3rem', fontWeight: '950', textTransform: 'uppercase' }}>
            GTA VI: <span style={{ color: '#f43f5e' }}>{predictedFps} FPS</span>
          </h1>
          <p style={{ color: '#9ca3af', fontWeight: 'bold' }}>Odhadovaný výkon pro sestavu: {hwName} ({resolution})</p>
        </header>

        {/* HLAVNÍ VÝSLEDEK */}
        <div className="result-box">
            <div style={{ fontSize: '8rem', fontWeight: '950', lineHeight: 1 }}>{predictedFps}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f43f5e' }}>OČEKÁVANÉ FPS</div>
            
            <div className="details-grid">
                <div className="detail-item"><Cpu size={20} /> CPU Limit: {Math.round(cpuFps * 0.85)} FPS</div>
                <div className="detail-item"><Monitor size={20} /> GPU Limit: {Math.round(gpuFps * 0.85)} FPS</div>
            </div>
        </div>

        {/* PROLINKOVÁNÍ NA DALŠÍ ROZLIŠENÍ (SEO MULTIPLIER) */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
             {['1080p', '1440p', '2160p'].map(res => (
                 <a key={res} href={`/fps-kalkulacka/gta-6-predikce/${slug.split('-vs-')[0]}-vs-${slug.split('-vs-')[1].split('-')[0]}-${res}?cpuId=${cpuId}&gpuId=${gpuId}`} className={`res-link ${resolution === res ? 'active' : ''}`}>
                    {res} Predikce
                 </a>
             ))}
        </div>

        {/* EXTRÉMNÍ PROLINKOVÁNÍ ZPĚT */}
        <div style={{ marginTop: '60px', borderTop: '1px solid #1f2937', paddingTop: '40px' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: 900 }}>DALŠÍ GURU NÁSTROJE:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <a href="/fps-kalkulacka" className="silo-mini-card"><Zap size={18} /> ZPĚT NA KALKULAČKU</a>
                <a href="/cpuvs" className="silo-mini-card"><ArrowRight size={18} /> BOTTLENECK TEST</a>
            </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 20px; }
        .result-box { background: linear-gradient(135deg, #111, #1a050a); padding: 60px; border-radius: 30px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 50px rgba(244, 63, 94, 0.2); }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
        .detail-item { display: flex; align-items: center; justify-content: center; gap: 10px; color: #9ca3af; font-weight: bold; font-size: 14px; }
        .res-link { padding: 15px; background: #111; border-radius: 12px; text-align: center; text-decoration: none; color: #fff; font-weight: 900; border: 1px solid #333; }
        .res-link.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); }
        .silo-mini-card { display: flex; align-items: center; gap: 10px; background: #111; padding: 20px; border-radius: 15px; text-decoration: none; color: #fff; font-weight: 900; }
      `}} />
    </div>
  );
}
