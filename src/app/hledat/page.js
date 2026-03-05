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
      
      try {
        const q = query.trim();
        
        // 🚀 GURU POSTGRESQL FULL-TEXT SEARCH (Dle profi návrhu)
        // Voláme nativní SQL funkci pro brutální rychlost a přesnost (stemming, relevance)
        const { data: rpcData, error: rpcError } = await supabase.rpc('search_tweaks', { search_term: q });

        if (!rpcError && rpcData) {
          // SQL Full-Text engine zafungoval!
          setResults(rpcData);
        } else {
          // ZÁLOHA: Pokud SQL funkce ještě neexistuje (např. jsi nespustil SQL kód), 
          // použijeme robustní původní GURU paralelní JS hledání, aby web nikdy nespadl.
          console.warn("PostgreSQL RPC nenalezeno, aktivuji JS Fallback:", rpcError?.message);
          
          const searchTerm = `%${q}%`;
          const safeQuery = async (column) => {
            try {
              const { data, error } = await supabase
                .from('tweaky')
                .select('title, slug, image_url, seo_description, description_en')
                .ilike(column, searchTerm);
              return error ? [] : (data || []);
            } catch (e) {
              return [];
            }
          };

          const [byTitle, byDesc, byKeys, byContent] = await Promise.all([
            safeQuery('title'),
            safeQuery('seo_description'),
            safeQuery('seo_keywords'),
            safeQuery('content')
          ]);

          const allResults = [...byTitle, ...byDesc, ...byKeys, ...byContent];
          const uniqueResults = Array.from(new Map(allResults.map(item => [item.slug, item])).values());
          setResults(uniqueResults);
        }
      } catch (err) {
        console.error("Kritické selhání vyhledávání:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Multijazyčný slovník
  const t = {
    cs: {
      title: 'Výsledky hledání pro:',
      searching: 'GURU PROHLEDÁVÁ ARCHIV...',
      read: 'DETAIL TWEAKU',
      emptyTitle: 'GURU NIC NENAŠEL.',
      emptyDesc: "Zkus hledat něco jiného nebo zkontroluj překlepy. (např. 'DDR5', 'Optimalizace')",
    },
    en: {
      title: 'Search results for:',
      searching: 'GURU IS SEARCHING...',
      read: 'READ TWEAK',
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
          {results.map((item, index) => (
            <Link href={isEn ? `/en/tweaky/${item.slug}` : `/tweaky/${item.slug}`} key={index} style={{ textDecoration: 'none' }}>
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
                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '20px', color: '#eab308', marginBottom: '12px', fontWeight: '800' }}>{item.title}</h2>
                  <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                    {isEn && item.description_en ? item.description_en.substring(0, 110) : item.seo_description?.substring(0, 110)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#a855f7', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>
                    {currentT.read} <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
