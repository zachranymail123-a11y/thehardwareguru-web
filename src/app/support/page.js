import React from 'react';

export default function SupportPage() {
  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";

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

  const buttonStyle = (isRevolut) => ({
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
    backgroundColor: isRevolut ? '#0075eb' : '#ffffff',
    color: isRevolut ? '#ffffff' : '#000000',
  });

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#eab308', fontSize: '14px', letterSpacing: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>PODPORA PROJEKTU</h2>
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '900', margin: '10px 0', letterSpacing: '-1px' }}>KRMÍŠ TENHLE <span style={{ color: '#eab308' }}>STROJ</span></h1>
        <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '20px auto', fontSize: '15px', lineHeight: '1.6' }}>
          Hardware Guru vznikl z čisté vášně pro technologie. Mým cílem je vybudovat místo bez nánosu placených reklam. 
          Příspěvky pomáhají pokrýt náklady na <strong>vysokorychlostní servery, datové toky a licencování nástrojů</strong>. 
          Díky, že držíš Guru v běhu!
        </p>
      </div>

      <div style={cardStyle}>
        {/* QR KÓD SEKCE */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ color: '#eab308', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Rychlá QR platba (CZ)</h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', display: 'inline-block', marginBottom: '10px' }}>
            <img 
              src="/qr-platba.png" 
              alt="QR Platba" 
              style={{ width: '220px', height: '220px', display: 'block' }} 
            />
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Číslo účtu: 1269059093/0800</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>NEBO</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* STRIPE / KARTA */}
        <div style={{ marginBottom: '25px' }}>
          <a href={stripeLink} style={buttonStyle(false)}>
            <span>💳</span> Platební karta / Apple Pay
          </a>
        </div>

        {/* REVOLUT */}
        <div>
          <a href={`https://revolut.me/${revolutTag}`} style={buttonStyle(true)}>
            <span style={{ background: '#fff', color: '#0075eb', width: '20px', height: '20px', borderRadius: '50%', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</span> 
            Revolut.me
          </a>
          <p style={{ fontSize: '12px', color: '#60a5fa' }}>@{revolutTag}</p>
        </div>
      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }}>
        FIXNÍ NÁKLADY: VERCEL HOSTING • DATABASE • DOMAIN • AUTO-SCRIPTS
      </div>
    </div>
  );
}
