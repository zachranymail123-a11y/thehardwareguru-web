'use client';
import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, Zap, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const pathname = usePathname() || '';
    const isEn = pathname.startsWith('/en');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const lastShown = localStorage.getItem('guru_exit_v15');
        if (lastShown) return;

        const handleMouseOut = (e) => {
            if (e.clientY < 10 && !hasTriggered) {
                setHasTriggered(true);
                setIsVisible(true);
                localStorage.setItem('guru_exit_v15', Date.now().toString());
            }
        };

        document.addEventListener('mouseout', handleMouseOut);
        return () => document.removeEventListener('mouseout', handleMouseOut);
    }, [hasTriggered]);

    if (!isVisible) return null;

    // 🔥 PŘESNÝ LINK PODLE MANUÁLU HEUREKY (Z TVÝCH SCREENSHOTŮ) 🔥
    const getLink = (product) => {
        const query = encodeURIComponent(product);
        if (isEn) return `https://www.amazon.com/s?k=${query}&tag=thehardware07-20`;
        
        // Formát URL přímo z administrace Heureky pro procesory
        return `https://www.heureka.cz/?h%5Bfraze%5D=${query}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=exit-popup-v15`;
    };

    const product = "AMD Ryzen 7 9800X3D";
    const processorId = "276027"; // ID pro procesory z tvého screenshotu image_eed862

    return (
        <div className="exit-overlay">
            <div className="exit-card">
                <button onClick={() => setIsVisible(false)} className="exit-close"><X size={24} /></button>
                
                <div className="exit-badge"><ShieldCheck size={14} /> GURU PRIVÁTNÍ NABÍDKA</div>
                
                <h2 className="exit-title">
                    {isEn ? "Wait! Don't leave without the best." : "Počkej! Neodcházej bez vítěze."}
                </h2>
                
                <p className="exit-desc">
                    {isEn 
                        ? `Upgrade to ${product} and eliminate every bottleneck in your system.`
                        : `Aktuálně nejvýkonnější herní procesor ${product} je konečně skladem za top cenu.`}
                </p>

                <div className="exit-product-box">
                    <span className="exit-cat">HERNÍ BESTIE 2026</span>
                    <div className="exit-name">{product}</div>
                </div>

                {/* 🔥 ABSOLUTNĚ KLÍČOVÁ OPRAVA: PŘIDÁNA TŘÍDA A POSITION ID PRO TRACKING HEUREKY 🔥 */}
                <a 
                    href={getLink(product)} 
                    target="_blank" 
                    rel="sponsored noopener" 
                    className={isEn ? "exit-cta" : "exit-cta heureka-hn-link"}
                    data-trixam-positionid={isEn ? undefined : processorId}
                >
                    <Zap size={20} fill="currentColor" />
                    {isEn ? "CHECK AVAILABILITY" : "ZJISTIT CENU A SKLAD"}
                </a>

                <button onClick={() => setIsVisible(false)} className="exit-dismiss">
                    {isEn ? "I don't need more FPS" : "Děkuji, nechci víc FPS"}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .exit-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); padding: 20px; }
                .exit-card { background: #0f1115; border: 1px solid rgba(147, 51, 234, 0.5); border-radius: 32px; padding: 40px; max-width: 500px; width: 100%; position: relative; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.8); }
                .exit-close { position: absolute; top: 20px; right: 20px; background: none; border: none; color: #4b5563; cursor: pointer; }
                .exit-badge { display: inline-flex; align-items: center; gap: 8px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 6px 16px; border-radius: 100px; font-size: 11px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; }
                .exit-title { color: #fff; font-size: 28px; font-weight: 950; line-height: 1.1; margin-bottom: 15px; }
                .exit-desc { color: #9ca3af; font-size: 16px; margin-bottom: 30px; line-height: 1.5; }
                .exit-product-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; margin-bottom: 30px; }
                .exit-cat { color: #9333ea; font-size: 10px; font-weight: 900; letter-spacing: 2px; display: block; margin-bottom: 5px; }
                .exit-name { color: #fff; font-size: 22px; font-weight: 950; }
                .exit-cta { background: #fff; color: #000; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; border-radius: 16px; font-weight: 950; text-decoration: none; font-size: 16px; transition: 0.3s; text-transform: uppercase; }
                .exit-cta:hover { transform: scale(1.02); background: #facc15; }
                .exit-dismiss { background: none; border: none; color: #4b5563; font-size: 13px; margin-top: 20px; cursor: pointer; text-decoration: underline; }
            `}} />
        </div>
    );
}
