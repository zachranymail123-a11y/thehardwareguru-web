'use client';
import React from 'react';
import { ShoppingCart, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function GuruInContentOffer({ 
    productName, 
    category = "gpu", 
    isEn = false,
    reason = "upgrade", // 'upgrade', 'winner', 'fix'
    subId: customSubId
}) {
    const pathname = usePathname() || '';
    const isAmazon = isEn || pathname.includes('/en');
    
    // Pojistka proti prázdnému názvu
    if (!productName) return null;

    const getLink = () => {
        const subId = customSubId || `v12-smart-${category}-${reason}`;
        let query = productName;

        if (!isAmazon) {
            // High-conversion logic pro Heureku (o=3, kategorie)
            const lowerQuery = query.toLowerCase();
            if (category === 'gpu' && !lowerQuery.includes('grafická')) query += " grafická karta";
            if (category === 'cpu' && !lowerQuery.includes('procesor')) query += " procesor";
            if (category === 'mb' && !lowerQuery.includes('deska')) query += " základní deska";
            
            return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeURIComponent(query)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}&o=3`;
        }
        
        return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=thehardware07-20&ascsubtag=${subId}`;
    };

    // Textace pro V12
    const getCtaText = () => {
        if (isEn) return {
            reasonLabel: "GURU VERIFIED",
            subText: `This is the ultimate ${category.toUpperCase()} upgrade for maximizing FPS.`,
            btn: "CHECK PRICE & AVAILABILITY"
        };
        
        return {
            reasonLabel: "GURU OVĚŘENO",
            subText: `Tento ${category.toUpperCase()} je nejvýhodnější volba pro boost FPS a plynulost.`,
            btn: "ZJISTIT DOSTUPNOST A CENU"
        };
    };

    const ctaUi = getCtaText();

    return (
        <div className="guru-offer-d2a">
            {/* Inteligentní, hluboký background */}
            <div className="offer-bg-deep" />
            
            <div className="offer-content">
                <div className="offer-verified-badge">
                    <ShieldCheck size={16} className="verified-icon" /> {ctaUi.reasonLabel}
                </div>
                
                <h3 className="product-title">{productName}</h3>
                <p className="product-reason">{ctaUi.subText}</p>
                
                <a 
                    href={getLink()} 
                    target="_blank" 
                    rel="nofollow sponsored" 
                    className="offer-cta-btn-d2a"
                >
                    <ShoppingCart size={20} fill="currentColor" />
                    {ctaUi.btn}
                </a>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-offer-d2a {
                    background: #111111;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 30px;
                    margin: 25px 0;
                    position: relative;
                    overflow: hidden;
                    text-align: center;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                }
                .offer-bg-deep {
                    position: absolute; top: -100px; right: -100px; width: 250px; height: 250px;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
                    pointer-events: none;
                }
                .offer-content { position: relative; z-index: 2; width: 100%; display: flex; flex-direction: column; align-items: center; }
                .offer-verified-badge { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px; }
                .product-title { color: #fff; font-size: 26px; font-weight: 950; margin: 0 0 8px 0; text-transform: uppercase; }
                .product-reason { color: #d1d5db; font-size: 14px; margin: 0 0 25px 0; font-weight: 500; max-width: 380px; }
                .offer-cta-btn-d2a { background: #fff; color: #000; padding: 16px 35px; border-radius: 14px; font-weight: 950; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s ease-in-out; box-shadow: 0 4px 10px rgba(0,0,0,0.2); width: auto; }
                .offer-cta-btn-d2a:hover { transform: scale(1.03); background: #fef08a; box-shadow: 0 8px 25px rgba(254, 240, 138, 0.2); }
                @media (max-width: 640px) {
                    .offer-cta-btn-d2a { width: 100%; font-size: 14px; }
                    .product-title { font-size: 22px; }
                }
            `}} />
        </div>
    );
}
