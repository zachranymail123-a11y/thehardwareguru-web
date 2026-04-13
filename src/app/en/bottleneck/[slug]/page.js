import React from 'react';
import { notFound } from 'next/navigation';
import { 
 Zap, Cpu, Monitor, Gauge, ShoppingCart, Gamepad2, Activity
} from 'lucide-react';
import BottleneckFatContent from '../../../../components/BottleneckFatContent'; 
import GuruInContentOffer from '../../../../components/GuruInContentOffer';

export const runtime = "nodejs";
export const revalidate = 86400; 

const AMAZON_TAG = "thehardware07-20";

const findHw = async (table, slugPart) => {
  const headers = { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` };
  try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*,${table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)'}&slug=eq.${slugPart}`, { headers, cache: 'force-cache' });
      const data = await res.json();
      return data?.[0] || null;
  } catch(e) { return null; }
};

const findUpgrade = async (table, currentPerf) => {
    const headers = { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` };
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=name,slug,performance_index&performance_index=gt.${(Number(currentPerf) || 100) * 1.2}&order=performance_index.asc&limit=1`, { headers });
        const data = await res.json();
        return data?.[0] || null;
    } catch(e) { return null; }
};

export async function generateMetadata({ params }) {
    const p = params;
    const hwParts = String(p.slug || '').replace(/^en-/, '').split('-at-')[0].split('-in-')[0].split('-with-');
    return { title: `Bottleneck Analysis: ${hwParts[0]} + ${hwParts[1]}` };
}

export default async function BottleneckPageEn({ params }) {
  const p = params;
  const isEn = true;
  
  const cleanSlug = String(p.slug || '').replace(/^en-/, '');
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] === '4k' ? '2160p' : (resParts[1] || '1440p'); 
  const gameParts = resParts[0].split('-in-');
  const hwParts = gameParts[0].split('-with-');

  if (hwParts.length !== 2) return notFound();

  const [cpu, gpu] = await Promise.all([ 
      findHw('cpus', hwParts[0]), 
      findHw('gpus', hwParts[1]) 
  ]);

  if (!cpu || !gpu) return notFound();

  const [upgradeCpu, upgradeGpu] = await Promise.all([ 
      findUpgrade('cpus', cpu.performance_index), 
      findUpgrade('gpus', gpu.performance_index) 
  ]);

  const bottleneckPercent = Math.max(0, Math.min(Math.round(((Math.max(gpu.performance_index, (cpu.performance_index * 2.9)) / Math.min(gpu.performance_index, (cpu.performance_index * 2.9))) - 1) * 45), 100));
  const afterFps = Math.round(60 * (1 + (bottleneckPercent / 100) + 0.2));
  
  const targetGpuName = upgradeGpu?.name || "RTX 5070";
  const targetCpuName = upgradeCpu?.name || "Ryzen 7 9800X3D";

  // Zjištění typu bottlenecku pro EN verzi
  const isGpuBottleneck = gpu.performance_index < cpu.performance_index * 2.5;

  const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${AMAZON_TAG}&ascsubtag=bn-en-slug-${bottleneckPercent}`;

  return (
    <div className="guru-bottleneck-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', margin: '50px 0' }}>
          <div style={{ color: '#66fcf1', border: '1px solid rgba(102,252,241,0.3)', padding: '6px 20px', borderRadius: '50px', fontSize: '11px', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={16} /> <span>GURU BOTTLENECK ANALYSIS V12 (EN)</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 950, textTransform: 'uppercase', marginTop: '20px' }}>
            {cpu.name} <span style={{ opacity: 0.2 }}>+</span> {gpu.name}
          </h1>
        </header>

        {/* 🔥 GURU INTELIGENTNÍ DOPORUČENÍ (V12 EN) 🔥 */}
        <div style={{ margin: '40px 0' }}>
            <GuruInContentOffer 
                productName={isGpuBottleneck ? targetGpuName : targetCpuName} 
                category={isGpuBottleneck ? "gpu" : "cpu"} 
                reason="fix"
                isEn={true}
                subId={`bn-en-fix-${bottleneckPercent}`}
            />
        </div>

        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 900, marginBottom: '20px', color: '#facc15' }}>
          🔥 DETAILED UPGRADE OPTIONS
        </div>

        <section className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '35px', background: 'rgba(0,0,0,0.5)', borderRadius: '28px', border: '1px solid rgba(168,85,247,0.2)' }}>
            
            {/* GPU COLUMN */}
            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                    <Monitor size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> GPU UPGRADE
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>Guru Verified • In Stock</div>
                <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 900 }}>
                    🚀 {isGpuBottleneck ? `Fixes ${bottleneckPercent}% loss` : 'Boost FPS performance'}
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    ⚡ 60 FPS → {afterFps} FPS boost
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetGpuName}</div>
                
                <a href={getAmazonLink(targetGpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#f59e0b', color: '#000', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <ShoppingCart size={18} /> CHECK AMAZON PRICE
                </a>
            </div>

            {/* CPU COLUMN */}
            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                    <Zap size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> CPU UPGRADE
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>High Performance • Top Rated</div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    🚀 +35% smoother gameplay
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetCpuName}</div>
                
                <a href={getAmazonLink(targetCpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#f59e0b', color: '#000', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <ShoppingCart size={18} /> CHECK AMAZON PRICE
                </a>
            </div>
        </section>

        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/en/fps-calculator" style={{ background: '#0a0b0d', border: '1px solid #06b6d4', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Gamepad2 size={24} color="#06b6d4" />
                <span style={{ fontSize: '16px', fontWeight: '950', color: '#fff' }}>FPS CALCULATOR</span>
            </a>
            <a href="/en/bottleneck-calculator" style={{ background: '#0a0b0d', border: '1px solid #a855f7', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Activity size={24} color="#a855f7" />
                <span style={{ fontSize: '16px', fontWeight: '950', color: '#fff' }}>BOTTLENECK TEST</span>
            </a>
        </div>

        <div style={{ marginTop: '60px' }}>
            <BottleneckFatContent 
                cpuName={cpu.name} 
                gpuName={gpu.name} 
                gameName={gameParts[1]?.replace(/-/g, ' ').toUpperCase() || 'MODERN TITLES'} 
                resolution={resolution === '2160p' ? '4K' : resolution} 
                bottleneckPercent={bottleneckPercent} 
                bottleneckType={bottleneckPercent < 15 ? 'Balanced' : (gpu.performance_index > cpu.performance_index * 2.9 ? 'CPU' : 'GPU')} 
                isEn={isEn} 
            />
        </div>
      </main>
    </div>
  );
}
