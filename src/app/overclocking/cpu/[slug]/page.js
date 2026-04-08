import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Cpu, Zap, Activity, Gauge, Layers, Flame, ChevronRight, BookOpen, ShieldCheck, Clock, User } from 'lucide-react';

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

    const latestPosts = await getLatestPosts();
    const isAMD = cpu.vendor?.toUpperCase() === 'AMD';
    const safeBoost = (cpu.boost_clock_ghz + 0.1).toFixed(2);
    
    // JSON-LD Pro Google Rich Snippets (HowTo)
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
                .guru-h2 { font-size: 26px; fontWeight: 900; margin-bottom: 20px; color: #fff; display: flex; align-items: center; gap: 12px; border-left: 4px solid #a855f7; padding-left: 15px; }
                .guru-p { line-height: 1.8; color: #cbd5e1; font-size: 17px; margin-bottom: 25px; }
                .setup-box { background: rgba(0,0,0,0.4); border-radius: 16px; padding: 25px; border-left: 4px solid #66fcf1; margin: 20px 0; }
                .guru-spider-link { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; color: #d1d5db; text-decoration: none; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: bold; transition: 0.2s; }
                .guru-spider-link:hover { background: rgba(102, 252, 241, 0.1); border-color: #66fcf1; color: #fff; transform: translateX(5px); }
            `}} />

            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                {/* HEADLINE */}
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="article-meta" style={{ justifyContent: 'center' }}>
                        <span><User size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Hardware Guru</span>
                        <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> 6 min {isEn ? 'read' : 'čtení'}</span>
                        <span><BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {cpu.architecture}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '950', margin: '0 0 20px 0', textTransform: 'uppercase', lineHeight: '1.1' }}>
                        {cpu.name}<br /><span style={{ color: '#a855f7' }}>Ultimate Tuning Guide</span>
                    </h1>
                </header>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                {/* ARTICLE BODY */}
                <article className="guru-article-card">
                    <h2 className="guru-h2"><Zap size={24} color="#66fcf1" /> {isEn ? 'Introduction' : 'Úvod do problematiky'}</h2>
                    <p className="guru-p">
                        {isEn ? (
                            `The ${cpu.name} is a powerhouse in the ${cpu.architecture} lineup. However, out of the box, it often consumes more power than necessary. Our testing shows that by applying specific undervolt settings, you can achieve better sustained clock speeds while significantly reducing thermal output.`
                        ) : (
                            `Procesor ${cpu.name} patří k vrcholům architektury ${cpu.architecture}. V továrním nastavení je ale často "překrmen" zbytečně vysokým napětím, což vede k thermal throttlingu. V tomto článku se podíváme na to, jak z tohoto křemíku vymáčknout maximum při zachování tichého chlazení.`
                        )}
                    </p>

                    <h2 className="guru-h2"><Settings size={24} color="#a855f7" /> {isEn ? 'BIOS Setup & Voltages' : 'Nastavení BIOSu a napětí'}</h2>
                    <p className="guru-p">
                        {isEn ? 'For optimal results, enter your motherboard BIOS and navigate to the Overclocking/Tweaker tab. Focus on these values:' : 'Pro nejlepší výsledky vstupte do BIOSu vaší základní desky. Zaměřte se na tyto konkrétní parametry:'}
                    </p>
                    
                    <div className="setup-box">
                        <div style={{ fontSize: '14px', color: '#66fcf1', marginBottom: '5px', fontWeight: 'bold' }}>{isEn ? 'RECOMMENDED SETTINGS' : 'DOPORUČENÉ HODNOTY'}</div>
                        <div style={{ fontSize: '24px', fontWeight: '900' }}>
                            {isAMD ? 'Curve Optimizer: -20 All Cores' : 'VCore Offset: -0.050V to -0.080V'}
                        </div>
                    </div>

                    <h2 className="guru-h2"><ShieldCheck size={24} color="#10b981" /> {isEn ? 'Stability Testing' : 'Ověření stability'}</h2>
                    <p className="guru-p">
                        {isEn ? `After applying the ${safeBoost} GHz target, run a 30-minute Cinebench R23 loop. If the system remains stable, you can try pushing the undervolt further by -0.005V increments.` : `Po nastavení cílové frekvence ${safeBoost} GHz spusťte 30minutový test v Cinebench R23. Pokud systém zůstane stabilní, můžete zkusit snížit napětí o dalších -0.005V.`}
                    </p>

                    {/* DB DESCRIPTION CONTENT */}
                    {(isEn ? cpu.description_en : cpu.description_cz) && (
                        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)' }} 
                             dangerouslySetInnerHTML={{ __html: isEn ? cpu.description_en : cpu.description_cz }} />
                    )}
                </article>

                {/* HEUREKA / CTA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '60px' }}>
                    <div style={{ background: '#3b82f6', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '15px' }}>{isEn ? 'Need better cooling?' : 'Nestačí vám chlazení?'}</h3>
                        <a href="https://www.heureka.cz/?h%5Bfraze%5D=vodni+chlazeni+cpu" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', border: '2px solid #fff', padding: '10px 20px', borderRadius: '12px' }}>{isEn ? 'VIEW COOLERS' : 'TOP CHLADIČE'}</a>
                    </div>
                    <HeurekaButtons isEn={isEn} />
                </div>

                <SeznamAd zoneId={408658} width={480} height={300} />

                {/* FOOTER SPIDER */}
                <section style={{ marginTop: '80px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px', textAlign: 'center' }}>Guru {isEn ? 'Knowledge Base' : 'Databáze vědomostí'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        <a href="/bottleneck-kalkulacka" className="guru-spider-link"><Gauge size={18} color="#eab308" /> Bottleneck</a>
                        <a href="/cpuvs" className="guru-spider-link"><Cpu size={18} color="#3b82f6" /> CPU Duels</a>
                        <a href="/tweaky" className="guru-spider-link"><Zap size={18} color="#a855f7" /> PC Tweaks</a>
                    </div>
                </section>
            </main>
        </div>
    );
}
