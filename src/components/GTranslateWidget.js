"use client";

import React, { useEffect } from 'react';

export default function GTranslateWidget() {
  useEffect(() => {
    if (!window.googleTranslateElementInit) {
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

      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const resetTranslation = () => {
    // Totální vymazání Google Translate paměti a reset stránky do originálu
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Samotný Google překladač */}
      <div id="google_translate_element"></div>
      
      {/* NOUZOVÁ BRZDA - NEPRŮSTŘELNÉ TLAČÍTKO */}
      <button 
        onClick={resetTranslation}
        style={{
          background: '#ef4444', color: '#fff', border: 'none', 
          padding: '4px 8px', borderRadius: '4px', fontSize: '10px', 
          fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase',
          boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
          flexShrink: 0
        }}
        title="Vypnout překlad a vrátit originál (CZ)"
      >
        ❌ VYPNOUT
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        /* Skrytí otravné horní lišty a loga */
        .skiptranslate iframe { display: none !important; }
        body { top: 0px !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; margin: 0 !important; }
        
        /* Tmavý vzhled pro nativní Google Select */
        .goog-te-combo { 
          background: #111 !important; 
          color: #fff !important; 
          border: 1px solid #a855f7 !important; 
          padding: 4px !important; 
          border-radius: 4px !important;
          outline: none !important;
          font-size: 11px !important;
          font-weight: bold !important;
          cursor: pointer;
        }
      `}} />
    </div>
  );
}
