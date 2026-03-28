import React from 'react';
import { notFound } from 'next/navigation';
import { ChevronLeft, Info, Calendar, Flame, Heart, Share2, Swords, Gauge, ArrowRight, Sparkles, Gamepad2, Twitter, Cpu, Monitor, User, Clock, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU ARTICLE ENGINE V5.6 (MOBILE RESCUE UPDATE)
 * 🚀 CÍL: Oprava dojebaného mobilního zobrazení a striktní separace reklam.
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
    return {
        title: `${title} | The Hardware Guru`,
        alternates: { canonical: `${baseUrl}/clanky/${post.slug}` }
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

    const contentParts = content ? content.split('</p>') : [];
    const part1 = contentParts.slice(0, 3).join('</p>') + (contentParts.length > 3 ? '</p>' : '');
    const part2 = contentParts.slice(3, 6).join('</p>') + (contentParts.length > 6 ? '</p>' : '');
    const part3 = contentParts.slice(6).join('</p>');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? "/en/clanky" : "/clanky"} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

                {/* 🔥 TOP AD SLOT - STRIKTNĚ ODDĚLENÝ */}
                <div style={{ marginBottom: '40px' }}>
                    <div className="ad-desktop-wrapper">
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>
                    <div className="ad-mobile-wrapper">
                        <SeznamAd zoneId={408651} width={300} height={250} />
                    </div>
                </div>

                <article className="guru-main-article" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px 40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div className="guru-meta-badge">
                                <Calendar size={14} /> {formattedDate}
                            </div>
                            <div className="guru-meta-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                <Clock size={14} /> {readingTime} {isEn ? 'min' : 'min.'}
                            </div>
                        </div>

                        <h1 className="guru-article-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '950', lineHeight: '1.2', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
                            {title}
                        </h1>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
                             <User size={16} color="#a855f7" />
                             <span style={{ fontSize: '0.9rem', color: '#d1d5db', fontWeight: 'bold' }}>{isEn ? 'Author:' : 'Autor:'} <span style={{ color: '#fff' }}>Hardware Guru</span></span>
                        </div>
                    </header>

                    {post.image_url && (
                        <div style={{ marginBottom: '40px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <img src={post.image_url} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                    )}

                    <div className="guru-article-content">
                         {part1 && <div dangerouslySetInnerHTML={{ __html: part1 }} />}
                         
                         {/* 🚀 IN-TEXT AD #1 */}
                         {contentParts.length > 3 && (
                             <div style={{ margin: '40px 0' }}>
                                 <div className="ad-desktop-wrapper"><SeznamAd zoneId={408658} width={480} height={300} /></div>
                                 <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
                             </div>
                         )}
                         
                         {part2 && <div dangerouslySetInnerHTML={{ __html: part2 }} />}

                         {/* 🚀 IN-TEXT AD #2 */}
                         {contentParts.length > 6 && (
                             <div style={{ margin: '40px 0' }}>
                                 <div className="ad-desktop-wrapper"><SeznamAd zoneId={408658} width={480} height={300} /></div>
                                 <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
                             </div>
                         )}

                         {part3 && <div dangerouslySetInnerHTML={{ __html: part3 }} />}
                    </div>
                    
                    <div className="gta6-conversion-box">
                        <div className="gta6-badge"><Sparkles size={16} /> AI PREDIKCE</div>
                        <h3 className="gta6-title">{isEn ? 'RUN GTA VI?' : 'ZVLÁDNE TO GTA VI?'}</h3>
                        <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="gta6-link">
                            <Gamepad2 size={20} /> {isEn ? 'TEST FPS' : 'ZJISTIT FPS'} <ArrowRight size={18} />
                        </a>
                    </div>
                </article>

                <div className="share-section" style={{ marginTop: '50px' }}>
                    <div className="share-grid">
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card x-bg"><Twitter size={18} /> X</a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card fb-bg"><Share2 size={18} /> FB</a>
                        <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card reddit-bg"><RedditIcon size={18} /> REDDIT</a>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
                .guru-meta-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
                .guru-article-content { font-size: 1.15rem; line-height: 1.8; color: #d1d5db; }
                .guru-article-content h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #a855f7; padding-left: 15px; }
                .guru-article-content p { margin-bottom: 1.2em; }
                .gta6-conversion-box { background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 17, 21, 0.98) 100%); border: 1px solid rgba(244, 63, 94, 0.4); padding: 30px; border-radius: 24px; text-align: center; margin-top: 40px; }
                .gta6-link { display: inline-flex; align-items: center; gap: 12px; background: #f43f5e; color: #fff; padding: 14px 28px; border-radius: 14px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
                .share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .share-card { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-weight: 950; font-size: 11px; text-decoration: none; color: #fff; }
                .x-bg { background: #000; border: 1px solid #333; }
                .fb-bg { background: #1877f2; }
                .reddit-bg { background: #ff4500; }

                /* 🚀 RESPONSIVE ADS SYSTEM */
                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .ad-mobile-wrapper { display: none; width: 100%; }

                @media (max-width: 768px) {
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .guru-main-article { padding: 25px 15px !important; border-radius: 20px !important; }
                    .guru-article-title { font-size: 1.6rem !important; }
                    .guru-article-content { font-size: 1.05rem; }
                    .guru-article-content h2 { font-size: 1.4rem; }
                    .share-grid { grid-template-columns: 1fr; }
                    main { padding: 0 10px !important; }
                }
            `}} />
        </div>
    );
}
