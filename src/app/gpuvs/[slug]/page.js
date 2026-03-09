import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import OpenAI from 'openai';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Swords, 
  Calendar
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V50.0 (CLEAN PRODUCTION)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ GURU MANDÁT: 
 * 1. ZÁKAZ HACKŮ - Čisté statické ESM importy. Žádné safeLoad funkce.
 * 2. LOGIKA V44.0 - Alphanumeric matcher (řeší závorky u 8GB verzí).
 * 3. DESIGN FIX - Odstraněna "Cena" z tabulky, zachován Grid Ring, odstraněn affiliate box.
 */

// 🚀 GURU FIX: Prodloužení serverless timeoutu na Vercelu pro pomalejší AI generování (až 60 sekund)
export const maxDuration = 60;

// 🚀 GURU: Inicializace Supabase (Striktní produkční init)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { auth: { persistSession: false } }
);

// 🚀 GURU: Inicializace OpenAI
const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// 🛡️ GURU ENGINE: Robustní vyhledávání karty v DB (Bulletproof Alphanumeric Matcher)
const findGpu = async (slugPart) => {
  if (!supabase || !slugPart) return null;
  
  // 1. Odstranění vendorů z URL
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();

  // 2. Rozdělí string striktně na bloky čísel a písmen (najde i "8 GB" vs "8GB")
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks) return null;

  const searchPattern = `%${chunks.join('%')}%`;

  const { data } = await supabase
    .from("gpus")
    .select("*")
    .ilike("name", searchPattern)
    .limit(1)
    .maybeSingle();

  return data;
};

// 🚀 GURU ENGINE: Funkce pro vygenerování duelu a ZÁPIS do DB za běhu (Persistence)
async function generateAndPersistDuel(slug) {
  if (!supabase || !openai) return null;

  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const cardA = await findGpu(parts[0]);
    const cardB = await findGpu(parts[1]);

    if (!cardA || !cardB) return null;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Jsi Hardware Guru. Tvoříš brutální SEO duely grafických karet. Piš v HTML (h2, strong, ul). JSON struktura: { \"title_cs\", \"title_en\", \"content_cs\", \"content_en\", \"seo_description_cs\", \"seo_description_en\" }" 
        },
        { role: "user", content: `Vytvoř profesionální srovnání: ${cardA.name} VS ${cardB.name}. Zaměř se na výkon a technologie.` }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    const { data: newDuel, error: insertError } = await supabase
      .from('gpu_duels')
      .insert([{
        slug: cleanSlug,
        gpu_a_id: cardA.id,
        gpu_b_id: cardB.id,
        title_cs: aiResult.title_cs,
        title_en: aiResult.title_en,
        content_cs: aiResult.content_cs,
        content_en: aiResult.content_en,
        seo_description_cs: aiResult.seo_description_cs,
        seo_description_en: aiResult.seo_description_en,
        created_at: new Date().toISOString()
      }])
      .select(`*, gpuA:gpus!gpu_a_id(*), gpuB:gpus!gpu_b_id(*)`)
      .single();

    if (insertError && insertError.code === '23505') {
       const { data } = await supabase.from('gpu_duels').select(`*, gpuA:gpus!gpu_a_id(*), gpuB:gpus!gpu_b_id(*)`).eq('slug', cleanSlug).single();
       return data;
    }

    return newDuel;
  } catch (err) {
    return null;
  }
}

// 🚀 GURU: Bleskové ověření databáze s cachováním
const getDuelData = cache(async (slug) => {
  if (!supabase || !slug) return null;

  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace(/geforce-/g, '').replace(/radeon-/g, '');

  const { data, error } = await supabase
    .from('gpu_duels')
    .select(`*, gpuA:gpus!gpu_a_id(*), gpuB:gpus!gpu_b_id(*)`)
    .or(`slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug}`)
    .limit(1);

  if (error || !data || data.length === 0) {
    return await generateAndPersistDuel(slug);
  }
  
  return data[0];
});

// 🚀 GURU SEO: Dynamické Meta Tagy pro vyhledávače
export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | The Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const desc = isEn && duel.seo_description_en ? duel.seo_description_en : duel.seo_description_cs;
  
  return { 
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: { title, description: desc }
  };
}

export default async function GpuDuelDetail({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  
  if (!duel) {
    notFound();
  }

  // 🚀 GURU JAZYKOVÁ LOGIKA
  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const content = isEn && duel.content_en ? duel.content_en : duel.content_cs;
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date(duel.created_at || Date.now()));
  const backLink = isEn ? '/en/gpuvs' : '/gpuvs';
  
  // Pomocné funkce pro design tabulky a barev
  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    if (aWins) return { color: '#66fcf1', fontWeight: '950', textShadow: '0 0 15px rgba(102,252,241,0.4)' };
    return { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px' 
    }}>
      
      {/* 🚀 GURU: Hlavní skleněný kontejner (TipDetail šablona) */}
      <main style={{ 
          maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', 
          borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' 
      }}>
        
        {/* --- HRDINSKÝ VS RING --- */}
        <div style={{ width: '100%', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '100px 40px 60px', background: 'linear-gradient(to bottom, rgba(10, 11, 13, 0.5) 0%, rgba(15, 17, 21, 1) 100%)' }}>
            
            {/* Tlačítko Zpět */}
            <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 20 }}>
              <Link href={backLink} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO SELECTION' : 'ZPĚT NA VÝBĚR'}
              </Link>
            </div>

            {/* 🚀 GURU FIX: Absolutně vycentrovaný ring pomocí CSS Gridu (garantuje 50/50 rozložení) */}
            <div className="duel-ring-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', position: 'relative', zIndex: 10 }}>
                {/* KARTA A */}
                <div className="ring-card" style={{ padding: '35px 20px', background: 'rgba(0,0,0,0.6)', borderRadius: '20px', textAlign: 'center', borderTop: `4px solid ${getVendorColor(gpuA.vendor)}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuA.vendor} • {gpuA.architecture}</div>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{gpuA.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
                </div>
                
                {/* VS ZNAK (Absolutně centrovaný) */}
                <div className="vs-badge-wrapper">
                    <div className="vs-badge" style={{ width: '70px', height: '70px', minWidth: '70px', background: '#ff0055', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '24px', border: '5px solid #0f1115', boxShadow: '0 0 40px rgba(255,0,85,0.6)', color: '#fff', transform: 'rotate(-8deg)' }}>VS</div>
                </div>

                {/* KARTA B */}
                <div className="ring-card" style={{ padding: '35px 20px', background: 'rgba(0,0,0,0.6)', borderRadius: '20px', textAlign: 'center', borderTop: `4px solid ${getVendorColor(gpuB.vendor)}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuB.vendor} • {gpuB.architecture}</div>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{gpuB.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
                </div>
            </div>
        </div>

        <div className="content-padding-wrapper" style={{ padding: '40px 50px 60px 50px' }}>
          
          {/* --- HLAVIČKA DUELU --- */}
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}><Swords size={16} /> ELITNÍ SOUBOJ</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formattedDate}</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0', textShadow: '0 0 20px rgba(255, 0, 85, 0.2)' }}>
              {title}
            </h1>
          </header>

          {/* --- TABULKA SPECIFIKACÍ (BEZ CENY) --- */}
          <div className="specs-container" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '50px', overflow: 'hidden' }}>
             <div style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', textAlign: 'center', color: '#9ca3af', fontSize: '11px', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {isEn ? 'GURU TECHNICAL METRICS' : 'GURU TECHNICKÉ METRIKY'}
             </div>
             
             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
               <div style={{ ...getWinnerStyle(gpuA.vram_gb, gpuB.vram_gb), fontSize: '24px', textAlign: 'right' }}>{gpuA.vram_gb} GB</div>
               <div style={{ padding: '0 30px', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic', textAlign: 'center' }}>VRAM</div>
               <div style={{ ...getWinnerStyle(gpuB.vram_gb, gpuA.vram_gb), fontSize: '24px', textAlign: 'left' }}>{gpuB.vram_gb} GB</div>
             </div>

             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
               <div style={{ color: '#e5e7eb', fontSize: '20px', fontWeight: 'bold', textAlign: 'right' }}>{gpuA.memory_bus}</div>
               <div style={{ padding: '0 30px', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic', textAlign: 'center' }}>{isEn ? 'BUS' : 'SBĚRNICE'}</div>
               <div style={{ color: '#e5e7eb', fontSize: '20px', fontWeight: 'bold', textAlign: 'left' }}>{gpuB.memory_bus}</div>
             </div>

             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
               <div style={{ ...getWinnerStyle(gpuA.boost_clock_mhz, gpuB.boost_clock_mhz), fontSize: '24px', textAlign: 'right' }}>{gpuA.boost_clock_mhz} MHz</div>
               <div style={{ padding: '0 30px', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic', textAlign: 'center' }}>BOOST CLOCK</div>
               <div style={{ ...getWinnerStyle(gpuB.boost_clock_mhz, gpuA.boost_clock_mhz), fontSize: '24px', textAlign: 'left' }}>{gpuB.boost_clock_mhz} MHz</div>
             </div>

             {/* TDP je nyní poslední řádek = bez borderBottom */}
             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '20px 30px', alignItems: 'center' }}>
               <div style={{ ...getWinnerStyle(gpuA.tdp_w, gpuB.tdp_w, true), fontSize: '24px', textAlign: 'right' }}>{gpuA.tdp_w} W</div>
               <div style={{ padding: '0 30px', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', fontStyle: 'italic', textAlign: 'center' }}>TDP</div>
               <div style={{ ...getWinnerStyle(gpuB.tdp_w, gpuA.tdp_w, true), fontSize: '24px', textAlign: 'left' }}>{gpuB.tdp_w} W</div>
             </div>
          </div>

          {/* --- OBSAH DUELU --- */}
          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* --- 🚀 GURU GLOBÁLNÍ CTA (Podpora webu a Slevy - Stejné jako v Tipech) --- */}
          <div style={{ 
            marginTop: '50px', 
            paddingTop: '50px', 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '25px' 
          }}>
            <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
              {isEn ? "Did this duel help you? Support us either by buying games at the best prices or directly." : "Líbil se ti tento duel? Podpoř nás buď nákupem her za ty nejlepší ceny, nebo přímo."}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
                <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
              </a>
              <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
                <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* --- GURU TYPOGRAPHY & BUTTON CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Tlačítko zpět */
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; backdrop-filter: blur(5px); border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.2); }

        /* Globální podpora & slevy tlačítka */
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        /* Formátování obsahu z CKEditoru */
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #66fcf1; font-size: 2.2rem; font-weight: 950; margin-top: 2.5em; margin-bottom: 1em; text-transform: uppercase; letter-spacing: 1px; }
        .guru-prose h3 { color: #fff; font-size: 1.6rem; font-weight: 900; margin-top: 2em; margin-bottom: 1em; }
        .guru-prose p { margin-bottom: 1.5em; }
        .guru-prose a { color: #f97316; text-decoration: none; font-weight: bold; border-bottom: 2px dashed rgba(249, 115, 22, 0.5); transition: 0.3s; padding-bottom: 2px; }
        .guru-prose a:hover { color: #ea580c; border-bottom-style: solid; border-bottom-color: #ea580c; }
        .guru-prose ul, .guru-prose ol { padding-left: 1.5em; margin-bottom: 1.5em; }
        .guru-prose li { margin-bottom: 0.8em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        
        .spec-row:hover { background: rgba(255,255,255,0.02); }

        /* 🚀 GURU FIX: Absolutní centrování pro Desktop, relativní pro Mobil */
        .vs-badge-wrapper {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 20;
        }

        /* Responzivita */
        @media (max-width: 768px) {
          .guru-prose { font-size: 1.05rem; }
          .guru-prose h2 { font-size: 1.8rem; }
          .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }
          
          /* Změna layoutu Ringu na mobilu */
          .duel-ring-container { display: flex !important; flex-direction: column !important; gap: 0 !important; }
          .ring-card { width: 100% !important; }
          .vs-badge-wrapper { position: relative !important; top: auto !important; left: auto !important; transform: none !important; margin: -25px auto !important; display: flex; justify-content: center; }
          .vs-badge { margin: 0 auto !important; }

          .content-padding-wrapper { padding: 30px 20px 40px 20px !important; }
          .spec-row { padding: 15px !important; }
        }
      `}} />
    </div>
  );
}
