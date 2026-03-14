import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Heart, 
  Flame, 
  Ghost, 
  Info,
  BookOpen
} from 'lucide-react';

/**
 * GURU ARTICLE ARCHIVE ENGINE V3.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/clanky/page.js
 * 🚀 CÍL: 100% zelená v GSC a blesková indexace všech novinek a recenzí.
 * 🛡️ FIX 1: Přepsáno na Server Component (SSR) pro maximální SEO autoritu.
 * 🛡️ FIX 2: Implementován Golden Rich standard - ItemList a BreadcrumbList JSON-LD.
 * 🛡️ FIX 3: Podpora CZ/EN varianty a absolutních Canonical URL.
 */

export const runtime = "nodejs";
export const revalidate = 3600; // Cache na 1 hodinu pro stabilitu a výkon

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy pro archiv článků
export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Article Archive & Tech News | The Hardware Guru' : 'Archiv Článků a Hardwarové Novinky | The Hardware Guru';
  const desc = isEn 
    ? 'Complete database of all hardware reviews, tech breakdowns, and gaming news verified by Hardware Guru.' 
    : 'Kompletní databáze všech hardwarových recenzí, technických rozborů a herních novinek ověřených Guru týmem.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/clanky`,
      languages: {
        'en': `${baseUrl}/en/clanky`,
        'cs': `${baseUrl}/clanky`,
        'x-default': `${baseUrl}/clanky`
      }
    }
  };
}

export default async function ClankyArchivePage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. GURU FETCH: Načtení všech článků přímo na serveru
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU ARTICLES FETCH FAIL:", error);
  }

  const safePosts = posts || [];

  const getThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10' };
    const typeStr = (post.type || '').toLowerCase();
    const isGame = typeStr === 'game' || (post.title && post.title.toLowerCase().includes('recenze'));
    if (isGame) return { text: isEn ? 'GAME NEWS' : 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff' };
    return { text: isEn ? 'HW NEWS' : 'HW NOVINKA', color: '#ff0000', textColor: '#fff' };
  };

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (ItemList pro seznam článků)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "Hardware & Gaming News" : "Hardwarové a herní novinky",
    "description": isEn ? "Latest technology articles and reviews." : "Nejnovější technologické články a recenze.",
    "itemListElement": safePosts.map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}${isEn ? '/en' : ''}/clanky/${isEn && post.slug_en ? post.slug_en : post.slug}`
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Articles" : "Články", "item": `${baseUrl}${isEn ? '/en' : ''}/clanky` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={globalStyles}>
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .game-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(168, 85, 247, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .game-card:hover { transform: translateY(-8px); box-shadow: 0 15px 40px rgba(168, 85, 247, 0.3); border-color: #a855f7; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
      `}} />

      <header style={{ maxWidth: '800px', margin: '20px auto 60px', textAlign: 'center', padding: '0 20px', paddingTop: '120px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          {isEn ? <>ARTICLE <span style={{ color: '#a855f7' }}>ARCHIVE</span></> : <>ARCHIV <span style={{ color: '#a855f7' }}>ČLÁNKŮ</span></>}
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          {isEn ? 'Complete database of all reviews and tech breakdowns.' : 'Kompletní databáze všech recenzí a rozborů.'}
        </p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {safePosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(15, 17, 21, 0.8)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#d1d5db', textTransform: 'uppercase' }}>
              {isEn ? 'NO ARTICLES FOUND' : 'ŽÁDNÉ ČLÁNKY NENALEZENY'}
            </h2>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {safePosts.map((post) => {
              const badge = getBadgeInfo(post);
              const displayTitle = (isEn && post.title_en) ? post.title_en : post.title;
              const displayDesc = (isEn && post.description_en) ? post.description_en : (post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
              const displaySlug = (isEn && post.slug_en) ? post.slug_en : post.slug;

              return (
                <Link key={post.id} href={isEn ? `/en/clanky/${displaySlug}` : `/clanky/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                      <img 
                        src={getThumbnail(post)} 
                        alt={displayTitle} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                        loading="lazy"
                      />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        {badge.text}
                      </div>
                    </div>
                    <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>{displayTitle}</h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>{displayDesc}</p>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          <Calendar size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                          {new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                        </span>
                        <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{isEn ? 'READ MORE' : 'ČÍST VÍCE'} →</span>
                      </div>
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
            {isEn ? "Want to support the Guru project? Get the best game deals." : "Chceš podpořit projekt Guru? Pořiď si hry za nejlepší ceny."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
