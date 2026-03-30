import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, ChevronLeft, ShieldCheck, Zap, Flame, Heart, 
  Cpu, Monitor, Smartphone, ArrowRight, Star, Layers, Swords, BookOpen
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU BUILD DETAIL V2.1 (MONEY, SEO & RICH SNIPPETS UPDATE)
 * 🚀 CÍL: Maximální affiliate zisk (ID: 71c85dea), Google Rich Snippets a SEO Siloing.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const { slug } = await props.params;
  const { data: build } = await supabase
    .from('posts')
    .select('*')
    .or(`slug.eq."${slug}",slug_en.eq."${slug}"`)
    .single();
  
  if (!build) return { title: 'Sestava nenalezena | Hardware Guru' };
  
  const isEn = build.slug_en === slug;
  const title = isEn ? (build.title_en || build.title) : build.title;
  const desc = isEn ? (build.description_en || build.description) : build.description;

  return {
    title: `${title} | The Hardware Guru`,
    description: desc || 'Detailní rozbor herní sestavy a doporučených komponent.',
    alternates: {
      canonical: `${baseUrl}/sestavy/${build.slug}`,
      languages: {
        'en': `${baseUrl}/en/sestavy/${build.slug_en || build.slug}`,
        'cs': `${baseUrl}/sestavy/${build.slug}`
      }
    }
  };
}

export default async function BuildDetail(props) {
  const { slug } = await props.params;
  const { data: build, error } = await supabase
    .from('posts')
    .select('*')
    .or(`slug.eq."${slug}",slug_en.eq."${slug}"`)
    .single();
  
  if (error || !build) notFound();

  const isEn = build.slug_en === slug;
  const title = isEn ? (build.title_en || build.title) : build.title;
  const content = isEn ? (build.content_en || build.content) : build.content;

  // 🔥 OSTRÉ EHUB TRACKING LINKY (ID: 71c85dea)
  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";

  // Google Golden Rich: Breadcrumb & TechArticle
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": isEn ? "Builds" : "Sestavy", "item": `${baseUrl}${isEn ? '/en' : ''}/sestavy` },
          { "@type": "ListItem", "position": 3, "name": title }
        ]
      },
      {
        "@type": "TechArticle",
        "headline": title,
        "image": build.image_url ? [build.image_url] : [`${baseUrl}/logo.png`],
        "datePublished": build.created_at,
        "author": { "@type": "Person", "name": "The Hardware Guru" },
        "publisher": { "@type": "Organization", "name": "The Hardware Guru", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` } }
      }
    ]
  };

  return (
    <div className="guru-build-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <Link href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO SELECTION' : 'ZPĚT NA VÝBĚR'}
          </Link>
        </div>

        {/* 🔥 TOP MONEY FIX: ABOVE THE FOLD AD */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <article className="main-card">
          <header style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="category-badge"><Zap size={14} /> GURU RECOMMENDED BUILD</div>
            <h1 className="build-title">{title}</h1>
            <p className="build-desc">{isEn ? (build.description_en || build.description) : build.description}</p>
          </header>

          {build.image_url && (
            <div className="hero-img-box">
              <img src={build.image_url} alt={title} />
            </div>
          )}

          <div className="content-area" dangerouslySetInnerHTML={{ __html: content }} />

          {/* 💰 EHUB PARTNER SECTION - TADY SE VYDĚLÁVÁ (ID: 71c85dea) */}
          <div className="ehub-section">
            <h2 className="section-title">{isEn ? 'WHERE TO BUY COMPONENTS?' : 'KDE NAKOUPIT KOMPONENTY?'}</h2>
            
            <div className="partner-grid">
              <div className="partner-card shopcom">
                <div className="partner-info">
                  <span className="p-brand">SHOPCOM.CZ</span>
                  <span className="p-tag">{isEn ? 'UP TO 16% COMMISSION' : 'Až 16% provize pro Guru'}</span>
                </div>
                <h3>{isEn ? 'Hardware & Builds' : 'Hardware & Buildy'}</h3>
                <p>{isEn ? 'Best prices for GPUs and CPUs.' : 'Nejlepší ceny grafik a procesorů. Guru garantuje kvalitu.'}</p>
                <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="p-btn">
                  <ShoppingCart size={18} /> {isEn ? 'TO SHOP' : 'DO OBCHODU'}
                </a>
              </div>

              <div className="partner-card cubenest">
                <div className="partner-info">
                  <span className="p-brand">CUBENEST</span>
                  <span className="p-tag">{isEn ? '8% COMMISSION' : '8% provize pro Guru'}</span>
                </div>
                <h3>{isEn ? 'Accessories' : 'Příslušenství'}</h3>
                <p>{isEn ? 'Complete your setup with elite chargers.' : 'Doplň svou sestavu o elitní MagSafe a stojánky.'}</p>
                <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="p-btn">
                  <ShoppingCart size={18} /> {isEn ? 'EQUIP SETUP' : 'VYBAVIT SETUP'}
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* 🔗 SEO HUB (SILOING) - PROPOJENÍ CELÉHO WEBU */}
        <section className="seo-hub">
          <h2 className="hub-title">{isEn ? 'GURU KNOWLEDGE BASE' : 'GURU KNIHOVNA ZNALOSTÍ'}</h2>
          <div className="hub-grid">
            <Link href={isEn ? "/en/cpuvs/ranking" : "/cpuvs/ranking"} className="hub-item">
              <Cpu size={24} color="#66fcf1" />
              <span>{isEn ? 'CPU Ranking' : 'Žebříček CPU'}</span>
            </Link>
            <Link href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="hub-item">
              <Monitor size={24} color="#ff0055" />
              <span>{isEn ? 'GPU Ranking' : 'Žebříček GPU'}</span>
            </Link>
            <Link href={isEn ? "/en/rady" : "/rady"} className="hub-item">
              <BookOpen size={24} color="#a855f7" />
              <span>{isEn ? 'Practical Guides' : 'Praktické rady'}</span>
            </Link>
            <Link href={isEn ? "/en/slovnik" : "/slovnik"} className="hub-item">
              <Layers size={24} color="#eab308" />
              <span>{isEn ? 'HW Glossary' : 'HW Slovník'}</span>
            </Link>
          </div>
        </section>

      </main>

      {/* 🔥 STICKY BOTTOM ANCHOR */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper-fixed">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper-fixed">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.2s; }
        .guru-back-btn:hover { color: #fff; transform: translateX(-5px); }
        .main-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; padding: 50px 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); backdrop-filter: blur(20px); }
        .category-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(168, 85, 247, 0.1); color: #a855f7; padding: 6px 15px; border-radius: 8px; font-size: 10px; font-weight: 950; margin-bottom: 20px; }
        .build-title { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 950; margin: 0 0 15px 0; line-height: 1.1; text-transform: uppercase; }
        .build-desc { color: #9ca3af; font-size: 18px; line-height: 1.5; }
        .hero-img-box { border-radius: 20px; overflow: hidden; margin-bottom: 40px; border: 1px solid rgba(255,255,255,0.05); }
        .hero-img-box img { width: 100%; height: auto; display: block; }
        .content-area { font-size: 1.1rem; line-height: 1.8; color: #d1d5db; margin-bottom: 50px; }
        
        .section-title { font-size: 20px; font-weight: 950; text-align: center; margin-bottom: 30px; letter-spacing: 1px; text-transform: uppercase; }
        .partner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .partner-card { padding: 30px; border-radius: 24px; display: flex; flex-direction: column; gap: 15px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .shopcom { background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(0,0,0,0.4) 100%); border-left: 4px solid #a855f7; }
        .cubenest { background: linear-gradient(135deg, rgba(102, 252, 241, 0.1) 0%, rgba(0,0,0,0.4) 100%); border-left: 4px solid #66fcf1; }
        .partner-info { display: flex; justify-content: space-between; align-items: center; }
        .p-brand { font-weight: 950; font-size: 14px; }
        .p-tag { font-size: 9px; background: #10b981; color: #000; padding: 2px 8px; border-radius: 4px; font-weight: 900; text-transform: uppercase; }
        .p-btn { margin-top: auto; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 950; font-size: 14px; transition: 0.3s; text-transform: uppercase; }
        .shopcom .p-btn { background: #a855f7; color: #fff; }
        .cubenest .p-btn { background: #66fcf1; color: #000; }
        
        .seo-hub { margin-top: 60px; padding: 40px; background: rgba(0,0,0,0.4); border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); }
        .hub-title { font-size: 16px; font-weight: 950; text-align: center; margin-bottom: 30px; color: #4b5563; text-transform: uppercase; }
        .hub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; }
        .hub-item { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; transition: 0.3s; border: 1px solid transparent; }
        .hub-item span { font-size: 12px; font-weight: 900; color: #9ca3af; text-transform: uppercase; }
        .hub-item:hover { background: rgba(255,255,255,0.07); border-color: rgba(168, 85, 247, 0.3); transform: translateY(-5px); }

        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        .ad-desktop-wrapper { display: flex; }
        .ad-mobile-wrapper { display: none; }
        .ad-desktop-wrapper-fixed { display: flex; }
        .ad-mobile-wrapper-fixed { display: none; }

        @media (max-width: 768px) {
            .ad-desktop-wrapper, .ad-desktop-wrapper-fixed { display: none !important; }
            .ad-mobile-wrapper, .ad-mobile-wrapper-fixed { display: flex !important; }
            .main-card { padding: 30px 20px !important; }
            .partner-grid { grid-template-columns: 1fr !important; }
            .hub-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}} />
    </div>
  );
}
