import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Wrench, Settings, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

// Dynamické načítání – stránka se vygeneruje čerstvá pro každý požadavek
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. GENERUJE META TAGY PRO GOOGLE SEO A SOCIÁLNÍ SÍTĚ
export async function generateMetadata({ params }) {
  const { data: tweak } = await supabase
    .from('tweaky')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tweak) {
    return { title: 'Tweak nenalezen | The Hardware Guru' };
  }

  return {
    title: `${tweak.title} - Optimalizace a Fixy | The Hardware Guru`,
    description: tweak.description,
    openGraph: {
      title: tweak.title,
      description: tweak.description,
      images: tweak.image_url && tweak.image_url !== 'EMPTY' ? [tweak.image_url] : [],
      type: 'article',
      publishedTime: tweak.created_at,
    },
  };
}

// 2. HLAVNÍ KOMPONENTA STRÁNKY ČLÁNKU
export default async function TweakDetail({ params }) {
  // Načtení dat z databáze podle URL slugu
  const { data: tweak, error } = await supabase
    .from('tweaky')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !tweak) {
    return (
      <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', padding: '100px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ff0000', fontSize: '32px', marginBottom: '20px' }}>Chyba: Tweak nenalezen</h1>
        <p>Tenhle návod buď ještě neexistuje, nebo ho šotek smazal.</p>
        <Link href="/tweaky" style={{ color: '#eab308', marginTop: '20px', display: 'inline-block' }}>Zpět na Guru Tweaky</Link>
      </div>
    );
  }

  // Formátování data
  const pubDate = new Date(tweak.created_at).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: 'sans-serif', 
      padding: '0 0 80px 0' 
    }}>
      
      {/* HLAVNÍ NAVIGACE */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '25px', 
        padding: '20px', 
        background: 'rgba(0,0,0,0.7)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap'
      }}>
        <Link href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/clanky" style={navItemStyle}><Newspaper size={18} /> ČLÁNKY</Link>
        <Link href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/sestavy" style={navItemStyle}><Monitor size={18} /> SESTAVY</Link>
        <Link href="/tweaky" style={{...navItemStyle, color: '#eab308'}}><Wrench size={18} /> GURU TWEAKY</Link>
        <Link href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Tlačítko Zpět */}
        <div style={{ marginBottom: '30px' }}>
          <Link href="/tweaky" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#eab308'} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}>
            <ArrowLeft size={16} /> Zpět na přehled tweaků
          </Link>
        </div>

        {/* HLAVNÍ KARTA ČLÁNKU */}
        <div style={{
          background: 'rgba(17, 19, 24, 0.85)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(234, 179, 8, 0.4)', 
          borderRadius: '28px', 
          padding: '40px',
          boxShadow: '0 0 50px rgba(234, 179, 8, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Štítek kategorie a datum */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', background: 'rgba(234, 179, 8, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
              <Settings size={16} /> {tweak.category}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>
              <Calendar size={14} /> {pubDate}
            </div>
          </div>

          {/* Nadpis H1 */}
          <h1 style={{ fontSize: '46px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '30px', lineHeight: '1.1' }}>
            {tweak.title}
          </h1>

          {/* AI Obrázek (Pokud existuje a není EMPTY) */}
          {tweak.image_url && tweak.image_url !== 'EMPTY' && (
            <div style={{ marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={tweak.image_url} alt={`Ilustrace k návodu ${tweak.title}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          {/* SEO Popis (Perex) */}
          <div style={{ fontSize: '20px', color: '#d1d5db', lineHeight: '1.7', fontWeight: '300', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <strong style={{ color: '#fff' }}>GURU SHRNUTÍ: </strong>{tweak.description}
          </div>

          {/* Tělo článku (HTML vygenerované z AI) */}
          <div 
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: tweak.content }}
          />

          {/* ZÁVĚREČNÝ CALL TO ACTION */}
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(88, 101, 242, 0.4)', borderRadius: '20px', padding: '30px', textAlign: 'center', marginTop: '60px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '15px' }}>
              Pořád to nejede plynule?
            </h3>
            <p style={{ color: '#ccc', fontSize: '15px', marginBottom: '25px', fontWeight: 'bold' }}>
              Řešíme hardwarové problémy a tweaky k novým hrám na našem Discordu. <br/>Doval tam a komunita ti pomůže s tvým konkrétním PC.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={discordBtnStyle}>
                DISCORD GURU KOMUNITA
              </a>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '30px', fontStyle: 'italic', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Zdroj surových technických dat: PCGamingWiki & Komunita. Texty a fixy zpracovány GURU AI systémem.
          </p>
        </div>
      </div>
    </div>
  );
}

// STYLY 
const navItemStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const discordBtnStyle = {
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  padding: '16px 32px', 
  borderRadius: '12px', 
  fontWeight: '900', 
  textTransform: 'uppercase', 
  textDecoration: 'none', 
  fontSize: '14px', 
  background: '#5865F2', 
  color: '#fff',
  border: 'none',
  cursor: 'pointer'
};

const contentStyle = {
  color: '#9ca3af',
  fontSize: '17px',
  lineHeight: '1.8',
  fontFamily: 'sans-serif'
};
