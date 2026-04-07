import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Cpu, Zap, ThermometerSnowflake, AlertTriangle, ShieldCheck, ChevronRight, Activity, Settings, ArrowRight, Link2, Gauge, Layers } from 'lucide-react';
import { headers } from 'next/headers';

// --- GURU PSEO ENGINE V2.0: ANTI-DUPLICATE & INTERLINKING ---
export const runtime = "nodejs";
export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Vytažení hlavního CPU
const getCpuData = async (slug) => {
    if (!slug) return null;
    const cleanSlug = slug.replace(/^en-/, '');
    const { data, error } = await supabase
        .from('cpus')
        .select('*')
        .eq('slug', cleanSlug)
        .limit(1)
        .single();
    if (error || !data) return null;
    return data;
};

// Vytažení souvisejících CPU pro interní prolinkování (Google Spider Web)
const getRelatedCpus = async (vendor, currentSlug) => {
    const cleanSlug = currentSlug.replace(/^en-/, '');
    const { data, error } = await supabase
        .from('cpus')
        .select('name, slug, architecture')
        .eq('vendor', vendor)
        .neq('slug', cleanSlug)
        .limit(4);
    if (error || !data) return [];
    return data;
};

export async function generateMetadata({ params }) {
    const p = await params;
    const cpu = await getCpuData(p.slug);
    if (!cpu) return { title: '404 | The Hardware Guru' };

    const headersList = headers();
    const fullUrl = headersList.get('referer') || "";
    const isEn = fullUrl.includes('/en/') || p.slug.startsWith('en-');

    // Unikátní meta titulky díky dynamickým proměnným
    const title = isEn 
        ? `${cpu.name} Overclocking & Undervolt Guide (${cpu.cores}-Core ${cpu.architecture})`
        : `${cpu.name} Overclocking a Undervolt Návod (${cpu.cores}-jádro ${cpu.architecture})`;
        
    const description = isEn
        ? `Maximize your ${cpu.architecture} chip. Exact curve settings and voltages to drop temps on the ${cpu.name} while hitting ${cpu.boost_clock_ghz}GHz+ safely.`
        : `Zkroťte architekturu ${cpu.architecture}. Přesné hodnoty pro undervolting a bezpečné přetaktování ${cpu.name} nad hranici ${cpu.boost_clock_ghz} GHz.`;

    return {
        title,
        description,
        alternates: { canonical: `https://thehardwareguru.cz/overclocking/cpu/${cpu.slug}` }
    };
}

export default async function CpuOverclockingPage({ params }) {
    const p = await params;
    const cpu = await getCpuData(p.slug);
    if (!cpu) notFound();

    const relatedCpus = await getRelatedCpus(cpu.vendor, p.slug);

    const headersList = headers();
    const fullUrl = headersList.get('referer') || "";
    const isEn = fullUrl.includes('/en/') || p.slug.startsWith('en-');

    const isAMD = cpu.vendor?.toUpperCase() === 'AMD';
    const baseClock = cpu.base_clock_ghz || 0;
    const boostClock = cpu.boost_clock_ghz || 0;
    
    const hasData = boostClock > 0;
    const safeBoost = hasData ? (boostClock + (isAMD ? 0.1 : 0.2)).toFixed(2) : 'Auto';
    const extremeBoost = hasData ? (boostClock + (isAMD ? 0.25 : 0.4)).toFixed(2) : 'Max PBO/TVB';
    
    const undervoltStrategy = isAMD 
        ? `Curve Optimizer: Negative All Core -15 to -30` 
        : `VCore Offset: -0.05V to -0.10V`;

    // --- GENERÁTOR UNIKÁTNÍHO TEXTU PROTI DUPLICITĚ (SPINNING) ---
    // Tento text bude pro každý procesor vygenerován s unikátními hodnotami
    const uniqueParagraph1 = isEn 
        ? `The ${cpu.name} is a powerful ${cpu.cores}-core, ${cpu.threads}-thread processor built on the ${cpu.architecture || 'latest'} architecture. Out of the box, it features a base frequency of ${baseClock} GHz, but the real tuning potential begins when pushing past its official ${boostClock} GHz boost limit.`
        : `Procesor ${cpu.name} je brutální křemík s ${cpu.cores} jádry a ${cpu.threads} vlákny, postavený na architektuře ${cpu.architecture || 'moderní platformě'}. V základu běží na frekvenci ${baseClock} GHz, ale ta pravá zábava začíná ve chvíli, kdy se rozhodnete překonat jeho tovární limit ${boostClock} GHz.`;

    const uniqueParagraph2 = isEn
        ? `Because the ${cpu.vendor} silicon behaves differently under thermal load, our tuning engine focuses heavily on undervolting. By dropping voltages (e.g., ${undervoltStrategy}), the ${cpu.name} can sustain higher multi-core frequencies without hitting thermal throttling walls.`
        : `Vzhledem k tomu, že čipy od ${cpu.vendor} pod tepelnou zátěží rychle omezují výkon, náš tuning engine se soustředí primárně na undervolting. Snížením napětí (např. pomocí ${undervoltStrategy}) dokáže ${cpu.name} udržet vysoké takty na všech jádrech mnohem déle, aniž by narazil na teplotní strop.`;

    // --- GOOGLE GOLDEN RICH: SCHÉMATA ---
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": isEn ? `Is it safe to undervolt ${cpu.name}?` : `Je bezpečné podtaktovat (undervolt) ${cpu.name}?`,
                "acceptedAnswer": { "@type": "Answer", "text": isEn ? `Yes, undervolting the ${cpu.name} is completely safe and extends lifespan.` : `Ano, undervolting ${cpu.name} je naprosto bezpečný a prodlužuje životnost.` }
            },
            {
                "@type": "Question",
                "name": isEn ? `What is the max boost clock for ${cpu.name}?` : `Jaký je maximální boost takt pro ${cpu.name}?`,
                "acceptedAnswer": { "@type": "Answer", "text": isEn ? `With custom overclocking, it can reach up to ${extremeBoost} GHz.` : `S extrémním přetaktováním lze dosáhnout až ${extremeBoost} GHz.` }
            }
        ]
    };

    const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

    const coolerLink = isEn 
        ? "https://www.amazon.com/s?k=cpu+liquid+cooler+aio&tag=thehardware07-20" 
        : "https://www.heureka.cz/?h%5Bfraze%5D=vodni+chlazeni+cpu#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />

            <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                {/* HLAVIČKA A UNIKÁTNÍ SEO POPIS */}
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(102, 252, 241, 0.3)', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                        <Settings size={14} /> GURU {cpu.architecture} ENGINE
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', margin: '0 0 25px 0', textTransform: 'uppercase', lineHeight: '1.1' }}>
                        {cpu.name} <span style={{ color: '#a855f7' }}>OC & UNDERVOLT</span>
                    </h1>
                </header>

                {/* UNIKÁTNÍ PARAGRAFY PRO GOOGLE BOTA */}
                <article style={{ background: 'rgba(15, 17, 21, 0.6)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '50px', lineHeight: '1.8', color: '#d1d5db', fontSize: '16px', backdropFilter: 'blur(10px)' }}>
                    <p style={{ marginBottom: '15px' }}>{uniqueParagraph1}</p>
                    <p style={{ margin: 0 }}>{uniqueParagraph2}</p>
                </article>

                {/* GURU PŘEDPOVĚDNÍ KARTY */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    
                    {/* Eco Mode / Undervolt */}
                    <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid #10b981', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#10b981' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}><ThermometerSnowflake size={24} color="#10b981" /></div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>GURU UNDERVOLT</h2>
                                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{isEn ? 'Recommended' : 'Doporučeno'}</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', fontFamily: 'monospace', fontSize: '16px', color: '#fff' }}>
                            {undervoltStrategy}
                        </div>
                    </div>

                    {/* Safe Overclocking */}
                    <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid #3b82f6', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#3b82f6' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px' }}><Activity size={24} color="#3b82f6" /></div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>SAFE DAILY OC</h2>
                                <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{isEn ? 'Target Boost' : 'Cílový Boost'}</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '950', color: '#fff', textShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>{safeBoost} GHz</div>
                        </div>
                    </div>
                </div>

                {/* AFFILIATE HOOK */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>
                        {isEn ? `Cooling the ${cpu.name}` : `Chlazení pro ${cpu.name}`}
                    </h2>
                    <p style={{ color: '#9ca3af', marginBottom: '25px', maxWidth: '600px', margin: '0 auto 25px auto' }}>
                        {isEn ? `To hit ${safeBoost} GHz, you need premium cooling.` : `Pro dosažení stabilních ${safeBoost} GHz potřebujete prémiové chlazení.`}
                    </p>
                    <a href={coolerLink} target="_blank" rel="nofollow sponsored" style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', padding: '18px 30px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)', transition: '0.3s' }}>
                        <ThermometerSnowflake size={24} /> {isEn ? 'UPGRADE COOLING NOW' : 'ZLEPŠIT CHLAZENÍ PC'}
                    </a>
                </div>

                {/* --- GOOGLE SPIDER WEB: INTERNÍ PROLINKOVÁNÍ --- */}
                <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '50px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Link2 color="#a855f7" /> {isEn ? 'Guru Ecosystem & Related CPUs' : 'Guru Ekosystém a Související CPU'}
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        
                        {/* Pevné Hardlinky (Autorita webu) */}
                        <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '15px', borderRadius: '12px', color: '#eab308', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', transition: '0.2s' }}>
                            <Gauge size={18} /> {isEn ? 'Bottleneck Calculator' : 'Bottleneck Kalkulačka'}
                        </a>
                        <a href={isEn ? "/en/cpu-index" : "/cpu-index"} style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)', padding: '15px', borderRadius: '12px', color: '#66fcf1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', transition: '0.2s' }}>
                            <Layers size={18} /> {isEn ? 'Full CPU Database' : 'Kompletní Databáze CPU'}
                        </a>

                        {/* Dynamické prolinky na další procesory (Zamezuje slepým uličkám) */}
                        {relatedCpus.map(related => (
                            <a key={related.slug} href={isEn ? `/en/overclocking/cpu/${related.slug}` : `/overclocking/cpu/${related.slug}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', color: '#d1d5db', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', transition: '0.2s' }}>
                                <Cpu size={16} color="#9ca3af" /> {related.name}
                            </a>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
