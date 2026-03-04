"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Home, Newspaper, Lightbulb, Monitor, Wrench, Book, PenTool, ArrowLeft, Settings, Heart } from 'lucide-react';
import Link from 'next/link';

const TweakDetail = () => {
  const { slug } = useParams();
  const [tweak, setTweak] = useState(null);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (slug) {
      supabase.from('tweaky').select('*').eq('slug', slug).single().then(({ data }) => setTweak(data));
    }
  }, [slug]);

  const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };

  if (!tweak) return <div style={{ color: '#eab308', textAlign: 'center', padding: '100px', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GURU načítá data...</div>;

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '0 0 80px 0' }}>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/clanky" style={navItemStyle}><Newspaper size={18} /> ČLÁNKY</Link>
        <Link href="/tweaky" style={{...navItemStyle, color: '#eab308'}}><Wrench size={18} /> GURU TWEAKY</Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/tweaky" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><ArrowLeft size={16}/> ZPĚT</Link>
        
        <div style={{ background: 'rgba(17,19,24,0.9)', padding: '40px', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.4)', marginTop: '20px' }}>
          <h1 style={{ fontSize: '46px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' }}>{tweak.title}</h1>
          {tweak.image_url && tweak.image_url !== 'EMPTY' && <img src={tweak.image_url} style={{ width: '100%', borderRadius: '15px', margin: '30px 0', border: '1px solid rgba(255,255,255,0.1)' }} />}
          
          <div dangerouslySetInnerHTML={{ __html: tweak.content }} style={{ color: '#ccc', lineHeight: '1.8', fontSize: '17px' }} />

          {/* SEKCE PODPORY - TOTO TAM CHCEŠ */}
          <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '20px', border: '1px solid #eab308', textAlign: 'center' }}>
            <Heart size={32} color="#eab308" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}>PODPOŘIT GURU PROJEKT</h3>
            <p style={{ color: '#ccc', marginBottom: '25px' }}>Tento web běží bez otravných reklam díky tvojí podpoře. Pokud ti návod pomohl, zvaž podporu, abych mohl dál drtit AI a Serper pro tvůj hardware.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" style={{ background: '#53fc18', color: '#000', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '900' }}>KICK SUB</a>
              <a href="/support" style={{ background: '#eab308', color: '#000', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '900' }}>DONATE</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TweakDetail), { ssr: false });
