import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { PenTool, ChevronRight, Zap, ShieldCheck, Heart, Flame, Info, Monitor } from 'lucide-react';

/**
 * GURU GUIDES ARCHIVE ENGINE V2.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/rady/page.js
 * 🚀 CÍL: 100% zelená v GSC a blesková indexace praktických návodů.
 * 🛡️ FIX 1: Přepsáno na Server Component (SSR) pro maximální SEO autoritu.
 * 🛡️ FIX 2: Implementován Golden Rich standard - ItemList a BreadcrumbList JSON-LD.
 * 🛡️ FIX 3: Podpora CZ/EN varianty a absolutních Canonical URL.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy pro archiv rad
export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Hardware Guru Guides | Technical Knowledge Base' : 'Guru Hardware Rady | Technická základna';
  const desc = isEn 
    ? 'Field-tested guides, technical solutions and hardware tips for every PC enthusiast.' 
    : 'Prověřené návody z praxe, technická řešení a hardwarové tipy pro každého PC nadšence.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/rady`,
      languages: {
        'en': `${baseUrl}/en/rady`,
        'cs': `${baseUrl}/rady`,
        'x-default': `${baseUrl}/rady`
      }
    }
  };
}

export default async function RadyArchivePage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. GURU FETCH: Získání dat přímo na serveru
  const { data: items, error } = await supabase
    .from('rady')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU GUIDES FETCH FAIL:", error);
  }

  const safeItems = items || [];

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (ItemList pro seznam rad)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "Hardware Guides & Solutions" : "Hardwarové rady a návody",
    "description": isEn ? "Collection of practical technical guides." : "Sbírka praktických technických návodů.",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}${isEn ? '/en' : ''}/rady/${isEn && item.slug_en ? item.slug_en : item.slug}`
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Guides" : "Rady", "item": `${baseUrl}${isEn ? '/en' : ''}/rady` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={pageWrapper}>
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .rada-card { 
            background: rgba(10, 11, 13, 0.9); 
            backdrop-filter: blur(15px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            padding: 35px; 
            border-radius: 28px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            text-decoration: none; 
            color: inherit; 
            display: flex; 
            flex-direction: column; 
            height: 100%;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }
        .rada-card:hover { 
            border-color: #a855f7; 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); 
            transform: translateY(-8px) scale(1.02); 
        }
        .icon-box {
            background: rgba(168, 85, 247, 0.1); 
            width: fit-content; 
            padding: 12px; 
            border-radius: 15px; 
            margin-bottom: 25px;
            border: 1px solid rgba(168, 85, 247, 0.2);
        }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
      `}} />

      <main style={{ maxWidth: '1300px', margin: '60px auto', padding: '0 20px', width: '100%', flex: '1 0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
               <ShieldCheck size={56} color="#a855f7" />
               <Zap size={56} color="#eab308" />
            </div>
            <h1 style={titleStyle}>
              {isEn ? <>PRACTICAL <span style={{ color: '#a855f7' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#a855f7' }}>RADY</span></>}
            </h1>
            <p style={{ marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '20px' }}>
              {isEn ? 'Field-tested tips and technical solutions for every geek.' : '🛠️ Tipy a triky z praxe. Od diagnostiky až po čištění PC.'}
            </p>
        </header>

        {safeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold' }}>
            {isEn ? 'NO GUIDES FOUND IN DATABASE' : 'V DATABÁZI NENALEZENY ŽÁDNÉ RADY'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '35px' }}>
            {safeItems.map((rada) => {
              const displayTitle = (isEn && rada.title_en) ? rada.title_en : rada.title;
              const displayDesc = (isEn && rada.description_en) ? rada.description_en : rada.description;
              const displaySlug = (isEn && rada.slug_en) ? rada.slug_en : rada.slug;

              return (
                <Link key={rada.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} className="rada-card">
                  <div className="icon-box">
                    <PenTool size={28} color="#a855f7" />
                  </div>
                  <h2 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>
                    {displayTitle}
                  </h2>
                  <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px 0', flexGrow: 1 }}>
                    {displayDesc && displayDesc.length > 140 ? displayDesc.substring(0, 140) + '...' : displayDesc}
                  </p>
                  <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isEn ? 'VIEW GUIDE' : 'ZOBRAZIT NÁVOD'} <ChevronRight size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 🚀 GURU GLOBÁLNÍ CTA TLAČÍTKA (Golden standard) */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Did these guides help you? Support us by buying games at the best prices." : "Pomohly ti tyto rady? Podpoř nás nákupem her za ty nejlepší ceny."}
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

      <footer style={footerStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '30px', textTransform: 'uppercase', fontWeight: '950', fontSize: '36px' }}>
            {isEn ? 'ABOUT GURU' : 'O MNĚ'}
          </h2>
          <p style={{ lineHeight: '1.9', fontSize: '18px', color: '#e5e7eb', marginBottom: '45px' }}>
            {isEn 
              ? "Welcome to The Hardware Guru! I am your guide to modern technology, hardcore hardware, and gaming. This guide section was created so that you too can become the master of your hardware."
              : "Vítej ve světě The Hardware Guru! Jsem tvůj průvodce moderní technologií, hardwarem a gamingem. Tato sekce rad vznikla proto, aby ses i ty stal pánem svého hardwaru."
            }
          </p>
          <p style={{ fontSize: '13px', color: '#444', fontWeight: '900', letterSpacing: '2px' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE TECH BASE
          </p>
        </div>
      </footer>
    </div>
  );
}

const pageWrapper = { 
  minHeight: '100vh', 
  backgroundColor: '#0a0b0d', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover', 
  backgroundAttachment: 'fixed', 
  color: '#fff',
  display: 'flex',
  flexDirection: 'column'
};

const titleStyle = { 
  fontSize: 'clamp(40px, 8vw, 72px)', 
  fontWeight: '950', 
  textTransform: 'uppercase', 
  letterSpacing: '-2px', 
  margin: 0,
  lineHeight: '0.9'
};

const footerStyle = { 
  padding: '120px 20px 60px', 
  background: 'rgba(0, 0, 0, 0.9)', 
  borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
  textAlign: 'center', 
  marginTop: '80px' 
};
