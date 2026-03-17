'use client';
import React, { useState } from 'react';
import { Share2, Check, Twitter, Award } from 'lucide-react';

export default function ShareButtonsClient({ shareText, shareUrl }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${shareText} 👉 Check it here: ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="viral-flex-card">
            <div className="award-icon"><Award size={32} color="#fff" /></div>
            <div className="viral-text-box">
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>ÚSPĚCH ODEMČEN</div>
                <div style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 'bold' }}>Pochlub se odhadem pro GTA VI!</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleCopy} className="premium-share-btn btn-copy">
                    {copied ? <Check size={20} /> : <Share2 size={20} />}
                </button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" className="premium-share-btn btn-x"><Twitter size={20} /></a>
            </div>
            <style jsx>{`
                .viral-flex-card { display: flex; align-items: center; gap: 20px; max-width: 520px; margin: 30px auto 0; padding: 20px; background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 20px; text-align: left; }
                .award-icon { display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: rgba(244, 63, 94, 0.2); border-radius: 12px; }
                .viral-text-box { flex: 1; }
                .premium-share-btn { width: 44px; height: 44px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; border: none; color: #fff; transition: 0.3s; }
                .btn-copy { background: linear-gradient(45deg, #f43f5e, #fda4af); }
                .btn-x { background: #000; border: 1px solid rgba(255,255,255,0.2); }
                .premium-share-btn:hover { transform: scale(1.1); }
            `}</style>
        </div>
    );
}
