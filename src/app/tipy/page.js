"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Home, Lightbulb, Book, PenTool, Newspaper } from 'lucide-react';
import Link from 'next/link';

// Tato direktiva vynutí, aby Next.js stránku pokaždé sestavil znovu (vyhne se shnilé cache)
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TipyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tipyData, setTipyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTipy() {
      // Přidáme náhodný parametr do dotazu, abychom obešli případnou cache v API volání
      const { data, error } = await supabase
        .from('tipy')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setTipyData(data);
      setLoading(false);
    }
    fetchTipy();
  }, []);

  const filteredTipy = tipyData.filter(tip => 
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tip.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '0 0 40px 0' 
    }}>
      
      {/* HLAVNÍ NAVIGACE */}
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
        <Link href="/tipy" style={{...navItemStyle, color: '#eab308'}}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={navItemStyle}><PenTool size={18} /> PRAKTICKÉ RADY</Link>
      </nav>

      <div style={{ padding: '40px 20px' }}>
        {/* SOCIAL BAR */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '40px' }}>
          <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
          <Link href="/support" style={socialBtnStyle('#eab308', true)}>SUPPORT</Link>
        </div>

        {/* SEARCH BOX */}
        <div style={{ maxWidth: '600px', margin: '0 auto 60px auto' }}>
          <input 
            type="text" 
            placeholder="Hledat v Guru databázi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '18px 25px', borderRadius: '20px',
              background: 'rgba(17, 19, 24, 0.9)', border: '2px solid #eab308',
              color: '#fff', fontSize: '16px', outline: 'none',
              boxShadow: '0 0 25px rgba(234, 179, 8, 0.15)'
            }}
          />
        </div>

        {/* GRID ČLÁNKŮ */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '35px' }}>
          {loading ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Načítám Guru vědomosti...</p> : 
            filteredTipy.map((tip) => (
            <article key={tip.id} style={{
              background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '28px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Link href={`/tipy/${tip.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Přidán unikátní timestamp, aby prohlížeč neukazoval starý prázdný náhled */}
                <img 
                  src={`${tip.image_url}?t=${new Date().getTime()}`} 
                  alt={tip.title} 
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }} 
                />
                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ color: '#eab308', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{tip.category}</span>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '12px 0' }}>{tip.title}</h2>
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 }}>{tip.description}</p>
                  <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '14px', marginBottom: tip.youtube_id ? '20px' : '0' }}>Číst celý návod →</div>
                </div>
              </Link>
              
              {tip.youtube_id && (
                <div style={{ padding: '0 25px 25px 25px' }}>
                  <a 
                    href={`https://www.youtube.com/watch?v=${tip.youtube_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={youtubeBtnStyle}
                  >
                    <span style={{ color: '#ff0000', fontSize: '18px' }}>▶</span>
                    <span style={{ fontSize: '13px' }}>Přehrát Video Návod</span>
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// STYLY
const navItemStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: '0.2s'
};

const socialBtnStyle = (color, isSupport = false) => ({
  color: color,
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '11px',
  border: `1px solid ${color}`,
  padding: '8px 16px',
  borderRadius: '12px',
  background: isSupport ? `${color}1a` : 'transparent'
});

const youtubeBtnStyle = {
  background: 'rgba(255, 0, 0, 0.1)', 
  borderRadius: '12px', 
  padding: '12px 15px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  gap: '10px', 
  border: '1px solid rgba(255, 0, 0, 0.3)',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 'bold',
  transition: 'all 0.3s ease'
};
