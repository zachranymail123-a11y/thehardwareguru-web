"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { BookOpen, ArrowLeft, Share2, Loader2, Bookmark, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// GURU CORE ENGINE: Napojení na tvou Supabase DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GlossaryDetail() {
  const { slug } = useParams();
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  const [item, setItem] = useState(null);
  const [dalsiPojmy, setDalsiPojmy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. FETCH HLAVNÍHO POJMU
        let query = supabase.from('slovnik').select('*');
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);

        // 2. FETCH DALŠÍCH POJMŮ (GURU RECOMMENDATIONS)
        const { data: more } = await supabase
          .from('slovnik')
          .select('title, title_en, slug, slug_en')
          .neq('id', data.id)
          .limit(3);
        setDalsiPojmy(more || []);

        // 🚀 SEO GURU: Injekce titulků
        const seoTitle = isEn ? (data.title_en || data.title) : data.title;
        document.title = `${seoTitle} | Guru Hardware Glossary`;

      } catch (err) {
        console.error("GURU ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' }}>
      <Loader2 className="animate-spin" size={48} color="#a855f7" />
    </div>
  );

  if (!item) return (
    <div style={{ textAlign: 'center', padding: '150px 20px', color: '#fff', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: '900' }}>404 | POJEM NENALEZEN</h1>
      <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#a855f7', marginTop: '20px', display: 'inline-block' }}>ZPĚT DO SLOVNÍKU</Link>
    </div>
  );

  const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
  const displayContent = (isEn && item.content_en) ? item.content_en : item.content;
  const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;

  return (
    <div style={pageWrapper}>
      <style>{`
        .article-body h2 { color: #fff; margin: 40px 0 20px; font-weight: 950; text-transform: uppercase; border-bottom: 2px solid #a855f7; padding-bottom: 10px; display: inline-block; }
        .article-body p { line-height: 1.8; margin-bottom: 25px; font-size: 1.1rem; color: #d1d5db; }
        .article-body strong { color: #fff; font-weight: 800; }
        
        .guru-content-box { 
          background: rgba(13, 2, 33, 0.96); 
          backdrop-filter: blur(25px); 
          border-radius: 32px; 
          padding: 50px; 
          border: 1px solid rgba(168, 85, 247, 0.25); 
          box-shadow: 0 30px 80px rgba(0,0,0,0.9); 
        }
        
        .description-panel {
          background: rgba(168, 85, 247, 0.05);
          border-left: 4px solid #a855f7;
          padding: 25px;
          margin: 30px 0 45px 0;
          border-radius: 0 16px 16px 0;
        }

        .more-card { 
          background: rgba(15, 2, 30, 0.8); 
          border: 1px solid rgba(168, 85, 247, 0.2); 
          border-radius: 16px; 
          padding: 20px; 
          transition: 0.3s; 
          text-decoration: none;
          display: block;
        }
        .more-card:hover { border-color: #a855f7; transform: translateY(-5px); background: rgba(168, 85, 247, 0.05); }
        @media (max-width: 768px) { .guru-content-box { padding: 30px 20px; border-radius: 20px; } }
      `}</style>

      <article style={container}>
        <div className="guru-content-box">
          <header style={{ marginBottom: '40px' }}>
            <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={backLink}>
              <ArrowLeft size={16} /> {isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#a855f7', marginBottom: '20px' }}>
              <BookOpen size={48} style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' }} />
              <div style={badgeStyle}>
                <Bookmark size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                {isEn ? 'TECH DEFINITION' : 'TECHNICKÁ DEFINICE'}
              </div>
            </div>
            
            <h1 style={mainTitle}>{displayTitle}</h1>

            {/* GURU FIX: Zobrazení stĺpca DESCRIPTION */}
            {displayDesc && (
              <div className="description-panel">
                <p style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '600', lineHeight: '1.5' }}>
                  {displayDesc}
                </p>
              </div>
            )}
          </header>

          <div 
            className="article-body" 
            dangerouslySetInnerHTML={{ __html: displayContent || (isEn ? 'Decoding details...' : 'Načítám technické detaily...') }} 
          />

          {/* --- 🛡️ GURU SUPPORT SHIELD --- */}
          <div style={guruShield}>
            <Heart size={44} color="#a855f7" fill="#a855f7" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '10px' }}>
              {isEn ? 'SUPPORT THE DATABASE' : 'PODPOŘ SLOVNÍK'}
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '25px', fontSize: '15px', maxWidth: '500px', margin: '0 auto 25px' }}>
              {isEn 
                ? 'Did this clear things up? Keep the Guru library growing.' 
                : 'Osvětlil ti tento pojem technickou hádanku? Podpoř projekt a pomoz nám rozšiřovat tuto databázi.'}
            </p>
            <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
               {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </Link>
          </div>
        </div>

        {/* --- DALŠÍ POJMY --- */}
        <div style={{ marginTop: '80px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '30px' }}>
             {isEn ? 'OTHER TERMS' : 'DALŠÍ POJMY'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {dalsiPojmy.map((p) => (
              <Link key={p.slug} href={isEn ? `/en/slovnik/${p.slug_en || p.slug}` : `/slovnik/${p.slug}`} className="more-card">
                <h4 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 12px 0', color: '#fff' }}>
                  {isEn && p.title_en ? p.title_en : p.title}
                </h4>
                <div style={{ color: '#a855f7', fontSize: '11px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   {isEn ? 'READ MORE' : 'ZOBRAZIT VÝKLAD'} <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>

      {/* --- FLOATING SHARE --- */}
      <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={shareBtn}>
        <Share2 size={24} />
      </button>
    </div>
  );
}

// --- MASTER STYLES (COMPACT ELITE) ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const container = { maxWidth: '850px', margin: '0 auto', padding: '120px 20px 80px' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: '900', fontSize: '13px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' };
const mainTitle = { fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '950', lineHeight: '1', textTransform: 'uppercase', color: '#fff', letterSpacing: '-1.5px' };
const badgeStyle = { background: 'rgba(168, 85, 247, 0.15)', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '900', letterSpacing: '1px', border: '1px solid #a855f7' };
const guruShield = { marginTop: '80px', padding: '40px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '30px', border: '1px solid #a855f7', textAlign: 'center' };
const supportBtn = { background: '#a855f7', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', display: 'inline-block' };
const shareBtn = { position: 'fixed', right: '40px', bottom: '40px', width: '60px', height: '60px', borderRadius: '50%', background: '#a855f7', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)', zIndex: 100 };
