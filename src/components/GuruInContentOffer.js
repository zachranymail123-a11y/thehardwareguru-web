'use client';
import React from 'react';
import { ShoppingCart, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function GuruInContentOffer({ 
    productName, 
    category = "gpu", 
    isEn = false,
    reason = "upgrade",
    subId: customSubId
}) {
    const pathname = usePathname() || '';
    const isAmazon = isEn || pathname.includes('/en');
    
    if (!productName) return null;

    // 🔥 PŘESNÁ ID Z ADMINU HEUREKY PODLE KATEGORIE 🔥
    const posIds = {
        gpu: "276026", // Grafické karty
        cpu: "276027"  // Procesory
    };

    const getLink = () => {
        const subId = customSubId || `v12-smart-${category}-${reason}`;
        let query = productName;
        
        if (isAmazon) {
            return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=thehardware07-20&ascsubtag=${subId}`;
        }

        // Formát URL přesně podle administrace Heureky
        const lowerQuery = query.toLowerCase();
        if (category === 'gpu' && !lowerQuery.includes('grafická')) query += " grafická karta";
        if (category === 'cpu' && !lowerQuery.includes('procesor')) query += " procesor";
        
        return `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(query)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
    };

    const ui = isEn ? {
        label: "GURU VERIFIED",
        desc: `Top-tier ${category.toUpperCase()} for maximum gaming performance.`,
        btn: "CHECK PRICE & AVAILABILITY"
    } : {
        label: "GURU OVĚŘENO",
        desc: `Nejlepší ${category.toUpperCase()} v poměru cena/výkon pro tvůj build.`,
        btn: "ZJISTIT DOSTUPNOST A CENU"
    };

    return (
        <div className="guru-v12-box">
            <div className="v12-content">
                <div className="v12-badge">
                    <ShieldCheck size={14} /> {ui.label}
                </div>
                <h3 className="v12-title">{productName}</h3>
                <p className="v12-desc">{ui.desc}</p>
                
                {/* 🔥 ABSOLUTNĚ KLÍČOVÁ OPRAVA: TŘÍDA A POSITION ID PRO TRACKING 🔥 */}
                <a 
                    href={getLink()} 
                    target="_blank" 
                    rel="sponsored noopener" 
                    className={isAmazon ? "v12-button" : "v12-button heureka-hn-link"}
                    data-trixam-positionid={isAmazon ? undefined : (posIds[category] || "276026")}
                >
                    <ShoppingCart size={18} />
                    {ui.btn}
                </a>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-v12-box {
                    background: #0a0a0a;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    padding: 35px 20px;
                    margin: 30px auto;
                    max-width: 600px;
                    position: relative;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .v12-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                }
                .v12-title {
                    color: #fff;
                    font-size: 28px;
                    font-weight: 950;
                    margin: 0 0 10px 0;
                    text-transform: uppercase;
                    letter-spacing: -0.5px;
                }
                .v12-desc {
                    color: #9ca3af;
                    font-size: 15px;
                    margin: 0 0 25px 0;
                    font-weight: 500;
                }
                .v12-button {
                    background: #fff;
                    color: #000;
                    padding: 16px 32px;
                    border-radius: 16px;
                    font-weight: 950;
                    font-size: 15px;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    text-transform: uppercase;
                }
                .v12-button:hover {
                    transform: translateY(-3px) scale(1.02);
                    background: #facc15;
                    box-shadow: 0 10px 25px rgba(250, 204, 21, 0.2);
                }
                @media (max-width: 640px) {
                    .v12-title { font-size: 22px; }
                    .v12-button { width: 100%; justify-content: center; font-size: 13px; }
                }
            `}} />
        </div>
    );
}
