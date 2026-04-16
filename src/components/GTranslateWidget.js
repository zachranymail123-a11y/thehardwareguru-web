"use client";

import React, { useEffect } from 'react';

export default function GTranslateWidget() {
  useEffect(() => {
    // 1. Načtení originálního překladače
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

    // 2. Hack: Vložení volby "VYPNOUT" přímo do Google roletky
    const checkExist = setInterval(function() {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        if (!selectElement.querySelector('option[value="default_disable"]')) {
           const defaultOption = document.createElement('option');
           defaultOption.value = 'default_disable';
           defaultOption.text = '❌ VYPNOUT PŘEKLAD (CZ)';
           defaultOption.style.fontWeight = 'bold';
           defaultOption.style.color = '#ef4444';
           
           // Vložíme to hned jako první možnost pod "Vyberte jazyk"
           if (selectElement.options.length > 0) {
             selectElement.insertBefore(defaultOption, selectElement.options[1]);
           } else {
             selectElement.appendChild(defaultOption);
           }
           
           // Odchycení kliknutí na naši volbu
           selectElement.addEventListener('change', function() {
              if (this.value === 'default_disable') {
                  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
                  window.location.reload();
              }
           });
        }
        clearInterval(checkExist);
      }
    }, 500);

  }, []);

  return (
    <div style={{ display: 'inline-block' }}>
      <div id="google_translate_element"></div>
      
      <style dangerouslySetInnerHTML={{__html: `
        /* Skrytí otravné horní lišty a loga */
        .skiptranslate iframe { display: none !important; }
        body { top: 0px !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; margin: 0 !important; }
        
        /* Tmavý vzhled roletky */
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
