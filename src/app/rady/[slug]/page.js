"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Heart, Loader2 } from 'lucide-react';
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
        
        // GURU SLUG ENGINE: Středová logika pro CZ i EN verzi
        if (isEn) {
          query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);
        
        const pageTitle = (isEn && data.title_en) ? data.title_en : data.title;
        document.title = `${pageTitle} | Guru Guides`;
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return <div style={center}><Loader2 className="animate-spin" size={48} color="#66fcf1" /></div>;
  if (!item) return <div style={center}><h1>{isEn ? 'GUIDE NOT FOUND' : 'NÁVOD NENALEZEN'}</h1></div>;

  const title = (isEn && item.title_en) ? item.title_en : item.title;
  const description = (isEn && item.description_en) ? item.description_en : item.description;
  const content = (isEn && item.content_en) ? item.content_en : item.content;

  return (
    <div style={pageWrapper}>
      <article style={container}>
        <div style={contentBoxStyle}>
          <header style={{ marginBottom: '60px' }}>
            <Link href={isEn ? "/en/rady" : "/rady"} style={backLink}>
              <ArrowLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
            </Link>
            <h1 style={mainTitle}>{title}</h1>
          </header>

          {/* 🚀 GURU DESCRIPTION PANEL */}
          {description && (
            <div style={descPanel}>
              {description}
            </div>
          )}

          <div 
            className="article-body prose" 
            style={{ color: '#d1d5db', lineHeight: '1.8' }} 
            dangerouslySetInnerHTML={{ __html: content || '...' }} 
          />

          {/* 🛡️ GURU SUPPORT SHIELD */}
          <div style={guruShield}>
            <Heart size={44} color="#66fcf1" fill="#66fcf1" style={{ margin: '0 auto 25px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
              {isEn ? 'SUPPORT GURU PROJECT' : 'PODPOŘ GURU PROJEKT'}
            </h3>
            <p style={{ color: '#d1d5db', margin: '0 auto 35px', maxWidth: '600px' }}>
              {isEn ? 'Help us research more hardware fixes and keep the base ad-free.' : 'Zvaž příspěvek na další výzkum technických fixů a provoz webu bez reklam.'}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
                DARY / REVOLUT
              </Link>
              
              {/* 📰 GOOGLE CONTRIBUTION BUTTON */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '48px' }}>
                <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <footer style={{ padding: '60px 20px', textAlign: 'center', opacity: 0.4 }}>
         <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '900', letterSpacing: '2px' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE TECH BASE
         </p>
      </footer>
    </div>
  );
}

const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px 40px' };
const container = { maxWidth: '900px', margin: '0 auto' };
const contentBoxStyle = { background: 'rgba(10, 11, 13, 0.94)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(102, 252, 241, 0.15)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', marginBottom: '30px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' };
const descPanel = { background: 'rgba(255,255,255,0.03)', borderLeft: '4px solid #66fcf1', padding: '25px', margin: '20px 0 50px 0', fontSize: '1.25rem', color: '#fff', fontWeight: '600', borderRadius: '0 12px 12px 0' };
const guruShield = { marginTop: '100px', padding: '50px', background: 'rgba(102, 252, 241, 0.05)', borderRadius: '35px', border: '1px solid #66fcf1', textAlign: 'center' };
const supportBtn = { background: '#66fcf1', color: '#0b0c10', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', transition: '0.2s' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' };
