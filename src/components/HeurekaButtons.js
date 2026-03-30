"use client";
import React from 'react';
import { Cpu, Monitor, Layers, Database } from 'lucide-react';

/**
 * GURU HEUREKA GLOBAL BUTTONS V1.2 (CTR MAXIMIZER - FULL BUILD)
 * 🚀 CÍL: Svatá čtveřice PC buildu (CPU, GPU, MB, RAM).
 * ✅ TRACKING: Kompletně napojeno na unikátní Trixam IDs.
 */

export default function HeurekaButtons({ isEn = false }) {
  // 🔥 HEUREKA DEEP LINKS S UTM
  const hUtm = "utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const HEUREKA_CPU = `https://www.heureka.cz/?h%5Bfraze%5D=procesor#${hUtm}`;
  const HEUREKA_GPU = `https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#${hUtm}`;
  const HEUREKA_MB = `https://www.heureka.cz/?h%5Bfraze%5D=zakladni+deska#${hUtm}`;
  const HEUREKA_RAM = `https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#${hUtm}`;

  return (
    <div className="heureka-global-buttons">
      <style dangerouslySetInnerHTML={{ __html: `
        .heureka-global-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }
        
        .h-banner-btn {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 24px;
          background: rgba(20, 16, 0, 0.6);
          border: 1px solid #854d0e;
          border-radius: 30px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        
        .h-banner-btn:hover {
          background: rgba(30, 24, 0, 0.9);
          border-color: #ca8a04;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(202, 138, 4, 0.15);
        }
        
        .h-icon-box {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(202, 138, 4, 0.12);
          border-radius: 16px;
          color: #eab308;
          flex-shrink: 0;
        }
        
        .h-text-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .h-title {
          color: #eab308;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          line-height: 1.1;
          margin-bottom: 4px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        
        .h-subtitle {
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-family: sans-serif;
        }
        
        @media (max-width: 480px) {
          .h-banner-btn { padding: 14px 18px; gap: 15px; }
          .h-icon-box { width: 45px; height: 45px; }
          .h-icon-box svg { width: 22px; height: 22px; }
          .h-title { font-size: 18px; }
          .h-subtitle { font-size: 11px; }
        }
      `}} />

      {/* 🔥 PROCESORY -> ID 276027 */}
      <a 
        href={HEUREKA_CPU} 
        target="_blank" 
        rel="nofollow sponsored" 
        className="h-banner-btn heureka-hn-link" 
        data-trixam-positionid="276027"
      >
        <div className="h-icon-box">
          <Cpu size={26} />
        </div>
        <div className="h-text-col">
          <span className="h-title">{isEn ? 'Processors' : 'Procesory'}</span>
          <span className="h-subtitle">{isEn ? 'At the lowest price' : 'Za nejnižší cenu'}</span>
        </div>
      </a>

      {/* 🔥 GRAFICKÉ KARTY -> ID 276026 */}
      <a 
        href={HEUREKA_GPU} 
        target="_blank" 
        rel="nofollow sponsored" 
        className="h-banner-btn heureka-hn-link" 
        data-trixam-positionid="276026"
      >
        <div className="h-icon-box">
          <Monitor size={26} />
        </div>
        <div className="h-text-col">
          <span className="h-title">{isEn ? 'Graphic Cards' : 'Grafické karty'}</span>
          <span className="h-subtitle">{isEn ? 'At the lowest price' : 'Za nejnižší cenu'}</span>
        </div>
      </a>

      {/* 🔥 ZÁKLADNÍ DESKY -> ID 276033 */}
      <a 
        href={HEUREKA_MB} 
        target="_blank" 
        rel="nofollow sponsored" 
        className="h-banner-btn heureka-hn-link" 
        data-trixam-positionid="276033"
      >
        <div className="h-icon-box">
          <Layers size={26} />
        </div>
        <div className="h-text-col">
          <span className="h-title">{isEn ? 'Motherboards' : 'Základní desky'}</span>
          <span className="h-subtitle">{isEn ? 'At the lowest price' : 'Za nejnižší cenu'}</span>
        </div>
      </a>

      {/* 🔥 RAM -> ID 276034 */}
      <a 
        href={HEUREKA_RAM} 
        target="_blank" 
        rel="nofollow sponsored" 
        className="h-banner-btn heureka-hn-link" 
        data-trixam-positionid="276034"
      >
        <div className="h-icon-box">
          <Database size={26} />
        </div>
        <div className="h-text-col">
          <span className="h-title">{isEn ? 'RAM Memory' : 'Operační paměti'}</span>
          <span className="h-subtitle">{isEn ? 'At the lowest price' : 'Za nejnižší cenu'}</span>
        </div>
      </a>
    </div>
  );
}
