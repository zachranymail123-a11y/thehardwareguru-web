"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Home, Wrench, HeartPulse, Heart, Lightbulb, BookOpen, Newspaper, Loader2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// GURU ENGINE: Inicializace Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const suggestionRef = useRef(null);

  const isEn = pathname.startsWith('/en');
  const lang = isEn ? 'en' : 'cs';

  // INTELIGENTNÍ NAŠEPTÁVAČ S FIXEM CHYBY 400 (POSTGREST SYNTAX)
  useEffect(() => {
    let active = true;

    const fetchSuggestions = async () => {
      const q = query.trim();
      if (q.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // GURU FIX: Pro PostgREST dotazy je nejbezpečnější nepoužívat uvozovky uvnitř řetězce,
        // pokud hodnota neobsahuje speciální operátory. Mezery v dotazu ošetříme vsearchTerm.
        const searchTerm = `%${q}%`;
        
        // Prohledáváme sloupce: title, seo_description, seo_keywords
        const { data, error } = await supabase
          .from('tweaky')
          .select('title, slug, seo_description')
          .or(`title.ilike.${searchTerm},seo_description.ilike.${searchTerm},seo_keywords.ilike.${searchTerm}`)
          .limit(6);

        if (active) {
          if (error) {
            console.error("GURU DB Error 400 Fix:", error.message);
            // Fallback na čistý title search v případě potíží s .or
            const { data: fallback } = await supabase
              .from('tweaky')
              .select('title, slug, seo_description')
              .ilike('title', searchTerm)
              .limit(6);
            setSuggestions(fallback || []);
          } else {
            setSuggestions(data || []);
          }
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
      router.push(isEn ? `/en/hledat?q=${encodeURIComponent(q)}` : `/hledat?q=${encodeURIComponent(q)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0a0b0d', borderBottom: '1px solid #1f2937', 
      padding: '15px 40px', display: 'flex', alignItems: 'center', 
      justifyContent: 'space-between', color: '#fff', minHeight: '80px'
    }}>
      
      {/* 1. LOGO */}
      <Link href={isEn ? "/en" : "/"} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ color: '#a855f7', fontFamily: 'serif', fontSize: '26px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
          HARDWARE GURU
        </span>
      </Link>

      {/* 2. VYHLEDÁVÁNÍ (UPROSTŘED) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', margin: '0 30px', position: 'relative' }} ref={suggestionRef}>
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder={isEn ? "Search Guru database..." : "Hledat v Guru archivu..."} 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            style={{ 
              width: '100%', padding: '12px 50px 12px 45px', borderRadius: '10px', 
              background: '#111', border: '1px solid #333', color: '#fff', 
              outline: 'none', fontSize: '15px', transition: 'border-color 0.2s'
            }}
            onFocusCapture={(e) => e.target.style.borderColor = '#eab308'}
            onBlurCapture={(e) => e.target.style.borderColor = '#333'}
          />
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          
          <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}>
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: '#eab308' }} />
            ) : query && (
              <X size={18} style={{ cursor: 'pointer', color: '#666' }} onClick={() => setQuery('')} />
            )}
          </div>
        </form>

        {/* NAŠEPTÁVAČ DROPDOWN */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div style={{ 
            position: 'absolute', top: '60px', width: '100%', maxWidth: '500px', 
            background: 'rgba(13, 14, 16, 0.98)', backdropFilter: 'blur(12px)',
            border: '1px solid #eab308', borderRadius: '10px', 
            overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', zIndex: 10000
          }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#eab308', fontWeight: 'bold' }}>GURU HLEDÁ...</div>
            ) : (
              suggestions.map((s, i) => (
                <div key={i} onClick={() => { router.push(isEn ? `/en/tweaky/${s.slug}` : `/tweaky/${s.slug}`); setQuery(''); setShowSuggestions(false); }}
                  style={{ padding: '15px 20px', borderBottom: i !== suggestions.length - 1 ? '1px solid #222' : 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: '900', color: '#eab308', fontSize: '14px', marginBottom: '4px' }}>{s.title}</div>
                  <div style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.seo_description}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. MENU A SÍTĚ (VPRAVO) */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center', flexShrink: 0 }}>
        {/* TEXTOVÉ ODKAZY */}
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <Link href={isEn ? "/en/clanky" : "/clanky"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ČLÁNKY</Link>
          <Link href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIPY</Link>
          <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={{ color: '#eab308', textDecoration: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TWEAKY</Link>
          <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SLOVNÍK</Link>
          <Link href={isEn ? "/en/rady" : "/rady"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RADY</Link>
        </div>

        {/* BAREVNÁ TLAČÍTKA */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noreferrer" style={{ background: '#53fc18', color: '#000', padding: '7px 12px', borderRadius: '5px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>KICK</a>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{ background: '#f00', color: '#fff', padding: '7px 12px', borderRadius: '5px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>YT</a>
          
          {/* GURU FIX: INSTAGRAM PŘESNĚ MEZI YT A DC */}
          <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" rel="noreferrer" style={{ background: '#E1306C', color: '#fff', padding: '7px 12px', borderRadius: '5px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>IG</a>
          
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{ background: '#5865F2', color: '#fff', padding: '7px 12px', borderRadius: '5px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>DC</a>
          
          <a href="https://www.thehardwareguru.cz/support" style={{ background: '#000', border: '2px solid #eab308', color: '#eab308', padding: '7px 12px', borderRadius: '5px', textDecoration: 'none', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Heart size={12} fill="#eab308" /> PODPORA
          </a>
        </div>
      </div>
    </nav>
  );
}
