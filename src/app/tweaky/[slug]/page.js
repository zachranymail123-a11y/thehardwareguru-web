"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { Wrench, ArrowLeft, Heart, Share2, Loader2, Activity, ChevronRight, Monitor, Play } from 'lucide-react';
import Link from 'next/link';

// GURU ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TweakDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  const [item, setItem] = useState(null);
  const [dalsiTweaky, setDalsiTweaky] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. FETCH HLAVNÍHO TWEAKU
        let query = supabase.from('tweaky').select('*');
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }
        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);

        // 2. FETCH DALŠÍCH TWEAKŮ (GURU PANEL REQUIREMENT)
        const { data: more } = await supabase
          .from('tweaky')
          .select('title, title_en, slug, slug_en, image_url')
          .neq('id', data.id)
          .limit(3);
        setDalsiTweaky(more || []);

        // 🚀 SEO INJECTION
        const seoTitle = isEn 
          ? (data.meta_title_en || data.title_en || data.title) 
          : (data.meta_title || data.title);
        document.title = `${seoTitle} | Expert Guru Tweaks`;

      } catch (err) {
        console.error("GURU ERROR: Tweak load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="#eab308" />
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#eab308', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {isEn ? 'GURU IS TUNING DATA...' : 'GURU TUNÍ DATA...'}
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={errorContainer}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>
          {isEn ? 'TWEAK NOT FOUND' : 'TWEAK NENALEZEN'}
        </h1>
        <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={backBtn}>
          {isEn ? 'BACK TO TWEAKS' : 'ZPĚT NA TWEAKY'}
        </Link>
      </div>
    );
  }

  const title = (isEn && item.title_en) ? item.title_en : item.title;
  const content = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <div style={pageWrapper}>
      <style>{`
        .article-body h2 { color: #fff; margin: 40px 0 20px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #eab308; padding-bottom: 10px; display: inline-block; }
        .article-body p { line-height: 1.8; margin-bottom: 25px; font-size: 1.15rem; color: #d1d5db; }
        .article-body pre { background: #000; padding: 25px; border-radius: 16px; border: 1px solid #eab308; overflow-x: auto; margin: 30px 0; box-shadow: 0 0 30px rgba(234, 179, 8, 0.1); }
        .article-body code { color: #66fcf1; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; }
        .article-body ul { margin-bottom: 30px; list-style: none; }
        .article-body li { margin-bottom: 15px; padding-left: 30px; position: relative; color: #e5e7eb; }
        .article-body li::before { content: "⚡"; position: absolute; left: 0; color: #eab308; }
        .more-card { background: rgba(17, 19, 24, 0.7); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; height: 100%; display: flex; flexDirection: column; }
        .more-card:hover { border-color: #eab308; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      `}</style>

      <article style={container}>
        {/* --- HEADER --- */}
        <header style={{ marginBottom: '60px' }}>
          <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={backLink}>
            <ArrowLeft size={16} /> {isEn ? 'BACK TO BASE' : 'ZPĚT NA ZÁKLADNU'}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#eab308', marginBottom: '25px' }}>
             <Wrench size={64} style={{ filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.4))' }} />
             <div style={{ background: 'rgba(234, 179, 8, 0.15)', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '900', letterSpacing: '1px', border: '1px solid #eab308' }}>
                <Activity size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                {isEn ? 'SYSTEM OPTIMIZATION' : 'OPTIMALIZACE SYSTÉMU'}
             </div>
          </div>
          <h1 style={mainTitle}>{title}</h1>
        </header>

        {/* --- HERO IMAGE --- */}
        {item.image_url && item.image_url !== 'EMPTY' && (
          <div style={imageWrapper}>
             <img src={item.image_url} alt={title} style={heroImg} />
          </div>
        )}

        {/* --- MAIN CONTENT --- */}
        <div 
          className="article-body prose" 
          dangerouslySetInnerHTML={{ __html: content || (isEn ? 'Data synchronization in progress...' : 'Guru synchronizuje data...') }} 
        />

        {/* --- 🛡️ GURU SHIELD SUPPORT BOX (RESTORED FROM BACKUP) --- */}
        <div style={guruShield}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Heart size={44} color="#eab308" fill="#eab308" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.5))' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
              {isEn ? 'KEEP THE GURU ENGINES RUNNING' : 'UDRŽUJ MOTORY GURUHO V CHODU'}
            </h3>
            <p style={{ color: '#d1d5db', margin: '0 auto 35px', lineHeight: '1.7', maxWidth: '600px', fontSize: '17px' }}>
              {isEn 
                ? 'Did this tweak fix your game? This project runs without ads thanks to your support. Help us research more hardware fixes.'
                : 'Pomohl ti tento návod zkrotit tvé FPS? Hardware Guru běží bez reklam jen díky tvojí podpoře. Zvaž příspěvek na další výzkum technických fixů.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
                <Heart size={20} fill="#0b0c10" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" style={kickBtn}>
                 <Play size={18} fill="#000" /> KICK LIVE
              </a>
            </div>
          </div>
        </div>

        {/* --- DALŠÍ GURU NÁVODY (PANEL RESTORED) --- */}
        <div style={{ marginTop: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
               {isEn ? 'OTHER GURU FIXES' : 'DALŠÍ GURU FIXY'}
             </h2>
             <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #333, transparent)' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
            {dalsiTweaky.map((t) => (
              <Link key={t.slug} href={isEn ? `/en/tweaky/${t.slug_en || t.slug}` : `/tweaky/${t.slug}`} style={{ textDecoration: 'none' }}>
                <div className="more-card">
                  <div style={{ height: '160px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                     <img src={t.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#fff', lineHeight: '1.4' }}>
                      {isEn && t.title_en ? t.title_en : t.title}
                    </h4>
                    <div style={{ marginTop: '15px', color: '#eab308', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
                       ZOBRAZIT <ChevronRight size={14} />
                    </div>
                  </div>
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
const container = { maxWidth: '850px', margin: '0 auto', padding: '120px 20px 80px' };
const errorContainer = { textAlign: 'center', padding: '150px 20px', color: '#fff', backgroundColor: '#0a0b0d', minHeight: '100vh' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', textDecoration: 'none', fontWeight: '900', fontSize: '13px', marginBottom: '35px', textTransform: 'uppercase', letterSpacing: '1px' };
const backBtn = { display: 'inline-block', background: '#eab308', color: '#0b0c10', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', marginTop: '20px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: '950', lineHeight: '0.95', textTransform: 'uppercase', letterSpacing: '-1px', color: '#fff' };
const imageWrapper = { margin: '40px 0 60px', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' };
const heroImg = { width: '100%', height: 'auto', display: 'block' };
const guruShield = { marginTop: '100px', padding: '60px 40px', background: 'rgba(234, 179, 8, 0.08)', borderRadius: '40px', border: '1px solid #eab308', textAlign: 'center', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' };
const supportBtn = { background: '#eab308', color: '#0b0c10', padding: '18px 36px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: '0.2s', fontSize: '16px' };
const kickBtn = { background: '#53fc18', color: '#0b0c10', padding: '18px 36px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '16px' };
const floatingActions = { position: 'fixed', right: '40px', bottom: '40px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '15px' };
const shareBtn = { width: '60px', height: '60px', borderRadius: '50%', background: '#eab308', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(234, 179, 8, 0.3)' };
