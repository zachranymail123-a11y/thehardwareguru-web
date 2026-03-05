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

  // INTELIGENTNÍ NAŠEPTÁVAČ (STRIKTNÍ SYNTAXE BEZ MEZER)
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
        // GURU FIX: PostgREST vyžaduje .or() bez mezer za čárkami.
        const searchTerm = `%${q}%`;
        const orFilter = `title.ilike.${searchTerm},seo_description.ilike.${searchTerm},seo_keywords.ilike.${searchTerm}`;
        
        const { data, error } = await supabase
          .from('tweaky')
          .select('title, slug, seo_description')
          .or(orFilter)
          .limit(6);

        if (active) {
          if (error) {
            console.error("Guru Search Error:", error.message);
            // Fallback na title-only, pokud komplexní dotaz selže
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
        console.error("Exception:", err);
      } finally {
        if (active) {
          setIsLoading(false);
          setShowSuggestions(true);
        }
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 350);
    return () => { active = false; clearTimeout(debounceTimer); };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(isEn ? `/en/hledat?q=${encodeURIComponent(query.trim())}` : `/hledat?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0a0b0d', borderBottom: '1px solid #1f2937', 
      padding: '0 40px', display: 'flex', alignItems: 'center', 
      justifyContent: 'space-between', color: '#fff', height: '90px'
    }}>
      
      <Link href={isEn ? "/en" : "/"} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ color: '#a855f7', fontFamily: 'serif', fontSize: '28px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
          HARDWARE GURU
        </span>
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', margin: '0 30px', position: 'relative' }} ref={suggestionRef}>
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '550px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder={isEn ? "Search Guru tweaks..." : "Hledat v Guru databázi..."} 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            style={{ 
              width: '100%', padding: '14px 55px 14px 50px', borderRadius: '12px', 
              background: '#111', border: '1px solid #333', color: '#fff', outline: 'none', fontSize: '16px'
            }}
          />
          <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)' }}>
            {isLoading ? <Loader2 size={20} className="animate-spin" style={{ color: '#eab308' }} /> : query && <X size={20} style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />}
          </div>
        </form>

        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div style={{ 
            position: 'absolute', top: '70px', width: '100%', maxWidth: '550px', 
            background: 'rgba(13, 14, 16, 0.98)', border: '1px solid #eab308', borderRadius: '12px', 
            overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', zIndex: 10000
          }}>
            {isLoading ? <div style={{ padding: '20px', textAlign: 'center', color: '#eab308' }}>GURU HLEDÁ...</div> :
              suggestions.map((s, i) => (
                <div key={i} onClick={() => { router.push(isEn ? `/en/tweaky/${s.slug}` : `/tweaky/${s.slug}`); setQuery(''); setShowSuggestions(false); }}
                  style={{ padding: '18px 25px', borderBottom: '1px solid #222', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: '900', color: '#eab308', fontSize: '15px' }}>{s.title}</div>
                  <div style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.seo_description}</div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href={isEn ? "/en/clanky" : "/clanky"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? 'ARTICLES' : 'ČLÁNKY'}</Link>
          <Link href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? 'TIPS' : 'TIPY'}</Link>
          <Link href={isEn ? "/en/tweaky" : "/tweaky"} style={{ color: '#eab308', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? 'GURU TWEAKS' : 'GURU TWEAKY'}</Link>
          <Link href={isEn ? "/en/slovnik" : "/slovnik"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? 'GLOSSARY' : 'SLOVNÍK'}</Link>
          <Link href={isEn ? "/en/rady" : "/rady"} style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? 'PRACTICAL GUIDES' : 'PRAKTICKÉ RADY'}</Link>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" style={{ background: '#53fc18', color: '#000', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>KICK</a>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{ background: '#f00', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>YOUTUBE</a>
          <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" rel="noreferrer" style={{ background: '#E1306C', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>INSTAGRAM</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{ background: '#5865F2', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>DISCORD</a>
          <a href="https://www.thehardwareguru.cz/support" style={{ background: '#000', border: '2px solid #eab308', color: '#eab308', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Heart size={14} fill="#eab308" /> {isEn ? 'SUPPORT' : 'PODPORA'}
          </a>
        </div>
      </div>
    </nav>
  );
}
