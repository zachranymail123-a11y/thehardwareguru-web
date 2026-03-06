"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, ExternalLink, Users } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [data, setData] = useState({ 
    posts: [], 
    nejnovejsiTipy: [], 
    nejnovejsiTweaky: [], 
    darci: [],
    partneri: [],
    stats: { value: 0 } 
  });
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        // GURU VISITS ENGINE
        await supabase.rpc('increment_total_visits');
        
        const [p, s, t, tw, d, pa] = await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('stats').select('value').eq('name', 'total_visits').single(),
          supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('darci').select('*').order('amount', { ascending: false }).limit(20),
          supabase.from('partneri').select('*').order('created_at', { ascending: false }).limit(4)
        ]);

        if (isMounted) {
          setData({ 
            posts: p.data || [], 
            stats: s.data || { value: 0 }, 
            nejnovejsiTipy: t.data || [],
            nejnovejsiTweaky: tw.data || [],
            darci: d.data || [],
            partneri: pa.data || []
          });
        }
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div style={globalWrapper} suppressHydrationWarning={true}>
      <style>{`
        .hero-btn { 
          padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 14px; 
          text-decoration: none; text-transform: uppercase; transition: 0.2s; 
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          border: none; cursor: pointer;
        }
        .hero-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }
        
        .monetize-card { 
          flex: 1; min-width: 320px; background: rgba(10, 11, 13, 0.95); 
          border-radius: 28px; padding: 40px; border: 1px solid rgba(255,255,255,0.05); 
          text-decoration: none; color: #fff; transition: 0.3s;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .monetize-card:hover { border-color: rgba(168, 85, 247, 0.4); transform: translateY(-5px); }
        
        .tip-card-home { 
          background: rgba(17, 19, 24, 0.85); border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 24px; overflow: hidden; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          backdrop-filter: blur(10px);
        }
        .tip-card-home:hover { transform: translateY(-10px) scale(1.02); border-color: #a855f7; box-shadow: 0 15px 40px rgba(168, 85, 247, 0.3); }

        .donor-pill {
          background: rgba(168, 85, 247, 0.1); color: #a855f7; padding: 6px 12px;
          border-radius: 8px; font-size: 13px; font-weight: 800; border: 1px solid rgba(168, 85, 247, 0.2);
        }
      `}</style>

      {/* --- HERO SECTION (RESTORED MASTER UI) --- */}
      <header style={heroWrapper}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
            <ShieldCheck size={20} />
            <span style={{ fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>
              {isEn ? 'OFFICIAL TECHNOLOGY BASE' : 'VAŠE TECHNOLOGICKÁ ZÁKLADNA'}
            </span>
          </div>
          
          <h1 style={heroTitle}>
            {isEn ? <>BUILDING THE <span style={{ color: '#66fcf1' }}>IDEAL PLACE</span> <br/> FOR GAMERS & GEEKS</> 
                   : <>BUDUJEME <span style={{ color: '#66fcf1' }}>IDEÁLNÍ MÍSTO</span> <br/> PRO HRÁČE A GEEKY</>}
          </h1>
          
          <p style={heroSub}>
            {isEn ? "Hardware expert with 20 years of field experience. Mission: eradicate lag, optimize FPS, and support the community." 
                   : "S 20 lety praxe v servisu hardware vím, kde každá mašina tlačí. Moje mise: vymýtit lagy, zkrotit FPS a podpořit komunitu."}
          </p>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="hero-btn" style={{ background: '#53fc18', color: '#000' }}>KICK LIVE</a>
            <Link href={isEn ? "/en/support" : "/support"} className="hero-btn" style={{ background: '#eab308', color: '#000' }}>
              <Heart size={18} fill="#000" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </Link>
            
            {/* 📰 GOOGLE CONTRIBUTION INTEGRATION */}
            <div style={{ background: '#fff', borderRadius: '12px', height: '48px', display: 'flex', alignItems: 'center', padding: '0 5px' }}>
              <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
            </div>
          </div>
        </div>

        <div style={avatarCircle}>HG</div>
      </header>

      {/* --- MONETIZATION SECTION --- */}
      <section style={contentContainer}>
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          <Link href={isEn ? "/en/sin-slavy" : "/sin-slavy"} className="monetize-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <Trophy color="#a855f7" size={32} />
              <h2 style={{ fontSize: '24px', margin: 0 }}>{isEn ? 'HALL OF FAME' : 'SÍŇ SLÁVY'}</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {data.darci.map(d => <span key={d.id} className="donor-pill">{d.name}</span>)}
              {data.darci.length === 0 && <span style={{ color: '#444' }}>{isEn ? 'Waiting for legends...' : 'Čekáme na legendy...'}</span>}
            </div>
          </Link>

          <Link href={isEn ? "/en/partneri" : "/partneri"} className="monetize-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <Rocket color="#eab308" size={32} />
              <h2 style={{ fontSize: '24px', margin: 0 }}>{isEn ? 'PARTNERS' : 'PARTNEŘI'}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.partneri.slice(0, 3).map(p => (
                <div key={p.id} style={{ fontSize: '14px', borderBottom: '1px solid #1a1a1a', paddingBottom: '8px', color: '#eab308', fontWeight: 'bold' }}>
                  {p.name}
                </div>
              ))}
              {data.partneri.length === 0 && <span style={{ color: '#444' }}>{isEn ? 'Join us as a partner' : 'Staň se naším partnerem'}</span>}
            </div>
          </Link>
        </div>
      </section>

      {/* --- LATEST TIPS (RESTORED GRID) --- */}
      <section style={{ ...contentContainer, marginTop: '60px' }}>
        <div style={sectionHeader}>
          <h2 style={{ fontSize: '32px', margin: 0 }}>GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS' : 'TIPY'}</span></h2>
          <Link href={isEn ? "/en/tipy" : "/tipy"} style={{ color: '#a855f7', fontWeight: '900', textDecoration: 'none' }}>{isEn ? 'ALL →' : 'ZOBRAZIT VŠE →'}</Link>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}><Activity className="animate-spin" color="#a855f7" /></div>
        ) : (
          <div style={gridStyle}>
            {data.nejnovejsiTipy.map(tip => (
              <Link key={tip.id} href={isEn ? `/en/tipy/${tip.slug_en || tip.slug}` : `/tipy/${tip.slug}`} className="tip-card-home" style={{ textDecoration: 'none' }}>
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img src={tip.image_url} alt={tip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>{isEn ? (tip.title_en || tip.title) : tip.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* --- FOOTER STATS --- */}
      <footer style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.4 }}>
        <div style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '3px' }}>
          THE HARDWARE GURU SYSTEM • TOTAL ANALYZED SESSIONS: {data.stats.value}
        </div>
      </footer>
    </div>
  );
}

// --- GURU MASTER STYLES (NO COMPROMISE) ---
const globalWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff' };
const heroWrapper = { 
  maxWidth: '1250px', margin: '40px auto 60px', padding: '80px 60px', 
  background: 'rgba(31, 40, 51, 0.96)', borderRadius: '40px', border: '1px solid rgba(102, 252, 241, 0.2)',
  display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap',
  boxShadow: '0 40px 100px rgba(0,0,0,0.8)', position: 'relative', overflow: 'hidden'
};
const avatarCircle = { 
  width: '180px', height: '180px', background: '#0b0c10', borderRadius: '50%', 
  border: '6px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', 
  color: '#66fcf1', fontSize: '4rem', fontWeight: '950', boxShadow: '0 0 50px rgba(102, 252, 241, 0.3)' 
};
const heroTitle = { fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '950', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '25px' };
const heroSub = { fontSize: '1.25rem', color: '#d1d5db', marginBottom: '40px', maxWidth: '800px', lineHeight: '1.6' };
const contentContainer = { maxWidth: '1250px', margin: '0 auto', padding: '0 20px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' };
