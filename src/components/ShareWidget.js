'use client';

import React, { useState, useEffect } from 'react';
import { Award, Share2, Check } from 'lucide-react';

// 🚀 Bezpečné ikony pro zabránění pádu React hydratace
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const RedditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default function ShareWidget({ isEn = false }) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Automaticky si zjistí URL adresu, na které zrovna widget leží
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const fallbackUrl = isEn ? 'https://thehardwareguru.cz/en' : 'https://thehardwareguru.cz';
  const shareUrl = currentUrl || fallbackUrl;

  const handleCopyShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch(e) {}
    }
  };

  const titleText = isEn 
    ? "Check out this PC setup and hardware benchmark!" 
    : "Zkoukni tuhle sestavu a HW benchmark!";
    
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(titleText)}&url=${encodeURIComponent(shareUrl)}`;
  const redditHref = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(titleText)}`;

  return (
    <div className="share-widget-global">
        <div className="sw-left">
            <div className="sw-icon"><Award size={32} color="#a855f7" /></div>
            <div className="sw-texts">
                <div className="sw-title">{isEn ? 'SHARE THIS WEBSITE' : 'SDÍLET TENTO WEB'}</div>
                <div className="sw-sub">{isEn ? 'Help other geeks find the truth' : 'Pomoz ostatním geekům najít pravdu'}</div>
            </div>
        </div>
        
        <div className="sw-buttons">
            <button onClick={handleCopyShare} className="sw-btn sw-copy" title={isEn ? "Copy Link" : "Kopírovat odkaz"}>
                {copied ? <Check size={20} /> : <Share2 size={20} />}
            </button>
            <a href={twitterHref} target="_blank" rel="noopener noreferrer" className="sw-btn sw-x" title={isEn ? "Share on X" : "Sdílet na X"}>
                <XIcon />
            </a>
            <a href={redditHref} target="_blank" rel="noopener noreferrer" className="sw-btn sw-reddit" title={isEn ? "Share on Reddit" : "Sdílet na Reddit"}>
                <RedditIcon />
            </a>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
            .share-widget-global { 
                display: flex; align-items: center; justify-content: space-between; gap: 30px; 
                padding: 30px 40px; background: rgba(10, 11, 13, 0.6); 
                border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 30px; 
                backdrop-filter: blur(15px); flex-wrap: wrap; margin: 40px auto;
                max-width: 1100px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            }
            .sw-left { display: flex; align-items: center; gap: 20px; }
            .sw-texts { display: flex; flex-direction: column; }
            .sw-title { font-weight: 950; font-size: 20px; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
            .sw-sub { color: #a855f7; font-weight: bold; font-size: 14px; }
            .sw-buttons { display: flex; gap: 12px; }
            .sw-btn { 
                width: 60px; height: 60px; border-radius: 18px; border: none; cursor: pointer; 
                color: #fff; display: flex; align-items: center; justify-content: center; 
                transition: 0.3s; text-decoration: none; 
            }
            .sw-btn:hover { filter: brightness(1.2); transform: translateY(-3px); }
            .sw-copy { background: #a855f7; }
            .sw-x { background: #000; border: 1px solid #333; }
            .sw-reddit { background: #ff4500; }

            @media (max-width: 600px) {
                .share-widget-global { flex-direction: column; text-align: center; justify-content: center; padding: 25px 20px; gap: 20px; }
                .sw-left { flex-direction: column; gap: 10px; }
                .sw-buttons { width: 100%; justify-content: center; }
            }
        `}} />
    </div>
  );
}
