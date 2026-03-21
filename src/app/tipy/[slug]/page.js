import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart, 
  Share2, Swords, ArrowRight, Gamepad2, Twitter, Sparkles 
} from 'lucide-react';

/**
 * GURU TIP ENGINE V5.2 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Maximální zisk z Tipů a triků skrze responzivní reklamy.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = "https://thehardwareguru.cz";

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

const getLatestTips = async (excludeId) => {
    const { data } = await supabase
        .from('tipy')
        .select('title, title_en, slug, slug_en, created_at, image_url')
        .neq('id', excludeId)
        .order('created_at', { ascending: false })
        .limit(3);
    return data || [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: tip } = await supabase.from('tipy').select('*').or(`slug.eq."${slug}",slug_en.eq."${slug}"`).single();
  
  if (!tip) return { title: 'Stránka nenalezena | Hardware Guru' };
  
  const isEn = tip.slug_en === slug;
  const title = isEn && tip.title_en ? tip.title_en : tip.title;
  const description = isEn && tip.seo_description_en ? tip.seo_description_en : tip.seo_description;

  return {
    title: `${title} | The Hardware Guru`,
    description: description,
    alternates: {
      canonical: `${baseUrl}/tipy/${tip.slug}`,
      languages: {
        'en': `${baseUrl}/en/tipy/${tip.slug_en || tip.slug}`,
        'cs': `${baseUrl}/tipy/${tip.slug}`,
      }
    }
  };
}

export default async function TipDetail({ params }) {
  const { slug } = await params;
  const { data: tip } = await supabase.from('tipy').select('*').or(`slug.eq."${slug}",slug_en.eq."${slug}"`).single();
  
  if (!tip) notFound();

  const latestTips = await getLatestTips(tip.id);
  const isEn = tip.slug_en === slug;
  const title = isEn && tip.title_en ? tip.title_en : tip.title;
  const content = isEn && tip.content_en ? tip.content_en : tip.content;
  const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}tipy/${slug}`;

  // 🚀 GURU ADS INJECTION: Rozdělení obsahu
  const contentParts = content ? content.split('</p>') : [];
  const midPoint = Math.ceil(contentParts.length / 2);
  const firstHalf = contentParts.slice(0, midPoint).join('</p>');
  const secondHalf = contentParts.slice(midPoint).join('</p>');

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "image": [tip.image_url || `${baseUrl}/logo.png`],
    "datePublished": tip.created_at,
    "author": { "@type": "Person", "name": "The Hardware Guru" },
    "publisher": {
      "@type": "Organization",
      "name": "The Hardware Guru",
      "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` }
    },
    "description": isEn ? tip.seo_description_en : tip.seo_description
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' }}>
        
        {tip.image_url && (
          <div style={{ width: '100%', height: '450px', position: 'relative' }}>
            <img src={tip.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={isEn ? '/en/tipy' : '/tipy'} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO TIPS' : 'ZPĚT NA TIPY'}
              </Link>
            </div>
          </div>
        )}

        <div style={{ padding: '40px 50px 60px 50px' }}>
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div className="guru-header-meta">
              <span className="guru-badge"><ShieldCheck size={16} /> GURU ENGINE</span>
              <span>•</span>
              <span className="date-span"><Calendar size={16} /> {new Date(tip.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            <h1 className="tip-h1">{title}</h1>
          </header>

          {/* 🔥 ADS SLOT #1: POD NADPISEM */}
          <div className="guru-ad-slot">
             <span className="ad-label">Advertisement</span>
             <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
             <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
          </div>

          <div className="guru-prose">
             <div dangerouslySetInnerHTML={{ __html: firstHalf + (contentParts.length > 1 ? '</p>' : '') }} />

             {/* 🔥 ADS SLOT #2: UPROSTŘED OBSAHU */}
             {contentParts.length > 2 && (
               <div className="guru-ad-slot">
                  <span className="ad-label">Sponsored Content</span>
                  <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                  <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
               </div>
             )}

             <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
          </div>

          <div className="gta6-bait-box">
              <div className="gta6-badge"><Sparkles size={16} /> AI NEXT-GEN PREDIKCE</div>
              <h3 className="gta6-title">{isEn ? 'WILL YOUR PC RUN GTA VI?' : 'ZVLÁDNE TO TVŮJ PC?'}</h3>
              <p className="gta6-p">
                  {isEn ? 'Get an exclusive FPS prediction for Grand Theft Auto VI based on your hardware.' : 'Získej exkluzivní odhad FPS pro Grand Theft Auto VI na tvém hardwaru.'}
              </p>
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="gta6-link">
                  <Gamepad2 size={20} /> {isEn ? 'TEST GTA VI PERFORMANCE' : 'ZJISTIT FPS V GTA VI'} <ArrowRight size={18} />
              </a>
          </div>

          <div className="share-grid">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" className="share-card x-bg">
                  <Twitter size={18} /> X / TWITTER
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card fb-bg">
                  <Share2 size={18} /> FACEBOOK
              </a>
              <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`} target="_blank" className="share-card reddit-bg">
                  <RedditIcon size={18} /> REDDIT
              </a>
          </div>

          <div className="duel-grid">
              <Link href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-card cpu-border">
                  <div className="silo-icon cpu-bg"><Swords size={24} /></div>
                  <div className="silo-text">
                      <h4>{isEn ? 'CPU BATTLES' : 'SROVNÁNÍ PROCESORŮ'}</h4>
                      <p>{isEn ? 'Find the best CPU.' : 'Najděte nejlepší procesor.'}</p>
                  </div>
              </Link>
              <Link href={isEn ? "/en/gpuvs" : "/gpuvs"} className="silo-card gpu-border">
                  <div className="silo-icon gpu-bg"><Swords size={24} /></div>
                  <div className="silo-text">
                      <h4>{isEn ? 'GPU BATTLES' : 'SROVNÁNÍ GRAFIK'}</h4>
                      <p>{isEn ? 'Find the best GPU.' : 'Najděte nejlepší grafiku.'}</p>
                  </div>
              </Link>
          </div>

          {latestTips.length > 0 && (
            <section style={{ marginTop: '60px' }}>
              <h2 className="section-title">{isEn ? 'READ MORE' : 'DALŠÍ ČTENÍ'}</h2>
              <div className="related-grid">
                {latestTips.map((lt) => (
                  <Link key={lt.slug} href={isEn ? `/en/tipy/${lt.slug_en || lt.slug}` : `/tipy/${lt.slug}`} className="related-card">
                    <img src={lt.image_url} alt={isEn ? lt.title_en : lt.title} />
                    <div className="related-info">
                      <h3>{isEn ? lt.title_en : lt.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="global-cta">
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
              <Link href={isEn ? "/en/support" : "/support"} className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</Link>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-header-meta { display: flex; align-items: center; justify-content: center; gap: 15px; color: #9ca3af; font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 25px; }
        .guru-badge { color: #66fcf1; display: flex; align-items: center; gap: 6px; }
        .tip-h1 { font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 950; color: #fff; text-transform: uppercase; line-height: 1.1; margin: 0; }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; margin-bottom: 40px; }
        
        /* GURU ADS STYLES */
        .guru-ad-slot { margin: 30px 0; padding: 15px; background: rgba(102, 252, 241, 0.02); border: 1px solid rgba(102, 252, 241, 0.1); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; }
        .ad-mobile { display: none; }

        .gta6-bait-box { background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 17, 21, 0.98) 100%); border: 1px solid rgba(244, 63, 94, 0.4); padding: 40px; border-radius: 24px; text-align: center; margin: 40px 0; }
        .gta6-badge { display: inline-flex; align-items: center; gap: 8px; background: #f43f5e; color: #fff; padding: 6px 15px; border-radius: 8px; font-size: 10px; font-weight: 950; margin-bottom: 15px; text-transform: uppercase; }
        .gta6-title { font-size: 1.8rem; font-weight: 950; color: #fff; margin: 0 0 10px 0; text-transform: uppercase; }
        .gta6-link { display: inline-flex; align-items: center; gap: 12px; background: #f43f5e; color: #fff; padding: 16px 30px; border-radius: 12px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .share-card { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 15px; border-radius: 12px; font-weight: 950; font-size: 11px; text-decoration: none; color: #fff; transition: 0.3s; }
        .x-bg { background: #000; border: 1px solid #333; }
        .fb-bg { background: #1877f2; }
        .reddit-bg { background: #ff4500; }
        .duel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .silo-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 15px; display: flex; align-items: center; gap: 15px; text-decoration: none; border-left: 4px solid transparent; transition: 0.3s; }
        .cpu-border { border-left-color: #66fcf1; }
        .gpu-border { border-left-color: #ff0055; }
        .silo-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .cpu-bg { color: #66fcf1; background: rgba(102, 252, 241, 0.1); }
        .gpu-bg { color: #ff0055; background: rgba(255, 0, 85, 0.1); }
        .silo-text h4 { margin: 0; color: #fff; font-size: 0.9rem; font-weight: 950; text-transform: uppercase; }
        .section-title { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; border-left: 4px solid #66fcf1; padding-left: 15px; }
        .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .related-card { background: #000; border-radius: 12px; overflow: hidden; text-decoration: none; border: 1px solid #222; transition: 0.3s; }
        .related-card img { width: 100%; height: 110px; object-fit: cover; }
        .related-info { padding: 12px; }
        .related-info h3 { margin: 0; color: #fff; font-size: 0.85rem; font-weight: 900; }
        .global-cta { margin-top: 50px; display: flex; gap: 15px; }
        .deals-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; border-radius: 12px; font-weight: 950; text-decoration: none; text-transform: uppercase; background: #ea580c; color: #fff; transition: 0.3s; }
        .support-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; border-radius: 12px; font-weight: 950; text-decoration: none; text-transform: uppercase; background: #eab308; color: #000; transition: 0.3s; }

        @media (max-width: 768px) {
            .share-grid, .duel-grid, .related-grid, .global-cta { grid-template-columns: 1fr; flex-direction: column; }
            .ad-desktop { display: none; }
            .ad-mobile { display: block; }
            .gta6-bait-box { padding: 25px; }
            .guru-prose { font-size: 1.05rem; }
        }
      `}} />
    </div>
  );
}
