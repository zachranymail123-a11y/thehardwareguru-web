"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Cpu, SearchX, ArrowRight, Loader2 } from 'lucide-react';

// GURU ENGINE: Připojení na Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function SearchContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // GURU PRAVIDLO: Detekce jazyka
  const isEn = pathname.startsWith('/en');
  const lang = isEn ? 'en' : 'cs';

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const q = query.trim();
      
      try {
        // GURU FIX: Syntax .or() musí být bez mezer za čárkami! 
        // Prohledáváme title a popis. Pokud máš v DB i keywords, přidáme je až po ověření.
        const { data, error } = await supabase
          .from('tweaky')
          .select('title, slug, image_url, seo_description, description_en')
          .or(`title.ilike.%${q}%,seo_description.ilike.%${q}%`);

        if (error) {
          console.error("GURU DB ERROR:", error.message);
          // Fallback: Pokud seo_description dělá bordel, zkusíme jen Title
          const { data: fallbackData } = await supabase
            .from('tweaky')
            .select('title, slug, image_url, seo_description')
            .ilike('title', `%${q}%`);
          setResults(fallbackData || []);
        } else {
          setResults(data || []);
        }
      } catch (err) {
        console.error("Kritické selhání vyhledávání:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const t = {
    cs: {
      title: 'Výsledky hledání pro:',
      searching: 'GURU prohledává databázi...',
      read: 'ČÍST TWEAK',
      emptyTitle: 'Nic jsme nenašli.',
      emptyDesc: "Zkus hledat něco jiného nebo zkontroluj překlepy. (např. 'DDR5')",
    },
    en: {
      title: 'Search results for:',
      searching: 'GURU is searching...',
      read: 'READ TWEAK',
      emptyTitle: 'Nothing found.',
      emptyDesc: "Try a different search term.",
    }
  };
  const currentT = t[lang];

  return (
    <div style={{ minHeight: '80vh' }}>
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '30px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#fff', margin: 0 }}>
          {currentT.title} <span style={{ color: '#eab308' }}>"{query}"</span>
        </h1>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#eab308' }}>
          <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px auto' }} />
          <p>{currentT.searching}</p>
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {results.map((item, index) => (
            <Link href={isEn ? `/en/tweaky/${item.slug}` : `/tweaky/${item.slug}`} key={index} style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#111318', border: '1px solid #222', borderRadius: '16px', 
                overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#eab308'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
              >
                {item.image_url && item.image_url !== 'EMPTY' && (
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', color: '#eab308', marginBottom: '10px' }}>{item.title}</h2>
                  <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>
                    {isEn && item.description_en ? item.description_en.substring(0, 100) : item.seo_description?.substring(0, 100)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#a855f7', fontSize: '13px', fontWeight: '900', marginTop: '15px' }}>
                    {currentT.read} <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,0,0,0.02)', border: '1px dashed #333', borderRadius: '24px' }}>
          <SearchX size={64} color="#ff4444" style={{ margin: '0 auto 24px auto', opacity: 0.5 }} />
          <h2 style={{ color: '#fff' }}>{currentT.emptyTitle}</h2>
          <p style={{ color: '#666' }}>{currentT.emptyDesc}</p>
        </div>
      )}
    </div>
  );
}

export default function SearchResults() {
  return (
    <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#eab308' }}><Loader2 className="animate-spin" /></div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
