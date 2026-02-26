'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SestavyBubble() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Bublina vyskočí po 3 vteřinách, aby hned nešokovala
    const timer = setTimeout(() => setIsVisible(true), 3000);
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
      animation: 'slideUp 0.5s ease-out forwards',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .bubble-container {
          background: #1f2833;
          border: 2px solid #66fcf1;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 0 20px rgba(102, 252, 241, 0.4);
          position: relative;
        }
        .bubble-close {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #45a29e;
          cursor: pointer;
          background: none;
          border: none;
          font-size: 1.2rem;
        }
        .bubble-btn {
          display: block;
          width: 100%;
          padding: 10px;
          background: #66fcf1;
          color: #0b0c10;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
          border-radius: 5px;
          margin-top: 15px;
          transition: all 0.3s;
          text-transform: uppercase;
        }
        .bubble-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px #66fcf1;
        }
      `}</style>

      <div className="bubble-container">
        <button className="bubble-close" onClick={() => setIsVisible(false)}>×</button>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', background: '#0b0c10', borderRadius: '50%', border: '2px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{color: '#66fcf1', fontSize: '1rem', fontWeight: 'bold'}}>HG</span>
          </div>
          <strong style={{ color: '#66fcf1', fontSize: '1.1rem' }}>GURU RADÍ:</strong>
        </div>

        <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
          Tvoje FPS padají k zemi a PC se zadýchává? 🛠️ Nech si navrhnout <strong>herní sestavu pro rok 2026</strong>, která rozseká každou hru!
        </p>

        <Link href="/sestavy" className="bubble-btn">
          CHCI HERNÍ BESTII →
        </Link>
      </div>
    </div>
  );
}
