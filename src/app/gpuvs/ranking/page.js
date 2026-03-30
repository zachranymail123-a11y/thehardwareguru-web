import React from 'react';
import { Trophy, Zap, ShieldCheck, Star, Swords, ChevronRight, TrendingUp } from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU GPU RANKING ENGINE V2.2 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Maximální monetizace žebříčku a perfektní mobilní UI + Heureka konverze.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

async function getGpuRanking() {
    if (!supabaseUrl) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug,vendor,performance_index,architecture,vram_gb&order=performance_index.desc`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
}

export async function generateMetadata({ searchParams }) {
    const s = await searchParams;
    const isEn = s?.lang === 'en';
    const title = isEn ? 'GPU Performance Ranking 2026 | The Hardware Guru' : 'Žebříček grafických karet 2026 | The Hardware Guru';
    const desc = isEn 
        ? 'Ultimate GPU performance ranking and tier list. Compare top graphics cards from NVIDIA and AMD.' 
        : 'Kompletní žebříček výkonu grafických karet 2026. Najdi nejlepší GPU pro hraní ve 4K, 1440p a 1080p.';
    return { title, description: desc };
}

export default async function GpuRankingPage({ searchParams }) {
    const s = await searchParams;
    const isEn = s?.lang === 'en';
    const gpus = await getGpuRanking();

    const tiers = [
        { id: 'S', label: 'Tier S: Extreme (4K Ultra)', range: [250, 1000], color: '#66fcf1' },
        { id: 'A', label: 'Tier A: High-End (4K/1440p)', range: [180, 249], color: '#a855f7' },
        { id: 'B', label: 'Tier B: Performance (1440p)', range: [130, 179], color: '#eab308' },
        { id: 'C', label: 'Tier C: Mid-Range (1440p/1080p)', range: [90, 129], color: '#f97316' },
        { id: 'D', label: 'Tier D: Budget (1080p)', range: [0, 89], color: '#4b5563' }
    ];

    const getVendorColor = (vendor) => vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

    return (
        <div className="guru-ranking-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="ranking-badge">
                        <TrendingUp size={16} /> GURU RANKING ENGINE
                    </div>
                    <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 20px 0', lineHeight: '1', textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
                        GPU <span style={{ color: '#66fcf1' }}>HIERARCHY</span> 2026
                    </h1>
                </header>

                {/* 🔥 PŘIDÁNO: Heureka tlačítka pod titulkem 🔥 */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                    <HeurekaButtons isEn={isEn} />
                </div>

                {/* 🔥 TOP AD SLOT - STRIKTNÍ SEPARACE */}
                <div style={{ marginBottom: '50px' }}>
                    <div className="ad-desktop-wrapper">
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>
                    <div className="ad-mobile-wrapper">
                        <SeznamAd zoneId={408651} width={300} height={250} />
                    </div>
                </div>

                <div className="tiers-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {tiers.map((tier) => {
                        const tierGpus = gpus.filter(g => g.performance_index >= tier.range[0] && g.performance_index <= tier.range[1]);
                        if (tierGpus.length === 0) return null;

                        return (
                            <React.Fragment key={tier.id}>
                                <section>
                                    <h2 className="tier-h2" style={{ display: 'flex', alignItems: 'center', gap: '15px', color: tier.color, fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>
                                        <div className="tier-id-box" style={{ width: '45px', height: '45px', background: tier.color, color: '#000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{tier.id}</div>
                                        {tier.label}
                                    </h2>
                                    <div className="tier-list-box" style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                                        {tierGpus.map((gpu, idx) => {
                                            const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
                                            const profileUrl = isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`;
                                            return (
                                                <a key={idx} href={profileUrl} className="ranking-row" style={{ display: 'grid', gridTemplateColumns: '50px 1fr 120px', padding: '20px 30px', borderBottom: idx === tierGpus.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.02)', alignItems: 'center', textDecoration: 'none' }}>
                                                    <span className="gpu-rank-num" style={{ color: '#4b5563', fontWeight: '900', fontSize: '18px' }}>#{gpus.indexOf(gpu) + 1}</span>
                                                    <div className="gpu-info-side">
                                                        <div style={{ color: getVendorColor(gpu.vendor), fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>{gpu.vendor} • {gpu.architecture}</div>
                                                        <div className="gpu-name-text" style={{ fontSize: '18px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', transition: '0.2s' }}>{gpu.name}</div>
                                                    </div>
                                                    <div className="gpu-score-side" style={{ textAlign: 'right' }}>
                                                        <div style={{ color: tier.color, fontWeight: '950', fontSize: '20px' }}>{gpu.performance_index}%</div>
                                                        <div style={{ fontSize: '10px', color: '#4b5563', fontWeight: 'bold' }}>{isEn ? 'REL. POWER' : 'REL. VÝKON'}</div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* 🔥 MID AD SLOT - STRIKTNÍ SEPARACE (POUZE MOBIL) */}
                                {tier.id === 'B' && (
                                    <div className="ad-mobile-wrapper" style={{ padding: '10px 0' }}>
                                        <SeznamAd zoneId={408651} width={300} height={250} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="footer-cta-box" style={{ marginTop: '100px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(0,0,0,0.4) 100%)', padding: '60px 40px', borderRadius: '40px', border: '1px solid rgba(168, 85, 247, 0.3)', textAlign: 'center' }}>
                    <Star color="#a855f7" size={48} style={{ marginBottom: '20px' }} />
                    <h3 className="footer-cta-title" style={{ fontSize: '28px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '15px', color: '#fff' }}>{isEn ? 'Need a direct comparison?' : 'Potřebuješ přímé srovnání?'}</h3>
                    <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="launch-vs-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 40px', background: '#a855f7', color: '#fff', textDecoration: 'none', fontWeight: '950', borderRadius: '16px', fontSize: '16px', textTransform: 'uppercase', transition: '0.3s' }}>
                        {isEn ? 'Launch VS Engine' : 'Spustit VS Engine'} <ChevronRight size={20} />
                    </a>
                </div>

            </main>
            <style dangerouslySetInnerHTML={{__html: `
                .ranking-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(102,252,241,0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); margin-bottom: 20px; }
                .ranking-row { transition: 0.2s; cursor: pointer; }
                .ranking-row:hover { background: rgba(255,255,255,0.03) !important; }
                .ranking-row:hover .gpu-name-text { color: #66fcf1 !important; transform: translateX(5px); }

                /* 🚀 RESPONSIVE ADS SYSTEM */
                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .ad-mobile-wrapper { display: none; width: 100%; }

                @media (max-width: 768px) {
                    .guru-ranking-wrapper { padding-top: 80px !important; }
                    .inner-container { padding: 0 15px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .main-title { font-size: 1.8rem !important; }
                    .tier-h2 { font-size: 1.1rem !important; gap: 10px !important; }
                    .tier-id-box { width: 35px !important; height: 35px !important; fontSize: 18px !important; }
                    .ranking-row { grid-template-columns: 35px 1fr 80px !important; padding: 15px !important; }
                    .gpu-rank-num { font-size: 14px !important; }
                    .gpu-name-text { font-size: 14px !important; }
                    .gpu-score-side div:first-child { font-size: 16px !important; }
                    .footer-cta-box { padding: 35px 20px !important; border-radius: 24px !important; margin-top: 60px !important; }
                    .footer-cta-title { font-size: 1.2rem !important; }
                    .launch-vs-btn { width: 100%; justify-content: center; padding: 15px !important; font-size: 14px !important; }
                }
            `}} />
        </div>
    );
}
