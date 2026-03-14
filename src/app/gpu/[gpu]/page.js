import React from 'react';
import { 
  ChevronLeft, Monitor, Database, Gamepad2, ArrowRight, ExternalLink, 
  Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Info
} from 'lucide-react';

/**
 * GURU GPU ENGINE - DETAIL GRAFIKY V2.0 (SEMANTIC SEO FINAL)
 * Cesta: src/app/gpu/[gpu]/page.js
 * 🚀 CÍL: Sémantické klastrování - propojení profilu karty s relevantními články z DB.
 * 🛡️ FIX 1: getRelatedArticles nyní prohledává title i title_en.
 * 🛡️ FIX 2: Nejsilnější fallback - pokud není shoda, VŽDY vytáhne 3 nejnovější zprávy.
 * 🛡️ FIX 3: Striktní Next.js 15 compliance (await props.params).
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🛡️ GURU ENGINE: Sémantické články (Thematic Clustering)
const getRelatedArticles = async (gpuName) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const name = normalizeName(gpuName || '');

    try {
        // 1. POKUS: Najít články, které mají název karty v titulku (CZ i EN)
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%${encodeURIComponent(name)}%,title_en.ilike.%${encodeURIComponent(name)}%)&order=created_at.desc&limit=3`, {
            headers, cache: 'force-cache'
        });
        const data = await res.json();

        // 2. POKUS: Pokud nic, vezmeme prostě 3 nejnovější (Zlatý standard)
        if (!data || data.length === 0) {
            const resLatest = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&order=created_at.desc&limit=3`, {
                headers, cache: 'force-cache'
            });
            const latestData = await resLatest.json();
            return Array.isArray(latestData) ? latestData : [];
        }
        return data;
    } catch (e) { 
        console.error("Related articles error:", e);
        return []; 
    }
};

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug || gpuSlug === 'undefined') return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      const clean = gpuSlug.replace(/-/g, " ").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'force-cache' });
          if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = props?.isEn || rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const canonicalUrl = `${baseUrl}/gpu/${safeSlug}`;

  return {
    title: isEn 
      ? `${gpu.name} Specs & Performance | The Hardware Guru`
      : `${gpu.name} Specifikace a Výkon | The Hardware Guru`,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'en': `${baseUrl}/en/gpu/${safeSlug}`, 'cs': canonicalUrl, 'x-default': canonicalUrl }
    }
  };
}

export default async function GpuDetailPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = props?.isEn || rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return <div style={{ color: '#ef4444', textAlign: 'center', padding: '100px', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GPU NENALEZENO</div>;

  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  // 🚀 GURU: Načtení sémantických článků
  const relatedArticles = await getRelatedArticles(gpu.name);

  const productSchema = {
    "@context": "https://schema.org", "@type": "Product", "name": normalizeName(gpu.name), "image": `${baseUrl}/logo.png`,
    "brand": { "@type": "Brand", "name": gpu.vendor || "Hardware" }, "sku": safeSlug, "url": `${baseUrl}/${isEn ? 'en/' : ''}gpu/${safeSlug}`,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.8, "reviewCount": 124 },
    "offers": { "@type": "Offer", "priceCurrency": "USD", "price": gpu.release_price_usd || 499, "availability": "https://schema.org/InStock", "url": `${baseUrl}/${isEn ? 'en/' : ''}gpu/${safeSlug}` }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO RANKING' : 'ZPĚT DO ŽEBŘÍČKU'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Monitor size={16} /> {isEn ? 'GPU PROFILE' : 'PROFIL GRAFIKY'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{gpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        {/* 🛒 AFFILIATE BUTTONS */}
        {(gpu.buy_link_cz || gpu.buy_link_en) && (
            <section style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {!isEn && gpu.buy_link_cz && (
                    <a href={gpu.buy_link_cz} target="_blank" rel="nofollow sponsored" className="btn-buy alza">
                        <ShoppingCart size={20} /> ZKONTROLOVAT CENU NA ALZA.CZ
                    </a>
                )}
                {isEn && gpu.buy_link_en && (
                    <a href={gpu.buy_link_en} target="_blank" rel="nofollow sponsored" className="btn-buy amazon">
                        <ShoppingCart size={20} /> CHECK PRICE ON AMAZON
                    </a>
                )}
            </section>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card"><div className="label">VRAM</div><div className="val">{gpu.vram_gb || '-'} GB</div></div>
            <div className="stat-card"><div className="label">TDP</div><div className="val">{gpu.tdp_w || '-'} W</div></div>
            <div className="stat-card"><div className="label">PERFORMANCE</div><div className="val">{gpu.performance_index || '-'} PTS</div></div>
        </section>

        {/* 🚀 GURU: SÉMANTICKÉ PROPOJENÍ (ČLÁNKY O TÉTO KARTĚ NEBO NEJNOVĚJŠÍ) */}
        {relatedArticles.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <h2 className="section-h2" style={{ borderLeftColor: '#a855f7' }}>
                    <Info size={28} color="#a855f7" style={{ display: 'inline', marginRight: '10px' }} /> 
                    {isEn ? 'GURU INSIGHTS & NEWS' : 'GURU RÁDCE A NOVINKY'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {relatedArticles.map((art) => (
                        <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} className="related-card-style">
                            <div className="related-img-box">
                                <img src={art.image_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000'} alt={art.title} loading="lazy" />
                            </div>
                            <div className="related-content-box">
                                <span className="related-tag">{isEn ? 'TECH NEWS' : 'HW NOVINKA'}</span>
                                <h3 className="related-title-text">{isEn && art.title_en ? art.title_en : art.title}</h3>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color={vendorColor} />
                  <div>
                      <h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3>
                      <p>{isEn ? 'Full technical specifications and benchmarks.' : 'Kompletní specifikace a testy.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
              <a href={isEn ? `/en/gpu-recommend/${safeSlug}` : `/en/gpu-recommend/${safeSlug}`} className="deep-link-card">
                  <CheckCircle2 size={32} color="#10b981" />
                  <div>
                      <h3>{isEn ? 'Guru Verdict' : 'Guru Verdikt'}</h3>
                      <p>{isEn ? 'Is it worth buying in 2025?' : 'Vyplatí se koupit v roce 2025?'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
          </div>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; }
        .label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .val { font-size: 32px; font-weight: 950; }

        .btn-buy { display: flex; align-items: center; gap: 12px; padding: 18px 35px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; font-size: 14px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .btn-buy.alza { background: #004996; color: #fff; border: 1px solid #0059b3; }
        .btn-buy.amazon { background: #ff9900; color: #000; border: 1px solid #ffb340; }
        .btn-buy:hover { transform: translateY(-3px); filter: brightness(1.1); }

        .related-card-style { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; text-decoration: none; transition: 0.3s; }
        .related-card-style:hover { transform: translateY(-5px); border-color: #a855f7; }
        .related-img-box { height: 160px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .related-img-box img { width: 100%; height: 100%; object-fit: cover; }
        .related-content-box { padding: 20px; }
        .related-tag { color: #a855f7; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 10px; }
        .related-title-text { color: #fff; font-size: 1.1rem; font-weight: 950; margin: 0; line-height: 1.3; }

        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; }
        .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
        .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.85rem; line-height: 1.4; }
        .deep-link-card .link-arrow { position: absolute; right: 25px; color: #4b5563; }
        .deep-link-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
      `}} />
    </div>
  );
}
