"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { BookOpen, ArrowLeft, Loader2, Heart, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GlossaryDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
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
        
        const pageTitle = (isEn && data.title_en) ? data.title_en : data.title;
        document.title = `${pageTitle} – ${isEn ? 'Hardware Definition' : 'Technická definice'} | Guru Slovník`;
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return <div style={center}><Loader2 className="animate-spin" size={48} color="#a855f7" /></div>;
  if (!item) return (
    <div style={center}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '950', color: '#a855f7' }}>404</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>{isEn ? 'TERM NOT FOUND' : 'POJEM NENALEZEN'}</p>
        <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={backLink}>{isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}</Link>
      </div>
    </div>
  );

  const title = (isEn && item.title_en) ? item.title_en : item.title;
  const description = (isEn && item.description_en) ? item.description_en : item.description;
  const content = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <div style={pageWrapper}>
      <article style={container}>
        <div style={contentBox}>
          <header style={{ marginBottom: '40px' }}>
            <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={backLink}>
              <ArrowLeft size={16} /> {isEn ? 'BACK TO GLOSSARY' : 'ZPĚT DO SLOVNÍKU'}
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#a855f7', marginTop: '30px', marginBottom: '20px' }}>
              <BookOpen size={42} />
              <div style={badgeStyle}>{isEn ? 'TECHNICAL DEFINITION' : 'TECHNICKÁ DEFINICE'}</div>
            </div>
            
            <h1 style={titleStyle}>{title}</h1>
          </header>
          
          {/* 🚀 GURU DESCRIPTION PANEL - POPISKY PODLE TVÉHO PŘÍKAZU */}
          {description && (
            <div style={descPanel}>
              {description}
            </div>
          )}

          <div className="article-body prose" style={{ color: '#d1d5db', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: content }} />
          
          {/* 🛡️ GURU SUPPORT SHIELD (Včetně Google Contribution) */}
          <div style={supportBox}>
            <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#eab308', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>
              {isEn ? 'HELPED THIS DEFINITION?' : 'POMOHL TI TENTO VÝKLAD?'}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '35px', maxWidth: '600px', margin: '0 auto 35px' }}>
              {isEn 
                ? 'Support The Hardware Guru project. Every contribution helps us maintain servers and hardware testing.' 
                : 'Pokud ti Guru Slovník osvětlil technické pojmy, zvaž podporu projektu. Každá podpora nám pomáhá udržet provoz serveru a všech služeb.'}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
                <Heart size={20} fill="#000" /> {isEn ? 'SUPPORT' : 'PODPOŘIT GURU'}
              </Link>
              
              {/* 📰 GOOGLE CONTRIBUTION BUTTON */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '48px' }}>
                <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px 80px' };
const container = { maxWidth: '850px', margin: '0 auto' };
const contentBox = { background: 'rgba(10, 11, 13, 0.96)', backdropFilter: 'blur(20px)', borderRadius: '35px', padding: '50px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase' };
const titleStyle = { fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: '950', textTransform: 'uppercase', color: '#fff', margin: 0, lineHeight: '1.1' };
const badgeStyle = { background: 'rgba(168, 85, 247, 0.15)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '950', border: '1px solid #a855f7', letterSpacing: '1px' };
const descPanel = { background: 'rgba(255,255,255,0.03)', borderLeft: '4px solid #a855f7', padding: '25px', margin: '20px 0 40px 0', fontSize: '1.25rem', color: '#fff', fontWeight: '600', borderRadius: '0 12px 12px 0' };
const supportBox = { marginTop: '80px', padding: '50px', background: 'rgba(234, 179, 8, 0.03)', borderRadius: '32px', border: '1px dashed rgba(234, 179, 8, 0.3)', textAlign: 'center' };
const supportBtn = { background: '#eab308', color: '#000', padding: '15px 30px', borderRadius: '15px', textDecoration: 'none', fontWeight: '950', display: 'inline-flex', alignItems: 'center', gap: '10px' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' };
