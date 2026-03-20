import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Monitor, ArrowLeft, Activity, Zap, Share2 } from 'lucide-react';
import Link from 'next/link';

// Architektura převzata z tvého funkčního vzoru pro články (Server Component)
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
        .or(`slug.eq."${cleanSlug}",slug_en.eq."${cleanSlug}"`)
        .limit(1)
        .single();
    if (error || !data) return null;
    return data;
}

export async function generateMetadata(props) {
    const params = await props.params;
    const rawSlug = params?.slug || '';
    const isEn = rawSlug.startsWith('en-');
    const post = await getPost(rawSlug);

    if (!post) return { title: '404 | Preview Not Found' };

    const title = isEn && post.title_en ? post.title_en : post.title;
    // Tady bezpečně taháme description do meta tagů
    const desc = isEn && post.description_en ? post.description_en : (post.description || post.perex || post.excerpt || '');
    const safeSlug = post.slug;
    const canonicalUrl = `${baseUrl}/kalendar/${safeSlug}`;

    return {
        title: `${title} | Guru Technical Preview`,
        description: desc,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en': `${baseUrl}/en/kalendar/${post.slug_en || safeSlug}`,
                'cs': canonicalUrl
            }
        },
        openGraph: {
            title: `${title} | Guru Technical Preview`,
            description: desc,
            images: [post.image_url || ''],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Guru Technical Preview`,
            description: desc,
            images: [post.image_url || ''],
        }
    };
}

export default async function ExpectedGameDetail(props) {
    const params = await props.params;
    const rawSlug = params?.slug || '';
    const isEn = rawSlug.startsWith('en-');
    const item = await getPost(rawSlug);

    if (!item) notFound();

    const title = isEn && item.title_en ? item.title_en : item.title;
    const description = isEn && item.description_en ? item.description_en : (item.description || item.perex || item.excerpt || '');
    const content = isEn && item.content_en ? item.content_en : item.content;
    const shareUrl = `${baseUrl}/${isEn ? 'en/' : ''}kalendar/${item.slug}`;

    return (
        <div style={pageWrapper}>
            <style dangerouslySetInnerHTML={{__html: `
                .article-body h2 { color: #66fcf1; margin: 40px 0 20px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid rgba(102, 252, 241, 0.2); padding-bottom: 10px; }
                .article-body p { line-height: 1.8; margin-bottom: 25px; font-size: 1.15rem; color: #e5e7eb; }
                .article-body ul { margin-bottom: 30px; list-style: none; padding-left: 0; }
                .article-body li { position: relative; padding-left: 30px; margin-bottom: 12px; font-size: 1.1rem; }
                .article-body li::before { content: "⚡"; position: absolute; left: 0; color: #66fcf1; }
                .share-btn-x { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid #333; padding: 14px 25px; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-weight: 900; font-size: 14px; transition: 0.2s; }
                .share-btn-x:hover { background: #000; border-color: #66fcf1; }
            `}} />

            <article style={container}>
                <div style={contentBoxStyle}>
                    <header style={{ marginBottom: '50px' }}>
                        <Link href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"} style={backLink}>
                            <ArrowLeft size={16} /> {isEn ? 'BACK TO PREVIEWS' : 'ZPĚT NA PREVIEW'}
                        </Link>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#66fcf1', marginTop: '30px', marginBottom: '20px' }}>
                                <Monitor size={40} />
                                <span style={badgeStyle}>{isEn ? 'TECHNICAL PREVIEW' : 'TECHNICKÝ ROZBOR'}</span>
                        </div>
                        
                        <h1 style={mainTitle}>{title}</h1>
                    </header>

                    {/* 🚀 TECH BRIEF PANEL (GURU INSIGHT) - KONEČNĚ FUNKČNÍ */}
                    {description && (
                        <div style={descPanel}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '15px' }}>
                                <Activity size={20} />
                                <span style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>Guru Technical Insight</span>
                            </div>
                            <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '600', lineHeight: '1.5' }}>
                                {description}
                            </div>
                        </div>
                    )}

                    {/* 🖼️ HERO IMAGE */}
                    {item.image_url && (
                        <div style={imageWrapper}>
                                <img src={item.image_url} alt={title} style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }} />
                        </div>
                    )}

                    {/* 📝 HLAVNÍ TEXT ANALÝZY */}
                    <div 
                        className="article-body" 
                        dangerouslySetInnerHTML={{ 
                            __html: content && content.trim() !== '' 
                                ? content 
                                : '<p>Content zatím není dostupný.</p>' 
                        }} 
                    />

                    {/* 🛡️ GURU SUPPORT SHIELD */}
                    <div style={guruShield}>
                        <Zap size={44} color="#66fcf1" fill="#66fcf1" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(102, 252, 241, 0.4))' }} />
                        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
                            {isEn ? 'SUPPORT GURU TECH' : 'PODPOŘ GURU TECHNOLOGIE'}
                        </h3>
                        <p style={{ color: '#d1d5db', margin: '0 auto 35px', maxWidth: '600px', fontSize: '16px' }}>
                            {isEn 
                                ? 'Keep this independent analysis system running. No ads, just pure hardware data.' 
                                : 'Udržuj tento nezávislý analytický systém v chodu. Bez reklam, jen čistá technická fakta.'}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
                                DARY / REVOLUT
                            </Link>
                            
                            {/* 📰 GOOGLE CONTRIBUTION BUTTON */}
                            <div style={{ background: '#fff', borderRadius: '12px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '48px' }}>
                                <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
                            </div>

                            {/* PŘEDĚLÁNO NA ČISTÝ ODKAZ (X / TWITTER) ABY TO FUNGOVALO BEZ USE CLIENT */}
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="share-btn-x">
                                <Share2 size={18} /> {isEn ? 'SHARE ON X' : 'SDÍLET NA X'}
                            </a>
                        </div>
                    </div>
                </div>
            </article>
            
            <footer style={{ padding: '80px 20px 40px', textAlign: 'center', opacity: 0.4 }}>
                 <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '900', letterSpacing: '2px' }}>
                        © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE PREVIEW ENGINE
                 </p>
            </footer>
        </div>
    );
}

// --- MASTER STYLES ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px 40px', fontFamily: 'sans-serif' };
const container = { maxWidth: '950px', margin: '0 auto' };
const contentBoxStyle = { background: 'rgba(10, 11, 13, 0.97)', padding: '60px 50px', borderRadius: '45px', border: '1px solid rgba(102, 252, 241, 0.15)', boxShadow: '0 50px 120px rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 68px)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '0.95', letterSpacing: '-2px' };
const badgeStyle = { background: 'rgba(102, 252, 241, 0.1)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '950', border: '1px solid #66fcf1', letterSpacing: '1px' };
const descPanel = { background: 'rgba(255,255,255,0.03)', borderLeft: '5px solid #66fcf1', padding: '35px', margin: '40px 0 60px 0', borderRadius: '0 24px 24px 0', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)' };
const imageWrapper = { margin: '50px 0 70px' };
const guruShield = { marginTop: '100px', padding: '60px 40px', background: 'rgba(102, 252, 241, 0.04)', borderRadius: '40px', border: '1px solid #66fcf1', textAlign: 'center', boxShadow: '0 0 50px rgba(102, 252, 241, 0.1)' };
const supportBtn = { background: '#66fcf1', color: '#0b0c10', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', fontSize: '14px', transition: '0.2s', display: 'inline-flex', alignItems: 'center' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' };
