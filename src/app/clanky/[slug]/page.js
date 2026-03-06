"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname, useParams } from 'next/navigation';
import { Newspaper, ArrowLeft, Share2, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
        if (isEn) query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        else query = query.eq('slug', slug);
        const { data, error } = await query.single();
        if (error) throw error;
        setPost(data);
        document.title = `${isEn ? (data.title_en || data.title) : data.title} | Hardware Guru`;
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchPost();
  }, [slug, isEn]);

  if (loading) return <div style={center}><Loader2 className="animate-spin" size={48} color="#a855f7" /></div>;
  if (!post) return <div style={center}><h1>ARTICLE NOT FOUND</h1></div>;

  return (
    <article style={articleContainer}>
      <style>{`
        .article-body h2 { color: #a855f7; margin: 30px 0 15px; font-weight: 900; text-transform: uppercase; }
        .article-body p { line-height: 1.8; margin-bottom: 20px; font-size: 1.1rem; color: #e5e7eb; }
      `}</style>
      <header style={{ marginBottom: '40px' }}>
        <Link href={isEn ? "/en/clanky" : "/clanky"} style={backLink}><ArrowLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</Link>
        <h1 style={mainTitle}>{isEn && post.title_en ? post.title_en : post.title}</h1>
      </header>
      <div className="article-body" dangerouslySetInnerHTML={{ __html: isEn && post.content_en ? post.content_en : post.content }} />
      
      {/* 🛡️ GOOGLE CONTRIBUTION AT THE END OF ARTICLE */}
      <footer style={footerStyle}>
        <h3 style={{ marginBottom: '20px', fontWeight: '900' }}>{isEn ? 'ENJOYED THIS CONTENT?' : 'BAVIL TĚ ČLÁNEK?'}</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
          <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={shareBtn}>
            <Share2 size={18} /> {isEn ? 'SHARE' : 'SDÍLET'}
          </button>
        </div>
      </footer>
    </article>
  );
}

const articleContainer = { maxWidth: '850px', margin: '0 auto', padding: '40px 20px', color: '#fff' };
const backLink = { color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' };
const mainTitle = { fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1.1' };
const footerStyle = { marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #1f2937', textAlign: 'center' };
const shareBtn = { background: '#111', border: '1px solid #333', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
