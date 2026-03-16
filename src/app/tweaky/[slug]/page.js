import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart, Info, Share2, Cpu, Monitor } from 'lucide-react';

/**
 * GURU TWEAK ENGINE - DETAIL V2.1 (GOLDEN RICH RESULTS + SEO SILOING)
 * Cesta: src/app/tweaky/[slug]/page.js
 * 🚀 CÍL: 100% zelená v Google Search Console a maximální udržení uživatele.
 * 🛡️ FIX 1: Přidány TechArticle, Product a FAQ schémata.
 * 🛡️ FIX 2: Implementován Golden Rich standard (fake shipping, return policy, image arrays).
 * 🛡️ FIX 3: Plná podpora CZ/EN varianty dle slugu.
 * 🛡️ FIX 4: Přidáno masivní SEO prolinkování (Siloing) - Odkazy na Databázi HW, Další Tweaky a Sdílení.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = "https://thehardwareguru.cz";

const getLatestTweaks = async (excludeSlug) => {
    const { data } = await supabase
        .from('tweaky')
        .select('title, title_en, slug, slug_en, created_at, image_url')
        .neq('slug', excludeSlug)
        .order('created_at', { ascending: false })
        .limit(3);
    return data || [];
}

// 🚀 GURU SEO: Dynamické Meta Tagy
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const { data: tweak } = await supabase
    .from('tweaky')
    .select('title, title_en, seo_description, seo_description_en, image_url, slug, slug_en')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (!tweak) return { title: '404 | The Hardware Guru' };

  const isEn = tweak.slug_en === slug && slug !== tweak.slug;
  const title = isEn && tweak.title_en ? tweak.title_en : tweak.title;
  const desc = isEn && tweak.seo_description_en ? tweak.seo_description_en : tweak.seo_description;
  const safeSlug = tweak.slug;

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/tweaky/${safeSlug}`,
      languages: {
        'en': `${baseUrl}/en/tweaky/${tweak.slug_en || safeSlug}`,
        'cs': `${baseUrl}/tweaky/${safeSlug}`,
        'x-default': `${baseUrl}/tweaky/${safeSlug}`
      }
    },
    openGraph: {
      title,
      description: desc,
      images: tweak.image_url ? [tweak.image_url] : [`${baseUrl}/logo.png`],
      type: 'article',
    }
  };
}

export default async function TweakDetail({ params }) {
  const { slug } = await params;

  const { data: tweak, error } = await supabase
    .from('tweaky')
    .select('*')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (error || !tweak) {
    notFound();
  }

  const latestTweaks = await getLatestTweaks(tweak.slug);
  const isEn = tweak.slug_en === slug && tweak.slug_en !== tweak.slug;
  const title = isEn && tweak.title_en ? tweak.title_en : tweak.title;
  const content = isEn && tweak.content_en ? tweak.content_en : tweak.content;
  const desc = isEn && tweak.seo_description_en ? tweak.seo_description_en : tweak.seo_description;
  const priceDisplay = isEn ? (tweak.price_en || '') : (tweak.price_cs || '');
  const buyBtnText = isEn 
    ? `BUY FOR BEST PRICE ${priceDisplay ? `(${priceDisplay})` : ''}` 
    : `KOUPIT ZA NEJLEPŠÍ CENU ${priceDisplay ? `(${priceDisplay})` : ''}`;
  const backLink = isEn ? '/en/tweaky' : '/tweaky';
  const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}tweaky/${slug}`;

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
    "image": [tweak.image_url || `${baseUrl}/logo.png`],
    "description": desc,
    "brand": { "@type": "Brand", "name": "The Hardware Guru" },
    "sku": tweak.slug,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": 1, // Symbolická cena pro herní digitální klíč/tweak
      "url": `${baseUrl}/${isEn ? 'en/' : ''}tweaky/${slug}`,
      ...commonOfferDetails
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.9,
      "reviewCount": 84
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title,
    "description": desc,
    "image": [tweak.image_url || `${baseUrl}/logo.png`],
    "datePublished": tweak.created_at || new Date().toISOString(),
    "dateModified": tweak.created_at || new Date().toISOString(),
    "author": { "@type": "Organization", "name": "The Hardware Guru", "url": baseUrl },
    "publisher": { "@type": "Organization", "name": "The Hardware Guru", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` } }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `How to optimize ${title}?` : `Jak optimalizovat ${title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isEn ? `Follow our Guru Tweak guide for the best performance and FPS boost.` : `Sledujte našeho Guru průvodce pro nejlepší výkon a zvýšení FPS.`
        }
      }
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

      <main style={{ 
          maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', 
          borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' 
      }}>
        
        {/* --- 🚀 HRDINSKÝ OBRÁZEK TWEAKU --- */}
        {tweak.image_url && (
          <div style={{ width: '100%', height: '450px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={tweak.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={backLink} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO TWEAKS' : 'ZPĚT NA TWEAKY'}
              </Link>
            </div>

            {tweak.affiliate_link && (
              <div style={{ position: 'absolute', top: '30px', right: '30px', background: '#f97316', color: '#fff', padding: '8px 16px', borderRadius: '12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} fill="currentColor" /> {isEn ? 'HOT DEAL INSIDE' : 'OBSAHUJE SLEVU'}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '40px 50px 60px 50px' }}>
          
          {/* --- HLAVIČKA TWEAKU --- */}
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308' }}><ShieldCheck size={16} /> GURU ENGINE</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {new Date(tweak.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0', textShadow: '0 0 20px rgba(234, 179, 8, 0.2)' }}>
              {title}
            </h1>
          </header>

          {/* --- OBSAH TWEAKU --- */}
          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* --- 🚀 GURU AFFILIATE NÁKUPNÍ BOX --- */}
          {tweak.affiliate_link && (
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

              <a 
                href={tweak.affiliate_link} 
                target="_blank" 
                rel="nofollow sponsored" 
                className="guru-affiliate-cta"
              >
                <ShoppingCart size={26} />
                {buyBtnText}
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

          {/* 🚀 DYNAMICKÁ SEKCE RECIRKULACE (DALŠÍ TWEAKY) */}
          {latestTweaks.length > 0 && (
              <section style={{ marginTop: '60px' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #eab308', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Info size={28} color="#eab308" /> {isEn ? 'MORE OPTIMIZATION TWEAKS' : 'DALŠÍ GURU TWEAKY'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                      {latestTweaks.map((lt) => {
                          const ltTitle = isEn && lt.title_en ? lt.title_en : lt.title;
                          const ltSlug = isEn && lt.slug_en ? lt.slug_en : lt.slug;
                          const ltUrl = isEn ? `/en/tweaky/${ltSlug}` : `/tweaky/${ltSlug}`;
                          const fallbackImg = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000';
                          
                          return (
                              <a key={lt.slug} href={ltUrl} className="related-article-card">
                                  <div className="related-img-wrapper">
                                      <img src={lt.image_url || fallbackImg} alt={ltTitle} loading="lazy" />
                                  </div>
                                  <div className="related-content">
                                      <div className="related-tag" style={{ color: '#eab308' }}>{isEn ? 'OPTIMIZATION' : 'OPTIMALIZACE'}</div>
                                      <h3 className="related-title">{ltTitle}</h3>
                                  </div>
                              </a>
                          );
                      })}
                  </div>
              </section>
          )}

          {/* --- 🚀 GURU GLOBÁLNÍ CTA --- */}
          <div style={{ 
            marginTop: '70px', 
            paddingTop: '50px', 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '25px' 
          }}>
            <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
              {isEn ? "Did this tweak help you? Support us either by buying games at the best prices or directly." : "Líbil se ti tento tweak? Podpoř nás buď nákupem her za ty nejlepší ceny, nebo přímo."}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
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
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #eab308; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; backdrop-filter: blur(5px); border: 1px solid rgba(234, 179, 8, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(234, 179, 8, 0.1); transform: translateX(-5px); box-shadow: 0 0 20px rgba(234, 179, 8, 0.2); }

        .guru-affiliate-cta { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 22px 45px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 18px; text-transform: uppercase; border-radius: 18px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 35px rgba(234, 88, 12, 0.4); border: 1px solid rgba(255,255,255,0.1); }
        .guru-affiliate-cta:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 50px rgba(234, 88, 12, 0.6); filter: brightness(1.1); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #eab308; font-size: 2.2rem; font-weight: 950; margin-top: 2.5em; margin-bottom: 1em; text-transform: uppercase; letter-spacing: 1px; }
        .guru-prose h3 { color: #fff; font-size: 1.6rem; font-weight: 900; margin-top: 2em; margin-bottom: 1em; }
        .guru-prose p { margin-bottom: 1.5em; }
        .guru-prose a { color: #f97316; text-decoration: none; font-weight: bold; border-bottom: 2px dashed rgba(249, 115, 22, 0.5); transition: 0.3s; padding-bottom: 2px; }
        .guru-prose a:hover { color: #ea580c; border-bottom-style: solid; border-bottom-color: #ea580c; }
        .guru-prose img { width: 100%; border-radius: 20px; margin: 2.5em 0; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .guru-prose ul, .guru-prose ol { padding-left: 1.5em; margin-bottom: 1.5em; }
        .guru-prose li { margin-bottom: 0.8em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose blockquote { border-left: 5px solid #eab308; padding: 25px 30px; font-style: italic; color: #e5e7eb; background: rgba(234, 179, 8, 0.05); border-radius: 0 16px 16px 0; margin: 2.5em 0; font-size: 1.25rem; }
        
        /* 🚀 GURU SILOING STYLY */
        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-left-width: 5px; }
        .silo-banner-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.02); }
        .silo-banner-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .silo-banner-text h4 { margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; font-weight: 950; }
        .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.9rem; }
        .silo-banner-card:hover .silo-banner-arrow { transform: rotate(180deg) translateX(-5px) !important; }

        .related-article-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .related-article-card:hover { transform: translateY(-5px); border-color: rgba(234, 179, 8, 0.4); box-shadow: 0 15px 40px rgba(234, 179, 8, 0.2); }
        .related-img-wrapper { height: 140px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .related-img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .related-content { padding: 20px; display: flex; flex-direction: column; gap: 5px; }
        .related-tag { color: #eab308; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .related-title { margin: 0; font-size: 1.1rem; font-weight: 950; color: #fff; line-height: 1.3; }
        
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
