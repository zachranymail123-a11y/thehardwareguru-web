"use client";
import React, { useState, useEffect, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Home, Lightbulb, Book, PenTool, ChevronRight, Search } from 'lucide-react';

export default function SlovnikPage({ params }) {
  // GURU FIX: Bezpečné rozbalení parametrů pro Next.js 15+
  const resolvedParams = use(params);
  const lang = resolvedParams?.lang || 'cs';
  const isEn = lang === 'en';

  const [pojmy, setPojmy] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function loadSlovnik() {
      const { data } = await supabase
        .from('slovnik')
        .select('*')
        .order('title', { ascending: true });
      if (data) setPojmy(data);
    }
    loadSlovnik();
  }, []);

  // Překlady UI (Guru style)
  const t = {
    title: isEn ? "HARDWARE DICTIONARY" : "HARDWARE SLOVNÍK",
    subtitle: isEn ? "Your technical knowledge starts here." : "Tvé technické znalosti začínají zde.",
    searchPlaceholder: isEn ? "Search the whole site..." : "Hledat na celém webu...",
    searching: isEn ? "Searching..." : "Hledám...",
    noResults: isEn ? "Nothing found." : "Nic jsme nenašli.",
    navHome: isEn ? "HOMEPAGE" : "DOMŮ",
    navTips: isEn ? "TIPS" : "TIPY",
    navDict: isEn ? "DICTIONARY" : "SLOVNÍK",
    navAdvice: isEn ? "ADVICE" : "PRAKTICKÉ RADY",
    detailBtn: isEn ? "Show detail" : "Zobrazit detail",
    aboutTitle: isEn ? "About the project" : "O projektu",
    aboutDesc: isEn ? "Welcome to the world of The Hardware Guru!" : "Vítej ve světě The Hardware Guru!"
  };

  const baseUrl = isEn ? '/en' : '';

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: 'sans-serif',
        color: '#fff',
        backgroundColor: '#0a0b0d',
        backgroundImage: 'url("/bg-guru.png")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <style>{`
        .term-card { background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.3); padding: 30px; border-radius: 28px; transition: all 0.3s ease; text-decoration: none; color: inherit; display: flex; flex-direction: column; }
        .term-card:hover { border-color: #a855f7; box-shadow: 0 0 25px rgba(168, 85, 247, 0.2); transform: translateY(-5px); }
        .nav-link { color: #fff; text-decoration: none; font-weight: bold; transition: 0.2s; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .nav-link:hover { color: #a855f7; }
        .lang-switch { background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 5px 12px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 12px; border: 1px solid rgba(168, 85, 247, 0.4); }
      `}</style>

      {/* NAVIGACE */}
      <nav style={{ padding: '20px 40px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', position: 'sticky', top: 0, zIndex: 1000 }}>
        <Link href="/" className="nav-link"><Home size={18} /> {t.navHome}</Link>
        <Link href="/tipy" className="nav-link"><Lightbulb size={18} /> {t.navTips}</Link>
        <Link href={`${baseUrl}/slovnik`} className="nav-link" style={{color: '#a855f7'}}><Book size={18} /> {t.navDict}</Link>
        <Link href="/rady" className="nav-link"><PenTool size={18} /> {t.navAdvice}</Link>
        
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
        {isEn ? (
            <Link href="/slovnik" className="lang-switch">CZ</Link>
        ) : (
            <Link href="/en/slovnik" className="lang-switch">EN</Link>
        )}
      </nav>

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase' }}>
                GURU <span style={{ color: '#a855f7' }}>{isEn ? "DICTIONARY" : "SLOVNÍK"}</span>
            </h1>
            <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600' }}>{t.subtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {pojmy.map((pojem) => {
            const displayTitle = isEn && pojem.title_en ? pojem.title_en : pojem.title;
            const displayDesc = isEn && pojem.description_en ? pojem.description_en : pojem.description;
            const displaySlug = isEn && pojem.slug_en ? pojem.slug_en : pojem.slug;

            return (
              <Link key={pojem.id} href={`${baseUrl}/slovnik/${displaySlug}`} className="term-card">
                <h2 style={{ color: '#a855f7', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900' }}>{displayTitle}</h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                  {displayDesc && displayDesc.substring(0, 140)}...
                </p>
                <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {t.detailBtn} <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
