import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Cpu, Monitor, Zap, AlertTriangle, TrendingUp, TrendingDown, Sparkles, Layers, Share2, Twitter } from 'lucide-react';

/**
 * GURU BOTTLENECK RESULT PAGE - V4.1 (SEO & VIRAL LOOP)
 * 🛡️ SEO: Server-side renderovaná stránka pro přesný index Googlem.
 * 🛡️ VIRAL: Kompletní interní prolinkování na hub.
 */

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata({ params, searchParams }) {
    const { slug } = await params;
    const cleanSlug = slug.replace(/-/g, ' ').toUpperCase();
    
    return {
        title: `Bottleneck: ${cleanSlug} | The Hardware Guru`,
        description: `Detailní analýza úzkého hrdla. Zjisti, jestli tento procesor brzdí grafiku v ${cleanSlug}. Včetně 1% Lows a latence.`,
        alternates: {
            canonical: `${baseUrl}/bottleneck-kalkulacka/${slug}`
        }
    };
}

export default async function BottleneckResultPage({ params, searchParams }) {
    const { cpuId, gpuId } = await searchParams;
    const { slug } = await params;

    if (!cpuId || !gpuId || !slug) return notFound();

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const [gpuRes, cpuRes] = await Promise.all([
        supabase.from('gpus').select('id,name,performance_index,vram_gb').eq('id', gpuId).maybeSingle(),
        supabase.from('cpus').select('id,name,performance_index').eq('id', cpuId).maybeSingle()
    ]);

    const gpu = gpuRes.data;
    const cpu = cpuRes.data;

    if (!gpu || !cpu) return notFound();

    const cpuName = cpu.name.toLowerCase();
    const gpuName = gpu.name.toLowerCase();
    const hwComboName = `${cpu.name} + ${gpu.name}`;

    const resolutionStr = slug.includes('2160p') ? '2160p' : slug.includes('1440p') ? '1440p' : '1080p';
    const displayResolution = resolutionStr === '2160p' ? '4K' : resolutionStr;

    let selectedGameSlug = 'generic';
    if (slug.includes('cyberpunk')) selectedGameSlug = 'cyberpunk-2077';
    else if (slug.includes('cs2')) selectedGameSlug = 'cs2';
    else if (slug.includes('alan-wake')) selectedGameSlug = 'alan-wake-2';
    else if (slug.includes('valorant')) selectedGameSlug = 'valorant';

    // ---------------------------------------------------------
    // 🚀 THE PROFESSIONAL ENGINE V4.0 (SERVER-SIDE BASELINE)
    // ---------------------------------------------------------

    const gameDataMap = {
        'cyberpunk-2077': { name: 'Cyberpunk 2077', thread_scaling: 0.85, api: 'dx12', cpu_weight: 1.2, gpu_weight: 1.5, vram_1440p: 10, fps_scale: 1.2 },
        'cs2': { name: 'Counter-Strike 2', thread_scaling: 0.3, api: 'dx11', cpu_weight: 0.5, gpu_weight: 0.4, vram_1440p: 4, fps_scale: 3.5 },
        'alan-wake-2': { name: 'Alan Wake 2', thread_scaling: 0.8, api: 'dx12', cpu_weight: 1.1, gpu_weight: 1.8, vram_1440p: 12, fps_scale: 0.9 },
        'valorant': { name: 'Valorant', thread_scaling: 0.25, api: 'dx11', cpu_weight: 0.4, gpu_weight: 0.3, vram_1440p: 4, fps_scale: 4.0 },
        'generic': { name: 'Obecný test (Průměr)', thread_scaling: 0.6, api: 'dx12', cpu_weight: 1.0, gpu_weight: 1.0, vram_1440p: 8, fps_scale: 1.4 }
    };
    const game = gameDataMap[selectedGameSlug];

    let ipcBase = 100; 
    let archEfficiency = 1.0;

    if (cpuName.includes('9800x3d') || cpuName.includes('9950x3d')) { ipcBase = 135; archEfficiency = 1.05; }
    else if (cpuName.includes('ryzen 9000')) { ipcBase = 125; archEfficiency = 1.05; }
    else if (cpuName.includes('7800x3d') || cpuName.includes('7950x3d')) { ipcBase = 115; archEfficiency = 1.0; }
    else if (cpuName.includes('ryzen 7000') || cpuName.includes('7600x') || cpuName.includes('7700x')) { ipcBase = 110; archEfficiency = 0.95; }
    else if (cpuName.includes('5800x3d')) { ipcBase = 95; archEfficiency = 0.95; }
    else if (cpuName.includes('ryzen 5000') || cpuName.includes('5600') || cpuName.includes('5800')) { ipcBase = 85; archEfficiency = 0.85; }
    else if (cpuName.includes('ryzen 3000')) { ipcBase = 65; archEfficiency = 0.80; }
    else if (cpuName.includes('core ultra') || cpuName.includes('285k')) { ipcBase = 130; archEfficiency = 1.05; }
    else if (cpuName.includes('14900') || cpuName.includes('14700') || cpuName.includes('14600')) { ipcBase = 125; archEfficiency = 1.0; }
    else if (cpuName.includes('13900') || cpuName.includes('13700') || cpuName.includes('13600')) { ipcBase = 115; archEfficiency = 1.0; }
    else if (cpuName.includes('12900') || cpuName.includes('12700') || cpuName.includes('12400')) { ipcBase = 100; archEfficiency = 0.95; }
    else if (cpuName.includes('11900') || cpuName.includes('11400')) { ipcBase = 80; archEfficiency = 0.85; }
    else if (cpuName.includes('10900') || cpuName.includes('10400')) { ipcBase = 75; archEfficiency = 0.80; }

    if (cpuName.includes('x3d')) archEfficiency *= (1 + (1 - game.thread_scaling) * 0.45);

    let cpuEffective = (ipcBase * (1 - game.thread_scaling) + cpu.performance_index * game.thread_scaling) * archEfficiency;
    if (game.api === 'dx11' && (gpuName.includes('rx ') || gpuName.includes('radeon'))) cpuEffective *= 0.90; 

    const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolutionStr];
    let gpuEffective = gpu.performance_index / resMultiplier;

    let requiredVram = game.vram_1440p;
    if (resolutionStr === '1080p') requiredVram *= 0.75;
    if (resolutionStr === '2160p') requiredVram *= 1.4;
    
    const actualVram = gpu.vram_gb || 8;
    let vramWarning = false;
    if (actualVram < requiredVram) {
        gpuEffective *= 0.65; 
        vramWarning = true;
    }

    const rawCpuFps = (cpuEffective / game.cpu_weight) * game.fps_scale;
    const rawGpuFps = (gpuEffective / game.gpu_weight) * game.fps_scale;
    let estFps = Math.max(10, Math.round(Math.min(rawCpuFps, rawGpuFps)));

    const diff = Math.abs(rawCpuFps - rawGpuFps) / Math.max(rawCpuFps, rawGpuFps);
    let boundType = 'BALANCED';
    let limitedBy = '';
    let bottleneckPercent = Math.round(diff * 100);

    if (diff < 0.08) { boundType = 'BALANCED'; bottleneckPercent = 0; } 
    else if (rawCpuFps < rawGpuFps) { boundType = 'CPU_BOUND'; limitedBy = 'CPU'; } 
    else { boundType = 'GPU_BOUND'; limitedBy = 'GPU'; }

    let latencyPenalty = game.thread_scaling < 0.4 ? 1.25 : 1.0; 
    if (vramWarning) latencyPenalty *= 1.5;
    let frameTimeMs = ((1000 / estFps) * latencyPenalty).toFixed(1);

    let low1Pct = Math.max(0.2, Math.min(0.95, 1 - (diff * 0.85) - (vramWarning ? 0.3 : 0)));
    let low1Fps = Math.round(estFps * low1Pct);

    // ---------------------------------------------------------

    const currentUrl = `${baseUrl}/bottleneck-kalkulacka/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;
    const shareText = `Moje sestava ${hwComboName} má ${bottleneckPercent}% Bottleneck v ${game.name}. Jak jste na tom vy?`;
    const redditLink = `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div className="pred-badge"><Layers size={16} /> PROFESIONÁLNÍ REPORT</div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
                        {hwComboName} <span style={{ color: '#a855f7' }}>({displayResolution})</span>
                    </h1>
                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#9ca3af', marginTop: '15px', textTransform: 'uppercase' }}>
                        Simulace enginu: <span style={{ color: '#fff' }}>{game.name}</span>
                    </p>
                </header>

                <div className="bn-result-card">
                    <div className="analysis-board">
                        <div className="status-header">
                            {boundType === 'CPU_BOUND' && <div className="bound-badge cpu"><TrendingDown size={20} /> CPU BOTTLENECK</div>}
                            {boundType === 'GPU_BOUND' && <div className="bound-badge gpu"><TrendingUp size={20} /> GPU BOTTLENECK</div>}
                            {boundType === 'BALANCED' && <div className="bound-badge balanced"><Sparkles size={20} /> BALANCED BUILD</div>}
                        </div>

                        <div className="percentage-display">
                            <div className="pct-value">{bottleneckPercent}<span style={{ fontSize: '3rem' }}>%</span></div>
                            <div className="pct-label">
                                {boundType === 'BALANCED' 
                                    ? 'Optimální využití systému' 
                                    : `${limitedBy} tě brzdí o ${bottleneckPercent}%`}
                            </div>
                        </div>

                        <div className="pro-metrics-grid">
                            <div className="metric-box">
                                <div className="m-label">AVG FPS (Základ)</div>
                                <div className="m-val">{estFps}</div>
                            </div>
                            <div className={`metric-box ${(low1Pct < 0.6 || vramWarning) ? 'alert' : ''}`}>
                                <div className="m-label">1% LOWS</div>
                                <div className="m-val">{low1Fps}</div>
                            </div>
                            <div className="metric-box">
                                <div className="m-label">LATENCY</div>
                                <div className="m-val">{frameTimeMs} <span style={{fontSize:'14px'}}>ms</span></div>
                            </div>
                        </div>

                        {vramWarning && (
                            <div className="warning-box">
                                <AlertTriangle size={24} color="#ef4444" style={{flexShrink: 0}} />
                                <div>
                                    <strong>Kritický nedostatek VRAM!</strong> Hra v tomto rozlišení agresivně swapuje do operační paměti. Očekávej brutální stuttering a záseky.
                                </div>
                            </div>
                        )}

                        <div className="recommendation">
                            <h4>💡 Guru Verdikt</h4>
                            {boundType === 'CPU_BOUND' && <p>Tvoje grafika čeká na instrukce od procesoru. Hra může působit trhaně i přes vysoké AVG FPS. Ideální by byl upgrade procesoru (nejlépe model s X3D cache), nebo zkusit hrát ve vyšším rozlišení.</p>}
                            {boundType === 'GPU_BOUND' && <p>Procesor má velkou rezervu a systém je bržděn hrubým výkonem grafiky. Obraz bude díky silnému CPU stabilní (dobrý frame pacing), ale pro více FPS budeš muset zapnout DLSS/FSR nebo upgradovat GPU.</p>}
                            {boundType === 'BALANCED' && <p>Nádherně vyvážená sestava. Procesor i grafická karta k sobě přesně pasují a tahají za jeden provaz. Zde není potřeba nic měnit.</p>}
                        </div>
                    </div>
                </div>

                {/* 💰 ADSENSE SLOT */}
                <div style={{ margin: '40px 0', minHeight: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(168, 85, 247, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#4b5563', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '2px' }}>SPONZOROVANÝ OBSAH</span>
                    <ins className="adsbygoogle"
                         style={{ display: 'block', width: '100%' }}
                         data-ad-client="ca-pub-5468223287024993"
                         data-ad-slot="1234567890" 
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                    <script dangerouslySetInnerHTML={{ __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});' }} />
                </div>

                {/* AKCE A SDÍLENÍ */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '40px' }}>
                    <a href="/bottleneck-kalkulacka" className="action-btn primary">
                        <Cpu size={18} /> OTESTOVAT MŮJ PC
                    </a>
                    <a href={redditLink} target="_blank" rel="noopener noreferrer" className="action-btn reddit">
                        Sdílet na Reddit
                    </a>
                    <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="action-btn x">
                        <Twitter size={18} /> Sdílet na X
                    </a>
                </div>

                {/* GURU HUB PROLINKOVÁNÍ */}
                <div className="guru-hub-links">
                    <h3 style={{ fontSize: '14px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '20px' }}>
                        Další GURU Nástroje
                    </h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a href="/fps-kalkulacka" className="hub-btn">
                            <Monitor size={18} color="#66fcf1" /> FPS Kalkulačka
                        </a>
                        <a href="/fps-kalkulacka/gta-6-predikce/ryzen-7-7800x3d-vs-rtx-4070-super-1440p" className="hub-btn">
                            <Sparkles size={18} color="#f43f5e" /> GTA VI Predikce
                        </a>
                    </div>
                </div>

            </main>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": `Bottleneck Result: ${hwComboName}`,
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "All",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CZK" },
                        "description": `Simulace prokázala ${bottleneckPercent}% bottleneck (${boundType}) pro ${hwComboName} v rozlišení ${displayResolution}.`
                    })
                }}
            />

            <style dangerouslySetInnerHTML={{__html: `
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); margin-bottom: 25px; text-transform: uppercase; font-size: 12px; }
                .bn-result-card { background: linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(0,0,0,0.8) 100%); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 32px; padding: 50px; position: relative; overflow: hidden; box-shadow: 0 0 50px rgba(168, 85, 247, 0.1); }
                
                .status-header { text-align: center; margin-bottom: 30px; }
                .bound-badge { display: inline-flex; align-items: center; gap: 8px; font-weight: 950; padding: 10px 30px; border-radius: 50px; text-transform: uppercase; font-size: 15px; letter-spacing: 1px; }
                .bound-badge.cpu { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
                .bound-badge.gpu { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
                .bound-badge.balanced { background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }

                .percentage-display { text-align: center; margin: 40px 0; }
                .pct-value { font-size: 8rem; font-weight: 950; line-height: 1; color: #fff; text-shadow: 0 0 40px rgba(168, 85, 247, 0.5); }
                .pct-label { font-size: 16px; font-weight: 900; color: #a855f7; margin-top: 15px; text-transform: uppercase; letter-spacing: 2px; }

                .pro-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                .metric-box { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; text-align: center; }
                .metric-box.alert { border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.1); }
                .metric-box.alert .m-val { color: #fbbf24; }
                .m-label { font-size: 12px; font-weight: 900; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
                .m-val { font-size: 32px; font-weight: 950; color: #fff; }

                .warning-box { display: flex; gap: 20px; align-items: center; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 25px; border-radius: 20px; margin-bottom: 30px; color: #fca5a5; font-size: 15px; line-height: 1.6; }
                .warning-box strong { color: #ef4444; display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }

                .recommendation { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 35px; border-radius: 20px; }
                .recommendation h4 { margin: 0 0 15px 0; font-size: 18px; font-weight: 950; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
                .recommendation p { margin: 0; font-size: 15px; color: #d1d5db; line-height: 1.7; font-weight: 500; }

                .action-btn { display: inline-flex; align-items: center; gap: 10px; padding: 15px 30px; border-radius: 14px; font-weight: 950; font-size: 14px; text-decoration: none; transition: 0.3s; color: #fff; text-transform: uppercase; }
                .action-btn.primary { background: #a855f7; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3); }
                .action-btn.primary:hover { transform: translateY(-3px); background: #c084fc; box-shadow: 0 15px 40px rgba(168, 85, 247, 0.4); }
                .action-btn.reddit { background: #ff4500; }
                .action-btn.reddit:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(255, 69, 0, 0.4); }
                .action-btn.x { background: #000; border: 1px solid rgba(255,255,255,0.2); }
                .action-btn.x:hover { transform: translateY(-3px); background: #111; box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2); }

                /* GURU HUB ODKAZY */
                .guru-hub-links { margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
                .hub-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 12px; color: #d1d5db; font-weight: 900; font-size: 13px; text-decoration: none; transition: 0.3s; text-transform: uppercase; }
                .hub-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #fff; transform: translateY(-2px); }

                @media (max-width: 768px) {
                    .pro-metrics-grid { grid-template-columns: 1fr; }
                    .pct-value { font-size: 5rem; }
                    .action-btn { width: 100%; justify-content: center; }
                }
            `}} />
        </div>
    );
}
