"use client";
import React, { useEffect } from 'react';
import { Cpu, Monitor, Layers, Database } from 'lucide-react';

export default function HeurekaButtons({ isEn = false }) {
  // 🇨🇿 HEUREKA ODKAZY (Přesné z tvé administrace)
  const HEUREKA_CPU = "https://www.heureka.cz/?h%5Bfraze%5D=procesor#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const HEUREKA_GPU = "https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const HEUREKA_MB  = "https://www.heureka.cz/?h%5Bfraze%5D=zakladni+deska#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const HEUREKA_RAM = "https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";

  // 🇺🇸 AMAZON ODKAZY (S tvým novým affiliate tagem)
  const AMAZON_TAG = "thehardware07-20";
  const AMAZON_CPU = `https://www.amazon.com/s?k=computer+processor+cpu&tag=${AMAZON_TAG}`;
  const AMAZON_GPU = `https://www.amazon.com/s?k=graphics+card+gpu&tag=${AMAZON_TAG}`;
  const AMAZON_MB  = `https://www.amazon.com/s?k=computer+motherboard&tag=${AMAZON_TAG}`;
  const AMAZON_RAM = `https://www.amazon.com/s?k=computer+ram+ddr5&tag=${AMAZON_TAG}`;

  useEffect(() => {
    // Trixam skript se načte POUZE pro českou verzi, aby nedělal bordel Američanům
    if (!isEn) {
      const script = document.createElement('script');
      script.src = "//serve.affiliate.heureka.cz/js/trixam.min.js";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isEn]);

  return (
    <div className="heureka-global-buttons">
      <style dangerouslySetInnerHTML={{ __html: `
        .heureka-global-buttons { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 420px; margin: 0 auto; }
        .h-banner-btn { display: flex; align-items: center; gap: 20px; padding: 16px 24px; background: rgba(20, 16, 0, 0.6); border: 1px solid #854d0e; border-radius: 30px; text-decoration: none; transition: all 0.3s ease; box-sizing: border-box; }
        .h-banner-btn:hover { background: rgba(30, 24, 0, 0.9); border-color: #ca8a04; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(202, 138, 4, 0.15); }
        .h-icon-box { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: rgba(202, 138, 4, 0.12); border-radius: 16px; color: #eab308; flex-shrink: 0; }
        .h-text-col { display: flex; flex-direction: column; justify-content: center; }
        .h-title { color: #eab308; font-size: 20px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.1; margin-bottom: 4px; font-family: 'Georgia', 'Times New Roman', serif; }
        .h-subtitle { color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; font-family: sans-serif; }
        
        /* Modifikace pro Amazon vzhled (volitelné, ale hezké) */
        .amazon-btn { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        .amazon-btn:hover { border-color: #fbbf24; background: rgba(245, 158, 11, 0.2); box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2); }
        .amazon-icon-box { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .amazon-title { color: #fbbf24; }

        .heureka-search-container { margin-top: 10px; width: 100%; min-height: 110px; background: rgba(0, 0, 0, 0.2); border-radius: 24px; padding: 10px; border: 1px dashed rgba(234, 179, 8, 0.2); display: flex; align-items: center; justify-content: center; }
        @media (max-width: 480px) { .h-banner-btn { padding: 14px 18px; gap: 15px; } .h-icon-box { width: 45px; height: 45px; } .h-title { font-size: 18px; } .h-subtitle { font-size: 11px; } }
      `}} />

      {isEn ? (
        /* =========================================
           🇺🇸 ANGLICKÁ VERZE - AMAZON
           Bez Heureka tříd a trixam ID! Čisté URL.
           ========================================= */
        <>
          <a href={AMAZON_CPU} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Cpu size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">Processors</span>
              <span className="h-subtitle">Check price on Amazon</span>
            </div>
          </a>

          <a href={AMAZON_GPU} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Monitor size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">Graphic Cards</span>
              <span className="h-subtitle">Check price on Amazon</span>
            </div>
          </a>

          <a href={AMAZON_MB} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Layers size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">Motherboards</span>
              <span className="h-subtitle">Check price on Amazon</span>
            </div>
          </a>

          <a href={AMAZON_RAM} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Database size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">RAM Memory</span>
              <span className="h-subtitle">Check price on Amazon</span>
            </div>
          </a>
        </>
      ) : (
        /* =========================================
           🇨🇿 ČESKÁ VERZE - HEUREKA
           Přesně zachované třídy a trixam ID.
           ========================================= */
        <>
          <a href={HEUREKA_CPU} data-trixam-positionid="276027" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Cpu size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Procesory</span>
              <span className="h-subtitle">Za nejnižší cenu</span>
            </div>
          </a>

          <a href={HEUREKA_GPU} data-trixam-positionid="276026" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Monitor size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Grafické karty</span>
              <span className="h-subtitle">Za nejnižší cenu</span>
            </div>
          </a>

          <a href={HEUREKA_MB} data-trixam-positionid="276033" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Layers size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Základní desky</span>
              <span className="h-subtitle">Za nejnižší cenu</span>
            </div>
          </a>

          <a href={HEUREKA_RAM} data-trixam-positionid="276034" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Database size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Operační paměti</span>
              <span className="h-subtitle">Za nejnižší cenu</span>
            </div>
          </a>

          <div className="heureka-search-container">
            <div 
              className="heureka-affiliate-searchpanel" 
              data-trixam-positionid="276035" 
              data-trixam-codetype="iframe" 
              data-trixam-linktarget="top"
            ></div>
          </div>
        </>
      )}
    </div>
  );
}
