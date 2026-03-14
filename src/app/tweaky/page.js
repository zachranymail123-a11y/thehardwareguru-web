import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Settings, ChevronRight, Smartphone, Monitor, Heart, Flame, ShieldCheck } from 'lucide-react';

/**
 * GURU TWEAKS ARCHIVE ENGINE V2.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/tweaky/page.js
 * 🚀 CÍL: 100% zelená v GSC a blesková indexace všech systémových fixů.
 * 🛡️ FIX 1: Přepsáno na Server Component (SSR) pro maximální SEO autoritu.
 * 🛡️ FIX 2: Implementován Golden Rich standard - ItemList a BreadcrumbList JSON-LD.
 * 🛡️ FIX 3: Podpora CZ/EN varianty a absolutních Canonical URL.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy pro archiv tweaků
export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Latest Guru Tweaks | System Performance & FPS Boost' : 'Nejnovější Guru Tweaky | Výkon a FPS';
  const desc = isEn 
    ? 'Deep system modifications, Windows optimizations and hardware tweaks for maximum stability.' 
    : 'Hloubkové modifikace systému, optimalizace Windows a hardwarové tweaky pro maximální FPS a stabilitu.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/tweaky`,
      languages: {
        'en': `${baseUrl}/en/tweaky`,
        'cs': `${baseUrl}/tweaky`,
        'x-default': `${baseUrl}/tweaky`
      }
    }
  };
}

export default async function TweaksArchivePage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. GURU FETCH: Získání dat přímo na serveru bez zbytečného loading spinneru
  const { data: items, error } = await supabase
    .from('tweaky')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU TWEAKS FETCH FAIL:", error);
  }

  const safeItems = items || [];

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (ItemList pro seznam systémových tweaků)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "System & Gaming Tweaks" : "Systémové a herní tweaky",
    "description": isEn ? "Collection of system modifications for better FPS." : "Sbírka systémových modifikací pro lepší FPS.",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}${isEn ? '/en' : ''}/tweaky/${isEn && item.slug_en ? item.slug_en : item.slug}`
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Tweaks" : "Tweaky", "item": `${baseUrl}${isEn ? '/en' : ''}/tweaky` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={archiveWrapper}>
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .tweak-card { 
            background: rgba(17, 19, 24, 0.85); 
            border: 1px solid rgba(234, 179, 8, 0.2); 
            border-radius: 32px; 
            padding: 30px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            text-decoration: none;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }
        .tweak-card:hover { 
            transform: translateY(-8px); 
            border-color: #eab308; 
            box-shadow: 0 20px 60px rgba(234, 179, 8, 0.2); 
        }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
      `}} />

      <header style={headerStyle}>
        <h1 style={titleStyle}>
          GURU <span style={{ color: '#eab308' }}>{isEn ? 'TWEAKS' : 'TWEAKY'}</span>
        </h1>
        <p style={subtitleStyle}>
          {isEn 
            ? 'Deep system modifications for maximum FPS and stability.' 
            : 'Hloubkové modifikace systému pro maximální FPS a stabilitu tvé mašiny.'}
        </p>
      </header>

      <main style={gridContainer}>
        {safeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold' }}>
            {isEn ? 'NO TWEAKS FOUND' : 'ŽÁDNÉ TWEAKY NENALEZENY'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {safeItems.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/tweaky/${displaySlug}` : `/tweaky/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="tweak-card">
                    <div style={imageBox}>
                      <img 
                        src={item.image_url && item.image_url !== 'EMPTY' ? item.image_url : 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} 
                        alt={displayTitle} 
                        style={imgStyle} 
                        loading="lazy"
                      />
                    </div>

                    <div style={categoryBadge}>
                      <Settings size={14} /> {isEn ? (item.category_en || 'SYSTEM') : (item.category || 'SYSTÉM')}
                    </div>

                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{displayDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'OPEN GURU FIX' : 'OTEVŘÍT GURU FIX'} <ChevronRight size={16} />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* 🚀 GURU GLOBÁLNÍ CTA TLAČÍTKA (Golden standard) */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Want even more performance? Support us and get the best deals." : "Chceš ještě víc výkonu? Podpoř nás a získej ty nejlepší nabídky."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- GURU MASTER STYLES (GOLD THEME) ---
const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '120px 20px 80px' 
};

const headerStyle = { 
    maxWidth: '800px', 
    margin: '0 auto 60px', 
    textAlign: 'center' 
};

const titleStyle = { 
    fontSize: 'clamp(40px, 8vw, 72px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-1px', 
    color: '#fff', 
    lineHeight: '0.9' 
};

const subtitleStyle = { 
    marginTop: '20px', 
    color: '#d1d5db', 
    fontWeight: '600', 
    fontSize: '18px' 
};

const gridContainer = { 
    maxWidth: '1200px', 
    margin: '0 auto' 
};

const imageBox = { 
    height: '200px', 
    borderRadius: '20px', 
    overflow: 'hidden', 
    marginBottom: '20px', 
    border: '1px solid rgba(255,255,255,0.05)', 
    background: '#000' 
};

const imgStyle = { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', 
    opacity: 0.8 
};

const categoryBadge = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    color: '#eab308', 
    fontSize: '11px', 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginBottom: '15px', 
    letterSpacing: '1px' 
};

const cardTitleStyle = { 
    fontSize: '24px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '15px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2' 
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '15px', 
    lineHeight: '1.6', 
    flexGrow: 1, 
    marginBottom: '20px' 
};

const moreStyle = { 
    color: '#eab308', 
    fontWeight: '900', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px', 
    marginTop: 'auto', 
    textTransform: 'uppercase' 
};
