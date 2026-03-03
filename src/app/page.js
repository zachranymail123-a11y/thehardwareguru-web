"use client"; // Přepnuto na Client Component pro fungování vyhledávače
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Lightbulb, ChevronRight, Play, Search, Newspaper, Book, PenTool, Home } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState({ posts: [], nejnovejsiTipy: [], stats: { value: 0 } });
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function fetchData() {
      // 1. Přičtení návštěvy a stažení dat
      await supabase.rpc('increment_total_visits');
      
      const [p, s, t] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('stats').select('value').eq('name', 'total_visits').single(),
        supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(3)
      ]);

      setData({ posts: p.data || [], stats: s.data || { value: 0 }, nejnovejsiTipy: t.data || [] });
      setLoading(false);
    }
    fetchData();
  }, []);

  // Inteligentní filtrování napříč články a tipy
  const filteredPosts = data.posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSafeImage = (url) => {
    if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
    return url;
  };

  return (
    <div style={globalStyles}>
      <style>{`
        .tip-card { transition: 0.4s; border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tip-card:hover { transform: translateY(-8px); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); border-color: #a855f7; }
        .nav-link { margin: 0 12px; color: #fff; text-decoration: none; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: 0.3s; }
        .nav-link:hover { color: #a855f7; }
        .search-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); }
        .archive-btn { padding: 15px 40px; background: transparent; border: 2px solid #a855f7; color: #fff; border-radius: 15px; font-weight: 900; text-decoration: none; transition: 0.3s; display: inline-block; }
        .archive-btn:hover { background: #a855f7; box-shadow: 0 0 20px #a855f7; }
      `}</style>

      {/* --- HLAVIČKA S NOVOU ZÁLOŽKOU ČLÁNKY --- */}
      <nav style={navStyles}>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#a855f7' }}>HARDWARE GURU</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
          <Link href="/" className="nav-link"><Home size={16}/> DOMŮ</Link>
          <Link href="/clanky" className="nav-link"><Newspaper size={16}/> ČLÁNKY</Link>
          <Link href="/tipy" className="nav-link"><Lightbulb size={16}/> TIPY</Link>
          <Link href="/slovnik" className="nav-link"><Book size={16}/> SLOVNÍK</Link>
          <Link href="/rady" className="nav-link"><PenTool size={16}/> RADY</Link>
          <a href="/support" className="nav-link" style={{color: '#eab308'}}>SUPPORT</a>
        </div>
      </nav>

      {/* --- INTELIGENTNÍ VYHLEDÁVAČ --- */}
      <section style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#a855f7' }} />
          <input 
            type="text" 
            placeholder="Hledej v archivech Guru... (např. RTX 5090, čištění PC, lagy)" 
            className="search-input"
            style={searchInputStyles}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* --- SEKCE TIPY & TRIKY --- */}
      <section style={sectionStyles}>
        <h2 style={sectionTitleStyles}>GURU <span style={{color: '#a855f7'}}>TIPY & TRIKY</span></h2>
        <div style={gridStyles}>
          {data.nejnovejsiTipy.map((tip, idx) => (
            <Link href={`/tipy/${tip.slug}`} key={tip.id} className="tip-card" style={cardStyles}>
               <img src={getSafeImage(tip.image_url)} style={imageStyles} />
               <div style={{padding: '20px'}}>
                 <h3 style={{fontSize: '18px', fontWeight: '900'}}>{tip.title}</h3>
                 <p style={{color: '#9ca3af', fontSize: '14px'}}>{tip.description}</p>
               </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- HLAVNÍ ČLÁNKY + TLAČÍTKO ARCHIV --- */}
      <main style={sectionStyles}>
        <h2 style={sectionTitleStyles}>NEJNOVĚJŠÍ <span style={{color: '#a855f7'}}>ČLÁNKY</span></h2>
        <div style={gridStyles}>
          {filteredPosts.map((post) => (
            <Link href={`/clanky/${post.slug}`} key={post.id} style={cardStyles} className="tip-card">
               <img src={getSafeImage(post.image_url)} style={imageStyles} />
               <div style={{padding: '20px'}}>
                 <h3 style={{fontSize: '18px', fontWeight: '900'}}>{post.title}</h3>
                 <div style={{marginTop: '10px', color: '#a855f7', fontWeight: 'bold'}}>ČÍST VÍCE →</div>
               </div>
            </Link>
          ))}
        </div>

        {/* TLAČÍTKO DO ARCHIVU */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Link href="/clanky" className="archive-btn">
            PROHLÉDNOUT ARCHIV ČLÁNKŮ
          </Link>
          <p style={{ marginTop: '15px', color: '#4b5563', fontSize: '14px' }}>
            Celkem jsme pro tebe připravili stovky technických rozborů a novinek.
          </p>
        </div>
      </main>

      <footer style={footerStyles}>
        <p>Web navštívilo {data.stats.value} fanoušků | © 2026 THE HARDWARE GURU</p>
      </footer>
    </div>
  );
}

// STYLY
const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const navStyles = { padding: '20px 40px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap', gap: '20px' };
const searchInputStyles = { width: '100%', padding: '20px 20px 20px 60px', borderRadius: '20px', background: 'rgba(17, 19, 24, 0.9)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#fff', fontSize: '16px', outline: 'none', transition: '0.3s' };
const sectionStyles = { maxWidth: '1200px', margin: '80px auto', padding: '0 20px' };
const sectionTitleStyles = { fontSize: '32px', fontWeight: '900', marginBottom: '40px', textAlign: 'center' };
const gridStyles = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' };
const cardStyles = { borderRadius: '24px', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' };
const imageStyles = { width: '100%', height: '200px', objectFit: 'cover' };
const footerStyles = { padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.8)', borderTop: '1px solid rgba(168, 85, 247, 0.2)', marginTop: '80px' };
