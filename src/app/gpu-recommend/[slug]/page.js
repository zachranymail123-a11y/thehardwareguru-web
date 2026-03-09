import React, { cache } from 'react';
import { 
  Trophy, 
  Zap, 
  Gamepad2, 
  BarChart3, 
  TrendingUp, 
  ChevronRight, 
  Monitor, 
  DollarSign, 
  ShieldCheck,
  Star,
  Swords
} from 'lucide-react';

/**
 * GURU GPU RECOMMENDATION ENGINE V1.0
 * Cesta: src/app/gpu-recommend/[slug]/page.js
 * 🚀 SEO: Cílí na "Best GPU for [Game/Resolution/Budget]" dotazy.
 * 🛡️ LOGIC: Dynamický ranking Top 10 karet z DB na základě parametru slug.
 * 🛡️ DESIGN: Guru Supreme (Agresivní žebříček, neonové akcenty).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU: Agresivní slugify pro čisté URL
const slugify = (text) => {
    return text.toLowerCase().replace(/nvidia|amd|geforce|radeon|graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
};

// 🛡️ GURU DATA ENGINE: Načtení všech GPU s FPS daty
const getAllGpuData = cache(async () => {
    if (!supabaseUrl) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
});

// 🧠 GURU RANKING LOGIC
function getRanking(gpus, slug) {
    let sorted = [...gpus];
    let title = "";
    let desc = "";
    let icon = <Trophy />;
    let unit = "INDEX";

    // 🎮 CASE: Hry (Cyberpunk, Warzone, Starfield)
    if (slug.includes('cyberpunk') || slug.includes('warzone') || slug.includes('starfield')) {
        const gameKey = slug.includes('cyberpunk') ? 'cyberpunk_1440p' : (slug.includes('warzone') ? 'warzone_1440p' : 'starfield_1440p');
        sorted = sorted.sort((a, b) => {
            const fpsA = (Array.isArray(a.game_fps) ? a.game_fps[0]?.[gameKey] : a.game_fps?.[gameKey]) || 0;
            const fpsB = (Array.isArray(b.game_fps) ? b.game_fps[0]?.[gameKey] : b.game_fps?.[gameKey]) || 0;
            return fpsB - fpsA;
        });
        unit = "FPS";
        icon = <Gamepad2 />;
        title = slug.includes('cyberpunk') ? "Cyberpunk 2077" : (slug.includes('warzone') ? "Call of Duty: Warzone" : "Starfield");
    } 
    // 🖥️ CASE: Rozlišení (4K, 1440p)
    else if (slug.includes('4k') || slug.includes('1440p')) {
        sorted = sorted.sort((a, b) => (b.performance_index || 0) - (a.performance_index || 0));
        unit = "%";
        icon = <Monitor />;
        title = slug.includes('4k') ? "4K Ultra Gaming" : "1440p Performance";
    }
    // 💰 CASE: Rozpočet (Under 500)
    else if (slug.includes('under-500')) {
        sorted = sorted.filter(g => (g.release_price_usd || 0) <= 500 && (g.release_price_usd || 0) > 0)
                      .sort((a, b) => (b.performance_index || 0) - (a.performance_index || 0));
        unit = "%";
        icon = <DollarSign />;
        title = "Best Value (Under $500)";
    }
    // 🏆 DEFAULT: Global Power
    else {
        sorted = sorted.sort((a, b) => (b.performance_index || 0) - (a.performance_index || 0));
        unit = "%";
        title = "Gaming Performance";
    }

    return { top10: sorted.slice(0, 10), label: title, icon, unit };
}

export async function generateMetadata({ params }) {
    const { slug } = params;
    const gpus = await getAllGpuData();
    const { label } = getRanking(gpus, slug);
    const isEn = true; // Route je primárně v angličtině pro globální SEO

    return {
        title: `Best GPU for ${label} (2026 Ranking) | The Hardware Guru`,
        description: `See the best graphics cards for ${label} based on real technical benchmarks and FPS data. Compare performance, VRAM and value.`,
    };
}

export default async function GpuRecommendPage({ params }) {
    const { slug } = params;
    const gpus = await getAllGpuData();
    const { top10, label, icon, unit } = getRanking(gpus, slug);
    const isEn = true;

    // 🚀 SEO SCHEMA (JSON-LD)
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
            "@type": "Question",
            "name": `What is the best GPU for ${label}?`,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `According to our 2026 benchmark analysis, the ${top10[0]?.name || 'current high-end cards'} are the best choice for ${label} offering maximum performance.`
            }
        }]
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <a href="/gpuvs" className="guru-back-btn">
                        <ChevronLeft size={16} /> BACK TO ENGINE
                    </a>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102,252,241,0.05)' }}>
                        {icon} GURU RECOMMENDATION
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1' }}>
                        Best GPU for <br/>
                        <span style={{ color: '#66fcf1' }}>{label}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.2rem', marginTop: '20px', maxWidth: '700px', margin: '20px auto' }}>
                        Our data-driven ranking of the top 10 graphics cards based on real-world benchmarks and performance metrics.
                    </p>
                </header>

                {/* 🚀 RANKING TABLE */}
                <section style={{ marginBottom: '80px' }}>
                    <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(15px)' }}>
                        
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px', padding: '20px 30px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', fontWeight: '950', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            <div>Rank</div>
                            <div>Graphics Card</div>
                            <div style={{ textAlign: 'center' }}>{unit}</div>
                            <div style={{ textAlign: 'right' }}>Action</div>
                        </div>

                        {/* Ranking Rows */}
                        {top10.map((gpu, idx) => {
                            const val = unit === "FPS" 
                                ? ((Array.isArray(gpu.game_fps) ? gpu.game_fps[0]?.[slug.replace(/-/g, '_').replace('2077', '') + '_1440p'] : gpu.game_fps?.[slug.replace(/-/g, '_').replace('2077', '') + '_1440p']) || 0)
                                : (gpu.performance_index || 0);

                            return (
                                <div key={gpu.id} className="ranking-row" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px', padding: '25px 30px', borderBottom: idx === 9 ? 'none' : '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '950', color: idx === 0 ? '#eab308' : (idx === 1 ? '#94a3b8' : (idx === 2 ? '#b45309' : '#1f2937')) }}>
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <div style={{ color: gpu.vendor === 'NVIDIA' ? '#76b900' : '#ed1c24', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase' }}>{gpu.vendor} • {gpu.architecture}</div>
                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{gpu.name}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#66fcf1', fontWeight: '950', fontSize: '20px' }}>{val}{unit === "%" ? "%" : ""}</div>
                                        <div style={{ fontSize: '9px', color: '#4b5563', fontWeight: 'bold' }}>AVG {unit}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <a href={`/gpuvs/${slugify(gpu.name)}`} className="row-action-btn">
                                            <Zap size={14} fill="currentColor" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 🚀 SEO CONTENT BLOCKS */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                    <div className="content-card">
                        <h2 className="section-h2">Why these GPUs?</h2>
                        <p className="guru-p">Our ranking is based on a relative performance index where raw rasterization power and RayTracing capabilities are tested. We prioritize consistency and stability for <strong>{label}</strong>.</p>
                    </div>
                    <div className="content-card">
                        <h2 className="section-h2">Best Price/Performance</h2>
                        <p className="guru-p">While the top spot belongs to extreme hardware, cards like the <strong>{top10[3]?.name}</strong> often provide the best value for mid-range budgets in 2026.</p>
                    </div>
                </section>

                {/* 🚀 CROSS-LINK MATRIX */}
                <section style={{ textAlign: 'center', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: '#4b5563', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '30px' }}>Explore more Guru Categories</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
                        <a href="/gpu-recommend/4k-gaming" className="cat-pill">4K Gaming</a>
                        <a href="/gpu-recommend/cyberpunk-2077" className="cat-pill">Cyberpunk 2077</a>
                        <a href="/gpu-recommend/warzone" className="cat-pill">Warzone</a>
                        <a href="/gpu-recommend/best-gpu-under-500" className="cat-pill">Under $500</a>
                    </div>
                </section>

            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
                .ranking-row { transition: 0.2s; }
                .ranking-row:hover { background: rgba(102, 252, 241, 0.03); }
                .row-action-btn { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: rgba(255,0,85,0.1); color: #ff0055; border: 1px solid rgba(255,0,85,0.2); border-radius: 10px; transition: 0.3s; }
                .row-action-btn:hover { background: #ff0055; color: #fff; transform: scale(1.1); box-shadow: 0 0 15px rgba(255,0,85,0.4); }
                .section-h2 { font-size: 1.5rem; fontWeight: 950; color: #fff; text-transform: uppercase; margin-bottom: 15px; border-left: 4px solid #66fcf1; padding-left: 15px; }
                .guru-p { color: #9ca3af; font-size: 1rem; line-height: 1.6; }
                .content-card { background: rgba(15,17,21,0.6); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.03); }
                .cat-pill { padding: 10px 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 50px; color: #9ca3af; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; transition: 0.3s; }
                .cat-pill:hover { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: #66fcf1; }
                @media (max-width: 768px) { .ranking-row { grid-template-columns: 40px 1fr 80px !important; padding: 15px !important; } .ranking-row div:last-child { display: none; } }
            `}} />
        </div>
    );
}
