"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, ChevronRight, Loader2, ShieldCheck, Heart } from 'lucide-react';

// GURU ENGINE: Inicializace spojení s databází
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ClankyArchivePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // GURU PRAVIDLO: Detekce jazyka z adresy (CZ/EN hybrid)
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchArchive() {
      // GURU FIX: Stahujeme kompletní archiv bez limitu pro vyčerpávající seznam
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

  // Pomocné funkce pro zobrazení
  const getThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    if (post.video_id && post.video_id.length > 5) return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10' };
    const isGame = post.type === 'game' || post.title.toLowerCase().includes('recenze') || post.title.toLowerCase().includes('resident evil');
    if (isGame) return { text: isEn ? 'GAME NEWS' : 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff' };
    return { text: isEn ? 'HW NEWS' : 'HW NOVINKA', color: '#ff0000', textColor: '#fff' };
  };

  return (
    <div style={globalStyles}>
      <style>{`
        .game-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(168, 85, 247, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .game-card:hover { transform: translateY(-8px); box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); border-color: #a855f7; }
      `}</style>

      {/* --- HLAVIČKA ARCHIVU --- */}
      <header style={{ maxWidth: '800px', margin: '20px auto 40px', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          {isEn ? (
            <>ARTICLE <span style={{ color: '#a855f7' }}>ARCHIVE</span></>
          ) : (
            <>ARCHIV <span style={{ color: '#a855f7' }}>ČLÁNKŮ</span></>
          )}
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          {isEn 
            ? 'Complete database of all reviews, news and tech breakdowns in one place.' 
            : 'Kompletní databáze všech recenzí, novinek a rozborů na jednom místě.'
          }
        </p>
      </header>

      {/* --- STATISTIKA --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 20px', padding: '0 20px', textAlign: 'right' }}>
        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>
          {isEn ? 'Total entries: ' : 'Celkem článků: '} <span style={{ color: '#a855f7' }}>{posts.length}</span>
        </div>
      </section>

      {/* --- VÝPIS VŠECH ČLÁNKŮ --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#a855f7" style={{ margin: '0 auto' }} />
            <p style={{marginTop: '20px', color: '#a855f7', fontWeight: 'bold'}}>{isEn ? 'GURU is dusting archives...' : 'Guru oprašuje archivy...'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {posts.map((post) => {
              const badge = getBadgeInfo(post);
              return (
                <Link key={post.id} href={isEn ? `/en/clanky/${post.slug}` : `/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="game-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                      <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{badge.text}</div>
                    </div>
                    <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.3rem', fontWeight: 'bold', lineHeight: '1.4' }}>{post.title}</h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                        {isEn && post.description_en 
                          ? post.description_en 
                          : (post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 120) + '...'
                        }
                      </p>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {post.created_at ? new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ') : ''}
                        </span>
                        <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '0.9rem' }}>{isEn ? 'READ MORE' : 'ČÍST VÍCE'} →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- SUPPORT BANNER --- */}
      <section style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ padding: '40px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center' }}>
          <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ color: '#eab308', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>
            {isEn ? 'Enjoy the Guru Archive?' : 'Líbí se ti Guru archiv?'}
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
            {isEn 
              ? 'The Hardware Guru project depends on community support. If our articles, videos or AI tips saved you time and money, consider supporting us. Thank you!'
              : 'Projekt The Hardware Guru je závislý na podpoře komunity. Pokud ti naše články, videa nebo AI tipy ušetřily čas a peníze, zvaž podporu projektu. Děkujeme!'
            }
          </p>
          <Link href={isEn ? "/en/support" : "/support"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#eab308', color: '#000', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
            <Heart size={20} fill="#000" /> {isEn ? 'SUPPORT PROJECT' : 'PODPOŘIT PROJEKT'}
          </Link>
        </div>
      </section>

      <footer style={{ background: 'rgba(0,0,0,0.8)', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>© {new Date().getFullYear()} THE HARDWARE GURU. {isEn ? 'All rights reserved.' : 'Všechna práva vyhrazena.'}</p>
      </footer>
    </div>
  );
}

const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' };
