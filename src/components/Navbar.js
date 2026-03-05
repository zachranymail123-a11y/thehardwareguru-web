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
  
  // 🚀 GURU AUTO-DISCOVERY: Zde ukládáme živou strukturu celé databáze
  const [dbStructure, setDbStructure] = useState([
    // Fallback struktura pro první milisekundy, než se načte aktuální mapa DB
    { table: 'clanky', columns: ['title', 'content', 'seo_description', 'seo_keywords', 'description_en', 'content_en', 'meta_title'] },
    { table: 'tipy', columns: ['title', 'content', 'seo_description', 'seo_keywords', 'description_en', 'content_en', 'meta_title'] },
    { table: 'tweaky', columns: ['title', 'content', 'seo_description', 'seo_keywords', 'description_en', 'content_en', 'meta_title'] },
    { table: 'slovnik', columns: ['title', 'content', 'seo_description', 'seo_keywords', 'description_en', 'content_en', 'meta_title'] },
    { table: 'rady', columns: ['title', 'content', 'seo_description', 'seo_keywords', 'description_en', 'content_en', 'meta_title'] }
  ]);

  const router = useRouter();
  const pathname = usePathname();
  const suggestionRef = useRef(null);

  // GURU PRAVIDLO: Detekce jazyka pro CZ/EN variantu
  const isEn = pathname.startsWith('/en');
  const lang = isEn ? 'en' : 'cs';

  // Překlad známých sekcí pro štítky v našeptávači (Nové sekce dostanou automaticky svůj název)
  const sectionNames = {
    'clanky': isEn ? 'ARTICLE' : 'ČLÁNEK',
    'tipy': isEn ? 'TIP' : 'TIP',
    'tweaky': isEn ? 'TWEAK' : 'TWEAK',
    'slovnik': isEn ? 'GLOSSARY' : 'SLOVNÍK',
    'rady': isEn ? 'GUIDE' : 'RADA'
  };

  // 🚀 GURU FÁZE 1: ZMAPOVÁNÍ DATABÁZE PŘI NAČTENÍ (UNIVERSAL ENGINE)
  useEffect(() => {
    async function discoverDatabase() {
      try {
        // Dotaz přímo na kořen Supabase API, který vrací živou mapu (OpenAPI) všech tabulek a sloupců
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
        });
        
        if (!res.ok) return;
        
        const spec = await res.json();
        const schemas = spec.definitions || (spec.components && spec.components.schemas) || {};
        const dynamicStructure = [];

        // Projdeme VŠECHNY tabulky, které nám databáze nahlásí
        for (const [tableName, schema] of Object.entries(schemas)) {
          const textCols = [];
          // V každé tabulce najdeme VŠECHNY sloupce, které obsahují text
          for (const [colName, colInfo] of Object.entries(schema.properties || {})) {
            // GURU FIX: Ignorujeme sloupce, které mají v názvu slovo "plan" (např. plan_id, plan_name)
            if (colInfo.type === 'string' && !colName.toLowerCase().includes('plan')) {
              textCols.push(colName);
            }
          }
          // Pokud tabulka má textové sloupce, přidáme ji do hledání
          if (textCols.length > 0) {
            dynamicStructure.push({ table: tableName, columns: textCols });
          }
        }
        
        if (dynamicStructure.length > 0) {
          setDbStructure(dynamicStructure);
        }
      } catch (error) {
        console.error("Guru Auto-Discovery failed, using fallback.");
      }
    }
    
    discoverDatabase();
  }, []);

  // 🚀 GURU FÁZE 2: UNIVERZÁLNÍ NAŠEPTÁVAČ
  useEffect(() => {
    let active = true;

    const fetchSuggestions = async () => {
      const q = query.trim().replace(/[,"]/g, ''); 
      if (q.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const searchTerm = `%${q}%`; 
        const allPromises = [];

        // Projdeme načtenou strukturu - VŠECHNY existující tabulky a VŠECHNY jejich existující textové sloupce
        dbStructure.forEach(({ table, columns }) => {
          columns.forEach(col => {
            allPromises.push(
              supabase.from(table).select('*').ilike(col, searchTerm).limit(3)
                .then(res => {
                  if (res.error) throw res.error; 
                  return (res.data || []).map(item => ({ ...item, section: table }));
                })
            );
          });
        });

        // Počkáme na dotazy (ty, které selžou např. na oprávnění, prostě ignorujeme)
        const resultsArrays = await Promise.allSettled(allPromises);
        
        const allResults = resultsArrays
          .filter(p => p.status === 'fulfilled')
          .map(p => p.value)
          .flat();

        if (active) {
          // Odstranění duplicit podle slugu a sekce, výpis nejlepších 6
          const uniqueResults = Array.from(new Map(allResults.map(item => [item.section + (item.slug || item.id), item])).values()).slice(0, 6);
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
  }, [query, dbStructure]);

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

        {/* DROPDOWN NAŠEPTÁVAČE S DYNAMICKÝMI KATEGORIEMI */}
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
                // 🚀 GURU FIX: Zobrazí větu z JAKÉHOKOLIV existujícího sloupce, kde se text reálně našel
                let desc = '';
                const safeQ = query.trim().toLowerCase();
                let foundSnippet = false;

                // Dynamicky projdeme ÚPLNĚ VŠECHNY vlastnosti, které nám z databáze přišly (nehledě na jméno)
                for (const key in s) {
                  if (typeof s[key] === 'string' && key !== 'image_url' && key !== 'slug' && key !== 'section') {
                    const plainText = s[key].replace(/<[^>]+>/g, ''); // Vyčistíme HTML balast
                    const matchIndex = plainText.toLowerCase().indexOf(safeQ);
                    
                    if (matchIndex !== -1) {
                      // Hledané slovo nalezeno! Vyřízneme kontext okolo něj
                      const start = Math.max(0, matchIndex - 30);
                      const end = Math.min(plainText.length, matchIndex + 60);
                      desc = (start > 0 ? '...' : '') + plainText.substring(start, end) + '...';
                      foundSnippet = true;
                      break; 
                    }
                  }
                }

                // Záchranná brzda
                if (!foundSnippet) {
                  desc = s.seo_description || s.description_en || (s.content ? s.content.replace(/<[^>]+>/g, '').substring(0, 60) + '...' : '');
                }

                // GURU FIX: Pokud by záznam neměl slug (nové podivné tabulky), použijeme ID, nebo cokoliv jiného.
                const urlParam = s.slug || s.id || '';

                return (
                  <div key={i} 
                    onClick={() => { 
                      const target = isEn ? `/en/${s.section}/${urlParam}` : `/${s.section}/${urlParam}`;
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
                      <div style={{ fontWeight: '900', color: '#eab308', fontSize: '15px' }}>{s.title || s.name || 'Záznam bez názvu'}</div>
                      <div style={{ 
                        fontSize: '10px', color: '#fff', background: '#a855f7', 
                        padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px', fontWeight: 'bold' 
                      }}>
                        {/* Pokud najde novou tabulku mimo seznam, napíše její surový název velkými písmeny */}
                        {sectionNames[s.section] || s.section.toUpperCase()}
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
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{ background: '#f00', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: '900', fontSize: '11px' }}>
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
