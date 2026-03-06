"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { SearchX, ArrowRight, Loader2 } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function SearchContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname() || '';
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isEn = pathname.startsWith('/en');
  const lang = isEn ? 'en' : 'cs';

  // 🚀 GURU ROUTE MAP: Správný překlad z DB (posts) na webové složky (clanky)
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

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      
      try {
        const q = query.trim().replace(/[,"]/g, ''); 
        const searchTerm = `%${q}%`;
        const safeQ = q.toLowerCase();

        // 🚀 GURU DB FIX: Tabulka v Supabase se jmenuje 'posts', ne 'clanky'!
        const tables = ['posts', 'tipy', 'tweaky', 'slovnik', 'rady'];
        const columns = ['title', 'content', 'seo_description', 'seo_keywords', 'description_en', 'content_en', 'meta_title', 'text', 'title_en'];

        const allPromises = [];

        tables.forEach(table => {
          columns.forEach(col => {
            allPromises.push(
              supabase.from(table).select('*').ilike(col, searchTerm)
                .then(res => {
                  if (res.error) throw res.error;
                  return (res.data || []).map(item => ({ ...item, section: table }));
                })
            );
          });
        });

        const resultsArrays = await Promise.allSettled(allPromises);
        const allResults = resultsArrays
          .filter(p => p.status === 'fulfilled')
          .map(p => p.value)
          .flat();

        const uniqueResultsMap = new Map();
        
        allResults.forEach(item => {
          // GURU SLUG ENGINE
          const actualSlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
          const key = item.section + actualSlug;
          
          if (!uniqueResultsMap.has(key)) {
            let desc = '';
            let foundSnippet = false;

            for (const k in item) {
              if (typeof item[k] === 'string' && k !== 'image_url' && k !== 'slug' && k !== 'slug_en' && k !== 'section' && k !== 'title' && k !== 'title_en') {
                const plainText = item[k].replace(/<[^>]+>/g, '');
                const matchIndex = plainText.toLowerCase().indexOf(safeQ);
                
                if (matchIndex !== -1) {
                  const start = Math.max(0, matchIndex - 40);
                  const end = Math.min(plainText.length, matchIndex + 80);
                  desc = (start > 0 ? '...' : '') + plainText.substring(start, end) + '...';
                  foundSnippet = true;
                  break;
                }
              }
            }

            if (!foundSnippet) {
              desc = item.seo_description || item.description_en || (item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : '');
            }
            
            item.displayDesc = desc;
            item.finalSlug = actualSlug;
            item.finalSection = routeMap[item.section] || item.section;
            
            uniqueResultsMap.set(key, item);
          }
        });

        setResults(Array.from(uniqueResultsMap.values()));
      } catch (err) {
        console.error("Kritické selhání vyhledávání:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, isEn]);

  const t = {
    cs: {
      title: 'Výsledky hledání pro:',
      searching: 'GURU PROHLEDÁVÁ ARCHIV...',
      read: 'ZOBRAZIT',
      emptyTitle: 'GURU NIC NENAŠEL.',
      emptyDesc: "Zkus hledat něco jiného nebo zkontroluj překlepy. (např. 'DDR5', 'Optimalizace')",
    },
    en: {
      title: 'Search results for:',
      searching: 'GURU IS SEARCHING...',
      read: 'VIEW',
      emptyTitle: 'NOTHING FOUND.',
      emptyDesc: "Try a different keyword or check for typos. (e.g. 'DDR5', 'Optimization')",
    }
  };
  const currentT = t[lang];

  return (
    <div style={{ minHeight: '80vh' }}>
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '30px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#fff', margin: 0, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {currentT.title} <span style={{ color: '#eab308' }}>"{query}"</span>
        </h1>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#eab308' }}>
          <Loader2 size={54} className="animate-spin" style={{ margin: '0 auto 20px auto' }} />
          <p style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{currentT.searching}</p>
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {results.map((item, index) => {
            const titleToDisplay = (isEn && item.title_en) ? item.title_en : item.title;

            return (
            <Link href={isEn ? `/en/${item.finalSection}/${item.finalSlug}` : `/${item.finalSection}/${item.finalSlug}`} prefetch={false} key={index} style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#0d0e12', 
                border: '1px solid #1f2937', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#eab308';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(234, 179, 8, 0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1f2937';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                {item.image_url && item.image_url !== 'EMPTY' && (
                  <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                    <img src={item.image_url} alt={titleToDisplay} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#fff', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                      {sectionNames[item.section]}
                    </div>
                  </div>
                )}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '20px', color: '#eab308', margin: 0, fontWeight: '800' }}>{titleToDisplay}</h2>
                    {(!item.image_url || item.image_url === 'EMPTY') && (
                      <div style={{ background: '#a855f7', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#fff', fontWeight: 'bold', letterSpacing: '0.5px', marginLeft: '10px' }}>
                        {sectionNames[item.section]}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                    {item.displayDesc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#a855f7', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>
                    {currentT.read} <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </div>
                </div>
              </div>
            </Link>
          )})}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(168, 85, 247, 0.02)', border: '1px dashed #333', borderRadius: '24px' }}>
          <SearchX size={64} color="#ff4444" style={{ margin: '0 auto 24px auto', opacity: 0.5 }} />
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>{currentT.emptyTitle}</h2>
          <p style={{ color: '#666', marginBottom: '0', maxWidth: '500px', margin: '10px auto 0 auto', fontSize: '15px' }}>{currentT.emptyDesc}</p>
        </div>
      )}
    </div>
  );
}

export default function SearchResults() {
  return (
    <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Suspense fallback={
          <div style={{ textAlign: 'center', color: '#eab308', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 20px auto' }} />
            <p style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px' }}>GURU NAČÍTÁ...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
