"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Heart, Loader2, X, ShieldCheck, Share2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// GURU ENGINE: Inicializace Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // 🚀 GURU: Stav pro tlačítko sdílení
  
  // 🚀 GURU ZÁCHRANNÁ BRZDA: Ochrana proti pádu aplikace na Vercelu
  const pathname = usePathname() || ''; 
  const suggestionRef = useRef(null);

  // GURU JAZYKOVÁ LOGIKA
  const isEn = pathname.startsWith('/en');
  const langPrefix = isEn ? '/en' : '';

  // 🚀 GURU ROUTE MAP
  const routeMap = {
    'posts': 'clanky',
    'clanky': 'clanky',
    'tipy': 'tipy',
    'tweaky': 'tweaky',
    'slovnik': 'slovnik',
    'rady': 'rady'
  };

  const sectionNames = {
    'posts': isEn ? 'ARTICLE' : 'ČLÁNEK',
    'clanky': isEn ? 'ARTICLE' : 'ČLÁNEK',
    'tipy': isEn ? 'TIP' : 'TIP',
    'tweaky': isEn ? 'TWEAK' : 'TWEAK',
    'slovnik': isEn ? 'GLOSSARY' : 'SLOVNÍK',
    'rady': isEn ? 'GUIDE' : 'RADA'
  };

  // UNIVERZÁLNÍ NAŠEPTÁVAČ
  useEffect(() => {
    let active = true;
    const fetchSuggestions = async () => {
      const q = query.trim();
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = `%${q}%`;
        const tables = ['posts', 'tipy', 'tweaky', 'slovnik', 'rady'];
        
        const promises = tables.map(table => 
          supabase.from(table).select('*').or(`title.ilike.${searchTerm},title_en.ilike.${searchTerm}`).limit(5)
            .then(res => (res.data || []).map(item => ({ ...item, section: table })))
        );

        const results = await Promise.all(promises);
        if (active) {
          const flatResults = results.flat().slice(0, 10);
          setSuggestions(flatResults);
        }
      } catch (err) {
        console.error("Guru Search Error:", err);
      } finally {
        if (active) {
          setIsLoading(false);
          setShowSuggestions(true);
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  // Schování našeptávače při kliku ven
  useEffect(() => {
    const clickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // GURU CACHE BYPASS: Natvrdo přesměrujeme přes objekt window
      window.location.href = `${langPrefix}/hledat?q=${encodeURIComponent(query.trim())}`;
      setShowSuggestions(false);
    }
  };

  // 🚀 GURU: Nativní funkce pro sdílení webu
  const handleShare = async (e) => {
    e.preventDefault();
    const shareUrl = window.location.origin + langPrefix;
    const shareData = {
      title: 'The Hardware Guru',
      text: isEn ? 'Hardware Guru - The Ultimate Tech Base' : 'Hardware Guru - Tvá technologická základna',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Guru Share Error:", err);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0a0b0d', borderBottom: '1px solid #1f2937', 
      padding: '0 40px', display: 'flex', alignItems: 'center', 
      justifyContent: 'space-between', color: '#fff', height: '90px'
    }}>
      
      {/* 1. LOGO */}
      <a href={isEn ? "/en" : "/"} style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={28} color="#a855f7" />
        <span style={{ 
          background: 'linear-gradient(90deg, #66fcf1 0%, #a855f7 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          fontFamily: 'sans-serif', 
          fontSize: '26px', 
          fontWeight: '950', 
          letterSpacing: '1px', 
          textTransform: 'uppercase',
          fontStyle: 'italic',
          filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.3))'
        }}>
          HARDWARE GURU
        </span>
      </a>

      {/* 2. HLEDÁNÍ */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', margin: '0 30px', position: 'relative' }} ref={suggestionRef}>
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder={isEn ? "Search Guru hacks..." : "Hledat v Guru databázi..."} 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            style={{ 
              width: '100%', padding: '12px 45px 12px 45px', borderRadius: '12px', 
              background: '#111', border: '1px solid #333', color: '#fff', 
              outline: 'none', fontSize: '15px'
            }}
          />
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          {isLoading && <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#eab308' }} />}
        </form>

        {/* NAŠEPTÁVAČ */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{ 
            position: 'absolute', top: '65px', width: '100%', maxWidth: '500px', 
            background: '#0d0e12', border: '1px solid #eab308', borderRadius: '12px', 
            overflow: 'hidden', boxShadow: '0 15px 50px rgba(0,0,0,0.8)', zIndex: 10000 
          }}>
            {suggestions.map((s, i) => {
              const sectionFolder = routeMap[s.section] || s.section;
              const slug = (isEn && s.slug_en) ? s.slug_en : s.slug;
              const target = `${langPrefix}/${sectionFolder}/${slug}`;

              return (
                <a key={i} href={target} onClick={() => setShowSuggestions(false)} style={{ 
                  display: 'block', padding: '15px 20px', textDecoration: 'none', borderBottom: '1px solid #1a1a1a', transition: '0.2s'
                }} onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#eab308', fontWeight: 'bold' }}>{isEn ? (s.title_en || s.title) : s.title}</div>
                    <div style={{ fontSize: '10px', background: '#a855f7', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>
                      {sectionNames[s.section]}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MENU */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* 🚀 GURU FIX: Tvrdě zakódované absolutní cesty pro maximální stabilitu */}
          <a href={isEn ? "/en/clanky" : "/clanky"} style={navLinkStyle}>{isEn ? 'ARTICLES' : 'ČLÁNKY'}</a>
          <a href={isEn ? "/en/tipy" : "/tipy"} style={navLinkStyle}>{isEn ? 'TIPS' : 'TIPY'}</a>
          <a href={isEn ? "/en/tweaky" : "/tweaky"} style={{...navLinkStyle, color: '#eab308'}}>{isEn ? 'GURU TWEAKS' : 'GURU TWEAKY'}</a>
          <a href={isEn ? "/en/slovnik" : "/slovnik"} style={navLinkStyle}>{isEn ? 'GLOSSARY' : 'SLOVNÍK'}</a>
          <a href={isEn ? "/en/rady" : "/rady"} style={navLinkStyle}>{isEn ? 'GUIDES' : 'RADY'}</a>
          
          <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{...navLinkStyle, color: '#ff0055'}}>{isEn ? 'GPU DUELS' : 'GPU DUELY'}</a>
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{...navLinkStyle, color: '#66fcf1'}}>{isEn ? 'CPU DUELS' : 'CPU DUELY'}</a>
          
          {/* 🔥 NOVÝ ODKAZ NA SLEVY (PLNĚ CZ/EN + MIDDLEWARE FIX) 🔥 */}
          <a href={isEn ? "/en/deals" : "/cs/deals"} style={{...navLinkStyle, color: '#f97316'}}>{isEn ? '🔥 GAME DEALS' : '🔥 SLEVY NA HRY'}</a>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noreferrer" style={{...socialBtn, background: '#53fc18', color: '#000'}}>KICK</a>
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{...socialBtn, background: '#f00', color: '#fff'}}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{...socialBtn, background: '#5865F2', color: '#fff'}}>DISCORD</a>
          
          {/* 🚀 GURU TLAČÍTKO SDÍLET */}
          <button onClick={handleShare} style={{...socialBtn, border: '1px solid rgba(102, 252, 241, 0.4)', color: '#66fcf1', background: 'rgba(102, 252, 241, 0.05)', display: 'flex', gap: '5px', cursor: 'pointer'}}>
            <Share2 size={12} /> {isCopied ? (isEn ? 'COPIED!' : 'ZKOPIROVÁNO!') : (isEn ? 'SHARE' : 'SDÍLET')}
          </button>

          <a href={isEn ? "/en/support" : "/support"} style={{...socialBtn, border: '2px solid #eab308', color: '#eab308', background: 'transparent', display: 'flex', gap: '5px'}}>
            <Heart size={12} fill="#eab308" /> {isEn ? 'SUPPORT' : 'PODPORA'}
          </a>
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle = { color: '#d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px' };
const socialBtn = { padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' };
