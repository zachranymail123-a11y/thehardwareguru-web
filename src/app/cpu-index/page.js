import React from 'react';
import Script from 'next/script';
import { 
  ChevronLeft, 
  Cpu, 
  Database, 
  Activity, 
  Swords,
  TrendingUp,
  Monitor, 
  Flame, 
  Info, 
  Calendar,
  Gamepad2,
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons';

/**
 * GURU CPU ENGINE - KATALOG PROCESORŮ V1.15 (MAX REVENUE UPDATE)
 * 🚀 CÍL: Inline nákupní triggery v kartách, fix query, vícenásobné CTA bloky a garantovaný tracking.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn ? 'CPU Database & Performance Index | The Hardware Guru' : 'Katalog Procesorů a Index Výkonu | The Hardware Guru',
    alternates: {
      canonical: 'https://thehardwareguru.cz/cpu-index',
      languages: { 'en': 'https://thehardwareguru.cz/en/cpu-index', 'cs': 'https://thehardwareguru.cz/cpu-index' }
    }
  };
}

const fetchIndexData = async () => {
    if (!supabaseUrl) return null;
    try {
        const url = `${supabaseUrl}/rest/v1/cpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        const res = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : null;
    } catch (e) { return null; }
};

const getRelatedCpuArticles = async () => {
    if (!supabaseUrl) return [];
    try {
        const url = `${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%ryzen%,title.ilike.%core%,type.eq.hardware)&order=created_at.desc&limit=3`;
        const res = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
};

export default async function CpuIndexPage(props) {
  const isEn = props?.isEn === true;
  const cpus = await fetchIndexData();
  const relatedArticles = await getRelatedCpuArticles();

  if (!cpus || cpus.length === 0) {
    return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CHYBA DATABÁZE</div>;
  }

  const amdCpus = cpus.filter(c => (c.vendor || '').toUpperCase() === 'AMD');
  const intelCpus = cpus.filter(c => (c.vendor || '').toUpperCase() === 'INTEL');

  const renderCpuCards = (cpuList, vendorColor) => {
    return cpuList.map((cpu, index) => {
      const isTopTier = index < 3 && cpu.performance_index > 0; 
      const safeSlug = cpu.slug || slugify(cpu.name);
      
      // 🔥 FIX: Search query s full name + "cena" pro Heureku
      const heurekaSearchQuery = `${cpu.name} cena`;
      const amazonSearchQuery = cpu.name;

      return (
        <div key={safeSlug} className="cpu-card-wrapper">
          <a href={isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`} className="cpu-card" style={{ borderTop: `4px solid ${isTopTier ? vendorColor : '#374151'}` }}>
            <div className="card-header">
              <h3>{normalizeName(cpu.name)}</h3>
              {isTopTier && <span className="top-badge" style={{ color: vendorColor, borderColor: vendorColor }}>TOP TIER</span>}
            </div>
            
            {/* 🔥 PSYCHOLOGIE: Doporučení u TOP modelů 🔥 */}
            {isTopTier && !isEn && (
              <div style={{ marginTop: '10px', fontSize: '10px', color: '#10b981', fontWeight: '900', textTransform: 'uppercase' }}>
                🔥 Nejlepší výkon / cena
              </div>
            )}

            <div className="card-specs">
              <div className="spec-item"><span className="spec-label">CORES</span><span className="spec-val">{cpu.cores || '-'}</span></div>
              <div className="spec-item"><span className="spec-label">THREADS</span><span className="spec-val">{cpu.threads || '-'}</span></div>
              <div className="spec-item"><span className="spec-label">INDEX</span><span className="spec-val" style={{ color: cpu.performance_index ? vendorColor : '#6b7280' }}>{cpu.performance_index || 'N/A'}</span></div>
            </div>
            <div className="card-actions">
              <div className="action-btn"><Activity size={14}/> {isEn ? 'Specs' : 'Detaily'}</div>
              <div className="action-btn" style={{ color: '#f59e0b' }}><Swords size={14}/> {isEn ? 'VS' : 'Srovnat'}</div>
            </div>

            {/* 🔥 FIX: INLINE NÁKUPNÍ TRIGGER PŘÍMO V KARTĚ (MAX MONEY) 🔥 */}
            <div style={{ marginTop: '15px' }}>
              {isEn ? (
                <div className="buy-btn" style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>
                  🔥 Check Price on Amazon
                </div>
              ) : (
                <div className="buy-btn" style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #0078d4)', color: '#fff', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>
                  🔥 Nejlevnější cena
                </div>
              )}
            </div>
          </a>

          {/* 🔥 SKUTEČNÝ AFFILIATE LINK PŘES KARTU 🔥 */}
          {!isEn && (
            <a 
              href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(heurekaSearchQuery)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`}
              className="heureka-hn-link card-overlay-link"
              data-trixam-positionid="276026"
              data-trixam-content="Text link"
              data-trixam-medium="affiliate"
              target="_blank"
              rel="nofollow sponsored"
              style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'pointer' }}
              aria-label="Koupit na Heurece"
            ></a>
          )}
          {isEn && (
            <a 
              href={`https://www.amazon.com/s?k=${encodeURIComponent(amazonSearchQuery)}&tag=thehardware07-20`}
              className="card-overlay-link"
              target="_blank"
              rel="nofollow sponsored"
              style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'pointer' }}
            ></a>
          )}
        </div>
      );
    });
  };

  return (
    <div className="guru-page-container" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* 🔥 POJISTKA: Zajištění trackování i pro přímé návštěvy 🔥 */}
      {!isEn && (
          <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />
      )}

      <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 25px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
            <Database size={16} /> GURU HARDWARE DATABASE
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CPU' : 'KATALOG'} <br/>
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>{isEn ? 'DATABASE' : 'PROCESORŮ'}</span>
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
            <a href={isEn ? "/en/cpuvs/ranking" : "/cpuvs/ranking"} className="quick-link-pill" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}><TrendingUp size={14} /> {isEn ? 'TIER LIST' : 'ŽEBŘÍČEK'}</a>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="quick-link-pill" style={{ borderColor: '#06b6d4', color: '#06b6d4' }}><Gamepad2 size={14} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="quick-link-pill" style={{ borderColor: '#a855f7', color: '#a855f7' }}><AlertTriangle size={14} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
          </div>
        </header>

        {/* 🔥 PRVNÍ HEUREKA WIDGET 🔥 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
            <HeurekaButtons isEn={isEn} />
        </div>

        {amdCpus.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#ed1c24' }}><span style={{ color: '#ed1c24' }}>AMD</span> RYZEN</h2>
            <div className="cpu-grid">{renderCpuCards(amdCpus, '#ed1c24')}</div>
          </section>
        )}

        {/* 🔥 FIX: DRUHÁ MONETIZAČNÍ VRSTVA MEZI AMD A INTEL 🔥 */}
        {!isEn && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}>
            <HeurekaButtons isEn={false} />
          </div>
        )}

        {intelCpus.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#0071c5' }}><span style={{ color: '#0071c5' }}>INTEL</span> CORE</h2>
            <div className="cpu-grid">{renderCpuCards(intelCpus, '#0071c5')}</div>
          </section>
        )}

        {relatedArticles.length > 0 && (
            <section className="related-articles-section" style={{ marginBottom: '80px', background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="news-h2" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #f59e0b', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Info size={28} color="#f59e0b" /> {isEn ? 'CPU NEWS & REVIEWS' : 'NOVINKY A RECENZE CPU'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {relatedArticles.map((art) => (
                        <a key={art.slug} href={isEn ? `/en/clanky/${art.slug_en || art.slug}` : `/clanky/${art.slug}`} className="related-article-card">
                            <div className="related-article-img-wrapper"><img src={art.image_url} alt={art.title} loading="lazy" /></div>
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
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#66fcf1' }}>
                <div className="silo-banner-icon" style={{ color: '#66fcf1', background: '#66fcf120' }}><Monitor size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'GPU DATABASE' : 'KATALOG GRAFIK'}</h4>
                    <p>{isEn ? 'Compare gaming graphics cards performance.' : 'Srovnej výkon všech herních grafických karet.'}</p>
                </div>
            </a>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="silo-banner-card" style={{ borderLeftColor: '#f97316' }}>
                <div className="silo-banner-icon" style={{ color: '#f97316', background: '#f9731620' }}><Flame size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'BEST GAME DEALS' : 'NEJLEPŠÍ CENY HER'}</h4>
                    <p>{isEn ? 'Get latest games with Guru discount.' : 'Kupuj nejnovější pecky s Guru slevou.'}</p>
                </div>
            </a>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
          <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .vendor-h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid; padding-left: 15px; display: flex; align-items: center; gap: 15px; }
        .cpu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .cpu-card-wrapper { position: relative; transition: transform 0.3s ease; }
        .cpu-card-wrapper:hover { transform: translateY(-5px); }
        .cpu-card-wrapper:hover .buy-btn { transform: scale(1.05); filter: brightness(1.1); }

        .cpu-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; padding: 25px; height: 100%; box-sizing: border-box; }
        .card-header h3 { margin: 0 0 5px 0; font-size: 1.3rem; font-weight: 950; text-transform: uppercase; }
        .top-badge { font-size: 9px; font-weight: 950; padding: 3px 8px; border: 1px solid; border-radius: 50px; display: inline-block; }
        .card-specs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .spec-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .spec-label { font-size: 8px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
        .spec-val { font-size: 13px; font-weight: 900; color: #9ca3af; }
        .card-actions { display: flex; justify-content: space-between; margin-top: 15px; }
        .action-btn { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; }
        .buy-btn { transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }

        .quick-link-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 50px; font-weight: 950; font-size: 11px; text-transform: uppercase; text-decoration: none; border: 1px solid; background: rgba(255,255,255,0.02); transition: 0.3s; }
        .quick-link-pill:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; border-left-width: 5px; }
        .related-article-card { display: flex; flex-direction: column; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; text-decoration: none; transition: 0.3s; }
        .related-article-img-wrapper { height: 140px; overflow: hidden; }
        .related-article-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .related-content { padding: 20px; }
        .related-title { margin: 10px 0 0 0; font-size: 1rem; font-weight: 950; color: #fff; line-height: 1.3; }

        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }

        @media (max-width: 768px) { 
            .guru-page-container { padding-top: 80px !important; }
            .main-title { font-size: 1.8rem !important; }
            .vendor-h2 { font-size: 1.5rem !important; }
            .cpu-grid { grid-template-columns: 1fr !important; }
            .silo-banner-card { flex-direction: column; text-align: center; } 
        }
      `}} />
    </div>
  );
}
