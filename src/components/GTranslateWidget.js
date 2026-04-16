"use client";

import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function GTranslateWidget() {
  useEffect(() => {
    // Zabráníme vícenásobnému načtení skriptu
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: 'cs', // Výchozí jazyk webu
            // Tady definuješ, jaké jazyky se jim nabídnou (Němčina, Francouzština, Polština, Španělština...)
            includedLanguages: 'de,fr,pl,es,it', 
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
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>
          Other Languages
        </span>
      </div>
      <div id="google_translate_element"></div>

      {/* Trochu CSS magie, aby ten starý Google widget vypadal v Guru stylu */}
      <style dangerouslySetInnerHTML={{__html: `
        .guru-translate-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          background: rgba(17, 19, 24, 0.8);
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 15px;
          border-radius: 16px;
          width: fit-content;
          margin: 0 auto;
        }
        .translate-icon-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        /* Skrytí otravného horního pruhu od Googlu */
        .skiptranslate iframe { display: none !important; }
        body { top: 0px !important; }
        /* Stylování samotného select boxu */
        .goog-te-combo {
          background: #111216;
          color: #fff;
          border: 1px solid #a855f7;
          padding: 8px;
          border-radius: 8px;
          font-family: inherit;
          font-weight: bold;
          outline: none;
          cursor: pointer;
        }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; }
      `}} />
    </div>
  );
}
