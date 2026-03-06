"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname, useParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Share2, Loader2, Newspaper } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ArticleDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        let query = supabase.from('posts').select('*');
        
        // GURU SLUG ENGINE: V angličtině hledáme v obou sloupcích současně. 
        // Pokud slug_en v DB není vyplněný, matchne se to na klasický slug.
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setPost(data);

        // 🚀 GURU SEO INJECTION: Dynamická změna titulku a description
        const seoTitle = isEn 
          ? (data.meta_title_en || data.title_en || data.title) 
          : (data.meta_title || data.title);
        
        const seoDesc = isEn 
          ? (data.description_en || data.seo_description_en || data.seo_description) 
          : (data.seo_description);

        document.title = `${seoTitle} | The Hardware Guru`;
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', seoDesc || '');
        }

      } catch (err) {
        console.error("GURU ERROR: Article load fail", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug, isEn]);

  if (loading) {
    return (
      <div style={loadingOverlay}>
        <Loader2 className="animate-spin" size={48} color="#a855f7" />
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#a855f7' }}>
          {isEn ? 'LOADING ARTICLE...' : 'GURU NAČÍTÁ ČLÁNEK...'}
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={errorContainer}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
          {isEn ? 'Article not found' : 'Článek nebyl nalezen'}
        </h1>
        <Link href={isEn ? "/en/clanky" : "/clanky"} style={backBtn}>
          {isEn ? 'BACK TO ARCHIVE' : 'ZPĚT DO ARCHIVU'}
        </Link>
      </div>
    );
  }

  // Fallback na CZ obsah, pokud EN verze v DB neexistuje
  const displayTitle = (isEn && post.title_en) ? post.title_en : post.title;
  const displayContent = (isEn && post.content_en) ? post.content_en : post.content;
  const displayDate = new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ');

  return (
    <article style={articleContainer}>
      <style>{`
        .article-body h2 { color: #a855f7; margin-top: 40px; margin-bottom: 20px; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; }
        .article-body p { line-height: 1.8; margin-bottom: 20px; font-size: 1.1rem; color: #e5e7eb; }
        .article-body img { max-width: 100%; border-radius: 16px; margin: 30px 0; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .article-body ul { margin-bottom: 20px; padding-left: 20px; }
        .article-body li { margin-bottom: 10px; color: #d1d5db; }
        .article-body pre { background: #000; padding: 20px; border-radius: 12px; border: 1px solid #a855f7; overflow-x: auto; margin: 20px 0; }
        .article-body code { font-family: monospace; color: #66fcf1; }
      `}</style>

      <header style={headerStyle}>
        <Link href={isEn ? "/en/clanky" : "/clanky"} style={backLink}>
          <ArrowLeft size={16} /> {isEn ? 'BACK TO ARCHIVE' : 'ZPĚT DO ARCHIVU'}
        </Link>
        <div style={metaRow}>
          <div style={metaItem}><Calendar size={14} /> {displayDate}</div>
          <div style={{...metaItem, color: '#a855f7'}}><Newspaper size={14} /> {isEn ? 'ARTICLE' : 'ČLÁNEK'}</div>
        </div>
        <h1 style={mainTitle}>{displayTitle}</h1>
      </header>

      {post.image_url && (
        <div style={heroImageWrapper}>
          <img src={post.image_url} alt={displayTitle} style={heroImage} />
        </div>
      )}

      <div 
        className="article-body"
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: displayContent || (isEn ? 'Translation coming soon...' : 'Obsah se připravuje...') }} 
      />

      <footer style={footerStyle}>
        <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={shareBtn}>
          <Share2 size={18} /> {isEn ? 'COPY LINK' : 'KOPÍROVAT ODKAZ'}
        </button>
      </footer>
    </article>
  );
}

const articleContainer = { maxWidth: '900px', margin: '0 auto', padding: '40px 20px', color: '#fff' };
const loadingOverlay = { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const errorContainer = { textAlign: 'center', padding: '100px 20px' };
const headerStyle = { marginBottom: '40px' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', marginBottom: '30px', textTransform: 'uppercase' };
const backBtn = { display: 'inline-block', background: '#a855f7', color: '#fff', padding: '12px 25px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' };
const metaRow = { display: 'flex', gap: '20px', marginBottom: '20px' };
const metaItem = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' };
const mainTitle = { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase' };
const heroImageWrapper = { width: '100%', borderRadius: '24px', overflow: 'hidden', marginBottom: '50px', border: '1px solid #1f2937' };
const heroImage = { width: '100%', height: 'auto', display: 'block' };
const contentStyle = { maxWidth: '100%' };
const footerStyle = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #1f2937', textAlign: 'center' };
const shareBtn = { background: '#111', border: '1px solid #333', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' };
