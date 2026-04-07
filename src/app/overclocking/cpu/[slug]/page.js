import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Cpu, Zap, Activity, Gauge, Layers, Flame, ChevronRight } from 'lucide-react';

// FIX CESTY: Pro Vercel (4 úrovně zpět)
import HeurekaButtons from '../../../../components/HeurekaButtons';
import SeznamAd from '../../../../components/SeznamAd';

// --- GURU PSEO ENGINE V2.0 ---
export const runtime = "nodejs";
export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const getCpuData = async (slug) => {
    if (!slug) return null;
    const { data, error } = await supabase.from('cpus').select('*').eq('slug', slug).limit(1).single();
    if (error || !data) return null;
    return data;
};

const getRelatedCpus = async (vendor, currentSlug) => {
    const { data, error } = await supabase.from('cpus').select('name, slug, architecture').eq('vendor', vendor).neq('slug', currentSlug).limit(4);
    if (error || !data) return [];
    return data;
};

const getLatestPosts = async () => {
    const { data, error } = await supabase.from('posts').select('id, title, slug').order('created_at', { ascending: false }).limit(3);
    if (error || !data) return [];
    return data;
};

export async function generateMetadata({ params }) {
    const p = await params;
    const cpu = await getCpuData(p.slug);
    if (!cpu) return { title: '404 | The Hardware Guru' };
    return {
        title: `${cpu.name} Overclocking a Undervolt Návod`,
        description: `Detailní návod na overclocking a undervolt pro ${cpu.name}. Optimalizace výkonu a teplot pro váš herní PC.`,
        alternates: { canonical: `https://thehardwareguru.cz/overclocking/cpu/${cpu.slug}` }
    };
}

export default async function CpuOverclockingPage({ params }) {
    const p = await params;
    const cpu = await getCpuData(p.slug);
    if (!cpu) notFound();

    const latestPosts = await getLatestPosts();
    const isAMD = cpu.vendor?.toUpperCase() === 'AMD';
    const safeBoost = (cpu.boost_clock_ghz + 0.1).toFixed(2);
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <style dangerouslySetInnerHTML={{__html: `
                .guru-spider-link { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; color: #d1d5db; text-decoration: none; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: bold; transition: 0.2s; }
                .guru-spider-link:hover { background: rgba(102, 252, 241, 0.1); border-color: #66fcf1; color: #fff; transform: translateX(5px); }
                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; margin-bottom: 40px; }
                .ad-mobile-wrapper { display: none; justify-content: center; width: 100%; margin-bottom: 40px; }
                .guru-description-block { background: rgba(255,255,255,0.03); padding: 35px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 40px; line-height: 1.8; color: #cbd5e1; font-size: 17px; backdrop-filter: blur(10px); }
                @media (max-width: 768px) { .ad-desktop-wrapper { display: none !important; } .ad-mobile-wrapper { display: flex !important; } }
            `}} />

            <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', margin: '0 0 25px 0', textTransform: 'uppercase' }}>
                        {cpu.name} <span style={{ color: '#a855f7' }}>OC & UNDERVOLT</span>
                    </h1>
                </header>

                {/* --- UNIKÁTNÍ POPIS CPU (GURU PSEO ENGINE) --- */}
                <section className="guru-description-block">
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={20} color="#66fcf1" /> Proč ladit {cpu.name}?
                    </h2>
                    <p>
                        Procesor <span style={{ color: '#66fcf1', fontWeight: 'bold' }}>{cpu.name}</span> postavený na architektuře <span style={{ color: '#a855f7' }}>{cpu.architecture || 'moderní platformě'}</span> disponuje obrovským potenciálem, který je ale v továrním nastavení často brzděn vysokými teplotami a zbytečně vysokým napětím. 
                        Naším cílem pro tento konkrétní kus křemíku je najít ideální rovnováhu mezi maximálním <span style={{ color: '#10b981', fontWeight: 'bold' }}>Boostem ({safeBoost} GHz)</span> a efektivním chlazením. 
                        {isAMD 
                            ? ' U procesorů AMD se zaměříme primárně na Curve Optimizer, který u tohoto modelu dokáže zázraky s teplotami.' 
                            : ' U této Intel architektury je klíčem k úspěchu správný VCore Offset, který zabrání zbytečnému thermal throttlingu při dlouhodobé zátěži.'
                        }
                    </p>
                    {cpu.description_cz && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }} dangerouslySetInnerHTML={{ __html: cpu.description_cz }} />
                    )}
                </section>

                {/* TOP REKLAMA */}
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408678} width={320} height={100} />
                </div>

                {/* VOLTÁŽ A OC BOXY */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid #10b981', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#10b981' }}>GURU UNDERVOLT</h2>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', marginTop: '20px', fontWeight: 'bold', fontSize: '18px' }}>
                            {isAMD ? 'Curve Optimizer: Negative -20' : 'VCore Offset: -0.05V'}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid #3b82f6', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#3b82f6' }}>SAFE DAILY OC</h2>
                        <div style={{ fontSize: '32px', fontWeight: '950', marginTop: '20px', textAlign: 'center' }}>{safeBoost} GHz</div>
                    </div>
                </div>

                {/* HEUREKA A CHLAZENÍ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '60px', alignItems: 'start' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}>Chlazení pro {cpu.name}</h2>
                        <a href="https://www.heureka.cz/?h%5Bfraze%5D=vodni+chlazeni+cpu" target="_blank" rel="nofollow" style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', padding: '15px 35px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', transition: '0.2s' }}>ZLEPŠIT CHLAZENÍ</a>
                    </div>
                    <div>
                        <HeurekaButtons isEn={false} />
                    </div>
                </div>

                {/* BOTTOM REKLAMA */}
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408658} width={480} height={300} />
                </div>

                {/* SPIDER LINKS */}
                <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '50px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px' }}>Guru Nástroje</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        <a href="/bottleneck-kalkulacka" className="guru-spider-link"><Gauge size={18} color="#eab308" /> Bottleneck Kalkulačka</a>
                        <a href="/fps-kalkulacka" className="guru-spider-link"><Activity size={18} color="#10b981" /> FPS Kalkulačka</a>
                        <a href="/cpuvs" className="guru-spider-link"><Cpu size={18} color="#3b82f6" /> Souboje CPU</a>
                        <a href="/gpuvs" className="guru-spider-link"><Layers size={18} color="#ef4444" /> Souboje GPU</a>
                        <a href="/tipy" className="guru-spider-link"><Flame size={18} color="#f97316" /> Tipy a Triky</a>
                        <a href="/tweaky" className="guru-spider-link"><Zap size={18} color="#a855f7" /> PC Tweaky</a>
                    </div>
                </section>

                {latestPosts.length > 0 && (
                    <section style={{ paddingTop: '40px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px' }}>Nejnovější Články</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            {latestPosts.map(post => (
                                <a key={post.id} href={`/clanky/${post.slug}`} className="guru-spider-link">
                                    <ChevronRight size={16} color="#9ca3af" /> {post.title}
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
