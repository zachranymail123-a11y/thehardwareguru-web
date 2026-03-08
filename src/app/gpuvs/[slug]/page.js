import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import OpenAI from 'openai';
import { 
  ChevronLeft, 
  Swords, 
  ShieldCheck, 
  Zap, 
  ShoppingCart,
  Cpu
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V21.1 (STRICT PRODUCTION)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * Design: Brutální GURU styl (obří růžové nadpisy, skleněný panel, neonové prvky).
 * FEATURE: Automatické generování chybějících duelů přes AI (Programmatic SEO).
 * FIX: Čisté ESM importy pro produkční prostředí Next.js 14.
 * FIX: Oprava logic-flow pro zápis a okamžité zobrazení nového duelu.
 */

// 🚀 GURU: Inicializace OpenAI (Ujisti se, že máš nastavený klíč v .env)
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
});

// 🚀 GURU: Inicializace Supabase klienta pro Server Components
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { auth: { persistSession: false } }
);

// 🚀 GURU ENGINE: Funkce pro vygenerování duelu za běhu, pokud v DB chybí
async function generateDuelOnTheFly(slug) {
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    // 1. Vyhledání karet v DB (Fuzzy search pro identifikaci GPU)
    const nameA = parts[0].replace(/-/g, ' ');
    const nameB = parts[1].replace(/-/g, ' ');

    const [resA, resB] = await Promise.all([
      supabase.from('gpus').select('*').ilike('name', `%${nameA}%`).limit(1).maybeSingle(),
      supabase.from('gpus').select('*').ilike('name', `%${nameB}%`).limit(1).maybeSingle()
    ]);

    const cardA = resA.data;
    const cardB = resB.data;

    // Pokud karty v DB vůbec nejsou, nemůžeme duel vygenerovat
    if (!cardA || !cardB) return null;

    // 2. AI Generování verdiktu (Striktně technický a úderný GURU styl)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Jsi Hardware Guru. Tvoříš SEO duely grafických karet. Tvůj styl je brutální, upřímný a technicky precizní. Používej HTML tagy <h2>, <strong>, <ul> pro formátování obsahu. Všechna pole '_cs' musí být v češtině, pole '_en' v angličtině. JSON struktura: { \"title_cs\": \"...\", \"title_en\": \"...\", \"content_cs\": \"...\", \"content_en\": \"...\", \"seo_description_cs\": \"...\", \"seo_description_en\": \"...\" }" 
        },
        { 
          role: "user", 
          content: `Vytvoř profesionální srovnání: ${cardA.name} ($${cardA.release_price_usd}, ${cardA.vram_gb}GB VRAM) VS ${cardB.name} ($${cardB.release_price_usd}, ${cardB.vram_gb}GB VRAM). Zaměř se na výkon, cenu a efektivitu.` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    // 3. Zápis nového duelu do databáze
    const { data: newDuel, error: insertError } = await supabase
      .from('gpu_duels')
      .insert([{
        slug: cleanSlug,
        slug_en: `en-${cleanSlug}`,
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

    if (insertError) {
      // Ošetření race-condition (pokud někdo vygeneroval duel ve stejnou milisekundu)
      if (insertError.code === '23505') {
        const { data } = await supabase
          .from('gpu_duels')
          .select(`*, gpuA:gpus!gpu_a_id(*), gpuB:gpus!gpu_b_id(*)`)
          .eq('slug', cleanSlug)
          .single();
        return data;
      }
      throw insertError;
    }

    return newDuel;
  } catch (err) {
    console.error("GURU CRITICAL ENGINE ERROR:", err);
    return null;
  }
}

// 🚀 GURU: Cache dotazu pro maximální výkon Next.js
const getDuelData = cache(async (slug) => {
  if (!slug) return null;

  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace('geforce-', '').replace('radeon-', '');

  const { data, error } = await supabase
    .from('gpu_duels')
    .select(`
      *,
      gpuA:gpus!gpu_a_id(*),
      gpuB:gpus!gpu_b_id(*)
    `)
    .or(`slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug},slug_en.eq.${slug}`)
    .limit(1);

  if (error || !data || data.length === 0) {
    // ⚡ GURU TRIGGER: Pokud duel neexistuje, vygenerujeme ho on-the-fly
    return await generateDuelOnTheFly(slug);
  }
  
  return data[0];
});

// 🚀 GURU SEO: Dynamické Meta Tagy pro vyhledávače
export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: 'Duel nenalezen | Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  const title = isEn ? (duel.title_en || duel.title_cs) : duel.title_cs;
  const description = isEn ? (duel.seo_description_en || duel.seo_description_cs) : duel.seo_description_cs;

  return { 
    title: `${title} | Hardware Guru`, 
    description: description 
  };
}

export default async function App({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);

  if (!duel) notFound();

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;

  if (!gpuA || !gpuB) notFound();

  const title = isEn ? (duel.title_en || duel.title_cs) : duel.title_cs;
  const content = isEn ? (duel.content_en || duel.content_cs) : (duel.content_cs || duel.content);
  const dateObj = new Date(duel.created_at || Date.now());
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(dateObj);
  
  const backLink = isEn ? '/en/gpuvs' : '/gpuvs';
  const buyBtnText = isEn ? "VIEW BEST DEALS" : "ZOBRAZIT NEJLEPŠÍ CENY";
  
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
    <main className="min-h-screen text-neutral-200 py-12 px-4 sm:px-6 lg:px-8" style={{ 
        backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-top: 2em; margin-bottom: 1em; text-transform: uppercase; border-left: 5px solid #ff0055; padding-left: 20px; font-style: italic; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose ul { list-style-type: none; padding-left: 0; }
        .guru-prose li { position: relative; padding-left: 25px; margin-bottom: 10px; }
        .guru-prose li::before { content: '→'; position: absolute; left: 0; color: #ff0055; font-weight: 900; }
        .spec-row { display: flex; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; transition: 0.3s; }
        .spec-row:hover { background: rgba(255,255,255,0.03); }
        .gpu-card-box { padding: 45px 30px; border-radius: 32px; text-align: center; border-top: 6px solid; background: rgba(17, 19, 24, 0.95); backdrop-filter: blur(15px); box-shadow: 0 20px 50px rgba(0,0,0,0.6); width: 100%; }
        .vs-badge-supreme { background: #ff0055; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 28px; border: 6px solid #0a0b0d; box-shadow: 0 0 40px rgba(255,0,85,0.6); z-index: 10; margin: 0 -40px; }
        .guru-affiliate-cta { display: inline-flex; align-items: center; justify-content: center; gap: 15px; padding: 22px 50px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 20px; text-transform: uppercase; border-radius: 20px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 35px rgba(234, 88, 12, 0.4); border: 1px solid rgba(255,255,255,0.1); }
        .guru-affiliate-cta:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 20px 50px rgba(234, 88, 12, 0.6); }
        .text-green-400 { color: #4ade80; } .text-red-500 { color: #ef4444; } .font-black { font-weight: 900; }
        @media (max-width: 768px) { .ring-grid-system { flex-direction: column; } .vs-badge-supreme { margin: 20px auto; } }
      `}} />

      <article className="max-w-5xl mx-auto">
        <div className="mb-10">
          <Link href={backLink} className="text-[#ff0055] hover:text-[#ff0055]/80 transition-colors font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <ChevronLeft size={18} /> {isEn ? "Back to selection" : "Zpět na výběr"}
          </Link>
        </div>

        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 text-neutral-400 text-sm font-black uppercase tracking-[0.3em] mb-6">
            <span className="text-[#ff0055] flex items-center gap-2"><Swords size={18}/> {isEn ? "GURU VERSUS" : "GURU SOUBOJ"}</span>
            <span className="opacity-30">•</span>
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase italic underline decoration-[#ff0055]/30 leading-tight tracking-tight">
            {title}
          </h1>
        </header>

        {/* 🥊 RING SYSTÉM (DUEL KARET) */}
        <div className="ring-grid-system flex flex-col md:flex-row items-center mb-16 relative">
            <div className="gpu-card-box" style={{ borderColor: getVendorColor(gpuA.vendor) }}>
                <span style={{ fontSize: '12px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '2px' }}>{gpuA.vendor} • {gpuA.architecture}</span>
                <h2 className="text-3xl font-black text-white mt-2 uppercase">{gpuA.name}</h2>
            </div>
            <div className="vs-badge-supreme">VS</div>
            <div className="gpu-card-box" style={{ borderColor: getVendorColor(gpuB.vendor) }}>
                <span style={{ fontSize: '12px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '2px' }}>{gpuB.vendor} • {gpuB.architecture}</span>
                <h2 className="text-3xl font-black text-white mt-2 uppercase">{gpuB.name}</h2>
            </div>
        </div>

        {/* 📊 TECHNICKÉ PARAMETRY */}
        <section className="bg-neutral-900/80 border-2 border-white/5 rounded-[40px] overflow-hidden shadow-2xl mb-16 backdrop-blur-md">
            <div className="bg-white/5 py-5 text-center border-b border-white/5">
                <h3 className="font-black text-sm uppercase tracking-[0.4em] text-white tracking-widest">{isEn ? "RAW SPECIFICATIONS" : "TECHNICKÉ PARAMETRY"}</h3>
            </div>
            <div className="spec-row">
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuA.vram_gb, gpuB.vram_gb)}`}>{gpuA.vram_gb} GB</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">VRAM</div>
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuB.vram_gb, gpuA.vram_gb)}`}>{gpuB.vram_gb} GB</div>
            </div>
            <div className="spec-row">
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuA.release_price_usd, gpuB.release_price_usd, true)}`}>${gpuA.release_price_usd}</div>
                <div className="flex-1 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">{isEn ? "MSRP PRICE" : "ZAVÁDĚCÍ CENA"}</div>
                <div className={`flex-1 text-center text-xl ${getWinnerClass(gpuB.release_price_usd, gpuA.release_price_usd, true)}`}>${gpuB.release_price_usd}</div>
            </div>
        </section>

        {/* 🧠 VERDIKT HARDWARE GURU */}
        <section className="mb-16">
            <div className="flex items-center gap-3 text-[#a855f7] font-black uppercase tracking-widest text-xs mb-8">
                <ShieldCheck size={20} /> {isEn ? "GURU AI VERDICT" : "GURU AI VERDIKT"}
            </div>
            <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
        </section>

        {/* 💰 AFILIÁTNÍ CTA */}
        <section className="mt-20 p-12 bg-neutral-900 border-2 border-orange-500/50 rounded-[50px] text-center shadow-[0_25px_60px_rgba(249,115,22,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-70" />
            <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter italic tracking-tight">{isEn ? "Upgrade your machine!" : "Nakopni svůj stroj!"}</h3>
            <p className="text-neutral-400 mb-10 max-w-2xl mx-auto font-medium text-lg italic leading-relaxed">
              {isEn ? "Looking for a new GPU? We found the best deals for you." : "Hledáš novou grafiku? Našli jsme pro tebe ty nejlepší ceny na trhu."}
            </p>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-affiliate-cta">
              <ShoppingCart size={28} /> {buyBtnText}
            </a>
        </section>
      </article>
    </main>
  );
}
