import React from 'react';
import Link from 'next/link';
import { Award, ChevronRight, Home, ShieldAlert } from 'lucide-react';

/**
 * GURU NOT-FOUND V3.0 - CONVERSION ENGINE
 * 🚀 CÍL: Turn error 404 into affiliate revenue.
 */

export default function NotFound() {
  return (
    <div className="guru-not-found-root" style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nf-card { 
          background: rgba(17, 19, 24, 0.95); 
          backdrop-filter: blur(15px); 
          border: 2px solid rgba(234, 179, 8, 0.3); 
          border-radius: 32px; 
          padding: 60px 40px; 
          maxWidth: 550px; 
          width: 100%; 
          textAlign: center; 
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          animation: guruModalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .nf-h1 { font-size: 100px; font-weight: 950; margin: 0; color: #eab308; line-height: 1; letter-spacing: -5px; }
        .nf-h2 { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 20px 0; color: #fff; letter-spacing: 1px; }
        .nf-p { color: #9ca3af; margin-bottom: 40px; line-height: 1.6; font-size: 16px; }
        
        /* 🔥 STRATEGICKÝ GURU PARTNER BUTTON */
        .guru-long-partner-btn {
          width: 100%; 
          background: linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(102, 252, 241, 0.1) 100%);
          border: 1px solid rgba(168, 85, 247, 0.5); 
          border-radius: 20px;
          padding: 22px 28px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          text-decoration: none; 
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
          margin-bottom: 25px;
        }
        
        .guru-long-partner-btn:hover { 
          border-color: #a855f7; 
          transform: translateY(-3px) scale(1.02); 
          background: rgba(168, 85, 247, 0.3); 
        }
        
        .p-btn-content { display: flex; align-items: center; gap: 18px; text-align: left; }
        .p-btn-text { display: flex; flex-direction: column; }
        .p-btn-main { color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .p-btn-sub { color: #9ca3af; font-size: 11px; font-weight: 600; margin-top: 3px; }
        
        .back-home { 
          display: inline-flex; 
          align-items: center; 
          gap: 10px; 
          color: #9ca3af; 
          text-decoration: none; 
          font-weight: 900; 
          font-size: 13px; 
          text-transform: uppercase; 
          transition: 0.3s;
          padding: 10px 20px;
          border-radius: 12px;
        }
        .back-home:hover { color: #fff; background: rgba(255,255,255,0.05); }

        @keyframes guruModalPop { from { transform: scale(0.9) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

        @media (max-width: 768px) {
          .nf-card { padding: 40px 20px; border-radius: 24px; margin: 15px; }
          .nf-h1 { font-size: 70px; }
          .nf-h2 { font-size: 18px; }
          .p-btn-main { font-size: 13px; }
        }
      `}} />

      <div className="nf-card">
        <div className="nf-h1">404</div>
        <div className="nf-h2">Systémová chyba: Hardware nenalezen</div>
        <p className="nf-p">
          Tahle adresa v databázi neexistuje. Pravděpodobně jsi narazil na mrtvý spoj. 
          Ale nezoufej, špičkový hardware za nejlepší ceny najdeš u našich partnerů.
        </p>

        {/* 🔥 HLAVNÍ KONVERZNÍ BOD */}
        <Link href="/sestavy" className="guru-long-partner-btn">
          <div className="p-btn-content">
            <Award color="#a855f7" size={36} />
            <div className="p-btn-text">
                <span className="p-btn-main">NAŠI PROVĚŘENÍ PARTNEŘI</span>
                <span className="p-btn-sub">Nákupem přes tyto odkazy podpoříte provoz webu</span>
            </div>
          </div>
          <ChevronRight color="#a855f7" size={28} />
        </Link>

        <Link href="/" className="back-home">
          <Home size={18} /> ZPĚT NA ZÁKLADNU
        </Link>
      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>
        The Hardware Guru • Mission: Build the best database
      </div>
    </div>
  );
}

const containerStyle = { 
  backgroundColor: '#0a0b0d', 
  minHeight: '100vh', 
  display: 'flex', 
  flexDirection: 'column',
  alignItems: 'center', 
  justifyContent: 'center', 
  padding: '20px', 
  fontFamily: 'sans-serif', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover',
  backgroundAttachment: 'fixed',
  width: '100%',
  boxSizing: 'border-box'
};
