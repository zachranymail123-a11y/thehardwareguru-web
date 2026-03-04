"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Settings, Wrench, Activity } from 'lucide-react';
import Link from 'next/link';

const TweaksList = () => {
  const [tweaky, setTweaky] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    async function get() {
      const { data } = await supabase.from('tweaky').select('*').order('created_at', { ascending: false });
      setTweaky(data || []);
      setLoading(false);
    }
    get();
  }, []);

  const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
  const socialBtnStyle = (color) => ({ color: color, textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: `1px solid ${color}`, padding: '8px 16px', borderRadius: '12px', background: 'transparent' });

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '0 0 60px 0' }}>
      
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap' }}>
        <Link href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/clanky" style={navItemStyle}><Newspaper size={18} /> ČLÁNKY</Link>
        <Link href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/sestavy" style={navItemStyle}><Monitor size={18} /> SESTAVY</Link>
        <Link href="/tweaky" style={{...navItemStyle, color: '#eab308'}}><Wrench size={18} /> GURU TWEAKY</Link>
        <Link href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</Link>
      </nav>

      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '60px' }}>
          <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={socialBtnStyle('#53fc18')}>KICK</a>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-btn" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" className="social-btn" style={socialBtnStyle('#5865F2')}>DISCORD</a>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Activity size={48} color="#eab308" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '54px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' }}>GURU <span style={{ color: '#eab308' }}>TWEAKY</span></h1>
          <p style={{ color: '#9ca3af', fontSize: '18px' }}>Ždímáme z tvýho hardwaru i ten poslední zbytek výkonu. Žádný sračky, jen čistá technika.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
          {tweaky.map(t => (
            <Link href={`/tweaky/${t.slug}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(17,19,24,0.9)', padding: '30px', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                {t.image_url && t.image_url !== 'EMPTY' && <img src={t.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '15px' }} />}
                <h2 style={{ fontSize: '24px', fontWeight: '900', marginTop: '15px' }}>{t.title}</h2>
                <p style={{ color: '#9ca3af' }}>{t.description}</p>
                <div style={{ color: '#eab308', fontWeight: 'bold', marginTop: '15px' }}>OTEVŘÍT GURU NÁVOD →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TweaksList), { ssr: false });
