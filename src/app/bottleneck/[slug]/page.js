import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '../../../utils/supabase/server';
import Script from 'next/script';
import Link from 'next/link';
import { 
  Cpu, Zap, ShoppingCart, Gauge, Monitor, 
  Activity, BookOpen, Calculator, HardDrive, ArrowRight 
} from 'lucide-react';
import HeurekaButtons from '../../../components/HeurekaButtons';
import SeznamAd from '../../../components/SeznamAd';
import BottleneckFatContent from '../../../components/BottleneckFatContent';
import GuruInContentOffer from '../../../components/GuruInContentOffer';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = createClient();
  const hwParts = slug.split('-at-')[0].split('-in-')[0].split('-with-');
  
  const { data: cpu } = await supabase.from('cpus').select('name').eq('slug', hwParts[0]).single();
  const { data: gpu } = await supabase.from('gpus').select('name').eq('slug', hwParts[1]).single();

  const titleName = cpu && gpu ? `${cpu.name} + ${gpu.name}` : slug.replace(/-/g, ' ').toUpperCase();

  return {
    title: `BOTTLENECK TEST: ${titleName} | Hardware Guru`,
    description: `Detailní analýza bottlenecku a herního výkonu pro ${titleName}. Zjisti, jak tato kombinace funguje v roce 2026.`,
    alternates: { canonical: `https://thehardwareguru.cz/bottleneck/${slug}` }
  };
}

export default async function BottleneckPage({ params }) {
  const { slug } = params;
  const supabase = createClient();
  const hwParts = slug.split('-at-')[0].split('-in-')[0].split('-with-');

  // FETCH DATA Z DB
  const [cpuRes, gpuRes] = await Promise.all([
    supabase.from('cpus').select('*, cpu_game_fps(*)').eq('slug', hwParts[0]).single(),
    supabase.from('gpus').select('*, game_fps(*)').eq('slug', hwParts[1]).single()
  ]);

  const cpu = cpuRes.data;
  const gpu = gpuRes.data;

  // Fallback pouze pro 9950X3D2 pokud by DB zrovna lagovala, jinak notFound
  if (!cpu || !gpu) {
      if (slug.includes('9950x3d2')) {
          // Dočasná data pro launch day
          const mockCpu = { name: "AMD Ryzen 9 9950X3D2", performance_index: 980 };
          const mockGpu = { name: "NVIDIA RTX 5090", performance_index: 2500 };
          return renderGuruLayout(mockCpu, mockGpu, slug);
      }
      return notFound();
  }

  return renderGuruLayout(cpu, gpu, slug);
}

function renderGuruLayout(cpu, gpu, slug) {
  const resParts = slug.split('-at-');
  const resolution = resParts[1] === '4k' ? '2160p' : (resParts[1] || '1440p');
  const gameParts = resParts[0].split('-in-');

  const bottleneckPercent = Math.max(0, Math.min(Math.round(((Math.max(gpu.performance_index, (cpu.performance_index * 2.9)) / Math.min(gpu.performance_index, (cpu.performance_index * 2.9))) - 1) * 45), 100));
  const subTag = `v12-bn-slug-${bottleneckPercent}`;

  const isGpuBottleneck = gpu.performance_index < cpu.performance_index * 2.5;
  let ultimateProduct = isGpuBottleneck ? "NVIDIA RTX 5090" : "AMD Ryzen 9 9950X3D2";
  let ultimateCategory = isGpuBottleneck ? "gpu" : "cpu";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `Bottleneck Test: ${cpu.name} + ${gpu.name}`,
    "image": "https://thehardwareguru.cz/og-bottleneck.png",
    "author": { "@type": "Person", "name": "The Hardware Guru" },
    "datePublished": "2026-04-22"
  };

  return (
    <div className="guru-site-wrapper" style={{ minHeight: '100vh', backgroundColor: '#050505', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', color: '#fff' }}>
      <Script type="application/ld+json" id="json-ld" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <SeznamAd zoneId={408654} width={970} height={210} />
        </div>

        <div className="guru-grid-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '30px' }}>
          
          <aside className="guru-left-sidebar">
            <div className="vip-sestava-card" style={{ background: 'rgba(15, 17, 21, 0.9)', border: '1px solid #eab308', borderRadius: '12px', padding: '15px' }}>
              <div className="vip-header" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <ShoppingCart size={18} style={{ color: '#eab308' }} />
                <div>
                  <small style={{ color: '#eab308', fontWeight: '900', fontSize: '10px' }}>ULTIMÁTNÍ HERNÍ DĚLO</small>
                  <h3 style={{ fontSize: '14px', fontWeight: '900' }}>V.I.P. GURU SESTAVA</h3>
                </div>
              </div>
              <div className="vip-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="vip-item"><span>{cpu.name}</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="vip-item"><span>RTX 5090 Founders</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="vip-item"><span>GIGABYTE X870E AORUS</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="vip-item"><span>64GB DDR5 6400MT/s</span> <button className="buy-btn">KOUPIT</button></div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <a href="https://smarty.cz" target="_blank" rel="nofollow">
                <img src="/smarty-banner.png" alt="Smarty" style={{ width: '100%', borderRadius: '12px' }} />
              </a>
            </div>
          </aside>

          <section className="guru-center-content">
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ color: '#66fcf1', border: '1px solid rgba(102,252,241,0.3)', padding: '6px 20px', borderRadius: '50px', fontSize: '11px', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Gauge size={16} /> <span>GURU BOTTLENECK ANALYSIS V12</span>
              </div>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 950, textTransform: 'uppercase', marginTop: '15px' }}>
                {cpu.name} <span style={{ color: '#a855f7' }}>+</span> {gpu.name}
              </h1>
            </header>

            <GuruInContentOffer 
                productName={ultimateProduct} 
                category={ultimateCategory} 
                reason="upgrade"
                subId={subTag}
            />

            <div style={{ marginTop: '40px' }}>
              <BottleneckFatContent 
                  cpuName={cpu.name} 
                  gpuName={gpu.name} 
                  gameName={gameParts[1]?.replace(/-/g, ' ').toUpperCase() || 'MODERNÍCH HRÁCH'} 
                  resolution={resolution === '2160p' ? '4K' : resolution} 
                  bottleneckPercent={bottleneckPercent} 
                  bottleneckType={bottleneckPercent < 15 ? 'Balanced' : (gpu.performance_index > cpu.performance_index * 2.9 ? 'CPU' : 'GPU')} 
                  isEn={false} 
              />
            </div>
          </section>

          <aside className="guru-right-sidebar">
            <div className="heureka-widget" style={{ background: '#fff', padding: '20px', borderRadius: '12px', color: '#000' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#666', marginBottom: '15px' }}>VÝHODNÝ NÁKUP</h4>
              <a 
                href={`https://www.heureka.cz/?h%5Bfraze%5D=${cpu.name.replace(/\s+/g, '+')}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subTag}`}
                className="heureka-hn-link"
                data-trixam-positionid="276034"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', background: '#f7e000', padding: '12px', borderRadius: '8px', textDecoration: 'none', color: '#000', fontWeight: '900', textAlign: 'center', fontSize: '13px', marginBottom: '10px' }}
              >
                👉 {cpu.name} nejnižší cena
              </a>
              <HeurekaButtons />
            </div>

            <div className="ecosystem-widget" style={{ marginTop: '20px', background: 'rgba(15, 17, 21, 0.9)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <h4 style={{ color: '#a855f7', fontSize: '12px', fontWeight: '950', marginBottom: '15px' }}>EKOSYSTÉM</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/ram-kalkulacka" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}><Activity size={16} /> RAM Simulátor</Link>
                <Link href="/fps-kalkulacka" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}><Zap size={16} /> FPS Kalkulačka</Link>
                <Link href="/slovnik" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}><BookOpen size={16} /> Guru Slovník</Link>
              </nav>
            </div>
          </aside>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .vip-item { display: flex; justify-content: space-between; align-items: center; font-size: 11px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; }
          .buy-btn { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid #66fcf1; font-size: 9px; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: 900; }
          @media (max-width: 1200px) {
            .guru-grid-layout { grid-template-columns: 1fr; }
            .guru-left-sidebar, .guru-right-sidebar { display: none; }
          }
        `}} />
      </main>

      <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10,11,13,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <SeznamAd zoneId={408654} width={970} height={90} />
      </div>
    </div>
  );
}
