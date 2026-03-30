import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart, Info, Share2, Cpu, Monitor } from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU TWEAK ENGINE - DETAIL V2.5 (MONEY FIX UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchoru, eliminace hluchých míst.
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const { data: tweak } = await supabase
    .from('tweaky')
    .select('title, title_en, seo_description, seo_description_en, image_url, slug, slug_en')
    .or(`slug.eq."${slug}",slug_en.eq."${slug}"`)
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
    .or(`slug.eq."${slug}",slug_en.eq."${slug}"`)
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
  const backLinkPath = isEn ? '/en/tweaky' : '/tweaky';
  const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}tweaky/${slug}`;

  // Google Golden Rich schemas
  const commonOfferDetails = {
    "priceValidUntil": "2026-12-31", 
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "The Hardware Guru" }
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
      "price": 1,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}tweaky/${slug}`,
      ...commonOfferDetails
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title,
    "description": desc,
    "image": [tweak.image_url || `${baseUrl}/logo.png`],
    "datePublished": tweak.created_at || new Date().toISOString(),
    "author": { "@type": "Organization", "name": "The Hardware Guru", "url": baseUrl }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div className="guru-tweak-wrapper" style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px' 
    }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />

      <main className="inner-container" style={{ 
          maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', 
          borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' 
      }}>
        
        {tweak.image_url && (
          <div className="tweak-hero" style={{ width: '100%', height: '450px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={tweak.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={backLinkPath} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
              </Link>
            </div>
          </div>
        )}

        <div className="content-wrapper" style={{ padding: '40px 50px 60px 50px' }}>
          
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div className="meta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308' }}><ShieldCheck size={16} /> GURU ENGINE</span>
              <span className="separator">•</span>
              <span suppressHydrationWarning style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {new Date(tweak.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            <h1 className="main-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0', textShadow: '0 0 20px rgba(234, 179, 8, 0.2)' }}>
              {title}
            </h1>
          </header>

          {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
              <div className="ad-desktop-wrapper">
                  <SeznamAd zoneId={408654} width={970} height={210} />
              </div>
              <div className="ad-mobile-wrapper">
                  <SeznamAd zoneId={408651} width={300} height={250} />
              </div>
          </div>

          <div className="guru-prose">
              <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {tweak.affiliate_link && (
            <div className="affiliate-box" style={{ 
              marginTop: '70px', padding: '50px 40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.9) 0%, rgba(15, 17, 21, 0.95) 100%)', 
              border: '2px solid rgba(249, 115, 22, 0.5)', borderRadius: '24px', 
              textAlign: 'center', boxShadow: '0 20px 50px rgba(249, 115, 22, 0.15)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
              <h3 className="affiliate-title" style={{ fontSize: '32px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                {isEn ? "Ready for this hardware?" : "Nenech si tuhle pecku ujít!"}
              </h3>
              <p className="affiliate-desc" style={{ color: '#9ca3af', marginBottom: '35px', fontSize: '17px', maxWidth: '600px', margin: '0 auto 35px auto', lineHeight: '1.6' }}>
                {isEn 
                  ? "We found the best deal for you. Instant delivery and Guru-verified store." 
                  : "Našli jsme pro tebe tu nejlepší cenu na trhu. Okamžité doručení klíče a Guru-ověřený obchod."}
              </p>
              <a href={tweak.affiliate_link} target="_blank" rel="nofollow sponsored" className="guru-affiliate-cta">
                <ShoppingCart size={26} /> {buyBtnText}
              </a>
            </div>
          )}

          <div className="share-row" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '50px' }}>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="nofollow noopener" className="share-link-x">
                  <Share2 size={16} /> TWITTER / X
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="nofollow noopener" className="share-link-fb">
                  <Share2 size={16} /> FACEBOOK
              </a>
          </div>

          <div className="silo-row" style={{ marginTop: '60px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#66fcf1' }}>
                  <div className="silo-banner-icon" style={{ color: '#66fcf1', background: '#66fcf120' }}><Cpu size={28} /></div>
                  <div className="silo-banner-text">
                      <h4>{isEn ? 'CPU DATABASE' : 'KATALOG PROCESORŮ'}</h4>
                      <p>{isEn ? 'Compare specs.' : 'Porovnej specifikace.'}</p>
                  </div>
              </a>
              <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#a855f7' }}>
                  <div className="silo-banner-icon" style={{ color: '#a855f7', background: '#a855f720' }}><Monitor size={28} /></div>
                  <div className="silo-banner-text">
                      <h4>{isEn ? 'GPU DATABASE' : 'KATALOG GRAFIK'}</h4>
                      <p>{isEn ? 'Find best graphics cards.' : 'Objev ty nejlepší grafiky.'}</p>
                  </div>
              </a>
          </div>

        </div>
      </main>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #eab308; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(234, 179, 8, 0.3); transition: 0.3s; backdrop-filter: blur(5px); }
        .guru-back-btn:hover { background: #eab308; color: #000; transform: scale(1.05); }

        .share-link-x { display: flex; align-items: center; gap: 8px; background: #1da1f220; color: #1da1f2; border: 1px solid #1da1f250; padding: 10px 20px; border-radius: 12px; font-weight: 950; text-decoration: none; transition: 0.3s; }
        .share-link-fb { display: flex; align-items: center; gap: 8px; background: #1877f220; color: #1877f2; border: 1px solid #1877f250; padding: 10px 20px; border-radius: 12px; font-weight: 950; text-decoration: none; transition: 0.3s; }

        .guru-affiliate-cta { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 22px 45px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 18px; text-transform: uppercase; border-radius: 18px; text-decoration: none !important; transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3); }
        .guru-affiliate-cta:hover { transform: scale(1.02); filter: brightness(1.1); box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5); }
        
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.9; }
        .guru-prose h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-top: 2.5em; text-transform: uppercase; border-left: 5px solid #eab308; padding-left: 20px; }
        .guru-prose p { margin-bottom: 1.8em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        
        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; border-left-width: 5px; border-left-style: solid; }
        .silo-banner-card:hover { background: rgba(255,255,255,0.03); transform: translateY(-5px); }
        .silo-banner-icon { width: 55px; height: 55px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .silo-banner-text h4 { margin: 0; color: #fff; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
        .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.85rem; }

        /* 🔥 STICKY BOTTOM ANCHOR CSS */
        .sticky-bottom-anchor {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 11, 13, 0.98);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
        }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
          .guru-tweak-wrapper { padding-top: 80px !important; }
          .inner-container { border-radius: 0 !important; border: none !important; }
          .tweak-hero { height: 250px !important; }
          .content-wrapper { padding: 30px 20px 60px 20px !important; }
          .main-title { font-size: 1.8rem !important; }
          .meta-row { flex-wrap: wrap; gap: 8px !important; font-size: 10px !important; }
          .separator { display: none; }
          .guru-prose { font-size: 1.05rem !important; line-height: 1.8 !important; }
          .guru-prose h2 { font-size: 1.4rem !important; margin-top: 1.8em !important; padding-left: 15px !important; }
          .affiliate-box { padding: 35px 20px !important; margin-top: 50px !important; }
          .affiliate-title { font-size: 1.4rem !important; }
          .affiliate-desc { font-size: 14px !important; }
          .guru-affiliate-cta { font-size: 15px !important; width: 100%; padding: 18px !important; }
          .share-row { flex-direction: column; }
          .share-link-x, .share-link-fb { width: 100%; justify-content: center; }
          .silo-banner-card { flex-direction: column; text-align: center; gap: 15px !important; }
          .ad-desktop-wrapper { display: none !important; }
          .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
        }
      `}} />
    </div>
  );
}
