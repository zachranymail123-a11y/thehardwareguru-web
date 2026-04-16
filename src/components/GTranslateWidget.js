"use client";

import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function GTranslateWidget() {
  useEffect(() => {
    // Zabráníme vícenásobnému načtení skriptu při přecházení mezi stránkami
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: 'cs', // Výchozí jazyk tvého webu
            // 🔥 Všech 11 jazyků pro maximální pokrytí Evropy 🔥
            includedLanguages: 'de,fr,pl,es,it,sk,hu,ro,uk,bg,nl', 
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="guru-translate-wrapper">
      <div className="translate-icon-box">
        <Globe size={18} color="#a855f7" />
        <span style={{ fontSize: '12px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Other Languages
        </span>
      </div>
      <div id="google_translate_element"></div>

      {/* CSS pro skrytí ošklivých Google prvků a sladění s Guru stylem */}
      <style dangerouslySetInnerHTML={{__html: `
        .guru-translate-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: rgba(17, 19, 24, 0.95);
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 20px;
          border-radius: 16px;
          width: fit-content;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .translate-icon-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        /* Skrytí otravného horního pruhu od Googlu */
        .skiptranslate iframe { display: none !important; }
        body { top: 0px !important; }
        
        /* Stylování samotného select boxu pro výběr jazyka */
        .goog-te-combo {
          background: #111216;
          color: #fff;
          border: 2px solid rgba(168, 85, 247, 0.5);
          padding: 10px 15px;
          border-radius: 12px;
          font-family: inherit;
          font-weight: bold;
          outline: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .goog-te-combo:hover {
          border-color: #a855f7;
        }
        
        /* Skrytí loga Googlu */
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; }
      `}} />
    </div>
  );
}
