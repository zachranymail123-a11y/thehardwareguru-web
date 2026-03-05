"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // GURU: Bezpečnější než async params
import { Home, Lightbulb, Book, PenTool, ChevronRight, Search } from 'lucide-react';

// GURU FIX: Supabase klienta vytvoříme MIMO komponentu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SlovnikPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [pojmy, setPojmy] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. POJISTKA PROTI HYDRATAČNÍM CHYBÁM (Mounted stav)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. NAČTENÍ SLOVNÍKU (Spustí se až po namontování na klientovi)
  useEffect(() => {
    if (!mounted) return;

    async function loadSlovnik() {
      const { data } = await supabase
        .from('slovnik')
        .select('*')
        .order('title', { ascending: true });
      if (data) setPojmy(data);
    }
    loadSlovnik();
  }, [mounted]);

  // 3. INTELIGENTNÍ VYHLEDÁVÁNÍ
  useEffect(() => {
    if (!mounted || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [pRes, tipRes, tweakRes] = await Promise.all([
          supabase.from('posts').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tipy').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tweaky').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3)
        ]);

        let results = [];
        const isEn = params?.lang === 'en';
        if (pRes.data) results = [...results, ...pRes.data.map(x => ({ ...x, category: isEn ? 'Article' : 'Článek', link: `/clanky/${x.slug}` }))];
        if (tipRes.data) results = [...results, ...tipRes.data.map(x => ({ ...x, category: 'Tip', link: `/tipy/${x.slug}` }))];
        if (tweakRes.data) results = [...results, ...tweakRes.data.map(x => ({ ...x, category: 'Tweak', link: `/tweaky/${x.slug}` }))];

        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, mounted, params?.lang]);

  // Pokud nejsme na klientovi, nevracíme nic (prevence "Minified React error #438")
  if (!mounted) return null;

  const lang = params?.lang || 'cs';
  const isEn = lang === 'en';
  const baseUrl = isEn ? '/en' : '';

  // Jazykové mapování textů
  const t = {
    title1: isEn ? "GURU HARDWARE" : "GURU HARDWARE",
    title2: isEn ? "DICTIONARY" : "SLOVNÍK",
    subtitle: isEn ? "Your technical knowledge starts here." : "Tvé technické znalosti začínají zde.",
    searchPlaceholder: isEn ? "Search the whole site..." : "Hledat na celém webu...",
    searching: isEn ? "Searching..." : "Hledám...",
    nothingFound: isEn ? "Nothing found." : "Nic jsme nenašli.",
    detailBtn: isEn ? "Show detail" : "Zobrazit detail",
    navHome: isEn ? "HOMEPAGE" : "DOMŮ",
    navTips: isEn ? "TIPS" : "TIPY",
    navDict: isEn ? "DICTIONARY" : "SLOVNÍK",
    navAdvice: isEn ? "ADVICE" : "PRAKTICKÉ RADY"
  };

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
        .term-card { background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.3); padding: 30px; border-radius: 28px; transition: 0.3s ease; text-decoration: none; color: inherit; display: flex; flex-direction: column; box-sizing: border-box; }
        .term-card:hover { border-color: #a855f7; box-shadow: 0 0 25px rgba(168, 85, 247, 0.2); transform: translateY(-5px); }
        .nav-link { color: #fff; text-decoration: none; font-weight: bold; transition: 0.2s; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .nav-link:hover { color: #a855f7; }
        .lang-switch { background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 4px 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px; transition: 0.2s; border: 1px solid rgba(168, 85, 247, 0.5); }
        .lang-switch:hover { background: #a855f7; color: #fff; }
        @media (max-width: 768px) { .nav-container { flex-direction: column; gap: 15px; padding: 20px !important; } }
      `}</style>

      {/* --- HLAVNÍ GLOBÁLNÍ NAVIGACE --- */}
      <nav className="nav-container" style={{ padding: '20px 40px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', position: 'sticky', top: 0, zIndex: 1000 }}>
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

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            {t.title1} <span style={{ color: '#a855f7' }}>{t.title2}</span>
          </h1>
          <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>{t.subtitle}</p>
        </div>

        {/* --- VYHLEDÁVÁNÍ --- */}
        <div style={{ maxWidth: '400px', margin: '-30px auto 40px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(17, 19, 24, 0.95)', border: '1px solid #66fcf1', borderRadius: '12px', padding: '10px 15px' }}>
            <Search size={18} color="#66fcf1" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {pojmy?.map((pojem) => {
            const displayTitle = isEn && pojem.title_en ? pojem.title_en : pojem.title;
            const displayDesc = isEn && pojem.description_en ? pojem.description_en : pojem.description;
            const displaySlug = isEn && pojem.slug_en ? pojem.slug_en : pojem.slug;
            
            return (
              <Link key={pojem.id} href={`${baseUrl}/slovnik/${displaySlug}`} className="term-card">
                <h2 style={{ color: '#a855f7', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900' }}>{displayTitle}</h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0', flexGrow: 1 }}>
                  {displayDesc && displayDesc.substring(0, 140)}...
                </p>
                <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {t.detailBtn} <ChevronRight size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  );
}
