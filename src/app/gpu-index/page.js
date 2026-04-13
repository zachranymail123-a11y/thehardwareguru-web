import React from 'react';
import { 
 ChevronLeft, 
 Database, 
 Activity, 
 Swords,
 TrendingUp,
 Cpu,
 Flame,
 Info, 
 Calendar,
 Gamepad2,
 AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
// 🔥 PŘIDÁNO: Naše chytrá komponenta
import GuruInContentOffer from '../../components/GuruInContentOffer'; 

/**
 * GURU GPU ENGINE - KATALOG GRAFIK V3 (CLEAN & SMART)
 * 🚀 CÍL: Odstranění starého kódu, nasazení GuruInContentOffer, V10 Heureka.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

export async function generateMetadata(props) {
 const isEn = props?.isEn === true;
 return {
   title: isEn ? 'GPU Database & Performance Index | The Hardware Guru' : 'Katalog Grafických Karet a Index Výkonu | The Hardware Guru',
   alternates: {
     canonical: 'https://thehardwareguru.cz/gpu-index',
     languages: { 'en': 'https://thehardwareguru.cz/en/gpu-index', 'cs': 'https://thehardwareguru.cz/gpu-index' }
   }
 };
}

const fetchIndexData = async () => {
    if (!supabaseUrl) return null;
    try {
        const url = `${supabaseUrl}/rest/v1/gpus?select=name,slug,vendor,vram_gb,memory_bus,performance_index&order=performance_index.desc.nullslast,name.asc`;
        const res = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : null;
    } catch (e) { return null; }
};

const getRelatedGpuArticles = async () => {
    if (!supabaseUrl) return [];
    try {
        const url = `${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%geforce%,title.ilike.%radeon%,type.eq.hardware)&order=created_at.desc&limit=3`;
        const res = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
};

export default async function GpuIndexPage(props) {
 const isEn = props?.isEn === true;
 const gpus = await fetchIndexData();
 const relatedArticles = await getRelatedGpuArticles();

 if (!gpus || gpus.length === 0) {
   return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh', fontWeight: '950' }}>CHYBA NAČÍTÁNÍ DATABÁZE</div>;
 }

 const nvidiaGpus = gpus.filter(g => (g.vendor || '').toUpperCase() === 'NVIDIA');
 const amdGpus = gpus.filter(g => (g.vendor || '').toUpperCase() === 'AMD');

 const renderGpuCards = (gpuList, vendorColor) => {
   return gpuList.map((gpu, index) => {
     const isTopTier = index < 3 && gpu.performance_index > 0; 
     const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
     return (
       <a key={safeSlug} href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="gpu-card" style={{ borderTop: `4px solid ${isTopTier ? vendorColor : '#374151'}` }}>
         <div className="card-header">
           <h3 style={{ color: isTopTier ? '#fff' : '#d1d5db' }}>{normalizeName(gpu.name)}</h3>
           {isTopTier && <span className="top-badge" style={{ color: vendorColor, borderColor: vendorColor }}>TOP TIER</span>}
         </div>
         <div className="card-specs">
           <div className="spec-item"><span className="spec-label">VRAM</span><span className="spec-val">{gpu.vram_gb ? `${gpu.vram_gb} GB` : '-'}</span></div>
           <div className="spec-item"><span className="spec-label">BUS</span><span className="spec-val">{gpu.memory_bus || '-'}</span></div>
           <div className="spec-item"><span className="spec-label">INDEX</span><span className="spec-val" style={{ color: gpu.performance_index ? vendorColor : '#6b7280' }}>{gpu.performance_index || '-'}</span></div>
         </div>
         <div className="card-actions">
           <div className="action-btn"><Activity size={14}/> {isEn ? 'Specs' : 'Detaily'}</div>
           <div className="action-btn" style={{ color: vendorColor }}><Swords size={14}/> {isEn ? 'VS Engine' : 'Srovnat'}</div>
         </div>
       </a>
     );
   });
 };

 return (
   <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
     
     <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
       <div style={{ marginBottom: '30px' }}>
         <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="guru-back-btn">
           <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
         </a>
       </div>

       <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
           <div className="ad-desktop-wrapper">
               <SeznamAd zoneId={408654} width={970} height={210} />
           </div>
           <div className="ad-mobile-wrapper">
               <SeznamAd zoneId={408651} width={300} height={250} />
           </div>
       </div>

       <header style={{ textAlign: 'center', marginBottom: '40px' }}>
         <div className="guru-badge">
           <Database size={16} /> GURU HARDWARE DATABASE
         </div>
         <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
           {isEn ? 'GPU' : 'KATALOG'} <br/>
           <span style={{ color: '#66fcf1', textShadow: '0 0 30px rgba(102, 252, 241, 0.5)' }}>{isEn ? 'DATABASE' : 'GRAFIK'}</span>
         </h1>

         <div className="quick-links-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
           <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="quick-link-pill" style={{ borderColor: '#ff0055', color: '#ff0055' }}><TrendingUp size={14} /> {isEn ? 'TIER LIST' : 'ŽEBŘÍČEK'}</a>
           <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="quick-link-pill" style={{ borderColor: '#a855f7', color: '#a855f7' }}><Gamepad2 size={14} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
           <a href={isEn ? "/en/bottleneck" : "/bottleneck"} className="quick-link-pill" style={{ borderColor: '#66fcf1', color: '#66fcf1' }}><Activity size={14} /> {isEn ? 'BOTTLENECK' : 'BOTTLENECK'}</a>
         </div>
       </header>

       {/* 🔥 GURU INTELIGENTNÍ DOPORUČENÍ (MÍSTO STARÝCH TLAČÍTEK) 🔥 */}
       <div style={{ marginBottom: '50px' }}>
           <GuruInContentOffer 
               productName="NVIDIA GeForce RTX 5070 Ti" 
               category="gpu" 
               reason="winner"
               isEn={isEn}
               subId="gpu-index-premium"
           />
       </div>

       {nvidiaGpus.length > 0 && (
         <section style={{ marginBottom: '60px' }}>
           <h2 className="vendor-h2" style={{ borderLeftColor: '#76b900' }}><span style={{ color: '#76b900' }}>NVIDIA</span> GEFORCE</h2>
           <div className="gpu-grid">{renderGpuCards(nvidiaGpus, '#76b900')}</div>
         </section>
       )}

       {amdGpus.length > 0 && (
         <section style={{ marginBottom: '80px' }}>
           <h2 className="vendor-h2" style={{ borderLeftColor: '#ed1c24' }}><span style={{ color: '#ed1c24' }}>AMD</span> RADEON</h2>
           <div className="gpu-grid">{renderGpuCards(amdGpus, '#ed1c24')}</div>
         </section>
       )}

       <div className="promo-banner-row" style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '60px' }}>
           <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="silo-banner-card" style={{ borderLeftColor: '#a855f7', background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(15, 17, 21, 0.95) 100%)' }}>
               <div className="silo-banner-icon" style={{ color: '#a855f7', background: '#a855f720' }}><Gamepad2 size={28} /></div>
               <div className="silo-banner-text">
                   <h4>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h4>
                   <p>{isEn ? 'Calculate exact FPS for any hardware.' : 'Spočítej si přesná FPS pro svůj hardware.'}</p>
               </div>
           </a>
       </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '60px', marginBottom: '60px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <Gamepad2 size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span>
            </a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <AlertTriangle size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span>
            </a>
        </div>

       {relatedArticles.length > 0 && (
           <section className="related-section" style={{ marginBottom: '80px', background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h2 className="news-h2" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #66fcf1', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <Info size={28} color="#66fcf1" /> {isEn ? 'LATEST HARDWARE NEWS' : 'NEJNOVĚJŠÍ HW NOVINKY'}
               </h2>
               <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                   {relatedArticles.map((art) => (
                       <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} className="related-article-card">
                           <div className="related-img-wrapper"><img src={art.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000'} alt={art.title} loading="lazy" /></div>
                           <div className="related-content">
                               <div className="related-date"><Calendar size={12} /> {new Date(art.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</div>
                               <h3 className="related-title">{isEn && art.title_en ? art.title_en : art.title}</h3>
                           </div>
                       </a>
                   ))}
               </div>
           </section>
       )}

       <div className="footer-silo-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
           <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#f59e0b' }}>
               <div className="silo-banner-icon" style={{ color: '#f59e0b', background: '#f59e0b20' }}><Cpu size={28} /></div>
               <div className="silo-banner-text">
                   <h4>{isEn ? 'CPU DATABASE' : 'KATALOG PROCESORŮ'}</h4>
                   <p>{isEn ? 'Browse all processors.' : 'Prohlédni si všechny procesory.'}</p>
               </div>
           </a>
           <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="silo-banner-card" style={{ borderLeftColor: '#f97316' }}>
               <div className="silo-banner-icon" style={{ color: '#f97316', background: '#f9731620' }}><Flame size={28} /></div>
               <div className="silo-banner-text">
                   <h4>{isEn ? 'BEST GAME DEALS' : 'NEJLEPŠÍ CENY HER'}</h4>
                   <p>{isEn ? 'Hottest sales right now.' : 'Omrkni nejlepší slevy na hry.'}</p>
               </div>
           </a>
       </div>
     </main>

     <div className="sticky-bottom-anchor">
         <div className="ad-desktop-wrapper">
             <SeznamAd zoneId={408654} width={970} height={90} />
         </div>
         <div className="ad-mobile-wrapper">
             <SeznamAd zoneId={408651} width={300} height={100} />
         </div>
     </div>

     <style dangerouslySetInnerHTML={{__html: `
       .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); margin-bottom: 20px; }
       .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
       
       .vendor-h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid; padding-left: 15px; display: flex; align-items: center; gap: 15px; }
       .gpu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
       .gpu-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; padding: 25px; transition: 0.3s; }
       .gpu-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.1); }
       .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; min-height: 50px; }
       .card-header h3 { margin: 0; font-size: 1.3rem; font-weight: 950; text-transform: uppercase; line-height: 1.2; }
       .top-badge { font-size: 9px; font-weight: 950; padding: 3px 8px; border: 1px solid; border-radius: 50px; }
       .card-specs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
       .spec-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
       .spec-label { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
       .spec-val { font-size: 14px; font-weight: 900; color: #9ca3af; }
       .card-actions { display: flex; justify-content: space-between; gap: 10px; }
       .action-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase; }
       .quick-link-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 50px; font-weight: 950; font-size: 11px; text-transform: uppercase; text-decoration: none; border: 1px solid; background: rgba(255,255,255,0.02); transition: 0.3s; }
       .quick-link-pill:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }

       .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; border-left-width: 5px; }
       .silo-banner-card:hover { transform: translateY(-5px); }
       .silo-banner-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
       .silo-banner-text h4 { margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; font-weight: 950; }
       .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.9rem; }
       .related-article-card { display: flex; flex-direction: column; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; text-decoration: none; transition: 0.3s; }
       .related-article-card:hover { transform: translateY(-5px); border-color: rgba(102, 252, 241, 0.4); }
       .related-img-wrapper { height: 140px; overflow: hidden; }
       .related-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
       .related-content { padding: 20px; }
       .related-date { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
       .related-title { margin: 0; font-size: 1.1rem; font-weight: 950; color: #fff; line-height: 1.3; }

       .sticky-bottom-anchor {
           position: fixed;
           bottom: 0;
           left: 0;
           width: 100%;
           background: rgba(10, 11, 13, 0.98);
           border-top: 1px solid rgba(255, 255, 255, 0.1);
           z-index: 9999;
           padding: 10px 0;
           display: flex;
           justify-content: center;
           box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
       }

       .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
       .ad-mobile-wrapper { display: none; width: 100%; }

       @media (max-width: 768px) {
           .guru-page-wrapper { padding-top: 80px !important; }
           .inner-container { padding: 0 15px !important; }
           .ad-desktop-wrapper { display: none !important; }
           .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
           .main-title { font-size: 1.8rem !important; }
           .vendor-h2 { font-size: 1.5rem !important; margin-bottom: 20px; }
           .gpu-grid { grid-template-columns: 1fr !important; gap: 15px; }
           .gpu-card { padding: 15px !important; }
           .card-header h3 { font-size: 1.1rem; }
           .related-section { padding: 20px !important; border-radius: 20px !important; }
           .news-h2 { font-size: 1.4rem !important; }
           .silo-banner-card { flex-direction: column; text-align: center; min-width: 100%; }
           .quick-links-row { gap: 10px !important; }
           .quick-link-pill { width: 100%; justify-content: center; }
       }
     `}} />
   </div>
 );
}
