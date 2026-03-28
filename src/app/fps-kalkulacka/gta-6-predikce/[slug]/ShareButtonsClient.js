'use client';
import React, { useState } from 'react';
import { Share2, Check, Twitter, Award } from 'lucide-react';
import SeznamAd from '../../../../components/SeznamAd';

// Reddit ikona (Guru style)
const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default function ShareButtonsClient({ shareText, shareUrl }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(`${shareText} 👉 Změř si to taky na: ${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const redditLink = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;

    return (
        <div className="guru-viral-container">
            <div className="viral-flex-card">
                <div className="award-icon"><Award size={28} color="#fff" /></div>
                <div className="viral-text-box">
                    <div className="viral-title">ÚSPĚCH ODEMČEN</div>
                    <div className="viral-subtitle">Pochlub se odhadem pro GTA VI!</div>
                </div>
                <div className="share-btn-group">
                    <button onClick={handleCopy} className="premium-share-btn btn-copy" title="Kopírovat">
                        {copied ? <Check size={18} /> : <Share2 size={18} />}
                    </button>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" className="premium-share-btn btn-x" title="Sdílet na X">
                        <Twitter size={18} />
                    </a>
                    <a href={redditLink} target="_blank" className="premium-share-btn btn-reddit" title="Sdílet na Reddit">
                        <RedditIcon size={18} />
                    </a>
                </div>
            </div>

            {/* 🔥 REKLAMA POD SDÍLENÍM (STRIKTNĚ PRO MOBIL) */}
            <div className="ad-mobile-wrapper" style={{ marginTop: '25px' }}>
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>

            <style jsx>{`
                .guru-viral-container { width: 100%; margin: 25px auto 0; max-width: 500px; }
                .viral-flex-card { display: flex; align-items: center; gap: 15px; padding: 15px 20px; background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 18px; text-align: left; }
                .award-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: rgba(244, 63, 94, 0.2); border-radius: 12px; flex-shrink: 0; }
                .viral-text-box { flex: 1; }
                .viral-title { font-size: 13px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
                .viral-subtitle { font-size: 10px; color: #f43f5e; font-weight: bold; }
                .share-btn-group { display: flex; gap: 8px; }
                .premium-share-btn { width: 38px; height: 38px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; border: none; color: #fff; transition: 0.2s; }
                .btn-copy { background: linear-gradient(45deg, #f43f5e, #fda4af); }
                .btn-x { background: #000; border: 1px solid rgba(255,255,255,0.2); }
                .btn-reddit { background: #ff4500; }
                .premium-share-btn:hover { transform: translateY(-2px); filter: brightness(1.2); }

                /* 🚀 RESPONSIVE ADS SYSTEM */
                .ad-mobile-wrapper { display: none; width: 100%; }

                @media (max-width: 768px) {
                    .ad-mobile-wrapper { display: flex; justify-content: center; }
                    .viral-flex-card { flex-direction: column; text-align: center; padding: 25px 15px; gap: 12px; }
                    .viral-text-box { margin-bottom: 5px; }
                    .share-btn-group { width: 100%; justify-content: center; gap: 15px; }
                    .premium-share-btn { width: 45px; height: 45px; }
                }
            `}</style>
        </div>
    );
}
