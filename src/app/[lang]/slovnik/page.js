
"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Home, Lightbulb, Book, PenTool, ChevronRight, Search } from 'lucide-react';

export default function SlovnikPage() {
  const [pojmy, setPojmy] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Klientská inicializace Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Načtení slovníku (nahrazuje původní serverové načítání)
  useEffect(() => {
    async function loadSlovnik() {
      const { data } = await supabase
        .from('slovnik')
        .select('*')
        .order('title', { ascending: true });
      if (data) setPojmy(data);
    }
    loadSlovnik();
  }, []);

  // --- EFEKT PRO INTELIGENTNÍ VYHLEDÁVÁNÍ ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [pRes, tipRes, tweakRes] = await Promise.all([
          supabase.from('posts').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tipy').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tweaky').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3)
        ]);

        let results = [];
        if (pRes.data) results = [...results, ...pRes.data.map(x => ({ ...x, category: 'Článek', link: `/clanky/${x.slug}` }))];
        if (tipRes.data) results = [...results, ...tipRes.data.map(x => ({ ...x, category: 'Tip', link: `/tipy/${x.slug}` }))];
        if (tweakRes.data) results = [...results, ...tweakRes.data.map(x => ({ ...x, category: 'Tweak', link: `/tweaky/${x.slug}` }))];

        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: 'sans-serif',
        color: '#fff',
        backgroundColor: '#0a0b0d',
        backgroundImage: 'url("/bg-guru.png")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <style>{`
        .term-card { 
            background: rgba(17, 19, 24, 0.85); 
            backdrop-filter: blur(10px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            padding: 30px; 
            border-radius: 28px; 
            transition: all 0.3s ease; 
            text-decoration: none; 
            color: inherit; 
            display: flex; 
            flex-direction: column; 
            box-sizing: border-box; 
        }
        .term-card:hover { 
            border-color: #a855f7; 
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.2); 
            transform: translateY(-5px); 
        }
        .nav-link { 
            color: #fff; 
            text-decoration: none; 
            font-weight: bold; 
            transition: 0.2s; 
            font-size: 13px; 
            display: flex; 
            align-items: center; 
            gap: 8px;
        }
        .nav-link:hover { color: #a855f7; }
        .social-btn { 
            padding: 8px 16px; 
            text-decoration: none; 
            font-weight: bold; 
            border-radius: 12px; 
            transition: 0.3s; 
            font-size: 11px; 
            display: inline-block; 
            border: 1px solid currentColor;
        }
        .social-btn:hover { transform: scale(1.05); }
        .search-result-item:hover { background: rgba(102, 252, 241, 0.1); }
        @media (max-width: 768px) {
          .nav-container { flex-direction: column; gap: 15px; padding: 20px !important; }
        }
      `}</style>

      {/* --- HLAVNÍ GLOBÁLNÍ NAVIGACE --- */}
      <nav className="nav-container" style={{ 
        padding: '20px 40px', 
        background: 'rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        display: 'flex', 
        justifyContent: 'center', 
        gap: '25px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Link href="/" className="nav-link"><Home size={18} /> HOMEPAGE</Link>
        <Link href="/tipy" className="nav-link"><Lightbulb size={18} /> TIPY</Link>
        <Link href="/slovnik" className="nav-link" style={{color: '#a855f7'}}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" className="nav-link"><PenTool size={18} /> PRAKTICKÉ RADY</Link>
      </nav>

      {/* --- INTELIGENTNÍ VYHLEDÁVÁNÍ --- */}
      <div style={{ maxWidth: '400px', margin: '30px auto 0', position: 'relative', padding: '0 20px', zIndex: 999 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(17, 19, 24, 0.95)', border: '1px solid #66fcf1', borderRadius: '12px', padding: '10px 15px', boxShadow: '0 0 15px rgba(102, 252, 241, 0.2)' }}>
          <Search size={18} color="#66fcf1" style={{ marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Hledat na celém webu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', fontSize: '15px', outline: 'none' }}
          />
          {isSearching && <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: 'bold', marginLeft: '10px' }}>Hledám...</span>}
        </div>

        {searchQuery.trim() !== '' && (
          <div style={{ position: 'absolute', top: '100%', left: '20px', right: '20px', background: 'rgba(31, 40, 51, 0.98)', border: '1px solid #66fcf1', borderRadius: '12px', marginTop: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            {searchResults.length > 0 ? (
              searchResults.map((res, i) => (
                <Link href={res.link} key={i} className="search-result-item" style={{ display: 'block', padding: '12px 15px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }}>
                  <div style={{ fontSize: '10px', color: '#66fcf1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px' }}>{res.category}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{res.title}</div>
                </Link>
              ))
            ) : (
              !isSearching && <div style={{ padding: '15px', color: '#9ca3af', textAlign: 'center', fontSize: '13px' }}>Nic jsme nenašli.</div>
            )}
          </div>
        )}
      </div>

      {/* --- SOCIAL & SUPPORT BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '30px 20px' }}>
        <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18' }}>KICK</a>
        <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000' }}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#5865F2' }}>DISCORD</a>
        <a href="/support" className="social-btn" style={{ color: '#eab308', background: 'rgba(234, 179, 8, 0.1)' }}>SUPPORT</a>
      </div>

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                GURU HARDWARE <span style={{ color: '#a855f7' }}>SLOVNÍK</span>
            </h1>
            <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>Tvé technické znalosti začínají zde.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {pojmy?.map((pojem) => (
            <Link key={pojem.id} href={`/slovnik/${pojem.slug}`} className="term-card">
              <h2 style={{ color: '#a855f7', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900' }}>
                {pojem.title}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0', flexGrow: 1 }}>
                {pojem.description.length > 140 
                  ? pojem.description.substring(0, 140) + '...' 
                  : pojem.description}
              </p>
              <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Zobrazit detail <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* --- SEKCE O MNĚ --- */}
      <footer style={{ 
        padding: '80px 20px', 
        background: 'rgba(0, 0, 0, 0.8)', 
        borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
        textAlign: 'center', 
        marginTop: '80px' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '25px', textTransform: 'uppercase', fontWeight: '900', fontSize: '32px' }}>O projektu</h2>
          <p style={{ lineHeight: '1.8', fontSize: '17px', color: '#d1d5db', marginBottom: '40px' }}>
            Vítej ve světě <strong>The Hardware Guru</strong>! Jsem tvůj průvodce moderní technologií a hardwarem. 
            Moje mise je jednoduchá: pomáhat ti stavět lepší PC a chápat složité pojmy. 
            Najdeš mě pravidelně na streamu, kde společně tvoříme nejsilnější tech komunitu.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18', padding: '12px 25px' }}>KICK STREAM</a>
            <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000', padding: '12px 25px' }}>YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#5865F2', padding: '12px 25px' }}>DISCORD</a>
          </div>
          
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>
    </div>
  );
}
