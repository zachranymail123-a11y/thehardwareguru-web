import React from 'react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V2.0 (PRODUCTION & SEO SUPREME)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * Funkce: Automatická detekce jazyka, sjednocené SEO s články, Versus design.
 * Oprava: Robustní inicializace Supabase pro Server Components a oprava filtrování.
 */

// 🚀 GURU BUILD SHIELD: Bezpečné načtení modulů pro různé prostředí
const getSupabaseClient = () => {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
};

const getLucideIcons = () => require('lucide-react');
const getNextNavigation = () => require('next/navigation');
const getNextLink = () => require('next/link').default;

// 🚀 GURU SEO: Dynamické Meta Tagy (Identické s architekturou tvých článků)
export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = getSupabaseClient();
  
  // Hledáme v obou sluzích pro podporu Proxy patternu
  const { data: duel } = await supabase
    .from('gpu_duels')
    .select('title_cs, title_en, seo_description_cs, seo_description_en, slug, slug_en')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (!duel) return { title: 'Duel nenalezen | The Hardware Guru' };

  // Detekce jazyka pro SEO metadata
  const isEn = duel.slug_en === slug;
  const title = isEn && duel.title_en ? duel.title_en : (duel.title_cs || 'GPU Duel');
  const description = isEn && duel.seo_description_en ? duel.seo_description_en : (duel.seo_description_cs || '');

  return {
    title: `${title} | The Hardware Guru`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: ['https://www.thehardwareguru.cz/bg-guru.png'],
      type: 'article',
    },
    alternates: {
      languages: {
        'cs': `https://www.thehardwareguru.cz/gpuvs/${duel.slug}`,
        'en': `https://www.thehardwareguru.cz/en/gpuvs/${duel.slug_en}`,
      },
    },
  };
}

export default async function GpuVsPage({ params }) {
  const { slug } = params;
  const supabase = getSupabaseClient();
  const { notFound } = getNextNavigation();
  const Link = getNextLink();
  const { 
    ChevronLeft, Swords, Cpu, Flame, Heart, ShoppingCart, 
    Calendar, ShieldCheck 
  } = getLucideIcons();

  // 1. GURU FETCH: Získání dat (hledáme v obou sluzích pro Proxy pattern)
  const { data: duel, error: duelError } = await supabase
    .from('gpu_duels')
    .select('*')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();
  
  if (duelError || !duel) notFound();

  // 2. DETEKCE JAZYKA
  const isEn = duel.slug_en === slug;

  // Načtení dat o konkrétních grafických kartách
  const { data: gpuA } = await supabase.from('gpus').select('*').eq('id', duel.gpu_a_id).single();
  const { data: gpuB } = await supabase.from('gpus').select('*').eq('id', duel.gpu_b_id).single();

  if (!gpuA || !gpuB) notFound();

  // Lokalizované texty a formáty (Sjednoceno s články)
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const content = isEn && duel.content_en ? duel.content_en : (duel.content_cs || duel.content);
  const date = new Date(duel.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const backLink = isEn ? '/en' : '/';
  
  // Design logika pro vítěze (Green/Red/Neutral)
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
        .guru-prose h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-top: 2em; margin-bottom: 1em; text-transform: uppercase; border-left: 5px solid #ff0055; padding-left: 20px; font-style: italic; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose ul { padding-left: 1.5em; margin-bottom: 1.5em; list-style: disc; }
        .guru-prose li { margin-bottom: 0.5em; }
        .spec-row { display: flex; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; transition: 0.3s; }
        .spec-row:hover { background: rgba(255,255,255,0.03); }
        .gpu-card-box { padding: 45px 30px; border-radius: 32px; text-align: center; border-top: 6px solid; background: rgba(17, 19, 24, 0.95); backdrop-filter: blur(15px); box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
        .vs-badge-supreme { background: #ff0055; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 28px; border: 6px solid #0a0b0d; box-shadow: 0 0 40px rgba(255,0,85,0.6); z-index: 10; margin: 0 -40px; }
        .guru-affiliate-cta { display: inline-flex; align-items: center; justify-content: center; gap: 15px; padding: 22px 50px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 20px; text-transform: uppercase; border-radius: 20px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 15px 40px rgba(234, 88, 12, 0.4); border: 1px solid rgba(255,255,255,0.1); }
        .guru-affiliate-cta:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 25px 60px rgba(234, 88, 12, 0.6); }
        .text-green-400 { color: #4ade80; } .text-red-500 { color: #ef4444; } .font-black { font-weight: 900; }
        @media (max-width: 768px) { .vs-badge-supreme { margin: 20px auto; } .ring-grid-system { grid-template-columns: 1fr !important; } }
      `}} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* --- NAVIGACE --- */}
        <div style={{ marginBottom: '40px' }}>
          <Link href={backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f97316', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronLeft size={16} /> {isEn ? "BACK TO BASE" : "ZPĚT NA ZÁKLADNU"}
          </Link>
        </div>

        {/* --- HLAVIČKA DUELU (Sjednoceno s články) --- */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff0055' }}>
                 <Swords size={18} /> {isEn ? "GURU VERSUS" : "GURU SOUBOJ"}
              </span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16}/> {date}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: '1.1', margin: 0, textShadow: '0 0 30px rgba(255,0,85,0.2)', fontStyle: 'italic', textDecoration: 'underline', textDecorationColor: 'rgba(249, 115, 22, 0.3)' }}>
            {title}
          </h1>
        </header>

        {/* --- VS RING (Vizuální srovnání) --- */}
        <div className="ring-grid-system" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '50px', position: 'relative' }}>
            <div className="gpu-card-box" style={{ borderColor: getVendorColor(gpuA.vendor) }}>
                <span style={{ fontSize: '12px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '2px' }}>{gpuA.vendor} • {gpuA.architecture}</span>
                <h2 style={{ fontSize: '32px', fontWeight: '950', margin: '10px 0 0 0', textTransform: 'uppercase' }}>{gpuA.name}</h2>
            </div>

            <div className="vs-badge-supreme">VS</div>

            <div className="gpu-card-box" style={{ borderColor: getVendorColor(gpuB.vendor) }}>
                <span style={{ fontSize: '12px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '2px' }}>{gpuB.vendor} • {gpuB.architecture}</span>
                <h2 style={{ fontSize: '32px', fontWeight: '950', margin: '10px 0 0 0', textTransform: 'uppercase' }}>{gpuB.name}</h2>
            </div>
        </div>

        {/* --- TECHNICKÉ PARAMETRY (Tabulka) --- */}
        <section style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginBottom: '60px', backdropFilter: 'blur(10px)' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '22px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', letterSpacing: '4px' }}>
                    {isEn ? "RAW SPECIFICATIONS" : "TECHNICKÉ PARAMETRY"}
                </h3>
            </div>
            
            <div className="spec-row">
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuA.vram_gb, gpuB.vram_gb)}`}>{gpuA.vram_gb} GB</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic' }}>VRAM</div>
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuB.vram_gb, gpuA.vram_gb)}`}>{gpuB.vram_gb} GB</div>
            </div>
            
            <div className="spec-row">
                <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', color: '#e5e5e5', fontWeight: '900' }}>{gpuA.memory_bus}</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic' }}>{isEn ? "BUS WIDTH" : "SBĚRNICE"}</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', color: '#e5e5e5', fontWeight: '900' }}>{gpuB.memory_bus}</div>
            </div>

            <div className="spec-row">
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuA.boost_clock_mhz, gpuB.boost_clock_mhz)}`}>{gpuA.boost_clock_mhz} MHz</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic' }}>BOOST CLOCK</div>
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuB.boost_clock_mhz, gpuA.boost_clock_mhz)}`}>{gpuB.boost_clock_mhz} MHz</div>
            </div>

            <div className="spec-row">
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuA.tdp_w, gpuB.tdp_w, true)}`}>{gpuA.tdp_w} W</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic' }}>TDP (WATT)</div>
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuB.tdp_w, gpuA.tdp_w, true)}`}>{gpuB.tdp_w} W</div>
            </div>

            <div className="spec-row">
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuA.release_price_usd, gpuB.release_price_usd, true)}`}>${gpuA.release_price_usd}</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic' }}>{isEn ? "MSRP PRICE" : "ZAVÁDĚCÍ CENA"}</div>
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuB.release_price_usd, gpuA.release_price_usd, true)}`}>${gpuB.release_price_usd}</div>
            </div>
        </section>

        {/* --- AI VERDIKT / ANALÝZA (Sjednoceno s články) --- */}
        <section style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '55px', borderRadius: '32px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>
                <ShieldCheck size={20} /> {isEn ? "GURU AI VERDICT" : "GURU AI VERDIKT"}
            </div>
            <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
        </section>

        {/* --- 🚀 GURU AFFILIATE BOX (Identický s články) --- */}
        <section style={{ marginTop: '70px', padding: '55px 40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.95) 0%, rgba(15, 17, 21, 1) 100%)', border: '2px solid rgba(249, 115, 22, 0.5)', borderRadius: '40px', textAlign: 'center', boxShadow: '0 20px 50px rgba(249, 115, 22, 0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
              <h3 style={{ fontSize: '36px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px', fontStyle: 'italic', tracking: 'tighter' }}>
                Nakopni svůj stroj!
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '35px', fontSize: '18px', maxWidth: '650px', margin: '0 auto 35px auto', fontStyle: 'italic', lineHeight: '1.6' }}>
                {isEn 
                  ? "Looking for a new GPU or games? We found the best deals for you. Instant key delivery and Guru-verified store." 
                  : "Hledáš novou grafiku nebo hry? Našli jsme pro tebe ty nejlepší ceny na trhu. Okamžité doručení klíče a Guru-ověřený obchod."}
              </p>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-affiliate-cta">
                <ShoppingCart size={28} /> {isEn ? "VIEW BEST DEALS" : "ZOBRAZIT NEJLEPŠÍ CENY"}
              </a>
        </section>

        {/* --- GLOBÁLNÍ CTA --- */}
        <footer style={{ marginTop: '90px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
            <h4 style={{ color: '#4b5563', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px', margin: 0, textAlign: 'center' }}>
              {isEn ? "Help us build this database by supporting us." : "Líbí se ti tyto duely? Podpoř chod našich serverů."}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" 
                 style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px 30px', background: 'rgba(255,255,255,0.03)', color: '#f97316', fontWeight: '950', fontSize: '15px', textTransform: 'uppercase', borderRadius: '18px', textDecoration: 'none', border: '1px solid rgba(249, 115, 22, 0.2)', transition: '0.3s' }}>
                <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
              </a>
              <Link href={isEn ? "/en/support" : "/support"} 
                 style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px 30px', background: '#eab308', color: '#000', fontWeight: '950', fontSize: '15px', textTransform: 'uppercase', borderRadius: '18px', textDecoration: 'none', transition: '0.3s' }}>
                <Heart size={20} fill="currentColor" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
            </div>
        </footer>

      </main>
    </div>
  );
}
