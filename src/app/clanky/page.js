"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Lightbulb, Search, Newspaper, Book, PenTool, Home, Heart, ShieldCheck } from 'lucide-react';

export default function ClankyArchivePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function fetchArchive() {
      // Tady úmyslně NENÍ .limit(), abychom stáhli celý archiv
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    }
    fetchArchive();
  }, []);

  // Inteligentní filtrování
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.content && p.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10' };
    const isGame = post.type === 'game' || post.title.toLowerCase().includes('recenze') || post.title.toLowerCase().includes('resident evil');
    if (isGame) return { text: 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff' };
    return { text: 'HW NOVINKA', color: '#ff0000', textColor: '#fff' };
  };

  return (
    <div style={globalStyles}>
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(168, 85, 247, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .game-card:hover { transform: translateY(-8px); box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); border-color: #a855f7; }
        
        /* NAVIGACE A TLAČÍTKA */
        .nav-link { margin: 0 10px; color: #fff; text-decoration: none; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #a855f7; }
        
        .social-btn { padding: 6px 14px; border-radius: 8px; font-weight: 900; font-size: 12px; text-decoration: none; text-transform: uppercase; transition: transform 0.2s, box-shadow 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .social-btn:hover { transform: scale(1.05); }

        .search-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); }
      `}</style>

      {/* --- HLAVIČKA --- */}
      <nav style={navStyles}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a855f7', letterSpacing: '1px' }}>HARDWARE GURU</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Link href="/" className="nav-link"><Home size={16}/> DOMŮ</Link>
          <Link href="/clanky" className="nav-link" style={{color: '#a855f7'}}><Newspaper size={16}/> ČLÁNKY</Link>
          <Link href="/tipy" className="nav-link"><Lightbulb size={16}/> TIPY</Link>
          <Link href="/slovnik" className="nav-link"><Book size={16}/> SLOVNÍK</Link>
          <Link href="/rady" className="nav-link"><PenTool size={16}/> RADY</Link>
          
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
          
          <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#53fc18', color: '#000' }}>KICK</a>
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-btn" style={{ background: '#ff0000', color: '#fff' }}>YOUTUBE</a>
          <a href="https://discord.gg/n7xThr8" target="_blank" className="social-btn" style={{ background: '#5865F2', color: '#fff' }}>DISCORD</a>
          <a href="/support" className="social-btn" style={{ background: 'transparent', border: '1px solid #eab308', color: '#eab308' }}>SUPPORT</a>
        </div>
      </nav>

      {/* --- HLAVIČKA ARCHIVU --- */}
      <header style={{ maxWidth: '800px', margin: '60px auto 40px', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          ARCHIV <span style={{ color: '#a855f7' }}>ČLÁNKŮ</span>
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          Kompletní databáze všech recenzí, novinek a rozborů na jednom místě.
        </p>
      </header>

      {/* --- INTELIGENTNÍ VYHLEDÁVAČ --- */}
      <section style={{ maxWidth: '800px', margin: '0 auto 60px', padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#a855f7' }} />
          <input 
            type="text" 
            placeholder="Hledej v kompletním archivu (např. RTX 4070, recenze, build)..." 
            className="search-input"
            style={searchInputStyles}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ textAlign: 'right', marginTop: '10px', color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>
          Nalezeno článků: <span style={{ color: '#a855f7' }}>{filteredPosts.length}</span>
        </div>
      </section>

      {/* --- VÝPIS VŠECH ČLÁNKŮ --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {loading ? (
          <p style={{textAlign: 'center', fontSize: '18px', color: '#a855f7', fontWeight: 'bold'}}>Guru oprašuje archivy...</p>
        ) : filteredPosts.length === 0 ? (
          <p style={{textAlign: 'center', fontSize: '18px', color: '#9ca3af'}}>Žádný článek neodpovídá tvému hledání.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {filteredPosts.map((post) => {
              const badge = getBadgeInfo(post);
              return (
                <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                      <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{badge.text}</div>
                    </div>
                    <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.3rem', fontWeight: 'bold', lineHeight: '1.4' }}>{post.title}</h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                        {(post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                      </p>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 'bold' }}>{post.created_at ? new Date(post.created_at).toLocaleDateString('cs-CZ') : ''}</span>
                        <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '0.9rem' }}>ČÍST VÍCE →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- SUPPORT BANNER DOLE --- */}
      <section style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ padding: '40px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center' }}>
          <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ color: '#eab308', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Líbí se ti Guru archiv?</h3>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
            Projekt The Hardware Guru je závislý na podpoře komunity. Pokud ti naše články, videa nebo AI tipy ušetřily čas a peníze, zvaž podporu projektu. Děkujeme!
          </p>
          <a href="/support" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#eab308', color: '#000', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
            <Heart size={20} fill="#000" /> PODPOŘIT PROJEKT
          </a>
        </div>
      </section>

      <footer style={{ background: 'rgba(0,0,0,0.8)', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>© {new Date().getFullYear()} THE HARDWARE GURU. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  );
}

// STYLY
const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' };
const navStyles = { padding: '20px 40px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap', gap: '20px' };
const searchInputStyles = { width: '100%', padding: '20px 20px 20px 60px', borderRadius: '20px', background: 'rgba(17, 19, 24, 0.9)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#fff', fontSize: '16px', outline: 'none', transition: '0.3s' };
