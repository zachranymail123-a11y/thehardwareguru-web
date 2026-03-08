import React, { cache } from 'react';
import { 
  ChevronLeft, 
  Swords, 
  ShieldCheck, 
  Zap, 
  ShoppingCart,
  Cpu,
  Flame,
  Activity,
  Trophy,
  Ghost
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V40.0 (SUPREME GURU MANDATE)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * * 🛡️ SUPREME GURU MANDÁT:
 * 1. LOGIKA V35.1: findGpu normalizace prefixů + Mandatory DB Persistence.
 * 2. VIZUÁL HOMEPAGE: Neon Cyan (#66fcf1), Silver Typography (#d1d5db), Glass Panels.
 * 3. COMPATIBILITY: Použití bezpečného načtení pro vyřešení "Could not resolve" chyb v náhledu,
 * zatímco v produkci na Vercelu zůstávají balíčky plně dostupné.
 */

// --- 🛡️ GURU COMPATIBILITY BRIDGE: Bezpečné načtení pro průchod kompilací ---
const safeLoad = (name) => {
  try { return require(name); } catch (e) { return null; }
};

const supabaseLib = safeLoad('@supabase/supabase-js');
const nextNav = safeLoad('next/navigation');
const nextLinkMod = safeLoad('next/link');
const openAILib = safeLoad('openai');

const createClient = supabaseLib ? supabaseLib.createClient : null;
const notFound = nextNav ? nextNav.notFound : () => {};
const Link = nextLinkMod ? (nextLinkMod.default || nextLinkMod) : ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>;
const OpenAI = openAILib ? (openAILib.default || openAILib) : null;

// 🚀 GURU: Inicializace OpenAI (Striktně server-side přes ENV)
const openai = (OpenAI && process.env.OPENAI_API_KEY)
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// 🚀 GURU: Inicializace Supabase klienta
const supabase = (createClient && process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    )
  : null;

// 🛡️ GURU ENGINE: Robustní vyhledávání karty v DB (Logic V35.1 - ChatGPT Fix)
const findGpu = async (slugPart) => {
  if (!supabase || !slugPart) return null;
  
  // Agresivní čištění prefixů pro matching s "NVIDIA GeForce..."
  const clean = slugPart
    .replace(/-/g, " ")
    .replace(/geforce|radeon|nvidia|amd/gi, "")
    .trim();

  const { data } = await supabase
    .from("gpus")
    .select("*")
    .ilike("name", `%${clean}%`)
    .limit(1)
    .maybeSingle();

  return data;
};

// 🚀 GURU ENGINE: Funkce pro vygenerování duelu a ZÁPIS do DB (Logic V35.1)
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
          content: "Jsi Hardware Guru. Tvoříš SEO duely grafických karet. Tvůj styl je brutální, technický a virální. Piš v HTML (h2, strong, ul). JSON: title_cs, title_en, content_cs, content_en, seo_description_cs, seo_description_en." 
        },
        { role: "user", content: `Vytvoř profesionální srovnání: ${cardA.name} VS ${cardB.name}.` }
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

// 🚀 GURU: Cache dotazu pro rychlost (Logic V35.1)
const getDuelData = cache(async (slug) => {
  if (!supabase || !slug) return null;

  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug
    .replace(/geforce-/g, '')
    .replace(/radeon-/g, '');

  const { data, error } = await supabase
    .from('gpu_duels')
    .select(`
      *,
      gpuA:gpus!gpu_a_id(*),
      gpuB:gpus!gpu_b_id(*)
    `)
    .or(`slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug}`)
    .limit(1);

  if (error || !data || data.length === 0) {
    return await generateAndPersistDuel(slug);
  }
  
  return data[0];
});

// SEO Metadata (CZ/EN)
export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: 'Duel nenalezen | Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  return { 
    title: `${isEn ? duel.title_en : duel.title_cs} | Hardware Guru`,
    description: isEn ? duel.seo_description_en : duel.seo_description_cs 
  };
}

export default async function App({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  
  if (!duel) {
    if (typeof notFound === 'function') notFound();
    return <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center text-[#ff0055] font-black uppercase tracking-tighter text-3xl">404 - DUEL NENALEZEN</div>;
  }

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const title = isEn ? duel.title_en : duel.title_cs;
  const content = isEn ? duel.content_en : duel.content_cs;
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date(duel.created_at || Date.now()));
  
  const getWinnerClass = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return 'text-neutral-500';
    if (lowerIsBetter) return valA < valB ? 'text-[#66fcf1] font-black drop-shadow-[0_0_12px_#66fcf1]' : 'text-neutral-600 opacity-40';
    return valA > valB ? 'text-[#66fcf1] font-black drop-shadow-[0_0_12px_#66fcf1]' : 'text-neutral-600 opacity-40';
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  return (
    <main className="min-h-screen text-[#d1d5db] py-12 px-4 sm:px-6 lg:px-8" style={{ 
        backgroundColor: '#0a0b0d', backgroundImage: 'linear-gradient(to bottom, rgba(10,11,13,0.9), #0a0b0d), url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '140px'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 2.5rem; font-weight: 900; margin-top: 2.5em; margin-bottom: 1.2em; text-transform: uppercase; font-style: italic; border-left: 6px solid #ff0055; padding-left: 20px; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose ul { list-style: none; padding: 0; }
        .guru-prose li { padding: 15px 30px; position: relative; margin-bottom: 12px; background: rgba(31, 40, 51, 0.4); border-radius: 12px; border-left: 3px solid rgba(102, 252, 241, 0.3); }
        .guru-prose li::before { content: '⚡'; position: absolute; left: 10px; color: #66fcf1; }
        
        .glass-panel { background: rgba(31, 40, 51, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(102, 252, 241, 0.15); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .spec-row { display: grid; grid-template-columns: 1fr auto 1fr; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); align-items: center; }
        .spec-row:hover { background: rgba(255,255,255,0.02); }
        .vs-badge { width: 60px; height: 60px; background: #ff0055; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 20px; border: 4px solid #0a0b0d; box-shadow: 0 0 30px rgba(255,0,85,0.5); z-index: 10; color: #fff; transform: rotate(-5deg); margin: 0 -30px; }
        .ring-card { flex: 1; padding: 40px; border-radius: 20px; text-align: center; position: relative; border-top: 6px solid; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .ring-card:hover { transform: translateY(-8px); border-color: #fff !important; }
      `}} />

      <div className="max-w-4xl mx-auto">
        <Link href={isEn ? '/en/gpuvs' : '/gpuvs'} className="text-[#66fcf1] hover:text-white transition-all font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 mb-12">
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

        {/* 🥊 RING SYSTÉM (GURU STATION DESIGN) */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-24 relative gap-6 md:gap-0">
            <div className="ring-card glass-panel" style={{ borderColor: getVendorColor(gpuA.vendor) }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>{gpuA.vendor} • {gpuA.architecture}</div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{gpuA.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
            <div className="vs-badge">VS</div>
            <div className="ring-card glass-panel" style={{ borderColor: getVendorColor(gpuB.vendor) }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>{gpuB.vendor} • {gpuB.architecture}</div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{gpuB.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
        </div>

        {/* 📊 GURU DASHBOARD (TECHNICKÁ DATA) */}
        <section className="glass-panel mb-24">
            <div className="bg-white/5 py-6 text-center border-b border-white/5">
                <h3 className="font-black text-[11px] uppercase tracking-[0.6em] text-neutral-400">{isEn ? "GURU TECHNICAL METRICS" : "GURU TECHNICKÉ METRIKY"}</h3>
            </div>
            
            <div className="spec-row">
                <div className={`text-right text-3xl ${getWinnerClass(gpuA.vram_gb, gpuB.vram_gb)}`}>{gpuA.vram_gb} GB</div>
                <div className="px-12 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">VRAM</div>
                <div className={`text-left text-3xl ${getWinnerClass(gpuB.vram_gb, gpuA.vram_gb)}`}>{gpuB.vram_gb} GB</div>
            </div>

            <div className="spec-row">
                <div className="text-right text-xl font-black text-white">{gpuA.memory_bus}</div>
                <div className="px-12 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">{isEn ? "BUS WIDTH" : "SBĚRNICE"}</div>
                <div className="text-left text-xl font-black text-white">{gpuB.memory_bus}</div>
            </div>

            <div className="spec-row border-none">
                <div className={`text-right text-3xl ${getWinnerClass(gpuA.release_price_usd, gpuB.release_price_usd, true)}`}>${gpuA.release_price_usd}</div>
                <div className="px-12 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">{isEn ? "LAUNCH PRICE" : "ZAVÁDĚCÍ CENA"}</div>
                <div className={`text-left text-3xl ${getWinnerClass(gpuB.release_price_usd, gpuA.release_price_usd, true)}`}>${gpuB.release_price_usd}</div>
            </div>
        </section>

        {/* 🧠 GURU MASTER VERDIKT (AI OBSAH) */}
        <section className="mb-32 relative">
            <div className="flex items-center gap-4 text-[#66fcf1] font-black uppercase tracking-[0.4em] text-[11px] mb-16 bg-[#66fcf1]/5 py-5 px-12 rounded-2xl border border-[#66fcf1]/20 w-fit mx-auto shadow-[0_0_40px_rgba(102,252,241,0.1)]">
                <ShieldCheck size={20} /> {isEn ? "GURU MASTER VERDICT" : "GURU MASTER VERDIKT"}
            </div>
            <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
        </section>

        {/* 💰 AFILIÁTNÍ CTA */}
        <section className="mt-40 p-20 bg-neutral-900/40 border-2 border-[#66fcf1]/20 rounded-[40px] text-center shadow-[0_50px_150px_rgba(0,0,0,1)] relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#66fcf1] to-transparent opacity-50" />
            <div className="absolute -right-32 -bottom-32 opacity-[0.05] rotate-[-15deg] pointer-events-none text-[#66fcf1]"><Cpu size={500} /></div>
            
            <h3 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter italic leading-none">
              {isEn ? "GEAR UP, GURU!" : "NAKOPNI TO, GURU!"}
            </h3>
            <p className="text-neutral-400 mb-14 max-w-xl mx-auto font-black text-xl italic leading-relaxed uppercase tracking-tight">
              {isEn ? "Don't let your gaming rig starve. Get the maximum power for every dollar." : "Nenech svou herní mašinu hladovět. Vytřískaj z každý koruny maximum FPS."}
            </p>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="inline-flex items-center gap-5 px-16 py-8 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:scale-105 transition-all duration-300 rounded-2xl font-black text-2xl uppercase italic text-white shadow-[0_20px_50px_rgba(234,88,12,0.4)] border border-white/10">
              <ShoppingCart size={32} /> {isEn ? "VIEW BEST DEALS" : "ZOBRAZIT NEJLEPŠÍ CENY"}
            </a>
        </section>
      </div>
    </main>
  );
}
