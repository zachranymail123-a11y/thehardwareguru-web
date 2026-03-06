"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname, useParams } from 'next/navigation';
import { Lightbulb, ArrowLeft, Share2, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';

// GURU ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TipDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from('tipy').select('*');
        
        // GURU SLUG ENGINE: V angličtině hledáme v obou sloupcích současně. 
        // Pokud slug_en v DB není vyplněný, matchne se to na klasický slug.
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);

        // 🚀 GURU SEO INJECTION: Dynamická změna titulku a meta description
        const seoTitle = isEn 
          ? (data.meta_title_en || data.title_en || data.title) 
          : (data.meta_title || data.title);
        
        const seoDesc = isEn 
          ? (data.description_en || data.description) 
          : (data.description);

        document.title = `${seoTitle} | Guru Hardware Tips`;
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', seoDesc || '');
        }

      } catch (err) {
        console.error("GURU ERROR: Tip load failed or missing slug:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="#a855f7" />
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#a855f7' }}>
          {isEn ? 'GURU IS LOADING KNOWLEDGE...' : 'GURU NAČÍTÁ MOUDROST...'}
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={errorContainer}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>
          {isEn ? 'TIP NOT FOUND' : 'TIP NENALEZEN'}
        </h1>
        <Link href={isEn ? "/en/tipy" : "/tipy"} style={backBtn}>
          {isEn ? 'BACK TO TIPS' : 'ZPĚT NA TIPY'}
        </Link>
      </div>
    );
  }

  // GURU FALLBACK: Pokud EN verze v DB chybí, ukážeme CZ jako backup
  const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
  const displayContent = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <article style={articleContainer}>
      <style>{`
        .article-body h2 { color: #a855f7; margin-top: 40px; margin-bottom: 20px; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid rgba(168, 85, 247, 0.2); display: inline-block; padding-bottom: 5px; }
        .article-body p { line-height: 1.8; margin-bottom: 20px; font-size: 1.1rem; color: #e5e7eb; }
        .article-body img { max-width: 100%; border-radius: 16px; margin: 30px 0; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .article-body ul, .article-body ol { margin-bottom: 25px; padding-left: 25px; color: #d1d5db; }
        .article-body li { margin-bottom: 12px; }
        .article-body strong { color: #a855f7; }
        .article-body a { color: #a855f7; text-decoration: underline; }
      `}</style>

      {/* --- HEADER --- */}
      <header style={headerStyle}>
        <Link href={isEn ? "/en/tipy" : "/tipy"} style={backLink}>
          <ArrowLeft size={16} /> {isEn ? 'BACK TO GURU TIPS' : 'ZPĚT NA GURU TIPY'}
        </Link>
        <div style={{ color: '#a855f7', marginBottom: '25px' }}><Lightbulb size={56} /></div>
        <h1 style={mainTitle}>{displayTitle}</h1>
      </header>

      {/* --- CONTENT --- */}
      <div 
        className="article-body"
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: displayContent || (isEn ? 'The Guru is currently translating this tip...' : 'Obsah tipu se připravuje...') }} 
      />

      {/* --- FOOTER --- */}
      <footer style={footerStyle}>
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={shareBtn}>
               <Share2 size={18} /> {isEn ? 'COPY TIP LINK' : 'KOPÍROVAT ODKAZ'}
             </button>
        </div>
        
        <div style={supportBanner}>
          <h3 style={{ color: '#a855f7', margin: '0 0 15px 0' }}>{isEn ? 'Fuel the Guru engine' : 'Podpoř Guru mašinu'}</h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '25px' }}>
            {isEn ? 'Did this tip save you money or time? Keep the Guru alive and support the project.' : 'Ušetřil ti tento tip peníze nebo čas? Podpoř projekt a udrž Guruho při životě.'}
          </p>
          <Link href={isEn ? "/en/support" : "/support"} style={supportLink}>
             <Heart size={18} fill="#0b0c10" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
          </Link>
        </div>
      </footer>
    </article>
  );
}

// --- GURU STYLES (PURPLE THEME) ---
const articleContainer = { maxWidth: '850px', margin: '0 auto', padding: '40px 20px', color: '#fff' };
const errorContainer = { textAlign: 'center', padding: '120px 20px' };
const headerStyle = { marginBottom: '50px' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', marginBottom: '35px', textTransform: 'uppercase', letterSpacing: '1px' };
const backBtn = { display: 'inline-block', background: '#a855f7', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', marginTop: '20px' };
const mainTitle = { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '-0.5px' };
const contentStyle = { maxWidth: '100%' };
const footerStyle = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #1f2937', textAlign: 'center' };
const shareBtn = { background: '#111', border: '1px solid #333', color: '#fff', padding: '14px 28px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' };
const supportBanner = { background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '35px', borderRadius: '24px', textAlign: 'center' };
const supportLink = { background: '#a855f7', color: '#fff', padding: '14px 30px', borderRadius: '14px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '10px' };
