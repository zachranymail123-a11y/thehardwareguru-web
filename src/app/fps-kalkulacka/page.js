import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight, ChevronLeft, Zap, BookOpen } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE - V3.3 (MAXIMUM PROLINKOVÁNÍ & SEO SILOING)
 * 🛡️ FIX: Striktně id,name pro cpus dle tvého požadavku.
 * 🛡️ SILOING: Zachován tvůj design mini-karet, přidány odkazy na Bottleneck a články.
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

  // GURU: Načítáme hardware. U CPU používáme tvůj optimalizovaný select.
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
        
        {/* Zpětný odkaz na HW Hub */}
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

        {/* 🚀 SEO SILOING: PROLINKOVÁNÍ NA KATALOGY (Tvůj původní design) */}
        <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-mini-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Cpu size={20} color="#f59e0b" /> {isEn ? 'CPU DATABASE' : 'KATALOG PROCESORŮ'}
                </div>
                <ArrowRight size={16} />
            </a>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-mini-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Monitor size={20} color="#66fcf1" /> {isEn ? 'GPU DATABASE' : 'KATALOG GRAFIK'}
                </div>
                <ArrowRight size={16} />
            </a>
            
            {/* Nově přidáno: Bottleneck odkaz ve stejném stylu */}
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-mini-card highlight-border">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Zap size={20} color="#a855f7" /> {isEn ? 'BOTTLENECK CALC' : 'BOTTLENECK NÁSTROJ'}
                </div>
                <ArrowRight size={16} />
            </a>
        </div>

        {/* Info Box pod kalkulačkou */}
        <div style={{ marginTop: '40px', padding: '40px', background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '20px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={24} /> {isEn ? 'How it works?' : 'Jak to funguje?'}
            </h2>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: '0' }}>
                {isEn 
                    ? 'Our engine compares real-world gaming data from hundreds of benchmarks. We calculate the performance based on the specific combination of your CPU and GPU to give you the most accurate FPS estimation.' 
                    : 'Náš engine porovnává reálná data ze stovek herních benchmarků. Počítáme výkon na základě konkrétní kombinace vašeho procesoru a grafiky, abychom vám poskytli co nejpřesnější odhad FPS.'}
            </p>
        </div>

        {/* 🚀 NOVĚ PŘIDÁNO: SEO SILOING ČLÁNKY (Designově ladí s Info Boxem) */}
        <div style={{ marginTop: '40px', padding: '40px', background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '950', marginBottom: '20px', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} /> {isEn ? 'Related Guides' : 'Související Návody'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <a href={isEn ? "/en/clanky/jak-vyresit-bottleneck-navod" : "/clanky/jak-vyresit-bottleneck-navod"} className="silo-article-link">
                    <span className="tag">{isEn ? 'Guide' : 'Návod'}</span>
                    <span className="title">{isEn ? 'How to fix PC bottleneck step by step' : 'Jak vyřešit Bottleneck v PC krok za krokem'}</span>
                </a>
                <a href={isEn ? "/en/clanky/nejlepsi-cpu-pro-rtx-5090-5080" : "/clanky/nejlepsi-cpu-pro-rtx-5090-5080"} className="silo-article-link">
                    <span className="tag tag-hot">Hot</span>
                    <span className="title">{isEn ? 'Best CPUs for RTX 5090 & 5080' : 'Nejlepší procesory pro RTX 5090 a 5080'}</span>
                </a>
            </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(168, 85, 247, 0.1); transform: translateX(-5px); }
        
        .silo-mini-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.9); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; font-weight: 950; text-transform: uppercase; font-size: 13px; transition: 0.3s; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        
        .highlight-border { border-color: rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.05); }
        .highlight-border:hover { border-color: #a855f7; background: rgba(168, 85, 247, 0.1); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.2); }

        .silo-article-link { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); text-decoration: none; transition: 0.3s; }
        .silo-article-link:hover { background: rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.1); transform: translateX(5px); }
        .silo-article-link .tag { background: rgba(255,255,255,0.1); color: #d1d5db; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
        .silo-article-link .tag-hot { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }
        .silo-article-link .title { color: #fff; font-size: 14px; font-weight: bold; }
        .silo-article-link:hover .title { color: #a855f7; }
      `}} />
    </div>
  );
}
