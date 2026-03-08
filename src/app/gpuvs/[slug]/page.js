import React from 'react';
import { ChevronLeft, Swords, Cpu, Flame, Heart, ShoppingCart, ShieldCheck, Ghost } from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V1.3 (SEO ENHANCED)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * Funkce: Detekce jazyka podle slugu, sjednocená SEO metadata s články, Versus design.
 */

// 🚀 GURU FIX: Bezpečné načtení modulů pro Vercel a produkční prostředí
const getClient = () => {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

const getNotFound = () => require('next/navigation').notFound;
const getLink = () => require('next/link').default;

// 🚀 GURU SEO: Dynamické Meta Tagy (Sjednoceno s architekturou článků)
export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = getClient();
  
  const { data: duel } = await supabase
    .from('gpu_duels')
    .select('title_cs, title_en, seo_description_cs, seo_description_en, slug, slug_en')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (!duel) return { title: '404 | The Hardware Guru' };

  // Identifikace jazyka pro meta tagy
  const isEn = duel.slug_en === slug;
  const title = isEn && duel.title_en ? duel.title_en : (duel.title_cs || 'GPU Duel');
  const desc = isEn && duel.seo_description_en ? duel.seo_description_en : (duel.seo_description_cs || '');

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      // Jako náhledový obrázek můžeme v budoucnu generovat dynamické VS bannery
      images: ['https://www.thehardwareguru.cz/bg-guru.png'],
    },
    alternates: {
      languages: {
        'cs': `https://www.thehardwareguru.cz/gpuvs/${duel.slug}`,
        'en': `https://www.thehardwareguru.cz/en/gpuvs/${duel.slug_en}`,
      },
    },
  };
}

export default async function GpuDuelDetail({ params }) {
  const { slug } = params;
  const supabase = getClient();
  const notFound = getNotFound();
  const Link = getLink();

  // 1. GURU FETCH: Najdeme duel podle jakéhokoliv slugu
  const { data: duel, error: duelError } = await supabase
    .from('gpu_duels')
    .select('*')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();
  
  if (duelError || !duel) notFound();

  // 2. DETEKCE JAZYKA
  const isEn = duel.slug_en === slug;

  // Načtení dat o kartách
  const { data: gpuA } = await supabase.from('gpus').select('*').eq('id', duel.gpu_a_id).single();
  const { data: gpuB } = await supabase.from('gpus').select('*').eq('id', duel.gpu_b_id).single();

  if (!gpuA || !gpuB) notFound();

  // Lokalizované texty
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const content = isEn && duel.content_en ? duel.content_en : duel.content_cs;
  const backLink = isEn ? '/en' : '/';
  
  // Design logika pro vítěze v tabulce
  const getWinnerClass = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return 'text-neutral-500';
    if (lowerIsBetter) return valA < valB ? 'text-green-400 font-black' : 'text-red-500';
    return valA > valB ? 'text-green-400 font-black' : 'text-red-500';
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#3b82f6');
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
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose ul { padding-left: 1.5em; margin-bottom: 1.5em; }
        .spec-row { display: flex; justify-content: space-between; padding: 18px 25px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; }
        .gpu-header-card { padding: 40px 30px; border-radius: 24px; text-align: center; border-top: 5px solid; background: rgba(15, 17, 21, 0.9); backdrop-filter: blur(10px); }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 4px solid #0a0b0d; box-shadow: 0 0 40px rgba(255,0,85,0.6); z-index: 10; }
        .text-green-400 { color: #4ade80; } .text-red-500 { color: #ef4444; } .font-black { font-weight: 900; }
      `}} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* NAVIGACE - SHODNÁ S ČLÁNKY */}
        <div style={{ marginBottom: '40px' }}>
          <Link href={backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronLeft size={16} /> {isEn ? 'BACK TO HOME' : 'ZPĚT NA HLAVNÍ STRANU'}
          </Link>
        </div>

        {/* HERO HLAVIČKA DUELU */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0055', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid #ff0055', borderRadius: '50px', background: 'rgba(255,0,85,0.1)' }}>
            <Swords size={14} /> GURU HARDWARE VERSUS
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: '1.1', margin: 0 }}>
            {title}
          </h1>
        </div>

        {/* GRAFICKÉ KARTY PŘEHLED (Designové "Ring") */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '50px' }}>
            
            {/* KARTA A */}
            <div className="gpu-header-card" style={{ borderColor: getVendorColor(gpuA.vendor) }}>
                <span style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '1px' }}>{gpuA.vendor} • {gpuA.architecture}</span>
                <h2 style={{ fontSize: '28px', fontWeight: '950', margin: '10px 0 0 0' }}>{gpuA.name}</h2>
            </div>

            {/* VS ODZNAK */}
            <div className="vs-badge">VS</div>

            {/* KARTA B */}
            <div className="gpu-header-card" style={{ borderColor: getVendorColor(gpuB.vendor) }}>
                <span style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '1px' }}>{gpuB.vendor} • {gpuB.architecture}</span>
                <h2 style={{ fontSize: '28px', fontWeight: '950', margin: '10px 0 0 0' }}>{gpuB.name}</h2>
            </div>
        </div>

        {/* SROVNÁVACÍ TABULKA - ČISTÝ GURU STYL */}
        <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? 'Technical Specifications' : 'Technické specifikace'}
                </h3>
            </div>
            
            <div className="spec-row">
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuA.vram_gb, gpuB.vram_gb)}`}>{gpuA.vram_gb} GB</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">VRAM</div>
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuB.vram_gb, gpuA.vram_gb)}`}>{gpuB.vram_gb} GB</div>
            </div>
            
            <div className="spec-row">
                <div className="flex-1 text-center text-lg text-neutral-200">{gpuA.memory_bus}</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">{isEn ? 'Memory Bus' : 'Sběrnice'}</div>
                <div className="flex-1 text-center text-lg text-neutral-200">{gpuB.memory_bus}</div>
            </div>

            <div className="spec-row">
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuA.boost_clock_mhz, gpuB.boost_clock_mhz)}`}>{gpuA.boost_clock_mhz} MHz</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">Boost Clock</div>
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuB.boost_clock_mhz, gpuA.boost_clock_mhz)}`}>{gpuB.boost_clock_mhz} MHz</div>
            </div>

            <div className="spec-row">
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuA.tdp_w, gpuB.tdp_w, true)}`}>{gpuA.tdp_w} W</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">TDP</div>
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuB.tdp_w, gpuA.tdp_w, true)}`}>{gpuB.tdp_w} W</div>
            </div>

            <div className="spec-row">
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuA.release_price_usd, gpuB.release_price_usd, true)}`}>${gpuA.release_price_usd}</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">{isEn ? 'MSRP Price' : 'Zaváděcí Cena'}</div>
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuB.release_price_usd, gpuA.release_price_usd, true)}`}>${gpuB.release_price_usd}</div>
            </div>
        </div>

        {/* AI VERDIKT - JÁDRO ČLÁNKU */}
        <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '30px' }}>
                <Cpu size={18} /> GURU AI VERDICT
            </div>
            <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* GURU GLOBÁLNÍ CTA TLAČÍTKA (Sjednoceno s články) */}
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
