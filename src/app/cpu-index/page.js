import React from 'react';
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
  Calendar
} from 'lucide-react';

/**
 * GURU CPU ENGINE - KATALOG PROCESORŮ V1.4 (NATIVE FETCH + SEO SILOING FIX)
 * Cesta: src/app/cpu-index/page.js
 * 🛡️ FIX 1: Supabase klient kompletně odstraněn, nahrazen nativním fetchem (stejně jako v rankingu).
 * 🛡️ FIX 2: Využívá select=* a order=performance_index.desc.nullslast, takže nikdy nespadne na chybějícím sloupci.
 * 🛡️ FIX 3: Odstraněna mrtvá cache (revalidate 0, force-dynamic).
 * 🛡️ FIX 4: Přidáno masivní SEO prolinkování (Siloing) - Quick Links, Nejnovější články a odkaz na GPU Katalog.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn 
      ? 'CPU Database & Performance Index | The Hardware Guru' 
      : 'Katalog Procesorů a Index Výkonu | The Hardware Guru',
    description: isEn
      ? 'Complete database of AMD and Intel processors. Detailed specs, benchmarks, and performance hierarchy.'
      : 'Kompletní databáze procesorů AMD a Intel. Detailní specifikace, benchmarky a hierarchie výkonu.',
    alternates: {
      canonical: 'https://thehardwareguru.cz/cpu-index',
      languages: {
        'en': 'https://thehardwareguru.cz/en/cpu-index',
        'cs': 'https://thehardwareguru.cz/cpu-index',
        'x-default': 'https://thehardwareguru.cz/cpu-index'
      }
    }
  };
}

// 🚀 GURU: Nativní fetch vytáhne 100% fresh data ze Supabase a ignoruje neexistující sloupce
const fetchIndexData = async () => {
    if (!supabaseUrl) return null;
    
    try {
        const url = `${supabaseUrl}/rest/v1/cpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        
        const res = await fetch(url, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error("DB Fetch Error:", await res.text());
            return null;
        }
        return await res.json();
    } catch (e) {
        console.error("Fetch Exception:", e);
        return null;
    }
};

// 🚀 GURU SEO SILOING: Získání sémanticky souvisejících článků (recenze procesorů)
const getRelatedCpuArticles = async () => {
    if (!supabaseUrl) return [];
    try {
        // Hledáme články, které obsahují slovo 'ryzen' nebo 'core' v titulku, popř. jsou z kategorie hardware
        const url = `${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%ryzen%,title.ilike.%core%,type.eq.hardware)&order=created_at.desc&limit=3`;
        const res = await fetch(url, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        
        if (res.ok) return await res.json();
        return [];
    } catch (e) { 
        return []; 
    }
};

export default async function CpuIndexPage(props) {
  const isEn = props?.isEn === true;
  const cpus = await fetchIndexData();
  const relatedArticles = await getRelatedCpuArticles();

  if (!cpus || cpus.length === 0) {
    return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh', fontWeight: '950', fontSize: '20px' }}>CHYBA NAČÍTÁNÍ DATABÁZE PROCESORŮ</div>;
  }

  // 2. Rozdělení na vendory pro vizuální bloky
  const amdCpus = cpus.filter(c => (c.vendor || '').toUpperCase() === 'AMD');
  const intelCpus = cpus.filter(c => (c.vendor || '').toUpperCase() === 'INTEL');

  // Helper pro renderování karet
  const renderCpuCards = (cpuList, vendorColor) => {
    return cpuList.map((cpu, index) => {
      // Zvýrazníme první 3, pokud mají skutečný výkon
      const isTopTier = index < 3 && cpu.performance_index > 0; 
      const safeSlug = cpu.slug || slugify(cpu.name);
      
      return (
        <a 
          key={safeSlug} 
          href={isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`} 
          className="cpu-card"
          style={{ borderTop: `4px solid ${isTopTier ? vendorColor : '#374151'}` }}
        >
          <div className="card-header">
            <h3 style={{ color: isTopTier ? '#fff' : '#d1d5db' }}>{normalizeName(cpu.name)}</h3>
            {isTopTier && <span className="top-badge" style={{ color: vendorColor, borderColor: vendorColor }}>TOP TIER</span>}
          </div>
          
          <div className="card-specs">
            <div className="spec-item">
               <span className="spec-label">CORES</span>
               <span className="spec-val">{cpu.cores || '-'}</span>
            </div>
            <div className="spec-item">
               <span className="spec-label">THREADS</span>
               <span className="spec-val">{cpu.threads || '-'}</span>
            </div>
            <div className="spec-item">
               <span className="spec-label">INDEX</span>
               <span className="spec-val" style={{ color: cpu.performance_index ? vendorColor : '#6b7280' }}>
                 {cpu.performance_index || 'N/A'}
               </span>
            </div>
          </div>
          
          <div className="card-actions">
            <div className="action-btn"><Activity size={14}/> {isEn ? 'Specs' : 'Detaily'}</div>
            <div className="action-btn" style={{ color: '#f59e0b' }}><Swords size={14}/> {isEn ? 'VS Engine' : 'Srovnat'}</div>
          </div>
        </a>
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU BATTLES' : 'ZPĚT NA CPU DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
            <Database size={16} /> GURU HARDWARE DATABASE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CPU' : 'KATALOG'} <br/>
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
              {isEn ? 'DATABASE' : 'PROCESORŮ'}
            </span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn 
              ? 'Complete hierarchy of all processors. Sorted by raw performance index.' 
              : 'Kompletní hierarchie všech procesorů. Seřazeno od nejvýkonnějších po nejslabší.'}
          </div>

          {/* 🚀 GURU QUICK LINKS (Siloing) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
            <a href={isEn ? "/en/cpuvs/ranking" : "/cpuvs/ranking"} className="quick-link-pill" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
              <TrendingUp size={14} /> {isEn ? 'TIER LIST & RANKING' : 'ŽEBŘÍČEK PROCESORŮ'}
            </a>
            <a href={isEn ? "/en/bottleneck" : "/bottleneck"} className="quick-link-pill" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
              <Activity size={14} /> {isEn ? 'BOTTLENECK CALCULATOR' : 'KALKULAČKA BOTTLENECKU'}
            </a>
          </div>
        </header>

        {/* 🚀 AMD SECTION */}
        {amdCpus.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#ed1c24' }}>
              <span style={{ color: '#ed1c24' }}>AMD</span> RYZEN
            </h2>
            <div className="cpu-grid">
              {renderCpuCards(amdCpus, '#ed1c24')}
            </div>
          </section>
        )}

        {/* 🚀 INTEL SECTION */}
        {intelCpus.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <h2 className="vendor-h2" style={{ borderLeftColor: '#0071c5' }}>
              <span style={{ color: '#0071c5' }}>INTEL</span> CORE
            </h2>
            <div className="cpu-grid">
              {renderCpuCards(intelCpus, '#0071c5')}
            </div>
          </section>
        )}

        {/* 🚀 GURU SILOING: RECENZE A SOUVISEJÍCÍ ČLÁNKY */}
        {relatedArticles.length > 0 && (
            <section style={{ marginBottom: '80px', marginTop: '40px', background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #f59e0b', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Info size={28} color="#f59e0b" /> {isEn ? 'LATEST HARDWARE REVIEWS' : 'NEJNOVĚJŠÍ HW RECENZE'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {relatedArticles.map((art) => {
                        const artTitle = isEn && art.title_en ? art.title_en : art.title;
                        const artSlug = isEn && art.slug_en ? art.slug_en : art.slug;
                        const artUrl = isEn ? `/en/clanky/${artSlug}` : `/clanky/${artSlug}`;
                        const fallbackImg = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000';
                        const artDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(art.created_at || Date.now()));
                        
                        return (
                            <a key={art.slug} href={artUrl} className="related-article-card">
                                <div className="related-img-wrapper">
                                    <img src={art.image_url || fallbackImg} alt={artTitle} loading="lazy" />
                                </div>
                                <div className="related-content">
                                    <div className="related-date"><Calendar size={12} /> {artDate}</div>
                                    <h3 className="related-title">{artTitle}</h3>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </section>
        )}

        {/* 🚀 GURU SILOING: ODKAZY NA DALŠÍ ROZCESTNÍKY */}
        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#a855f7' }}>
                <div className="silo-banner-icon" style={{ color: '#a855f7', background: '#a855f720' }}><Monitor size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'GPU DATABASE' : 'KATALOG GRAFICKÝCH KARET'}</h4>
                    <p>{isEn ? 'Browse all graphics cards, specs and benchmarks.' : 'Prohlédni si všechny grafiky, parametry a výkon.'}</p>
                </div>
            </a>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="silo-banner-card" style={{ borderLeftColor: '#f97316' }}>
                <div className="silo-banner-icon" style={{ color: '#f97316', background: '#f9731620' }}><Flame size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</h4>
                    <p>{isEn ? 'Check out the hottest gaming sales right now.' : 'Omrkni ty nejlepší slevy na herní tituly.'}</p>
                </div>
            </a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(245, 158, 11, 0.1); transform: translateX(-5px); }
        
        .vendor-h2 { color: #fff; font-size: 2.2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid; padding-left: 15px; display: flex; align-items: center; gap: 15px; }
        
        .cpu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .cpu-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border-radius: 16px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; padding: 25px; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .cpu-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.6); background: rgba(25, 27, 31, 0.95); border-color: rgba(255,255,255,0.1); }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; min-height: 50px; }
        .card-header h3 { margin: 0; font-size: 1.3rem; font-weight: 950; text-transform: uppercase; line-height: 1.2; }
        .top-badge { font-size: 9px; font-weight: 950; padding: 3px 8px; border: 1px solid; border-radius: 50px; white-space: nowrap; margin-left: 10px; }
        
        .card-specs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .spec-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .spec-label { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px; }
        .spec-val { font-size: 14px; font-weight: 900; color: #9ca3af; }
        
        .card-actions { display: flex; justify-content: space-between; gap: 10px; }
        .action-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase; transition: 0.2s; }
        .cpu-card:hover .action-btn { color: #d1d5db; }

        /* 🚀 GURU SILOING STYLY */
        .quick-link-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 50px; font-weight: 950; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border: 1px solid; background: rgba(255,255,255,0.02); transition: 0.3s; }
        .quick-link-pill:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }

        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-left-width: 5px; }
        .silo-banner-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.02); }
        .silo-banner-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .silo-banner-text h4 { margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; font-weight: 950; }
        .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.9rem; }

        .related-article-card { display: flex; flex-direction: column; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; text-decoration: none; transition: 0.3s; }
        .related-article-card:hover { transform: translateY(-5px); border-color: rgba(245, 158, 11, 0.4); }
        .related-img-wrapper { height: 140px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .related-img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .related-content { padding: 20px; display: flex; flex-direction: column; gap: 5px; }
        .related-date { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
        .related-title { margin: 0; font-size: 1.1rem; font-weight: 950; color: #fff; line-height: 1.3; }

        @media (max-width: 768px) {
            .silo-banner-card { flex-direction: column; text-align: center; }
            .content-box-style { padding: 25px; }
        }
      `}} />
    </div>
  );
}
