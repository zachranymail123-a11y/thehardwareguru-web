"use client";
import React, { useState } from 'react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
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
        {/* Štítek s jasným CTA (UPRAVENO) */}
        {!isOpen && (
          <div className="support-label" style={{
            color: '#fff',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '2px solid #8b5cf6',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '13px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
            whiteSpace: 'nowrap'
          }}>
            Podpořit provoz ⚡
          </div>
        )}

        {/* Raketka */}
        <div style={{
          width: '55px', height: '55px', borderRadius: '50%',
          background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
          boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)',
          fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isOpen ? '✕' : '🚀'}
        </div>
      </button>

      {/* --- Menu podpory --- */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '70px', right: '0',
          width: '280px', backgroundColor: '#111318', border: '2px solid #3b0764',
          borderRadius: '20px', padding: '20px', boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '15px', fontWeight: '900', textAlign: 'center' }}>
            KRMÍŠ TENHLE STROJ?
          </h4>
          
          <p style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center', marginBottom: '18px' }}>
            Tvůj příspěvek jde přímo na fixní náklady hostingu a infrastruktury webu.
          </p>

          <a href={stripeLink} target="_blank" style={{
            display: 'block', backgroundColor: '#fff', color: '#000',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px'
          }}>
            💳 Platební karta / Apple Pay
          </a>

          <a href={`https://revolut.me/${revolutTag}`} target="_blank" style={{
            display: 'block', backgroundColor: '#0075eb', color: '#fff',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '14px'
          }}>
            R Revolut Me
          </a>
        </div>
      )}

      {/* --- Animace pulzování (PŘIDÁNO) --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        .support-label {
          animation: pulse-border 2s infinite;
        }
      `}} />
    </div>
  );
}
