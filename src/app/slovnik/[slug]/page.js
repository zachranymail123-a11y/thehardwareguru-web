"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname, useParams } from 'next/navigation';
import { BookOpen, ArrowLeft, Share2, Loader2, Bookmark, Heart, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

// GURU ENGINE: Připojení k Supabase
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
        
        // GURU SLUG ENGINE: V angličtině hledáme v obou sloupcích
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

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' }}>
      <Loader2 className="animate-spin" size={48} color="#a855f7" />
      <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {isEn ? 'GURU IS DECODING TERMS...' : 'GURU DEŠIFRUJE POJMY...'}
      </p>
    </div>
  );

  if (!item) return (
    <div style={errorContainer}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>
        {isEn ? 'TERM NOT FOUND' : 'POJEM NENALEZEN'}
      </h1>
      <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={backBtn}>
        {isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}
      </Link>
    </div>
  );

  const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
  const displayContent = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <div style={pageWrapper}>
      <style>{`
        .article-body h2 { color: #fff; margin: 40px 0 20px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #a855f7; padding-bottom: 10px; display: inline-block; }
        .article-body p { line-height: 1.8; margin-bottom: 25px; font-size: 1.15rem; color: #d1d5db; }
        .article-body strong { color: #fff; font-weight: 800; }
        .article-body a { color: #a855f7; text-decoration: underline; }
        .guru-content-box { 
          background: rgba(10, 11, 13, 0.94); 
          backdrop-filter: blur(20px); 
          border-radius: 40px; 
          padding: 60px; 
          border: 1px solid rgba(168, 85, 247, 0.2); 
          box-shadow: 0 40px 100px rgba(0,0,0,0.9); 
        }
        .more-card { 
          background: rgba(17, 19, 24, 0.7); 
          border-radius: 24px; 
          padding: 25px; 
          border: 1px solid rgba(255,255,255,0.05); 
          transition: 0.3s; 
          height: 100%; 
          display: flex; 
          flex-direction: column; 
          text-decoration: none;
        }
        .more-card:hover { border-color: #a855f7; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        @media (max-width: 768px) { .guru-content-box { padding: 30px 20px; border-radius: 20px; } }
      `}</style>

      <article style={container}>
        <div className="guru-content-box">
          <header style={{ marginBottom: '50px' }}>
            <Link href={isEn ? "/en/slovnik" : "/slovnik"} prefetch={false} style={backLink}>
              <ArrowLeft size={16} /> {isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#a855f7', marginBottom: '25px' }}>
              <BookOpen size={64} style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))' }} />
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '900', letterSpacing: '1px', border: '1px solid #a855f7' }}>
                <Bookmark size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                {isEn ? 'TECHNICAL DEFINITION' : 'TECHNICKÁ DEFINICE'}
              </div>
            </div>
            <h1 style={mainTitle}>{displayTitle}</h1>
          </header>

          <div 
            className="article-body prose" 
            dangerouslySetInnerHTML={{ __html: displayContent || (isEn ? 'The Guru is defining this term...' : 'Guru definuje tento pojem...') }} 
          />

          {/* --- 🛡️ GURU SHIELD SUPPORT BOX --- */}
          <div style={guruShield}>
            <Heart size={44} color="#a855f7" fill="#a855f7" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
              {isEn ? 'SUPPORT THE GLOSSARY' : 'PODPOŘ GURU SLOVNÍK'}
            </h3>
            <p style={{ color: '#d1d5db', margin: '0 auto 35px', lineHeight: '1.7', maxWidth: '600px', fontSize: '17px' }}>
              {isEn 
                ? 'Did this definition help you understand the tech better? Support the Guru project to keep the knowledge base growing.'
                : 'Osvětlil ti tento pojem technickou hádanku? Hardware Guru běží bez reklam díky tvojí podpoře. Zvaž příspěvek na rozšiřování této databáze.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
                <Heart size={20} fill="#0b0c10" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
            </div>
          </div>
        </div>

        {/* --- DALŠÍ POJMY --- */}
        <div style={{ marginTop: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
               {isEn ? 'OTHER TERMS' : 'DALŠÍ POJMY'}
             </h2>
             <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #333, transparent)' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
            {dalsiPojmy.map((p) => (
              <Link key={p.slug} href={isEn ? `/en/slovnik/${p.slug_en || p.slug}` : `/slovnik/${p.slug}`} className="more-card">
                <BookOpen size={24} color="#a855f7" style={{ marginBottom: '15px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', lineHeight: '1.4' }}>
                  {isEn && p.title_en ? p.title_en : p.title}
                </h4>
                <div style={{ marginTop: 'auto', paddingTop: '15px', color: '#a855f7', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   {isEn ? 'READ MORE' : 'ZOBRAZIT VÝKLAD'} <ChevronRight size={14} />
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
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: '900', fontSize: '13px', marginBottom: '35px', textTransform: 'uppercase', letterSpacing: '1px' };
const backBtn = { display: 'inline-block', background: '#a855f7', color: '#fff', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', marginTop: '20px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: '950', lineHeight: '1', textTransform: 'uppercase', color: '#fff', letterSpacing: '-1px' };
const guruShield = { marginTop: '80px', padding: '50px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '35px', border: '1px solid #a855f7', textAlign: 'center', backdropFilter: 'blur(10px)' };
const supportBtn = { background: '#a855f7', color: '#fff', padding: '18px 36px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '16px' };
const floatingActions = { position: 'fixed', right: '40px', bottom: '40px', zIndex: 100 };
const shareBtn = { width: '60px', height: '60px', borderRadius: '50%', background: '#a855f7', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' };
