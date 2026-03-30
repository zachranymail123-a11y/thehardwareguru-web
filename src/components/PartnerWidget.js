"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Apple, RefreshCw, Cpu, Award, ChevronLeft, X, Search, Flame, Monitor } from 'lucide-react';

/**
 * GURU PARTNER WIDGET V2.0 - RIGHT SIDE CTR MONSTER
 * 🚀 CÍL: Agresivní proklik, maximální velikost, Heureka deep links.
 * 💰 EHUB ID: 71c85dea | Heureka ID: 276027
 */

export default function PartnerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEn, setIsEn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEn(window.location.pathname.startsWith('/en'));
    }
  }, []);

  // EHUB TRACKING LINKS
  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const ALZA_SK_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=4d8d02fb";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";
  const IPHONE_MARKET_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=2bcd6f9d";
  const JABKOLEVNE_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=85731c2c";
  
  // HEUREKA DEEP LINKS
  const hUtm = "utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const HEUREKA_CPU = `https://www.heureka.cz/?h%5Bfraze%5D=procesor#${hUtm}`;
  const HEUREKA_GPU = `https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#${hUtm}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .guru-side-panel {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%) translateX(350px);
          width: 350px;
          background: rgba(10, 11, 13, 0.98);
          border: 2px solid rgba(168, 85, 247, 0.5);
          border-right: none;
          border-radius: 32px 0 0 32px;
          z-index: 999999;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: -20px 0 60px rgba(0,0,0,0.9);
          backdrop-filter: blur(30px);
          padding: 35px 25px;
        }
        .guru-side-panel.is-open {
          transform: translateY(-50%) translateX(0);
        }

        .panel-trigger-handle {
          position: absolute;
          left: -52px;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          background: linear-gradient(90deg, #a855f7 0%, #7e22ce 100%);
          color: #fff;
          padding: 15px 30px;
          border-radius: 20px 20px 0 0;
          font-weight: 950;
          font-size: 14px;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: -10px 0 30px rgba(168, 85, 247, 0.6);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .money-row {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px;
          margin-bottom: 12px;
          text-decoration: none;
          border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: 0.3s;
        }
        .money-row:hover {
          background: rgba(168, 85, 247, 0.15);
          transform: translateX(-8px);
          border-color: rgba(168, 85, 247, 0.6);
        }

        /* 🔥 HEUREKA SPECIAL CTR */
        .heureka-gold {
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.05) 100%) !important;
          border: 1px solid rgba(234, 179, 8, 0.4) !important;
        }
        .heureka-gold:hover {
          background: rgba(234, 179, 8, 0.25) !important;
          border-color: #eab308 !important;
        }

        .m-icon {
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px;
        }

        .m-info { display: flex; flex-direction: column; flex: 1; }
        .m-title { color: #fff; font-weight: 900; font-size: 14px; line-height: 1.2; text-transform: uppercase; }
        .m-label { color: #9ca3af; font-size: 11px; font-weight: 700; margin-top: 3px; }

        @media (max-width: 768px) {
          .guru-side-panel { width: 310px; padding: 25px 15px; }
          .panel-trigger-handle { font-size: 11px; padding: 12px 20px; left: -42px; }
        }
      `}} />

      <div className={`guru-side-panel ${isOpen ? 'is-open' : ''}`}>
        <div className="panel-trigger-handle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : (isEn ? '🔥 GURU PARTNERS' : '🔥 GURU PARTNEŘI')}
        </div>

        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '18px', fontStyle: 'italic', fontWeight: 950, color: '#a855f7', textTransform: 'uppercase' }}>
            {isEn ? 'Elite Hardware' : 'Elitní Hardware'}
          </h4>
          <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>
            {isEn ? 'Verified sources only' : 'Pouze prověřené zdroje'}
          </p>
        </div>

        <div className="panel-content">
          
          {/* 🔥 HEUREKA DEEP LINKS - PROCESORY */}
          <a href={HEUREKA_CPU} target="_blank" rel="nofollow sponsored" className="money-row heureka-gold" data-trixam-positionid="276027">
            <div className="m-icon" style={{ backgroundColor: '#eab30820', color: '#eab308' }}>
              <Cpu size={22} />
            </div>
            <div className="m-info">
              <span className="m-title" style={{ color: '#eab308' }}>Procesory</span>
              <span className="m-label" style={{ color: '#fff' }}>ZA NEJNIŽŠÍ CENU</span>
            </div>
          </a>

          {/* 🔥 HEUREKA DEEP LINKS - GRAFIKY */}
          <a href={HEUREKA_GPU} target="_blank" rel="nofollow sponsored" className="money-row heureka-gold" data-trixam-positionid="276027">
            <div className="m-icon" style={{ backgroundColor: '#eab30820', color: '#eab308' }}>
              <Monitor size={22} />
            </div>
            <div className="m-info">
              <span className="m-title" style={{ color: '#eab308' }}>Grafické karty</span>
              <span className="m-label" style={{ color: '#fff' }}>ZA NEJNIŽŠÍ CENU</span>
            </div>
          </a>

          {/* EHUB PARTNER - SHOPCOM */}
          <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#a855f720', color: '#a855f7' }}>
              <Flame size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Shopcom.cz</span>
              <span className="m-label">Nejlepší GPU dealy v ČR</span>
            </div>
          </a>

          {/* EHUB PARTNER - ALZA.SK */}
          <a href={ALZA_SK_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
              <Zap size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Alza.sk</span>
              <span className="m-label">Hardware pro Slovensko</span>
            </div>
          </a>

          {/* EHUB PARTNER - CUBENEST */}
          <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#66fcf120', color: '#66fcf1' }}>
              <Award size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Cubenest</span>
              <span className="m-label">Prémiové doplňky setupu</span>
            </div>
          </a>

          {/* EHUB PARTNER - IPHONEMARKET */}
          <a href={IPHONE_MARKET_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#a855f720', color: '#a855f7' }}>
              <Apple size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">iPhoneMarket</span>
              <span className="m-label">Repasované iPhony se zárukou</span>
            </div>
          </a>

        </div>

        <Link 
          href={isEn ? "/en/sestavy" : "/sestavy"} 
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            marginTop: '20px', padding: '15px', borderRadius: '18px',
            fontSize: '13px', color: '#fff', background: 'rgba(168, 85, 247, 0.3)', 
            fontWeight: 950, textDecoration: 'none', border: '1px solid rgba(168, 85, 247, 0.5)',
            textTransform: 'uppercase'
          }}
        >
          {isEn ? 'View All Partners' : 'Všichni partneři'} <ChevronLeft size={16} style={{transform: 'rotate(180deg)'}} />
        </Link>
      </div>
    </>
  );
}
