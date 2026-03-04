"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Settings, Wrench, Activity, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const TweaksContent = () => {
  const [tweaky, setTweaky] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadTweaks() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) throw new Error("Chybí klíče pro Supabase!");

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('tweaky')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTweaky(data || []);
      } catch (e) {
        setErrorMsg(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadTweaks();
  }, []);

  // INTELIGENTNÍ FILTR GURU TWEAKŮ
  const filteredTweaky = tweaky.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '0 0 60px 0' }}>
      
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap' }}>
        <Link href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/clanky" style={navItemStyle}><Newspaper size={18} /> ČLÁNKY</Link>
        <Link href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/tweaky" style={{...navItemStyle, color: '#eab308'}}><Wrench size={18} /> GURU TWEAKY</Link>
        <Link href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</Link>
      </nav>

      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Activity size={48} color="#eab308" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '54px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 10px 0' }}>GURU <span style={{ color: '#eab308' }}>TWEAKY</span></h1>
          <p style={{ color: '#9ca3af', fontSize: '18px' }}>Ždímáme z tvýho hardwaru i ten poslední zbytek výkonu. Žádný sračky, jen čistá technika.</p>
        </div>

        {/* INTELIGENTNÍ VYHLEDÁVÁNÍ */}
        <div style={{ maxWidth: '600px', margin: '0 auto 50px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#eab308' }} size={20} />
          <input 
            type="text" 
            placeholder="Hledej hru nebo fix (např. Cyberpunk, stuttering)..." 
            style={{ width: '100%', padding: '18px 20px 18px 60px', borderRadius: '15px', background: 'rgba(17, 19, 24, 0.9)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#fff', fontSize: '16px', outline: 'none' }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#eab308' }}>Načítám Guru návody...</div>}
        {errorMsg && <div style={{ textAlign: 'center', color: '#ef4444' }}>Chyba: {errorMsg}</div>}

        {/* KARTY SE SJEDNOCENOU VELIKOSTÍ OBRÁZKŮ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
          {filteredTweaky.map((t) => (
            <Link href={`/tweaky/${t.slug}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '28px', padding: '30px', height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#eab308'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)'}>
                
                {/* FIX VELIKOSTI OBRÁZKU: Pevná výška a aspect ratio */}
                <div style={{ width: '100%', height: '210px', borderRadius: '18px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)', background: '#000' }}>
                  <img 
                    src={t.image_url && t.image_url !== 'EMPTY' ? t.image_url : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000'} 
                    alt={t.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>
                  <Settings size={14} /> {t.category}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px', color: '#fff' }}>{t.title}</h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', flexGrow: 1 }}>{t.description}</p>
                <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '14px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  OTEVŘÍT GURU NÁVOD <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filteredTweaky.length === 0 && (
          <div style={{ textAlign: 'center', color: '#4b5563', padding: '40px' }}>Podle tvýho vyhledávání jsem nic nenašel, kámo.</div>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TweaksContent), { ssr: false });
