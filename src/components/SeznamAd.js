'use client';
import { useEffect, useState } from 'react';

/**
 * GURU SMART AD COMPONENT V3.0
 * 🚀 CÍL: Nulová viditelnost fallbacku během načítání.
 * Fallback se vyrenderuje jen při potvrzeném zablokování po timeoutu.
 */
export default function SeznamAd({ zoneId, width, height }) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const initAd = () => {
      if (typeof window !== 'undefined' && window.ssp && window.ssp.getAds) {
        window.ssp.getAds([{
          zoneId: zoneId,
          id: `ssp-zone-${zoneId}`,
          width: width,
          height: height
        }]);

        // Kontrola po 3.5s - pokud je slot stále prázdný, aktivujeme fallback
        setTimeout(() => {
          const el = document.getElementById(`ssp-zone-${zoneId}`);
          if (el && el.innerHTML.trim().length === 0) {
            setShowFallback(true);
          }
        }, 3500);
      } else if (typeof window !== 'undefined') {
        // Pokud script ještě nedorazil, zkusíme to znovu
        setTimeout(initAd, 500);
      }
    };

    initAd();
  }, [zoneId, width, height]);

  return (
    <div style={{ 
      width: width ? `${width}px` : '100%', 
      height: height ? `${height}px` : 'auto',
      minHeight: showFallback ? '200px' : '0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 📺 Reklamní slot - čistý bez pozadí */}
      <div id={`ssp-zone-${zoneId}`} style={{ width: '100%', height: '100%', zIndex: 10 }} />
      
      {/* 🛡️ Fallback se vykreslí jen když je potřeba */}
      {showFallback && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 11, 13, 0.95)',
          zIndex: 5,
          textAlign: 'center',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 204, 0.1)'
        }}>
           <div style={{ color: '#00ffcc', fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
           <div style={{ fontWeight: '900', color: '#fff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
             AdBlock Detekován
           </div>
           <div style={{ fontSize: '11px', color: '#00ffcc', fontWeight: 'bold', marginTop: '2px' }}>
             The Hardware Guru
           </div>
           <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.4' }}>
             Podpoř Guru web a přidej si nás do výjimek.<br/>Díky! 🚀
           </p>
        </div>
      )}
    </div>
  );
}
