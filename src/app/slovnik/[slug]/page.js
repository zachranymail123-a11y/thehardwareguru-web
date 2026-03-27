import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart, Info, BookOpen, Share2, Cpu, Monitor } from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU GLOSSARY ENGINE - DETAIL V2.3 (SEZNAM ADS INTEGRATION)
 * 🚀 CÍL: 100% monetizace slovníkových pojmů skrze Seznam Partner.
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const { data: term } = await supabase
    .from('slovnik')
    .select('title, title_en, seo_description, seo_description_en, image_url, slug, slug_en')
    .or(`slug.eq."${slug}",slug_en.eq."${slug}"`)
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

  const { data: term, error } = await supabase
    .from('slovnik')
    .select('*')
    .or(`slug.eq."${slug}",slug_en.eq."${slug}"`)
    .single();

  if (error || !term) {
    notFound();
  }

  const latestTerms = await getLatestTerms(term.slug);

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
  const backLinkPath = isEn ? '/en/slovnik' : '/slovnik';
  const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}slovnik/${slug}`;
  const dateObj = term.created_at ? new Date(term.created_at) : new Date();

  // 🚀 GURU ADS INJECTION LOGIC
  const contentParts = content ? content.split('</p>') : [];
  const midPoint = Math.ceil(contentParts.length / 2);
  const firstHalf = contentParts.slice(0, midPoint).join('</p>');
  const secondHalf = contentParts.slice(midPoint).join('</p>');

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
      "price": 1,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}slovnik/${slug}`,
      "availability": "https://schema.org/InStock"
    }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px' 
    }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />

      <main style={{ 
          maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', 
          borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' 
      }}>
        
        {term.image_url && (
          <div style={{ width: '100%', height: '450px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={term.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={backLinkPath} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}
              </Link>
            </div>
          </div>
        )}

        <div style={{ padding: '40px 50px 60px 50px' }}>
          
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#66fcf1' }}><ShieldCheck size={16} /> GURU ENGINE</span>
              <span>•</span>
              <span suppressHydrationWarning style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {dateObj.toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0', textShadow: '0 0 20px rgba(102, 252, 241, 0.2)' }}>
              {title}
            </h1>
          </header>

          {/* 🔥 SEZNAM AD #1: TOP BANNER POD NADPISEM */}
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <SeznamAd zoneId={408654} width={970} height={210} />
          </div>

          <div className="guru-prose">
             <div dangerouslySetInnerHTML={{ __html: firstHalf + (contentParts.length > 1 ? '</p>' : '') }} />

             {/* 🔥 SEZNAM AD #2: IN-CONTENT BANNER */}
             {contentParts.length > 2 && (
               <div style={{ margin: '30px 0', display: 'flex', justifyContent: 'center' }}>
                  <SeznamAd zoneId={408651} width={300} height={250} />
               </div>
             )}

             <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
          </div>

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

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '50px' }}>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="nofollow noopener" className="share-btn-x">
                  <Share2 size={16} /> TWITTER / X
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="nofollow noopener" className="share-btn-fb">
                  <Share2 size={16} /> FACEBOOK
              </a>
          </div>

          <div style={{ marginTop: '60px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#66fcf1' }}>
                  <div className="silo-banner-icon" style={{ color: '#66fcf1', background: '#66fcf120' }}><Cpu size={28} /></div>
                  <div className="silo-banner-text">
                      <h4>{isEn ? 'CPU DATABASE' : 'KATALOG PROCESORŮ'}</h4>
                      <p>{isEn ? 'Compare specs and find the best processor.' : 'Porovnejte specifikace a najděte ten nejlepší procesor.'}</p>
                  </div>
              </a>
              <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-banner-card" style={{ borderLeftColor: '#a855f7' }}>
                  <div className="silo-banner-icon" style={{ color: '#a855f7', background: '#a855f720' }}><Monitor size={28} /></div>
                  <div className="silo-banner-text">
                      <h4>{isEn ? 'GPU DATABASE' : 'KATALOG GRAFIK'}</h4>
                      <p>{isEn ? 'Discover the ultimate gaming graphics cards.' : 'Objevte ty nejlepší grafiky pro hraní.'}</p>
                  </div>
              </a>
          </div>

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        
        .share-btn-x { display: flex; align-items: center; gap: 8px; background: #1da1f220; color: #1da1f2; border: 1px solid #1da1f250; padding: 10px 20px; border-radius: 12px; fontWeight: 950; text-decoration: none; transition: 0.3s; }
        .share-btn-fb { display: flex; align-items: center; gap: 8px; background: #1877f220; color: #1877f2; border: 1px solid #1877f250; padding: 10px 20px; border-radius: 12px; fontWeight: 950; text-decoration: none; transition: 0.3s; }

        .guru-affiliate-cta { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 22px 45px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 18px; text-transform: uppercase; border-radius: 18px; text-decoration: none !important; transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #66fcf1; font-size: 2.2rem; font-weight: 950; margin-top: 2.5em; text-transform: uppercase; }
        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; border-left-width: 5px; }

        @media (max-width: 768px) {
          .guru-affiliate-cta { font-size: 15px; width: 100%; }
          .silo-banner-card { flex-direction: column; text-align: center; }
          .guru-prose { font-size: 1.05rem; }
        }
      `}} />
    </div>
  );
}
