import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart, Info, Monitor, Play, Sparkles, Gamepad2, Twitter, Share2, Swords, ArrowRight, Cpu } from 'lucide-react';

/**
 * GURU EXPECTED GAME ENGINE - DETAIL V5.0 (THE GTA 6 & VIRAL HUB)
 * 🚀 CÍL: Přeměnit hype z budoucích her na traffic pro GTA 6 kalkulačku.
 * 🛡️ FIX: Implementace Reddit/X/FB share, GTA VI návnady a HW Siloingu.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = "https://thehardwareguru.cz";

// Reddit Ikona (SVG)
const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: post } = await supabase.from('posts').select('title, title_en, seo_description, seo_description_en, image_url, slug, slug_en').or(`slug.eq.${slug},slug_en.eq.${slug}`).single();
  if (!post) return { title: '404' };
  const isEn = post.slug_en === slug && slug !== post.slug;
  return { title: `${isEn ? post.title_en : post.title} | The Hardware Guru`, description: isEn ? post.seo_description_en : post.seo_description };
}

export default async function ExpectedGameDetail({ params }) {
  const { slug } = await params;
  const { data: post, error } = await supabase.from('posts').select('*').or(`slug.eq.${slug},slug_en.eq.${slug}`).single();
  if (error || !post) notFound();

  const isEn = post.slug_en === slug && post.slug_en !== post.slug;
  const title = isEn && post.title_en ? post.title_en : post.title;
  const content = isEn && post.content_en ? post.content_en : post.content;
  const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}ocekavane-hry/${slug}`;
  const dateObj = post.created_at ? new Date(post.created_at) : new Date();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' }}>
        
        {post.image_url && (
          <div style={{ width: '100%', height: '450px', position: 'relative' }}>
            <img src={post.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={isEn ? '/en/ocekavane-hry' : '/ocekavane-hry'} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO LIST' : 'ZPĚT NA SEZNAM'}
              </Link>
            </div>
          </div>
        )}

        <div style={{ padding: '40px 50px 60px 50px' }}>
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div className="guru-meta-info">
              <span className="guru-badge"><ShieldCheck size={16} /> GURU TECH PREVIEW</span>
              <span>•</span>
              <span className="date-span"><Calendar size={16} /> {dateObj.toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            <h1 className="main-title">{title}</h1>
          </header>

          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* 🚀 GTA 6 CONVERSION BAIT */}
          <div className="gta6-bait-box">
              <div className="gta6-badge"><Sparkles size={16} /> AI NEXT-GEN PREDIKCE</div>
              <h3 className="gta6-title">{isEn ? 'WILL YOUR PC RUN GTA VI?' : 'ZVLÁDNE TO TVŮJ PC?'}</h3>
              <p className="gta6-p">
                  {isEn ? 'Use our AI engine to predict your FPS in Grand Theft Auto VI based on your hardware.' : 'Použij náš AI engine a zjisti odhad výkonu pro Grand Theft Auto VI na tvém PC.'}
              </p>
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="gta6-link">
                  <Gamepad2 size={20} /> {isEn ? 'TEST GTA VI FPS' : 'ZJISTIT FPS V GTA VI'} <ArrowRight size={18} />
              </a>
          </div>

          {/* 🚀 VIRAL SHARE HUB (X, FB, REDDIT) */}
          <div className="share-grid">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" className="share-card x-bg">
                  <Twitter size={18} /> TWITTER / X
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card fb-bg">
                  <Share2 size={18} /> FACEBOOK
              </a>
              <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`} target="_blank" className="share-card reddit-bg">
                  <RedditIcon size={18} /> REDDIT
              </a>
          </div>

          {/* 🚀 HW SILO HUB (CPU & GPU) */}
          <div className="duel-grid">
              <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-card cpu-border">
                  <div className="silo-icon cpu-bg"><Swords size={24} /></div>
                  <div className="silo-text">
                      <h4>{isEn ? 'CPU BATTLES' : 'SROVNÁNÍ PROCESORŮ'}</h4>
                      <p>{isEn ? 'Tech analysis of the best CPUs.' : 'Technický rozbor nejlepších CPU.'}</p>
                  </div>
              </a>
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="silo-card gpu-border">
                  <div className="silo-icon gpu-bg"><Swords size={24} /></div>
                  <div className="silo-text">
                      <h4>{isEn ? 'GPU BATTLES' : 'SROVNÁNÍ GRAFIK'}</h4>
                      <p>{isEn ? 'Ultimate gaming graphics cards.' : 'Nejvýkonnější herní grafiky.'}</p>
                  </div>
              </a>
          </div>

          <div className="global-cta-row">
              <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" className="deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
              <Link href={isEn ? "/en/support" : "/support"} className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</Link>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-meta-info { display: flex; align-items: center; justify-content: center; gap: 15px; color: #9ca3af; font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 25px; }
        .guru-badge { color: #66fcf1; display: flex; align-items: center; gap: 6px; }
        .main-title { font-size: clamp(2.2rem, 5vw, 3.5rem); fontWeight: 950; color: #fff; text-transform: uppercase; line-height: 1.1; margin: 0; }
        
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; margin-bottom: 40px; }
        .guru-prose h2 { color: #66fcf1; font-size: 1.8rem; font-weight: 950; margin-top: 2em; text-transform: uppercase; border-left: 4px solid #f43f5e; padding-left: 15px; }

        .gta6-bait-box { background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 17, 21, 0.98) 100%); border: 1px solid rgba(244, 63, 94, 0.4); padding: 40px; border-radius: 24px; text-align: center; margin: 50px 0; }
        .gta6-badge { display: inline-flex; align-items: center; gap: 8px; background: #f43f5e; color: #fff; padding: 6px 15px; border-radius: 8px; font-size: 10px; font-weight: 950; margin-bottom: 15px; text-transform: uppercase; }
        .gta6-title { font-size: 1.8rem; font-weight: 950; color: #fff; margin: 0 0 10px 0; text-transform: uppercase; }
        .gta6-p { color: #9ca3af; margin-bottom: 25px; font-size: 1.1rem; }
        .gta6-link { display: inline-flex; align-items: center; gap: 12px; background: #f43f5e; color: #fff; padding: 16px 35px; border-radius: 12px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .gta6-link:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(244, 63, 94, 0.4); }

        .share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
        .share-card { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; border-radius: 12px; font-weight: 950; font-size: 11px; text-decoration: none; color: #fff; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        .x-bg { background: #000; }
        .fb-bg { background: #1877f2; }
        .reddit-bg { background: #ff4500; }
        .share-card:hover { transform: translateY(-3px); filter: brightness(1.2); }

        .duel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 40px; }
        .silo-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; padding: 20px; display: flex; align-items: center; gap: 15px; text-decoration: none; border-left: 4px solid transparent; transition: 0.3s; }
        .cpu-border { border-left-color: #66fcf1; }
        .gpu-border { border-left-color: #ff0055; }
        .silo-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cpu-bg { color: #66fcf1; background: rgba(102, 252, 241, 0.1); }
        .gpu-bg { color: #ff0055; background: rgba(255, 0, 85, 0.1); }
        .silo-text h4 { margin: 0; color: #fff; font-size: 1rem; font-weight: 950; text-transform: uppercase; }
        .silo-text p { margin: 0; color: #9ca3af; font-size: 0.8rem; }
        .silo-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.05); }

        .global-cta-row { display: flex; gap: 20px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); }
        .deals-btn, .support-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 20px; border-radius: 14px; font-weight: 950; text-decoration: none; text-transform: uppercase; font-size: 14px; transition: 0.3s; }
        .deals-btn { background: #ea580c; color: #fff; }
        .support-btn { background: #eab308; color: #000; }
        .deals-btn:hover, .support-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }

        @media (max-width: 768px) {
            .share-grid, .duel-grid, .global-cta-row { grid-template-columns: 1fr; flex-direction: column; }
            .gta6-bait-box { padding: 25px; }
            .guru-prose { font-size: 1.05rem; }
        }
      `}} />
    </div>
  );
}
