"use client";
import React, { useEffect } from 'react';
import { Cpu, Monitor, Layers, Database } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Inicializace Supabase klienta pro odesílání kliků
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaButtons({ isEn = false }) {
  // 🔥 FINAL AFFILIATE LINKS - Přísně podle schváleného Heureka formátu (Fix 404)
  const HEUREKA_CPU = "https://www.heureka.cz/?h%5Bfraze%5D=procesor#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=HeurekaButtons";
  const HEUREKA_GPU = "https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=HeurekaButtons";
  const HEUREKA_MB  = "https://www.heureka.cz/?h%5Bfraze%5D=zakladni+deska#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=HeurekaButtons";
  const HEUREKA_RAM = "https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=HeurekaButtons";

  const AMAZON_TAG = "thehardware07-20";
  const AMAZON_CPU = `https://www.amazon.com/s?k=computer+processor+cpu&tag=${AMAZON_TAG}`;
  const AMAZON_GPU = `https://www.amazon.com/s?k=graphics+card+gpu&tag=${AMAZON_TAG}`;
  const AMAZON_MB  = `https://www.amazon.com/s?k=computer+motherboard&tag=${AMAZON_TAG}`;
  const AMAZON_RAM = `https://www.amazon.com/s?k=computer+ram+ddr5&tag=${AMAZON_TAG}`;

  // Tichá funkce pro záznam kliku
  const trackClick = (platform, category) => {
    supabase.from('affiliate_clicks_log').insert([{ platform, category }]).then();
  };

  useEffect(() => {
    if (!isEn) {
      // 🔥 DŮLEŽITÉ: Načtení měřícího kódu Heureky, bez kterého se prokliky v adminu nepočítají
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
      {isEn ? (
        <>
          <a onClick={() => trackClick('amazon', 'cpu')} href={AMAZON_CPU} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Cpu size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">Processors</span>
              <span className="h-subtitle">🔥 SEE TODAY'S DEALS</span>
            </div>
          </a>

          <a onClick={() => trackClick('amazon', 'gpu')} href={AMAZON_GPU} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Monitor size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">Graphic Cards</span>
              <span className="h-subtitle">🔥 FIND LOWEST PRICE</span>
            </div>
          </a>

          <a onClick={() => trackClick('amazon', 'mb')} href={AMAZON_MB} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Layers size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">Motherboards</span>
              <span className="h-subtitle">🔥 COMPARE ALL PRICES</span>
            </div>
          </a>

          <a onClick={() => trackClick('amazon', 'ram')} href={AMAZON_RAM} className="h-banner-btn amazon-btn" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box amazon-icon-box"><Database size={26} /></div>
            <div className="h-text-col">
              <span className="h-title amazon-title">RAM Memory</span>
              <span className="h-subtitle">🔥 CLAIM BEST OFFER</span>
            </div>
          </a>
        </>
      ) : (
        <>
          <a onClick={() => trackClick('heureka', 'cpu')} href={HEUREKA_CPU} data-trixam-positionid="276027" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Cpu size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Procesory</span>
              <span className="h-subtitle">🔥 ZJISTIT DNEŠNÍ SLEVY</span>
            </div>
          </a>

          <a onClick={() => trackClick('heureka', 'gpu')} href={HEUREKA_GPU} data-trixam-positionid="276026" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Monitor size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Grafické karty</span>
              <span className="h-subtitle">🔥 UKÁZAT NEJNIŽŠÍ CENU</span>
            </div>
          </a>

          <a onClick={() => trackClick('heureka', 'mb')} href={HEUREKA_MB} data-trixam-positionid="276033" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Layers size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Základní desky</span>
              <span className="h-subtitle">🔥 POROVNAT CENY E-SHOPŮ</span>
            </div>
          </a>

          <a onClick={() => trackClick('heureka', 'ram')} href={HEUREKA_RAM} data-trixam-positionid="276034" className="h-banner-btn heureka-hn-link" target="_blank" rel="nofollow sponsored">
            <div className="h-icon-box"><Database size={26} /></div>
            <div className="h-text-col">
              <span className="h-title">Operační paměti</span>
              <span className="h-subtitle">🔥 KDE KOUPIT NEJLEVNĚJI?</span>
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
