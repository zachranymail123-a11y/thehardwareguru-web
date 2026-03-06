"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname, useParams } from 'next/navigation';
import { BookOpen, ArrowLeft, Share2, Loader2, Bookmark } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GlossaryDetail() {
  const { slug } = useParams();
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from('slovnik').select('*');
        
        // GURU SLUG ENGINE: V angličtině hledáme v obou sloupcích
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);

        // 🚀 GURU SEO
        const seoTitle = isEn ? (data.title_en || data.title) : data.title;
        document.title = `${seoTitle} | Hardware Glossary - The Hardware Guru`;

      } catch (err) {
        console.error("GURU ERROR: Glossary term load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} color="#a855f7" /></div>;
  if (!item) return <div style={{ textAlign: 'center', padding: '120px 20px' }}><h1>{isEn ? 'TERM NOT FOUND' : 'POJEM NENALEZEN'}</h1></div>;

  const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
  const displayContent = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
      <style>{`
        .article-body h2 { color: #fff; margin-top: 40px; margin-bottom: 20px; font-size: 1.6rem; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px; }
        .article-body p { line-height: 1.8; margin-bottom: 20px; font-size: 1.15rem; color: #d1d5db; }
        .article-body strong { color: #fff; font-weight: 800; }
        .article-body a { color: #a855f7; text-decoration: underline; }
      `}</style>

      <header style={{ marginBottom: '50px' }}>
        <Link href={isEn ? "/en/slovnik" : "/slovnik"} prefetch={false} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', marginBottom: '35px', textTransform: 'uppercase' }}>
          <ArrowLeft size={16} /> {isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#fff', marginBottom: '20px' }}>
             <BookOpen size={48} />
             <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '900', letterSpacing: '1px' }}>
                <Bookmark size={14} style={{ display: 'inline', marginRight: '5px' }} />
                {isEn ? 'TECHNICAL DEFINITION' : 'TECHNICKÁ DEFINICE'}
             </div>
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase' }}>{displayTitle}</h1>
      </header>

      <div className="article-body" dangerouslySetInnerHTML={{ __html: displayContent || (isEn ? 'The Guru is defining this term...' : 'Guru definuje tento pojem...') }} />

      <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #1f2937', textAlign: 'center' }}>
        <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '14px 28px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
          <Share2 size={18} /> {isEn ? 'COPY TERM LINK' : 'KOPÍROVAT ODKAZ'}
        </button>
      </footer>
    </article>
  );
}
