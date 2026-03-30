"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Zap, Apple, RefreshCw, Cpu, Award, ChevronRight, X, Search } from 'lucide-react';

/**
 * GURU PARTNER WIDGET V1.0 (CTR MONSTER)
 * 🚀 CÍL: Agresivní proklik na eHUB a Heureku z každé stránky.
 * 💰 EHUB ID: 71c85dea | Heureka ID: 276027
 */

export default function PartnerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEn, setIsEn] = useState(false);

  useEffect(() => {
    setIsEn(window.location.pathname.startsWith('/en'));
  }, []);

  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const ALZA_SK_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=4d8d02fb";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";
  const IPHONE_MARKET_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=2bcd6f9d";
  const JABKOLEVNE_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=85731c2c";
  
  const heurekaUtm = "utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const HEUREKA_LINK = `https://www.heureka.cz/?h%5Bfraze%5D=procesor#${heurekaUtm}`;

  const partners = [
    { name: 'Shopcom.cz', sub: isEn ? 'GPUs & PCs' : 'Grafiky a PC', link: SHOPCOM_LINK, icon: <Cpu size={16} />, color: '#a855f7' },
    { name: 'Alza.sk', sub: isEn ? 'Hardware SK' : 'Hardware Slovensko', link: ALZA_SK_LINK, icon: <Zap size={16} />, color: '#22c55e' },
    { name: 'Heureka.cz', sub: isEn ? 'Lowest prices' : 'Nejnižší ceny', link: HEUREKA_LINK, icon: <Search size={16} />, color: '#ff0055', isHeureka: true },
    { name: 'Cubenest', sub: isEn ? 'Elite Setup' : 'Apple doplňky', link: CUBENEST_LINK, icon: <Award size={16} />, color: '#66fcf1' },
    { name: 'iPhoneMarket', sub: isEn ? 'Refurbished' : 'Levné iPhony', link: IPHONE_MARKET_LINK, icon: <Apple size={16} />, color: '#a855f7' },
  ];

  return (
    <div className={`guru-partner-widget ${isOpen ? 'active' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .guru-partner-widget {
          position: fixed;
          left: -280px;
          top: 50%;
          transform: translateY(-50%);
          width: 280px;
          background: rgba(10, 11, 13, 0.98);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-left: none;
          border-radius: 0 24px 24px 0;
          z-index: 99999;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 20px 0 50px rgba(0,0,0,0.6);
          backdrop-filter: blur(15px);
          padding: 20px;
        }
        .guru-partner-widget.active { left: 0; }

        .widget-trigger {
          position: absolute;
          right: -45px;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          background: #a855f7;
          color: #fff;
          padding: 10px 20px;
          border-radius: 12px 12px 0 0;
          font-weight: 950;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 5px 0 15px rgba(168, 85, 247, 0.4);
        }

        .partner-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          text-decoration: none;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          transition: 0.2s;
        }
        .partner-item:hover {
          background: rgba(255,255,255,0.08);
          transform: translateX(5px);
          border-color: rgba(168, 85, 247, 0.4);
        }

        .pi-icon {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          color: #fff;
        }

        .pi-text { display: flex; flex-direction: column; }
        .pi-name { color: #fff; font-weight: 800; font-size: 13px; }
        .pi-sub { color: #6b7280; font-size: 10px; font-weight: 600; text-transform: uppercase; }

        @media (max-width: 768px) {
          .guru-partner-widget {
            left: auto;
            right: -280px;
            border-radius: 24px 0 0 24px;
            border-right: none;
            border-left: 1px solid rgba(168, 85, 247, 0.3);
          }
          .guru-partner-widget.active { right: 0; }
          .widget-trigger {
            right: auto;
            left: -45px;
            border-radius: 12px 12px 0 0;
          }
        }
      `}} />

      <div className="widget-trigger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={14} style={{transform: 'rotate(90deg)'}}/> : (isEn ? '🔥 BEST HARDWARE' : '🔥 NEJLEPŠÍ HARDWARE')}
      </div>

      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 950, color: '#a855f7' }}>
          {isEn ? 'GURU VERIFIED' : 'GURU PROVĚŘENO'}
        </h4>
        <p style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>
          {isEn ? 'Best tech deals for you' : 'Nejlepší hardware za top ceny'}
        </p>
      </div>

      <div className="partner-list">
        {partners.map((p, i) => (
          <a 
            key={i} 
            href={p.link} 
            target="_blank" 
            rel="nofollow sponsored" 
            className="partner-item"
            data-trixam-positionid={p.isHeureka ? "276027" : undefined}
          >
            <div className="pi-icon" style={{ backgroundColor: p.color + '20', border: `1px solid ${p.color}40`, color: p.color }}>
              {p.icon}
            </div>
            <div className="pi-text">
              <span className="pi-name">{p.name}</span>
              <span className="pi-sub">{p.sub}</span>
            </div>
            <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#333' }} />
          </a>
        ))}
      </div>

      <Link 
        href={isEn ? "/en/sestavy" : "/sestavy"} 
        onClick={() => setIsOpen(false)}
        style={{
          display: 'block', textAlign: 'center', marginTop: '10px', 
          fontSize: '11px', color: '#9ca3af', fontWeight: 900, textDecoration: 'none'
        }}
      >
        {isEn ? 'VIEW ALL PARTNERS →' : 'VŠICHNI PARTNEŘI →'}
      </Link>
    </div>
  );
}
