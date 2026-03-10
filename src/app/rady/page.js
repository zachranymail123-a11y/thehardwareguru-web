"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenTool, ChevronRight, Loader2, Zap, ShieldCheck } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadyArchivePage() {
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
        document.title = isEn ? 'Hardware Guru Guides | Technical Base' : 'Guru Hardware Rady | Technická základna';
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

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
               <ShieldCheck size={56} color="#a855f7" />
               <Zap size={56} color="#eab308" />
            </div>
            <h1 style={titleStyle}>
              {isEn ? <>PRACTICAL <span style={{ color: '#a855f7' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#a855f7' }}>RADY</span></>}
            </h1>
            <p style={{ marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '20px' }}>
              {isEn ? 'Field-tested tips and technical solutions for every geek.' : '🛠️ Tipy a triky z praxe. Od diagnostiky až po čištění PC.'}
            </p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={64} color="#a855f7" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '35px' }}>
            {items.map((rada) => {
              const displayTitle = (isEn && rada.title_en) ? rada.title_en : rada.title;
              const displayDesc = (isEn && rada.description_en) ? rada.description_en : rada.description;
              const displaySlug = (isEn && rada.slug_en) ? rada.slug_en : rada.slug;

              return (
                <Link key={rada.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} className="rada-card">
                  <div className="icon-box">
                    <PenTool size={28} color="#a855f7" />
                  </div>
                  <h2 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>
                    {displayTitle}
                  </h2>
                  <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px 0', flexGrow: 1 }}>
                    {displayDesc && displayDesc.length > 140 ? displayDesc.substring(0, 140) + '...' : displayDesc}
                  </p>
                  <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isEn ? 'VIEW GUIDE' : 'ZOBRAZIT NÁVOD'} <ChevronRight size={18} />
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
          <h2 style={{ color: '#a855f7', marginBottom: '30px', textTransform: 'uppercase', fontWeight: '950', fontSize: '36px' }}>
            {isEn ? 'ABOUT GURU' : 'O MNĚ'}
          </h2>
          <p style={{ lineHeight: '1.9', fontSize: '18px', color: '#e5e7eb', marginBottom: '45px' }}>
            {isEn 
              ? "Welcome to The Hardware Guru! I am your guide to modern technology, hardcore hardware, and gaming. This guide section was created so that you too can become the master of your hardware."
              : "Vítej ve světě The Hardware Guru! Jsem tvůj průvodce moderní technologií, hardwarem a gamingem. Tato sekce rad vznikla proto, aby ses i ty stal pánem svého hardwaru."
            }
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '50px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18' }}>KICK LIVE</a>
            <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000' }}>YOUTUBE</a>
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
  background: 'rgba(0, 0, 0, 0.9)', 
  borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
  textAlign: 'center', 
  marginTop: '80px' 
};
