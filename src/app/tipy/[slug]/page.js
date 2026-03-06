"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { Lightbulb, ArrowLeft, Heart, Share2, Loader2, Play, ChevronRight, Bookmark } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
        if (isEn) query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        else query = query.eq('slug', slug);
        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);
        document.title = `${isEn ? data.title_en : data.title} | Guru Tips`;
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return <div style={center}><Loader2 className="animate-spin" size={48} color="#a855f7" /></div>;
  if (!item) return <div style={center}><h1>TIP NOT FOUND</h1></div>;

  const title = (isEn && item.title_en) ? item.title_en : item.title;
  const description = (isEn && item.description_en) ? item.description_en : item.description;
  const content = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <div style={pageWrapper}>
      <article style={container}>
        <div className="guru-content-box" style={contentBoxStyle}>
          <header style={{ marginBottom: '40px' }}>
            <Link href={isEn ? "/en/tipy" : "/tipy"} style={backLink}><ArrowLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</Link>
            <h1 style={mainTitle}>{title}</h1>
          </header>

          {/* 🚀 GURU DESCRIPTION PANEL - PŘIDANÉ POPISKY PODLE TVÉHO PŘÍKAZU */}
          {description && (
            <div style={descPanel}>
              {description}
            </div>
          )}

          <div className="article-body prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* 🛡️ GURU SHIELD SUPPORT BOX */}
          <div style={guruShield}>
            <Heart size={44} color="#a855f7" fill="#a855f7" style={{ margin: '0 auto 25px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>{isEn ? 'SUPPORT GURU' : 'PODPOŘ GURU PROJEKT'}</h3>
            <p style={{ color: '#d1d5db', margin: '0 auto 35px', maxWidth: '600px' }}>{isEn ? 'Help the Guru project stay ad-free.' : 'Hardware Guru běží bez reklam díky tvojí podpoře.'}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>DARY / REVOLUT</Link>
              {/* 📰 GOOGLE CONTRIBUTION BUTTON */}
              <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px 80px' };
const container = { maxWidth: '900px', margin: '0 auto' };
const contentBoxStyle = { background: 'rgba(10, 11, 13, 0.94)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: '900', fontSize: '13px', marginBottom: '30px', textTransform: 'uppercase' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0 };
const descPanel = { background: 'rgba(255,255,255,0.03)', borderLeft: '4px solid #a855f7', padding: '25px', margin: '20px 0 50px 0', fontSize: '1.25rem', color: '#fff', fontWeight: '600', lineHeight: '1.5', borderRadius: '0 12px 12px 0' };
const guruShield = { marginTop: '100px', padding: '50px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '35px', border: '1px solid #a855f7', textAlign: 'center' };
const supportBtn = { background: '#a855f7', color: '#fff', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' };
