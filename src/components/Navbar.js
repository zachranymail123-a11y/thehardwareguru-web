"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Heart, Loader2, X, ShieldCheck, Share2, Menu } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import GTranslateWidget from './GTranslateWidget';

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
        if (active) { setSuggestions(results.flat().slice(0, 10)); }
      } catch (err) { console.error(err); } finally { if (active) { setIsLoading(false); setShowSuggestions(true); } }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `${langPrefix}/hledat?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
          background: #0a0b0d; border-bottom: 1px solid #1f2937; 
          padding: 0 20px; display: flex; align-items: center; 
          justify-content: space-between; color: #fff; height: 90px;
        }
        .nav-left { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; flex-shrink: 0; }
        .nav-center { flex: 1; display: flex; justify-content: center; padding: 0 20px; }
        .nav-right { display: flex; align-items: center; gap: 15px; flex-shrink: 0; }
        
        @media (max-width: 1200px) {
            .nav-links-desktop { display: none !important; }
        }
        @media (max-width: 768px) {
            .guru-navbar { height: auto; padding: 15px; flex-wrap: wrap; }
            .nav-center { order: 3; width: 100%; padding: 10px 0 0; }
            .nav-right { gap: 8px; }
        }
      `}} />

      <nav className="guru-navbar">
        <div className="nav-left">
          <a href={isEn ? "/en" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={26} color="#a855f7" />
            <span style={{ 
              background: 'linear-gradient(90deg, #66fcf1 0%, #a855f7 100%)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
              fontSize: '22px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic'
            }}>
              HARDWARE GURU
            </span>
          </a>
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
            <GTranslateWidget />
          </div>
        </div>

        <div className="nav-center" ref={suggestionRef}>
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
            <input 
              type="text" placeholder={isEn ? "Search..." : "Hledat..."} 
              value={query} onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 40px', borderRadius: '10px', background: '#111', border: '1px solid #333', color: '#fff', outline: 'none' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          </form>
        </div>

        <div className="nav-right">
          <div className="nav-links-desktop" style={{ display: 'flex', gap: '12px' }}>
            <a href={isEn ? "/en/clanky" : "/clanky"} style={linkStyle}>{isEn ? 'ARTICLES' : 'ČLÁNKY'}</a>
            <a href={isEn ? "/en/tweaky" : "/tweaky"} style={{...linkStyle, color: '#eab308'}}>TWEAKY</a>
            <a href={isEn ? "/en/deals" : "/cs/deals"} style={{...linkStyle, color: '#f97316'}}>SLEVY</a>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <a href="https://kick.com/TheHardwareGuru" target="_blank" style={btnStyle}>KICK</a>
            <a href={isEn ? "/en/support" : "/support"} style={{...btnStyle, border: '1px solid #eab308', color: '#eab308'}}>VIP</a>
          </div>
        </div>
      </nav>
    </>
  );
}

const linkStyle = { color: '#d1d5db', textDecoration: 'none', fontSize: '11px', fontWeight: '900' };
const btnStyle = { padding: '6px 10px', borderRadius: '5px', textDecoration: 'none', fontWeight: '900', fontSize: '10px', background: '#111', color: '#fff' };
