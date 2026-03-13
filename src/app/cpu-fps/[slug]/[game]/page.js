import React from 'react';
import { 
  ChevronLeft, 
  Activity, 
  CheckCircle2,
  Monitor,
  ArrowRight,
  Cpu,
  Swords,
  Zap,
  Gauge
} from 'lucide-react';

/**
 * GURU CPU FPS ENGINE - BENCHMARK PAGE V2.0 (TOTAL DB FIX)
 * Cesta: src/app/cpu-fps/[slug]/[game]/page.js
 * 🛡️ FIX 1: Kompletně odstraněny dotazy na 'slug' sloupec v DB (opravuje Error 500).
 * 🛡️ FIX 2: Vylepšený Tokenized AND match - najde CPU i z URL s balastem (amd-, intel-).
 * 🛡️ FIX 3: Striktní ošetření asynchronních parametrů pro Next.js 15.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

// 🚀 GURU GLOBAL LOOKUP: Najde hardware bez nutnosti mít v DB sloupec 'slug'
const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug || cpuSlug === 'undefined') return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      // 🛡️ GURU FILTR: Odstraníme vendor balast a pomlčky
      const cleanString = cpuSlug.replace(/-/g, ' ').replace(/amd|intel|ryzen|core|ultra|processor|cpu/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      
      if (tokens.length > 0) {
          // Sestavíme dotaz: Všechny tokeny musí být obsaženy v poli 'name' (např. "9" AND "9900")
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${conditions})&limit=1`;
          
          const res = await fetch(url, { headers, cache: 'no-store' });
          if (res.ok) {
              const data = await res.json();
              return data?.[0] || null;
          }
      }
  } catch(e) {
      console.error("GURU LOOKUP CRASH:", e);
  }
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug: rawCpuSlug, game: rawGameSlug } = params;
  
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');

  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  const gameLabel = gameSlug.replace(/-/g, ' ').toUpperCase();
  const fpsData = cpu.cpu_game_fps?.[0] || {};
  const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
  const fps = Number(fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0);

  return {
    title: isEn 
      ? `${cpu.name} ${gameLabel} FPS (Tested on RTX 5090) | The Hardware Guru`
      : `${cpu.name} ${gameLabel} FPS (Testováno s RTX 5090) | The Hardware Guru`,
    description: isEn
      ? `Real CPU performance of ${cpu.name} in ${gameLabel} tested with NVIDIA RTX 5090. Average ${fps} FPS.`
      : `Podívejte se na reálný výkon procesoru ${cpu.name} ve hře ${gameLabel} s kartou NVIDIA RTX 5090. Průměrně ${fps} FPS.`,
    alternates: {
        canonical: `https://thehardwareguru.cz/cpu-fps/${cpuSlug}/${gameSlug}`,
        languages: {
            'en': `https://thehardwareguru.cz/en/cpu-fps/${cpuSlug}/${gameSlug}`,
            'cs': `https://thehardwareguru.cz/cpu-fps/${cpuSlug}/${gameSlug}`,
            'x-default': `https://thehardwareguru.cz/cpu-fps/${cpuSlug}/${gameSlug}`
        }
    }
  };
}

export default async function App(props) {
  const params = await props.params;
  const { slug: rawCpuSlug, game: rawGameSlug } = params;
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  
  if (!cpu) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center', padding: '40px', border: '1px solid #ef4444', borderRadius: '20px' }}>
            <h1 style={{ color: '#ef4444', fontWeight: '900' }}>404 | CPU NENALEZENO</h1>
            <p style={{ color: '#4b5563', marginTop: '10px' }}>Databáze neobsahuje procesor s klíčem: {cpuSlug}</p>
        </div>
    </div>
  );

  const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
  const fpsData = cpu.cpu_game_fps?.[0] || {};
  
  // 🚀 GURU: Bezpečné načtení FPS s fallbacky
  const fpsBase = Number(fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0);
  
  const fps1080p = fpsBase > 0 ? Math.round(fpsBase * 1.25) : 0;
  const fps1440p = fpsBase;
  const fps4k = fpsBase > 0 ? Math.round(fpsBase * 0.85) : 0;

  const getVerdict = (f) => {
      if (f >= 120) return { en: 'ESPORTS READY', cz: 'ESPORT ÚROVEŇ', color: '#10b981' };
      if (f >= 60) return { en: 'SMOOTH GAMING', cz: 'PLYNULÉ HRANÍ', color: '#f59e0b' };
      if (f >= 30) return { en: 'PLAYABLE', cz: 'HRATELNÉ', color: '#eab308' };
      return { en: 'BOTTLENECK', cz: 'BRZDÍ SYSTÉM', color: '#ef4444' };
  };

  const verdict = getVerdict(fps1440p);
  const verdictText = isEn ? verdict.en : verdict.cz;
  const cleanGameLabel = gameSlug.replace(/-/g, ' ');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU PROFILE' : 'ZPĚT NA PROFIL'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
               <Gauge size={16} /> GURU CPU RADAR
             </div>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#76b900', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', padding: '6px 20px', border: '1px solid rgba(118, 185, 0, 0.5)', borderRadius: '50px', background: 'rgba(118, 185, 0, 0.1)', boxShadow: '0 0 30px rgba(118, 185, 0, 0.2)' }}>
               <Zap size={14} fill="currentColor" /> {isEn ? 'TESTED ON NVIDIA RTX 5090' : 'TESTOVÁNO S NVIDIA RTX 5090'}
             </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 8vw, 4.2rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1', letterSpacing: '-1px' }}>
            {normalizeName(cpu.name)} <br/>
            <span style={{ color: '#f59e0b' }}>{cleanGameLabel}</span> FPS
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(245, 158, 11, 0.2)', borderLeft: `10px solid ${verdict.color}`, borderRadius: '24px', padding: '60px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? 'ESTIMATED AVG PERFORMANCE (1440p)' : 'ODHADOVANÝ PRŮMĚR VÝKONU (1440p)'}
                </div>
                <div style={{ fontSize: 'clamp(70px, 18vw, 120px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: `0 0 50px ${verdict.color}50` }}>
                    {fps1440p > 0 ? fps1440p : '?'} <span style={{ fontSize: '35px', color: verdict.color }}>FPS</span>
                </div>
                {fps1440p > 0 && (
                  <div style={{ background: `${verdict.color}20`, color: verdict.color, padding: '12px 30px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '15px', border: `1px solid ${verdict.color}50`, marginTop: '15px' }}>
                      <CheckCircle2 size={20} /> {verdictText}
                  </div>
                )}
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Monitor size={28} /> {isEn ? 'SCALING WITH RTX 5090' : 'ŠKÁLOVÁNÍ S RTX 5090'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="res-card">
                    <div className="res-label">1080p Ultra</div>
                    <div className="res-val">{fps1080p > 0 ? `~${fps1080p} FPS` : 'N/A'}</div>
                </div>
                <div className="res-card" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.1)' }}>
                    <div className="res-label" style={{ color: '#f59e0b' }}>1440p High/Ultra</div>
                    <div className="res-val" style={{ color: '#fff' }}>{fps1440p > 0 ? `${fps1440p} FPS` : 'N/A'}</div>
                </div>
                <div className="res-card">
                    <div className="res-label">4K Ultra Native</div>
                    <div className="res-val">{fps4k > 0 ? `~${fps4k} FPS` : 'N/A'}</div>
                </div>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style">
                <div className="guru-prose">
                    <h2>
                      {isEn 
                        ? `How does ${normalizeName(cpu.name)} handle ${cleanGameLabel}?` 
                        : `Jak si procesor ${normalizeName(cpu.name)} poradí se hrou ${cleanGameLabel}?`}
                    </h2>
                    
                    {isEn ? (
                      <>
                        <p>To accurately measure the pure processing power of the <strong>{normalizeName(cpu.name)}</strong> without any graphical limitations, these benchmarks were conducted using the world's most powerful consumer graphics card – the <strong>NVIDIA GeForce RTX 5090</strong>. This setup ensures that the resulting frame rates are a direct reflection of the CPU's ability to process game logic and physics.</p>
                        <p>At 1440p resolution, the processor manages an average of <strong>{fps1440p > 0 ? fps1440p : 'N/A'} FPS</strong>. Our data confirms that this specific CPU is <strong>{verdict.en.toLowerCase()}</strong>, making it a reliable choice for gaming enthusiasts who want to avoid system bottlenecks.</p>
                      </>
                    ) : (
                      <>
                        <p>Abychom dokázali změřit skutečný čistý výkon procesoru <strong>{normalizeName(cpu.name)}</strong> bez jakéhokoliv grafického omezení, byly tyto testy provedeny s využitím aktuálně nejvýkonnější karty světa – <strong>NVIDIA GeForce RTX 5090</strong>. Toto spojení zaručuje, že naměřená data jsou přímým odrazem schopnosti procesoru zpracovávat herní logiku a fyziku.</p>
                        <p>Při hraní v rozlišení 1440p dosahuje procesor průměrně <strong>{fps1440p > 0 ? fps1440p : 'N/A'} FPS</strong>. Naše analýza potvrzuje, že tento procesor nabízí <strong>{verdict.cz.toLowerCase()}</strong>, což z něj dělá skvělou volbu pro náročné hráče, kteří se chtějí vyhnout brzdění celého systému.</p>
                      </>
                    )}
                </div>
            </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isEn ? 'Want more benchmarks? Compare this CPU' : 'Chcete více benchmarků? Porovnejte tento procesor'}
            </div>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '20px 45px', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#fff', borderRadius: '18px', fontWeight: '950', fontSize: '16px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 15px 40px rgba(245, 158, 11, 0.4)', transition: '0.3s' }}>
                <Swords size={20} /> {isEn ? 'Launch CPU VS Engine' : 'Spustit CPU VS Engine'} <ArrowRight size={18} />
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(245, 158, 11, 0.1); transform: translateX(-5px); }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid #f59e0b; padding-left: 15px; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 45px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 0.8em; text-transform: uppercase; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 30px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.3); transition: 0.3s; }
        .res-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.1); }
        .res-label { font-size: 10px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 12px; }
        .res-val { font-size: 28px; font-weight: 950; color: #d1d5db; }
      `}} />
    </div>
  );
}
