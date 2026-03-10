import React from 'react';
import { Trophy, Zap, ShieldCheck, Star, Swords, ChevronRight, TrendingUp } from 'lucide-react';

/**
 * GURU GPU RANKING ENGINE V1.0
 * Cesta: src/app/gpuvs/ranking/page.js
 * 🚀 GURU: Tato stránka slouží jako traffic magnet pro klíčová slova "gpu ranking" a "gpu hierarchy".
 * 🛡️ DESIGN: Guru Supreme (Neon, Tier List struktura, agresivní Dark mode).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function getGpuRanking() {
    if (!supabaseUrl) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=name,vendor,performance_index,architecture,vram_gb&order=performance_index.desc`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
}

export async function generateMetadata({ searchParams }) {
    const isEn = searchParams?.lang === 'en';
    const title = isEn ? 'GPU Performance Ranking 2026 | The Hardware Guru' : 'Žebříček grafických karet 2026 | The Hardware Guru';
    const desc = isEn 
        ? 'Ultimate GPU performance ranking and tier list. Compare top graphics cards from NVIDIA and AMD.' 
        : 'Kompletní žebříček výkonu grafických karet 2026. Najdi nejlepší GPU pro hraní ve 4K, 1440p a 1080p.';
    return { title, description: desc };
}

export default async function GpuRankingPage({ searchParams }) {
    const isEn = searchParams?.lang === 'en';
    const gpus = await getGpuRanking();

    // Rozdělení do Tierů podle performance_index
    const tiers = [
        { id: 'S', label: 'Tier S: Extreme (4K Ultra)', range: [250, 1000], color: '#66fcf1' },
        { id: 'A', label: 'Tier A: High-End (4K/1440p)', range: [180, 249], color: '#a855f7' },
        { id: 'B', label: 'Tier B: Performance (1440p)', range: [130, 179], color: '#eab308' },
        { id: 'C', label: 'Tier C: Mid-Range (1440p/1080p)', range: [90, 129], color: '#f97316' },
        { id: 'D', label: 'Tier D: Budget (1080p)', range: [0, 89], color: '#4b5563' }
    ];

    const getVendorColor = (vendor) => vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* HERO SEKCE */}
                <header style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102,252,241,0.05)' }}>
                        <TrendingUp size={16} /> GURU RANKING ENGINE
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '950', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 20px 0', lineHeight: '1', textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
                        GPU <span style={{ color: '#66fcf1' }}>HIERARCHY</span> 2026
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                        {isEn 
                          ? "The definitive performance ranking for gaming graphics cards. Based on raw benchmarks and relative performance index." 
                          : "Definitivní žebříček výkonu herních grafických karet. Hodnocení vychází z hrubého benchmarku a relativního indexu výkonu."}
                    </p>
                </header>

                {/* TIER LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {tiers.map(tier => {
                        const tierGpus = gpus.filter(g => g.performance_index >= tier.range[0] && g.performance_index <= tier.range[1]);
                        if (tierGpus.length === 0) return null;

                        return (
                            <section key={tier.id}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', color: tier.color, fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>
                                    <div style={{ width: '45px', height: '45px', background: tier.color, color: '#000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{tier.id}</div>
                                    {tier.label}
                                </h2>
                                <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                                    {tierGpus.map((gpu, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 120px', padding: '20px 30px', borderBottom: idx === tierGpus.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }} className="ranking-row">
                                            <span style={{ color: '#4b5563', fontWeight: '900', fontSize: '18px' }}>#{gpus.indexOf(gpu) + 1}</span>
                                            <div>
                                                <div style={{ color: getVendorColor(gpu.vendor), fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>{gpu.vendor} • {gpu.architecture}</div>
                                                <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{gpu.name}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: tier.color, fontWeight: '950', fontSize: '20px' }}>{gpu.performance_index}%</div>
                                                <div style={{ fontSize: '10px', color: '#4b5563', fontWeight: 'bold' }}>{isEn ? 'REL. POWER' : 'REL. VÝKON'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* CTA BOX */}
                <div style={{ marginTop: '100px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(0,0,0,0.4) 100%)', padding: '60px 40px', borderRadius: '40px', border: '1px solid rgba(168, 85, 247, 0.3)', textAlign: 'center' }}>
                    <Star color="#a855f7" size={48} style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '28px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '15px' }}>{isEn ? 'Need a direct comparison?' : 'Potřebuješ přímé srovnání?'}</h3>
                    <p style={{ color: '#9ca3af', marginBottom: '30px' }}>{isEn ? 'Use our Guru VS Engine to compare two specific GPUs head-to-head.' : 'Použij náš Guru VS Engine a porovnej dvě konkrétní grafiky tváří v tvář.'}</p>
                    <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 40px', background: '#a855f7', color: '#fff', textDecoration: 'none', fontWeight: '950', borderRadius: '16px', fontSize: '16px', textTransform: 'uppercase' }}>
                        {isEn ? 'Launch VS Engine' : 'Spustit VS Engine'} <ChevronRight size={20} />
                    </a>
                </div>

            </main>
            <style dangerouslySetInnerHTML={{__html: `
                .ranking-row:hover { background: rgba(255,255,255,0.02); transition: 0.2s; }
                @media (max-width: 768px) {
                  .ranking-row { grid-template-columns: 40px 1fr 80px !important; padding: 15px !important; }
                  .ranking-row div:last-child { font-size: 16px !important; }
                }
            `}} />
        </div>
    );
}
