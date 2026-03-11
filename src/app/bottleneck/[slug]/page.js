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
  Swords
} from 'lucide-react';

/**
 * GURU BOTTLENECK & PAIRING ENGINE V1.0
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🚀 TARGET: SEO Monster Cluster (CPU + GPU combinations).
 * 🛡️ LOGIC: Vypočítává bottleneck na základě performance_index z DB.
 * 🛡️ DESIGN: Guru Premium (Gauges, Progress bars, Neon accents).
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');

// 🛡️ GURU ENGINE: 3-Tier Lookup pro CPU
const findCpu = async (slug) => {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${slug}&limit=1`, { headers, cache: 'no-store' });
    const data = await res.json();
    if (data?.length) return data[0];
    const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=ilike.*${slug}*&limit=1`, { headers, cache: 'no-store' });
    const data2 = await res2.json();
    return data2?.[0] || null;
  } catch (e) { return null; }
};

// 🛡️ GURU ENGINE: 3-Tier Lookup pro GPU
const findGpu = async (slug) => {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&slug=eq.${slug}&limit=1`, { headers, cache: 'no-store' });
    const data = await res.json();
    if (data?.length) return data[0];
    const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&slug=ilike.*${slug}*&limit=1`, { headers, cache: 'no-store' });
    const data2 = await res2.json();
    return data2?.[0] || null;
  } catch (e) { return null; }
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
  if (!data?.cpu || !data?.gpu) return { title: '404 | Hardware Guru' };

  const title = isEn 
    ? `${data.cpu.name} + ${data.gpu.name} Bottleneck Analysis & Pairing`
    : `${data.cpu.name} + ${data.gpu.name} – Analýza bottlenecku a párování`;

  return { 
    title: `${title} | The Hardware Guru`,
    alternates: {
        canonical: `https://thehardwareguru.cz/bottleneck/${data.cpu.slug}-with-${data.gpu.slug}`,
        languages: {
            'en': `https://thehardwareguru.cz/en/bottleneck/${data.cpu.slug}-with-${data.gpu.slug}`,
            'cs': `https://thehardwareguru.cz/bottleneck/${data.cpu.slug}-with-${data.gpu.slug}`
        }
    }
  };
}

export default async function BottleneckPage({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = rawSlug.startsWith('en-');
  const { cpu, gpu } = await getPairData(rawSlug) || {};

  if (!cpu || !gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>DATA NENALEZENA</div>;

  // 🧠 BOTTLENECK LOGIC V1.0 (Guru Proprietary)
  // Předpokládáme, že performance_index u CPU a GPU je v podobné škále.
  // Ideální poměr je 1:1. Pokud je CPU výrazně slabší, vzniká bottleneck.
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  // Výpočet procentuálního bottlenecku (orientační GURU metrika)
  let bottleneckScore = 0;
  let bottleneckType = 'none'; // 'none', 'cpu', 'gpu'
  
  if (cpuPower < gpuPower * 0.8) {
      bottleneckScore = Math.min(Math.round(((gpuPower / cpuPower) - 1) * 25), 100);
      bottleneckType = 'cpu';
  } else if (gpuPower < cpuPower * 0.7) {
      bottleneckScore = Math.min(Math.round(((cpuPower / gpuPower) - 1) * 15), 100);
      bottleneckType = 'gpu';
  }

  const getStatusColor = (score) => {
      if (score < 10) return '#10b981'; // Green
      if (score < 25) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
  };

  const statusColor = getStatusColor(bottleneckScore);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Gauge size={16} /> GURU BOTTLENECK RADAR
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: '#f59e0b' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', fontSize: '0.6em', opacity: 0.5 }}>WITH</span> <br/>
            <span style={{ color: '#66fcf1' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        {/* 🚀 BOTTLENECK HERO GAUGE */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `8px solid ${statusColor}`, borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? 'Estimated Bottleneck' : 'Odhadovaný Bottleneck'}
                </div>
                <div style={{ fontSize: 'clamp(60px, 12vw, 100px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '10px 0' }}>
                    {bottleneckScore}%
                </div>
                <div style={{ background: `${statusColor}20`, color: statusColor, padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${statusColor}40` }}>
                    {bottleneckScore < 10 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {bottleneckScore < 10 ? (isEn ? 'PERFECT MATCH' : 'IDEÁLNÍ PÁR') : (isEn ? 'BOTTLENECK DETECTED' : 'DETEKTOVÁN BOTTLENECK')}
                </div>
                
                <p style={{ marginTop: '30px', color: '#d1d5db', fontSize: '1.1rem', lineHeight: '1.7', maxWidth: '600px', margin: '30px auto 0' }}>
                    {bottleneckType === 'cpu' ? (
                        isEn ? `The ${cpu.name} is too weak for the ${gpu.name}. You will experience significant CPU-bound performance drops.` : `Procesor ${cpu.name} je pro kartu ${gpu.name} příliš slabý. Budete pociťovat propady FPS kvůli procesoru.`
                    ) : bottleneckType === 'gpu' ? (
                        isEn ? `The ${gpu.name} is the limiting factor here. Your CPU has plenty of headroom for a faster graphics card.` : `Grafická karta ${gpu.name} je v tomto páru limitujícím faktorem. Váš procesor by zvládl i mnohem silnější grafiku.`
                    ) : (
                        isEn ? `This is a perfectly balanced system. Both components work together without any major limitations.` : `Toto je skvěle vyvážený systém. Obě komponenty spolupracují bez zásadních omezení.`
                    )}
                </p>
            </div>
        </section>

        {/* 🚀 COMPONENT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.8)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Cpu size={32} color="#f59e0b" style={{ margin: '0 auto 15px' }} />
                <div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>CPU POWER</div>
                <div style={{ fontSize: '24px', fontWeight: '950', color: '#fff' }}>{cpu.performance_index} PTS</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '5px' }}>{cpu.name}</div>
            </div>
            <div style={{ background: 'rgba(15, 17, 21, 0.8)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Monitor size={32} color="#66fcf1" style={{ margin: '0 auto 15px' }} />
                <div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>GPU POWER</div>
                <div style={{ fontSize: '24px', fontWeight: '950', color: '#fff' }}>{gpu.performance_index} PTS</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '5px' }}>{gpu.name}</div>
            </div>
        </div>

        {/* 🚀 CTA BUTTONS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '80px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn">
                <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn">
                <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
        @media (max-width: 768px) {
            .guru-deals-btn, .guru-support-btn { width: 100%; }
        }
      `}} />
    </div>
  );
}
