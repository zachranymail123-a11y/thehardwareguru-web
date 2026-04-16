"use client";
import { useState } from 'react';
import { Search, Gamepad2, Zap, Tag, ExternalLink } from 'lucide-react';

export default function GameSearchWidget({ isEn = false }) {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      setHasSearched(true);
    }
  };

  const getAffiliateLinks = (gameName) => {
    const encodedGame = encodeURIComponent(gameName);
    return [
      {
        name: 'Instant Gaming',
        desc: isEn ? 'Usually the best prices' : 'Většinou nejlepší ceny',
        url: `https://www.instant-gaming.com/en/search/?q=${encodedGame}&igr=gamer-32df929`,
        color: '#ff6600',
        icon: <Zap size={18} />
      },
      {
        name: 'Gamivo',
        desc: isEn ? 'Huge indie & software catalog' : 'Obrovský výběr her a SW',
        url: `https://www.gamivo.com/search/${encodedGame}?glv=d712zso6`,
        color: '#f36f21',
        icon: <Gamepad2 size={18} />
      },
      {
        name: 'HRK Game',
        desc: isEn ? 'Frequent flash sales' : 'Časté bleskové slevy',
        url: `https://www.hrkgame.com/en/games/products/?search=${encodedGame}#a_aid=TheHardwareGuru`,
        color: '#28b3ff',
        icon: <Tag size={18} />
      }
    ];
  };

  return (
    <div style={{ background: '#111216', borderRadius: '16px', border: '1px solid rgba(102, 252, 241, 0.1)', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
          {isEn ? 'GURU Game Deal Finder' : 'GURU Vyhledávač Slev'}
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
          {isEn ? 'Find the cheapest keys for games and software (Windows, Office).' : 'Najdi nejlevnější klíče na hry i software (Windows, Office).'}
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: hasSearched ? '20px' : '0' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="#6b7280" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isEn ? "e.g. Cyberpunk 2077, Windows 11..." : "např. Cyberpunk 2077, Windows 11..."}
            style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0b0d', color: '#fff', fontSize: '16px', outline: 'none' }}
          />
        </div>
        <button type="submit" style={{ background: '#66fcf1', color: '#0a0b0d', border: 'none', padding: '0 25px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s' }} className="hover-scale">
          {isEn ? 'SEARCH' : 'HLEDAT'}
        </button>
      </form>

      {hasSearched && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: '#66fcf1', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '5px' }}>
            {isEn ? `Check prices for: ${query}` : `Ověřit ceny pro: ${query}`}
          </div>
          
          {getAffiliateLinks(query).map((link, index) => (
            <a 
              key={index}
              href={link.url}
              target="_blank"
              rel="nofollow sponsored"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', textDecoration: 'none', transition: '0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: link.color }}>{link.icon}</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{link.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '12px' }}>{link.desc}</div>
                </div>
              </div>
              <ExternalLink size={18} color="#6b7280" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
