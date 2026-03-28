'use client';
import { useEffect, useState } from 'react';

/**
 * GURU SMART AD COMPONENT V2.0
 * 🚀 CÍL: Zobrazení fallbacku POUZE pokud je reklama skutečně blokována.
 */
export default function SeznamAd({ zoneId, width, height }) {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkAd = () => {
      // 1. Kontrola, zda script ssp.js vůbec existuje
      if (typeof window !== 'undefined' && !window.ssp) {
        setIsBlocked(true);
        return;
      }

      // 2. Pokus o načtení reklamy
      if (window.ssp && window.ssp.getAds) {
        window.ssp.getAds([{
          zoneId: zoneId,
          id: `ssp-zone-${zoneId}`,
          width: width,
          height: height
        }]);

        // 3. Kontrola po 2 vteřinách - pokud je kontejner prázdný, zapneme fallback
        setTimeout(() => {
          const container = document.getElementById(`ssp-zone-${zoneId}`);
          if (container && container.innerHTML.trim() === "") {
            setIsBlocked(true);
          }
        }, 2000);
      }
    };

    checkAd();
  }, [zoneId, width, height]);

  return (
    <div style={{ 
      position: 'relative', 
      width: width ? `${width}px` : '100%', 
      height: height ? `${height}px` : 'auto', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      
      {/* 🛑 FALLBACK UI: Svítí JEN když isBlocked === true */}
      {isBlocked && (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'rgba(10, 11, 13, 0.95)',
          border: '1px solid rgba(0, 255, 204, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          zIndex: 1
        }}>
          <div style={{ color: '#00ffcc', fontSize: '20px', marginBottom: '12px' }}>🛡️</div>
          <div style={{ fontWeight: '900', color: '#fff', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AdBlock Detekován
          </div>
          <div style={{ fontSize: '10px', color: '#00ffcc', marginTop: '4px', fontWeight: 'bold' }}>
            The Hardware Guru
          </div>
          <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.4' }}>
            Podpoř nás a přidej si nás do výjimek.<br/>Díky! 🚀
          </p>
        </div>
      )}

      {/* 📺 REKLAMNÍ SLOT: Seznam sem vloží iframe */}
      <div 
        id={`ssp-zone-${zoneId}`} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          display: isBlocked ? 'none' : 'block',
          zIndex: 2 
        }} 
      />
    </div>
  );
}
