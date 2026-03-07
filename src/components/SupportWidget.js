"use client";
import React, { useState, useEffect } from 'react';

// --- BEZPEČNÉ NAČÍTÁNÍ NEXT.JS MODULŮ (PROTI PÁDU V NÁHLEDU) ---
let usePathname = () => '';
try {
  const nextNav = require('next/navigation');
  usePathname = nextNav.usePathname;
} catch (e) {
  // Silent catch pro Canvas
}

export default function SupportPage() {
  // 🚀 GURU JAZYKOVÁ LOGIKA S OCHRANOU
  const [currentPath, setCurrentPath] = useState('');
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  let pathname = '';
  try { pathname = usePathname() || ''; } catch (e) {}

  const isEn = (pathname || currentPath).startsWith('/en');

  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";
  const hrkLink = "https://www.hrkgame.com/#a_aid=TheHardwareGuru";

  const containerStyle = {
    backgroundColor: '#0a0b0d',
    color: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    fontFamily: 'sans-serif',
    backgroundImage: 'url("/bg-guru.png")',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed'
  };

  const cardStyle = {
    background: 'rgba(17, 19, 24, 0.95)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: '32px',
    padding: '40px',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
    textAlign: 'center'
  };

  // 🚀 GURU UNIFIED BUTTON SYSTEM
  const buttonStyle = (type) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    padding: '18px 24px',
    borderRadius: '18px',
    textDecoration: 'none',
    fontWeight: '900',
    fontSize: '15px',
    transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    marginBottom: '12px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    // Barevná logika pro maximální vizuální sílu
    backgroundColor: type === 'affiliate' ? 'transparent' : '#161920',
    background: type === 'affiliate' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : undefined,
    color: '#ffffff',
    boxShadow: type === 'affiliate' 
      ? '0 10px 25px rgba(249, 115, 22, 0.4)' 
      : '0 8px 20px rgba(0,0,0,0.4)',
  });

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#eab308', fontSize: '14px', letterSpacing: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {isEn ? "PROJECT SUPPORT" : "PODPORA PROJEKTU"}
        </h2>
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '900', margin: '10px 0', letterSpacing: '-1px' }}>
          {isEn ? "FEEDING THIS " : "KRMÍŠ TENHLE "} <span style={{ color: '#eab308' }}>{isEn ? "MACHINE" : "STROJ"}</span>
        </h1>
        <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '20px auto', fontSize: '15px', lineHeight: '1.6' }}>
          {isEn ? (
            <>Hardware Guru was born out of pure passion for technology. My goal is to build a place free of paid ads. Contributions help cover the costs of <strong>high-speed servers, data streams, and tool licensing</strong>. Thanks for keeping the Guru running!</>
          ) : (
            <>Hardware Guru vznikl z čisté vášně pro technologie. Mým cílem je vybudovat místo bez nánosu placených reklam. Příspěvky pomáhají pokrýt náklady na <strong>vysokorychlostní servery, datové toky a licencování nástrojů</strong>. Díky, že držíš Guru v běhu!</>
          )}
        </p>
      </div>

      <div style={cardStyle}>
        <style>{`
          .guru-btn-hover:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.1); border-color: rgba(234, 179, 8, 0.4); }
          /* Úprava pro Google tlačítko aby zmizelo pozadí iframe */
          button[swg-standard-button] { width: 100% !important; }
        `}</style>

        {/* QR KÓD SEKCE */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ color: '#eab308', marginBottom: '18px', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {isEn ? "Quick QR payment (CZ)" : "Rychlá QR platba (CZ)"}
          </h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '24px', display: 'inline-block', marginBottom: '12px', boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
            <img 
              src="/qr-platba.png" 
              alt="QR Platba" 
              style={{ width: '220px', height: '220px', display: 'block' }} 
            />
          </div>
          <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>{isEn ? "Account number:" : "Číslo účtu:"} 1269059093/0800</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{isEn ? "OR" : "NEBO"}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 🚀 1. MOŽNOST: GOOGLE SUBSCRIBE 🚀 */}
        <div style={{ marginBottom: '12px' }}>
          <div className="guru-btn-hover" style={buttonStyle('google')}>
            {/* Obal pro Google skript, který zachovává Guru styl */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '24px' }}>
               <button swg-standard-button="contribution" style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
            </div>
          </div>
        </div>

        {/* 🚀 2. MOŽNOST: STRIPE / KARTA 🚀 */}
        <div style={{ marginBottom: '12px' }}>
          <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-btn-hover" style={buttonStyle('stripe')}>
            <span style={{ fontSize: '20px' }}>💳</span> {isEn ? "Credit Card / Apple / Google Pay" : "Karta / Apple / Google Pay"}
          </a>
        </div>

        {/* 🚀 3. MOŽNOST: REVOLUT 🚀 */}
        <div style={{ marginBottom: '25px' }}>
          <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-btn-hover" style={buttonStyle('revolut')}>
            <span style={{ background: '#fff', color: '#0075eb', width: '22px', height: '22px', borderRadius: '50%', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'black' }}>R</span> 
            Revolut.me
          </a>
          <p style={{ fontSize: '11px', color: '#60a5fa', marginTop: '10px', fontWeight: '900', letterSpacing: '1px' }}>@{revolutTag}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{isEn ? "OR" : "NEBO"}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 🚀 4. MOŽNOST: GURU AFFILIATE NÁKUP HRY 🚀 */}
        <div>
          <a href={hrkLink} target="_blank" rel="nofollow sponsored" className="guru-btn-hover" style={buttonStyle('affiliate')}>
            <span style={{ fontSize: '20px' }}>🔥</span> {isEn ? "Buy a game for the best price" : "Koupit hru za nejlepší cenu"}
          </a>
        </div>

      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }}>
        FIXNÍ NÁKLADY: VERCEL HOSTING • DATABASE • DOMAIN • AUTO-SCRIPTS
      </div>
    </div>
  );
}
