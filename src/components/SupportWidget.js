"use client";
import React, { useState } from 'react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";

  return (
    <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 9999, fontFamily: 'sans-serif' }}>
      {/* Hlavní neonová bublina */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
          fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s ease'
        }}
      >
        {isOpen ? '✕' : '🚀'}
      </button>

      {/* Menu podpory */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '80px', right: '0',
          width: '280px', backgroundColor: '#111318', border: '1px solid #3b0764',
          borderRadius: '20px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
        }}>
          <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '14px', fontWeight: '900', textAlign: 'center', letterSpacing: '1px' }}>
            KRMÍŠ STROJ? ⚡
          </h4>
          <p style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
            Podpoř TheHardwareGuru! Každý dar jde na hosting a doménu.
          </p>
          <a href={stripeLink} target="_blank" style={{
            display: 'block', backgroundColor: '#ffffff', color: '#000000',
            textAlign: 'center', padding: '12px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px'
          }}>
            💳 Platební karta
          </a>
          <a href={`https://revolut.me/${revolutTag}`} target="_blank" style={{
            display: 'block', backgroundColor: '#0075eb', color: '#ffffff',
            textAlign: 'center', padding: '12px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '14px'
          }}>
            R Revolut Me
          </a>
        </div>
      )}
    </div>
  );
}
