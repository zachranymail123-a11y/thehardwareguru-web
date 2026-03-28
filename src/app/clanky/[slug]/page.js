import React from 'react';
import { notFound } from 'next/navigation';
import { ChevronLeft, Info, Calendar, Flame, Heart, Share2, Swords, Gauge, ArrowRight, Sparkles, Gamepad2, Twitter, Cpu, Monitor, User, Clock, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU ARTICLE ENGINE V5.5 (READER TRAP UPDATE)
 * 🚀 CÍL: Agresivní "Past na čtenáře" na konci článku pro maximalizaci pages/session a počtu zobrazených reklam.
 */

export const runtime = "nodejs";
export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const supabase = createClient(supabaseUrl, supabaseKey);

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

const getPost = async (slug) => {
    if (!slug) return null;
    const cleanSlug = slug.replace(/^en-/, '');
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`slug.eq."${cleanSlug}",slug_en.eq."${cleanSlug}"`)
        .limit(1)
        .single();
    if (error || !data) return null;
    return data;
}

const getLatestPosts = async (excludeId) => {
    const { data } = await supabase
        .from('posts')
        .select('title, title_en, slug, slug_en, created_at, image_url')
        .neq('id', excludeId)
        .order('created_at', { ascending: false })
        .limit(3);
    return data || [];
}

const getReadingTime = (text) => {
    const words = text ? text.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200); 
    return minutes < 1 ? 1 : minutes;
};

export async function generateMetadata(props) {
    const params = await props.params;
    const rawSlug = params?.slug || '';
    const isEn = rawSlug.startsWith('en-');
    const post = await getPost(rawSlug);

    if (!post) return { title: '404 | The Hardware Guru' };

    const title = isEn && post.title_en ? post.title_en : post.title;
    const desc = isEn && post.seo_description_en ? post.seo_description_en : (post.seo_description_cs || post.description || '');
    const safeSlug = post.slug;
    const canonicalUrl = `${baseUrl}/clanky/${safeSlug}`;

    return {
        title: `${title} | The Hardware Guru`,
        description: desc,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en': `${baseUrl}/en/clanky/${post.slug_en || safeSlug}`,
                'cs': canonicalUrl
            }
        }
    };
}

export default async function ArticleDetailPage(props) {
    const params = await props.params;
    const rawSlug = params?.slug || '';
    const isEn = rawSlug.startsWith('en-');
    const post = await getPost(rawSlug);
    
    if (!post) notFound();

    const latestPosts = await getLatestPosts(post.id);
    const title = isEn && post.title_en ? post.title_en : post.title;
    const content = isEn && post.content_en ? post.content_en : (post.content_cs || post.content || '');
    const date = post.created_at || new Date().toISOString();
    const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
    const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}clanky/${post.slug}`;
    const readingTime = getReadingTime(content);

    // 🚀 GURU ADS INJECTION LOGIC (3. a 6. odstavec)
    const contentParts = content ? content.split('</p>') : [];
    
    // Část 1: Text před 1. reklamou (odstavce 0, 1, 2)
    const part1 = contentParts.slice(0, 3).join('</p>') + (contentParts.length > 3 ? '</p>' : '');
    // Část 2: Text mezi 1. a 2. reklamou (odstavce 3, 4, 5)
    const part2 = contentParts.slice(3, 6).join('</p>') + (contentParts.length > 6 ? '</p>' : '');
    // Část 3: Zbytek článku po 2. reklamě
    const part3 = contentParts.slice(6).join('</p>');

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "image": post.image_url ? [post.image_url] : [],
      "datePublished": date,
      "dateModified": post.updated_at || date,
      "author": [{
          "@type": "Person",
          "name": "The Hardware Guru",
          "url": `${baseUrl}/about`
      }]
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '40px' }}>
                    <a href={isEn ? "/en/clanky" : "/clanky"} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK TO ARTICLES' : 'ZPĚT NA ČLÁNKY'}
                    </a>
                </div>

                <article style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px 40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div className="guru-meta-badge">
                                <Calendar size={14} /> {formattedDate}
                            </div>
                            <div className="guru-meta-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                <Clock size={14} /> {readingTime} {isEn ? 'min read' : 'min. čtení'}
                            </div>
                        </div>

                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', lineHeight: '1.2', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
                            {title}
                        </h1>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
                             <User size={16} color="#a855f7" />
                             <span style={{ fontSize: '0.9rem', color: '#d1d5db', fontWeight: 'bold' }}>{isEn ? 'Author:' : 'Autor:'} <span style={{ color: '#fff' }}>The Hardware Guru</span></span>
                             <CheckCircle size={14} color="#10b981" title="Verified Expert" />
                        </div>
                    </header>

                    {post.image_url && (
                        <div style={{ marginBottom: '40px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <img src={post.image_url} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                    )}

                    <div className="guru-article-content">
                         {/* Text po 3. odstavec */}
                         {part1 && <div dangerouslySetInnerHTML={{ __html: part1 }} />}
                         
                         {/* 1. InText Reklama */}
                         {contentParts.length > 3 && (
                             <div style={{ margin: '40px 0', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                 <SeznamAd zoneId={408651} width={300} height={250} />
                             </div>
                         )}
                         
                         {/* Text mezi 3. a 6. odstavcem */}
                         {part2 && <div dangerouslySetInnerHTML={{ __html: part2 }} />}

                         {/* 2. InText Reklama */}
                         {contentParts.length > 6 && (
                             <div style={{ margin: '40px 0', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                 <SeznamAd zoneId={408651} width={300} height={250} />
                             </div>
                         )}

                         {/* Zbytek článku */}
                         {part3 && <div dangerouslySetInnerHTML={{ __html: part3 }} />}
                    </div>
                    
                    <SeznamAd zoneId={408658} width={480} height={300} />
                    
                    <div className="gta6-conversion-box">
                        <div className="gta6-badge"><Sparkles size={16} /> AI NEXT-GEN PREDIKCE</div>
                        <h3 className="gta6-title">{isEn ? 'WILL YOUR PC RUN GTA VI?' : 'ZVLÁDNE TO TVŮJ PC?'}</h3>
                        <p className="gta6-p">
                            {isEn ? 'Check your estimated performance for GTA VI based on your hardware.' : 'Zjisti exkluzivní odhad FPS pro Grand Theft Auto VI na tvém hardwaru.'}
                        </p>
                        <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="gta6-link">
                            <Gamepad2 size={20} /> {isEn ? 'TEST GTA VI FPS' : 'ZJISTIT FPS V GTA VI'} <ArrowRight size={18} />
                        </a>
                    </div>
                </article>

                <div style={{ marginTop: '50px' }}>
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

                    <div className="duel-grid">
                        <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-banner-card cpu-border">
                            <div className="silo-banner-icon cpu-icon-bg"><Swords size={28} /></div>
                            <div className="silo-banner-text">
                                <h4>{isEn ? 'CPU BATTLES' : 'SROVNÁNÍ PROCESORŮ'}</h4>
                                <p>{isEn ? 'Find the best CPU.' : 'Najděte nejlepší procesor.'}</p>
                            </div>
                        </a>
                        <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="silo-banner-card gpu-border">
                            <div className="silo-banner-icon gpu-icon-bg"><Swords size={28} /></div>
                            <div className="silo-banner-text">
                                <h4>{isEn ? 'GPU BATTLES' : 'SROVNÁNÍ GRAFIK'}</h4>
                                <p>{isEn ? 'Find the best GPU.' : 'Najděte nejlepší grafiku.'}</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* 🚀 PAST NA ČTENÁŘE (INFINITY LOOP) */}
                {latestPosts.length > 0 && (
                    <section className="guru-trap-section">
                        <h2 className="trap-title">
                            <Flame size={32} color="#a855f7" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px' }} />
                            {isEn ? "DON'T MISS THESE" : "GURU DOPORUČUJE"}
                        </h2>
                        <div className="trap-grid">
                            {latestPosts.map((lp, index) => (
                                <a key={lp.slug} href={isEn ? `/en/clanky/${lp.slug_en || lp.slug}` : `/clanky/${lp.slug}`} className="trap-card">
                                    {index === 0 && (
                                        <div className="hot-badge">
                                            <Flame size={14} /> {isEn ? 'HOT' : 'ŽHAVÉ'}
                                        </div>
                                    )}
                                    <div className="trap-img-wrapper">
                                        <img src={lp.image_url} alt={lp.title} className="trap-img" />
                                        <div className="trap-overlay"></div>
                                    </div>
                                    <div className="trap-info">
                                        <h3>{isEn ? lp.title_en : lp.title}</h3>
                                        <span className="read-more-btn">
                                            {isEn ? 'READ ARTICLE' : 'ČÍST ČLÁNEK'} <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
                .guru-meta-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; padding: 8px 15px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
                .guru-article-content { font-size: 1.15rem; line-height: 1.8; color: #d1d5db; margin-bottom: 40px; }
                .guru-article-content h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #a855f7; padding-left: 15px; }
                .guru-article-content h3 { color: #eab308; font-size: 1.4rem; font-weight: 900; margin: 1.2em 0 0.5em; }
                .guru-article-content p { margin-bottom: 1.5em; }
                .guru-article-content strong { color: #fff; font-weight: 900; }
                .guru-article-content ul, .guru-article-content ol { margin-bottom: 1.5em; padding-left: 20px; }
                .guru-article-content li { margin-bottom: 0.5em; }
                .guru-article-content blockquote { border-left: 4px solid #10b981; background: rgba(16, 185, 129, 0.05); padding: 20px; margin: 20px 0; font-style: italic; border-radius: 0 15px 15px 0; }
                .gta6-conversion-box { background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 17, 21, 0.98) 100%); border: 1px solid rgba(244, 63, 94, 0.4); padding: 40px; border-radius: 24px; text-align: center; box-shadow: 0 15px 40px rgba(244, 63, 94, 0.1); margin-top: 40px; }
                .gta6-badge { display: inline-flex; align-items: center; gap: 8px; background: #f43f5e; color: #fff; padding: 6px 15px; border-radius: 8px; font-size: 10px; font-weight: 950; margin-bottom: 20px; text-transform: uppercase; }
                .gta6-title { font-size: 1.8rem; font-weight: 950; color: #fff; margin: 0 0 10px 0; text-transform: uppercase; }
                .gta6-p { color: #9ca3af; margin-bottom: 25px; }
                .gta6-link { display: inline-flex; align-items: center; gap: 12px; background: #f43f5e; color: #fff; padding: 16px 35px; border-radius: 14px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
                .gta6-link:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(244, 63, 94, 0.4); }
                .share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
                .share-card { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; border-radius: 12px; font-weight: 950; font-size: 12px; text-decoration: none; color: #fff; transition: 0.3s; }
                .x-bg { background: #000; border: 1px solid #333; }
                .fb-bg { background: #1877f2; }
                .reddit-bg { background: #ff4500; }
                .share-card:hover { transform: translateY(-3px); filter: brightness(1.2); }
                .duel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .silo-banner-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 15px; text-decoration: none; transition: 0.3s; border-left: 5px solid transparent; }
                .cpu-border { border-left-color: #66fcf1; }
                .gpu-border { border-left-color: #ff0055; }
                .silo-banner-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .cpu-icon-bg { color: #66fcf1; background: rgba(102, 252, 241, 0.1); }
                .gpu-icon-bg { color: #ff0055; background: rgba(255, 0, 85, 0.1); }
                .silo-banner-text h4 { margin: 0; color: #fff; font-size: 1rem; font-weight: 950; text-transform: uppercase; }
                .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.8rem; }
                .silo-banner-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.02); }
                
                /* 🚀 GURU READER TRAP CSS */
                .guru-trap-section { margin-top: 80px; padding: 40px; background: linear-gradient(to bottom, rgba(168, 85, 247, 0.05) 0%, transparent 100%); border-top: 2px solid rgba(168, 85, 247, 0.3); border-radius: 30px; }
                .trap-title { font-size: 2.2rem; text-align: center; border: none; padding: 0; color: #fff; text-shadow: 0 0 20px rgba(168, 85, 247, 0.4); margin-bottom: 40px; font-weight: 950; text-transform: uppercase; }
                .trap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
                .trap-card { position: relative; background: #0a0b0d; border-radius: 20px; overflow: hidden; text-decoration: none; border: 1px solid rgba(255,255,255,0.05); transition: 0.4s; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .trap-img-wrapper { position: relative; width: 100%; height: 180px; overflow: hidden; }
                .trap-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                .trap-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,11,13,1) 0%, transparent 80%); z-index: 1; }
                .trap-info { padding: 25px 20px; position: relative; z-index: 2; background: #0a0b0d; text-align: center; }
                .trap-info h3 { margin: 0 0 20px 0; color: #fff; font-size: 1.05rem; font-weight: 900; line-height: 1.5; transition: 0.3s; }
                .read-more-btn { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; }
                
                /* 🚀 TRAP HOVER EFFECTS */
                .trap-card:hover { border-color: #a855f7; transform: translateY(-10px); box-shadow: 0 20px 40px rgba(168, 85, 247, 0.2); }
                .trap-card:hover .trap-img { transform: scale(1.1); }
                .trap-card:hover .trap-info h3 { color: #a855f7; }
                .trap-card:hover .read-more-btn { gap: 12px; color: #fff; }
                
                .hot-badge { position: absolute; top: 15px; left: 15px; background: #f43f5e; color: #fff; padding: 6px 14px; font-size: 11px; font-weight: 950; border-radius: 8px; z-index: 10; display: flex; align-items: center; gap: 6px; box-shadow: 0 5px 15px rgba(244, 63, 94, 0.4); text-transform: uppercase; animation: pulse 2s infinite; }
                
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                }

                @media (max-width: 768px) {
                    .content-box-style { padding: 30px 20px; }
                    .share-grid, .duel-grid, .trap-grid { grid-template-columns: 1fr; }
                    .gta6-conversion-box { padding: 25px; }
                    .guru-trap-section { padding: 30px 20px; margin-top: 50px; }
                }
            `}} />
        </div>
    );
}
