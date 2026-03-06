"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight, Bookmark, Activity } from 'lucide-react';

// GURU ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GuidesArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

        // GURU SEO: Dynamický titulek stránky
        document.title = isEn ? 'Practical Hardware Guides | Hardware Guru' : 'Praktické Hardware Rady | Hardware Guru';
      } catch (err) {
        console.error("GURU DATA FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  return (
    <div style={archiveWrapper}>
      <style>{`
        .rada-card { 
            background: rgba(10, 11, 13, 0.92); 
            border: 1px solid rgba(102, 252, 241, 0.25); 
            border-radius: 28px; 
            padding: 35px; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            height: 100%;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            text-decoration: none;
            cursor: pointer;
        }
        .rada-card:hover { 
            transform: translateY(-10px) scale(1.02); 
            border-color: #66fcf1; 
            box-shadow: 0 20px 60px rgba(102, 252, 241, 0.25); 
        }
      `}</style>

      <header style={headerStyle}>
        <div style={headerContentBox}>
          <ShieldCheck size={48} color="#66fcf1" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(102, 252, 241, 0.4))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>PRACTICAL <span style={{ color: '#66fcf1' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#66fcf1' }}>RADY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'Step-by-step technical solutions to keep your hardware alive.' 
              : 'Technická řešení krok za krokem, která udrží tvůj hardware naživu.'}
          </p>
        </div>
      </header>

      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#66fcf1" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '35px' }}>
            {items.map((item) => {
              // GURU ROBUST ENGINE: Fallbacky pro EN verzi
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="rada-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                        <div style={{ color: '#66fcf1' }}><ShieldCheck size={40} /></div>
                        <div style={categoryBadge}>
                            {isEn ? 'GURU GUIDE' : 'GURU RADA'}
                        </div>
                    </div>
                    
                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{displayDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'READ FULL GUIDE' : 'ČÍST CELOU RADU'} <ChevronRight size={18} />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer style={footerStyle}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: '#66fcf1', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', fontSize: '32px' }}>
            {isEn ? 'Master Your Machine' : 'Staň se pánem HW'}
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '17px', color: '#d1d5db', marginBottom: '40px' }}>
            {isEn ? (
              <>These guides are built with 20 years of hardware experience. No generic tips, only field-tested methods to keep your PC running at 100%.</>
            ) : (
              <>Tyto rady stavím na 20 letech zkušeností ze servisu. Žádné obecné kecy, ale praxí ověřené postupy, jak udržet tvůj stroj ve 100% kondici.</>
            )}
          </p>
          <p style={{ fontSize: '13px', color: '#444', fontWeight: 'bold' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- GURU MASTER STYLES (CYAN THEME) ---
const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '120px 20px 80px' 
};

const headerStyle = { 
    maxWidth: '1000px', 
    margin: '0 auto 60px', 
    textAlign: 'center' 
};

const headerContentBox = {
    background: 'rgba(0,0,0,0.7)',
    padding: '40px 20px',
    borderRadius: '32px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(102, 252, 241, 0.15)'
};

const titleStyle = { 
    fontSize: 'clamp(40px, 8vw, 72px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-1px', 
    color: '#fff', 
    lineHeight: '0.9' 
};

const subtitleStyle = { 
    marginTop: '25px', 
    color: '#d1d5db', 
    fontWeight: '600', 
    fontSize: '19px',
    maxWidth: '650px',
    margin: '25px auto 0'
};

const gridContainer = { 
    maxWidth: '1200px', 
    margin: '0 auto' 
};

const categoryBadge = { 
    background: 'rgba(102, 252, 241, 0.1)', 
    color: '#66fcf1', 
    padding: '5px 14px', 
    borderRadius: '8px', 
    fontSize: '11px', 
    fontWeight: '900', 
    letterSpacing: '1px',
    border: '1px solid rgba(102, 252, 241, 0.2)'
};

const cardTitleStyle = { 
    fontSize: '26px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '15px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2' 
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '15px', 
    lineHeight: '1.7', 
    flexGrow: 1, 
    marginBottom: '25px' 
};

const moreStyle = { 
    color: '#66fcf1', 
    fontWeight: '900', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: 'auto', 
    textTransform: 'uppercase' 
};

const footerStyle = { 
    padding: '80px 20px', 
    background: 'rgba(0, 0, 0, 0.8)', 
    borderTop: '1px solid rgba(102, 252, 241, 0.15)', 
    textAlign: 'center', 
    marginTop: '100px',
    borderRadius: '40px 40px 0 0'
};
