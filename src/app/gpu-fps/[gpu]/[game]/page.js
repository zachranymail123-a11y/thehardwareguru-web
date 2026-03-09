import React from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  Gamepad2, 
  BarChart3, 
  Activity, 
  Swords,
  CheckCircle2,
  TrendingUp,
  Monitor
} from 'lucide-react';

/**
 * GURU FPS ENGINE - GAME BENCHMARK PAGE V1.0
 * Cesta: src/app/gpu-fps/[gpu]/[game]/page.js
 * 🚀 SEO: Cílí na dotazy typu "RTX 4070 Cyberpunk FPS".
 * 🛡️ DESIGN: Guru Supreme (Neon, agresivní vizualizace FPS).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU: Agresivní slugify engine
const slugify = (text) => {
    return text.toLowerCase().replace(/nvidia|amd|geforce|radeon|graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
};

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

// 🛡️ GURU ENGINE: Vyhledávání karty z DB
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl) return null;
  const clean = gpuSlug.replace(/-/g, " ").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks) return null;
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

export async function generateMetadata({ params }) {
  const { gpu: gpuSlug, game: gameSlug } = params;
  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  const gameLabel = gameSlug.replace(/-/g, ' ').toUpperCase();
  const fpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps;
  const fps = fpsData ? (fpsData[`${gameSlug.replace('-2077', '')}_1440p`] || 0) : 0;

  return {
    title: `${gpu.name} ${gameLabel} FPS – 1440p Gaming Benchmark | The Hardware Guru`,
    description: `See ${gpu.name} reallife performance in ${gameLabel}. Average ${fps} FPS at 1440p resolution. Detailed gaming benchmark analysis.`
  };
}

export default async function GpuFpsPage({ params }) {
  const { gpu: gpuSlug, game: gameSlug } = params;
  const isEn = true; // Pro tuto route budeme primárně cílit EN, ale kód je připraven
  
  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>GPU NENALEZENO</div>;

  const gameKey = gameSlug.replace('-2077', ''); // Mapování slug -> DB sloupec
  const fpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps;
  const fps1440p = fpsData ? (fpsData[`${gameKey}_1440p`] || 0) : 0;
  
  // Odhady pro další rozlišení (klasické škálování)
  const fps1080p = Math.round(fps1440p * 1.4);
  const fps4k = Math.round(fps1440p * 0.6);

  const getVerdict = (f) => {
      if (f >= 100) return { text: 'ULTIMATE EXPERIENCE', color: '#10b981' };
      if (f >= 60) return { text: 'SMOOTH GAMING', color: '#66fcf1' };
      if (f >= 30) return { text: 'PLAYABLE', color: '#eab308' };
      return { text: 'NOT RECOMMENDED', color: '#ef4444' };
  };

  const verdict = getVerdict(fps1440p);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href="/gpuvs" className="guru-back-btn">
            <ChevronLeft size={16} /> BACK TO ENGINE
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102,252,241,0.05)' }}>
            <Activity size={16} /> GURU FPS RADAR
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1' }}>
            {normalizeName(gpu.name)} <br/>
            <span style={{ color: '#66fcf1' }}>{gameSlug.replace(/-/g, ' ')}</span> FPS
          </h1>
        </header>

        {/* 🚀 FPS HERO CARD */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', borderLeft: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    1440p Resolution Average
                </div>
                <div style={{ fontSize: '100px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: `0 0 40px ${verdict.color}40` }}>
                    {fps1440p} <span style={{ fontSize: '30px', color: verdict.color }}>FPS</span>
                </div>
                <div style={{ background: `${verdict.color}20`, color: verdict.color, padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${verdict.color}40`, marginTop: '10px' }}>
                    <CheckCircle2 size={18} /> {verdict.text}
                </div>
            </div>
        </section>

        {/* 🚀 RESOLUTION SCALING */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Monitor size={28} /> PERFORMANCE SCALING
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="res-card">
                  <div className="res-label">1080p Ultra</div>
                  <div className="res-val">~{fps1080p} FPS</div>
              </div>
              <div className="res-card" style={{ borderColor: '#66fcf1', background: 'rgba(102, 252, 241, 0.05)' }}>
                  <div className="res-label" style={{ color: '#66fcf1' }}>1440p High/Ultra</div>
                  <div className="res-val" style={{ color: '#fff' }}>{fps1440p} FPS</div>
              </div>
              <div className="res-card">
                  <div className="res-label">4K UHD</div>
                  <div className="res-val">~{fps4k} FPS</div>
              </div>
          </div>
        </section>

        {/* 🚀 SEO CONTENT */}
        <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style">
                <div className="guru-prose">
                    <h2>Is {gpu.name} good for {gameSlug.replace(/-/g, ' ')}?</h2>
                    <p>According to our technical database and aggregated benchmarks, the <strong>{gpu.name}</strong> delivers a solid gaming experience in <strong>{gameSlug.replace(/-/g, ' ')}</strong>. At 1440p resolution with High/Ultra settings, you can expect an average of <strong>{fps1440p} FPS</strong>.</p>
                    <p>This performance level means the game will be {verdict.text.toLowerCase()} on your system. For the best experience, we recommend using a high-refresh-rate monitor and ensuring your drivers are up to date.</p>
                </div>
            </div>
        </section>

        {/* 🚀 CROSS-LINK TO VS ENGINE */}
        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>Want more data? Compare this GPU</div>
            <a href={`/gpuvs`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}>
                <Swords size={20} /> Launch VS Engine <ArrowRight size={18} />
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 0.8em; text-transform: uppercase; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; }
        .res-label { font-size: 10px; font-weight: 950; text-transform: uppercase; color: #4b5563; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 24px; font-weight: 950; color: #d1d5db; }
      `}} />
    </div>
  );
}
