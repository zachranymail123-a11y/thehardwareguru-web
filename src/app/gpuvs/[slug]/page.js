import React, { cache } from 'react';
import { 
  ChevronLeft, 
  Swords, 
  ShieldCheck, 
  Zap, 
  ShoppingCart,
  Cpu,
  Flame,
  Activity
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V25.1 (PREVIEW COMPATIBILITY)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * Design: Supreme GURU Style (Neon, Glass, Silver Typography).
 * Logic: On-demand AI generation + Database persistence (Programmatic SEO).
 * FIX: Implementace "Compatibility Shield" pro vyřešení chyb kompilace v náhledu.
 * PERSISTENCE: Automatické generování a ZÁPIS do DB zůstává plně aktivní.
 */

// --- 🛡️ GURU COMPATIBILITY SHIELD: Bezpečné načtení pro funkčnost náhledu ---
const getModule = (name) => {
  try {
    return require(name);
  } catch (e) {
    return null;
  }
};

const supabaseLib = getModule('@supabase/supabase-js');
const nextNav = getModule('next/navigation');
const nextLinkMod = getModule('next/link');
const openAILib = getModule('openai');

const createClient = supabaseLib ? supabaseLib.createClient : null;
const notFound = nextNav ? nextNav.notFound : () => {};
const Link = nextLinkMod ? (nextLinkMod.default || nextLinkMod) : ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>;
const OpenAI = openAILib ? (openAILib.default || openAILib) : null;

// 🚀 GURU: Inicializace OpenAI
const openai = (OpenAI && (process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY))
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY })
  : null;

// 🚀 GURU: Inicializace Supabase klienta pro Server Components
const supabase = (createClient && process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    )
  : null;

// 🚀 GURU ENGINE: Funkce pro vygenerování duelu a ZÁPIS do DB za běhu
async function generateAndPersistDuel(slug) {
  if (!supabase || !openai) {
    console.error("GURU: Supabase nebo OpenAI není inicializováno.");
    return null;
  }
  
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    // 1. Vyhledání karet v DB (Fuzzy search)
    const nameA = parts[0].replace(/-/g, ' ');
    const nameB = parts[1].replace(/-/g, ' ');

    const [resA, resB] = await Promise.all([
      supabase.from('gpus').select('*').ilike('name', `%${nameA}%`).limit(1).maybeSingle(),
      supabase.from('gpus').select('*').ilike('name', `%${nameB}%`).limit(1).maybeSingle()
    ]);

    const cardA = resA.data;
    const cardB = resB.data;
    if (!cardA || !cardB) return null;

    // 2. AI Generování verdiktu (GURU Styl)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Jsi Hardware Guru. Tvoříš SEO duely grafických karet. Tvůj styl je brutální, technický a virální. Piš v HTML (h2, strong, ul). Všechna pole '_cs' v češtině, '_en' v angličtině. JSON struktura: { \"title_cs\", \"title_en\", \"content_cs\", \"content_en\", \"seo_description_cs\", \"seo_description_en\" }" 
        },
        { 
          role: "user", 
          content: `Porovnej tyto karty pro souboj na webu: ${cardA.name} VS ${cardB.name}.` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    // 3. ZÁPIS DO DATABÁZE (Aby příště nebyla 404)
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
       if (insertError.code === '23505') {
         const { data } = await supabase.from('gpu_duels').select(`*, gpuA:gpus!gpu_a_id(*), gpuB:gpus!gpu_b_id(*)`).eq('slug', cleanSlug).single();
         return data;
       }
       throw insertError;
    }

    return newDuel;
  } catch (err) {
    console.error("GURU PERSISTENCE ERROR:", err);
    return null;
  }
}

// 🚀 GURU: Cache dotazu pro deduplikaci
const getDuelData = cache(async (slug) => {
  if (!supabase || !slug) return null;

  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug
    .replace('geforce-', '')
    .replace('radeon-', '');

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
    // ⚡ GURU TRIGGER: Pokud duel v DB není, vygenerujeme ho a ZAPÍŠEME
    return await generateAndPersistDuel(slug);
  }
  
  return data[0];
});

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: 'Duel nenalezen | Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  const title = isEn ? (duel.title_en || duel.title_cs) : duel.title_cs;
  const description = isEn ? (duel.seo_description_en || duel.seo_description_cs) : duel.seo_description_cs;

  return { title: `${title} | Hardware Guru`, description };
}

export default async function App({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);

  if (!duel) {
    if (typeof notFound === 'function') notFound();
    return <div className="p-20 text-center text-white font-black uppercase text-2xl">404 - Duel nebyl nalezen ani vygenerován.</div>;
  }

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;

  if (!gpuA || !gpuB) {
    return <div className="p-20 text-center text-white font-black uppercase text-2xl tracking-tighter">DATA ERROR: Karta nebyla nalezena v DB.</div>;
  }

  const title = isEn ? (duel.title_en || duel.title_cs) : duel.title_cs;
  const content = isEn ? (duel.content_en || duel.content_cs) : (duel.content_cs || duel.content);
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date(duel.created_at || Date.now()));
  
  const getWinnerClass = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return 'text-neutral-500';
    if (lowerIsBetter) return valA < valB ? 'text-[#66fcf1] font-black drop-shadow-[0_0_12px_#66fcf1]' : 'text-neutral-500 opacity-30';
    return valA > valB ? 'text-[#66fcf1] font-black drop-shadow-[0_0_12px_#66fcf1]' : 'text-neutral-500 opacity-30';
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#ff0055');
  };

  return (
    <main className="min-h-screen text-[#d1d5db] py-12 px-4 sm:px-6 lg:px-8" style={{ 
        backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; max-width: 750px; margin: 0 auto; }
        .guru-prose h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-top: 2.5em; margin-bottom: 1.2em; text-transform: uppercase; border-left: 6px solid #ff0055; padding-left: 20px; font-style: italic; letter-spacing: -1px; }
        .guru-prose strong { color: #fff; font-weight: 950; }
        .guru-prose ul { list-style: none; padding: 0; margin-bottom: 2.5em; }
        .guru-prose li { padding: 15px 30px; position: relative; margin-bottom: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; border-left: 3px solid rgba(255,0,85,0.3); }
        .guru-prose li::before { content: '⚡'; position: absolute; left: 10px; color: #ff0055; }
        
        .glass-panel { background: rgba(17, 19, 24, 0.92); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 40px; overflow: hidden; box-shadow: 0 40px 120px rgba(0,0,0,0.9); }
        .spec-grid-row { display: grid; grid-template-columns: 1fr auto 1fr; padding: 25px 40px; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center; transition: 0.4s; }
        .spec-grid-row:hover { background: rgba(255,255,255,0.025); }
        .vs-token { width: 90px; height: 90px; background: #ff0055; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 28px; border: 10px solid #0a0b0d; box-shadow: 0 0 50px rgba(255,0,85,0.6); z-index: 30; margin: 0 -45px; transform: rotate(-8deg); color: #fff; }
        
        .buy-action-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; padding: 26px 65px; border-radius: 24px; text-transform: uppercase; font-size: 22px; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: inline-flex; align-items: center; gap: 15px; box-shadow: 0 20px 50px rgba(234, 88, 12, 0.5); border: 1px solid rgba(255,255,255,0.1); }
        .buy-action-btn:hover { transform: translateY(-10px) scale(1.05); box-shadow: 0 30px 70px rgba(234, 88, 12, 0.7); filter: brightness(1.15); }
      `}} />

      <article className="max-w-3xl mx-auto">
        <Link href={isEn ? '/en/gpuvs' : '/gpuvs'} className="text-[#ff0055] hover:text-[#ff0055]/80 transition-all font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 mb-12">
          <ChevronLeft size={14} /> {isEn ? "BACK TO SELECTION" : "ZPĚT NA VÝBĚR"}
        </Link>

        <header className="mb-20 text-center">
          <div className="flex items-center justify-center gap-5 text-neutral-500 text-[10px] font-black uppercase tracking-[0.5em] mb-8">
            <span className="text-[#ff0055] flex items-center gap-2"><Flame size={14}/> {isEn ? "ELITE DUEL" : "ELITNÍ SOUBOJ"}</span>
            <span className="opacity-20">|</span>
            <span className="flex items-center gap-2"><Activity size={14}/> {formattedDate}</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {title.split(' vs ')[0]} <br/> 
            <span className="text-[#ff0055] drop-shadow-[0_0_15px_#ff0055]">VS</span> <br/> 
            {title.split(' vs ')[1]}
          </h1>
        </header>

        {/* 🥊 RING SYSTÉM */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-16 relative gap-4 md:gap-0">
            <div className="glass-panel w-full p-12 text-center border-t-8" style={{ borderColor: getVendorColor(gpuA.vendor) }}>
                <div style={{ fontSize: '12px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>{gpuA.vendor} • {gpuA.architecture}</div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">{gpuA.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
            <div className="vs-token">VS</div>
            <div className="glass-panel w-full p-12 text-center border-t-8" style={{ borderColor: getVendorColor(gpuB.vendor) }}>
                <div style={{ fontSize: '12px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>{gpuB.vendor} • {gpuB.architecture}</div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">{gpuB.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
        </div>

        {/* 📊 GURU DASHBOARD */}
        <section className="glass-panel mb-24">
            <div className="bg-white/5 py-5 text-center border-b border-white/5">
                <h3 className="font-black text-[10px] uppercase tracking-[0.6em] text-neutral-500">{isEn ? "GURU TECHNICAL METRICS" : "GURU TECHNICKÉ METRIKY"}</h3>
            </div>
            
            <div className="spec-grid-row">
                <div className={`text-right text-3xl ${getWinnerClass(gpuA.vram_gb, gpuB.vram_gb)}`}>{gpuA.vram_gb} GB</div>
                <div className="px-10 text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] italic">VRAM</div>
                <div className={`text-left text-3xl ${getWinnerClass(gpuB.vram_gb, gpuA.vram_gb)}`}>{gpuB.vram_gb} GB</div>
            </div>

            <div className="spec-grid-row">
                <div className="text-right text-xl font-black text-[#fff]">{gpuA.memory_bus}</div>
                <div className="px-10 text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] italic">{isEn ? "BUS WIDTH" : "SBĚRNICE"}</div>
                <div className="text-left text-xl font-black text-[#fff]">{gpuB.memory_bus}</div>
            </div>

            <div className="spec-grid-row border-none">
                <div className={`text-right text-3xl ${getWinnerClass(gpuA.release_price_usd, gpuB.release_price_usd, true)}`}>${gpuA.release_price_usd}</div>
                <div className="px-10 text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] italic">{isEn ? "LAUNCH PRICE" : "ZAVÁDĚCÍ CENA"}</div>
                <div className={`text-left text-3xl ${getWinnerClass(gpuB.release_price_usd, gpuA.release_price_usd, true)}`}>${gpuB.release_price_usd}</div>
            </div>
        </section>

        {/* 🧠 GURU VERDIKT */}
        <section className="mb-32 relative">
            <div className="flex items-center gap-4 text-[#ff0055] font-black uppercase tracking-[0.4em] text-[10px] mb-16 bg-[#ff0055]/5 py-4 px-10 rounded-2xl border border-[#ff0055]/20 w-fit mx-auto shadow-[0_0_30px_rgba(255,0,85,0.1)]">
                <ShieldCheck size={20} /> {isEn ? "GURU MASTER VERDICT" : "GURU MASTER VERDIKT"}
            </div>
            <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
        </section>

        {/* 💰 GURU CTA */}
        <section className="mt-40 p-20 bg-[#0c0d10] border-2 border-orange-500/20 rounded-[60px] text-center shadow-[0_50px_150px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
            <div className="absolute -right-32 -bottom-32 opacity-[0.03] rotate-[-15deg] pointer-events-none"><Cpu size={500} color="#f97316"/></div>
            
            <h3 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter italic leading-none">
              {isEn ? "GEAR UP, GURU!" : "NAKOPNI TO, GURU!"}
            </h3>
            <p className="text-neutral-400 mb-14 max-w-xl mx-auto font-black text-xl italic leading-relaxed uppercase tracking-tight">
              {isEn ? "Don't let your gaming rig starve. Get the maximum power for every dollar." : "Nenech svou herní mašinu hladovět. Vytřískaj z každý koruny maximum FPS."}
            </p>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="buy-action-btn">
              <ShoppingCart size={36} /> {isEn ? "VIEW BEST DEALS" : "ZOBRAZIT NEJLEPŠÍ CENY"}
            </a>
        </section>
      </article>
    </main>
  );
}
