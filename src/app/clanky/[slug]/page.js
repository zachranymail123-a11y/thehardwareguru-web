import React from 'react';
import Script from 'next/script';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ChevronLeft, Info, Calendar, Flame, Heart, Share2, Swords, Gauge, ArrowRight, Sparkles, Gamepad2, Twitter, Cpu, Monitor, User, Clock, CheckCircle, ChevronRight, ShoppingCart, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';

/**
 * GURU ARTICLE ENGINE V6.3 (ULTIMATE MONETIZATION FIX)
 * 🚀 CÍL: Dynamický Heureka Search Intent, oprava pořadí tlačítek, agresivní CTR texty a garantovaný Trixam skript.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

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

const getReadingTime = (text) => {
    const words = text ? text.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200); 
    return minutes < 1 ? 1 : minutes;
};

export async function generateMetadata(props) {
    const p = await props.params;
    const rawSlug = p?.slug || '';
    const headersList = headers();
    const fullUrl = headersList.get('x-url') || headersList.get('referer') || "";
    const isEn = fullUrl.includes('/en/') || rawSlug.startsWith('en-');

    const post = await getPost(rawSlug);
    if (!post) return { title: '404 | Hardware Guru' };
    const title = isEn && post.title_en ? post.title_en : post.title;
    return {
        title: `${title} | The Hardware Guru`,
        alternates: { canonical: `${baseUrl}/clanky/${post.slug}` }
    };
}

export default async function ArticleDetailPage(props) {
    const p = await props.params;
    const rawSlug = p?.slug || '';
    
    const headersList = headers();
    const fullUrl = headersList.get('x-url') || headersList.get('referer') || "";
    const isEn = fullUrl.includes('/en/') || rawSlug.startsWith('en-');

    const post = await getPost(rawSlug);
    if (!post) notFound();

    const title = isEn && post.title_en ? post.title_en : post.title;
    const content = isEn && post.content_en ? post.content_en : (post.content_cs || post.content || '');
    const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(post.created_at));
    const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}clanky/${post.slug}`;
    const readingTime = getReadingTime(content);

    const contentParts = content ? content.split('</p>') : [];
    const part1 = contentParts.slice(0, 3).join('</p>') + (contentParts.length > 3 ? '</p>' : '');
    const part2 = contentParts.slice(3, 6).join('</p>') + (contentParts.length > 6 ? '</p>' : '');
    const part3 = contentParts.slice(6).join('</p>');

    // 🔥 DYNAMICKÉ ODKAZY PODLE NÁZVU ČLÁNKU PRO MAXIMÁLNÍ KONVERZI 🔥
    const searchQuery = title;
    
    const getAmazonLink = (query) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=thehardware07-20`;
    const getSmartyLink = (query) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(query)}`)}`;
    
    // 🔥 DEFINITIVNÍ HEUREKA FIX: Dynamický Search Intent s h[fraze], bez mřížky, s Text link 🔥
    const getHeurekaLink = (query) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(query)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous" strategy="afterInteractive" />
            
            {/* 🔥 GARANTOVANÉ NAČTENÍ TRIXAM SKRIPTU PRO PŘÍMÉ NÁVŠTĚVY 🔥 */}
            {!isEn && (
                <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />
            )}

            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? "/en/clanky" : "/clanky"} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <article className="guru-main-article" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px 40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div className="guru-meta-badge"><Calendar size={14} /> {formattedDate}</div>
                            <div className="guru-meta-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}><Clock size={14} /> {readingTime} {isEn ? 'min' : 'min.'}</div>
                        </div>
                        <h1 className="guru-article-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '950', lineHeight: '1.2', margin: '0 0 20px 0', textTransform: 'uppercase' }}>{title}</h1>
                    </header>

                    {post.image_url && (
                        <div style={{ marginBottom: '30px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <img src={post.image_url} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                    )}

                    {/* 🔥 NÁKUPNÍ SEKCE: HEUREKA JAKO PRVNÍ + AGRESIVNÍ COPY 🔥 */}
                    <div className="affiliate-cta-grid" style={{ marginBottom: '20px' }}>
                        <div className="affiliate-col">
                            <div className="affiliate-btn-wrap">
                                {isEn ? (
                                    <a href={getAmazonLink(searchQuery)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                                        <ShoppingCart size={16} /> 🔥 Check Lowest Prices
                                    </a>
                                ) : (
                                    <>
                                        {/* 🔥 FIX: Heureka je první, má Position ID a nejlepší CTR text 🔥 */}
                                        <a 
                                            href={getHeurekaLink(searchQuery)} 
                                            className="guru-buy-winner-btn heureka-btn heureka-hn-link" 
                                            data-trixam-positionid="276026"
                                            data-trixam-content="Text link" 
                                            data-trixam-medium="affiliate" 
                                            target="_blank" 
                                            rel="nofollow sponsored"
                                        >
                                            <ShoppingCart size={16} /> 🔥 Porovnat ceny
                                        </a>
                                        <a href={getSmartyLink(searchQuery)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                            <ShoppingCart size={16} /> Smarty.cz
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 🔥 GURU TOOLS (KALKULAČKY) HNED POD NÁKUP 🔥 */}
                    <div className="guru-tools-small-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
                        <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="tool-btn-small purple-link"><AlertTriangle size={16} /> {isEn ? 'Bottleneck' : 'Bottleneck'}</a>
                        <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="tool-btn-small cyan-link"><Gamepad2 size={16} /> {isEn ? 'FPS Test' : 'FPS Test'}</a>
                    </div>

                    <div className="guru-article-content">
                         {part1 && <div dangerouslySetInnerHTML={{ __html: part1 }} />}
                         {contentParts.length > 3 && (
                             <div style={{ margin: '40px 0', display: 'flex', justifyContent: 'center' }}><SeznamAd zoneId={408658} width={480} height={300} /></div>
                         )}
                         {part2 && <div dangerouslySetInnerHTML={{ __html: part2 }} />}
                         {contentParts.length > 6 && (
                             <div style={{ margin: '40px 0', display: 'flex', justifyContent: 'center' }}><SeznamAd zoneId={408658} width={480} height={300} /></div>
                         )}
                         {part3 && <div dangerouslySetInnerHTML={{ __html: part3 }} />}
                    </div>

                    {!isEn && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0 30px' }}><HeurekaButtons isEn={false} /></div>
                    )}
                </article>

                <div className="share-section" style={{ marginTop: '50px' }}>
                    <div className="share-grid">
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card x-bg"><Twitter size={18} /> X</a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card fb-bg"><Share2 size={18} /> FB</a>
                        <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-card reddit-bg"><RedditIcon size={18} /> REDDIT</a>
                    </div>
                </div>

                <section className="massive-seo-hub" style={{ marginTop: '80px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>{isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}</h2>
                    <div className="seo-hub-grid">
                        <div className="hub-column">
                            <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                            <ul className="hub-links-list">
                                <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                                <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"}><ChevronRight size={16} /> {isEn ? 'Graphics Card Battles' : 'Souboje Grafických Karet'}</a></li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>

            <div className="sticky-bottom-anchor">
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
                .guru-meta-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
                .guru-article-content { font-size: 1.15rem; line-height: 1.8; color: #d1d5db; }
                .guru-article-content h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #a855f7; padding-left: 15px; }
                .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 25px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
                .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
                .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 15px; text-transform: uppercase; transition: 0.3s; letter-spacing: 1px; }
                .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; }
                .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; }
                .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; width: 100%; max-width: 400px; }
                
                /* Kalkulačky style */
                .tool-btn-small { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 12px; font-weight: 950; text-transform: uppercase; text-decoration: none; font-size: 12px; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
                .purple-link { background: rgba(168, 85, 247, 0.1); color: #a855f7; border-color: rgba(168, 85, 247, 0.2); }
                .cyan-link { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: rgba(102, 252, 241, 0.2); }
                .tool-btn-small:hover { transform: translateY(-2px); filter: brightness(1.2); }

                .share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .share-card { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-weight: 950; font-size: 11px; text-decoration: none; color: #fff; }
                .x-bg { background: #000; }
                .fb-bg { background: #1877f2; }
                .reddit-bg { background: #ff4500; }
                .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
                
                @media (max-width: 768px) {
                    .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
                    .guru-buy-winner-btn { max-width: 100%; width: 100%; }
                    .share-grid { grid-template-columns: 1fr; }
                    .guru-tools-small-grid { grid-template-columns: 1fr; }
                }
            `}} />
        </div>
    );
}
