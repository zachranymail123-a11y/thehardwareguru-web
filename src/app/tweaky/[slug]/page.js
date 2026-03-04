import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Settings, Wrench, Activity } from 'lucide-react';
import Link from 'next/link';

// ABSOLUTNÍ ZABITÍ CACHE - NEXT.JS MUSÍ VŽDY NAČÍST NOVÁ DATA
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'GURU TWEAKY | The Hardware Guru',
  description: 'Ždímáme z tvýho hardwaru maximum. Návody, fixy na nedodělané porty, optimalizace FPS a úpravy configů pro nejnovější pecky.',
  alternates: {
    types: {
      'application/rss+xml': 'https://www.thehardwareguru.cz/rss.xml',
    },
  },
};

export default async function TweakyPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // TAHÁME REÁLNÁ DATA Z DATABÁZE
  const { data: tweaky, error } = await supabase
    .from('tweaky')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: 'sans-serif', 
      padding: '0 0 60px 0' 
    }}>
      
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '25px', 
        padding: '20px', 
        background: 'rgba(0,0,0,0.7)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap'
      }}>
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
          <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#eab308' }}>
            <Activity size={48} />
          </div>
          <h1 style={{ fontSize: '54px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            GURU <span style={{ color: '#eab308' }}>TWEAKY</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '20px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Ždímáme z tvýho hardwaru i ten poslední zbytek výkonu. Fixy na nedodělaný porty, odemčení FPS a úpravy configů.
          </p>
        </div>

        {error && (
          <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px', border: '1px solid #ef4444', borderRadius: '12px', marginBottom: '40px' }}>
            Chyba při načítání z databáze: {error.message}
          </div>
        )}

        {(!tweaky || tweaky.length === 0) && !error && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
            Zatím tu nejsou žádné tweaky. Běž do generátoru a nějaký vyrob!
          </div>
        )}

        {/* REÁLNÉ KARTY Z DATABÁZE */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '30px' 
        }}>
          {tweaky && tweaky.map((tweak) => (
            <Link 
              href={`/tweaky/${tweak.slug}`} 
              key={tweak.id} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                background: 'rgba(17, 19, 24, 0.85)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(234, 179, 8, 0.2)', 
                borderRadius: '28px', 
                padding: '35px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}>
                {tweak.image_url && (
                  <div style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={tweak.image_url} alt={tweak.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>
                  <Settings size={14} /> {tweak.category}
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '15px', lineHeight: '1.2' }}>
                  {tweak.title}
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, marginBottom: '25px' }}>
                  {tweak.description}
                </p>
                <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                  Otevřít návod →
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

const navItemStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const socialBtnStyle = (color) => ({
  color: color,
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '11px',
  border: `1px solid ${color}`,
  padding: '8px 16px',
  borderRadius: '12px',
  background: 'transparent'
});
