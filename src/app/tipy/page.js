"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Wrench, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const TipyContent = () => {
  const [tipy, setTipy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadTipy() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Chybí klíče pro Supabase (NEXT_PUBLIC_...).");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

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

  const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '0 0 60px 0' }}>
      
      {/* NAVIGACE */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap' }}>
        <Link href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/clanky" style={navItemStyle}><Newspaper size={18} /> ČLÁNKY</Link>
        <Link href="/tipy" style={{...navItemStyle, color: '#eab308'}}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/sestavy" style={navItemStyle}><Monitor size={18} /> SESTAVY</Link>
        <Link href="/tweaky" style={navItemStyle}><Wrench size={18} /> GURU TWEAKY</Link>
        <Link href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</Link>
      </nav>

      <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '54px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
            GURU <span style={{ color: '#eab308' }}>TIPY</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Krátké, úderné a užitečné rady pro každého hračičku a stavitele.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#eab308' }}>Načítám z databáze...</div>}
        {errorMsg && <div style={{ textAlign: 'center', color: '#ef4444' }}>Chyba: {errorMsg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
          {tipy.map((tip) => (
            <div key={tip.id} style={{ 
              background: 'linear-gradient(180deg, rgba(17, 19, 24, 0.9) 0%, rgba(10, 11, 13, 1) 100%)', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {/* Obrázek - pokud má tip image_url, jinak barevný gradient */}
              <div style={{ width: '100%', height: '220px', background: tip.image_url ? `url(${tip.image_url})` : 'linear-gradient(45deg, #1a1c23, #2d1b4e)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                 <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(124, 58, 237, 0.2)', color: '#a78bfa', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {tip.category || 'HARDWARE'}
                 </div>
              </div>

              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', color: '#fff', lineHeight: '1.3' }}>
                  {tip.emoji || '🎬'} {tip.title}
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px', flexGrow: 1 }}>
                  {tip.content}
                </p>
                <Link href={tip.link || '#'} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a78bfa', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  OTEVŘÍT NÁVOD <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!loading && tipy.length === 0 && !errorMsg && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>Zatím žádné tipy v databázi.</div>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TipyContent), { ssr: false });
