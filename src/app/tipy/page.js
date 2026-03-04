"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Wrench, Zap, Star } from 'lucide-react';
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

        // Taháme data z tabulky "tipy" (ujisti se, že ji máš v DB takhle pojmenovanou)
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

      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#eab308' }}><Zap size={48} /></div>
          <h1 style={{ fontSize: '54px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 20px 0' }}>GURU <span style={{ color: '#eab308' }}>TIPY</span></h1>
          <p style={{ color: '#9ca3af', fontSize: '18px' }}>Rychlé vychytávky, které ti usnadní život s PC.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#eab308' }}>Načítám Guru tipy...</div>}
        {errorMsg && <div style={{ textAlign: 'center', color: '#ef4444' }}>Chyba: {errorMsg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
          {tipy.map((tip) => (
            <div key={tip.id} style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '28px', padding: '35px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>
                <Star size={14} /> TIP
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>{tip.title}</h2>
              <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6' }}>{tip.content}</p>
            </div>
          ))}
        </div>

        {!loading && tipy.length === 0 && !errorMsg && (
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>Zatím žádné tipy v databázi.</div>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TipyContent), { ssr: false });
