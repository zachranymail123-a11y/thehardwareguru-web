import React from 'react';

/**
 * GURU HEUREKA LINK V1.0
 * 🚀 CÍL: Dynamický affiliate odkaz na Heureku dle tvého nastavení.
 * 💰 Kampan: 25842 | Pozice: 276027
 */

export default function HeurekaLink({ 
  type = "procesor", 
  text = "👉 💰 Procesory za nejnižší ceny",
  className = "" 
}) {
  // UTM parametry z tvého screenshotu
  const utm = "utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const url = `https://www.heureka.cz/?h%5Bfraze%5D=${type}#${utm}`;

  return (
    <a 
      href={url}
      className={`heureka-hn-link ${className}`}
      data-trixam-positionid="276027"
      target="_blank"
      rel="noopener noreferrer sponsored"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '700',
        fontSize: '14px',
        transition: '0.2s'
      }}
    >
      {text}
    </a>
  );
}
