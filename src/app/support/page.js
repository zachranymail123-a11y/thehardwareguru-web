import React from 'react';

export default function SupportPage() {
  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";

  const containerStyle = {
    backgroundColor: '#0a0b0d',
    color: '#ffffff',
    minHeight: '100-screen',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    fontFamily: 'sans-serif'
  };

  const cardStyle = {
    background: '#111318',
    border: '1px solid #3b0764',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)',
    textAlign: 'center'
  };

  const buttonStyle = (isRevolut) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '18px',
    transition: '0.3s',
    marginBottom: '15px',
    backgroundColor: isRevolut ? '#0075eb' : '#ffffff',
    color: isRevolut ? '#ffffff' : '#000000',
    boxShadow: isRevolut ? '0 4px 15px rgba(0, 117, 235, 0.3)' : 'none'
  });

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#a855f7', fontSize: '14px', letterSpacing: '3px', fontWeight: 'bold' }}>PODPORA PROJEKTU</h2>
        <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '10px 0', letterSpacing: '-2px' }}>KRMÍŠ TENHLE STROJ</h1>
        <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto', fontStyle: 'italic', lineHeight: '1.6' }}>
          "Podpoř TheHardwareGuru! 🚀 Každý dar jde na hosting, Vercel a doménu. Díky tobě udržíme web online 24/7."
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ marginBottom: '30px' }}>
          <a href={stripeLink} style={buttonStyle(false)}>
            <span>💳</span> Platební karta
          </a>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '-10px' }}>Apple Pay, Google Pay, Karty</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.3' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>NEBO</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        <div>
          <a href={`https://revolut.me/${revolutTag}`} style={buttonStyle(true)}>
            <span style={{ background: '#fff', color: '#0075eb', width: '24px', height: '24px', borderRadius: '50%', fontSize: '14px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>R</span> 
            Revolut Me
          </a>
          <p style={{ fontSize: '12px', color: '#60a5fa' }}>@{revolutTag}</p>
        </div>
      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold' }}>
        FIXNÍ NÁKLADY: VERCEL HOSTING • DATABASE • DOMAIN AUTO-SCRIPTS
      </div>
    </div>
  );
}
