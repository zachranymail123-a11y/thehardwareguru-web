import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Sparkles, Zap, Monitor, Cpu } from 'lucide-react';
import ShareButtonsClient from './ShareButtonsClient';

/**
 * GURU GTA 6 PREDICTOR - V10.0 (ANTI-DUPE & FIXED LOGGING)
 * 🛡️ LOGIKA: Prvně ověří existenci, pak zapíše nebo aktualizuje.
 */

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export default async function Gta6PredictionPage({ params, searchParams }) {
    const { cpuId, gpuId } = await searchParams;
    const { slug } = await params;

    if (!cpuId || !gpuId || !slug) return notFound();

    // Inicializace Supabase s Service Role pro zápis bez omezení
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- 🚀 GURU ANTI-DUPLIKACE & ZÁPIS ---
    try {
        const fullUrl = `${baseUrl}/fps-kalkulacka/gta-6-predikce/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;
        
        // UPSERT (Update or Insert) - Pokud slug_base existuje, přepíše se last_requested
        const { error: upsertError } = await supabase
            .from('generated_predictions')
            .upsert({
                slug_base: slug,          // Toto je tvůj PRIMARY KEY
                cpu_id: cpuId,
                gpu_id: gpuId,
                full_url: fullUrl,        // Přidáme i celou URL pro sitemapu
                last_requested: new Date().toISOString()
            }, { 
                onConflict: 'slug_base'   // Klíčové pro antiduplikaci
            });

        if (upsertError) console.error("❌ DB Write Error:", upsertError.message);
        else console.log("✅ GTA 6 Prediction Logged/Updated:", slug);
        
    } catch (err) {
        console.error("❌ Critical Logging Failure:", err);
    }

    // --- FETCH DATA PRO ZOBRAZENÍ ---
    const [gpuRes, cpuRes, gpus, cpus] = await Promise.all([
        supabase.from('game_fps').select('*').eq('gpu_id', gpuId).maybeSingle(),
        supabase.from('cpu_game_fps').select('*').eq('cpu_id', cpuId).maybeSingle(),
        supabase.from('gpus').select('id,name').order('name'),
        supabase.from('cpus').select('id,name').order('name')
    ]);

    const gpuData = gpuRes.data || {};
    const cpuData = cpuRes.data || {};
    const gpuName = gpus.data?.find(g => g.id === gpuId)?.name || 'GPU';
    const cpuName = cpus.data?.find(c => c.id === cpuId)?.name || 'CPU';
    const hwComboName = `${cpuName} + ${gpuName}`;

    const resolution = slug.endsWith('2160p') ? '4k' : slug.endsWith('1440p') ? '1440p' : '1080p';
    const resKey = resolution === '4k' ? 'alan_wake_2_4k' : `alan_wake_2_${resolution}`;
    
    const gpuFps = gpuData[resKey] || 0;
    const cpuFps = cpuData[resKey] || 0;
    const baseFps = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);
    const predictedFps = Math.round(baseFps * 0.85);

    const shareText = `🔮 GTA VI PREDIKCE: Moje sestava (${hwComboName}) by měla dát v GTA VI na ${resolution.toUpperCase()} okolo ${predictedFps} FPS! 🚀`;
    const shareUrl = `${baseUrl}/fps-kalkulacka/gta-6-predikce/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div className="pred-badge"><Sparkles size={16} /> AI PREDIKCE ZÁPIS AKTIVNÍ</div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
                        GTA VI <span style={{ color: '#f43f5e' }}>VÝKON</span>
                    </h1>
                    <p style={{ fontSize: '20px', fontWeight: '900', color: '#9ca3af', marginTop: '20px', textTransform: 'uppercase' }}>
                        {hwComboName} <span style={{ color: '#f43f5e' }}>({resolution.toUpperCase()})</span>
                    </p>
                </header>

                <div className="result-card">
                    <div className="fps-main">{predictedFps} <span style={{ fontSize: '3rem' }}>FPS</span></div>
                    <div className="fps-label">PŘEDPOKLÁDANÁ RYCHLOST HRY</div>
                    <div className="stats-row">
                        <div className="stat-pill"><Cpu size={18} color="#f59e0b" /> CPU: {Math.round(cpuFps * 0.85)} FPS</div>
                        <div className="stat-pill"><Monitor size={18} color="#66fcf1" /> GPU: {Math.round(gpuFps * 0.85)} FPS</div>
                    </div>
                </div>

                <ShareButtonsClient shareText={shareText} shareUrl={shareUrl} />

                <div className="res-switch-grid">
                    {['1080p', '1440p', '2160p'].map(res => {
                        const parts = slug.split('-vs-');
                        const newSlug = `${parts[0]}-vs-${parts[1].split('-').slice(0,-1).join('-')}-${res}`;
                        return (
                            <a key={res} href={`/fps-kalkulacka/gta-6-predikce/${newSlug}?cpuId=${cpuId}&gpuId=${gpuId}`} className={`res-nav ${resolution === (res === '2160p' ? '4k' : res) ? 'active' : ''}`}>
                                {res === '2160p' ? '4K ULTRA' : `${res} QUAD`}
                            </a>
                        );
                    })}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 25px; text-transform: uppercase; font-size: 11px; }
                .result-card { background: linear-gradient(135deg, #0f1115 0%, #1a050a 100%); padding: 60px 40px; border-radius: 32px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 60px rgba(244, 63, 94, 0.15); }
                .fps-main { font-size: 8rem; font-weight: 950; line-height: 0.9; margin-bottom: 15px; color: #fff; }
                .fps-label { font-size: 14px; font-weight: 900; color: #fda4af; text-transform: uppercase; letter-spacing: 2px; }
                .stats-row { display: flex; justify-content: center; gap: 20px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
                .stat-pill { display: flex; align-items: center; gap: 8px; color: #d1d5db; font-weight: 900; font-size: 13px; background: rgba(255,255,255,0.03); padding: 10px 18px; border-radius: 12px; }
                .res-switch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 30px; }
                .res-nav { padding: 18px; background: rgba(15,17,21,0.8); border-radius: 16px; text-align: center; text-decoration: none; color: #6b7280; font-weight: 950; border: 1px solid #222; transition: 0.3s; }
                .res-nav.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
            `}} />
        </div>
    );
}
