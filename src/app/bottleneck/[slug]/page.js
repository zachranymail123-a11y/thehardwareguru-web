'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { notFound, usePathname } from 'next/navigation';
import { 
 Zap, Cpu, Monitor, Gauge, ShoppingCart, ChevronRight, TrendingUp, Clock, AlertTriangle, Gamepad2, Activity
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import BottleneckFatContent from '../../../components/BottleneckFatContent'; 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const AMAZON_TAG = "thehardware07-20";

const cleanHeurekaProduct = (name = '') => {
  return String(name || '')
    .replace(/\b(OC|Gaming|Dual|Ventus|Eagle|Trio|X Trio|Aero|Ghost|Pny|Zotac|Inno3d|Palit|Asrock|Msi|Gigabyte|Asus)\b/gi, '')
    .replace(/\b(12GB|16GB|8GB|24GB|10GB|20GB|4GB|6GB)\b/gi, '')
    .replace(/\b(SUPER|TI|XT|X3D)\b/gi, m => m.toUpperCase())
    .replace(/\s+/g, ' ').trim();
};

const encodeHeureka = (name = '') => {
    const clean = String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clean.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).join('+');
};

export default function BottleneckPage({ params }) {
  const p = params;
  const pathname = usePathname() || '';
  const [cpu, setCpu] = useState(null);
  const [gpu, setGpu] = useState(null);
  const [upgradeCpu, setUpgradeCpu] = useState(null);
  const [upgradeGpu, setUpgradeGpu] = useState(null);
  const [loading, setLoading] = useState(true);

  // Načítání dat na straně klienta se zachováním logiky findHw a findUpgrade
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
  const afterFps = Math.round(60 * (1 + (bottleneckPercent / 100) + 0.2));
  
  const targetGpuName = upgradeGpu?.name || "RTX 5070";
  const targetCpuName = upgradeCpu?.name || "Ryzen 7 9800X3D";

  const subTag = `v10-bn-slug-${bottleneckPercent}`;

  // 🔥 V10 HARD-LOCK TRACKING LOGIC 🔥
  const handleHeurekaAction = (e, name, cat) => {
      e.preventDefault();
      const q = encodeHeureka(cleanHeurekaProduct(name));
      // Prioritní haff ID na začátku
      const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${q}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subTag}`;
      
      const payload = { 
          platform: 'heureka', 
          category: `bn_slug_${cat}`, 
          sub_id: subTag, 
          page: pathname 
      };

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
      }

      setTimeout(() => {
          window.location.href = targetUrl;
      }, 150);
  };

  const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name.replace(/NVIDIA |AMD |Intel /gi, '').trim())}`)}`;
  const getHeurekaFallbackLink = (name) => `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeHeureka(cleanHeurekaProduct(name))}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=slug-fallback`;

  return (
    <div className="guru-bottleneck-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <SeznamAd zoneId={408654} width={970} height={210} />
        
        <header style={{ textAlign: 'center', margin: '50px 0' }}>
          <div style={{ color: '#66fcf1', border: '1px solid rgba(102,252,241,0.3)', padding: '6px 20px', borderRadius: '50px', fontSize: '11px', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={16} /> <span>GURU REVENUE ENGINE V10 (CZ)</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 950, textTransform: 'uppercase', marginTop: '20px' }}>
            {cpu.name} <span style={{ opacity: 0.2 }}>+</span> {gpu.name}
          </h1>
        </header>

        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 900, marginBottom: '20px', color: '#facc15' }}>
          🔥 NEJLEPŠÍ UPGRADE PRO TUTO SESTAVU
        </div>

        <section className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '35px', background: 'rgba(0,0,0,0.5)', borderRadius: '28px', border: '1px solid rgba(168,85,247,0.2)' }}>
            
            {/* GPU COLUMN */}
            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                    <Monitor size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> DOPORUČENÝ UPGRADE GRAFIKY
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>Guru cena • Skladem</div>
                <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 900 }}>
                    📉 Ztrácíš až {bottleneckPercent}% výkonu
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    🚀 60 FPS → {afterFps} FPS po upgradu
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetGpuName}</div>
                
                <a 
                  href={getHeurekaFallbackLink(targetGpuName)} 
                  onClick={(e) => handleHeurekaAction(e, targetGpuName, 'gpu')}
                  target="_blank" 
                  rel="nofollow sponsored noopener noreferrer" 
                  style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
                >
                    <ShoppingCart size={18} /> NAJÍT NEJLEVNĚJŠÍ CENU
                </a>
                <a href={getSmartyLink(targetGpuName)} target="_blank" rel="nofollow" style={{ marginTop: '5px', fontSize: '12px', color: '#9ca3af', textDecoration: 'underline' }}>Koupit na Smarty.cz</a>
            </div>

            {/* CPU COLUMN */}
            <div className="affiliate-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase' }}>
                    <Zap size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> DOPORUČENÝ UPGRADE PROCESORU
                </div>
                <div style={{ opacity: 0.6, fontSize: '12px' }}>Guru cena • Skladem</div>
                <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 900 }}>
                    ⚠️ Procesor brzdí grafiku
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    🚀 +35% plynulejší hraní
                </div>
                <div style={{ fontWeight: 900, color: '#a855f7' }}>🔥 {targetCpuName}</div>
                
                <a 
                  href={getHeurekaFallbackLink(targetCpuName)} 
                  onClick={(e) => handleHeurekaAction(e, targetCpuName, 'cpu')}
                  target="_blank" 
                  rel="nofollow sponsored noopener noreferrer" 
                  style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
                >
                    <ShoppingCart size={18} /> NAJÍT NEJLEVNĚJŠÍ CENU
                </a>
                <a href={getSmartyLink(targetCpuName)} target="_blank" rel="nofollow" style={{ marginTop: '5px', fontSize: '12px', color: '#9ca3af', textDecoration: 'underline' }}>Koupit na Smarty.cz</a>
            </div>
        </section>

        {/* GURU TOOLS SECTION */}
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
