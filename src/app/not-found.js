import React from 'react';
import Link from 'next/link';
import { Award, ChevronRight, Home, Cog } from 'lucide-react';
import HeurekaLink from '../components/HeurekaLink'; // 🔥 NOVÝ IMPORT

export default function NotFound() {
  return (
    <div className="guru-maintenance-root" style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nf-container { width: 100%; max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
        .nf-card { 
          background: rgba(17, 19, 24, 0.98); backdrop-filter: blur(25px); 
          border: 2px solid rgba(234, 179, 8, 0.4); border-radius: 32px; 
          padding: 50px 40px; width: 100%; textAlign: center; box-sizing: border-box;
          animation: guruModalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .guru-long-partner-btn {
          width: 100%; background: linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(102, 252, 241, 0.1) 100%);
          border: 1px solid rgba(168, 85, 247, 0.5); border-radius: 20px;
          padding: 20px 25px; display: flex; align-items: center; justify-content: space-between;
          text-decoration: none; transition: 0.3s; box-shadow: 0 15px 40px rgba(0,0,0,0.4);
          margin-bottom: 20px;
        }
        .heureka-wrapper { margin-bottom: 30px; width: 100%; }
        .heureka-hn-link:hover { background: #fff !important; color: #000 !important; transform: translateY(-2px); }
      `}} />

      <div className="nf-container">
        <div className="nf-card">
          <div style={{ marginBottom: '25px', color: '#eab308' }}><Cog size={40} style={{ animation: 'spin 4s linear infinite' }} /></div>
          <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#fff', marginBottom: '15px' }}>ÚDRŽBA SYSTÉMU !!!</h2>
          <p style={{ color: '#9ca3af', marginBottom: '35px', fontSize: '15px' }}>Právě optimalizujeme databázi pro tvůj maximální výkon.</p>

          <Link href="/sestavy" className="guru-long-partner-btn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
              <Award color="#a855f7" size={32} />
              <div>
                  <div style={{ color: '#fff', fontWeight: '950', fontSize: '14px' }}>GURU PARTNEŘI</div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>Prověřené komponenty skladem</div>
              </div>
            </div>
            <ChevronRight color="#a855f7" size={24} />
          </Link>

          {/* 🔥 HEUREKA AFFILIATE SLOT */}
          <div className="heureka-wrapper">
             <HeurekaLink />
          </div>

          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: '900', fontSize: '12px' }}>
            <Home size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> ZPĚT NA ZÁKLADNU
          </Link>
        </div>
      </div>
    </div>
  );
}

const containerStyle = { backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', width: '100%' };
