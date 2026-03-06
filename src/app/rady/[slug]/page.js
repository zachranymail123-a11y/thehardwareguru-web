"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Heart, Share2, Loader2, Activity, ChevronRight, Bookmark, Play } from 'lucide-react';
import Link from 'next/link';

// GURU ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GuideDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  const [item, setItem] = useState(null);
  const [dalsiRady, setDalsiRady] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. FETCH HLAVNÍ RADY
        let query = supabase.from('rady').select('*');
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }
        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);

        // 2. FETCH DALŠÍCH RAD (GURU RECOMMENDATIONS)
        const { data: more } = await supabase
          .from('rady')
          .select('title, title_en, slug, slug_en')
          .neq('id', data.id)
          .limit(3);
        setDalsiRady(more || []);

        // 🚀 SEO INJECTION
        const seoTitle = isEn 
          ? (data.meta_title_en || data.title_en || data.title) 
          : (data.meta_title || data.title);
        document.title = `${seoTitle} | Expert Hardware Guides`;

      } catch (err) {
        console.error("GURU ERROR: Guide load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' }}>
      <Loader2 className="animate-spin" size={48} color="#66fcf1" />
      <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#66fcf1', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {isEn ? 'GURU IS PREPARING KNOWLEDGE...' : 'GURU PŘIPRAVUJE MOUDROST...'}
      </p>
    </div>
  );

  if (!item) return (
    <div style={errorContainer}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>
        {isEn ? 'GUIDE NOT FOUND' : 'RADA NENALEZENA'}
      </h1>
      <Link href={isEn ? "/en/rady" : "/rady"} style={backBtn}>
        {isEn ? 'BACK TO GUIDES' : 'ZPĚT NA RADY'}
      </Link>
    </div>
  );

  const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
  const displayContent = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <div style={pageWrapper}>
      <style>{`
        .article-body h2 { color: #fff; margin: 40px 0 20px; font-weight: 900; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 20px; display: block; }
        .article-body p { line-height: 1.8; margin-bottom: 25px; font-size: 1.15rem; color: #d1d5db; }
        .article-body img { max-width: 100%; border-radius: 20px; margin: 30px 0; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .article-body pre { background: #000 !important; padding: 25px; border-radius: 16px; border: 1px solid #66fcf1; overflow-x: auto; margin: 30px 0; box-shadow: 0 0 30px rgba(102, 252, 241, 0.1); }
        .article-body code { color: #66fcf1; font-family: 'JetBrains Mono', monospace; font-size: 1rem; }
        .article-body ul { margin-bottom: 30px; list-style: none; }
        .article-body li { margin-bottom: 15px; padding-left: 30px; position: relative; color: #e5e7eb; }
        .article-body li::before { content: "✓"; position: absolute; left: 0; color: #66fcf1; font-weight: bold; }
        .guru-content-box { 
          background: rgba(10, 11, 13, 0.94); 
          backdrop-filter: blur(20px); 
          border-radius: 40px; 
          padding: 60px; 
          border: 1px solid rgba(102, 252, 241, 0.15); 
          box-shadow: 0 40px 100px rgba(0,0,0,0.9); 
        }
        .more-card { 
          background: rgba(17, 19, 24, 0.7); 
          border-radius: 24px; 
          padding: 30px; 
          border: 1px solid rgba(255,255,255,0.05); 
          transition: 0.3s; 
          height: 100%; 
          display: flex; 
          flex-direction: column; 
          text-decoration: none;
        }
        .more-card:hover { border-color: #66fcf1; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        @media (max-width: 768px) { .guru-content-box { padding: 30px 20px; border-radius: 20px; } }
      `}</style>

      <article style={container}>
        <div className="guru-content-box">
          <header style={{ marginBottom: '60px' }}>
            <Link href={isEn ? "/en/rady" : "/rady"} style={backLink}>
              <ArrowLeft size={16} /> {isEn ? 'BACK TO GUIDES' : 'ZPĚT NA RADY'}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#66fcf1', marginBottom: '25px' }}>
              <ShieldCheck size={64} style={{ filter: 'drop-shadow(0 0 15px rgba(102, 252, 241, 0.4))' }} />
              <div style={{ background: 'rgba(102, 252, 241, 0.1)', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '900', letterSpacing: '1px', border: '1px solid #66fcf1' }}>
                <Activity size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                {isEn ? 'GURU GUIDE' : 'GURU RADA'}
              </div>
            </div>
            <h1 style={mainTitle}>{displayTitle}</h1>
          </header>

          <div 
            className="article-body prose" 
            dangerouslySetInnerHTML={{ __html: displayContent || (isEn ? 'Knowledge synchronization in progress...' : 'Guru synchronizuje moudrost...') }} 
          />

          {/* --- 🛡️ GURU SHIELD SUPPORT BOX --- */}
          <div style={guruShield}>
            <Heart size={44} color="#66fcf1" fill="#66fcf1" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 10px rgba(102, 252, 241, 0.5))' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
              {isEn ? 'SUPPORT THE BASE' : 'PODPOŘ ZÁKLADNU'}
            </h3>
            <p style={{ color: '#d1d5db', margin: '0 auto 35px', lineHeight: '1.7', maxWidth: '600px', fontSize: '17px' }}>
              {isEn 
                ? 'Did this guide help you master your machine? Hardware Guru is ad-free thanks to your support. Help us research more hardware hacks.'
                : 'Pomohla ti tato rada stát se pánem svého hardwaru? Hardware Guru běží bez reklam jen díky tvojí podpoře. Zvaž příspěvek na další výzkum.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
                <Heart size={20} fill="#0b0c10" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
            </div>
          </div>
        </div>

        {/* --- DALŠÍ GURU RADY --- */}
        <div style={{ marginTop: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
               {isEn ? 'OTHER GURU GUIDES' : 'DALŠÍ GURU RADY'}
             </h2>
             <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #333, transparent)' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
            {dalsiRady.map((r) => (
              <Link key={r.slug} href={isEn ? `/en/rady/${r.slug_en || r.slug}` : `/rady/${r.slug}`} className="more-card">
                <Bookmark size={24} color="#66fcf1" style={{ marginBottom: '15px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', lineHeight: '1.4' }}>
                  {isEn && r.title_en ? r.title_en : r.title}
                </h4>
                <div style={{ marginTop: 'auto', paddingTop: '15px', color: '#66fcf1', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   {isEn ? 'READ GUIDE' : 'ZOBRAZIT RADU'} <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>

      {/* --- FLOATING ACTIONS --- */}
      <div style={floatingActions}>
         <button onClick={() => {
            navigator.clipboard.writeText(window.location.href);
         }} style={shareBtn}>
            <Share2 size={24} />
         </button>
      </div>
    </div>
  );
}

// --- GURU MASTER STYLES ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const container = { maxWidth: '1000px', margin: '0 auto', padding: '120px 20px 80px' };
const errorContainer = { textAlign: 'center', padding: '150px 20px', color: '#fff', backgroundColor: '#0a0b0d', minHeight: '100vh' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '13px', marginBottom: '35px', textTransform: 'uppercase', letterSpacing: '1px' };
const backBtn = { display: 'inline-block', background: '#66fcf1', color: '#0b0c10', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', marginTop: '20px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: '950', lineHeight: '1', textTransform: 'uppercase', color: '#fff', letterSpacing: '-1px' };
const guruShield = { marginTop: '80px', padding: '50px', background: 'rgba(102, 252, 241, 0.05)', borderRadius: '35px', border: '1px solid #66fcf1', textAlign: 'center', backdropFilter: 'blur(10px)' };
const supportBtn = { background: '#66fcf1', color: '#0b0c10', padding: '18px 36px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '16px' };
const floatingActions = { position: 'fixed', right: '40px', bottom: '40px', zIndex: 100 };
const shareBtn = { width: '60px', height: '60px', borderRadius: '50%', background: '#66fcf1', border: 'none', color: '#0b0c10', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(102, 252, 241, 0.3)' };
