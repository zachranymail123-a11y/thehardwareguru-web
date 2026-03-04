"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Wrench, Settings, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function TweakDetail() {
  const params = useParams();
  const [tweak, setTweak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadTweakDetail() {
      // Počkáme, až se v URL objeví slug
      if (!params?.slug) return;

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Chybí NEXT_PUBLIC Supabase klíče v konfiguraci Vercelu!");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Taháme data podle slugu z URL
        const { data, error } = await supabase
          .from('tweaky')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (error) throw error;
        setTweak(data);
      } catch (e) {
        setErrorMsg(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadTweakDetail();
  }, [params?.slug]);

  // STYLY
  const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
  const discordBtnStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 32px', borderRadius: '12px', fontWeight: '900', textTransform: 'uppercase', textDecoration: 'none', fontSize: '14px', background: '#5865F2', color: '#fff', border: 'none', cursor: 'pointer' };
  const contentStyle = { color: '#9ca3af', fontSize: '17px', lineHeight: '1.8', fontFamily: 'sans-serif' };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', fontWeight: 'bold' }}>
        GURU načítá detaily návodu...
      </div>
    );
  }

  if (errorMsg || !tweak) {
    return (
      <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', padding: '100px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ff0000', fontSize: '32px', marginBottom: '20px' }}>Chyba: Tweak nenalezen</h1>
        <p>{errorMsg || "Tento návod v databázi neexistuje."}</p>
        <Link href="/tweaky" style={{ color: '#eab308', marginTop: '20px', display: 'inline-block', fontWeight: 'bold' }}>Zpět na Guru Tweaky</Link>
      </div>
    );
  }

  const pubDate = new Date(tweak.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '0 0 80px 0' 
    }}>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap' }}>
        <Link href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/clanky" style={navItemStyle}><Newspaper size={18} /> ČLÁNKY</Link>
        <Link href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/sestavy" style={navItemStyle}><Monitor size={18} /> SESTAVY</Link>
        <Link href="/tweaky" style={{...navItemStyle, color: '#eab308'}}><Wrench size={18} /> GURU TWEAKY</Link>
        <Link href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <Link href="/tweaky" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Zpět na přehled tweaků
          </Link>
        </div>

        <div style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '28px', padding: '40px', boxShadow: '0 0 50px rgba(234, 179, 8, 0.1)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', background: 'rgba(234, 179, 8, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
              <Settings size={16} /> {tweak.category}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>
              <Calendar size={14} /> {pubDate}
            </div>
          </div>

          <h1 style={{ fontSize: '46px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '30px', lineHeight: '1.1' }}>
            {tweak.title}
          </h1>

          {tweak.image_url && tweak.image_url !== 'EMPTY' && (
            <div style={{ marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={tweak.image_url} alt={tweak.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          <div style={{ fontSize: '20px', color: '#d1d5db', lineHeight: '1.7', fontWeight: '300', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <strong style={{ color: '#fff' }}>GURU SHRNUTÍ: </strong>{tweak.description}
          </div>

          <div 
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: tweak.content }}
          />

          <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(88, 101, 242, 0.4)', borderRadius: '20px', padding: '30px', textAlign: 'center', marginTop: '60px' }}>
            <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '15px' }}>Pořád to nejede plynule?</h3>
            <p style={{ color: '#ccc', fontSize: '15px', marginBottom: '25px', fontWeight: 'bold' }}>Řešíme technické problémy na našem Discordu.</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={discordBtnStyle}>DISCORD GURU KOMUNITA</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
