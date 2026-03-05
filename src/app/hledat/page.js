"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Cpu, SearchX, ArrowRight } from 'lucide-react';

// Připojení na tvou Supabase DB
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('cs');

  // GURU FIX: Automatická detekce jazyka pro CZ/EN mutaci
  useEffect(() => {
    setLang(document.documentElement.lang || 'cs');
  }, []);

  // Slovník pro překlady (CZ/EN pravidlo)
  const t = {
    cs: {
      title: 'Výsledky hledání pro:',
      searching: 'GURU prohledává databázi...',
      read: 'ČÍST TWEAK',
      emptyTitle: 'Nic jsme nenašli.',
      emptyDesc: "Zkus hledat něco jiného nebo zkontroluj překlepy. (např. 'GTA V')"
    },
    en: {
      title: 'Search results for:',
      searching: 'GURU is searching the database...',
      read: 'READ TWEAK',
      emptyTitle: 'Nothing found.',
      emptyDesc: "Try searching for something else or check for typos. (e.g., 'GTA V')"
    }
  };

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const searchTerm = `%${query}%`;

      // Hledání v tabulce TWEAKY (přidáno description_en pro multijazyčnost)
      const { data: tweakData, error: tweakError } = await supabase
        .from('tweaky')
        .select('title, slug, image_url, seo_description, description_en')
        .ilike('title', searchTerm);

      if (tweakError) console.error("Chyba hledání:", tweakError);

      setResults(tweakData || []);
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  const currentT = t[lang] || t.cs;

  return (
    <>
      <h1 style={{ fontSize: '32px', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
        {currentT.title} <span style={{ color: '#eab308' }}>"{query}"</span>
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#eab308' }}>
          <Cpu size={48} className="animate-pulse" style={{ margin: '0 auto 20px auto' }} />
          <p>{currentT.searching}</p>
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {results.map((item, index) => (
            <Link href={lang === 'en' ? `/en/tweaky/${item.slug}` : `/tweaky/${item.slug}`} key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                background: '#111318', border: '1px solid #222', borderRadius: '12px', 
                overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' 
              }}>
                {item.image_url && item.image_url !== 'EMPTY' && (
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderBottom: '1px solid #333' }} />
                )}
                <div style={{ padding: '20px' }}>
                  <h2 style={{ fontSize: '20px', margin: '0 0 10px 0', color: '#eab308' }}>{item.title}</h2>
                  <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 15px 0' }}>
                    {/* GURU FIX: Zobrazí správný popisek podle jazyka */}
                    {lang === 'en' && item.description_en 
                      ? item.description_en.substring(0, 100) 
                      : item.seo_description?.substring(0, 100)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#7c3aed', fontSize: '14px', fontWeight: 'bold' }}>
                    {currentT.read} <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff4444', borderRadius: '12px' }}>
          <SearchX size={48} color="#ff4444" style={{ margin: '0 auto 20px auto' }} />
          <h2>{currentT.emptyTitle}</h2>
          <p style={{ color: '#9ca3af' }}>{currentT.emptyDesc}</p>
        </div>
      )}
    </>
  );
}

export default function SearchResults() {
  return (
    <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Suspense fallback={<div style={{ color: '#eab308', textAlign: 'center' }}>GURU načítá...</div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
