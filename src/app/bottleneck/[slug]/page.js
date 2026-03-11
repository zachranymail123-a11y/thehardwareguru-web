import React, { cache } from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  Monitor, 
  Gauge, 
  CheckCircle2,
  Flame,
  Heart,
  Swords,
  PlugZap,
  Layers,
  Database,
  Info
} from 'lucide-react';

/**
 * GURU BOTTLENECK & PAIRING ENGINE V1.5 (SYNERGY & PSU UPDATE)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🚀 TARGET: SEO Monster Cluster (CPU + GPU combinations).
 * 🛡️ LOGIC: Vypočítává bottleneck, doporučený zdroj (PSU) a kompatibilitu čipsetů.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');

// 🛡️ GURU ENGINE: Robustní vyhledávání CPU
const findCpu = async (slug) => {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${slug}&limit=1`, { headers, cache: 'no-store' });
    const data = await res.json();
    if (data?.length) return data[0];
    
    const clean = slug.replace(/-/g, ' ').replace(/ryzen|core|intel|amd/gi, '').trim();
    const tokens = clean.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length > 0) {
        const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
        const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&and=(${conditions})&limit=1`, { headers, cache: 'no-store' });
        const data2 = await res2.json();
        return data2?.[0] || null;
    }
  } catch (e) { return null; }
  return null;
};

// 🛡️ GURU ENGINE: Robustní vyhledávání GPU
const findGpu = async (slug) => {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&slug=eq.${slug}&limit=1`, { headers, cache: 'no-store' });
    const data = await res.json();
    if (data?.length) return data[0];
    
    const clean = slug.replace(/-/g, ' ').replace(/geforce|rtx|radeon|rx|nvidia|amd/gi, '').trim();
    const tokens = clean.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length > 0) {
        const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
        const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&and=(${conditions})&limit=1`, { headers, cache: 'no-store' });
        const data2 = await res2.json();
        return data2?.[0] || null;
    }
  } catch (e) { return null; }
  return null;
};

const getPairData = cache(async (slug) => {
  const cleanSlug = slug.replace(/^en-/, '');
  const parts = cleanSlug.split('-with-');
  if (parts.length !== 2) return null;
  const [cpu, gpu] = await Promise.all([findCpu(parts[0]), findGpu(parts[1])]);
  return { cpu, gpu };
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = rawSlug.startsWith('en-');
  const data = await getPairData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Analysis | Hardware Guru' };

  return { 
    title: isEn 
      ? `${data.cpu.name} + ${data.gpu.name} Bottleneck, PSU & Build Guide`
      : `${data.cpu.name} + ${data.gpu.name} – Bottleneck, zdroj a doporučení`,
  };
}

export default async function BottleneckPage({ params, isEn: forcedIsEn }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = forcedIsEn || rawSlug.startsWith('en-');
  const data = await getPairData(rawSlug);

  if (!data?.cpu || !data?.gpu) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#ff0055', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
      DATA NENALEZENA - ZKONTROLUJTE SLUGY V DATABÁZI
    </div>
  );

  const { cpu, gpu } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  // 🧠 BOTTLENECK & SYNERGY LOGIC
  let bottleneckScore = 0;
  let bottleneckType = 'none';
  if (cpuPower < gpuPower * 0.75) {
      bottleneckScore = Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100);
      bottleneckType = 'cpu';
  } else if (gpuPower < cpuPower * 0.6) {
      bottleneckScore = Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100);
      bottleneckType = 'gpu';
  }

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');
  
  // ⚡ PSU CALCULATION
  const totalTdp = (Number(cpu.tdp_w) || 65) + (Number(gpu.tdp_w) || 200);
  const recommendedPsu = Math.ceil((totalTdp * 1.6) / 50) * 50; // Bezpečnostní rezerva 60 %

  // 🛠️ COMPATIBILITY LOGIC
  const getChipset = (cpuName) => {
      const name = cpuName.toUpperCase();
      if (name.includes('I9') || name.includes('I7') || name.includes('9900') || name.includes('9950')) return 'Z790 / X870';
      if (name.includes('I5') || name.includes('7600') || name.includes('7800')) return 'B760 / B650';
      return 'H610 / A620';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Gauge size={16} /> GURU BUILD OPTIMIZER
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: '#f59e0b' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', fontSize: '0.6em', opacity: 0.5 }}>+</span> <br/>
            <span style={{ color: '#66fcf1' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
            
            {/* LEVÝ SLOUPEC: BOTTLENECK GAUGE */}
            <section style={{ background: 'rgba(15, 17, 21, 0.95)', borderTop: `8px solid ${statusColor}`, borderRadius: '24px', padding: '50px 40px', textAlign: 'center', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }}>
                <div style={{ fontSize: '13px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? 'Pairing Bottleneck' : 'Vzájemný Bottleneck'}
                </div>
                <div style={{ fontSize: 'clamp(60px, 12vw, 100px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '20px 0' }}>
                    {bottleneckScore}%
                </div>
                <div style={{ background: `${statusColor}20`, color: statusColor, padding: '12px 30px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '15px', border: `1px solid ${statusColor}40`, marginBottom: '30px' }}>
                    {bottleneckScore < 15 ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    {bottleneckScore < 15 ? (isEn ? 'GREAT SYNERGY' : 'SKVĚLÁ SYNERGIE') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
                </div>
                
                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={18} color="#66fcf1" /> {isEn ? 'Guru Verdict' : 'Verdikt Guru'}
                    </h3>
                    <p style={{ color: '#d1d5db', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>
                        {bottleneckType === 'cpu' ? (
                            isEn ? `The ${cpu.name} will hold back the ${gpu.name} in many scenarios. Consider a more powerful CPU to unlock full GPU potential.` : `Procesor ${cpu.name} bude v mnoha situacích brzdit kartu ${gpu.name}. Zvažte silnější CPU pro plné využití grafiky.`
                        ) : bottleneckType === 'gpu' ? (
                            isEn ? `The ${gpu.name} is the weakest link here. Your CPU is ready for a much faster graphics card.` : `Grafická karta ${gpu.name} je zde nejslabším článkem. Váš procesor by zvládl i mnohem silnější grafiku.`
                        ) : (
                            isEn ? `This is a perfectly balanced system. Both components work together with excellent efficiency.` : `Toto je skvěle vyvážený systém. Obě komponenty spolupracují s vynikající efektivitou.`
                        )}
                    </p>
                </div>
            </section>

            {/* PRAVÝ SLOUPEC: POWER & COMPATIBILITY */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(15, 17, 21, 0.8)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <PlugZap size={32} color="#f59e0b" style={{ marginBottom: '15px' }} />
                    <div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>Doporučený zdroj (PSU)</div>
                    <div style={{ fontSize: '32px', fontWeight: '950', color: '#fff', margin: '5px 0' }}>{recommendedPsu}W</div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>{isEn ? 'Min. 80+ Gold recommended' : 'Doporučujeme min. 80+ Gold'}</div>
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.8)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Layers size={32} color="#66fcf1" style={{ marginBottom: '15px' }} />
                    <div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>Ideální čipset desky</div>
                    <div style={{ fontSize: '24px', fontWeight: '950', color: '#fff', margin: '5px 0' }}>{getChipset(cpu.name)}</div>
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.8)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Database size={32} color="#a855f7" style={{ marginBottom: '15px' }} />
                    <div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>Doporučená RAM</div>
                    <div style={{ fontSize: '24px', fontWeight: '950', color: '#fff', margin: '5px 0' }}>{cpu.name.includes('7000') || cpu.name.includes('Ultra') ? 'DDR5 6000MHz+' : 'DDR4 3600MHz+'}</div>
                </div>
            </aside>
        </div>

        {/* 🚀 COMPONENT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '40px 0 60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.8)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Cpu size={32} color="#f59e0b" style={{ margin: '0 auto 15px' }} />
                <div style={{ fontSize: '24px', fontWeight: '950', color: '#fff' }}>{cpu.performance_index} PTS</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '5px' }}>{cpu.name}</div>
            </div>
            <div style={{ background: 'rgba(15, 17, 21, 0.8)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Monitor size={32} color="#66fcf1" style={{ margin: '0 auto 15px' }} />
                <div style={{ fontSize: '24px', fontWeight: '950', color: '#fff' }}>{gpu.performance_index} PTS</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '5px' }}>{gpu.name}</div>
            </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '80px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'GAME DEALS' : 'HRY ZA TOP CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-deals-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; border-radius: 16px; font-weight: 950; text-transform: uppercase; flex: 1; min-width: 250px; }
        .guru-support-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; background: #eab308; color: #000; text-decoration: none; border-radius: 16px; font-weight: 950; text-transform: uppercase; flex: 1; min-width: 250px; }
        @media (max-width: 768px) {
            main > div { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}
