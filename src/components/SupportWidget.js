"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  // 🚀 GURU JAZYKOVÁ LOGIKA
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";

  return (
    <div style={{ position: 'fixed', bottom: '110px', right: '20px', zIndex: 9999, fontFamily: 'sans-serif' }}>
      
      {/* --- Hlavní klikací plocha --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0', transition: 'transform 0.3s ease'
        }}
      >
        {/* Štítek s jasným CTA (ZLATÝ STYL) */}
        {!isOpen && (
          <div className="support-label" style={{
            color: '#fff',
            background: 'rgba(234, 179, 8, 0.1)',
            border: '2px solid #eab308',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '13px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)',
            whiteSpace: 'nowrap'
          }}>
            {isEn ? 'Support Guru ⚡' : 'Podpořit Guru ⚡'}
          </div>
        )}

        {/* Raketka (ZLATÝ GRADIENT) */}
        <div style={{
          width: '55px', height: '55px', borderRadius: '50%',
          background: 'linear-gradient(45deg, #eab308, #ca8a04)',
          boxShadow: '0 0 25px rgba(234, 179, 8, 0.5)',
          fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isOpen ? '✕' : '🚀'}
        </div>
      </button>

      {/* --- Menu podpory --- */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '70px', right: '0',
          width: '280px', backgroundColor: '#111318', border: '2px solid #eab308',
          borderRadius: '20px', padding: '20px', boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
          animation: 'fadeIn 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '15px', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' }}>
            {isEn ? 'Feeding this ' : 'Krmíš tenhle '} <span style={{ color: '#eab308' }}>{isEn ? 'machine?' : 'stroj?'}</span>
          </h4>
          
          <p style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center', marginBottom: '18px', lineHeight: '1.4' }}>
            {isEn 
              ? 'Your contribution covers fixed hosting, server, and infrastructure costs.' 
              : 'Tvůj příspěvek jde na fixní náklady hostingu, serverů a infrastruktury webu.'}
          </p>

          {/* Tlačítko na QR platbu / Stránku Support */}
          <Link href={isEn ? "/en/support" : "/support"} onClick={() => setIsOpen(false)} style={{
            display: 'block', backgroundColor: '#eab308', color: '#000',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px',
            transition: '0.2s'
          }}>
            🤳 {isEn ? 'QR / Bank Transfer (CZ)' : 'QR Platba / Převod (CZ)'}
          </Link>

          <a href={stripeLink} target="_blank" style={{
            display: 'block', backgroundColor: '#fff', color: '#000',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px'
          }}>
            💳 Karta / Apple / Google Pay
          </a>

          <a href={`https://revolut.me/${revolutTag}`} target="_blank" style={{
            display: 'block', backgroundColor: '#0075eb', color: '#fff',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px'
          }}>
            <span style={{ background: '#fff', color: '#0075eb', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', marginRight: '6px' }}>R</span> 
            Revolut Me
          </a>

          {/* 🚀 ČTVRTÁ MOŽNOST: GURU AFFILIATE NÁKUP HRY 🚀 */}
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" style={{
            display: 'block', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: '900', fontSize: '14px',
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
          }}>
            🔥 {isEn ? 'Buy a game for the best price' : 'Koupit hru za nejlepší cenu'}
          </a>
        </div>
      )}

      {/* --- Styl animací --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(234, 179, 8, 0); }
          100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
        }
        .support-label {
          animation: pulse-border 2s infinite;
        }
      `}} />
    </div>
  );
}
