import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Cpu, Zap, Activity, Gauge, Layers, Flame, ChevronRight, BookOpen, ShieldCheck, Clock, User, Settings, Swords } from 'lucide-react';

import HeurekaButtons from '../../../../components/HeurekaButtons';
import SeznamAd from '../../../../components/SeznamAd';

export const runtime = "nodejs";
export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const getCpuData = async (slug) => {
    if (!slug) return null;
    const cleanSlug = slug.startsWith('en-') ? slug.replace('en-', '') : slug;
    const { data, error } = await supabase.from('cpus').select('*').eq('slug', cleanSlug).limit(1).single();
    if (error || !data) return null;
    return data;
};

// 🚀 NÁVRAT PROLINKOVÁNÍ: Související CPU pro pavouka
const getRelatedCpus = async (vendor, currentSlug) => {
    const { data, error } = await supabase.from('cpus')
        .select('name, slug, architecture')
        .eq('vendor', vendor)
        .neq('slug', currentSlug)
        .limit(6); // Vracíme víc linků pro lepší indexaci
    if (error || !data) return [];
    return data;
};

const getLatestPosts = async () => {
    const { data, error } = await supabase.from('posts').select('id, title, slug, title_en, slug_en').order('created_at', { ascending: false }).limit(3);
    if (error || !data) return [];
    return data;
};

export async function generateMetadata({ params }) {
    const p = await params;
    const isEn = p.slug.startsWith('en-');
    const cpu = await getCpuData(p.slug);
    if (!cpu) return { title: '404 | The Hardware Guru' };
    
    const title = isEn 
        ? `${cpu.name} Overclocking & Undervolt Guide: Maximum Performance` 
        : `${cpu.name} Overclocking a Undervolt: Kompletní ladící návod`;

    return {
        title,
        description: isEn 
            ? `Step-by-step ${cpu.name} overclocking and undervolt guide. Learn how to increase FPS and lower temperatures safely.`
            : `Podrobný průvodce pro ${cpu.name}. Jak zvýšit výkon (OC) a snížit teploty (undervolt) krok za krokem.`,
        alternates: { 
            canonical: isEn ? `https://thehardwareguru.cz/en/overclocking/cpu/${cpu.slug}` : `https://thehardwareguru.cz/overclocking/cpu/${cpu.slug}` 
        }
    };
}

export default async function CpuOverclockingPage({ params }) {
    const p = await params;
    const isEn = p.slug.startsWith('en-');
    const cpu = await getCpuData(p.slug);
    if (!cpu) notFound();

    const relatedCpus = await getRelatedCpus(cpu.vendor, cpu.slug);
    const latestPosts = await getLatestPosts();
    const isAMD = cpu.vendor?.toUpperCase() === 'AMD';
    const safeBoost = (cpu.boost_clock_ghz + 0.1).toFixed(2);
    
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": isEn ? `How to Overclock and Undervolt ${cpu.name}` : `Jak na overclocking a undervolt ${cpu.name}`,
        "description": isEn ? `Comprehensive guide to tuning the ${cpu.name} processor.` : `Kompletní návod na ladění procesoru ${cpu.name}.`,
        "step": [
            { "@type": "HowToStep", "text": isEn ? "Enter BIOS and locate Voltage/Frequency settings." : "Vstupte do BIOSu a najděte nastavení napětí a frekvence." },
            { "@type": "HowToStep", "text": isEn ? `Apply ${isAMD ? 'Curve Optimizer' : 'VCore Offset'} settings.` : `Aplikujte nastavení ${isAMD ? 'Curve Optimizer' : 'VCore Offset'}.` },
            { "@type": "HowToStep", "text": isEn ? "Verify stability with Cinebench or Prime95." : "Ověřte stabilitu pomocí Cinebench nebo Prime95." }
        ]
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            <style dangerouslySetInnerHTML={{__html: `
                .guru-article-card { background: rgba(15, 17, 21, 0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px; margin-bottom: 40px; backdrop-filter: blur(12px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
                .article-meta { display: flex; gap: 20px; margin-bottom: 30px; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
                .guru-h2 { font-size: 26px; font-weight: 900; margin-bottom: 20px; color: #fff; display: flex; align-items: center; gap: 12px; border-left: 4px solid #a855f7; padding-left: 15px; }
                .guru-p { line-height: 1.8; color: #cbd5e1; font-size: 17px; margin-bottom: 25px; }
                .setup-box { background: rgba(0,0,0,0.4); border-radius: 16px; padding: 25px; border-left: 4px solid #66fcf1; margin: 20px 0; }
                .guru-spider-link { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; color: #d1d5db; text-decoration: none; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: bold; transition: 0.2s; }
                .guru-spider-link:hover { background: rgba(102, 252, 241, 0.1); border-color: #66fcf1; color: #fff; transform: translateX(5px); }
            `}} />

            <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="article-meta" style={{ justifyContent: 'center' }}>
                        <span><User size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Hardware Guru</span>
                        <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> 6 min {isEn ? 'read' : 'čtení'}</span>
                        <span><BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {cpu.architecture || 'x86-64'}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '950', margin: '0 0 20px 0', textTransform: 'uppercase', lineHeight: '1.1' }}>
                        {cpu.name}<br /><span style={{ color: '#a855f7' }}>OC & Undervolt Guide</span>
                    </h1>
                </header>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <article className="guru-article-card">
                    <h2 className="guru-h2"><Zap size={24} color="#66fcf1" /> {isEn ? 'Analysis' : 'Technická analýza'}</h2>
                    <p className="guru-p">
                        {isEn ? (
                            `The ${cpu.name} is built on ${cpu.architecture} architecture. Tuning this specific silicon requires understanding its voltage-frequency curve. By reducing the VCore, we unlock higher sustained clocks without hitting thermal limits.`
                        ) : (
                            `Procesor ${cpu.name} postavený na architektuře ${cpu.architecture} je ideálním kandidátem pro ladění. Snížením napětí (undervolt) získáme prostor pro stabilnější a vyšší boost ${safeBoost} GHz, aniž by docházelo k podtaktování kvůli vysokým teplotám.`
                        )}
                    </p>

                    <div className="setup-box">
                        <div style={{ fontSize: '14px', color: '#66fcf1', marginBottom: '5px', fontWeight: 'bold' }}>{isEn ? 'OPTIMAL SETTINGS' : 'OPTIMÁLNÍ NASTAVENÍ'}</div>
                        <div style={{ fontSize: '24px', fontWeight: '900' }}>
                            {isAMD ? 'Curve Optimizer: Negative -20' : 'VCore Offset: -0.065V'}
                        </div>
                    </div>

                    <h2 className="guru-h2"><Settings size={24} color="#a855f7" /> {isEn ? 'BIOS Configuration' : 'Konfigurace v BIOSu'}</h2>
                    <p className="guru-p">
                        {isEn ? 'Navigate to the Extreme Tweaker or AI Tweaker tab. Disable Power Limits and set your Load Line Calibration to Level 4 for maximum stability during stress tests.' : 'V BIOSu hledejte sekci Extreme Tweaker. Pro maximální stabilitu vypněte Power Limity a nastavte Load Line Calibration na Level 4.'}
                    </p>

                    {(isEn ? cpu.description_en : cpu.description_cz) && (
                        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)' }} 
                             dangerouslySetInnerHTML={{ __html: isEn ? cpu.description_en : cpu.description_cz }} />
                    )}
                </article>

                {/* 🚀 PROLINKOVÁNÍ SOUVISEJÍCÍCH CPU (SPIDER ENGINE) */}
                <section style={{ marginBottom: '60px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Swords size={20} color="#ef4444" /> {isEn ? 'Related Processors' : 'Související procesory'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                        {relatedCpus.map(related => (
                            <a key={related.slug} href={isEn ? `/en/overclocking/cpu/${related.slug}` : `/overclocking/cpu/${related.slug}`} className="guru-spider-link">
                                <Cpu size={16} color="#3b82f6" /> {related.name} ({related.architecture})
                            </a>
                        ))}
                    </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '60px' }}>
                    <HeurekaButtons isEn={isEn} />
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                         <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '15px' }}>{isEn ? 'Recommended Cooling' : 'Doporučené chlazení'}</h3>
                         <a href="https://www.heureka.cz/?h%5Bfraze%5D=vodni+chlazeni+cpu" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>{isEn ? 'SHOP NOW' : 'KOUPIT CHLADIČ'}</a>
                    </div>
                </div>

                <SeznamAd zoneId={408658} width={480} height={300} />

                {/* GURU NÁSTROJE */}
                <section style={{ marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px' }}>{isEn ? 'Guru Tools' : 'Guru Nástroje'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        <a href="/bottleneck-kalkulacka" className="guru-spider-link"><Gauge size={18} color="#eab308" /> Bottleneck</a>
                        <a href="/cpuvs" className="guru-spider-link"><Cpu size={18} color="#3b82f6" /> CPU Duels</a>
                        <a href="/gpuvs" className="guru-spider-link"><Layers size={18} color="#ef4444" /> GPU Duels</a>
                        <a href="/tweaky" className="guru-spider-link"><Zap size={18} color="#a855f7" /> PC Tweaks</a>
                    </div>
                </section>

                {/* NEJNOVĚJŠÍ ČLÁNKY */}
                {latestPosts.length > 0 && (
                    <section style={{ paddingTop: '40px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px' }}>{isEn ? 'Latest from Guru' : 'Nejnovější články'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                            {latestPosts.map(post => (
                                <a key={post.id} href={isEn ? `/en/articles/${post.slug_en || post.slug}` : `/clanky/${post.slug}`} className="guru-spider-link">
                                    <ChevronRight size={16} color="#9ca3af" /> {isEn ? (post.title_en || post.title) : post.title}
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
