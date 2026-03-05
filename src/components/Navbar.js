"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Home, Wrench, HeartPulse, Heart, Lightbulb, BookOpen, Newspaper, Loader2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// GURU ENGINE: Inicializace Supabase pro inteligentní našeptávač
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const suggestionRef = useRef(null);

  // GURU PRAVIDLO: Detekce jazyka pro CZ/EN variantu
  const isEn = pathname.startsWith('/en');
  const lang = isEn ? 'en' : 'cs';

  // INTELIGENTNÍ NAŠEPTÁVAČ LOGIKA
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Hledáme až od 2 znaků, abychom nezatěžovali DB nesmysly
      if (query.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const searchTerm = `%${query}%`;

      // BRUTAL SEARCH: Prohledáváme název, SEO popis i klíčová slova najednou
      const { data, error } = await supabase
        .from('tweaky')
        .select('title, slug, seo_description')
        .or(`title.ilike.${searchTerm},seo_description.ilike.${searchTerm},seo_keywords.ilike.${searchTerm}`)
        .limit(6);

      if (error) {
        console.error("Guru Search Error:", error);
      }

      setSuggestions(data || []);
      setIsLoading(false);
      setShowSuggestions(true);
    };

    // Debounce: Počkáme 300ms po dopsání, než pošleme dotaz
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Schování našeptávače při kliku mimo vyhledávací pole
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const searchPath = isEn ? `/en/hledat?q=${encodeURIComponent(query)}` : `/hledat?q=${encodeURIComponent(query)}`;
      router.push(searchPath);
      setQuery('');
      setShowSuggestions(false);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0a0b0d', borderBottom: '1px solid #1f2937', 
      padding: '12px 30px', display: 'flex', alignItems: 'center', 
      justifyContent: 'space-between', color: '#fff'
    }}>
      
      {/* 1. LOGO VLEVO */}
      <Link href={isEn ? "/en" : "/"} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ color: '#a855f7', fontFamily: 'serif', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
          HARDWARE GURU
        </span>
      </Link>

      {/* 2. INTELIGENTNÍ VYHLEDÁVÁNÍ S NAŠEPTÁVAČEM (UPROSTŘED) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', margin: '0 20px', position: 'relative' }} ref={suggestionRef}>
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder={isEn ? "Search Guru tweaks & hardware..." : "Hledat Guru tweaky a hardware..."} 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            style={{ width: '100%', padding: '10px 45px 10px 40px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: '#fff', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          
          <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" style={{ color: '#eab308' }} />
            ) : query && (
              <X size={16} style={{ cursor: 'pointer', color: '#666' }} onClick={() => setQuery('')} />
            )}
          </div>
        </form>

        {/* DROPDOWN NAŠEPTÁVAČE (GLASSMORPHISM STYLE) */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div style={{ 
            position: 'absolute', top: '52px', width: '100%', maxWidth: '450px', 
            background: 'rgba(13, 14, 16, 0.98)', backdropFilter: 'blur(10px)',
            border: '1px solid #eab308', borderRadius: '8px', 
            overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' 
          }}>
            {isLoading ? (
              <div style={{ padding: '15px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                {isEn ? 'Searching Guru database...' : 'Prohledávám Guru databázi...'}
              </div>
            ) : (
              suggestions.map((s, i) => (
                <div key={i} 
                  onClick={() => { 
                    const target = isEn ? `/en/tweaky/${s.slug}` : `/tweaky/${s.slug}`;
                    router.push(target); 
                    setQuery(''); 
                    setShowSuggestions(false); 
                  }}
                  style={{ padding: '12px 15px', borderBottom: i !== suggestions.length - 1 ? '1px solid #222' : 'none', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 'bold', color: '#eab308', marginBottom: '2px' }}>{s.title}</div>
                  <div style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.seo_description}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. MENU A SÍTĚ VPRAVO */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexShrink: 0 }}>
        {/* TEXTOVÉ ODKAZY */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link href={isEn ? "/en" : "/"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Home size={14}/> {isEn ? 'HOME' : 'DOMŮ'}
          </Link>
          <Link href={isEn ? "/en/clanky" : "/clanky"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Newspaper size={14}/> {isEn ? 'ARTICLES' : 'ČLÁNKY'}
          </Link>
          <Link href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Lightbulb size={14}/> {isEn ? 'TIPS' : 'TIPY'}
          </Link>
          <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={{ color: '#eab308', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Wrench size={14}/> {isEn ? 'GURU TWEAKS' : 'GURU TWEAKY'}
          </Link>
          <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BookOpen size={14}/> {isEn ? 'GLOSSARY' : 'SLOVNÍK'}
          </Link>
          <Link href={isEn ? "/en/rady" : "/rady"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <HeartPulse size={14}/> {isEn ? 'GUIDES' : 'PRAKTICKÉ RADY'}
          </Link>
        </div>

        {/* BAREVNÁ TLAČÍTKA */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noreferrer" style={{ background: '#53fc18', color: '#000', padding: '6px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>KICK</a>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{ background: '#ff0000', color: '#fff', padding: '6px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>YOUTUBE</a>
          
          {/* INSTAGRAM NATVRDO MEZI YOUTUBE A DISCORD */}
          <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" rel="noreferrer" style={{ background: '#E1306C', color: '#fff', padding: '6px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>INSTAGRAM</a>
          
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{ background: '#5865F2', color: '#fff', padding: '6px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>DISCORD</a>
          
          {/* GURU FIX: PODPORA ODKAZUJE NA SPRÁVNOU URL /support */}
          <Link href={isEn ? "/en/support" : "/support"} style={{ background: '#000', border: '1px solid #eab308', color: '#eab308', padding: '6px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Heart size={12} fill="#eab308" /> {isEn ? 'SUPPORT' : 'PODPORA'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
