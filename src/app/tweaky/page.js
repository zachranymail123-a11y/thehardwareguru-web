"use client";
import React, { useState } from 'react';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Settings, Wrench, Activity } from 'lucide-react';
import Link from 'next/link';

export default function TweakyPage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Ukázková data pro články z PCGamingWiki
  const tweaky = [
    {
      id: 1,
      title: "Resident Evil Requiem",
      category: "FPS Boost & FOV Fix",
      desc: "Jak odemknout zorné pole v první osobě a opravit DLSS 4 stuttering při přepínání postav.",
      slug: "resident-evil-requiem"
    },
    {
      id: 2,
      title: "Grand Theft Auto VI (PC)",
      category: "Optimalizace",
      desc: "Snižujeme zátěž na procesor v centru Vice City. Která nastavení můžeš stáhnout bez ztráty kvality.",
      slug: "gta-6-pc-optimalizace"
    },
    {
      id: 3,
      title: "Kingdom Come: Deliverance II",
      category: "CryEngine Tweaky",
      desc: "Úprava configu pro lepší načítání textur a fix na propady FPS v hustých lesích a městech.",
      slug: "kcd-2-fps-fix"
    }
  ];

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
      
      {/* HLAVNÍ NAVIGACE V GURU STYLU */}
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
        
        {/* SOCIAL BAR S TVÝMI ODKAZY */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '60px' }}>
          <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
        </div>

        {/* HLAVIČKA SEKCE */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#eab308' }}>
            <Activity size={48} />
          </div>
          <h1 style={{ fontSize: '54px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            GURU <span style={{ color: '#eab308' }}>TWEAKY</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '20px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Ždímáme z tvýho hardwaru i ten poslední zbytek výkonu. Fixy na zkurvený porty, odemčení FPS a úpravy configů.
          </p>
        </div>

        {/* GRID S KARTAMI (Tmavé sklo, zaoblení 28px) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '30px' 
        }}>
          {tweaky.map((tweak) => (
            <Link 
              href={`/tweaky/${tweak.slug}`} 
              key={tweak.id} 
              style={{ textDecoration: 'none', color: 'inherit' }}
              onMouseEnter={() => setHoveredCard(tweak.id)}
              onMouseLeave={() => setHoveredCard(null)}
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
                transition: 'all 0.3s ease',
                transform: hoveredCard === tweak.id ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hoveredCard === tweak.id ? '0 10px 30px rgba(234, 179, 8, 0.15)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>
                  <Settings size={14} /> {tweak.category}
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '15px', lineHeight: '1.2' }}>
                  {tweak.title}
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, marginBottom: '25px' }}>
                  {tweak.desc}
                </p>
                <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                  Otevřít návod →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* DISCLAIMER PRO PCGAMINGWIKI */}
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#666', fontSize: '12px', fontStyle: 'italic' }}>
          <p>Guru Tweaky staví na rešerších technických dat a řešení z komunitních zdrojů jako je PCGamingWiki.</p>
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
