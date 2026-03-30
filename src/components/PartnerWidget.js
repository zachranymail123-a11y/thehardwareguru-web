"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Apple, RefreshCw, Cpu, Award, ChevronRight, ChevronLeft, X, Search, Flame, Monitor, Gamepad2, Smartphone } from 'lucide-react';

/**
 * GURU PARTNER WIDGET V2.6 - HEUREKA POSITION ID FIX
 * 🚀 CÍL: Rozdělení data-trixam-positionid pro CPU (276027) a GPU (276026).
 * 💰 EHUB ID: 71c85dea
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
  const SMARTY_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06";
  const XM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=0ff74973";
  
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
          transform: translateY(-50%) translateX(100%);
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
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        
        .guru-side-panel.is-open {
          transform: translateY(-50%) translateX(0);
        }

        .panel-content-scrollable {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 5px;
          margin-bottom: 10px;
        }

        .panel-content-scrollable::-webkit-scrollbar { width: 4px; }
        .panel-content-scrollable::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .panel-content-scrollable::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.5); border-radius: 10px; }
        .panel-content-scrollable::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.8); }

        .panel-trigger-handle {
          position: absolute;
          left: -50px;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 180px;
          background: linear-gradient(180deg, #a855f7 0%, #7e22ce 100%);
          color: #fff;
          border-radius: 16px 0 0 16px;
          cursor: pointer;
          box-shadow: -5px 0 20px rgba(168, 85, 247, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: 0.3s;
        }
        .panel-trigger-handle:hover {
          background: linear-gradient(180deg, #b975f8 0%, #8b25e6 100%);
          width: 55px;
          left: -55px;
        }

        .trigger-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-weight: 950;
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
          white-space: nowrap;
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
          box-sizing: border-box;
          width: 100%;
        }
        .money-row:hover {
          background: rgba(168, 85, 247, 0.15);
          transform: translateX(-8px);
          border-color: rgba(168, 85, 247, 0.6);
        }

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
          flex-shrink: 0;
        }

        .m-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .m-title { color: #fff; font-weight: 900; font-size: 14px; line-height: 1.2; text-transform: uppercase; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .m-label { color: #9ca3af; font-size: 11px; font-weight: 700; margin-top: 3px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }

        .close-icon-wrap {
          position: absolute;
          top: 15px;
          right: 15px;
          color: #9ca3af;
          cursor: pointer;
          transition: 0.2s;
          padding: 5px;
          z-index: 10;
        }
        .close-icon-wrap:hover { color: #fff; transform: rotate(90deg); }

        @media (max-width: 768px) {
          .guru-side-panel { width: 310px; padding: 25px 15px; max-height: 85vh; }
          .panel-trigger-handle { width: 40px; left: -40px; height: 150px; }
          .panel-trigger-handle:hover { width: 45px; left: -45px; }
          .trigger-text { font-size: 12px; }
        }
      `}} />

      <div className={`guru-side-panel ${isOpen ? 'is-open' : ''}`}>
        
        <div className="panel-trigger-handle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <ChevronRight size={24} />
          ) : (
            <>
              <Award size={20} />
              <span className="trigger-text">{isEn ? 'GURU PARTNERS' : 'GURU PARTNEŘI'}</span>
            </>
          )}
        </div>

        {isOpen && (
          <div className="close-icon-wrap" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </div>
        )}

        <div style={{ marginBottom: '25px', textAlign: 'center', flexShrink: 0 }}>
          <h4 style={{ margin: 0, fontSize: '18px', fontStyle: 'italic', fontWeight: 950, color: '#a855f7', textTransform: 'uppercase' }}>
            {isEn ? 'Elite Hardware' : 'Elitní výběr'}
          </h4>
          <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>
            {isEn ? 'Verified sources only' : 'Pouze prověřené zdroje'}
          </p>
        </div>

        <div className="panel-content-scrollable">
          
          {/* 🔥 HEUREKA PROCESORY -> ID 276027 */}
          <a href={HEUREKA_CPU} target="_blank" rel="nofollow sponsored" className="money-row heureka-gold heureka-hn-link" data-trixam-positionid="276027">
            <div className="m-icon" style={{ backgroundColor: '#eab30820', color: '#eab308' }}>
              <Cpu size={22} />
            </div>
            <div className="m-info">
              <span className="m-title" style={{ color: '#eab308' }}>Procesory</span>
              <span className="m-label" style={{ color: '#fff' }}>ZA NEJNIŽŠÍ CENU</span>
            </div>
          </a>

          {/* 🔥 HEUREKA GRAFIKY -> ID 276026 */}
          <a href={HEUREKA_GPU} target="_blank" rel="nofollow sponsored" className="money-row heureka-gold heureka-hn-link" data-trixam-positionid="276026">
            <div className="m-icon" style={{ backgroundColor: '#eab30820', color: '#eab308' }}>
              <Monitor size={22} />
            </div>
            <div className="m-info">
              <span className="m-title" style={{ color: '#eab308' }}>Grafické karty</span>
              <span className="m-label" style={{ color: '#fff' }}>ZA NEJNIŽŠÍ CENU</span>
            </div>
          </a>

          {/* SMARTY.CZ */}
          <a href={SMARTY_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#ec489920', color: '#ec4899' }}>
              <Gamepad2 size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Smarty.cz</span>
              <span className="m-label">Gaming & Elektronika</span>
            </div>
          </a>

          {/* XM.CZ */}
          <a href={XM_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#f9731620', color: '#f97316' }}>
              <Smartphone size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">XM.cz</span>
              <span className="m-label">Chytrá elektronika</span>
            </div>
          </a>

          {/* SHOPCOM */}
          <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#a855f720', color: '#a855f7' }}>
              <Flame size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Shopcom.cz</span>
              <span className="m-label">Nejlepší GPU dealy v ČR</span>
            </div>
          </a>

          {/* ALZA.SK */}
          <a href={ALZA_SK_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
              <Zap size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Alza.sk</span>
              <span className="m-label">Hardware pro Slovensko</span>
            </div>
          </a>

          {/* JABKOLEVNE */}
          <a href={JABKOLEVNE_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#84cc1620', color: '#84cc16' }}>
              <Apple size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Jabkolevne.cz</span>
              <span className="m-label">Dostupné iPhony</span>
            </div>
          </a>

          {/* IPHONEMARKET */}
          <a href={IPHONE_MARKET_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#a855f720', color: '#a855f7' }}>
              <Apple size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">iPhoneMarket</span>
              <span className="m-label">Repasované iPhony se zárukou</span>
            </div>
          </a>

          {/* CUBENEST */}
          <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="money-row">
            <div className="m-icon" style={{ backgroundColor: '#66fcf120', color: '#66fcf1' }}>
              <Award size={22} />
            </div>
            <div className="m-info">
              <span className="m-title">Cubenest</span>
              <span className="m-label">Prémiové doplňky setupu</span>
            </div>
          </a>

        </div>

        <Link 
          href={isEn ? "/en/sestavy" : "/sestavy"} 
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            marginTop: '10px', padding: '15px', borderRadius: '18px', flexShrink: 0,
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
