"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { Wrench, ArrowLeft, Heart, Loader2, Activity } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TweakDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from('tweaky').select('*');
        if (isEn) query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        else query = query.eq('slug', slug);
        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);
        document.title = `${isEn ? data.title_en : data.title} | Guru Tweaks`;
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return <div style={center}><Loader2 className="animate-spin" size={48} color="#eab308" /></div>;
  if (!item) return <div style={center}><h1>GURU FIX NOT FOUND</h1></div>;

  return (
    <div style={pageWrapper}>
      <article style={container}>
        <div style={contentBoxStyle}>
          <header style={{ marginBottom: '50px' }}>
            <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={backLink}><ArrowLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</Link>
            <h1 style={mainTitle}>{isEn && item.title_en ? item.title_en : item.title}</h1>
          </header>

          <div className="article-body prose" dangerouslySetInnerHTML={{ __html: isEn && item.content_en ? item.content_en : item.content }} />

          {/* 🛡️ GURU SHIELD SUPPORT BOX (Vylepšeno o Google Button) */}
          <div style={guruShield}>
            <Heart size={44} color="#eab308" fill="#eab308" style={{ margin: '0 auto 25px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</h3>
            <p style={{ color: '#d1d5db', margin: '20px 0 35px' }}>{isEn ? 'Help us research more hardware fixes.' : 'Pomoz nám v dalším výzkumu hardware fixů.'}</p>
            
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

const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px' };
const container = { maxWidth: '1000px', margin: '0 auto' };
const contentBoxStyle = { background: 'rgba(10, 11, 13, 0.94)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(234, 179, 8, 0.2)' };
const backLink = { color: '#eab308', textDecoration: 'none', fontWeight: '900', fontSize: '13px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: '950', color: '#fff', textTransform: 'uppercase' };
const guruShield = { marginTop: '80px', padding: '50px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '35px', border: '1px solid #eab308', textAlign: 'center' };
const supportBtn = { background: '#eab308', color: '#000', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' };
