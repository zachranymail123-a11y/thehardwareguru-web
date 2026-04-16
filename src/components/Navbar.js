"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Heart, Loader2, X, ShieldCheck, Share2, Menu } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import GTranslateWidget from './GTranslateWidget';

// GURU ENGINE: Inicializace Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const pathname = usePathname() || ''; 
  const suggestionRef = useRef(null);

  const isEn = pathname.startsWith('/en');
  const langPrefix = isEn ? '/en' : '';

  const routeMap = {
    'posts': 'clanky', 'clanky': 'clanky', 'tipy': 'tipy',
    'tweaky': 'tweaky', 'slovnik': 'slovnik', 'rady': 'rady'
  };

  const sectionNames = {
    'posts': isEn ? 'ARTICLE' : 'ČLÁNEK', 'clanky': isEn ? 'ARTICLE' : 'ČLÁNEK',
    'tipy': isEn ? 'TIP' : 'TIP', 'tweaky': isEn ? 'TWEAK' : 'TWEAK',
    'slovnik': isEn ? 'GLOSSARY' : 'SLOVNÍK', 'rady': isEn ? 'GUIDE' : 'RADA'
  };

  useEffect(() => {
    let active = true;
    const fetchSuggestions = async () => {
      const q = query.trim();
      if (q.length < 2) { setSuggestions([]); return; }
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
          setSuggestions(results.flat().slice(0, 10));
        }
      } catch (err) {
        console.error("Guru Search Error:", err);
      } finally {
        if (active) { setIsLoading(false); setShowSuggestions(true); }
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

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
      window.location.href = `${langPrefix}/hledat?q=${encodeURIComponent(query.trim())}`;
      setShowSuggestions(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    const shareUrl = window.location.origin + langPrefix;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'The Hardware Guru', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) { console.error("Guru Share Error:", err); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-navbar {
          position: fixed; top: 0; left: 0; right: 0; zIndex: 9999;
          background: #0a0b0d; border-bottom: 1px solid #1f2937; 
          padding: 0 20px; display: flex; align-items: center; 
          justify-content: space-between; color: #fff; height: 90px;
          gap: 20px;
        }
        
        .guru-search-container { flex: 1; max-width: 500px; display: flex; justify-content: center; position: relative; }
        
        .guru-desktop-links { display: flex; gap: 15px; align-items: center; }
        .guru-social-buttons { display: flex; gap: 8px; align-items: center; }
        
        /* 🔥 RESPONZIVITA - Záchrana před prasknutím 🔥 */
        @media (max-width: 1400px) {
          .guru-navbar { padding: 0 15px; gap: 10px; }
          .guru-desktop-links a { font-size: 10px !important; }
        }
        
        @media (max-width: 1150px) {
          .guru-desktop-links { display: none !important; } /* Skryje textové odkazy na menším monitoru */
        }
        
        @media (max-width: 850px) {
          .guru-social-buttons a { display: none !important; } /* Skryje Kick/YT/Discord na mobilu */
          .guru-search-container { max-width: 250px; }
        }
      `}} />

      <nav className="guru-navbar">
        {/* 1. LOGO */}
        <a href={isEn ? "/en" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ShieldCheck size={26} color="#a855f7" />
          <span style={{ 
            background: 'linear-gradient(90deg, #66fcf1 0%, #a855f7 100%)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
            fontFamily: 'sans-serif', fontSize: 'clamp(18px, 2vw, 26px)', 
            fontWeight: '950', letterSpacing: '1px', textTransform: 'uppercase',
            fontStyle: 'italic', filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.3))'
          }}>
            HARDWARE GURU
          </span>
        </a>

        {/* 2. HLEDÁNÍ */}
        <div className="guru-search-container" ref={suggestionRef}>
          <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative' }}>
            <input 
              type="text" 
              placeholder={isEn ? "Search..." : "Hledat..."} 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              style={{ 
                width: '100%', padding: '12px 35px', borderRadius: '12px', 
                background: '#111', border: '1px solid #333', color: '#fff', 
                outline: 'none', fontSize: '14px'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            {isLoading && <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#eab308' }} />}
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div style={{ 
              position: 'absolute', top: '65px', width: '100%', background: '#0d0e12', 
              border: '1px solid #eab308', borderRadius: '12px', overflow: 'hidden', 
              boxShadow: '0 15px 50px rgba(0,0,0,0.8)', zIndex: 10000 
            }}>
              {suggestions.map((s, i) => (
                <a key={i} href={`${langPrefix}/${routeMap[s.section] || s.section}/${(isEn && s.slug_en) ? s.slug_en : s.slug}`} 
                   onClick={() => setShowSuggestions(false)} 
                   style={{ display: 'block', padding: '12px 15px', textDecoration: 'none', borderBottom: '1px solid #1a1a1a', transition: '0.2s' }}
                   onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px' }}>{isEn ? (s.title_en || s.title) : s.title}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 3. MENU A TLAČÍTKA (Pravá strana) */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexShrink: 0 }}>
          
          <div className="guru-desktop-links">
            <a href={isEn ? "/en/clanky" : "/clanky"} style={navLinkStyle}>{isEn ? 'ARTICLES' : 'ČLÁNKY'}</a>
            <a href={isEn ? "/en/tipy" : "/tipy"} style={navLinkStyle}>{isEn ? 'TIPS' : 'TIPY'}</a>
            <a href={isEn ? "/en/tweaky" : "/tweaky"} style={{...navLinkStyle, color: '#eab308'}}>{isEn ? 'GURU TWEAKS' : 'GURU TWEAKY'}</a>
            <a href={isEn ? "/en/slovnik" : "/slovnik"} style={navLinkStyle}>{isEn ? 'GLOSSARY' : 'SLOVNÍK'}</a>
            <a href={isEn ? "/en/rady" : "/rady"} style={navLinkStyle}>{isEn ? 'GUIDES' : 'RADY'}</a>
            <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{...navLinkStyle, color: '#ff0055'}}>{isEn ? 'GPU DUELS' : 'GPU DUELY'}</a>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{...navLinkStyle, color: '#66fcf1'}}>{isEn ? 'CPU DUELS' : 'CPU DUELY'}</a>
            <a href={isEn ? "/en/deals" : "/cs/deals"} style={{...navLinkStyle, color: '#f97316'}}>{isEn ? '🔥 DEALS' : '🔥 SLEVY'}</a>
          </div>

          <div className="guru-social-buttons">
            <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noreferrer" style={{...socialBtn, background: '#53fc18', color: '#000'}}>KICK</a>
            <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{...socialBtn, background: '#f00', color: '#fff'}}>YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{...socialBtn, background: '#5865F2', color: '#fff'}}>DISCORD</a>
            
            <button onClick={handleShare} style={{...socialBtn, border: '1px solid rgba(102, 252, 241, 0.4)', color: '#66fcf1', background: 'rgba(102, 252, 241, 0.05)', display: 'flex', gap: '5px', cursor: 'pointer'}}>
              <Share2 size={12} /> <span className="hide-on-mobile">{isCopied ? 'COPIED!' : 'SDÍLET'}</span>
            </button>

            <a href={isEn ? "/en/support" : "/support"} style={{...socialBtn, border: '2px solid #eab308', color: '#eab308', background: 'transparent', display: 'flex', gap: '5px'}}>
              <Heart size={12} fill="#eab308" /> <span className="hide-on-mobile">VIP</span>
            </a>
            
            {/* 🔥 PŘEKLADAČ JE ÚPLNĚ VPRAVO 🔥 */}
            <div style={{ transform: 'scale(0.9)', transformOrigin: 'right center' }}>
              <GTranslateWidget />
            </div>
          </div>

        </div>
      </nav>
    </>
  );
}

const navLinkStyle = { color: '#d1d5db', textDecoration: 'none', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px', whiteSpace: 'nowrap' };
const socialBtn = { padding: '8px 10px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '10px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' };
