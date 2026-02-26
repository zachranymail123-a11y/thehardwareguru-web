'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SestavyBubble() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '30px',
      zIndex: 9999,
      maxWidth: '320px',
      animation: 'guruSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    }}>
      <style>{`
        @keyframes guruSlideUp {
          from { transform: translateY(150px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
          <strong style={{ color: '#66fcf1', fontSize: '1.1rem', letterSpacing: '1px' }}>GURU RADÍ:</strong>
        </div>
        <p style={{ color: '#e0e0e0', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
          Sekají se ti hry a tvůj PC už nestíhá? 🛠️ Nech si navrhnout <strong>brutální herní mašinu</strong>, která tě nenechá ve štychu!
        </p>
        <Link href="/sestavy" className="guru-btn" onClick={() => setIsVisible(false)}>
          CHCI HERNÍ BESTII →
        </Link>
      </div>
    </div>
  );
}
