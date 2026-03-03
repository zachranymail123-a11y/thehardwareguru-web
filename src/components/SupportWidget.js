"use client";
import React, { useState } from 'react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";

  return (
    <div style={{ position: 'fixed', bottom: '110px', right: '20px', zIndex: 9999, fontFamily: 'sans-serif' }}>
      
      {/* --- Hlavní klikací plocha (Bublina + Text) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '15px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0', transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Textový štítek (PŘIDÁNO) */}
        {!isOpen && (
          <div style={{
            color: '#ffffff',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '2px solid rgba(168, 85, 247, 0.4)',
            padding: '10px 18px',
            borderRadius: '20px',
            fontWeight: '900',
            fontSize: '14px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
            fontStyle: 'italic',
            pointerEvents: 'none', // Text není samostatně klikací, jen plocha
          }}>
            Krmíš stroj?
          </div>
        )}

        {/* Raketka (Bublina) */}
        <div 
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.7)',
            fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s ease',
          }}
        >
          {isOpen ? '✕' : '🚀'}
        </div>
      </button>

      {/* --- Menu podpory --- */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '80px', right: '0',
          width: '280px', backgroundColor: '#111318', border: '2px solid #3b0764',
          borderRadius: '20px', padding: '20px', boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '15px', fontWeight: '900', textAlign: 'center', letterSpacing: '1px' }}>
            ⚡ SUPPORT THE GURU
          </h4>
          
          <p style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center', marginBottom: '18px', lineHeight: '1.5' }}>
            Podpoř TheHardwareGuru! Každý dar jde na hosting a doménu.
          </p>

          <a href={stripeLink} target="_blank" style={{
            display: 'block', backgroundColor: '#ffffff', color: '#000000',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px',
            transition: 'background 0.2s'
          }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            💳 Platební karta
          </a>

          <a href={`https://revolut.me/${revolutTag}`} target="_blank" style={{
            display: 'block', backgroundColor: '#0075eb', color: '#ffffff',
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '15px',
            transition: 'background 0.2s', boxShadow: '0 4px 10px rgba(0, 117, 235, 0.2)'
          }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0075eb'}
          >
            R Revolut Me
          </a>
          
          <p style={{ fontSize: '9px', color: '#4b5563', textAlign: 'center', marginTop: '18px', letterSpacing: '2px', textTransform: 'uppercase', fontStyle: 'italic' }}>
            DÍKY ZA SUPPORT!
          </p>
        </div>
      )}

      {/* --- Animace --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
