import React from 'react';
import { ChevronLeft, Swords, Cpu, Flame, Heart, ShoppingCart, Calendar } from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V1.5 (SUPREME SEO & BUILD FIX)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * Funkce: Sjednocená architektura s články, Master Proxy pattern (CZ/EN), Versus design.
 * Oprava: Robustní načítání modulů pro bezchybný build.
 */

// 🚀 GURU BUILD SHIELD: Bezpečné načtení externích knihoven
const getModule = (path) => {
  try {
    return require(path);
  } catch (e) {
    return null;
  }
};

const supabaseLib = getModule('@supabase/supabase-js');
const nextNav = getModule('next/navigation');
const nextLinkModule = getModule('next/link');

const createClient = supabaseLib ? supabaseLib.createClient : null;
const notFound = nextNav ? nextNav.notFound : () => {};
const Link = nextLinkModule ? (nextLinkModule.default || nextLinkModule) : 'a';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inicializace klienta (pokud jsme v prostředí, kde je dostupný)
const supabase = (createClient && supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// 🚀 GURU SEO: Dynamické Meta Tagy (Zrcadlí logiku článků)
export async function generateMetadata({ params }) {
  const { slug } = params;
  if (!supabase) return { title: 'The Hardware Guru' };
  
  const { data: duel } = await supabase
    .from('gpu_duels')
    .select('title_cs, title_en, seo_description_cs, seo_description_en, slug, slug_en')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (!duel) return { title: '404 | The Hardware Guru' };

  const isEn = duel.slug_en === slug;
  const title = isEn && duel.title_en ? duel.title_en : (duel.title_cs || 'GPU Duel');
  const desc = isEn && duel.seo_description_en ? duel.seo_description_en : (duel.seo_description_cs || '');

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: {
      title,
      description: desc,
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

export default async function GpuDuelDetail({ params }) {
  const { slug } = params;
  
  if (!supabase) {
    return <div className="p-20 text-center text-white">Chybí konfigurace Supabase.</div>;
  }

  // 1. GURU FETCH
  const { data: duel, error: duelError } = await supabase
    .from('gpu_duels')
    .select('*')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();
  
  if (duelError || !duel) return notFound();

  // 2. DETEKCE JAZYKA
  const isEn = duel.slug_en === slug;

  // Načtení dat o kartách
  const { data: gpuA } = await supabase.from('gpus').select('*').eq('id', duel.gpu_a_id).single();
  const { data: gpuB } = await supabase.from('gpus').select('*').eq('id', duel.gpu_b_id).single();

  if (!gpuA || !gpuB) return notFound();

  // Lokalizované texty
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const content = isEn && duel.content_en ? duel.content_en : duel.content_cs;
  const date = new Date(duel.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const backLink = isEn ? '/en' : '/';
  
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
        .spec-row { display: flex; justify-content: space-between; padding: 18px 25px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; }
        .gpu-header-card { padding: 40px 30px; border-radius: 24px; text-align: center; border-top: 5px solid; background: rgba(15, 17, 21, 0.9); backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 4px solid #0a0b0d; box-shadow: 0 0 40px rgba(255,0,85,0.6); z-index: 10; }
        .text-green-400 { color: #4ade80; } .text-red-500 { color: #ef4444; } .font-black { font-weight: 900; }
        
        .guru-affiliate-cta { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 22px 45px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 18px; text-transform: uppercase; border-radius: 18px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 35px rgba(234, 88, 12, 0.4); border: 1px solid rgba(255,255,255,0.1); }
        .guru-affiliate-cta:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 50px rgba(234, 88, 12, 0.6); }
      `}} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '40px' }}>
          <Link href={backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronLeft size={16} /> {isEn ? 'BACK TO HOME' : 'ZPĚT NA HLAVNÍ STRANU'}
          </Link>
        </div>

        {/* HLAVIČKA DUELU - SHODNÁ S ČLÁNKY */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}>
                 <Swords size={16} /> GURU VERSUS
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {date}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: '1.1', margin: 0, textShadow: '0 0 30px rgba(255,0,85,0.2)' }}>
            {title}
          </h1>
        </header>

        {/* VS RING */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '50px' }}>
            <div className="gpu-header-card" style={{ borderColor: getVendorColor(gpuA.vendor) }}>
                <span style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '1px' }}>{gpuA.vendor} • {gpuA.architecture}</span>
                <h2 style={{ fontSize: '28px', fontWeight: '950', margin: '10px 0 0 0' }}>{gpuA.name}</h2>
            </div>
            <div className="vs-badge">VS</div>
            <div className="gpu-header-card" style={{ borderColor: getVendorColor(gpuB.vendor) }}>
                <span style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '1px' }}>{gpuB.vendor} • {gpuB.architecture}</span>
                <h2 style={{ fontSize: '28px', fontWeight: '950', margin: '10px 0 0 0' }}>{gpuB.name}</h2>
            </div>
        </div>

        {/* TABULKA */}
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
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuA.release_price_usd, gpuB.release_price_usd, true)}`}>${gpuA.release_price_usd}</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">{isEn ? 'MSRP PRICE' : 'ZAVÁDĚCÍ CENA'}</div>
                <div className={`flex-1 text-center text-lg ${getWinnerClass(gpuB.release_price_usd, gpuA.release_price_usd, true)}`}>${gpuB.release_price_usd}</div>
            </div>
        </div>

        {/* ROZBOR */}
        <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '30px' }}>
                <Cpu size={18} /> GURU AI VERDICT
            </div>
            <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* AFFILIATE BOX - IDENTICKÝ S ČLÁNKY */}
        <div style={{ marginTop: '70px', padding: '50px 40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.9) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '2px solid rgba(249, 115, 22, 0.5)', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 50px rgba(249, 115, 22, 0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
              <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
                {isEn ? "Upgrade your machine!" : "Nakopni svůj stroj!"}
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '35px', fontSize: '17px', maxWidth: '600px', margin: '0 auto 35px auto' }}>
                {isEn 
                  ? "Looking for a new GPU or games? We found the best deals for you. Instant key delivery and Guru-verified store." 
                  : "Hledáš novou grafiku nebo hry? Našli jsme pro tebe ty nejlepší ceny na trhu. Okamžité doručení klíče a Guru-ověřený obchod."}
              </p>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-affiliate-cta">
                <ShoppingCart size={26} /> {isEn ? "VIEW BEST DEALS" : "ZOBRAZIT NEJLEPŠÍ CENY"}
              </a>
        </div>

        {/* GLOBÁLNÍ CTA */}
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
