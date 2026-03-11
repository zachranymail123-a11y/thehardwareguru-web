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
 * GURU BOTTLENECK & PAIRING ENGINE V2.1 (ACCURATE HARDWARE LOGIC)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🛡️ FIX: Přesná logika pro AMD 7000-9000 (DDR5 6000, B850/X870) a AMD 5000 (DDR4 3600).
 * 🛡️ DESIGN: Guru Glass PCB Design.
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
      ? `${data.cpu.name} + ${data.gpu.name} Bottleneck & Build Guide`
      : `${data.cpu.name} + ${data.gpu.name} – Bottleneck a konfigurace`,
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
  
  // 🧠 BOTTLENECK LOGIC
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
  
  // ⚡ PSU LOGIC
  const totalTdp = (Number(cpu.tdp_w) || 65) + (Number(gpu.tdp_w) || 200);
  const recommendedPsu = Math.ceil((totalTdp * 1.6) / 50) * 50;

  // 🛠️ HARDWARE ACCURACY LOGIC
  const getChipset = (cpu) => {
      const name = cpu.name.toUpperCase();
      const vendor = (cpu.vendor || '').toUpperCase();
      
      if (vendor === 'AMD') {
          if (name.includes('9000') || name.includes('7000') || name.includes('8000')) return 'B650 / B850 / X870E';
          if (name.includes('5000') || name.includes('3000')) return 'B550 / X570 (AM4)';
          return 'B650 / X670E';
      }
      // Intel
      if (name.includes('ULTRA') || name.includes('285K') || name.includes('265K')) return 'Z890 / B860';
      if (name.includes('I9') || name.includes('I7')) return 'Z790 / B760';
      return 'B760 / H610';
  };

  const getRamRecommendation = (cpu) => {
      const name = cpu.name.toUpperCase();
      const vendor = (cpu.vendor || '').toUpperCase();

      if (vendor === 'AMD') {
          if (name.includes('9000') || name.includes('7000') || name.includes('8000')) return 'DDR5 6000 MT/s';
          if (name.includes('5000')) return 'DDR4 3600 MT/s';
          return 'DDR5 6000 MT/s';
      }
      // Intel
      if (name.includes('ULTRA') || name.includes('14') || name.includes('13')) return 'DDR5 6000 MT/s+';
      return 'DDR4 3600 MT/s';
  };

  const vendorCpuColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24';
  const vendorGpuColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Gauge size={16} /> GURU BOTTLENECK RADAR
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: vendorCpuColor }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', fontSize: '0.6em', opacity: 0.5 }}>+</span> <br/>
            <span style={{ color: vendorGpuColor }}>{normalizeName(gpu.name)}</span>
          </h1>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: '950', textTransform: 'uppercase', marginTop: '10px' }}>
            {isEn ? 'BOTTLENECK ANALYSIS' : 'ANALÝZA BOTTLENECKU'}
          </h2>
        </header>

        {/* 🚀 VELKÝ HERO BLOK (GLASS STYLE) */}
        <section style={{ marginBottom: '60px' }}>
            <div className="glass-card main-hero">
                <div style={{ color: '#66fcf1', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? 'Calculated System Bottleneck' : 'Vypočítaný systémový bottleneck'}
                </div>
                <div style={{ fontSize: 'clamp(80px, 15vw, 110px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '10px 0', textShadow: `0 0 40px ${statusColor}40` }}>
                    {bottleneckScore}<span style={{ fontSize: '30px' }}>%</span>
                </div>
                <div style={{ background: `${statusColor}20`, color: statusColor, padding: '10px 30px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${statusColor}40`, marginTop: '10px' }}>
                    {bottleneckScore < 15 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {bottleneckScore < 15 ? (isEn ? 'IDEAL PAIRING' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
                </div>
            </div>
        </section>

        {/* 🚀 TECHNICKÉ SPECIFIKACE (GLASS GRID) */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} /> {isEn ? 'CONFIGURATION DETAILS' : 'DETAILY KONFIGURACE'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              <div className="glass-card spec">
                  <PlugZap size={32} color="#f59e0b" style={{ marginBottom: '15px' }} />
                  <div className="spec-label">{isEn ? 'Recommended PSU' : 'Doporučený zdroj'}</div>
                  <div className="spec-val">{recommendedPsu}W</div>
                  <div className="spec-sub">Min. 80+ Gold</div>
              </div>

              <div className="glass-card spec">
                  <Layers size={32} color="#66fcf1" style={{ marginBottom: '15px' }} />
                  <div className="spec-label">{isEn ? 'Ideal Chipset' : 'Ideální čipset'}</div>
                  <div className="spec-val">{getChipset(cpu)}</div>
                  <div className="spec-sub">Socket {cpu.socket || (cpu.name.toUpperCase().includes('5000') ? 'AM4' : 'AM5 / LGA1700')}</div>
              </div>

              <div className="glass-card spec">
                  <Database size={32} color="#a855f7" style={{ marginBottom: '15px' }} />
                  <div className="spec-label">{isEn ? 'Recommended RAM' : 'Doporučená RAM'}</div>
                  <div className="spec-val">{getRamRecommendation(cpu)}</div>
                  <div className="spec-sub">Dual Channel Mode</div>
              </div>

          </div>
        </section>

        {/* 🚀 VERDIKT GURU */}
        <section style={{ marginBottom: '60px' }}>
            <div className="glass-card prose-box">
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1' }}>
                    <Info size={22} /> {isEn ? 'GURU FINAL VERDICT' : 'ZÁVĚREČNÝ VERDIKT GURU'}
                </h3>
                <div style={{ color: '#d1d5db', fontSize: '1.1rem', lineHeight: '1.8', margin: 0 }}>
                    {bottleneckType === 'cpu' ? (
                        <p>{isEn ? `The ${cpu.name} is the bottleneck here. It cannot keep up with the ${gpu.name}, causing FPS drops in CPU-intensive games.` : `V této sestavě je bottleneckem procesor ${cpu.name}. Nestíhá krmit kartu ${gpu.name} daty, což povede k záškubům v náročných hrách.`}</p>
                    ) : bottleneckType === 'gpu' ? (
                        <p>{isEn ? `The ${gpu.name} is the limit. Your CPU has much more potential than this graphics card can utilize.` : `Limitujícím faktorem je zde grafika ${gpu.name}. Váš procesor má mnohem vyšší potenciál, než tato karta dokáže využít.`}</p>
                    ) : (
                        <p>{isEn ? `This is a perfectly balanced high-end system. Both components represent an elite synergy for gaming.` : `Toto je skvěle vyvážený systém. Obě komponenty spolupracují s maximální efektivitou a představují elitní synergii.`}</p>
                    )}
                </div>
            </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '80px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'GAME DEALS' : 'HRY ZA TOP CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }

        .glass-card { background: rgba(15, 17, 21, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 30px; backdrop-filter: blur(15px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); transition: 0.3s; }
        .glass-card:hover { border-color: rgba(102, 252, 241, 0.2); transform: translateY(-5px); }
        
        .main-hero { padding: 60px 40px; textAlign: center; border-top: 2px solid rgba(255,255,255,0.1); text-align: center; }
        .prose-box { padding: 40px; border-left: 6px solid #66fcf1; }
        
        .glass-card.spec { padding: 35px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .spec-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .spec-val { font-size: 32px; font-weight: 950; color: #fff; margin-bottom: 5px; }
        .spec-sub { font-size: 13px; color: #9ca3af; font-weight: bold; }

        .guru-deals-btn { flex: 1; min-width: 250px; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 22px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; border-radius: 20px; font-weight: 950; text-transform: uppercase; transition: 0.3s; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.2); }
        .guru-support-btn { flex: 1; min-width: 250px; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 22px; background: #eab308; color: #000; text-decoration: none; border-radius: 20px; font-weight: 950; text-transform: uppercase; transition: 0.3s; box-shadow: 0 10px 30px rgba(234, 179, 8, 0.2); }
        
        .guru-deals-btn:hover, .guru-support-btn:hover { transform: scale(1.02); filter: brightness(1.1); }
      `}} />
    </div>
  );
}
