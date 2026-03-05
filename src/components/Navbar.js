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

  // Překlad sekcí pro štítky v našeptávači
  const sectionNames = {
    'clanky': isEn ? 'ARTICLE' : 'ČLÁNEK',
    'tipy': isEn ? 'TIP' : 'TIP',
    'tweaky': isEn ? 'TWEAK' : 'TWEAK',
    'slovnik': isEn ? 'GLOSSARY' : 'SLOVNÍK',
    'rady': isEn ? 'GUIDE' : 'RADA'
  };

  // 🚀 GURU FIX: CROSS-TABLE NAŠEPTÁVAČ (PROHLEDÁVÁ VŠECH 7 SLOUPCŮ DLE DB EXPORTU)
  useEffect(() => {
    let active = true;

    const fetchSuggestions = async () => {
      const q = query.trim().replace(/[,]/g, ''); // Odstraníme čárky, které rozbíjejí PostgREST
      if (q.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Uvozovky kolem %q% jsou KRITICKÉ, pokud hledaný výraz obsahuje mezeru (zabrání Erroru 400)
        const searchTerm = `"%${q}%"`; 
        
        // Seznam všech textových sloupců potvrzených v tvé databázi
        const orAllColumns = `title.ilike.${searchTerm},content.ilike.${searchTerm},seo_description.ilike.${searchTerm},seo_keywords.ilike.${searchTerm},description_en.ilike.${searchTerm},content_en.ilike.${searchTerm},meta_title.ilike.${searchTerm}`;
        
        // Záchranný dotaz: pro tabulky, kterým novější sloupce chybí (aby nespadly)
        const orFallbackColumns = `title.ilike.${searchTerm},content.ilike.${searchTerm}`;

        const sections = ['clanky', 'tipy', 'tweaky', 'slovnik', 'rady'];

        const searchPromises = sections.map(async (section) => {
          try {
            // 1. Zkusíme prohledat VŠECHNY sloupce
            const { data, error } = await supabase.from(section).select('*').or(orAllColumns).limit(4);
            if (error) throw error; // Pokud chybí sloupec, jdeme do catch
            return (data || []).map(item => ({ ...item, section }));
          } catch (e) {
            // 2. FALLBACK: Tabulka nemá nějaký SEO sloupec, tak prohledáme jen základy (title a content)
            try {
              const { data, error: err2 } = await supabase.from(section).select('*').or(orFallbackColumns).limit(4);
              if (!err2) return (data || []).map(item => ({ ...item, section }));
            } catch (fallbackError) {
              // 3. POSLEDNÍ ZÁCHRANA: Bezpečné hledání jen v titulku (nepoužívá .or)
              try {
                const { data } = await supabase.from(section).select('*').ilike('title', `%${q}%`).limit(4);
                return (data || []).map(item => ({ ...item, section }));
              } catch (e3) {
                return [];
              }
            }
            return [];
          }
        });

        const resultsArrays = await Promise.all(searchPromises);
        const allResults = resultsArrays.flat();

        if (active) {
          // Odstranění duplicit a omezení na max 6 výsledků v našeptávači
          const uniqueResults = Array.from(new Map(allResults.map(item => [item.section + item.slug, item])).values()).slice(0, 6);
          setSuggestions(uniqueResults);
        }

      } catch (err) {
        console.error("Guru Search Exception:", err);
      } finally {
        if (active) {
          setIsLoading(false);
          setShowSuggestions(true);
        }
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 350);
    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
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
    const q = query.trim();
    if (q) {
      const searchPath = isEn ? `/en/hledat?q=${encodeURIComponent(q)}` : `/hledat?q=${encodeURIComponent(q)}`;
      router.push(searchPath);
      setShowSuggestions(false);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0a0b0d', borderBottom: '1px solid #1f2937', 
      padding: '0 40px', display: 'flex', alignItems: 'center', 
      justifyContent: 'space-between', color: '#fff', height: '90px' // GURU GOLDEN HEIGHT: 90px
    }}>
      
      {/* 1. LOGO VLEVO */}
      <Link href={isEn ? "/en" : "/"} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ 
          color: '#a855f7', 
          fontFamily: 'serif', 
          fontSize: '28px', // GURU GOLDEN LOGO: 28px
          fontWeight: '900', 
          letterSpacing: '1px', 
          textTransform: 'uppercase' 
        }}>
          HARDWARE GURU
        </span>
      </Link>

      {/* 2. VYHLEDÁVÁNÍ S NAŠEPTÁVAČEM (UPROSTŘED) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', margin: '0 30px', position: 'relative' }} ref={suggestionRef}>
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '550px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder={isEn ? "Search Guru hacks..." : "Hledat v Guru databázi..."} 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            style={{ 
              width: '100%', padding: '14px 55px 14px 50px', borderRadius: '12px', 
              background: '#111', border: '1px solid #333', color: '#fff', 
              outline: 'none', fontSize: '16px', transition: 'border-color 0.2s' 
            }}
          />
          <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          
          <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" style={{ color: '#eab308' }} />
            ) : query && (
              <X size={20} style={{ cursor: 'pointer', color: '#666' }} onClick={() => setQuery('')} />
            )}
          </div>
        </form>

        {/* DROPDOWN NAŠEPTÁVAČE S KATEGORIEMI */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div style={{ 
            position: 'absolute', top: '70px', width: '100%', maxWidth: '550px', 
            background: 'rgba(13, 14, 16, 0.98)', backdropFilter: 'blur(12px)',
            border: '1px solid #eab308', borderRadius: '12px', 
            overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', zIndex: 10000
          }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#eab308', fontWeight: 'bold' }}>
                {isEn ? 'SEARCHING...' : 'GURU HLEDÁ...'}
              </div>
            ) : (
              suggestions.map((s, i) => {
                // 🚀 GURU FIX: Zobrazí větu, kde se našlo hledané slovo (i když to bylo v Content, SEO, atd.)
                let desc = isEn && s.description_en ? s.description_en : s.seo_description;
                const safeQ = query.trim().toLowerCase();
                
                // Pole všech textů k prohledání pro zobrazení kontextu
                const textFields = [s.content, s.content_en, s.seo_keywords, s.seo_description, s.description_en];
                let foundSnippet = false;

                for (const field of textFields) {
                  if (field && typeof field === 'string') {
                    const plainText = field.replace(/<[^>]+>/g, ''); // Vyčistíme HTML
                    const matchIndex = plainText.toLowerCase().indexOf(safeQ);
                    
                    if (matchIndex !== -1) {
                      // Hledané slovo nalezeno, vyřízneme větu okolo něj!
                      const start = Math.max(0, matchIndex - 30);
                      const end = Math.min(plainText.length, matchIndex + 60);
                      desc = (start > 0 ? '...' : '') + plainText.substring(start, end) + '...';
                      foundSnippet = true;
                      break; // Našli jsme to, konec prohledávání
                    }
                  }
                }

                // Pokud hledané slovo bylo jen v title, ukážeme začátek contentu jako fallback
                if (!foundSnippet && !desc && s.content) {
                  desc = s.content.replace(/<[^>]+>/g, '').substring(0, 60) + '...';
                }

                return (
                  <div key={i} 
                    onClick={() => { 
                      const target = isEn ? `/en/${s.section}/${s.slug}` : `/${s.section}/${s.slug}`;
                      router.push(target); 
                      setQuery(''); 
                      setShowSuggestions(false); 
                    }}
                    style={{ 
                      padding: '16px 20px', borderBottom: i !== suggestions.length - 1 ? '1px solid #222' : 'none', 
                      cursor: 'pointer', transition: 'background 0.2s' 
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontWeight: '900', color: '#eab308', fontSize: '15px' }}>{s.title}</div>
                      <div style={{ 
                        fontSize: '10px', color: '#fff', background: '#a855f7', 
                        padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px', fontWeight: 'bold' 
                      }}>
                        {sectionNames[s.section] || 'LINK'}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {desc}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3. MENU A SÍTĚ VPRAVO */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexShrink: 0 }}>
        {/* TEXTOVÉ ODKAZY - PLNÉ NÁZVY A VĚTŠÍ PÍSMO */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href={isEn ? "/en/clanky" : "/clanky"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'ARTICLES' : 'ČLÁNKY'}
          </Link>
          <Link href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'TIPS' : 'TIPY'}
          </Link>
          <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={{ color: '#eab308', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'GURU TWEAKS' : 'GURU TWEAKY'}
          </Link>
          <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'GLOSSARY' : 'SLOVNÍK'}
          </Link>
          {/* GURU GOLDEN MENU: PRAKTICKÉ RADY */}
          <Link href={isEn ? "/en/rady" : "/rady"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'PRACTICAL GUIDES' : 'PRAKTICKÉ RADY'}
          </Link>
        </div>

        {/* BAREVNÁ TLAČÍTKA - ŽÁDNÉ ZKRATKY */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noreferrer" style={{ background: '#53fc18', color: '#000', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>
            KICK
          </a>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{ background: '#f00', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>
            YOUTUBE
          </a>
          
          {/* INSTAGRAM MEZI YOUTUBE A DISCORD */}
          <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" rel="noreferrer" style={{ background: '#E1306C', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>
            INSTAGRAM
          </a>
          
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{ background: '#5865F2', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>
            DISCORD
          </a>
          
          {/* GURU FIX: Absolutní link na podporu */}
          <a href="https://www.thehardwareguru.cz/support" style={{ background: '#000', border: '2px solid #eab308', color: '#eab308', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Heart size={14} fill="#eab308" /> {isEn ? 'SUPPORT' : 'PODPORA'}
          </a>
        </div>
      </div>
    </nav>
  );
}
