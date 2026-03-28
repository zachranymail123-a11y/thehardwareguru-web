'use client';
import { useEffect, useState, useId } from 'react';

export default function SeznamAd({ zoneId, width, height }) {
  const [showFallback, setShowFallback] = useState(false);
  
  // 🚀 UNIKÁTNÍ ID pro každý render, aby Seznam script nespadl při dvou stejných zoneId
  const rawId = useId().replace(/:/g, '');
  const uniqueId = `ssp-zone-${zoneId}-${rawId}`;

  useEffect(() => {
    const initAd = () => {
      if (typeof window !== 'undefined' && window.ssp && window.ssp.getAds) {
        window.ssp.getAds([{
          zoneId: zoneId,
          id: uniqueId,
          width: width,
          height: height
        }]);

        setTimeout(() => {
          const el = document.getElementById(uniqueId);
          if (el && el.innerHTML.trim().length === 0) {
            setShowFallback(true);
          }
        }, 3500);
      } else if (typeof window !== 'undefined') {
        setTimeout(initAd, 500);
      }
    };

    initAd();
  }, [zoneId, width, height, uniqueId]);

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
      <div id={uniqueId} style={{ width: '100%', height: '100%', zIndex: 10 }} />
      
      {showFallback && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 11, 13, 0.95)', 
          zIndex: 5, textAlign: 'center', padding: '15px', borderRadius: '8px', 
          border: '1px solid rgba(0, 255, 204, 0.1)'
        }}>
           <div style={{ color: '#00ffcc', fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
           <div style={{ fontWeight: '900', color: '#fff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>AdBlock Detekován</div>
           <div style={{ fontSize: '11px', color: '#00ffcc', fontWeight: 'bold', marginTop: '2px' }}>The Hardware Guru</div>
        </div>
      )}
    </div>
  );
}
