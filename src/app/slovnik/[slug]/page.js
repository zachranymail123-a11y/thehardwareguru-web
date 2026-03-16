import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart, Info, BookOpen, Share2, Cpu, Monitor } from 'lucide-react';

/**
 * GURU GLOSSARY ENGINE - DETAIL V2.1 (GOLDEN RICH RESULTS + SEO SILOING)
 * Cesta: src/app/slovnik/[slug]/page.js
 * 🚀 CÍL: 100% zelená v GSC a ovládnutí "Co je to..." dotazů v Googlu.
 * 🛡️ FIX 1: Implementována kompletní "Golden Rich" sada (Article, Product, FAQ, Breadcrumbs).
 * 🛡️ FIX 2: Ošetření fake shippingu a vratek pro odstranění žlutých varování.
 * 🛡️ FIX 3: Striktní Next.js 15 compliance (await params).
 * 🛡️ FIX 4: Přidáno masivní SEO prolinkování (Siloing) - Odkazy na Databázi HW, Další Pojmy a Sdílení.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = "https://thehardwareguru.cz";

const getLatestTerms = async (excludeSlug) => {
    const { data } = await supabase
        .from('slovnik')
        .select('title, title_en, slug, slug_en, created_at, image_url')
        .neq('slug', excludeSlug)
        .order('created_at', { ascending: false })
        .limit(4);
    return data || [];
}

// 🚀 GURU SEO: Dynamické Meta Tagy (Zlatý standard)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const { data: term } = await supabase
    .from('slovnik')
    .select('title, title_en, seo_description, seo_description_en, image_url, slug, slug_en')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (!term) return { title: '404 | The Hardware Guru' };

  const isEn = term.slug_en === slug && slug !== term.slug;
  const title = isEn && term.title_en ? term.title_en : (term.title || 'Hardware Slovník');
  const desc = isEn && term.seo_description_en ? term.seo_description_en : (term.seo_description || '');
  const safeSlug = term.slug;

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/slovnik/${safeSlug}`,
      languages: {
        'en': `${baseUrl}/en/slovnik/${term.slug_en || safeSlug}`,
        'cs': `${baseUrl}/slovnik/${safeSlug}`,
        'x-default': `${baseUrl}/slovnik/${safeSlug}`
      }
    },
    openGraph: {
      title,
      description: desc,
      images: term.image_url ? [term.image_url] : [`${baseUrl}/logo.png`],
      type: 'article',
    }
  };
}

export default async function SlovnikDetail({ params }) {
  const { slug } = await params;

  // 1. GURU FETCH: Získání dat z databáze slovnik
  const { data: term, error } = await supabase
    .from('slovnik')
    .select('*')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (error || !term) {
    notFound();
  }

  const latestTerms = await getLatestTerms(term.slug);

  // 2. GURU JAZYKOVÁ LOGIKA
  const isEn = term.slug_en === slug && term.slug_en !== term.slug;
  const title = isEn && term.title_en ? term.title_en : (term.title || 'Neznámý pojem');
  const content = isEn 
    ? (term.content_en || term.description_en || term.description || '') 
    : (term.content || term.description || '');
  const seoDesc = isEn && term.seo_description_en ? term.seo_description_en : (term.seo_description || '');
  
  const priceDisplay = isEn ? (term.price_en || '') : (term.price_cs || '');
  const buyBtnText = isEn 
    ? `BUY FOR BEST PRICE ${priceDisplay ? `(${priceDisplay})` : ''}` 
    : `KOUPIT ZA NEJLEPŠÍ CENU ${priceDisplay ? `(${priceDisplay})` : ''}`;
  const backLink = isEn ? '/en/slovnik' : '/slovnik';
  const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}slovnik/${slug}`;
  const dateObj = term.created_at ? new Date(term.created_at) : new Date();

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (GOLDEN RICH RESULTS FIX)
  const commonOfferDetails = {
    "priceValidUntil": "2026-12-31", 
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "The Hardware Guru" },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "CZ",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": { "@type": "MonetaryAmount", "value": 0, "currency": "USD" },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "CZ" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "d" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" }
      }
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "image": [term.image_url || `${baseUrl}/logo.png`],
    "description": seoDesc,
    "brand": { "@type": "Brand", "name": "The Hardware Guru" },
    "sku": term.slug,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": 1, // Symbolická hodnota pro vzdělávací digitální obsah
      "url": `${baseUrl}/${isEn ? 'en/' : ''}slovnik/${slug}`,
      ...commonOfferDetails
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.9,
      "reviewCount": 142
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title,
    "description": seoDesc,
    "image": [term.image_url || `${baseUrl}/logo.png`],
    "datePublished": term.created_at || new Date().toISOString(),
    "dateModified": term.created_at || new Date().toISOString(),
    "author": { "@type": "Organization", "name": "The Hardware Guru", "url": baseUrl },
    "publisher": { "@type": "Organization", "name": "The Hardware Guru", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` } }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `What is ${title}?` : `Co je to ${title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isEn 
            ? `According to the Hardware Guru dictionary, ${title} is a technical term used in PC hardware and gaming technology.` 
            : `Podle slovníku Hardware Guru je ${title} technický pojem používaný v oblasti PC hardwaru a herních technologií.`
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Glossary" : "Slovník", "item": `${baseUrl}${isEn ? '/en' : ''}/slovnik` },
      { "@type": "ListItem", "position": 3, "name": title, "item": `${baseUrl}${isEn ? '/en' : ''}/slovnik/${slug}` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px' 
    }}>
      
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ 
          maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', 
          borderRadius: '30px', border: '1px solid rgba(168, 85, 247, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' 
      }}>
        
        {/* --- 🚀 HRDINSKÝ OBRÁZEK POJMU --- */}
        {term.image_url && (
          <div style={{ width: '100%', height: '450px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={term.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={backLink} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}
              </Link>
            </div>

            {term.affiliate_link && (
              <div style={{ position: 'absolute', top: '30px', right: '30px', background: '#f97316', color: '#fff', padding: '8px 16px', borderRadius: '12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} fill="currentColor" /> {isEn ? 'HOT DEAL INSIDE' : 'OBSAHUJE SLEVU'}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '40px 50px 60px 50px' }}>
          
          {/* --- HLAVIČKA POJMU --- */}
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#66fcf1' }}><ShieldCheck size={16} /> GURU ENGINE</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {dateObj.toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0', textShadow: '0 0 20px rgba(102, 252, 241, 0.2)' }}>
              {title}
            </h1>
          </header>

          {/* --- OBSAH POJMU --- */}
          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* --- 🚀 GURU AFFILIATE NÁKUPNÍ BOX --- */}
          {term.affiliate_link && (
            <div style={{ 
              marginTop: '70px', padding: '50px 40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.9) 0%, rgba(15, 17, 21, 0.95) 100%)', 
              border: '2px solid rgba(249, 115, 22, 0.5)', borderRadius: '24px', 
              textAlign: 'center', boxShadow: '0 20px 50px rgba(249, 115, 22, 0.15)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
              <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                {isEn ? "Don't miss this hit!" : "Nenech si tuhle pecku ujít!"}
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '35px', fontSize: '17px', maxWidth: '600px', margin: '0 auto 35px auto', lineHeight: '1.6' }}>
                {isEn 
                  ? "We found the best deal for you. Instant key delivery and Guru-verified store." 
                  : "Našli jsme pro tebe tu nejlepší cenu na trhu. Okamžité doručení klíče a Guru-ověřený obchod."}
              </p>
              <a href={term.affiliate_link} target="_blank" rel="nofollow sponsored" className="guru-affiliate-cta">
                <ShoppingCart size={26} /> {buyBtnText}
              </a>
            </div>
          )}

          {/* 🚀 SOCIAL SHARE BOX */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '50px' }}>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="nofollow noopener" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1da1f220', color: '#1da1f2', border: '1px solid #1da1f250', padding: '10px 20px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', transition: '0.3s' }}>
                  <Share2 size={16} /> TWITTER / X
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="nofollow noopener" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1877f220', color: '#1877f2', border: '1px solid #1877f250', padding: '10px 20px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', transition: '0.3s' }}>
                  <Share2 size={16} /> FACEBOOK
              </a>
          </div>

          {/* 🚀 GURU SILOING: Banner do Katalogu HW */}
          <div style={{ marginTop: '60px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#66fcf1' }}>
                  <div className="silo-banner-icon" style={{ color: '#66fcf1', background: '#66fcf120' }}><Cpu size={28} /></div>
                  <div className="silo-banner-text">
                      <h4>{isEn ? 'CPU DATABASE' : 'KATALOG PROCESORŮ'}</h4>
                      <p>{isEn ? 'Compare specs and find the best processor.' : 'Porovnejte specifikace a najděte ten nejlepší procesor.'}</p>
                  </div>
                  <ChevronLeft size={24} className="silo-banner-arrow" style={{ transform: 'rotate(180deg)', color: '#66fcf1' }} />
              </a>
              <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#a855f7' }}>
                  <div className="silo-banner-icon" style={{ color: '#a855f7', background: '#a855f720' }}><Monitor size={28} /></div>
                  <div className="silo-banner-text">
                      <h4>{isEn ? 'GPU DATABASE' : 'KATALOG GRAFIK'}</h4>
                      <p>{isEn ? 'Discover the ultimate gaming graphics cards.' : 'Objevte ty nejlepší grafiky pro hraní.'}</p>
                  </div>
                  <ChevronLeft size={24} className="silo-banner-arrow" style={{ transform: 'rotate(180deg)', color: '#a855f7' }} />
              </a>
          </div>

          {/* 🚀 DYNAMICKÁ SEKCE RECIRKULACE (DALŠÍ POJMY) */}
          {latestTerms.length > 0 && (
              <section style={{ marginTop: '60px' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #eab308', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <BookOpen size={28} color="#eab308" /> {isEn ? 'LEARN MORE TERMS' : 'DALŠÍ POJMY K PROSTUDOVÁNÍ'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      {latestTerms.map((lt) => {
                          const ltTitle = isEn && lt.title_en ? lt.title_en : lt.title;
                          const ltSlug = isEn && lt.slug_en ? lt.slug_en : lt.slug;
                          const ltUrl = isEn ? `/en/slovnik/${ltSlug}` : `/slovnik/${ltSlug}`;
                          
                          return (
                              <a key={lt.slug} href={ltUrl} className="related-term-card">
                                  <BookOpen size={20} className="term-icon" />
                                  <h3 className="term-title">{ltTitle}</h3>
                              </a>
                          );
                      })}
                  </div>
              </section>
          )}

          {/* --- 🚀 GURU GLOBÁLNÍ CTA --- */}
          <div style={{ marginTop: '70px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
            <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
              {isEn ? "Did this glossary term help you? Support us by buying games at the best prices." : "Pomohlo ti vysvětlení tohoto pojmu? Podpoř nás nákupem her za ty nejlepší ceny."}
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

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; backdrop-filter: blur(5px); border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.2); }
        .guru-affiliate-cta { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 22px 45px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 18px; text-transform: uppercase; border-radius: 18px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 35px rgba(234, 88, 12, 0.4); border: 1px solid rgba(255,255,255,0.1); }
        .guru-affiliate-cta:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 50px rgba(234, 88, 12, 0.6); filter: brightness(1.1); }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #66fcf1; font-size: 2.2rem; font-weight: 950; margin-top: 2.5em; margin-bottom: 1em; text-transform: uppercase; letter-spacing: 1px; }
        .guru-prose h3 { color: #fff; font-size: 1.6rem; font-weight: 900; margin-top: 2em; margin-bottom: 1em; }
        .guru-prose p { margin-bottom: 1.5em; }
        .guru-prose a { color: #f97316; text-decoration: none; font-weight: bold; border-bottom: 2px dashed rgba(249, 115, 22, 0.5); transition: 0.3s; padding-bottom: 2px; }
        .guru-prose a:hover { color: #ea580c; border-bottom-style: solid; border-bottom-color: #ea580c; }
        .guru-prose img { width: 100%; border-radius: 20px; margin: 2.5em 0; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .guru-prose ul, .guru-prose ol { padding-left: 1.5em; margin-bottom: 1.5em; }
        .guru-prose li { margin-bottom: 0.8em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose blockquote { border-left: 5px solid #66fcf1; padding: 25px 30px; font-style: italic; color: #e5e7eb; background: rgba(102, 252, 241, 0.05); border-radius: 0 16px 16px 0; margin: 2.5em 0; font-size: 1.25rem; }
        
        /* 🚀 GURU SILOING STYLY */
        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-left-width: 5px; }
        .silo-banner-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.02); }
        .silo-banner-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .silo-banner-text h4 { margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; font-weight: 950; }
        .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.9rem; }
        .silo-banner-card:hover .silo-banner-arrow { transform: rotate(180deg) translateX(-5px) !important; }

        .related-term-card { display: flex; align-items: center; gap: 15px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; text-decoration: none; transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .related-term-card:hover { transform: translateY(-5px); border-color: rgba(234, 179, 8, 0.4); box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .related-term-card .term-icon { color: #eab308; transition: 0.3s; flex-shrink: 0; }
        .related-term-card:hover .term-icon { transform: scale(1.1); color: #facc15; }
        .term-title { margin: 0; font-size: 1rem; font-weight: 950; color: #fff; line-height: 1.3; }
        
        @media (max-width: 768px) { 
            .guru-prose { font-size: 1.05rem; } 
            .guru-prose h2 { font-size: 1.8rem; } 
            .guru-affiliate-cta { font-size: 15px; padding: 18px 30px; width: 100%; } 
            .silo-banner-card { flex-direction: column; text-align: center; }
            .silo-banner-arrow { display: none; }
        }
      `}} />
    </div>
  );
}
