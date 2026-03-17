import React from 'react';
import { notFound } from 'next/navigation';
import { ChevronLeft, Info, Calendar, Flame, Heart, Share2, Swords, Gauge, ArrowRight, Sparkles, Gamepad2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU ARTICLE ENGINE V4.2 (GTA 6 CONVERSION UPGRADE)
 * 🚀 CÍL: Maximální prolinkování z článků na FPS kalkulačku s GTA 6 bonusem.
 * 🛡️ ZMĚNA: Nahrazen obecný bottleneck banner za high-conversion GTA 6 bait.
 */

export const runtime = "nodejs";
export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const supabase = createClient(supabaseUrl, supabaseKey);

const getPost = async (slug) => {
    if (!slug) return null;
    const cleanSlug = slug.replace(/^en-/, '');
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`slug.eq.${cleanSlug},slug_en.eq.${cleanSlug}`)
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
                'cs': canonicalUrl,
                'x-default': canonicalUrl
            }
        },
        openGraph: {
            title,
            description: desc,
            images: post.image_url ? [post.image_url] : [`${baseUrl}/logo.png`],
            type: 'article',
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
    const seoDesc = isEn && post.seo_description_en ? post.seo_description_en : (post.seo_description_cs || post.description || '');
    const date = post.created_at || new Date().toISOString();
    const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));

    // SEO SCHÉMATA (Ořezáno pro stručnost, ale v kódu zůstávají)
    const productSchema = { "@context": "https://schema.org", "@type": "Product", "name": title, "image": [post.image_url || `${baseUrl}/logo.png`], "description": seoDesc, "brand": { "@type": "Brand", "name": "The Hardware Guru" }, "sku": post.slug, "offers": { "@type": "Offer", "priceCurrency": "USD", "price": 1, "url": `${baseUrl}/${isEn ? 'en/' : ''}clanky/${post.slug}`, "priceValidUntil": "2026-12-31", "itemCondition": "https://schema.org/NewCondition", "availability": "https://schema.org/InStock", "seller": { "@type": "Organization", "name": "The Hardware Guru" } }, "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.9, "reviewCount": 112 } };
    const articleSchema = { "@context": "https://schema.org", "@type": "TechArticle", "headline": title, "description": seoDesc, "image": [post.image_url || `${baseUrl}/logo.png`], "datePublished": date, "dateModified": date, "author": { "@type": "Organization", "name": "The Hardware Guru", "url": baseUrl }, "publisher": { "@type": "Organization", "name": "The Hardware Guru", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` } } };

    const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
    const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}clanky/${post.slug}`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />

            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <a href={isEn ? "/en/clanky" : "/clanky"} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK TO ARTICLES' : 'ZPĚT NA ČLÁNKY'}
                    </a>
                </div>

                <article style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px 40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '8px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
                            <Calendar size={14} /> {formattedDate}
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', lineHeight: '1.2', margin: '0', textTransform: 'uppercase', textShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}>
                            {title}
                        </h1>
                    </header>

                    {post.image_url && (
                        <div style={{ marginBottom: '40px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <img src={post.image_url} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                    )}

                    <div className="guru-article-content" dangerouslySetInnerHTML={{ __html: content }} />
                    
                    {/* 🚀 GTA 6 CONVERSION BANNER (Náhrada za bottleneck) */}
                    <div className="gta6-conversion-box">
                        <div className="gta6-badge"><Sparkles size={16} /> EXKLUZIVNÍ AI MODUL</div>
                        <h3 className="gta6-title">
                            {isEn ? 'WILL YOUR PC RUN GTA VI?' : 'ZVLÁDNE TO TVŮJ PC?'}
                        </h3>
                        <p className="gta6-p">
                            {isEn 
                                ? 'Use our Guru FPS Engine to get an exclusive performance prediction for Grand Theft Auto VI based on your hardware.' 
                                : 'Použij náš Guru FPS Engine a získej exkluzivní odhad výkonu pro Grand Theft Auto VI na základě tvého hardwaru.'}
                        </p>
                        <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="gta6-link">
                            <Gamepad2 size={20} /> {isEn ? 'TEST GTA VI PERFORMANCE' : 'ZJISTIT FPS V GTA VI'} <ArrowRight size={18} />
                        </a>
                    </div>
                </article>

                {/* SOCIAL SHARE & SILOING (Zůstává stejné) */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" className="share-btn-guru">TWITTER / X</a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-btn-guru">FACEBOOK</a>
                </div>

                <div style={{ marginTop: '60px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-banner-card" style={{ borderLeftColor: '#66fcf1' }}>
                        <div className="silo-banner-icon" style={{ color: '#66fcf1', background: '#66fcf120' }}><Swords size={28} /></div>
                        <div className="silo-banner-text">
                            <h4>{isEn ? 'CPU BATTLES' : 'SROVNÁNÍ PROCESORŮ'}</h4>
                            <p>{isEn ? 'Compare processors and find the best.' : 'Porovnejte procesory a najděte ten nejlepší.'}</p>
                        </div>
                    </a>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
                .guru-article-content { font-size: 1.15rem; line-height: 1.8; color: #d1d5db; }
                
                /* 🚀 GTA 6 BANNER STYLY */
                .gta6-conversion-box { 
                    margin-top: 50px; 
                    background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 17, 21, 0.98) 100%); 
                    border: 1px solid rgba(244, 63, 94, 0.4); 
                    padding: 40px; 
                    border-radius: 24px; 
                    text-align: center;
                    box-shadow: 0 15px 40px rgba(244, 63, 94, 0.1);
                }
                .gta6-badge { display: inline-flex; align-items: center; gap: 8px; background: #f43f5e; color: #fff; padding: 6px 15px; border-radius: 8px; font-size: 10px; font-weight: 950; margin-bottom: 20px; text-transform: uppercase; }
                .gta6-title { font-size: 1.8rem; font-weight: 950; color: #fff; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
                .gta6-p { color: #9ca3af; marginBottom: 25px; font-size: 1.1rem; line-height: 1.5; max-width: 600px; margin: 0 auto 25px; }
                .gta6-link { 
                    display: inline-flex; align-items: center; gap: 12px; 
                    background: #f43f5e; color: #fff; 
                    padding: 16px 35px; border-radius: 14px; 
                    fontWeight: 950; text-decoration: none; 
                    text-transform: uppercase; transition: 0.3s; 
                    box-shadow: 0 10px 20px rgba(244, 63, 94, 0.3);
                }
                .gta6-link:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(244, 63, 94, 0.5); background: #e11d48; }

                .share-btn-guru { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 12px 25px; border-radius: 12px; font-weight: 950; text-decoration: none; transition: 0.3s; }
                .share-btn-guru:hover { background: rgba(255,255,255,0.1); border-color: #a855f7; }

                .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; border-left: 5px solid transparent; }
                .silo-banner-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .silo-banner-text h4 { margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; font-weight: 950; }
            `}} />
        </div>
    );
}
