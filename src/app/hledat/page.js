"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Cpu, SearchX, ArrowRight, Loader2 } from 'lucide-react';

// Inicializace Supabase - Guru Engine
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function SearchContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // GURU PRAVIDLO: Detekce jazyka pro CZ/EN variantu
  const isEn = pathname.startsWith('/en');
  const lang = isEn ? 'en' : 'cs';

  // Slovník pro multijazyčnost
  const t = {
    cs: {
      title: 'Výsledky hledání pro:',
      searching: 'GURU prohledává databázi...',
      read: 'ČÍST TWEAK',
      emptyTitle: 'Nic jsme nenašli.',
      emptyDesc: "Zkus hledat něco jiného nebo zkontroluj překlepy. (např. 'DDR5' nebo 'GTA V')",
      resultsCount: (count) => `Nalezeno ${count} výsledků.`
    },
    en: {
      title: 'Search results for:',
      searching: 'GURU is searching the database...',
      read: 'READ TWEAK',
      emptyTitle: 'Nothing found.',
      emptyDesc: "Try searching for something else or check for typos. (e.g., 'DDR5' or 'GPU')",
      resultsCount: (count) => `Found ${count} results.`
    }
  };

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const q = query.trim();
      const searchTerm = `%${q}%`;

      try {
        // GURU BRUTAL SEARCH: Prohledáváme title, oba popisy i klíčová slova najednou.
        // DŮLEŽITÉ: Žádné mezery v .or() řetězci pro stabilitu v Supabase.
        const { data, error } = await supabase
          .from('tweaky')
          .select('title, slug, image_url, seo_description, seo_keywords, description_en')
          .or(`title.ilike.${searchTerm},seo_description.ilike.${searchTerm},seo_keywords.ilike.${searchTerm},description_en.ilike.${searchTerm}`);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Guru Search System Error:", err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const currentT = t[lang];

  return (
    <div style={{ minHeight: '80vh' }}>
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '30px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#fff', margin: 0 }}>
          {currentT.title} <span style={{ color: '#eab308' }}>"{query}"</span>
        </h1>
        {!loading && results.length > 0 && (
          <p style={{ color: '#9ca3af', marginTop: '10px', fontSize: '14px' }}>
            {currentT.resultsCount(results.length)}
          </p>
        )}
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#eab308' }}>
          <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px auto' }} />
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentT.searching}</p>
        </div>
      ) : results.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '25px' 
        }}>
          {results.map((item, index) => (
            <Link 
              href={isEn ? `/en/tweaky/${item.slug}` : `/tweaky/${item.slug}`} 
              key={index} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ 
                background: '#111318', 
                border: '1px solid #222', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                height: '100%',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#eab308';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(234, 179, 8, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                {item.image_url && item.image_url !== 'EMPTY' && (
                  <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '20px', color: '#eab308', margin: '0 0 12px 0', lineHeight: '1.3' }}>
                    {item.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 20px 0', flex: 1 }}>
                    {isEn && item.description_en 
                      ? item.description_en.substring(0, 110) 
                      : item.seo_description?.substring(0, 110)}...
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#a855f7', 
                    fontSize: '13px', 
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {currentT.read} <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px', 
          background: 'rgba(255, 68, 68, 0.03)', 
          border: '1px dashed #333', 
          borderRadius: '24px' 
        }}>
          <SearchX size={64} color="#ff4444" style={{ margin: '0 auto 24px auto', opacity: 0.5 }} />
          <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>{currentT.emptyTitle}</h2>
          <p style={{ color: '#666', maxWidth: '400px', margin: '0 auto' }}>{currentT.emptyDesc}</p>
        </div>
      )}
    </div>
  );
}

// Hlavní export s Layoutem pro Guru styl
export default function SearchResults() {
  return (
    <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '100px', color: '#eab308' }}>
            <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px auto' }} />
            <p>GURU načítá...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
