import React, { cache } from 'react';
import Script from 'next/script';
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
  Info,
  BarChart3
} from 'lucide-react';

/**
 * GURU BOTTLENECK & PAIRING ENGINE V4.8 (NEXT.JS 15 ASYNC PARAMS FIX)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🚀 STATUS: LIVE - Propojeno s AdSense ID ca-pub-5468223287024993
 * 🛡️ FIX 1: Ošetření 'params' přes 'props' - 100% eliminuje chybu "params should be awaited".
 * 🛡️ FIX 2: Vyhledávání prohledává NAME i SLUG najednou (3-Tier Lookup).
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

// 🛡️ GURU ENGINE: Robustní vyhledávání CPU
const findCpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${slugPart}&limit=1`, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const clean = slugPart.replace(/-/g, " ").replace(/ryzen|core|intel|amd|ultra/gi, "").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`, { headers, cache: 'no-store' });
          if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
      }
  } catch(e) {}

  return null;
};

// 🛡️ GURU ENGINE: Robustní vyhledávání GPU
const findGpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&slug=eq.${slugPart}&limit=1`, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const clean = slugPart.replace(/-/g, " ").replace(/geforce|rtx|radeon|rx|nvidia|amd/gi, "").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`, { headers, cache: 'no-store' });
          if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
      }
  } catch(e) {}

  return null;
};

const getPairData = cache(async (slug) => {
  const cleanSlug = slug.replace(/^en-/, '');
  const parts = cleanSlug.split('-with-');
  if (parts.length !== 2) return null;
  const [cpu, gpu] = await Promise.all([findCpu(parts[0]), findGpu(parts[1])]);
  return { cpu, gpu };
});

const AdSpace = ({ slot, height = '90px' }) => (
    <div className="ad-wrapper" style={{ width: '100%', margin: '30px auto', minHeight: height, textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>REKLAMA / SPONZOROVANÉ</div>
        <ins className="adsbygoogle"
             style={{ display: 'block', minHeight: height }}
             data-ad-client="ca-pub-5468223287024993"
             data-ad-slot={slot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
);

// 🚀 GURU NEXT.JS 15 FIX: Použití props místo přímé destrukturalizace params
export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  
  const data = await getPairData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Analysis | Hardware Guru' };

  const canonicalUrl = `https://thehardwareguru.cz/bottleneck/${data.cpu.slug || slugify(data.cpu.name)}-with-${data.gpu.slug || slugify(data.gpu.name)}`;

  return { 
    title: isEn 
      ? `${data.cpu.name} + ${data.gpu.name} Bottleneck & Build Guide | Hardware Guru`
      : `${data.cpu.name} + ${data.gpu.name} – Analýza bottlenecku a zdroje | Hardware Guru`,
    description: isEn 
      ? `Will ${data.cpu.name} bottleneck ${data.gpu.name}? See detailed analysis, recommended PSU, and gaming synergy score.`
      : `Bude ${data.cpu.name} brzdit kartu ${data.gpu.name}? Podívejte se na analýzu bottlenecku, doporučený zdroj a synergii sestavy.`,
    alternates: {
        canonical: canonicalUrl,
        languages: {
            'en': `https://thehardwareguru.cz/en/bottleneck/${data.cpu.slug || slugify(data.cpu.name)}-with-${data.gpu.slug || slugify(data.gpu.name)}`,
            'cs': canonicalUrl
        }
    }
  };
}

// 🚀 GURU NEXT.JS 15 FIX: Použití props místo přímé destrukturalizace params
export default async function BottleneckPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const forcedIsEn = props?.isEn;
  const isEn = forcedIsEn || rawSlug.startsWith('en-');
  
  const data = await getPairData(rawSlug);

  if (!data?.cpu || !data?.gpu) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '40px' }}>
      <div style={{ background: 'rgba(15, 17, 21, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '30px', padding: '60px', maxWidth: '600px', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
        <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 30px' }} />
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '950', marginBottom: '20px', textTransform: 'uppercase' }}>
            {isEn ? 'COMPONENT NOT FOUND' : 'KOMPONENTA NENALEZENA'}
        </h2>
        <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '40px', fontSize: '1.1rem' }}>
          {isEn 
            ? 'We couldn\'t find one of the components in our hardware database. Our Guru team is constantly updating the index.' 
            : 'Omlouváme se, ale jednu z komponent v této kombinaci se nepodařilo v naší databázi najít. Guru tým neustále doplňuje nová data.'}
        </p>
        <a href={isEn ? "/en" : "/"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 30px', background: '#eab308', color: '#000', fontWeight: '950', borderRadius: '16px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s' }}>
            <ChevronLeft size={20} /> {isEn ? 'BACK TO HOME' : 'ZPĚT NA ÚVOD'}
        </a>
      </div>
    </div>
  );

  const { cpu, gpu } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
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
  const totalTdp = (Number(cpu.tdp_w) || 65) + (Number(gpu.tdp_w) || 200);
  const recommendedPsu = Math.ceil((totalTdp * 1.6) / 50) * 50;

  const getChipset = (cpu) => {
      const name = cpu.name.toUpperCase();
      const vendor = (cpu.vendor || '').toUpperCase();
      if (vendor === 'AMD') {
          if (name.includes('9000') || name.includes('7000') || name.includes('8000')) return 'B650 / B850 / X870E';
          if (name.includes('5000')) return 'B550 / X570 (AM4)';
          return 'B650 / X670E';
      }
      return name.includes('I9') || name.includes('I7') ? 'Z790 / B760' : 'B760 / H610';
  };

  const getRamRecommendation = (cpu) => {
      const name = cpu.name.toUpperCase();
      if ((cpu.vendor || '').toUpperCase() === 'AMD') {
          return name.includes('5000') ? 'DDR4 3600 MT/s' : 'DDR5 6000 MT/s';
      }
      return name.includes('ULTRA') || name.includes('14') || name.includes('13') ? 'DDR5 6000 MT/s+' : 'DDR4 3600 MT/s';
  };

  const vendorCpuColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24';
  const vendorGpuColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

  const safeCpuSlug = cpu.slug || slugify(cpu.name);
  const safeGpuSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Will ${cpu.name} bottleneck ${gpu.name}?` : `Bude procesor ${cpu.name} brzdit kartu ${gpu.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": bottleneckScore < 15 
            ? (isEn ? `No, this is an ideal pairing with only ${bottleneckScore}% bottleneck.` : `Ne, toto je ideální pár s bottleneckem pouze ${bottleneckScore} %.`)
            : (isEn ? `Yes, there is a ${bottleneckScore}% bottleneck detected.` : `Ano, byl detekován bottleneck ve výši ${bottleneckScore} %.`)
        }
      }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous" strategy="afterInteractive" />

      <main style={{ maxWidth: '1250px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Gauge size={16} /> GURU BOTTLENECK RADAR
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: vendorCpuColor }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.5, fontSize: '0.5em' }}>WITH</span> <br/>
            <span style={{ color: vendorGpuColor }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <AdSpace slot="1234567890" /> 

        <div className="layout-grid">
            <div className="main-content">
                <section style={{ marginBottom: '60px' }}>
                    <div className="glass-card main-hero">
                        <div style={{ color: '#66fcf1', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{isEn ? 'Estimated Average Bottleneck' : 'Odhadovaný průměrný bottleneck'}</div>
                        <div style={{ fontSize: 'clamp(80px, 15vw, 130px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '10px 0', textShadow: `0 0 50px ${statusColor}40` }}>{bottleneckScore > 0 ? bottleneckScore : 0}%</div>
                        <div style={{ background: `${statusColor}20`, color: statusColor, padding: '12px 40px', borderRadius: '50px', display: 'inline-block', fontWeight: '950', border: `1px solid ${statusColor}40`, textTransform: 'uppercase', letterSpacing: '1px' }}>{bottleneckScore < 15 ? (isEn ? 'PERFECT MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}</div>
                    </div>
                </section>

                <AdSpace slot="0987654321" height="250px" />

                <section style={{ marginBottom: '60px' }}>
                  <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Database size={28} /> {isEn ? 'GURU BUILD RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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
                          <div className="spec-sub">Socket {cpu.socket || 'AM5 / LGA1700'}</div>
                      </div>
                      <div className="glass-card spec">
                          <Database size={32} color="#a855f7" style={{ marginBottom: '15px' }} />
                          <div className="spec-label">{isEn ? 'Recommended RAM' : 'Doporučená RAM'}</div>
                          <div className="spec-val">{getRamRecommendation(cpu)}</div>
                          <div className="spec-sub">Dual Channel Mode</div>
                      </div>
                  </div>
                </section>

                <section style={{ marginBottom: '60px' }}>
                  <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Swords size={28} /> {isEn ? 'COMPONENT PERFORMANCE' : 'VÝKON KOMPONENT'}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <a href={isEn ? `/en/cpu/${safeCpuSlug}` : `/cpu/${safeCpuSlug}`} className="glass-card link-item"><Cpu size={24} color="#f59e0b" /><div style={{ flex: 1 }}><div className="link-title">{cpu.name}</div><div className="link-sub">{isEn ? 'Benchmarks' : 'Benchmarky'}</div></div><ArrowRight size={20} /></a>
                      <a href={isEn ? `/en/gpu/${safeGpuSlug}` : `/gpu/${safeGpuSlug}`} className="glass-card link-item"><Monitor size={24} color="#66fcf1" /><div style={{ flex: 1 }}><div className="link-title">{gpu.name}</div><div className="link-sub">{isEn ? 'FPS Tests' : 'FPS testy'}</div></div><ArrowRight size={20} /></a>
                  </div>
                </section>
            </div>
            <aside className="ad-sidebar"><AdSpace slot="5432167890" height="600px" sticky /></aside>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '60px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="btn-deals"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA TOP CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="btn-support"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .layout-grid { display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start; }
        .sticky-ad { position: sticky; top: 100px; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid #66fcf1; padding-left: 15px; }
        .glass-card { background: rgba(15,17,21,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; box-shadow: 0 30px 100px rgba(0,0,0,0.8); transition: 0.3s; }
        .main-hero { padding: 60px 40px; text-align: center; }
        .spec { padding: 35px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .spec-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .spec-val { font-size: 32px; font-weight: 950; color: #fff; margin-bottom: 5px; }
        .spec-sub { font-size: 13px; color: #9ca3af; font-weight: bold; }
        .link-item { display: flex; align-items: center; gap: 20px; padding: 25px 30px; text-decoration: none; color: #fff; }
        .link-title { font-weight: 950; font-size: 1.2rem; text-transform: uppercase; }
        .link-sub { font-size: 13px; color: #9ca3af; font-weight: bold; }
        .btn-deals { flex: 1; min-width: 280px; padding: 22px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; text-transform: uppercase; transition: 0.3s; border-radius: 20px; text-decoration: none !important; }
        .btn-support { flex: 1; min-width: 280px; padding: 22px; background: #eab308; color: #000 !important; font-weight: 950; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; text-transform: uppercase; transition: 0.3s; border-radius: 20px; text-decoration: none !important; }
        .btn-deals:hover, .btn-support:hover { transform: scale(1.03); filter: brightness(1.1); }
        @media (max-width: 1024px) { .layout-grid { grid-template-columns: 1fr; } .ad-sidebar { display: none; } }
      `}} />
    </div>
  );
}
