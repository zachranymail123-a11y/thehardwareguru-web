"use client";
import { useState } from 'react';
import { Search, Gamepad2, Zap, Tag, ExternalLink, Flame, TrendingDown, ShoppingBag } from 'lucide-react';

export default function GameSearchWidget({ isEn = false }) {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        desc: isEn ? 'Usually the best prices & instant delivery' : 'Většinou absolutně nejnižší cena',
        url: `https://www.instant-gaming.com/en/search/?q=${encodedGame}&igr=gamer-32df929`,
        color: '#ff6600',
        badge: 'TOP VOLBA',
        icon: <Zap size={22} />
      },
      {
        name: 'Gamivo',
        desc: isEn ? 'Huge catalog & software keys' : 'Největší výběr indie her a Windows',
        url: `https://www.gamivo.com/search/${encodedGame}?glv=d712zso6`,
        color: '#f36f21',
        badge: 'SUPER CENY',
        icon: <Gamepad2 size={22} />
      },
      {
        name: 'G2A',
        desc: isEn ? 'World\'s largest digital marketplace' : 'Největší digitální tržiště na světě',
        // 🔥 OPRAVENÝ G2A LINK PRO VYHLEDÁVÁNÍ 🔥
        url: `https://www.g2a.com/n/reflink-fa31d77ef6?search=${encodedGame}`,
        color: '#ff9900',
        badge: 'GIGANT NA TRHU',
        icon: <ShoppingBag size={22} />
      },
      {
        name: 'HRK Game',
        desc: isEn ? 'Frequent flash sales & bundles' : 'Časté bleskové slevy a akce',
        url: `https://www.hrkgame.com/en/games/products/?search=${encodedGame}#a_aid=TheHardwareGuru`,
        color: '#28b3ff',
        badge: 'BLESKOVÉ AKCE',
        icon: <Tag size={22} />
      }
    ];
  };

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(145deg, #111216 0%, #0a0b0d 100%)',
      borderRadius: '24px',
      border: '1px solid rgba(102, 252, 241, 0.15)',
      padding: '35px 25px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(102, 252, 241, 0.03)',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '150%', height: '150%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 14px', borderRadius: '20px', color: '#ef4444', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', marginBottom: '15px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <Flame size={16} /> {isEn ? 'Extreme discounts' : 'Extrémní slevy pro pařany'}
          </div>
          <h3 style={{ color: '#fff', fontSize: '32px', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0', background: 'linear-gradient(90deg, #fff 0%, #66fcf1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>
            {isEn ? 'GURU GAME DEAL FINDER' : 'GURU VYHLEDÁVAČ SLEV'}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: '500' }}>
            {isEn ? 'Stop overpaying. Find the absolute cheapest keys for games, Windows, and Office.' : 'Neplať plnou pálku. Najdi absolutně nejlevnější klíče na hry, Windows a Office.'}
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: hasSearched ? '30px' : '10px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={24} color="#66fcf1" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isEn ? "Search for a game (e.g., Cyberpunk 2077...)" : "Zadej název (např. Cyberpunk 2077...)"}
              style={{ width: '100%', padding: '22px 20px 22px 60px', borderRadius: '16px', border: '2px solid rgba(102, 252, 241, 0.2)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '18px', fontWeight: 'bold', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.5)' }}
            />
          </div>
          <button type="submit" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{ background: isHovered ? 'linear-gradient(90deg, #a855f7 0%, #d946ef 100%)' : 'linear-gradient(90deg, #7e22ce 0%, #a855f7 100%)', color: '#fff', border: 'none', padding: '20px 30px', borderRadius: '16px', fontWeight: '950', fontSize: '18px', cursor: 'pointer', transition: 'all 0.3s ease', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <TrendingDown size={24} /> {isEn ? 'FIND THE LOWEST PRICE' : 'ZJISTIT NEJNIŽŠÍ CENU'}
          </button>
        </form>

        {hasSearched && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {getAffiliateLinks(query).map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="nofollow sponsored" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 25px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${link.color}30`, borderRadius: '16px', textDecoration: 'none', transition: '0.2s', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: link.color }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: `${link.color}15`, padding: '14px', borderRadius: '14px', color: link.color }}>{link.icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ color: '#fff', fontWeight: '950', fontSize: '19px' }}>{link.name}</span>
                      {link.badge && <span style={{ background: index === 0 ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', fontWeight: '950', padding: '3px 10px', borderRadius: '10px' }}>{link.badge}</span>}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>{link.desc}</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', display: 'flex' }}><ExternalLink size={20} color="#fff" /></div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
