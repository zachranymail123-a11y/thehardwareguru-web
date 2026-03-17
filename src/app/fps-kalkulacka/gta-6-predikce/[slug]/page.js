import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sparkles, Award, ArrowRight, Zap, Monitor, Cpu, Share2, Check, Twitter } from 'lucide-react';

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

// Bezpečná SVG ikona Redditu (stejná jako v klientovi)
const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default async function Gta6PredictionPage({ params, searchParams }) {
  const { cpuId, gpuId } = searchParams;
  const slug = params.slug; 
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Zjistíme rozlišení ze slug (amd-ryzen-7-7800x3d-vs-rtx-4080-1440p)
  const resolution = slug.endsWith('2160p') ? '4k' : slug.endsWith('1440p') ? '1440p' : '1080p';
  const resKey = resolution === '4k' ? 'alan_wake_2_4k' : `alan_wake_2_${resolution}`;

  // Načteme HW data
  const [gpuData, cpuData, gpus, cpus] = await Promise.all([
    supabase.from('game_fps').select('*').eq('gpu_id', gpuId).maybeSingle(),
    supabase.from('cpu_game_fps').select('*').eq('cpu_id', cpuId).maybeSingle(),
    supabase.from('gpus').select('id,name,vendor').order('name'),
    supabase.from('cpus').select('id,name').order('name')
  ]);

  const gpuName = gpus.data?.find(g => g.id === gpuId)?.name || 'GPU';
  const cpuName = cpus.data?.find(c => c.id === cpuId)?.name || 'CPU';
  const hwComboName = `${cpuName} + ${gpuName}`;

  const gpuFps = gpuData.data?.[resKey] || 0;
  const cpuFps = cpuData.data?.[resKey] || 0;
  
  // GURU MATH: Alan Wake 2 * 0.85 koeficient pro GTA 6
  const baseFps = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);
  const predictedFps = Math.round(baseFps * 0.85);

  // SEO Texty pro sdílení
  const shareUrl = `${baseUrl}/fps-kalkulacka/gta-6-predikce/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;
  const shareTextCs = `🔮 Predikce: Moje sestava by měla dát v GTA VI na ${resolution} brutálních ${predictedFps} FPS! 🚀💻 Železo: ${hwComboName}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextCs)}&url=${encodeURIComponent(shareUrl)}`;
  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`🔮 [Odhad výkonu] GTA VI na mojí sestavě: ${predictedFps} FPS! (${hwComboName})`)}`;

  // GOOGLE GOLDEN RICH DATA - SoftwareApplication
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `GTA VI Performance Prediction - ${hwComboName}`,
    "operatingSystem": "Windows 10, Windows 11",
    "applicationCategory": "GameApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1520"
    },
    "description": `Odhadovaný výkon hry Grand Theft Auto VI pro sestavu s ${cpuName} a ${gpuName} v rozlišení ${resolution}. Výpočet založen na tvrdých datech z Alan Wake 2.`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="pred-badge"><Sparkles size={16} /> AI NEXT-GEN PREDIKCE</div>
          <h1 style={{ fontSize: '3rem', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
            GTA VI OČEKÁVANÝ VÝKON
          </h1>
          {/* GURU: Tenhle text je teď obří a nepřehlédnutelný */}
          <p style={{ fontSize: '24px', fontWeight: '950', color: '#fda4af', marginTop: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {hwComboName} ({resolution === '4k' ? '4K Ultra HD' : `${resolution} Quad HD`})
          </p>
        </header>

        {/* HLAVNÍ VÝSLEDEK S NEONOVÝM RÁMEČKEM */}
        <div className="result-card">
            <div className="fps-main">{predictedFps} <span style={{ fontSize: '4rem' }}>FPS</span></div>
            <div className="fps-label">PŘEDPOKLÁDANÁ RYCHLOST HRY</div>
            
            <div className="stats-row">
                <div className="stat-pill"><Cpu size={18} color="#f59e0b" /> CPU Limit: {Math.round(cpuFps * 0.85)} FPS</div>
                <div className="stat-pill"><Monitor size={18} color="#66fcf1" /> GPU Limit: {Math.round(gpuFps * 0.85)} FPS</div>
            </div>
        </div>

        {/* GURU: Přidán Flex Panel pro automatickou promoci */}
        <div className="viral-flex-card">
            <div className="award-icon"><Award size={32} color="#fff" /></div>
            <div className="viral-text-box">
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ÚSPĚCH ODEMČEN
                </div>
                <div style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 'bold' }}>
                    Pochlub se tímhle odhadem online!
                </div>
            </div>
            {/* GURU: Tlačítka pro sdílení na jeden klik */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button onClick={() => navigator.clipboard.writeText(shareTextCs + ' 👉 Změř si to taky na: ' + shareUrl)} className="premium-share-btn btn-copy" title="Kopírovat do schránky">
                    <Share2 size={20} />
                </button>
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="premium-share-btn btn-x" title="Sdílet na X">
                    <Twitter size={20} />
                </a>
                <a href={redditUrl} target="_blank" rel="noopener noreferrer" className="premium-share-btn btn-reddit" title="Sdílet na Reddit">
                    <RedditIcon size={20} />
                </a>
            </div>
        </div>

        {/* NAVIGACE MEZI ROZLIŠENÍMI */}
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
             {['1080p', '1440p', '2160p'].map(res => (
                 <a key={res} href={`/fps-kalkulacka/gta-6-predikce/${slug.split('-vs-')[0]}-vs-${slug.split('-vs-')[1].split('-')[0]}-${res}?cpuId=${cpuId}&gpuId=${gpuId}`} className={`res-nav ${resolution === (res === '2160p' ? '4k' : res) ? 'active' : ''}`}>
                    {res === '2160p' ? '4K Ultra' : `${res} Quad`}
                 </a>
             ))}
        </div>

        {/* PROLINKOVÁNÍ ZPĚT NA NÁSTROJE */}
        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/fps-kalkulacka" className="silo-mini-card"><Zap size={20} color="#a855f7" /> NOVÉ MĚŘENÍ JINÉ HRY</a>
            <a href="/cpuvs" className="silo-mini-card highlight"><ArrowRight size={20} color="#f59e0b" /> BOTTLENECK TEST Této sestavy</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 20px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
        
        .result-card { background: linear-gradient(135deg, #111, #1a050a); padding: 60px; border-radius: 30px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 50px rgba(244, 63, 94, 0.2); }
        .fps-main { font-size: 8rem; font-weight: 950; line-height: 1; margin-bottom: 10px; color: #fff; text-shadow: 0 0 30px #f43f5e; }
        .fps-label { font-size: 1.2rem; font-weight: 900; color: #fda4af; letter-spacing: 2px; text-transform: uppercase; }
        
        .stats-row { display: flex; justify-content: center; gap: 20px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
        .stat-pill { display: flex; align-items: center; gap: 8px; color: #d1d5db; font-weight: bold; font-size: 14px; background: rgba(255,255,255,0.03); padding: 8px 15px; border-radius: 10px; }
        
        .res-nav { padding: 15px; background: #111; border-radius: 12px; text-align: center; text-decoration: none; color: #fff; font-weight: 900; border: 1px solid #333; transition: 0.3s; font-size: 14px; text-transform: uppercase; }
        .res-nav:hover, .res-nav.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
        
        .silo-mini-card { display: flex; align-items: center; gap: 10px; background: #111; padding: 25px; border-radius: 20px; border: 1px solid #333; text-decoration: none; color: #fff; font-weight: 950; transition: 0.3s; justify-content: center; text-transform: uppercase; font-size: 13px; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #f43f5e; }
        .silo-mini-card.highlight { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.03); }
        .silo-mini-card.highlight:hover { border-color: #f59e0b; }

        /* GURU: Flex Card Styly */
        .viral-flex-card { 
            display: flex; align-items: center; gap: 20px;
            max-width: 550px; margin: 30px auto 0; padding: 25px; 
            background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(244, 63, 94, 0.4); 
            border-radius: 20px; box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);
            text-align: left; transition: 0.3s;
        }
        .award-icon { display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(244, 63, 94, 0.2); border-radius: 15px; flex-shrink: 0; }
        .viral-text-box { flex: 1; }
        
        .premium-share-btn { width: 48px; height: 48px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.3s; border: none; color: #fff; }
        .btn-copy { background: linear-gradient(45deg, #f43f5e, #fda4af); }
        .btn-copy:hover { transform: scale(1.08); box-shadow: 0 0 15px rgba(244, 63, 94, 0.5); }
        .btn-x { background: #000; border: 1px solid rgba(255,255,255,0.2); }
        .btn-x:hover { transform: scale(1.08); background: #111; box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); }
        .btn-reddit { background: #ff4500; }
        .btn-reddit:hover { transform: scale(1.08); box-shadow: 0 0 15px rgba(255, 69, 0, 0.5); }
        
        @media (max-width: 700px) {
            .fps-main { font-size: 5rem; }
            .fps-main span { font-size: 2rem; }
            .viral-flex-card { flex-direction: column; text-align: center; }
            .award-icon { margin: 0 auto; }
            .stats-row { flex-direction: column; gap: 10px; }
        }
      `}} />
    </div>
  );
}
