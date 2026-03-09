import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Swords, 
  Calendar,
  Trophy,
  Zap,
  Cpu,
  ShoppingCart
} from 'lucide-react';

/**
 * GURU CPU DUELS ENGINE - EN DETAIL PROXY V1.1
 * Cesta: src/app/en/cpuvs/[slug]/page.js
 * 🛡️ FIX: Přímá implementace logiky pro vyřešení chyb s importy v náhledu.
 * 🛡️ LOGIKA: Automatické generování duelu a detekce angličtiny.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Vyhledávání CPU v DB podle části slugu
const findCpu = async (slugPart) => {
  if (!supabase) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/ryzen|core|intel|amd|ultra|9000|7000|5000/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks) return null;
  const searchPattern = `%${chunks.join('%')}%`;

  const { data } = await supabase
    .from("cpus")
    .select("*")
    .ilike("name", searchPattern)
    .limit(1)
    .maybeSingle();

  return data;
};

// Automatické generování duelu v DB
async function generateAndPersistCpuDuel(slug) {
  if (!supabase) return null;

  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const cpuA = await findCpu(parts[0]);
    const cpuB = await findCpu(parts[1]);

    if (!cpuA || !cpuB) return null;

    const title_cs = `Srovnání procesorů: ${cpuA.name} vs ${cpuB.name}`;
    const title_en = `CPU Comparison: ${cpuA.name} vs ${cpuB.name}`;
    
    let seo_desc_cs = `Který procesor je lepší? Detailní srovnání parametrů a herního výkonu mezi ${cpuA.name} a ${cpuB.name}.`;
    let seo_desc_en = `Which processor is better? Detailed specs and gaming performance comparison between ${cpuA.name} and ${cpuB.name}.`;

    const { data: newDuel, error: insertError } = await supabase
      .from('cpu_duels')
      .insert([{
        slug: cleanSlug,
        slug_en: `en-${cleanSlug}`,
        cpu_a_id: cpuA.id,
        cpu_b_id: cpuB.id,
        title_cs,
        title_en,
        seo_description_cs: seo_desc_cs,
        seo_description_en: seo_desc_en,
        created_at: new Date().toISOString()
      }])
      .select(`*, cpuA:cpus!cpu_a_id(*), cpuB:cpus!cpu_b_id(*)`)
      .single();

    if (insertError && insertError.code === '23505') {
       const { data } = await supabase.from('cpu_duels').select(`*, cpuA:cpus!cpu_a_id(*), cpuB:cpus!cpu_b_id(*)`).eq('slug', cleanSlug).single();
       return data;
    }

    return newDuel;
  } catch (err) {
    return null;
  }
}

const getDuelData = async (slug) => {
  if (!supabase) return null;
  const cleanSlug = slug.replace(/^en-/, '');

  const { data, error } = await supabase
    .from('cpu_duels')
    .select(`*, cpuA:cpus!cpu_a_id(*), cpuB:cpus!cpu_b_id(*)`)
    .or(`slug.eq.${slug},slug.eq.${cleanSlug},slug_en.eq.${slug}`)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
      return await generateAndPersistCpuDuel(slug);
  }
  return data;
};

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | The Hardware Guru' };

  const isEn = true; // Jsme v /en/ cestě
  const title = duel.title_en || duel.title_cs;
  const desc = duel.seo_description_en || duel.seo_description_cs;
  
  return { 
    title: `${title} | The Hardware Guru`,
    description: desc
  };
}

export default async function CpuVsEnDetail({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  
  if (!duel) notFound();

  const isEn = true; 
  const { cpuA, cpuB } = duel;
  const backLink = '/en/cpuvs';
  
  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    if (aWins) return { color: '#66fcf1', fontWeight: '950', textShadow: '0 0 15px rgba(102,252,241,0.4)' };
    return { color: '#4b5563', opacity: 0.6 }; 
  };

  const hasPerfData = cpuA.performance_index > 0 && cpuB.performance_index > 0;
  let perfDiff = 0;
  let perfWinner = null;
  let perfColor = '#4b5563';

  if (hasPerfData) {
    if (cpuA.performance_index > cpuB.performance_index) {
      perfWinner = cpuA;
      perfDiff = Math.round(((cpuA.performance_index / cpuB.performance_index) - 1) * 100);
      perfColor = cpuA.vendor === 'Intel' ? '#0071c5' : '#ed1c24';
    } else if (cpuB.performance_index > cpuA.performance_index) {
      perfWinner = cpuB;
      perfDiff = Math.round(((cpuB.performance_index / cpuA.performance_index) - 1) * 100);
      perfColor = cpuB.vendor === 'Intel' ? '#0071c5' : '#ed1c24';
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <Link href={backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontSize: '12px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px' }}>
          <ChevronLeft size={16} /> BACK TO HUB
        </Link>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ color: '#ff0055', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px' }}><Swords size={16} style={{ display: 'inline', marginRight: '10px' }}/> GURU CPU VERSUS</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{duel.title_en || duel.title_cs}</h1>
        </header>

        {/* RING */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderTop: `5px solid ${cpuA.vendor === 'Intel' ? '#0071c5' : '#ed1c24'}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', marginBottom: '15px' }}>{cpuA.vendor} • {cpuA.architecture}</div>
                <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0 }}>{cpuA.name}</h2>
            </div>
            <div style={{ width: '60px', height: '60px', background: '#ff0055', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '20px', border: '4px solid #0a0b0d', boxShadow: '0 0 25px rgba(255,0,85,0.5)' }}>VS</div>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderTop: `5px solid ${cpuB.vendor === 'Intel' ? '#0071c5' : '#ed1c24'}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', marginBottom: '15px' }}>{cpuB.vendor} • {cpuB.architecture}</div>
                <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0 }}>{cpuB.name}</h2>
            </div>
        </div>

        {/* PERFORMANCE WINNER */}
        {hasPerfData && perfWinner && (
          <section style={{ marginBottom: '60px', background: `linear-gradient(135deg, rgba(15, 17, 21, 0.9) 0%, ${perfColor}15 100%)`, border: `1px solid ${perfColor}40`, borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: perfColor }}></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ color: perfColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}><Trophy size={18} style={{ display: 'inline', marginRight: '8px' }}/> GAMING PERFORMANCE WINNER</div>
                    <h3 style={{ color: '#fff', fontSize: '32px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{perfWinner.name}</h3>
                </div>
                <div style={{ background: perfColor, color: '#fff', padding: '15px 25px', borderRadius: '15px', fontWeight: '950', fontSize: '30px', boxShadow: `0 0 30px ${perfColor}66` }}>+{perfDiff} %</div>
              </div>
          </section>
        )}

        {/* SPECS TABLE */}
        <section style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
             {[
               { label: 'CORES / THREADS', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
               { label: 'BOOST CLOCK', valA: `${cpuA.boost_clock_ghz} GHz`, valB: `${cpuB.boost_clock_ghz} GHz`, winA: cpuA.boost_clock_ghz, winB: cpuB.boost_clock_ghz },
               { label: 'ARCHITECTURE', valA: cpuA.architecture, valB: cpuB.architecture },
               { label: 'VENDOR', valA: cpuA.vendor, valB: cpuB.vendor },
             ].map((row, i) => (
               <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
                 <div style={{ textAlign: 'right', ...getWinnerStyle(row.winA, row.winB), fontSize: '18px' }}>{row.valA}</div>
                 <div style={{ padding: '0 30px', fontSize: '10px', fontWeight: '950', color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>{row.label}</div>
                 <div style={{ textAlign: 'left', ...getWinnerStyle(row.winB, row.winA), fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
        </section>

      </main>
    </div>
  );
}
