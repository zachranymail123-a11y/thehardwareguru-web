"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Apple, RefreshCw, Cpu, Award, ChevronRight, X, Search } from 'lucide-react';

/**
 * GURU PARTNER WIDGET V1.2 - VISIBILITY FIX
 * 🚀 CÍL: Fix pozice, aby úchyt nikdy neodjel mimo obrazovku.
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .guru-partner-vessel {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%) translateX(-280px);
          width: 280px;
          background: rgba(10, 11, 13, 0.98);
          border: 1px solid rgba(168, 85, 247, 0.4);
          border-left: none;
          border-radius: 0 24px 24px 0;
          z-index: 999999;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 20px 0 50px rgba(0,0,0,0.8);
          backdrop-filter: blur(20px);
          padding: 25px 20px;
        }
        .guru-partner-vessel.is-open {
          transform: translateY(-50%) translateX(0);
        }

        .widget-trigger-handle {
          position: absolute;
          right: -42px;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          background: #a855f7;
          color: #fff;
          padding: 12px 20px;
          border-radius: 14px 14px 0 0;
          font-weight: 950;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 10px 0 20px rgba(168, 85, 247, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .partner-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 10px;
          text-decoration: none;
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          transition: 0.3s;
        }
        .partner-row:hover {
          background: rgba(168, 85, 247, 0.1);
          transform: translateX(5px);
          border-color: rgba(168, 85, 247, 0.5);
        }

        .pi-icon-box {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
        }

        .pi-info { display: flex; flex-direction: column; }
        .pi-title { color: #fff; font-weight: 800; font-size: 13px; line-height: 1.2; }
        .pi-label { color: #6b7280; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 2px; }

        @media (max-width: 768px) {
          /* Na mobilu to dáme doprava, vlevo je Guru Průvodce */
          .guru-partner-vessel {
            left: auto;
            right: 0;
            transform: translateY(-50%) translateX(280px);
            border-radius: 24px 0 0 24px;
            border-right: none;
            border-left: 1px solid rgba(168, 85, 247, 0.4);
          }
          .guru-partner-vessel.is-open {
            transform: translateY(-50%) translateX(0);
          }
          .widget-trigger-handle {
            right: auto;
            left: -42px;
            border-radius: 14px 14px 0 0;
          }
        }
      `}} />

      <div className={`guru-partner-vessel ${isOpen ? 'is-open' : ''}`}>
        <div className="widget-trigger-handle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={16} /> : (isEn ? '🚀 PARTNERS' : '🚀 PARTNEŘI')}
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 950, color: '#a855f7', textTransform: 'uppercase' }}>
            {isEn ? 'Elite Selection' : 'Elitní výběr'}
          </h4>
          <div style={{ height: '2px', width: '40px', background: '#a855f7', margin: '8px auto' }}></div>
        </div>

        <div className="partner-content-list">
          {partners.map((p, i) => (
            <a 
              key={i} 
              href={p.link} 
              target="_blank" 
              rel="nofollow sponsored" 
              className="partner-row"
              data-trixam-positionid={p.isHeureka ? "276027" : undefined}
            >
              <div className="pi-icon-box" style={{ backgroundColor: p.color + '15', border: `1px solid ${p.color}30`, color: p.color }}>
                {p.icon}
              </div>
              <div className="pi-info">
                <span className="pi-title">{p.name}</span>
                <span className="pi-label">{p.sub}</span>
              </div>
              <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#4b5563' }} />
            </a>
          ))}
        </div>

        <Link 
          href={isEn ? "/en/sestavy" : "/sestavy"} 
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginTop: '15px', padding: '12px', borderRadius: '12px',
            fontSize: '11px', color: '#fff', background: 'rgba(168, 85, 247, 0.2)', 
            fontWeight: 900, textDecoration: 'none', border: '1px solid rgba(168, 85, 247, 0.3)'
          }}
        >
          {isEn ? 'ALL GURU DEALS' : 'VŠECHNY GURU DEALY'} <ChevronRight size={14} />
        </Link>
      </div>
    </>
  );
}
