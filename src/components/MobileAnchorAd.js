'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SeznamAd from './SeznamAd'; // Bere tvoji existující Seznam komponentu

export default function MobileAnchorAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Zobrazit pouze na mobilech a s malým zpožděním (UX a SEO friendly)
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        setTimeout(() => setIsVisible(true), 2500); 
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isVisible || isClosed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      zIndex: 9999,
      background: 'rgba(10, 11, 13, 0.95)',
      borderTop: '1px solid rgba(102, 252, 241, 0.3)',
      boxShadow: '0 -10px 30px rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '5px 0',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Zavírací křížek (Nutnost pro tvoji cílovku, jinak tě sežerou) */}
      <button 
        onClick={() => setIsClosed(true)}
        style={{
          position: 'absolute',
          top: '-28px',
          right: '10px',
          background: 'rgba(10, 11, 13, 0.9)',
          border: '1px solid rgba(102, 252, 241, 0.3)',
          color: '#9ca3af',
          borderRadius: '50%',
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          padding: 0
        }}
        aria-label="Zavřít reklamu"
      >
        <X size={16} />
      </button>

      {/* Samotná reklama s tvým novým ID 408678 */}
      <div style={{ width: '320px', height: '100px', overflow: 'hidden' }}>
        <SeznamAd zoneId={408678} width={320} height={100} />
      </div>
    </div>
  );
}
