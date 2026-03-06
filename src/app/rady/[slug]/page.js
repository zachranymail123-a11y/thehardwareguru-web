"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, usePathname } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function GuideDetail() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenTool, ChevronRight, Loader2, Search, Zap, ShieldCheck } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('rady')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) setItems(data);
        document.title = isEn ? 'Hardware Guru Guides | Technical Base' : 'Guru Hardware Rady | Technická základna';
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  // GURU FILTER: Inteligentní prohledávání CZ i EN obsahu
  const filteredItems = items.filter(item => {
    const title = (isEn && item.title_en ? item.title_en : item.title).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  return (
    <div style={pageWrapper}>
      <style>{`
        .rada-card { 
            background: rgba(10, 11, 13, 0.9); 
            backdrop-filter: blur(15px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            padding: 35px; 
            border-radius: 28px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            text-decoration: none; 
            color: inherit; 
            display: flex; 
            flex-direction: column; 
            height: 100%;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }
        .rada-card:hover { 
            border-color: #a855f7; 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); 
            transform: translateY(-8px) scale(1.02); 
        }
        .icon-box {
            background: rgba(168, 85, 247, 0.1); 
            width: fit-content; 
            padding: 12px; 
            border-radius: 15px; 
            margin-bottom: 25px;
            border: 1px solid rgba(168, 85, 247, 0.2);
        }
        .search-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto 60px;
            position: relative;
        }
        .search-input {
            width: 100%;
            padding: 18px 25px 18px 60px;
            background: rgba(0,0,0,0.8);
            border: 2px solid rgba(168, 85, 247, 0.2);
            border-radius: 20px;
            color: #fff;
            outline: none;
            font-size: 17px;
            transition: 0.3s;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .search-input:focus { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
        .social-btn { 
            padding: 12px 24px; 
            text-decoration: none; 
            font-weight: 900; 
            border-radius: 14px; 
            transition: 0.3s; 
            font-size: 12px; 
            display: inline-block; 
            border: 1px solid currentColor;
            text-transform: uppercase;
        }
        .social-btn:hover { transform: scale(1.05); filter: brightness(1.2); }
      `}</style>

      {/* --- HLAVNÍ OBSAH --- */}
      <main style={{ maxWidth: '1300px', margin: '60px auto', padding: '0 20px', width: '100%', flex: '1 0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
               <ShieldCheck size={64} color="#a855f7" />
               <Zap size={64} color="#eab308" />
            </div>
            <h1 style={titleStyle}>
              {isEn ? <>PRACTICAL <span style={{ color: '#a855f7' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#a855f7' }}>RADY</span></>}
            </h1>
            <p style={{ marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '20px' }}>
              {isEn ? 'Elite technical knowledge and field-tested solutions.' : '🛠️ Tipy a triky z praxe. Od diagnostiky až po čištění PC.'}
            </p>
        </header>

        {/* --- VYHLEDÁVÁNÍ (GURU STANDARD) --- */}
        <div className="search-container">
          <Search size={24} color="#a855f7" style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder={isEn ? "Search practical guides..." : "Hledat v praktických radách..."} 
            className="search-input"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={64} color="#a855f7" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '35px' }}>
            {filteredItems.map((rada) => {
              const displayTitle = (isEn && rada.title_en) ? rada.title_en : rada.title;
              const displayDesc = (isEn && rada.description_en) ? rada.description_en : rada.description;
              const displaySlug = (isEn && rada.slug_en) ? rada.slug_en : rada.slug;

              return (
                <Link key={rada.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} className="rada-card">
                  <div className="icon-box">
                    <PenTool size={28} color="#a855f7" />
                  </div>
                  <h2 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                    {displayTitle}
                  </h2>
                  <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px 0', flexGrow: 1 }}>
                    {displayDesc && displayDesc.length > 140 ? displayDesc.substring(0, 140) + '...' : displayDesc}
                  </p>
                  <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isEn ? 'DECRYPT DETAIL' : 'ZOBRAZIT NÁVOD'} <ChevronRight size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- GURU FOOTER (MULTI-LANG) --- */}
      <footer style={footerStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '30px', textTransform: 'uppercase', fontWeight: '950', fontSize: '36px', letterSpacing: '-1px' }}>
            {isEn ? 'ABOUT GURU PROJECT' : 'O PROJEKTU'}
          </h2>
          <p style={{ lineHeight: '1.9', fontSize: '18px', color: '#e5e7eb', marginBottom: '45px', fontWeight: '500' }}>
            {isEn 
              ? "Welcome to The Hardware Guru! I am your guide to modern technology, hardcore hardware, and gaming. This guide section was created so that you too can become the master of your hardware."
              : "Vítej ve světě The Hardware Guru! Jsem tvůj průvodce moderní technologií, hardwarem a gamingem. Tato sekce rad vznikla proto, aby ses i ty stal pánem svého hardwaru."
            }
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '50px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18' }}>KICK LIVE</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000' }}>YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#5865F2' }}>DISCORD</a>
          </div>
          
          <p style={{ fontSize: '13px', color: '#444', fontWeight: '900', letterSpacing: '2px' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE TECH BASE
          </p>
        </div>
      </footer>
    </div>
  );
}

const pageWrapper = { 
  minHeight: '100vh', 
  backgroundColor: '#0a0b0d', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover', 
  backgroundAttachment: 'fixed', 
  color: '#fff',
  display: 'flex',
  flexDirection: 'column'
};

const titleStyle = { 
  fontSize: 'clamp(40px, 8vw, 72px)', 
  fontWeight: '950', 
  textTransform: 'uppercase', 
  letterSpacing: '-2px', 
  margin: 0,
  lineHeight: '0.9'
};

const footerStyle = { 
  padding: '120px 20px 60px', 
  background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 100%)', 
  borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
  textAlign: 'center', 
  marginTop: '80px' 
};

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from('rady').select('*');
        if (isEn) query = query.or(`slug_en.eq."${slug}",slug.eq."${slug}"`);
        else query = query.eq('slug', slug);
        const { data, error } = await query.single();
        if (error) throw error;
        setItem(data);
        document.title = `${isEn ? data.title_en : data.title} | Guru Guides`;
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, [slug, isEn]);

  if (loading) return <div style={center}><Loader2 className="animate-spin" size={48} color="#66fcf1" /></div>;
  if (!item) return <div style={center}><h1>GUIDE NOT FOUND</h1></div>;

  return (
    <div style={pageWrapper}>
      <article style={container}>
        <div style={contentBoxStyle}>
          <header style={{ marginBottom: '60px' }}>
            <Link href={isEn ? "/en/rady" : "/rady"} style={backLink}><ArrowLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</Link>
            <h1 style={mainTitle}>{isEn && item.title_en ? item.title_en : item.title}</h1>
          </header>

          <div className="article-body prose" dangerouslySetInnerHTML={{ __html: isEn && item.content_en ? item.content_en : item.content }} />

          {/* 🛡️ GURU SHIELD SUPPORT BOX (Vylepšeno o Google Button) */}
          <div style={guruShield}>
            <Heart size={44} color="#66fcf1" fill="#66fcf1" style={{ margin: '0 auto 25px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{isEn ? 'SUPPORT GURU' : 'PODPOŘ GURU PROJEKT'}</h3>
            <p style={{ color: '#d1d5db', margin: '0 auto 35px' }}>{isEn ? 'Help us research more hardware fixes.' : 'Zvaž příspěvek na další výzkum technických fixů.'}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>DARY / REVOLUT</Link>
              {/* 📰 GOOGLE CONTRIBUTION BUTTON */}
              <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px' };
const container = { maxWidth: '1000px', margin: '0 auto' };
const contentBoxStyle = { background: 'rgba(10, 11, 13, 0.94)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(102, 252, 241, 0.15)' };
const backLink = { color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '13px' };
const mainTitle = { fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: '950', color: '#fff', textTransform: 'uppercase' };
const guruShield = { marginTop: '100px', padding: '50px', background: 'rgba(102, 252, 241, 0.05)', borderRadius: '35px', border: '1px solid #66fcf1', textAlign: 'center' };
const supportBtn = { background: '#66fcf1', color: '#0b0c10', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900' };
const center = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d' };
