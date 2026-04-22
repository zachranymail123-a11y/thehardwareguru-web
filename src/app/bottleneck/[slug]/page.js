'use client';

import React, { useEffect, useState } from 'react';
import { notFound, usePathname } from 'next/navigation';
import { 
 Zap, Cpu, Monitor, Gauge, ShoppingCart, Gamepad2, Activity
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import BottleneckFatContent from '../../../components/BottleneckFatContent'; 
import { createClient } from '@supabase/supabase-js';
import GuruInContentOffer from '../../../components/GuruInContentOffer';
import Script from 'next/script';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BottleneckPage({ params }) {
  const p = params;
  const pathname = usePathname() || '';
  const [cpu, setCpu] = useState(null);
  const [gpu, setGpu] = useState(null);
  const [upgradeCpu, setUpgradeCpu] = useState(null);
  const [upgradeGpu, setUpgradeGpu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const cleanSlug = String(p.slug || '');
      const hwParts = cleanSlug.split('-at-')[0].split('-in-')[0].split('-with-');
      
      if (hwParts.length !== 2) { setLoading(false); return; }

      const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
      
      const [cpuRes, gpuRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${hwParts[0]}`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${hwParts[1]}`, { headers }).then(r => r.json())
      ]);

      const cpuData = cpuRes?.[0];
      const gpuData = gpuRes?.[0];

      if (cpuData && gpuData) {
        setCpu(cpuData);
        setGpu(gpuData);

        const [uCpuRes, uGpuRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/cpus?select=name,slug,performance_index&performance_index=gt.${(Number(cpuData.performance_index) || 100) * 1.2}&order=performance_index.asc&limit=1`, { headers }).then(r => r.json()),
          fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug,performance_index&performance_index=gt.${(Number(gpuData.performance_index) || 100) * 1.2}&order=performance_index.asc&limit=1`, { headers }).then(r => r.json())
        ]);
        
        setUpgradeCpu(uCpuRes?.[0]);
        setUpgradeGpu(uGpuRes?.[0]);
      }
      setLoading(false);
    };
    fetchData();
  }, [p.slug]);

  const cleanSlug = String(p.slug || '');
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] === '4k' ? '2160p' : (resParts[1] || '1440p'); 
  const gameParts = resParts[0].split('-in-');

  if (loading) return null;
  if (!cpu || !gpu) return notFound();

  const bottleneckPercent = Math.max(0, Math.min(Math.round(((Math.max(gpu.performance_index, (cpu.performance_index * 2.9)) / Math.min(gpu.performance_index, (cpu.performance_index * 2.9))) - 1) * 45), 100));
  
  const targetGpuName = upgradeGpu?.name || "NVIDIA RTX 5090";
  const targetCpuName = upgradeCpu?.name || "AMD Ryzen 9 9950X3D2";

  const isGpuBottleneck = gpu.performance_index < cpu.performance_index * 2.5;

  // 🔥 ULTIMÁTNÍ UPGRADE LOGIKA PRO 9950X3D2 🔥
  let ultimateProduct = isGpuBottleneck ? "NVIDIA RTX 5080" : "AMD Ryzen 7 9800X3D";
  let ultimateCategory = isGpuBottleneck ? "gpu" : "cpu";

  if (ultimateProduct === targetGpuName) ultimateProduct = "NVIDIA RTX 5090";
  // Pokud je návrh stejný jako stávající upgrade nebo hledáme absolutní top, dáme X3D2
  if (ultimateProduct === targetCpuName || !isGpuBottleneck) ultimateProduct = "AMD Ryzen 9 9950X3D2";

  const subTag = `v12-bn-slug-${bottleneckPercent}`;

  const getCleanHeurekaLink = (name, type) => {
      let query = String(name || '').replace(/NVIDIA |AMD |Intel |Ryzen |Core /gi, '').trim();
      if (type === 'cpu') query += " procesor";
      if (type === 'gpu') query += " grafická karta";
      const safeQuery = query.replace(/\s+/g, '+');
      return `https://www.heureka.cz/?h%5Bfraze%5D=${safeQuery}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subTag}`;
  };

  const handleSilentLog = (cat) => {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const payload = { platform: 'heureka', category: `bn_slug_${cat}`, sub_id: subTag, page: pathname };
          navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
      }
  };

  const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name.replace(/NVIDIA |AMD |Intel /gi, '').trim())}`)}`;

  // GOOGLE GOLDEN RICH - JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `Bottleneck Test: ${cpu.name} + ${gpu.name}`,
    "description": `Analýza úzkého hrdla pro sestavu s ${cpu.name} a ${gpu.name}. Výpočet bottlenecku v rozlišení ${resolution}.`,
    "author": { "@type": "Person", "name": "Hardware Guru" },
    "datePublished": "2026-04-22"
  };

  return (
    <div className="guru-bottleneck-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <Script type="application/ld+json" id="json-ld" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <SeznamAd zoneId={408654} width={970} height={210} />
        
        <header style={{ textAlign: 'center', margin: '50px 0' }}>
          <div style={{ color: '#66fcf1', border: '1px solid rgba(102,252,241,0.3)', padding: '6px 20px', borderRadius: '50px', fontSize: '11px', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={16} /> <span>GURU BOTTLENECK ANALYSIS V12</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 950, textTransform: 'uppercase', marginTop: '20px' }}>
            {cpu.name} <span style={{ opacity: 0.2 }}>+</span> {gpu.name}
          </h1>
        </header>

        <div style={{ margin: '40px 0' }}>
            <GuruInContentOffer 
                productName={ultimateProduct} 
                category={ultimateCategory} 
                reason="upgrade"
                subId={`bn-slug-smart-${bottleneckPercent}`}
            />
        </div>

        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 900, marginBottom: '20px', color: '#facc15' }}>
          🔥 DETAILNÍ MOŽNOSTI UPGRADU NA MÍRU TVÉ SESTAVĚ
        </div>

        <section className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '35px', background: 'rgba(0,0,0,0.5)', borderRadius: '28px', border: '1px solid rgba(168,85,247,0.2)' }}>
            
            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                    <Monitor size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> UPGRADE GRAFIKY
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>Guru cena • Skladem</div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    🚀 {isGpuBottleneck ? `Odstraní ${bottleneckPercent}% ztrátu` : 'Zvýší grafický výkon'}
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetGpuName}</div>
                
                <a 
                  href={getCleanHeurekaLink(targetGpuName, 'gpu')} 
                  onClick={() => handleSilentLog('gpu')}
                  target="_blank" 
                  rel="sponsored noopener" 
                  className="heureka-hn-link"
                  data-trixam-positionid="276026"
                  style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    <ShoppingCart size={18} /> ZJISTIT NEJNIŽŠÍ CENU
                </a>
                <a href={getSmartyLink(targetGpuName)} target="_blank" rel="nofollow sponsored" style={{ marginTop: '5px', fontSize: '12px', color: '#9ca3af', textDecoration: 'underline' }}>Koupit na Smarty.cz</a>
            </div>

            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                    <Zap size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> UPGRADE PROCESORU
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>Guru cena • Skladem</div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    🚀 +35% plynulejší hraní
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetCpuName}</div>
                
                <a 
                  href={getCleanHeurekaLink(targetCpuName, 'cpu')} 
                  onClick={() => handleSilentLog('cpu')}
                  target="_blank" 
                  rel="sponsored noopener" 
                  className="heureka-hn-link"
                  data-trixam-positionid="276027"
                  style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    <ShoppingCart size={18} /> ZJISTIT NEJNIŽŠÍ CENU
                </a>
                <a href={getSmartyLink(targetCpuName)} target="_blank" rel="nofollow sponsored" style={{ marginTop: '5px', fontSize: '12px', color: '#9ca3af', textDecoration: 'underline' }}>Koupit na Smarty.cz</a>
            </div>
        </section>

        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/fps-kalkulacka" style={{ background: '#0a0b0d', border: '1px solid #06b6d4', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Gamepad2 size={24} color="#06b6d4" />
                <span style={{ fontSize: '16px', fontWeight: '950', color: '#fff' }}>FPS KALKULAČKA</span>
            </a>
            <a href="/bottleneck-kalkulacka" style={{ background: '#0a0b0d', border: '1px solid #a855f7', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Activity size={24} color="#a855f7" />
                <span style={{ fontSize: '16px', fontWeight: '950', color: '#fff' }}>BOTTLENECK TEST</span>
            </a>
        </div>

        <div style={{ marginTop: '60px' }}>
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
      </main>

      <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10,11,13,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <SeznamAd zoneId={408654} width={970} height={90} />
      </div>
    </div>
  );
}
