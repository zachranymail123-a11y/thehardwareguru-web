"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname, useParams } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Share2, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GuideDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from('rady').select('*');
        
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);

        // SEO INJECTION
        const seoTitle = isEn 
          ? (data.meta_title_en || data.title_en || data.title) 
          : (data.meta_title || data.title);
        const seoDesc = isEn 
          ? (data.description_en || data.description) 
          : (data.description);

        document.title = `${seoTitle} | Practical Hardware Guides`;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', seoDesc || '');

      } catch (err) {
        console.error("GURU ERROR: Guide load fail", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={48} color="#66fcf1" />
    </div>
  );

  if (!item) return (
    <div style={{ textAlign: 'center', padding: '120px 20px' }}>
      <h1 style={{ color: '#fff', fontWeight: '900' }}>{isEn ? 'GUIDE NOT FOUND' : 'RADA NENALEZENA'}</h1>
      <Link href={isEn ? "/en/rady" : "/rady"} style={{ color: '#66fcf1', fontWeight: 'bold', marginTop: '20px', display: 'block' }}>
        {isEn ? 'BACK TO GUIDES' : 'ZPĚT NA RADY'}
      </Link>
    </div>
  );

  const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
  const displayContent = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <article style={{ maxWidth: '850px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
      <style>{`
        .article-body h2 { color: #66fcf1; margin-top: 40px; margin-bottom: 20px; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; border-left: 5px solid #66fcf1; padding-left: 20px; }
        .article-body p { line-height: 1.8; margin-bottom: 20px; font-size: 1.1rem; color: #e5e7eb; }
        .article-body img { max-width: 100%; border-radius: 16px; margin: 30px 0; border: 1px solid #333; }
        .article-body pre { background: #000; padding: 20px; border-radius: 12px; border: 1px solid #66fcf1; overflow-x: auto; margin: 20px 0; }
        .article-body code { font-family: monospace; color: #66fcf1; }
      `}</style>
      <header style={{ marginBottom: '50px' }}>
        <Link href={isEn ? "/en/rady" : "/rady"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#66fcf1', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', marginBottom: '35px', textTransform: 'uppercase' }}>
          <ArrowLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
        </Link>
        <div style={{ color: '#66fcf1', marginBottom: '25px' }}><ShieldCheck size={56} /></div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', textTransform: 'uppercase' }}>{displayTitle}</h1>
      </header>
      <div className="article-body" dangerouslySetInnerHTML={{ __html: displayContent || (isEn ? 'Translation in progress...' : 'Obsah se připravuje...') }} />
      <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #1f2937', textAlign: 'center' }}>
        <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '14px 28px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' }}>
          <Share2 size={18} /> {isEn ? 'COPY LINK' : 'KOPÍROVAT ODKAZ'}
        </button>
      </footer>
    </article>
  );
}
