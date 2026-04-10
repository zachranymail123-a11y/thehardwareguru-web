"use client";
import React, { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareResultButton({ 
    cpu = "Ryzen", 
    gpu = "RTX", 
    resolution = "1440p", 
    bottleneck = "0 %", 
    score = 100, 
    isEn = false 
}) {
    const [copied, setCopied] = useState(false);
    const [currentUrl, setCurrentUrl] = useState("https://thehardwareguru.cz");

    // Získáme aktuální URL adresu kalkulačky, aby odkaz vedl přesně tam, kde uživatel zrovna je
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    const handleShare = async () => {
        const textCz = `🔥 Můj PC má skóre ${score}/100 na The Hardware Guru!\n\n💻 CPU: ${cpu}\n🎮 GPU: ${gpu}\n📺 Rozlišení: ${resolution}\n⚙️ Úzké hrdlo: ${bottleneck}\n\n🚀 Změř si svůj výkon zdarma na:\n${currentUrl}`;
        const textEn = `🔥 My PC scored ${score}/100 on The Hardware Guru!\n\n💻 CPU: ${cpu}\n🎮 GPU: ${gpu}\n📺 Resolution: ${resolution}\n⚙️ Bottleneck: ${bottleneck}\n\n🚀 Test your rig for free at:\n${currentUrl}`;

        const textToCopy = isEn ? textEn : textCz;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000); // Vrátí tlačítko zpět po 3 sekundách
        } catch (err) {
            console.error('Chyba při kopírování: ', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: copied ? '#10b981' : 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '16px',
                fontWeight: '950',
                fontSize: '15px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: copied ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 10px 20px rgba(239, 68, 68, 0.3)',
                width: '100%',
                maxWidth: '350px'
            }}
            className="hover-scale"
        >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
            {copied
                ? (isEn ? "Copied to Clipboard!" : "Zkopírováno do schránky!")
                : (isEn ? "Share My Result" : "🔥 Sdílet můj výsledek")}
        </button>
    );
}
