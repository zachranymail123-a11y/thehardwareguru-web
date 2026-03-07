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
    background: 'rgba(17, 19, 24, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #3b0764',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 0 50px rgba(168, 85, 247, 0.2)',
    textAlign: 'center'
  };

  const buttonStyle = (type) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: '0.3s',
    marginBottom: '10px',
    // Logika barvy podle typu tlačítka
    backgroundColor: type === 'revolut' ? '#0075eb' : type === 'affiliate' ? 'transparent' : '#ffffff',
    background: type === 'affiliate' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : undefined,
    color: type === 'revolut' ? '#ffffff' : type === 'affiliate' ? '#ffffff' : '#000000',
    boxShadow: type === 'affiliate' ? '0 4px 15px rgba(249, 115, 22, 0.4)' : 'none',
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
        {/* QR KÓD SEKCE */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ color: '#eab308', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
            {isEn ? "Quick QR payment (CZ)" : "Rychlá QR platba (CZ)"}
          </h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', display: 'inline-block', marginBottom: '10px' }}>
            <img 
              src="/qr-platba.png" 
              alt="QR Platba" 
              style={{ width: '220px', height: '220px', display: 'block' }} 
            />
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>{isEn ? "Account number:" : "Číslo účtu:"} 1269059093/0800</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{isEn ? "OR" : "NEBO"}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 🚀 GURU FIX: NATIVNÍ GOOGLE SUBSCRIBE TLAČÍTKO 🚀 */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '56px', width: '100%' }}>
            <button swg-standard-button="contribution" style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
          </div>
        </div>

        {/* STRIPE / KARTA */}
        <div style={{ marginBottom: '10px' }}>
          <a href={stripeLink} target="_blank" rel="noreferrer" style={buttonStyle('stripe')}>
            <span>💳</span> {isEn ? "Credit Card / Apple / Google Pay" : "Karta / Apple / Google Pay"}
          </a>
        </div>

        {/* REVOLUT */}
        <div style={{ marginBottom: '25px' }}>
          <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" style={buttonStyle('revolut')}>
            <span style={{ background: '#fff', color: '#0075eb', width: '20px', height: '20px', borderRadius: '50%', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</span> 
            Revolut.me
          </a>
          <p style={{ fontSize: '12px', color: '#60a5fa', marginTop: '10px' }}>@{revolutTag}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{isEn ? "OR" : "NEBO"}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 🚀 ČTVRTÁ MOŽNOST: GURU AFFILIATE NÁKUP HRY 🚀 */}
        <div>
          <a href={hrkLink} target="_blank" rel="nofollow sponsored" style={buttonStyle('affiliate')}
             onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}>
            🔥 {isEn ? "Buy a game for the best price" : "Koupit hru za nejlepší cenu"}
          </a>
        </div>

      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }}>
        FIXNÍ NÁKLADY: VERCEL HOSTING • DATABASE • DOMAIN • AUTO-SCRIPTS
      </div>
    </div>
  );
}
