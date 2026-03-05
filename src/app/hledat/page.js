"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Cpu, SearchX, ArrowRight, Loader2 } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function SearchContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      const searchTerm = `%${q}%`;

      try {
        // GURU FIX: Syntaxe .or() nesmí mít mezery za čárkami!
        // Prohledáváme sloupce, které máš v DB: title, seo_description, seo_keywords
        const { data, error } = await supabase
          .from('tweaky')
          .select('title,slug,image_url,seo_description,seo_keywords,description_en')
          .or(`title.ilike.${searchTerm},seo_description.ilike.${searchTerm},seo_keywords.ilike.${searchTerm}`);

        if (error) {
          console.error("GURU DB ERROR:", error.message);
          // Fallback na jednoduché hledání v Title, pokud by or selhal
          const { data: fallback } = await supabase
            .from('tweaky')
            .select('title,slug,image_url,seo_description')
            .ilike('title', searchTerm);
          setResults(fallback || []);
        } else {
          setResults(data || []);
        }
      } catch (err) {
        console.error("Critical fail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const t = {
    cs: { title: 'Výsledky pro:', searching: 'GURU prohledává archiv...', empty: 'Nic jsme nenašli.' },
    en: { title: 'Results for:', searching: 'GURU searching...', empty: 'Nothing found.' }
  };
  const currentT = t[lang] || t.cs;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
        {currentT.title} <span style={{ color: '#eab308' }}>"{query}"</span>
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: '#eab308' }}>
          <Loader2 size={48} className="animate-spin" style={{ margin: 'auto' }} />
          <p>{currentT.searching}</p>
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {results.map((item, index) => (
            <Link href={isEn ? `/en/tweaky/${item.slug}` : `/tweaky/${item.slug}`} key={index} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#111318', border: '1px solid #222', borderRadius: '12px', overflow: 'hidden', transition: '0.2s' }}>
                <div style={{ padding: '24px' }}>
                  <h2 style={{ color: '#eab308', fontSize: '20px', margin: '0 0 10px 0' }}>{item.title}</h2>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>{item.seo_description?.substring(0, 100)}...</p>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#a855f7', fontWeight: 'bold', marginTop: '15px' }}>
                    DETAIL <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px', border: '1px dashed #333', borderRadius: '20px' }}>
          <SearchX size={64} color="#ff4444" style={{ marginBottom: '20px', opacity: 0.5 }} />
          <h2 style={{ color: '#fff' }}>{currentT.empty}</h2>
        </div>
      )}
    </div>
  );
}

export default function SearchResults() {
  return (
    <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', color: '#eab308', padding: '100px' }}>GURU Načítá...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
