import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight, ChevronLeft, Wrench, BookOpen, Zap } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE - V4.0 (MAXIMUM SEO SILOING)
 * 🛡️ PROLINKOVÁNÍ: Extrémní rozšíření interních odkazů na nástroje, katalogy a články.
 * 🛡️ SEO: Google Golden Rich + CZ/EN alternates.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  return {
    title: isEn ? 'FPS Calculator 2026 | The Hardware Guru' : 'FPS Kalkulačka 2026 | The Hardware Guru',
    description: isEn 
      ? 'Calculate your gaming FPS in seconds. Accurate hardware benchmarks for AMD, Intel and NVIDIA.' 
      : 'Vypočítej si herní FPS během sekundy. Přesné benchmarky pro AMD, Intel a NVIDIA.',
    alternates: { 
        canonical: `${baseUrl}/fps-kalkulacka`,
        languages: { "en": `${baseUrl}/en/fps-calculator`, "cs": `${baseUrl}/fps-kalkulacka` }
    }
  };
}

export default async function FpsKalkulackaPage(props) {
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Načítání HW
  const [gpuRes, cpuRes, gameRes] = await Promise.all([
    supabase.from('gpus').select('id,name,vendor,slug').order('name'),
    supabase.from('cpus').select('id,name').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  const gpus = gpuRes.data || [];
  const cpus = cpuRes.data || [];
  const games = gameRes.data || [];

  // Google Golden Rich Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": isEn ? "Guru FPS Calculator" : "Guru FPS Kalkulačka",
    "url": isEn ? `${baseUrl}/en/fps-calculator` : `${baseUrl}/fps-kalkulacka`,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Professional tool for estimating gaming performance and frames per second."
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        {/* Zpětný odkaz */}
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO HARDWARE HUB' : 'ZPĚT NA HW ROZCESTNÍK'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Gamepad2 size={16} /> GURU FPS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'FPS' : 'ROZJEDU'} <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>{isEn ? 'CALCULATOR' : 'TO?'}</span>
          </h1>
        </header>

        {/* Kalkulačka */}
        <FpsCalculatorClient gpus={gpus} cpus={cpus} games={games} isEn={isEn} />

        {/* Info Box */}
        <div style={{ marginTop: '50px', padding: '30px', background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '950', marginBottom: '15px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={20} /> {isEn ? 'How it works?' : 'Jak to funguje?'}
            </h2>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: '0', fontSize: '14px' }}>
                {isEn 
                    ? 'Our engine compares real-world gaming data from hundreds of benchmarks. We calculate the performance based on the specific combination of your CPU and GPU to give you the most accurate FPS estimation.' 
                    : 'Náš engine porovnává reálná data ze stovek herních benchmarků. Počítáme výkon na základě konkrétní kombinace vašeho procesoru a grafiky, abychom vám poskytli co nejpřesnější odhad FPS.'}
            </p>
        </div>

        {/* 🚀 EXTRÉMNÍ SEO SILOING: NÁSTROJE & KATALOGY */}
        <div style={{ marginTop: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
                <Wrench size={20} color="#a855f7" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
                    {isEn ? 'Explore Guru Tools & Databases' : 'Prozkoumej Guru Nástroje a Katalogy'}
                </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-mega-card">
                    <div className="icon-wrapper cpu-bg"><Cpu size={24} color="#f59e0b" /></div>
                    <div className="text-content">
                        <h3>{isEn ? 'CPU Database' : 'Katalog Procesorů'}</h3>
                        <p>{isEn ? 'Full specs and benchmarks.' : 'Kompletní specifikace a testy.'}</p>
                    </div>
                    <ArrowRight size={18} className="arrow" />
                </a>

                <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-mega-card">
                    <div className="icon-wrapper gpu-bg"><Monitor size={24} color="#66fcf1" /></div>
                    <div className="text-content">
                        <h3>{isEn ? 'GPU Database' : 'Katalog Grafik'}</h3>
                        <p>{isEn ? 'Compare the latest GPUs.' : 'Srovnání nejnovějších grafik.'}</p>
                    </div>
                    <ArrowRight size={18} className="arrow" />
                </a>

                <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-mega-card highlight-border">
                    <div className="icon-wrapper vs-bg"><Zap size={24} color="#a855f7" /></div>
                    <div className="text-content">
                        <h3>{isEn ? 'Bottleneck Calculator' : 'Bottleneck Kalkulačka'}</h3>
                        <p>{isEn ? 'Find your PC weak spot.' : 'Najdi slabé místo svého PC.'}</p>
                    </div>
                    <ArrowRight size={18} className="arrow" />
                </a>
            </div>
        </div>

        {/* 🚀 SEO SILOING: ČLÁNKY & NÁVODY */}
        <div style={{ marginTop: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
                <BookOpen size={20} color="#f43f5e" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
                    {isEn ? 'Hardware Guides & Articles' : 'Hardwarové Návody a Články'}
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                <a href={isEn ? "/en/clanky/jak-vyresit-bottleneck-navod" : "/clanky/jak-vyresit-bottleneck-navod"} className="silo-article-card">
                    <span className="tag">{isEn ? 'Guide' : 'Návod'}</span>
                    <span className="title">{isEn ? 'How to fix PC bottleneck step by step' : 'Jak vyřešit Bottleneck v PC krok za krokem'}</span>
                </a>
                <a href={isEn ? "/en/clanky/nejlepsi-cpu-pro-rtx-5090-5080" : "/clanky/nejlepsi-cpu-pro-rtx-5090-5080"} className="silo-article-card">
                    <span className="tag tag-hot">Hot</span>
                    <span className="title">{isEn ? 'Best CPUs for RTX 5090 & 5080' : 'Nejlepší procesory pro RTX 5090 a 5080'}</span>
                </a>
            </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(168, 85, 247, 0.1); transform: translateX(-5px); }
        
        /* MEGA CARDS PRO NÁSTROJE */
        .silo-mega-card { display: flex; align-items: center; gap: 20px; background: rgba(15,17,21,0.9); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; overflow: hidden; }
        .silo-mega-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.1); }
        .highlight-border { border-color: rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.03); }
        .highlight-border:hover { border-color: #a855f7; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.15); }
        
        .icon-wrapper { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cpu-bg { background: rgba(245, 158, 11, 0.1); }
        .gpu-bg { background: rgba(102, 252, 241, 0.1); }
        .vs-bg { background: rgba(168, 85, 247, 0.1); }
        
        .text-content h3 { margin: 0 0 5px 0; font-size: 15px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.5px; }
        .text-content p { margin: 0; font-size: 12px; color: #9ca3af; font-weight: 600; }
        .arrow { margin-left: auto; color: #6b7280; transition: 0.3s; }
        .silo-mega-card:hover .arrow { color: #fff; transform: translateX(3px); }

        /* ČLÁNKY CARDS */
        .silo-article-card { display: flex; align-items: center; gap: 15px; background: rgba(15,17,21,0.6); padding: 15px 20px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.03); text-decoration: none; transition: 0.3s; }
        .silo-article-card:hover { background: rgba(15,17,21,1); border-color: rgba(255,255,255,0.1); transform: translateX(5px); }
        .silo-article-card .tag { background: rgba(255,255,255,0.1); color: #d1d5db; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
        .silo-article-card .tag-hot { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }
        .silo-article-card .title { color: #fff; font-size: 13px; font-weight: bold; line-height: 1.4; }
        .silo-article-card:hover .title { color: #a855f7; }
      `}} />
    </div>
  );
}
