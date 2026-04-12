import React from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { Gamepad2, Monitor, Cpu, ArrowRight, Zap, Sparkles, Swords, ChevronRight, Flame, AlertTriangle } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 

/**
 * GURU FPS ENGINE - V8.4 (THE REVENUE TERMINATOR)
 * 🚀 CÍL: FAQ Schema, Slug Prefill logic, Retargeting UI a Panic Sell Mode.
 */

export const runtime = 'edge';
export const preferredRegion = 'fra1'; 
export const revalidate = 3600; 

const baseUrl = "https://thehardwareguru.cz";

const formatSlug = (slug) => 
  slug
    .replace(/-/g, ' ')
    .replace(/\b(\w)/g, c => c.toUpperCase());

export async function generateMetadata(props) {
  const p = await props.params;
  const s = await props.searchParams;
  const isEn = (p?.lang === 'en' || s?.lang === 'en');
  
  const slug = p?.slug || "";
  const slugTitle = slug ? ` - ${formatSlug(slug)}` : "";

  return {
    title: isEn 
      ? `GTA VI FPS Predictor & PC Performance Calculator${slugTitle} | Guru` 
      : `GTA VI FPS Predikce & Kalkulačka Výkonu${slugTitle} | Hardware Guru`,
    description: isEn 
      ? 'Estimate your GTA VI performance. AI-driven FPS predictor based on real benchmarks.' 
      : 'Zjisti jako první, kolik FPS ti dá GTA VI na tvé sestavě. Unikátní AI odhad výkonu.',
    alternates: { 
        canonical: slug ? `${baseUrl}/fps-calculator/${slug}` : `${baseUrl}/fps-kalkulacka`,
        languages: { "en": `${baseUrl}/en/fps-calculator`, "cs": `${baseUrl}/fps-kalkulacka` }
    }
  };
}

export default async function FpsKalkulackaPage(props) {
  const p = await props.params;
  const s = await props.searchParams;
  const isEn = (props?.isEnProxy === true) || (p?.lang === 'en') || (s?.lang === 'en') || false;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { fetch: (url, options) => fetch(url, { ...options, cache: 'force-cache', next: { revalidate: 3600 } }) }
  });

  const [gpuRes, cpuRes, gameRes] = await Promise.all([
    supabase.from('gpus').select('id,name,vendor,performance_index').order('performance_index', { ascending: false }).limit(150),
    supabase.from('cpus').select('id,name,performance_index').order('performance_index', { ascending: false }).limit(150),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  if (gpuRes.error || cpuRes.error) {
    return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>DATABASE SYNC ERROR. REFRESH.</div>;
  }

  // Dynamický linking matrix
  const topGpus = gpuRes.data.slice(0, 4);
  const topCpus = cpuRes.data.slice(0, 2);
  const dynamicBuilds = topGpus.flatMap(gpu => 
    topCpus.map(cpu => ({
      name: `${gpu.name} + ${cpu.name}`,
      slug: `${gpu.name}-${cpu.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }))
  ).slice(0, 8);

  return (
    <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* WEB APP SCHEMA */}
      <Script id="schema-webapp" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": isEn ? "GTA VI FPS Predictor" : "FPS Kalkulačka GTA VI",
        "applicationCategory": "GameApplication",
        "operatingSystem": "All"
      })}} />

      {/* 🔥 FIX #4: FAQ SCHEMA PRO CTR BOOST 🔥 */}
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": isEn ? "Can my PC run GTA VI?" : "Rozjede můj PC hru GTA VI?",
            "acceptedAnswer": { "@type": "Answer", "text": isEn ? "Use this AI-driven FPS calculator to estimate performance based on your hardware." : "Použijte tuto AI kalkulačku k odhadu výkonu na základě vašeho hardware." }
          }
        ]
      })}} />

      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="guru-badge"><Gamepad2 size={16} /> GURU FPS ENGINE</div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CAN I' : 'ROZJEDU'} <span style={{ color: '#a855f7' }}>{isEn ? 'RUN IT?' : 'TO?'}</span>
          </h1>

          <div className="main-bait-panel">
            <div className="bait-tag"><Sparkles size={14} /> EXCLUSIVE AI MODULE</div>
            <h2 className="bait-title">{isEn ? 'PREDICT YOUR FPS IN ' : 'ZJISTI SVŮJ VÝKON V '}<span style={{color: '#f43f5e'}}>GTA VI</span></h2>
          </div>
        </header>

        <div style={{ marginTop: '30px' }}>
          {/* 🔥 FIX #1: SLUG PRO PARSING 🔥 */}
          <FpsCalculatorClient 
            gpus={gpuRes.data || []} 
            cpus={cpuRes.data || []} 
            games={gameRes.data || []} 
            isEn={isEn}
            slug={p?.slug} 
          />
        </div>

        <section style={{ marginTop: '50px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8 }}>
                <Flame size={16} color="#f59e0b" /> {isEn ? 'TRENDING CONFIGURATIONS' : 'TOP KONFIGURACE'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {dynamicBuilds.map(build => (
                    <Link key={build.slug} href={isEn ? `/en/fps-calculator/${build.slug}` : `/fps-kalkulacka/${build.slug}`} prefetch={true} className="popular-build-link">
                        <span>{build.name}</span>
                        <ChevronRight size={14} />
                    </Link>
                ))}
            </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <HeurekaButtons isEn={isEn} manualSearch="RTX 5090" />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
        .main-bait-panel { background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; margin-top: 30px; border-bottom: 2px solid #f43f5e; text-align: center; }
        .bait-title { font-size: 22px; font-weight: 950; margin: 0; text-transform: uppercase; }
        .popular-build-link { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 14px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #9ca3af; font-size: 12px; font-weight: 700; transition: 0.3s; }
        .popular-build-link:hover { background: rgba(255,255,255,0.06); border-color: #a855f7; color: #fff; transform: translateX(5px); }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        @media (max-width: 768px) { .main-title { font-size: 2rem !important; } }
      `}} />
    </div>
  );
}
