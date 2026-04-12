import React from 'react';
import { notFound } from 'next/navigation';
import { 
 Zap, ShieldCheck, Cpu, Monitor, Gauge, Award, ShoppingCart, ChevronRight, TrendingUp, Clock, AlertTriangle, CheckCircle, Users, Gamepad2, Activity
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import BottleneckFatContent from '../../../components/BottleneckFatContent'; 

export const runtime = "nodejs";
export const revalidate = 86400; 

const AMAZON_TAG = "thehardware07-20";

const normalizeName = (name = '') => String(name || '').replace(/\s+/g, ' ').trim();

const cleanHeurekaProduct = (name = '') => {
  return String(name || '')
    .replace(/\b(OC|Gaming|Dual|Ventus|Eagle|Trio|X Trio|Aero|Ghost|Pny|Zotac|Inno3d|Palit|Asrock|Msi|Gigabyte|Asus)\b/gi, '')
    .replace(/\b(12GB|16GB|8GB|24GB|10GB|20GB|4GB|6GB)\b/gi, '')
    .replace(/\b(SUPER|TI|XT|X3D)\b/gi, m => m.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

const encodeHeureka = (name = '') => {
    const safe = String(name || '');
    const clean = safe.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clean.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).join('+');
};

const findHw = async (table, slugPart) => {
  const headers = { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` };
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`, { headers, cache: 'force-cache' });
      const data = await res.json();
      return data?.[0] || null;
  } catch(e) { return null; }
};

const findUpgrade = async (table, currentPerf) => {
    const perf = Number(currentPerf) || 100;
    const headers = { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` };
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=name,slug,performance_index&performance_index=gt.${perf * 1.2}&order=performance_index.asc&limit=1`, { headers });
        const data = await res.json();
        return data?.[0] || null;
    } catch(e) { return null; }
};

// 🔥 GENERATE METADATA - FIX PROTI CRASHNUTÍ
export async function generateMetadata({ params }) {
    const p = await params;
    const slug = p.slug || '';
    const isEn = slug.startsWith('en-');
    const cleanSlug = slug.replace(/^en-/, '');
    
    const hwParts = cleanSlug.split('-at-')[0].split('-in-')[0].split('-with-');
    if (hwParts.length !== 2) return { title: 'Hardware Analysis' };

    return { 
        title: isEn ? `Bottleneck Test: ${hwParts[0]} + ${hwParts[1]}` : `${hwParts[0]} + ${hwParts[1]} - Test Bottlenecku | Guru`,
    };
}

export default async function BottleneckPage({ params }) {
  const p = await params;
  const slug = String(p.slug || '');
  const isEn = slug.startsWith('en-');
  const cleanSlug = slug.replace(/^en-/, '');

  // Parsování slugu
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] === '4k' ? '2160p' : (resParts[1] || '1440p'); 
  const gameParts = resParts[0].split('-in-');
  const gameSlug = gameParts[1] || null;
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

  const friendlyGameName = gameSlug ? gameSlug.replace(/-/g, ' ').toUpperCase() : (isEn ? 'MODERN TITLES' : 'MODERNÍCH HRÁCH');
  const friendlyRes = resolution === '2160p' ? '4K' : resolution;

  const resMod = resolution === '1080p' ? 0.85 : (resolution === '2160p' ? 1.25 : 1);
  const normalizedCpu = (Number(cpu.performance_index) || 100) * resMod * 2.9;
  const normalizedGpu = (Number(gpu.performance_index) || 100);
  const isCpuBottleneck = normalizedGpu > normalizedCpu;
  const diff = isCpuBottleneck ? (normalizedGpu / normalizedCpu) - 1 : (normalizedCpu / normalizedGpu) - 1;
  const bottleneckPercent = Math.max(0, Math.min(Math.round(diff * 45), 100));

  const baseFps = 60;
  const afterFps = Math.round(baseFps * (1 + (bottleneckPercent / 100) + 0.2));

  const targetGpuName = upgradeGpu?.name || "RTX 4070 SUPER";
  const targetCpuName = upgradeCpu?.name || "Ryzen 7 7800X3D";

  const getAmazonLink = (name, type) => {
      const q = encodeURIComponent(`${name} buy now best price deal gaming fps benchmark`);
      const subtag = `bn-${type}-${resolution}`;
      return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=${subtag}`;
  };

  const heurekaGpuLink = `https://graficke-karty.heureka.cz/f:q:${encodeHeureka(cleanHeurekaProduct(targetGpuName))}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
  const heurekaCpuLink = `https://procesory.heureka.cz/f:q:${encodeHeureka(cleanHeurekaProduct(targetCpuName))}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

  return (
    <div className="guru-bottleneck-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <SeznamAd zoneId={408654} width={970} height={210} />

        <header style={{ textAlign: 'center', margin: '50px 0' }}>
          <div className="radar-badge" style={{ color: '#66fcf1', border: '1px solid rgba(102,252,241,0.3)', padding: '6px 20px', borderRadius: '50px', fontSize: '11px', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={16} /> <span>GURU ENGINE V3.9.8</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 950, textTransform: 'uppercase', marginTop: '20px' }}>
            {cpu.name} <span style={{ opacity: 0.2 }}>+</span> {gpu.name}
          </h1>
        </header>

        <section className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '35px', background: 'rgba(0,0,0,0.5)', borderRadius: '28px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            
            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                   <Monitor size={16} /> {isEn ? 'GPU UPGRADE' : 'DOPORUČENÝ UPGRADE GRAFIKY'}
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>{isEn ? 'From $399' : 'Guru cena od 11 990 Kč'}</div>
                <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 900, textAlign: 'center' }}>
                    {isEn ? `Losing up to ${bottleneckPercent}% FPS` : `📉 Ztrácíš až ${bottleneckPercent}% výkonu`}
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)' }}>
                    🎮 {baseFps} FPS → {afterFps} FPS
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetGpuName}</div>
                {isEn ? (
                    <a href={getAmazonLink(targetGpuName, 'gpu')} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#f59e0b', color: '#000', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center' }}>AMAZON DEALS</a>
                ) : (
                    <a href={heurekaGpuLink} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center' }}>NAJÍT NEJLEVNĚJŠÍ CENU</a>
                )}
            </div>

            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                   <Zap size={16} /> {isEn ? 'CPU UPGRADE' : 'DOPORUČENÝ UPGRADE PROCESORU'}
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>{isEn ? 'From $249' : 'Guru cena od 6 490 Kč'}</div>
                <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 900, textAlign: 'center' }}>
                    {isEn ? 'CPU limits your GPU' : '⚠️ Procesor brzdí grafiku'}
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)' }}>
                    🚀 {isEn ? '+35% smoother' : '+35% plynulejší'}
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetCpuName}</div>
                {isEn ? (
                    <a href={getAmazonLink(targetCpuName, 'cpu')} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#f59e0b', color: '#000', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center' }}>AMAZON DEALS</a>
                ) : (
                    <a href={heurekaCpuLink} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center' }}>NAJÍT NEJLEVNĚJŠÍ CENU</a>
                )}
            </div>
        </section>

        {/* GURU TOOLS SECTION */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ background: '#0a0b0d', border: '1px solid #06b6d4', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Gamepad2 size={24} color="#06b6d4" />
                <span style={{ fontSize: '16px', fontWeight: '950', color: '#fff' }}>FPS KALKULAČKA</span>
            </a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ background: '#0a0b0d', border: '1px solid #a855f7', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Activity size={24} color="#a855f7" />
                <span style={{ fontSize: '16px', fontWeight: '950', color: '#fff' }}>BOTTLENECK TEST</span>
            </a>
        </div>

        <div style={{ marginTop: '60px' }}>
            <BottleneckFatContent 
                cpuName={cpu.name} gpuName={gpu.name} 
                gameName={friendlyGameName} resolution={friendlyRes} 
                bottleneckPercent={bottleneckPercent}
                bottleneckType={isCpuBottleneck ? 'CPU' : 'GPU'}
                isEn={isEn} 
            />
        </div>
      </main>

      <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10,11,13,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <SeznamAd zoneId={408654} width={970} height={90} />
      </div>
    </div>
  );
}
