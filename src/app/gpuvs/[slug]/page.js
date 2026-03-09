import React, { cache } from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  ShoppingCart,
  Cpu,
  Flame,
  Activity,
  Trophy,
  Swords,
  Calendar,
  Heart
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V46.1 (PREVIEW FIX)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ GURU MANDÁT: LOGIKA V44.0 (Bulletproof Matcher & 60s Timeout).
 * 🛡️ DESIGN: Striktně aplikován layout z "TipDetail" (max-w-900px, glassmorphism).
 * 🛡️ FIX: "Preview Compatibility Bridge" pro funkční náhled.
 */

// --- 🛡️ GURU COMPATIBILITY BRIDGE: Bezpečné načtení pro náhled ---
const safeLoad = (name) => {
  try { return require(name); } catch (e) { return null; }
};

const supabaseLib = safeLoad('@supabase/supabase-js');
const nextNav = safeLoad('next/navigation');
const nextLinkMod = safeLoad('next/link');
const openAILib = safeLoad('openai');

const createClient = supabaseLib ? supabaseLib.createClient : null;
const notFound = nextNav ? nextNav.notFound : () => {};
const Link = nextLinkMod ? (nextLinkMod.default || nextLinkMod) : ({ children, href, className, ...props }) => <a href={href} className={className} {...props}>{children}</a>;
const OpenAI = openAILib ? (openAILib.default || openAILib) : null;

// 🚀 GURU FIX: Prodloužení serverless timeoutu na Vercelu
export const maxDuration = 60;

// 🚀 GURU: Inicializace API klíčů
const apiKey = typeof process !== 'undefined' ? (process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY) : null;
const openai = (OpenAI && apiKey) ? new OpenAI({ apiKey: apiKey }) : null;

const supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const supabaseKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';

const supabase = (createClient && supabaseUrl) ? createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { persistSession: false } }
) : null;

// 🛡️ GURU ENGINE: Robustní vyhledávání karty v DB
const findGpu = async (slugPart) => {
  if (!supabase || !slugPart) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
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

// 🚀 GURU ENGINE: Generování a Zápis
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
  } catch (err) { return null; }
}

// 🚀 GURU: Cache
const getDuelData = cache(async (slug) => {
  if (!supabase || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace(/geforce-/g, '').replace(/radeon-/g, '');

  const { data, error } = await supabase
    .from('gpu_duels')
    .select(`*, gpuA:gpus!gpu_a_id(*), gpuB:gpus!gpu_b_id(*)`)
    .or(`slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug}`)
    .limit(1);

  if (error || !data || data.length === 0) return await generateAndPersistDuel(slug);
  return data[0];
});

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: 'Duel nenalezen | The Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  const title = isEn ? duel.title_en : duel.title_cs;
  const desc = isEn ? duel.seo_description_en : duel.seo_description_cs;
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
    if (typeof notFound === 'function') notFound();
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#ff0055', fontSize: '30px', fontWeight: '900', textTransform: 'uppercase' }}>404 - DUEL NENALEZEN</h1>
      </div>
    );
  }

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const title = isEn ? duel.title_en : duel.title_cs;
  const content = isEn ? duel.content_en : duel.content_cs;
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date(duel.created_at || Date.now()));
  
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
      
      {/* 🚀 GURU CSS SYSTÉM (Přímo přenesený z TipDetail) */}
      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; backdrop-filter: blur(5px); border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.2); }

        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #66fcf1; font-size: 2.2rem; font-weight: 950; margin-top: 2.5em; margin-bottom: 1em; text-transform: uppercase; letter-spacing: 1px; }
        .guru-prose h3 { color: #fff; font-size: 1.6rem; font-weight: 900; margin-top: 2em; margin-bottom: 1em; }
        .guru-prose p { margin-bottom: 1.5em; }
        .guru-prose a { color: #f97316; text-decoration: none; font-weight: bold; border-bottom: 2px dashed rgba(249, 115, 22, 0.5); transition: 0.3s; padding-bottom: 2px; }
        .guru-prose a:hover { color: #ea580c; border-bottom-style: solid; border-bottom-color: #ea580c; }
        .guru-prose ul, .guru-prose ol { padding-left: 1.5em; margin-bottom: 1.5em; }
        .guru-prose li { margin-bottom: 0.8em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        /* UNIKÁTNÍ CSS PRO DUEL RING A TABULKU */
        .duel-ring-container { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 20px; padding: 40px 30px 60px 30px; background: linear-gradient(to bottom, rgba(10, 11, 13, 0.4), rgba(15, 17, 21, 1)); position: relative; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .ring-card { flex: 1; padding: 40px 20px; background: rgba(20, 24, 30, 0.8); border-radius: 20px; text-align: center; border-top: 6px solid; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .ring-vendor { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px; }
        .ring-name { font-size: 2.2rem; font-weight: 950; color: #fff; text-transform: uppercase; font-style: italic; margin: 0; line-height: 1.1; }
        .vs-badge { width: 60px; height: 60px; min-width: 60px; background: #ff0055; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 20px; border: 4px solid #0a0b0d; box-shadow: 0 0 30px rgba(255,0,85,0.5); z-index: 10; color: #fff; margin: 0 -40px; transform: rotate(-5deg); }
        
        .specs-container { background: rgba(0,0,0,0.3); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 50px; overflow: hidden; }
        .specs-header { background: rgba(0,0,0,0.5); padding: 15px; text-align: center; color: #9ca3af; font-size: 11px; font-weight: 950; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .spec-row { display: grid; grid-template-columns: 1fr auto 1fr; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); align-items: center; transition: 0.3s; }
        .spec-row:hover { background: rgba(255,255,255,0.02); }
        .spec-row:last-child { border-bottom: none; }
        .spec-val { font-size: 24px; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .spec-label { padding: 0 30px; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; font-style: italic; text-align: center; }

        @media (max-width: 768px) {
          .guru-prose { font-size: 1.05rem; }
          .guru-prose h2 { font-size: 1.8rem; }
          .guru-deals-btn, .guru-support-btn { width: 100%; }
          
          .duel-ring-container { flex-direction: column; padding: 60px 20px 30px 20px; }
          .vs-badge { margin: -20px 0; z-index: 10; }
          .ring-card { width: 100%; padding: 30px 15px; }
          .ring-name { font-size: 1.8rem; }
          .spec-row { padding: 15px; }
          .spec-val { font-size: 18px; }
          .spec-label { padding: 0 15px; font-size: 9px; }
          .duel-content-padding { padding: 30px 20px 40px 20px !important; }
        }
      `}} />
      
      {/* 🚀 GURU HLAVNÍ SKLENĚNÝ KONTEJNER (Kopie z TipDetail) */}
      <main style={{ 
          maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', 
          borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' 
      }}>
        
        {/* --- HRDINSKÝ VS RING --- */}
        <div style={{ width: '100%', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 40px 40px', background: 'linear-gradient(to bottom, rgba(10, 11, 13, 0.8) 0%, rgba(15, 17, 21, 1) 100%)' }}>
            
            {/* Tlačítko Zpět */}
            <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 20 }}>
              <Link href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO SELECTION' : 'ZPĚT NA VÝBĚR'}
              </Link>
            </div>

            <div className="duel-ring-container">
                <div className="ring-card" style={{ borderTopColor: getVendorColor(gpuA.vendor) }}>
                    <div className="ring-vendor" style={{ color: getVendorColor(gpuA.vendor) }}>{gpuA.vendor} • {gpuA.architecture}</div>
                    <h2 className="ring-name">{gpuA.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
                </div>
                <div className="vs-badge">VS</div>
                <div className="ring-card" style={{ borderTopColor: getVendorColor(gpuB.vendor) }}>
                    <div className="ring-vendor" style={{ color: getVendorColor(gpuB.vendor) }}>{gpuB.vendor} • {gpuB.architecture}</div>
                    <h2 className="ring-name">{gpuB.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
                </div>
            </div>
        </div>

        <div className="duel-content-padding" style={{ padding: '40px 50px 60px 50px' }}>
          
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

          {/* --- TABULKA SPECIFIKACÍ --- */}
          <div className="specs-container">
             <div className="specs-header">{isEn ? 'GURU TECHNICAL METRICS' : 'GURU TECHNICKÉ METRIKY'}</div>
             
             <div className="spec-row">
               <div className="spec-val text-right" style={getWinnerStyle(gpuA.vram_gb, gpuB.vram_gb)}>{gpuA.vram_gb} GB</div>
               <div className="spec-label">VRAM</div>
               <div className="spec-val text-left" style={getWinnerStyle(gpuB.vram_gb, gpuA.vram_gb)}>{gpuB.vram_gb} GB</div>
             </div>

             <div className="spec-row">
               <div className="spec-val text-right" style={{ color: '#e5e7eb', fontWeight: 'bold' }}>{gpuA.memory_bus}</div>
               <div className="spec-label">{isEn ? 'BUS' : 'SBĚRNICE'}</div>
               <div className="spec-val text-left" style={{ color: '#e5e7eb', fontWeight: 'bold' }}>{gpuB.memory_bus}</div>
             </div>

             <div className="spec-row">
               <div className="spec-val text-right" style={getWinnerStyle(gpuA.boost_clock_mhz, gpuB.boost_clock_mhz)}>{gpuA.boost_clock_mhz} MHz</div>
               <div className="spec-label">BOOST CLOCK</div>
               <div className="spec-val text-left" style={getWinnerStyle(gpuB.boost_clock_mhz, gpuA.boost_clock_mhz)}>{gpuB.boost_clock_mhz} MHz</div>
             </div>

             <div className="spec-row">
               <div className="spec-val text-right" style={getWinnerStyle(gpuA.tdp_w, gpuB.tdp_w, true)}>{gpuA.tdp_w} W</div>
               <div className="spec-label">TDP</div>
               <div className="spec-val text-left" style={getWinnerStyle(gpuB.tdp_w, gpuA.tdp_w, true)}>{gpuB.tdp_w} W</div>
             </div>

             <div className="spec-row">
               <div className="spec-val text-right" style={getWinnerStyle(gpuA.release_price_usd, gpuB.release_price_usd, true)}>${gpuA.release_price_usd}</div>
               <div className="spec-label">{isEn ? 'PRICE' : 'CENA'}</div>
               <div className="spec-val text-left" style={getWinnerStyle(gpuB.release_price_usd, gpuA.release_price_usd, true)}>${gpuB.release_price_usd}</div>
             </div>
          </div>

          {/* --- AI VERDIKT --- */}
          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* --- 🚀 GURU GLOBÁLNÍ CTA (Podpora webu a Slevy - Stejné jako v Tipech) --- */}
          <div style={{ 
            marginTop: '70px', 
            paddingTop: '50px', 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '25px' 
          }}>
            <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
              {isEn ? "Help us build this database by supporting us." : "Pomohl ti tento duel při výběru? Podpoř naši AI základnu."}
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
    </div>
  );
}
