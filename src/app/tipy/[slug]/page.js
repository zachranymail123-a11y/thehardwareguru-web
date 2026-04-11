import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
 ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart, 
 Share2, Swords, ArrowRight, Gamepad2, Twitter, Sparkles, AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';

/**
 * GURU TIP ENGINE V5.8 (EN FIX + AFFILIATE BOMB + TOOLS)
 * 🚀 CÍL: Fix EN detekce, Amazon affiliate a integrace kalkulaček do detailu tipu.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = "https://thehardwareguru.cz";

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" /></svg>
);

const getLatestTips = async (excludeId) => {
    const { data } = await supabase.from('tipy').select('title, title_en, slug, slug_en, created_at, image_url').neq('id', excludeId).order('created_at', { ascending: false }).limit(3);
    return data || [];
}

export async function generateMetadata(props) {
  const { slug } = await props.params;
  const h = headers();
  const fullUrl = h.get('x-url') || h.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || slug?.startsWith('en-');
  const { data: tip } = await supabase.from('tipy').select('*').or(`slug.eq."${slug}",slug_en.eq."${slug}"`).single();
  if (!tip) return { title: '404 | Hardware Guru' };
  const title = isEn && tip.title_en ? tip.title_en : tip.title;
  return {
    title: `${title} | The Hardware Guru`,
    alternates: {
      canonical: isEn ? `${baseUrl}/en/tipy/${tip.slug_en || tip.slug}` : `${baseUrl}/tipy/${tip.slug}`,
      languages: { 'en': `${baseUrl}/en/tipy/${tip.slug_en || tip.slug}`, 'cs': `${baseUrl}/tipy/${tip.slug}` }
    }
  };
}

export default async function TipDetail(props) {
  const { slug } = await props.params;
  const h = headers();
  const fullUrl = h.get('x-url') || h.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || slug?.startsWith('en-');

  const { data: tip } = await supabase.from('tipy').select('*').or(`slug.eq."${slug}",slug_en.eq."${slug}"`).single();
  if (!tip) notFound();

  const latestTips = await getLatestTips(tip.id);
  const title = isEn && tip.title_en ? tip.title_en : tip.title;
  const content = isEn && tip.content_en ? tip.content_en : tip.content;
  const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}tipy/${slug}`;

  const amazonLink = `https://www.amazon.com/s?k=gaming+hardware&tag=thehardware07-20`;
  const smartyLink = `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz`)}`;
  const heurekaLink = `https://www.heureka.cz/#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Tip%20detail`;

  return (
    <div className="guru-tip-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px' }}>
      <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' }}>
        
        {tip.image_url && (
          <div className="tip-hero-img" style={{ width: '100%', height: '400px', position: 'relative' }}>
            <img src={tip.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={isEn ? '/en/tipy' : '/tipy'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</Link>
            </div>
          </div>
        )}

        <div className="content-padding-box" style={{ padding: '40px 50px 60px 50px' }}>
          <header style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div className="guru-header-meta">
              <span className="guru-badge"><ShieldCheck size={16} /> GURU ENGINE</span>
              <span className="separator">•</span>
              <span className="date-span"><Calendar size={16} /> {new Date(tip.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            <h1 className="tip-h1">{title}</h1>
          </header>

          <div className="affiliate-cta-grid" style={{ marginBottom: '30px' }}>
              <div className="affiliate-btn-wrap">
                  {isEn ? (
                      <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn"><ShoppingCart size={16} /> Check Deals on Amazon</a>
                  ) : (
                      <>
                          <a href={smartyLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={16} /> Smarty.cz</a>
                          <a href={heurekaLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn"><ShoppingCart size={16} /> Heureka.cz</a>
                      </>
                  )}
              </div>
          </div>

          <div className="guru-tools-small-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
              <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="tool-btn-small purple-link"><AlertTriangle size={16} /> {isEn ? 'Bottleneck' : 'Bottleneck'}</a>
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="tool-btn-small cyan-link"><Gamepad2 size={16} /> {isEn ? 'FPS Test' : 'FPS Test'}</a>
          </div>

          <div style={{ marginBottom: '40px' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>

          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {!isEn && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><HeurekaButtons isEn={false} /></div>
          )}

          <div className="gta6-bait-box">
              <div className="gta6-badge"><Sparkles size={16} /> AI {isEn ? 'PREDICTION' : 'PREDIKCE'}</div>
              <h3 className="gta6-title">{isEn ? 'WILL YOUR PC RUN GTA VI?' : 'ZVLÁDNE TO TVŮJ PC?'}</h3>
              <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="gta6-link"><Gamepad2 size={20} /> {isEn ? 'TEST GTA VI FPS' : 'ZJISTIT FPS V GTA VI'} <ArrowRight size={18} /></a>
          </div>

          <div className="share-grid">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card x-bg"><Twitter size={18} /> X</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card fb-bg"><Share2 size={18} /> FB</a>
              <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card reddit-bg"><RedditIcon size={18} /> REDDIT</a>
          </div>

          <div className="duel-grid">
              <Link href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-card cpu-border"><div className="silo-icon cpu-bg"><Swords size={24} /></div><div className="silo-text"><h4>{isEn ? 'CPU BATTLES' : 'SROVNÁNÍ PROCESORŮ'}</h4></div></Link>
              <Link href={isEn ? "/en/gpuvs" : "/gpuvs"} className="silo-card gpu-border"><div className="silo-icon gpu-bg"><Swords size={24} /></div><div className="silo-text"><h4>{isEn ? 'GPU BATTLES' : 'SROVNÁNÍ GRAFIK'}</h4></div></Link>
          </div>

          {latestTips.length > 0 && (
            <section style={{ marginTop: '50px' }}>
              <h2 className="section-title">{isEn ? 'READ MORE' : 'DALŠÍ TIPY'}</h2>
              <div className="related-grid">
                {latestTips.map((lt) => (
                  <Link key={lt.slug} href={isEn ? `/en/tipy/${lt.slug_en || lt.slug}` : `/tipy/${lt.slug}`} className="related-card">
                    <img src={lt.image_url} alt={isEn ? lt.title_en : lt.title} />
                    <div className="related-info"><h3>{isEn ? lt.title_en : lt.title}</h3></div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="sticky-bottom-anchor"><SeznamAd zoneId={408654} width={970} height={90} /></div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-header-meta { display: flex; align-items: center; justify-content: center; gap: 15px; color: #9ca3af; font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 25px; }
        .guru-badge { color: #66fcf1; display: flex; align-items: center; gap: 6px; }
        .tip-h1 { font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 950; color: #fff; text-transform: uppercase; line-height: 1.1; margin: 0; }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; margin-bottom: 40px; }
        .guru-prose h2 { color: #fff; font-size: 2rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }
        .affiliate-cta-grid { background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 25px; }
        .affiliate-btn-wrap { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 16px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 15px; text-transform: uppercase; transition: 0.3s; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; }
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; width: 100%; max-width: 450px; }
        .tool-btn-small { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; border-radius: 12px; font-weight: 950; text-transform: uppercase; text-decoration: none; font-size: 12px; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        .purple-link { background: rgba(168, 85, 247, 0.1); color: #a855f7; border-color: rgba(168, 85, 247, 0.2); }
        .cyan-link { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: rgba(102, 252, 241, 0.2); }
        .tool-btn-small:hover { transform: translateY(-2px); filter: brightness(1.2); }
        .share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
        .share-card { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 15px; border-radius: 12px; font-weight: 950; font-size: 11px; text-decoration: none; color: #fff; }
        .x-bg { background: #000; }
        .fb-bg { background: #1877f2; }
        .reddit-bg { background: #ff4500; }
        .duel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 40px; }
        .silo-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 15px; display: flex; align-items: center; gap: 15px; text-decoration: none; border-left: 4px solid transparent; }
        .cpu-border { border-left-color: #66fcf1; }
        .gpu-border { border-left-color: #ff0055; }
        .silo-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .cpu-bg { color: #66fcf1; background: rgba(102, 252, 241, 0.1); }
        .gpu-bg { color: #ff0055; background: rgba(255, 0, 85, 0.1); }
        .section-title { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; border-left: 4px solid #66fcf1; padding-left: 15px; }
        .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .related-card { background: #000; border-radius: 12px; overflow: hidden; text-decoration: none; border: 1px solid #222; }
        .related-card img { width: 100%; height: 110px; object-fit: cover; }
        .related-info { padding: 12px; }
        .related-info h3 { margin: 0; color: #fff; font-size: 0.85rem; font-weight: 900; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        @media (max-width: 768px) {
            .content-padding-box { padding: 30px 20px !important; }
            .tip-h1 { font-size: 1.8rem !important; }
            .affiliate-btn-wrap { flex-direction: column; }
            .guru-buy-winner-btn { max-width: 100%; }
            .guru-tools-small-grid, .share-grid, .duel-grid, .related-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}
