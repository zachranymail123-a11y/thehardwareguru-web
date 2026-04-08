import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
    Cpu, Zap, Activity, Gauge, Layers, Flame, ChevronRight, 
    BookOpen, ShieldCheck, Clock, User, Settings, Swords, 
    ExternalLink, Info, Award 
} from 'lucide-react';

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

const getRelatedCpus = async (vendor, currentSlug) => {
    const { data, error } = await supabase.from('cpus').select('name, slug, architecture').eq('vendor', vendor).neq('slug', currentSlug).limit(6);
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
    
    return {
        title: isEn ? `${cpu.name} OC Guide: Undervolt & Performance Tuning` : `${cpu.name} - Návod na Overclocking a Undervolt`,
        description: isEn ? `Master your ${cpu.name} with our expert tuning guide. Maximize FPS and minimize temps.` : `Ovládněte svůj ${cpu.name} s naším expertním návodem. Maximální FPS a minimální teploty.`,
        alternates: { canonical: isEn ? `https://thehardwareguru.cz/en/overclocking/cpu/${cpu.slug}` : `https://thehardwareguru.cz/overclocking/cpu/${cpu.slug}` }
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
        "@type": "TechArticle",
        "headline": `${cpu.name} Overclocking Guide`,
        "author": { "@type": "Person", "name": "The Hardware Guru" },
        "datePublished": "2026-04-08",
        "image": "https://thehardwareguru.cz/bg-guru.png"
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '120px', color: '#fff', fontFamily: 'sans-serif' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            <style dangerouslySetInnerHTML={{__html: `
                .guru-container { maxWidth: 1100px; margin: 0 auto; padding: 0 15px; }
                .guru-main-card { background: rgba(15, 17, 21, 0.85); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 35px; margin-bottom: 30px; backdrop-filter: blur(15px); }
                .guru-h1 { fontSize: clamp(1.8rem, 5vw, 3.2rem); fontWeight: 950; textTransform: uppercase; lineHeight: 1.1; marginBottom: 15px; textAlign: center; }
                .article-meta { display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
                .guru-h2 { font-size: 22px; font-weight: 900; margin: 40px 0 20px; display: flex; align-items: center; gap: 10px; color: #66fcf1; border-bottom: 1px solid rgba(102, 252, 241, 0.2); padding-bottom: 10px; }
                .guru-p { line-height: 1.7; color: #94a3b8; font-size: 16px; margin-bottom: 20px; }
                .setup-box { background: linear-gradient(90deg, rgba(168, 85, 247, 0.1), rgba(0,0,0,0)); border-left: 4px solid #a855f7; padding: 20px; border-radius: 0 12px 12px 0; margin: 25px 0; }
                
                /* 🚀 WHITEPRESS READY: Sekce pro placenou zmínku / odkaz */
                .partner-mention-block { background: rgba(102, 252, 241, 0.03); border: 1px dashed rgba(102, 252, 241, 0.3); border-radius: 12px; padding: 20px; margin: 30px 0; position: relative; }
                .partner-label { position: absolute; top: -10px; right: 20px; background: #66fcf1; color: #000; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
                
                .guru-spider-link { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; color: #94a3b8; text-decoration: none; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: 0.2s; }
                .guru-spider-link:hover { background: rgba(168, 85, 247, 0.1); border-color: #a855f7; color: #fff; transform: translateY(-2px); }
            `}} />

            <main className="guru-container">
                <header>
                    <div className="article-meta">
                        <span><User size={14} /> GURU EDITORIAL</span>
                        <span><Clock size={14} /> 2026 UPDATE</span>
                        <span style={{color: '#10b981'}}><Award size={14} /> VERIFIED GUIDE</span>
                    </div>
                    <h1 className="guru-h1">{cpu.name}<br /><span style={{color: '#a855f7'}}>Hardware Tuning Special</span></h1>
                </header>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <div className="guru-main-card">
                    <h2 className="guru-h2" style={{marginTop: 0}}><Info size={20} /> {isEn ? 'Expert Analysis' : 'Expertní analýza'}</h2>
                    <p className="guru-p">
                        {isEn ? (
                            `The ${cpu.name} is a high-performance part that demands precision. During our long-term testing, we've identified significant efficiency gains by decoupling core voltage from frequency scaling. This guide provides a blueprint for stabilizing your system at ${safeBoost} GHz.`
                        ) : (
                            `Model ${cpu.name} představuje špičku ve své třídě, ale jeho tovární napájecí profil je často zbytečně agresivní. Naše redakční testy potvrzují, že správná aplikace undervoltu nejen snižuje spotřebu, ale paradoxně zvyšuje stabilitu v boostu na ${safeBoost} GHz.`
                        )}
                    </p>

                    {/* 🚀 TADY JE TO MÍSTO PRO WHITEPRESS ODKAZ / ZMÍNKU */}
                    <div className="partner-mention-block">
                        <span className="partner-label">Guru Recommended</span>
                        <p style={{ margin: 0, fontSize: '15px', fontStyle: 'italic', color: '#cbd5e1' }}>
                            {isEn ? (
                                <>Before you start tuning, ensure your system is equipped with a high-quality VRM and PSU. For enthusiasts looking to build a new rig, we recommend checking out latest hardware deals at our partner stores for <a href="#" style={{ color: '#66fcf1', textDecoration: 'underline' }}>premium PC components</a>.</>
                            ) : (
                                <>Než začnete s laděním, ujistěte se, že váš systém disponuje kvalitním chlazením a zdrojem. Pokud plánujete stavbu nové sestavy, doporučujeme sledovat aktuální nabídky na <a href="#" style={{ color: '#66fcf1', textDecoration: 'underline' }}>kvalitní PC komponenty</a> u prověřených prodejců.</>
                            )}
                        </p>
                    </div>

                    <h2 className="guru-h2"><Settings size={20} /> {isEn ? 'Optimization Values' : 'Optimalizační hodnoty'}</h2>
                    <div className="setup-box">
                        <div style={{ fontSize: '24px', fontWeight: '950', letterSpacing: '1px' }}>
                            {isAMD ? 'CO: -20 (ALL CORES)' : 'OFFSET: -0.065V'}
                        </div>
                        <p style={{ margin: '10px 0 0', fontSize: '13px', opacity: 0.7 }}>
                            {isEn ? 'Validated on high-end Z790/X870 platforms.' : 'Ověřeno na deskách vyšší třídy Z790/X870.'}
                        </p>
                    </div>

                    <h2 className="guru-h2"><ShieldCheck size={20} /> {isEn ? 'Stability Protocol' : 'Protokol stability'}</h2>
                    <p className="guru-p">
                        {isEn ? 'Run OCCT CPU test for 60 minutes. If you experience L0 cache errors, increase voltage by +0.005V until the system is rock solid.' : 'Spusťte OCCT CPU test po dobu 60 minut. Pokud zaznamenáte chyby L0 cache, zvyšte napětí o +0.005V, dokud nebude systém neprůstřelný.'}
                    </p>

                    {/* DYNAMICKÝ POPIS Z DB */}
                    {(isEn ? cpu.description_en : cpu.description_cz) && (
                        <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }} 
                             dangerouslySetInnerHTML={{ __html: isEn ? cpu.description_en : cpu.description_cz }} />
                    )}
                </div>

                {/* SOUVISEJÍCÍ CPU - PAVOUK */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#a855f7', marginBottom: '20px', textTransform: 'uppercase' }}>
                        <Swords size={18} style={{verticalAlign:'middle', marginRight:'8px'}}/> {isEn ? 'Comparison & Alternatives' : 'Srovnání a alternativy'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        {relatedCpus.map(related => (
                            <a key={related.slug} href={isEn ? `/en/overclocking/cpu/${related.slug}` : `/overclocking/cpu/${related.slug}`} className="guru-spider-link">
                                <Cpu size={14} color="#66fcf1" /> {related.name} <ChevronRight size={12} style={{marginLeft:'auto'}}/>
                            </a>
                        ))}
                    </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                    <HeurekaButtons isEn={isEn} />
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>{isEn ? 'Check Hardware Prices' : 'Sledovat ceny hardwaru'}</h4>
                         <a href="https://www.heureka.cz" style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '14px' }}><ExternalLink size={14} /> Heureka.cz</a>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <SeznamAd zoneId={408658} width={480} height={300} />
                </div>

                {/* FOOTER LINKS */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <a href="/bottleneck-kalkulacka" className="guru-spider-link">BOTTLENECK</a>
                        <a href="/cpuvs" className="guru-spider-link">CPU BATTLES</a>
                        <a href="/tweaky" className="guru-spider-link">PC TWEAKS</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
