import React from 'react';
import Link from 'next/link';
import { Award, ChevronRight, Home, Cog } from 'lucide-react';

/**
 * GURU MAINTENANCE/NOT-FOUND V3.1 - CENTERED & COMPACT
 * 🚀 CÍL: Fix roztažení přes celou obrazovku a text o údržbě.
 */

export default function NotFound() {
  return (
    <div className="guru-maintenance-root" style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nf-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .nf-card { 
          background: rgba(17, 19, 24, 0.98); 
          backdrop-filter: blur(25px); 
          border: 2px solid rgba(234, 179, 8, 0.4); 
          border-radius: 32px; 
          padding: 50px 40px; 
          width: 100%; 
          textAlign: center; 
          box-shadow: 0 40px 100px rgba(0,0,0,0.9);
          box-sizing: border-box;
          animation: guruModalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .nf-icon-wrap {
          width: 80px; height: 80px;
          background: rgba(234, 179, 8, 0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 25px;
          border: 1px solid rgba(234, 179, 8, 0.3);
          color: #eab308;
        }

        .nf-h2 { 
          font-size: 22px; 
          font-weight: 950; 
          text-transform: uppercase; 
          margin: 0 0 15px 0; 
          color: #fff; 
          letter-spacing: 1px;
          line-height: 1.2;
        }

        .nf-p { 
          color: #9ca3af; 
          margin-bottom: 35px; 
          line-height: 1.6; 
          font-size: 15px; 
        }
        
        .guru-long-partner-btn {
          width: 100%; 
          background: linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(102, 252, 241, 0.1) 100%);
          border: 1px solid rgba(168, 85, 247, 0.5); 
          border-radius: 20px;
          padding: 20px 25px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          text-decoration: none; 
          transition: 0.3s;
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
          margin-bottom: 25px;
        }
        
        .guru-long-partner-btn:hover { 
          border-color: #a855f7; 
          transform: translateY(-2px); 
          background: rgba(168, 85, 247, 0.3); 
        }
        
        .p-btn-content { display: flex; align-items: center; gap: 15px; text-align: left; }
        .p-btn-text { display: flex; flex-direction: column; }
        .p-btn-main { color: #fff; font-weight: 950; font-size: 14px; text-transform: uppercase; }
        .p-btn-sub { color: #9ca3af; font-size: 11px; font-weight: 600; margin-top: 2px; }
        
        .back-home { 
          display: inline-flex; 
          align-items: center; 
          gap: 8px; 
          color: #9ca3af; 
          text-decoration: none; 
          font-weight: 900; 
          font-size: 12px; 
          text-transform: uppercase; 
          transition: 0.2s;
        }
        .back-home:hover { color: #fff; }

        @keyframes guruModalPop { from { transform: scale(0.95) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

        @media (max-width: 768px) {
          .nf-container { padding: 0 15px; }
          .nf-card { padding: 40px 20px; border-radius: 24px; }
          .nf-h2 { font-size: 18px; }
        }
      `}} />

      <div className="nf-container">
        <div className="nf-card">
          <div className="nf-icon-wrap">
            <Cog size={40} className="animate-spin-slow" style={{ animation: 'spin 4s linear infinite' }} />
          </div>
          
          <h2 className="nf-h2">Omlouváme se, ale na stránce právě probíhá údržba !!!</h2>
          
          <p className="nf-p">
            Ladíme výkon, abychom ti mohli sypat ta nejlepší hardware data bez lagů. 
            Zatímco pracujeme, můžeš se mrknout na prověřené komponenty u našich partnerů.
          </p>

          <Link href="/sestavy" className="guru-long-partner-btn">
            <div className="p-btn-content">
              <Award color="#a855f7" size={32} />
              <div className="p-btn-text">
                  <span className="p-btn-main">GURU PARTNEŘI</span>
                  <span className="p-btn-sub">Podpořte web nákupem přes tyto odkazy</span>
              </div>
            </div>
            <ChevronRight color="#a855f7" size={24} />
          </Link>

          <Link href="/" className="back-home">
            <Home size={16} /> ZPĚT NA HLAVNÍ STRANU
          </Link>
        </div>

        <div style={{ marginTop: '40px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
          Hardware Guru • System Optimization in progress
        </div>
      </div>
    </div>
  );
}

const containerStyle = { 
  backgroundColor: '#0a0b0d', 
  minHeight: '100vh', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontFamily: 'sans-serif', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover',
  backgroundAttachment: 'fixed',
  width: '100%',
  padding: '20px 0'
};
