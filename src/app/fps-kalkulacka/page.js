import React from 'react';
import { Gamepad2, Info, Activity, Monitor, Cpu, TrendingUp } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';

/**
 * GURU FPS ENGINE - V1.1 (SEO MAGNET + PROXY READY)
 * Cesta: src/app/fps-kalkulacka/page.js
 * 🚀 CÍL: Generovat obří traffic na dotazy "FPS Calculator" a "Rozjedu to".
 * 🛡️ ARCH: Server komponenta s automatickou detekcí jazyka pro EN proxy.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  // Detekce jazyka pro metadata (funguje pro params i proxy export)
  const isEn = props?.params?.lang === 'en' || false;

  return {
    title: isEn 
        ? 'FPS Calculator 2026: Can I Run It? | The Hardware Guru'
        : 'FPS Kalkulačka 2026: Rozjedu to? (Can I Run It) | The Hardware Guru',
    description: isEn
        ? 'Find out exactly how many FPS you can get in modern games. Our GURU FPS Engine analyzes your GPU and CPU performance.'
        : 'Zjistěte přesně, na kolik FPS rozjedete hry jako Cyberpunk 2077 nebo Warzone. Náš GURU FPS Engine analyzuje výkon vaší grafické karty a procesoru.',
    alternates: {
      canonical: `${baseUrl}/fps-kalkulacka`,
      languages: {
        'en': `${baseUrl}/en/fps-calculator`,
        'cs': `${baseUrl}/fps-kalkulacka`,
        'x-default': `${baseUrl}/fps-kalkulacka`
      }
    }
  };
}

const fetchDatabase = async () => {
    if (!supabaseUrl) return { gpus: [], cpus: [] };
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' };
    
    try {
        const [gpuRes, cpuRes] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/gpus?select=id,name,vendor,slug,game_fps!gpu_id(cyberpunk_2077_1080p,cyberpunk_2077_1440p,cyberpunk_2077_2160p,warzone_1080p,warzone_1440p,warzone_2160p,starfield_1080p,starfield_1440p,starfield_2160p)&order=name.asc`, { headers, cache: 'no-store' }),
            fetch(`${supabaseUrl}/rest/v1/cpus?select=id,name,vendor,slug,cpu_game_fps!cpu_id(cyberpunk_1080p,cyberpunk_1440p,cyberpunk_2160p,warzone_1080p,warzone_1440p,warzone_2160p,starfield_1080p,starfield_1440p,starfield_2160p)&order=name.asc`, { headers, cache: 'no-store' })
        ]);

        const gpus = gpuRes.ok ? await gpuRes.json() : [];
        const cpus = cpuRes.ok ? await cpuRes.json() : [];

        return { gpus, cpus };
    } catch (e) {
        return { gpus: [], cpus: [] };
    }
};

const getRelatedArticles = async (isEn) => {
    if (!supabaseUrl) return [];
    try {
        const query = isEn ? 'title_en.ilike.%fps%,title_en.ilike.%performance%' : 'title.ilike.%fps%,title.ilike.%výkon%';
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(${query},type.eq.hardware)&order=created_at.desc&limit=3`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
        });
        if (res.ok) return await res.json();
        return [];
    } catch (e) { return []; }
};

export default async function FpsKalkulackaPage(props) {
  // GURU: Tato logika automaticky rozpozná, zda přicházíme z /en/ proxy
  const isEn = props?.params?.lang === 'en' || false;
  
  const { gpus, cpus } = await fetchDatabase();
  const relatedArticles = await getRelatedArticles(isEn);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GURU FPS Engine",
    "operatingSystem": "WebBrowser",
    "applicationCategory": "UtilityApplication",
    "description": isEn ? "Calculates gaming performance (FPS) for any combination of CPU and GPU." : "Zjišťuje herní výkon (FPS) pro libovolnou kombinaci procesoru a grafické karty.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(softwareSchema) }} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Gamepad2 size={16} /> GURU FPS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            FPS <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>{isEn ? 'CALCULATOR' : 'KALKULAČKA'}</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.2rem', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn 
                ? 'Select your game, resolution, and hardware. Find out instantly if you can run it or if it\'s time for an upgrade.' 
                : 'Vyberte si hru, rozlišení a svůj hardware. Zjistěte okamžitě, jestli to rozjedete, nebo je čas na upgrade.'}
          </p>
        </header>

        {/* 🚀 KLIENTSKÁ INTERAKTIVNÍ ČÁST */}
        <FpsCalculatorClient gpus={gpus} cpus={cpus} isEn={isEn} />

        {/* 🚀 GURU SILOING: SOUVISEJÍCÍ ČLÁNKY */}
        {relatedArticles.length > 0 && (
            <section style={{ marginTop: '80px' }}>
                <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Info size={28} color="#a855f7" /> {isEn ? 'HOW TO INCREASE FPS?' : 'JAK ZVÝŠIT FPS? (TIPY A TRIKY)'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {relatedArticles.map((art) => (
                        <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} className="related-article-card">
                            <div className="related-img-wrapper">
                                <img src={art.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000'} alt={isEn ? art.title_en : art.title} loading="lazy" />
                            </div>
                            <div className="related-content">
                                <h3 className="related-title">{isEn && art.title_en ? art.title_en : art.title}</h3>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        )}

        {/* 🚀 GURU SILOING: ROZCESTNÍK */}
        <div style={{ marginTop: '60px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#66fcf1' }}>
                <div className="silo-banner-icon" style={{ color: '#66fcf1', background: '#66fcf120' }}><Monitor size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'GPU DATABASE' : 'KATALOG GRAFIK'}</h4>
                    <p>{isEn ? 'Compare performance of all graphics cards.' : 'Porovnejte výkon všech grafických karet na trhu.'}</p>
                </div>
            </a>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#f59e0b' }}>
                <div className="silo-banner-icon" style={{ color: '#f59e0b', background: '#f59e0b20' }}><Cpu size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'CPU DATABASE' : 'KATALOG PROCESORŮ'}</h4>
                    <p>{isEn ? 'Find the best processor for your rig.' : 'Najděte ten nejlepší procesor k vaší grafice.'}</p>
                </div>
            </a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-left-width: 5px; }
        .silo-banner-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.02); }
        .silo-banner-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .silo-banner-text h4 { margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; font-weight: 950; text-transform: uppercase; }
        .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.9rem; }

        .related-article-card { display: flex; flex-direction: column; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; text-decoration: none; transition: 0.3s; }
        .related-article-card:hover { transform: translateY(-5px); border-color: rgba(168, 85, 247, 0.4); box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
        .related-img-wrapper { height: 140px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .related-img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .related-content { padding: 20px; }
        .related-title { margin: 0; font-size: 1.1rem; font-weight: 950; color: #fff; line-height: 1.3; }

        @media (max-width: 768px) {
            .silo-banner-card { flex-direction: column; text-align: center; }
        }
      `}} />
    </div>
  );
}
