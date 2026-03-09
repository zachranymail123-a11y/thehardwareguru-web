import React from 'react';
import { ShoppingCart } from 'lucide-react';

/**
 * GURU AFFILIATE BOX V2.0 - SUPREME DESIGN
 * Tato komponenta nahrazuje základní šedý box high-end neonovým layoutem.
 * Cesta: src/components/GuruAffiliateBox.jsx
 */
export default function GuruAffiliateBox({ affiliateLink, isEn, priceDisplay }) {
  if (!affiliateLink) return null;

  const buyBtnText = isEn 
    ? `BUY FOR BEST PRICE ${priceDisplay ? `(${priceDisplay})` : ''}` 
    : `ZOBRAZIT NEJLEPŠÍ CENU ${priceDisplay ? `(${priceDisplay})` : ''}`;

  return (
    <div className="guru-affiliate-wrapper" style={{
        background: 'linear-gradient(145deg, rgba(15,17,21,0.95) 0%, rgba(25,12,5,0.95) 100%)',
        border: '1px solid rgba(249, 115, 22, 0.3)',
        borderLeft: '6px solid #f97316',
        borderRadius: '24px',
        padding: '50px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 0 30px rgba(249,115,22,0.05)',
        margin: '50px 0'
    }}>
      {/* Horní svítící neonová linka */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
      
      <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px', textShadow: '0 0 20px rgba(249, 115, 22, 0.4)', letterSpacing: '1px', fontStyle: 'italic' }}>
        {isEn ? "Don't miss this hit!" : "NENECH SI TUHLE PECKU UJÍT!"}
      </h3>
      
      <p style={{ color: '#d1d5db', marginBottom: '40px', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
        {isEn 
          ? "We found the best price for your machine upgrade. Instant key delivery and Guru-verified store." 
          : "Našli jsme pro tebe tu nejlepší cenu pro upgrade tvé mašiny. Okamžité doručení klíče a Guru-ověřený obchod."}
      </p>
      
      <a 
        href={affiliateLink}
        target="_blank"
        rel="nofollow sponsored"
        className="guru-affiliate-button"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '22px 50px',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff',
          fontWeight: '950', fontSize: '1.3rem', textTransform: 'uppercase', borderRadius: '18px',
          textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 10px 35px rgba(234, 88, 12, 0.4)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: 'pointer'
        }}
      >
        <ShoppingCart size={28} />
        {buyBtnText}
      </a>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-affiliate-button:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 20px 50px rgba(234, 88, 12, 0.6) !important;
            filter: brightness(1.1);
        }
        @media (max-width: 768px) {
          .guru-affiliate-button { width: 100%; font-size: 15px !important; padding: 18px 25px !important; }
        }
      `}} />
    </div>
  );
}
