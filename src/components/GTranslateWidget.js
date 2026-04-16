"use client";

import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function GTranslateWidget() {
  useEffect(() => {
    // Inicializace standardního Google Translate widgetu
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: 'cs',
          includedLanguages: 'de,fr,pl,es,it,sk,hu,ro,uk,bg,nl',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        'google_translate_element'
      );
    };

    const addScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    addScript();
  }, []);

  return (
    <div className="guru-translate-container">
      <div id="google_translate_element"></div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .guru-translate-container {
          background: rgba(17, 19, 24, 0.9);
          padding: 5px 10px;
          border-radius: 8px;
          border: 1px solid rgba(168, 85, 247, 0.3);
          display: inline-block;
        }
        /* Skrytí Google lišty a loga */
        .skiptranslate iframe { display: none !important; }
        body { top: 0px !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; }
        .goog-te-gadget .goog-te-combo { 
          background: #000 !important; 
          color: #fff !important; 
          border: 1px solid #a855f7 !important; 
          padding: 5px !important; 
          border-radius: 4px !important;
          outline: none !important;
          font-size: 12px !important;
          font-weight: bold !important;
        }
      `}} />
    </div>
  );
}
