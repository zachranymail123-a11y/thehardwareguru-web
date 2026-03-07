'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- BEZPEČNÉ NAČÍTÁNÍ NEXT.JS MODULŮ (PROTI PÁDU V NÁHLEDU) ---
let usePathname = () => '';
try {
  const nextNav = require('next/navigation');
  usePathname = nextNav.usePathname;
} catch (e) {
  // Silent catch
}

export default function SestavyBubble() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Hydration fix & timer
  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const timer = setTimeout(() => setIsVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // 🚀 GURU JAZYKOVÁ LOGIKA
  let pathname = '';
  try { pathname = usePathname() || ''; } catch (e) {}
  const isEn = (pathname || currentPath).startsWith('/en');

  if (!isVisible) return null;

  return (
    <div className="guru-bubble-container">
      <style>{`
        @keyframes guruSlideUp {
          from { transform: translateY(150px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* Desktop Default */
        .guru-bubble-container {
          position: fixed;
          bottom: 30px;
          left: 30px;
          z-index: 998; /* Nižší než support widget, aby se nepraly, ale nad obsahem */
          max-width: 320px;
          animation: guruSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* 🔥 MOBILE OPTIMIZATION 🔥 */
        @media (max-width: 768px) {
          .guru-bubble-container {
            bottom: 90px; /* Posuneme výš, aby bublina nepřekážela raketce SupportWidgetu dole vpravo */
            left: 15px;
            right: 15px; /* Roztáhne se s okrajem */
            max-width: calc(100vw - 30px);
          }
        }

        .guru-bubble {
          background: rgba(31, 40, 51, 0.98);
          border: 2px solid #66fcf1;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 0 25px rgba(102, 252, 241, 0.3);
          position: relative;
          backdrop-filter: blur(10px);
        }
        .guru-close {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #45a29e;
          cursor: pointer;
          background: none;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
        }
        .guru-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background: #66fcf1;
          color: #0b0c10;
          text-align: center;
          text-decoration: none;
          font-weight: 900;
          border-radius: 6px;
          margin-top: 15px;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .guru-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(102, 252, 241, 0.5);
          background: #fff;
        }
      `}</style>

      <div className="guru-bubble">
        <button className="guru-close" onClick={() => setIsVisible(false)}>×</button>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
          <div style={{ width: '45px', height: '45px', background: '#0b0c10', borderRadius: '50%', border: '2px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{color: '#66fcf1', fontSize: '1.2rem', fontWeight: 'bold'}}>HG</span>
          </div>
          <strong style={{ color: '#66fcf1', fontSize: '1.1rem', letterSpacing: '1px' }}>
            {isEn ? 'GURU ADVICE:' : 'GURU RADÍ:'}
          </strong>
        </div>
        <p style={{ color: '#e0e0e0', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
          {isEn ? (
            <>Is your PC struggling with new games? 🛠️ Let us design a <strong>brutal gaming machine</strong> that won't let you down!</>
          ) : (
            <>Sekají se ti hry a tvůj PC už nestíhá? 🛠️ Nech si navrhnout <strong>brutální herní mašinu</strong>, která tě nenechá ve štychu!</>
          )}
        </p>
        <Link href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-btn" onClick={() => setIsVisible(false)}>
          {isEn ? 'I WANT A GAMING BEAST →' : 'CHCI HERNÍ BESTII →'}
        </Link>
      </div>
    </div>
  );
}
