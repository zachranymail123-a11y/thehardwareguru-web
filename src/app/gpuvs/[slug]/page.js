import React from 'react';
import { ChevronLeft, Swords, Cpu, Flame, Heart, ShoppingCart } from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - FRONTEND V1.1
 * Automatizované SEO stránky porovnávající grafické karty.
 * Plná podpora dynamických barev (Nvidia vs AMD) a srovnávací tabulky.
 */

// 🚀 GURU FIX: Bezpečné načtení modulů pro prostředí Canvas (řeší chyby kompilace)
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  // Fallback pro lokální náhled
  createClient = () => ({ from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) }) });
}

let notFound;
try {
  notFound = require('next/navigation').notFound;
} catch (e) {
  notFound = () => console.log("404 - Not Found");
}

let Link;
try {
  Link = require('next/link').default || require('next/link');
} catch (e) {
  Link = ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>;
}

// 🚀 GURU PŘEPÍNAČ JAZYKA: 
// Pro českou verzi v "src/app/gpuvs/[slug]" nechej FALSE.
// Pro anglickou verzi v "src/app/en/gpuvs/[slug]" změň na TRUE.
const IS_ENGLISH_VERSION = false; 

// --- BEZPEČNÁ INICIALIZACE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

// 🚀 GURU SEO: Dynamické Meta Tagy pro vyhledávače
export async function generateMetadata({ params }) {
  const { slug } = params;
  const isEn = IS_ENGLISH_VERSION;
  
  const { data: duel } = await supabase.from('gpu_duels').select('*').eq('slug', slug).single();
  if (!duel) return { title: '404 | The Hardware Guru' };

  const title = isEn && duel.title_en ? duel.title_en : (duel.title_cs || 'GPU Duel');
  const desc = isEn && duel.seo_description_en ? duel.seo_description_en : (duel.seo_description_cs || '');

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: { title, description: desc }
  };
}

// Pomocná funkce pro barvu podle výrobce
const getVendorColor = (vendor) => {
  const v = (vendor || '').toUpperCase();
  if (v === 'NVIDIA') return '#76b900'; // Nvidia Green
  if (v === 'AMD') return '#ed1c24';    // AMD Red
  return '#3b82f6';                     // Default Blue
};

export default async function GpuDuelDetail({ params }) {
  const { slug } = params || { slug: 'rtx-5070-vs-rx-9070' };
  const isEn = IS_ENGLISH_VERSION;

  // 1. BEZPEČNÝ FETCH
  const { data: duel, error: duelError } = await supabase.from('gpu_duels').select('*').eq('slug', slug).single();
  
  if (duelError || !duel) {
    // Pro ukázku v náhledu, pokud data neexistují
    return <div style={{padding: '100px', color: '#fff', textAlign: 'center'}}>Zadej platný slug nebo vygeneruj duel v adminu.</div>;
  }

  const { data: gpuA } = await supabase.from('gpus').select('*').eq('id', duel.gpu_a_id).single();
  const { data: gpuB } = await supabase.from('gpus').select('*').eq('id', duel.gpu_b_id).single();

  if (!gpuA || !gpuB) notFound();

  // 2. JAZYKOVÁ LOGIKA
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const content = isEn && duel.content_en ? duel.content_en : duel.content_cs;

  // 3. LOGIKA POROVNÁVÁNÍ (Zvýraznění vítěze)
  const getWinnerClass = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return 'text-neutral-400';
    if (lowerIsBetter) return valA < valB ? 'text-green-400 font-black' : 'text-red-400';
    return valA > valB ? 'text-green-400 font-black' : 'text-red-400';
  };

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px',
        color: '#fff', fontFamily: 'sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-top: 2em; margin-bottom: 1em; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; }
        .guru-prose h3 { color: #eab308; font-size: 1.5rem; font-weight: 900; margin-top: 1.5em; margin-bottom: 0.8em; }
        .guru-prose p { margin-bottom: 1.5em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose ul { padding-left: 1.5em; margin-bottom: 1.5em; }
        .guru-prose li { margin-bottom: 0.5em; }
        .spec-row { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; }
        .spec-row:nth-child(even) { background: rgba(255,255,255,0.02); }
        .spec-row:hover { background: rgba(255,255,255,0.05); }
        .spec-val { flex: 1; text-align: center; font-size: 16px; font-weight: 900; }
        .spec-label { flex: 1; text-align: center; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
        
        .gpu-header-card { padding: 30px; border-radius: 20px; text-align: center; border-top: 4px solid; position: relative; overflow: hidden; background: linear-gradient(to bottom, rgba(31, 40, 51, 0.9) 0%, rgba(15, 17, 21, 0.95) 100%); }
        .vs-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ff0055; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 20px; border: 4px solid #0a0b0d; box-shadow: 0 0 30px rgba(255,0,85,0.6); z-index: 10; }
        
        /* Utility colors */
        .text-green-400 { color: #4ade80; }
        .text-red-400 { color: #f87171; }
        .text-neutral-400 { color: #a3a3a3; }
        .text-neutral-200 { color: #e5e5e5; }
        .font-black { font-weight: 900; }

        @media (max-width: 768px) {
          .vs-badge { position: static; transform: none; margin: 20px auto; }
          .gpu-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* NAVIGACE */}
        <div style={{ marginBottom: '40px' }}>
          <Link href={isEn ? '/en' : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', transition: '0.3s' }}>
            <ChevronLeft size={16} /> {isEn ? 'BACK TO HOME' : 'ZPĚT NA HLAVNÍ STRANU'}
          </Link>
        </div>

        {/* HERO HLAVIČKA DUELU */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0055', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid #ff0055', borderRadius: '50px', background: 'rgba(255,0,85,0.1)' }}>
            <Swords size={14} /> GURU HARDWARE VERSUS
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: '1.1', margin: 0, textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            {title}
          </h1>
        </div>

        {/* GRAFICKÉ KARTY PŘEHLED */}
        <div className="gpu-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', position: 'relative', marginBottom: '50px' }}>
            
            {/* KARTA A */}
            <div className="gpu-header-card" style={{ borderColor: getVendorColor(gpuA.vendor) }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: getVendorColor(gpuA.vendor), letterSpacing: '2px' }}>{gpuA.vendor} • {gpuA.architecture}</span>
                <h2 style={{ fontSize: '28px', fontWeight: '950', margin: '10px 0 0 0' }}>{gpuA.name}</h2>
            </div>

            {/* VS ODZNAK */}
            <div className="vs-badge">VS</div>

            {/* KARTA B */}
            <div className="gpu-header-card" style={{ borderColor: getVendorColor(gpuB.vendor) }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: getVendorColor(gpuB.vendor), letterSpacing: '2px' }}>{gpuB.vendor} • {gpuB.architecture}</span>
                <h2 style={{ fontSize: '28px', fontWeight: '950', margin: '10px 0 0 0' }}>{gpuB.name}</h2>
            </div>
        </div>

        {/* POROVNÁVACÍ TABULKA */}
        <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginBottom: '60px', backdropFilter: 'blur(10px)' }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? 'Technical Specifications' : 'Technické specifikace'}
                </h3>
            </div>
            
            <div className="spec-row">
                <div className={`spec-val ${getWinnerClass(gpuA.vram_gb, gpuB.vram_gb)}`}>{gpuA.vram_gb} GB</div>
                <div className="spec-label">VRAM</div>
                <div className={`spec-val ${getWinnerClass(gpuB.vram_gb, gpuA.vram_gb)}`}>{gpuB.vram_gb} GB</div>
            </div>
            
            <div className="spec-row">
                <div className="spec-val text-neutral-200">{gpuA.memory_bus}</div>
                <div className="spec-label">{isEn ? 'Memory Bus' : 'Sběrnice'}</div>
                <div className="spec-val text-neutral-200">{gpuB.memory_bus}</div>
            </div>

            <div className="spec-row">
                <div className={`spec-val ${getWinnerClass(gpuA.boost_clock_mhz, gpuB.boost_clock_mhz)}`}>{gpuA.boost_clock_mhz} MHz</div>
                <div className="spec-label">Boost Clock</div>
                <div className={`spec-val ${getWinnerClass(gpuB.boost_clock_mhz, gpuA.boost_clock_mhz)}`}>{gpuB.boost_clock_mhz} MHz</div>
            </div>

            <div className="spec-row">
                {/* U TDP je nižší hodnota lepší */}
                <div className={`spec-val ${getWinnerClass(gpuA.tdp_w, gpuB.tdp_w, true)}`}>{gpuA.tdp_w} W</div>
                <div className="spec-label">TDP (Spotřeba)</div>
                <div className={`spec-val ${getWinnerClass(gpuB.tdp_w, gpuA.tdp_w, true)}`}>{gpuB.tdp_w} W</div>
            </div>

            <div className="spec-row">
                {/* U ceny je nižší hodnota lepší */}
                <div className={`spec-val ${getWinnerClass(gpuA.release_price_usd, gpuB.release_price_usd, true)}`}>${gpuA.release_price_usd}</div>
                <div className="spec-label">{isEn ? 'MSRP Price' : 'Zaváděcí Cena'}</div>
                <div className={`spec-val ${getWinnerClass(gpuB.release_price_usd, gpuA.release_price_usd, true)}`}>${gpuB.release_price_usd}</div>
            </div>
        </div>

        {/* AI VERDIKT (ČLÁNEK) */}
        <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '30px' }}>
                <Cpu size={18} /> GURU AI VERDICT
            </div>
            <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* GURU GLOBÁLNÍ CTA TLAČÍTKA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
            <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
              {isEn ? "Help us build this database by supporting us." : "Líbí se ti tyto duely? Podpoř chod našich serverů."}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" 
                 style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '18px 30px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', fontWeight: '950', fontSize: '15px', textTransform: 'uppercase', borderRadius: '16px', textDecoration: 'none', transition: '0.3s', boxShadow: '0 10px 25px rgba(249, 115, 22, 0.3)' }}>
                <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
              </a>
              <Link href={isEn ? "/en/support" : "/support"} 
                 style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '18px 30px', background: '#eab308', color: '#000', fontWeight: '950', fontSize: '15px', textTransform: 'uppercase', borderRadius: '16px', textDecoration: 'none', transition: '0.3s', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.2)' }}>
                <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
            </div>
        </div>

      </main>
    </div>
  );
}
