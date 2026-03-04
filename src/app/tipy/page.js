"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Wrench, Play, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const TipyContent = () => {
  const [tipy, setTipy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function loadTipy() {
      try {
        const { data, error } = await supabase
          .from('tipy')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTipy(data || []);
      } catch (e) {
        setErrorMsg(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadTipy();
  }, []);

  const getSafeImage = (url) => {
    if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
    return url;
  };

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <style>{`
        .tip-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); }
        .tip-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); border-color: #a855f7; }
        
        @keyframes pulse-new {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .new-badge { position: absolute; top: 15px; left: 15px; background: #a855f7; color: #fff; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 900; z-index: 10; animation: pulse-new 2s infinite ease-in-out; box-shadow: 0 0 15px rgba(168, 85, 247, 0.6); letter-spacing: 1px; }
        
        .nav-link { margin: 0 10px; color: #fff; text-decoration: none; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #a855f7; }
      `}</style>

      {/* NAVIGACE S FIALOVÝM AKCENTEM */}
      <nav style={{ padding: '20px 40px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'center', gap: '20px', position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap' }}>
        <Link href="/" className="nav-link"><Home size={16}/> DOMŮ</Link>
        <Link href="/clanky" className="nav-link"><Newspaper size={16}/> ČLÁNKY</Link>
        <Link href="/tipy" className="nav-link" style={{color: '#a855f7'}}><Lightbulb size={16}/> TIPY</Link>
        <Link href="/slovnik" className="nav-link"><Book size={16}/> SLOVNÍK</Link>
        <Link href="/rady" className="nav-link"><PenTool size={16}/> RADY</Link>
        <Link href="/tweaky" className="nav-link"><Wrench size={16}/> TWEAKY</Link>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '54px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            GURU <span style={{ color: '#a855f7' }}>TIPY & TRIKY</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Rychlé Guru návody a technické vychytávky pro tvůj hardware.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#a855f7' }}>Stahuju Guru moudra...</div>}
        {errorMsg && <div style={{ textAlign: 'center', color: '#ef4444' }}>Chyba: {errorMsg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
          {tipy.map((tip, index) => (
            <Link 
              href={`/tipy/${tip.slug}`} 
              key={tip.id} 
              className="tip-card" 
              style={{ textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
            >
              <div style={{ position: 'relative', height: '220px', width: '100%', background: '#0b0c10' }}>
                {index === 0 && <div className="new-badge">NOVINKA 🔥</div>}
                <img src={getSafeImage(tip.image_url)} alt={tip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {tip.youtube_id && (
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#ff0000', padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 5, boxShadow: '0 0 10px rgba(255,0,0,0.5)' }}>
                    <Play size={12} fill="#fff" /> VIDEO
                  </div>
                )}
              </div>

              <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {tip.category || 'OPTIMALIZACE'}
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '12px 0', color: '#fff', lineHeight: '1.2' }}>
                  {tip.title}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px', flexGrow: 1 }}>
                  {tip.description || tip.content?.substring(0, 120) + '...'}
                </p>
                <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '13px', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  OTEVŘÍT NÁVOD <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && tipy.length === 0 && !errorMsg && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>V databázi zatím nic není.</div>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TipyContent), { ssr: false });
