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
import GuruInContentOffer from '../../components/GuruInContentOffer'; 

/**
 * GURU GPU ENGINE - KATALOG GRAFIK V3.1 (SEO & EN FIX)
 * 🚀 CÍL: Implementace Google Golden Rich a oprava EN routování.
 */

export const runtime = 'nodejs';
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

export async function generateMetadata(props) {
 const isEn = props?.isEnProxy === true;
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
            next: { revalidate: 3600 }
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
            next: { revalidate: 3600 }
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
};

export default async function GpuIndexPage(props) {
 const isEn = props?.isEnProxy === true;
 const gpus = await fetchIndexData();
 const relatedArticles = await getRelatedGpuArticles();

 if (!gpus || gpus.length === 0) {
   return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh', fontWeight: '950' }}>CHYBA NAČÍTÁNÍ DATABÁZE</div>;
 }

 // Google Golden Rich (Structured Data)
 const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": isEn ? "GPU Database" : "Katalog grafických karet",
    "description": isEn ? "Full GPU performance index and specifications." : "Kompletní index výkonu a specifikace grafických karet.",
    "url": `https://thehardwareguru.cz${isEn ? '/en' : ''}/gpu-index`,
    "mainEntity": {
        "@type": "ItemList",
        "itemListElement": gpus.slice(0, 10).map((gpu, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": gpu.name
        }))
    }
 };

 const nvidiaGpus = gpus.filter(g => (g.vendor || '').toUpperCase() === 'NVIDIA');
 const amdGpus = gpus.filter(g => (g.vendor || '').toUpperCase() === 'AMD');

 const renderGpuCards = (gpuList, vendorColor) => {
   return gpuList.map((gpu, index) => {
     const isTopTier = index < 3 && (gpu.performance_index || 0) > 0; 
     const safeSlug = gpu.slug || slugify(gpu.name);
     return (
       <a key={safeSlug} href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="gpu-card" style={{ borderTop: `4px solid ${isTopTier ? vendorColor : '#374151'}`, textDecoration: 'none' }}>
         <div className="card-header">
           <h3 style={{ color: isTopTier ? '#fff' : '#d1d5db', margin: 0, fontSize: '1.2rem', fontWeight: '950' }}>{normalizeName(gpu.name)}</h3>
           {isTopTier && <span className="top-badge" style={{ color: vendorColor, borderColor: vendorColor, fontSize: '9px', padding: '2px 8px', border: '1px solid', borderRadius: '50px', fontWeight: '950' }}>TOP TIER</span>}
         </div>
         <div className="card-specs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '20px 0', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <div className="spec-item" style={{ textAlign: 'center' }}><span style={{ display: 'block', fontSize: '9px', color: '#6b7280', fontWeight: '950' }}>VRAM</span><span style={{ fontSize: '13px', fontWeight: '900', color: '#9ca3af' }}>{gpu.vram_gb ? `${gpu.vram_gb}GB` : '-'}</span></div>
           <div className="spec-item" style={{ textAlign: 'center' }}><span style={{ display: 'block', fontSize: '9px', color: '#6b7280', fontWeight: '950' }}>BUS</span><span style={{ fontSize: '13px', fontWeight: '900', color: '#9ca3af' }}>{gpu.memory_bus || '-'}</span></div>
           <div className="spec-item" style={{ textAlign: 'center' }}><span style={{ display: 'block', fontSize: '9px', color: '#6b7280', fontWeight: '950' }}>INDEX</span><span style={{ fontSize: '13px', fontWeight: '900', color: gpu.performance_index ? vendorColor : '#6b7280' }}>{gpu.performance_index || '-'}</span></div>
         </div>
         <div className="card-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ fontSize: '11px', fontWeight: '900', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}><Activity size={14}/> {isEn ? 'SPECS' : 'DETAILY'}</span>
           <span style={{ fontSize: '11px', fontWeight: '900', color: vendorColor, display: 'flex', alignItems: 'center', gap: '5px' }}><Swords size={14}/> {isEn ? 'BENCH' : 'TESTY'}</span>
         </div>
       </a>
     );
   });
 };

 return (
   <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
     <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
     
     <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
       <div style={{ marginBottom: '30px' }}>
         <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#66fcf1', padding: '12px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase' }}>
           <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
         </a>
       </div>

       <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
       </div>

       <header style={{ textAlign: 'center', marginBottom: '40px' }}>
         <div className="guru-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
           <Database size={16} /> GURU HARDWARE DATABASE
         </div>
         <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
           {isEn ? 'GPU' : 'KATALOG'} <br/>
           <span style={{ color: '#66fcf1', textShadow: '0 0 30px rgba(102, 252, 241, 0.5)' }}>{isEn ? 'DATABASE' : 'GRAFIK'}</span>
         </h1>

         <div className="quick-links-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
           <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="quick-link-pill" style={{ borderColor: '#ff0055', color: '#ff0055' }}><TrendingUp size={14} /> {isEn ? 'TIER LIST' : 'ŽEBŘÍČEK'}</a>
           <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="quick-link-pill" style={{ borderColor: '#a855f7', color: '#a855f7' }}><Gamepad2 size={14} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
           <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="quick-link-pill" style={{ borderColor: '#66fcf1', color: '#66fcf1' }}><Activity size={14} /> {isEn ? 'BOTTLENECK' : 'BOTTLENECK'}</a>
         </div>
       </header>

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
           <h2 className="vendor-h2" style={{ borderLeft: '5px solid #76b900', paddingLeft: '15px', fontWeight: '950', fontSize: '2rem', marginBottom: '30px' }}><span style={{ color: '#76b900' }}>NVIDIA</span> GEFORCE</h2>
           <div className="gpu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>{renderGpuCards(nvidiaGpus, '#76b900')}</div>
         </section>
       )}

       {amdGpus.length > 0 && (
         <section style={{ marginBottom: '80px' }}>
           <h2 className="vendor-h2" style={{ borderLeft: '5px solid #ed1c24', paddingLeft: '15px', fontWeight: '950', fontSize: '2rem', marginBottom: '30px' }}><span style={{ color: '#ed1c24' }}>AMD</span> RADEON</h2>
           <div className="gpu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>{renderGpuCards(amdGpus, '#ed1c24')}</div>
         </section>
       )}

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
                       <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} style={{ textDecoration: 'none' }}>
                           <div className="related-article-card" style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                               <img src={art.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000'} alt={art.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                               <div style={{ padding: '20px' }}>
                                   <div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', marginBottom: '5px' }}>{new Date(art.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</div>
                                   <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '950', color: '#fff' }}>{isEn && art.title_en ? art.title_en : art.title}</h3>
                               </div>
                           </div>
                       </a>
                   ))}
               </div>
           </section>
       )}
     </main>

     <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
         <SeznamAd zoneId={408654} width={970} height={90} />
     </div>

     <style dangerouslySetInnerHTML={{__html: `
        .gpu-card { background: rgba(15, 17, 21, 0.95); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); padding: 25px; transition: 0.3s; display: flex; flex-direction: column; }
        .gpu-card:hover { transform: translateY(-5px); border-color: #66fcf140; }
        .quick-link-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 50px; font-weight: 950; font-size: 11px; text-transform: uppercase; text-decoration: none; border: 1px solid; background: rgba(255,255,255,0.02); transition: 0.3s; }
        .ad-mobile-wrapper { display: none; }
        @media (max-width: 768px) {
            .ad-desktop-wrapper { display: none; }
            .ad-mobile-wrapper { display: flex; }
        }
     `}} />
   </div>
 );
}
