"use client";
import React, { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareFpsButton({ 
    gameName = "Hra",
    cpu = "Ryzen", 
    gpu = "RTX", 
    resolution = "1440p", 
    avgFps = 60,
    isEn = false 
}) {
    const [copied, setCopied] = useState(false);
    const [currentUrl, setCurrentUrl] = useState("https://thehardwareguru.cz");

    // Získáme aktuální URL adresu FPS kalkulačky
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    const handleShare = async () => {
        // Virální text pro FPS flexování
        const textCz = `🔥 Můj PC dává ${avgFps} AVG FPS ve hře ${gameName}!\n📺 Rozlišení: ${resolution}\n\n💻 CPU: ${cpu}\n🎮 GPU: ${gpu}\n\n🚀 Změř si svůj herní výkon zdarma na:\n${currentUrl}`;
        const textEn = `🔥 My PC gets ${avgFps} AVG FPS in ${gameName}!\n📺 Resolution: ${resolution}\n\n💻 CPU: ${cpu}\n🎮 GPU: ${gpu}\n\n🚀 Test your rig for free at:\n${currentUrl}`;

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
                // Změnil jsem gradient na modro-cyanový, aby se to hodilo k FPS tématu (rychlost/future)
                background: copied ? '#10b981' : 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '16px',
                fontWeight: '950',
                fontSize: '15px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: copied ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 10px 20px rgba(59, 130, 246, 0.3)',
                width: '100%',
                maxWidth: '350px'
            }}
            className="hover-scale"
        >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
            {copied
                ? (isEn ? "Copied to Clipboard!" : "Zkopírováno do schránky!")
                : (isEn ? "Share My FPS" : "🔥 Sdílet můj výkon")}
        </button>
    );
}
