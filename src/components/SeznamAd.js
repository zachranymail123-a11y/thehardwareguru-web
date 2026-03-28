'use client';
import { useEffect } from 'react';

export default function SeznamAd({ zoneId, width, height }) {
  useEffect(() => {
    const callSsp = () => {
      if (typeof window !== 'undefined' && window.ssp && window.ssp.getAds) {
        window.ssp.getAds([{
          zoneId: zoneId,
          id: `ssp-zone-${zoneId}`,
          width: width,
          height: height
        }]);
      } else {
        // Pokud script ještě nedorazil, zkusíme to za chvíli znovu
        setTimeout(callSsp, 500);
      }
    };
    callSsp();
  }, [zoneId, width, height]);

  return (
    <div className="guru-ad-fallback" style={{ 
      width: width ? `${width}px` : '100%', 
      height: height ? `${height}px` : '250px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* 📺 Tady se vykreslí Seznam Iframe */}
      <div 
        id={`ssp-zone-${zoneId}`} 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 10, /* Reklama je vždy nahoře */
          background: 'transparent' 
        }} 
      />
      
      {/* 🛡️ Fallback, který je vidět jen když je reklama průhledná (AdBlock) */}
      <div style={{ textAlign: 'center', padding: '10px', zIndex: 1 }}>
        <div style={{ color: '#00ffcc', fontSize: '18px' }}>🛡️</div>
        <div style={{ fontWeight: '900', color: '#fff', fontSize: '11px', textTransform: 'uppercase' }}>AdBlock Detekován</div>
        <div style={{ fontSize: '10px', color: '#9ca3af' }}>Podpoř Guru web. Díky! 🚀</div>
      </div>
    </div>
  );
}
