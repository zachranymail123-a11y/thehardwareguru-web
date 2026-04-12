import React from 'react';
import { notFound } from 'next/navigation';
import { 
 Zap, ShieldCheck, Cpu, Monitor, Gauge, Award, ShoppingCart, ChevronRight, TrendingUp, Clock, AlertTriangle, CheckCircle, Users
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import BottleneckFatContent from '../../../components/BottleneckFatContent'; 

export const runtime = "nodejs";
export const revalidate = 86400; 

const AMAZON_TAG = "thehardware07-20";
const BASE_URL = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/\s+/g, ' ').trim();

const cleanHeurekaProduct = (name = '') => {
  return name
    .replace(/\b(OC|Gaming|Dual|Ventus|Eagle|Trio|X Trio|Aero|Ghost|Pny|Zotac|Inno3d|Palit|Asrock|Msi|Gigabyte|Asus)\b/gi, '')
    .replace(/\b(12GB|16GB|8GB|24GB|10GB|20GB|4GB|6GB)\b/gi, '')
    .replace(/\b(SUPER|TI|XT|X3D)\b/gi, m => m.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

const encodeHeureka = (name = '') => {
    const clean = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clean.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).join('+');
};

const findHw = async (table, rawSlugPart) => {
  if (!rawSlugPart || rawSlugPart === 'undefined') return null;
  const slugPart = rawSlugPart.replace(/^en-/, '');
  const headers = { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` };
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`, { headers, cache: 'force-cache' });
      if (r.ok) { const d = await r.json(); if (d?.length) return d[0]; }
  } catch(e) { return null; }
  return null;
};

const findUpgrade = async (table, currentPerf) => {
    const headers = { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` };
    try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=name,slug,performance_index&performance_index=gt.${currentPerf * 1.2}&order=performance_index.asc&limit=1`, { headers });
        const data = await r.json();
        return data?.[0] || null;
    } catch(e) { return null; }
};

const getAnalysisData = async (slug) => {
  if (!slug) return null;
  const isEn = slug.startsWith('en-');
  const cleanSlug = slug.replace(/^en-/, '');
  
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] === '4k' ? '2160p' : (resParts[1] || '1440p'); 
  const gameParts = resParts[0].split('-in-');
  const gameSlug = gameParts[1] || null;
  const hwParts = gameParts[0].split('-with-');
  if (hwParts.length !== 2) return null;
  
  const [cpu, gpu] = await Promise.all([ findHw('cpus', hwParts[0]), findHw('gpus', hwParts[1]) ]);
  if (!cpu || !gpu) return null;

  const [upgradeCpu, upgradeGpu] = await Promise.all([
      findUpgrade('cpus', cpu.performance_index || 100),
      findUpgrade('gpus', gpu.performance_index || 100)
  ]);

  return { cpu, gpu, gameSlug, resolution, upgradeCpu, upgradeGpu, isEn, rawSlug: slug };
};

export async function generateMetadata({ params }) {
    const s = await params;
    const data = await getAnalysisData(s.slug);
    if (!data) return { title: 'Analysis' };
    const { cpu, gpu, resolution, isEn, rawSlug } = data;
    const displayRes = resolution === '2160p' ? '4K' : resolution.toUpperCase();
    
    return { 
        title: isEn ? `${cpu.name} + ${gpu.name} Bottleneck Test (${displayRes})` : `${cpu.name} + ${gpu.name} Bottleneck Test (${displayRes}) | Hardware Guru`,
        alternates: {
            canonical: `${BASE_URL}${isEn ? '/en' : ''}/bottleneck/${rawSlug.replace(/^en-/, '')}`,
        }
    };
}

export default async function BottleneckPage({ params }) {
  const s = await params;
  const data = await getAnalysisData(s.slug);

  if (!data?.cpu || !data?.gpu) return notFound();

  const { cpu, gpu, gameSlug, resolution, upgradeCpu, upgradeGpu, isEn } = data;

  const friendlyGameName = gameSlug ? gameSlug.replace(/-/g, ' ').toUpperCase() : (isEn ? 'MODERN TITLES' : 'MODERNÍCH HRÁCH');
  const friendlyRes = resolution === '2160p' ? '4K' : resolution;

  const resMod = resolution === '1080p' ? 0.85 : (resolution === '2160p' ? 1.25 : 1);
  const normalizedCpu = (cpu.performance_index || 100) * resMod * 2.9;
  const normalizedGpu = (gpu.performance_index || 100);
  const isCpuBottleneck = normalizedGpu > normalizedCpu;
  const diff = isCpuBottleneck ? (normalizedGpu / normalizedCpu) - 1 : (normalizedCpu / normalizedGpu) - 1;
  const bottleneckPercent = Math.max(0, Math.min(Math.round(diff * 45), 100));

  const baseFps = 60;
  const afterFps = Math.round(baseFps * (1 + (bottleneckPercent / 100) + 0.2));

  const targetGpuName = upgradeGpu?.name || "RTX 4070 SUPER";
  const targetCpuName = upgradeCpu?.name || "Ryzen 7 7800X3D";

  const getAmazonLink = (name, type) => {
      const q = encodeURIComponent(`${name} buy now best price deal gaming fps benchmark`);
      const subtag = `bn-${type}-${resolution}-${gameSlug || 'general'}`;
      return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=${subtag}`;
  };

  const hQueryGpu = encodeHeureka(cleanHeurekaProduct(targetGpuName));
  const hQueryCpu = encodeHeureka(cleanHeurekaProduct(targetCpuName));

  const heurekaGpuLink = `https://graficke-karty.heureka.cz/f:q:${hQueryGpu}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
  const heurekaCpuLink = `https://procesory.heureka.cz/f:q:${hQueryCpu}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

  return (
    <div className="guru-bottleneck-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <SeznamAd zoneId={408654} width={970} height={210} />

        <header style={{ textAlign: 'center', margin: '50px 0' }}>
          <div className="radar-badge" style={{ color: '#66fcf1', border: '1px solid rgba(102,252,241,0.3)', padding: '6px 20px', borderRadius: '50px', fontSize: '11px', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={16} /> 
            {isEn ? 'GURU REVENUE ENGINE V3.9.1' : 'GURU REVENUE ENGINE V3.9.1'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 950, textTransform: 'uppercase', marginTop: '20px' }}>
            {cpu.name} <span style={{ opacity: 0.2 }}>+</span> {gpu.name}
          </h1>
        </header>

        <section className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', padding: '35px', background: 'rgba(0,0,0,0.5)', borderRadius: '28px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            
            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Monitor size={16} /> {isEn ? 'GPU UPGRADE' : 'DOPORUČENÝ UPGRADE GRAFIKY'}
                </div>
                <div style={{ width: '100%' }}>
                    <div style={{ opacity: 0.6, fontSize: '12px', textAlign: 'center', marginBottom: '8px' }}>{isEn ? 'Starting from $399' : 'Běžně 15 490 Kč • Guru cena od 11 990 Kč'}</div>
                    <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 900, textAlign: 'center', marginBottom: '10px' }}>
                        {isEn ? `You are losing up to ${bottleneckPercent}% performance` : `📉 Ztrácíš až ${bottleneckPercent}% výkonu s aktuální kartou`}
                    </div>
                    <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, textAlign: 'center', marginBottom: '15px', border: '1px solid rgba(34,197,94,0.2)' }}>
                        🎮 {baseFps} FPS → {afterFps} FPS {isEn ? 'after upgrade' : 'po upgradu'}
                    </div>
                    <div style={{ fontWeight: 900, color: '#a855f7', marginBottom: '15px', textAlign: 'center' }}>🔥 {targetGpuName}</div>
                    {isEn ? (
                        <a href={getAmazonLink(targetGpuName, 'gpu')} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#f59e0b', color: '#000', padding: '18px', borderRadius: '14px', textDecoration: 'none', fontWeight: 950, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                           <ShoppingCart size={16} /> CHECK PRICE ON AMAZON
                        </a>
                    ) : (
                        <a href={heurekaGpuLink} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#3b82f6', color: '#fff', padding: '18px', borderRadius: '14px', textDecoration: 'none', fontWeight: 950, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                           <ShoppingCart size={16} /> NAJÍT NEJLEVNĚJŠÍ CENU TEĎ
                        </a>
                    )}
                </div>
            </div>

            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Zap size={16} /> {isEn ? 'CPU UPGRADE' : 'DOPORUČENÝ UPGRADE PROCESORU'}
                </div>
                <div style={{ width: '100%' }}>
                    <div style={{ opacity: 0.6, fontSize: '12px', textAlign: 'center', marginBottom: '8px' }}>{isEn ? 'Starting from $249' : 'Běžně 8 990 Kč • Guru cena od 6 490 Kč'}</div>
                    <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 900, textAlign: 'center', marginBottom: '10px' }}>
                        {isEn ? 'CPU is bottlenecking your potential' : '⚠️ Tvůj procesor brzdí potenciál grafiky'}
                    </div>
                    <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, textAlign: 'center', marginBottom: '15px', border: '1px solid rgba(34,197,94,0.2)' }}>
                        🚀 {isEn ? '+35% smoother gameplay experience' : '+35% plynulejší herní zážitek'}
                    </div>
                    <div style={{ fontWeight: 900, color: '#a855f7', marginBottom: '15px', textAlign: 'center' }}>🔥 {targetCpuName}</div>
                    {isEn ? (
                        <a href={getAmazonLink(targetCpuName, 'cpu')} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#f59e0b', color: '#000', padding: '18px', borderRadius: '14px', textDecoration: 'none', fontWeight: 950, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                           <ShoppingCart size={16} /> CHECK PRICE ON AMAZON
                        </a>
                    ) : (
                        <a href={heurekaCpuLink} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ background: '#3b82f6', color: '#fff', padding: '18px', borderRadius: '14px', textDecoration: 'none', fontWeight: 950, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                           <ShoppingCart size={16} /> NAJÍT NEJLEVNĚJŠÍ CENU TEĎ
                        </a>
                    )}
                </div>
            </div>
        </section>

        <div style={{ marginTop: '60px' }}>
            <BottleneckFatContent 
                cpuName={cpu.name} 
                gpuName={gpu.name} 
                gameName={friendlyGameName} 
                resolution={friendlyRes} 
                bottleneckPercent={bottleneckPercent}
                bottleneckType={bottleneckPercent < 5 ? 'Balanced' : (isCpuBottleneck ? 'CPU' : 'GPU')}
                isEn={isEn} 
            />
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ color: '#a855f7', fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {isEn ? 'Test different hardware combination' : 'Spočítej jinou kombinaci hardware'} <ChevronRight size={20} />
            </a>
        </div>
      </main>

      <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10,11,13,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)', z-index: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <SeznamAd zoneId={408654} width={970} height={90} />
      </div>
    </div>
  );
}
