"use client";
import React from 'react';
import { Zap, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
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
    
    // Pokud není zadáno jméno, komponenta se nezobrazí (bezpečnostní pojistka)
    if (!productName) return null;

    const getLink = () => {
        const subId = customSubId || `v10-smart-${category}-${reason}`;
        let query = productName;

        if (!isAmazon) {
            // High-conversion logic: Přidání kategorie pro Heureku, pokud tam chybí
            const lowerQuery = query.toLowerCase();
            if (category === 'gpu' && !lowerQuery.includes('grafická')) query += " grafická karta";
            if (category === 'cpu' && !lowerQuery.includes('procesor')) query += " procesor";
            if (category === 'mb' && !lowerQuery.includes('deska')) query += " základní deska";
            
            return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeURIComponent(query)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}&o=3`;
        }
        
        return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=thehardware07-20&ascsubtag=${subId}`;
    };

    // Inteligentní textace podle důvodu zobrazení
    const getText = () => {
        const texts = {
            cs: {
                winner: { badge: "VÍTĚZ DUELU", desc: "Tento komponent vyhrál v testu" },
                fix: { badge: "REŠENÍ BOTTLENECKU", desc: "Tento upgrade odstraní brzdění výkonu" },
                upgrade: { badge: "GURU DOPORUČENÍ", desc: "Nejlepší volba pro maximální FPS" },
                btn: "ZJISTIT CENU A DOSTUPNOST"
            },
            en: {
                winner: { badge: "DUEL WINNER", desc: "This component won the benchmark" },
                fix: { badge: "BOTTLENECK FIX", desc: "This upgrade eliminates system lag" },
                upgrade: { badge: "GURU CHOICE", desc: "Best value for high-end gaming" },
                btn: "CHECK PRICE & AVAILABILITY"
            }
        };
        return isEn ? texts.en[reason] : texts.cs[reason];
    };

    const ui = getText();

    return (
        <div className="guru-smart-offer">
            <div className="smart-glow" />
            <div className="offer-header">
                <div className={`offer-badge badge-${reason}`}>
                    <TrendingUp size={12} /> {ui.badge}
                </div>
                <div className="offer-verified">
                    <ShieldCheck size={14} /> {isEn ? "STOCKED" : "SKLADEM"}
                </div>
            </div>
            
            <div className="offer-body">
                <div className="product-info">
                    <span className="product-category">{category.toUpperCase()}</span>
                    <h3 className="product-name">{productName}</h3>
                    <p className="product-status">{ui.desc}</p>
                </div>
                
                <a 
                    href={getLink()} 
                    target="_blank" 
                    rel="nofollow sponsored" 
                    className="smart-cta-btn"
                >
                    <span>{isEn ? "BUY NOW" : "KOUPIT"}</span>
                    <ArrowRight size={18} />
                </a>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-smart-offer {
                    background: #0f1115;
                    border: 1px solid rgba(147, 51, 234, 0.4);
                    border-radius: 20px;
                    padding: 24px;
                    margin: 30px 0;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .smart-glow {
                    position: absolute; top: 0; right: 0; width: 150px; height: 150px;
                    background: radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                .offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .offer-badge { font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 8px; display: flex; align-items: center; gap: 5px; color: #fff; }
                .badge-winner { background: #eab308; }
                .badge-fix { background: #f43f5e; }
                .badge-upgrade { background: #9333ea; }
                .offer-verified { color: #22c55e; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px; }
                .product-category { color: #9333ea; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; }
                .product-name { color: #fff; font-size: 20px; font-weight: 950; margin: 4px 0; }
                .product-status { color: #9ca3af; font-size: 13px; margin: 0; font-weight: 500; }
                .smart-cta-btn {
                    background: #fff; color: #000; padding: 12px 24px; border-radius: 12px;
                    font-weight: 950; font-size: 14px; text-decoration: none;
                    display: flex; align-items: center; gap: 8px; transition: 0.2s;
                    box-shadow: 0 4px 12px rgba(255,255,255,0.1);
                }
                .smart-cta-btn:hover { transform: scale(1.03); background: #9333ea; color: #fff; }
                @media (max-width: 640px) {
                    .offer-body { flex-direction: column; gap: 20px; text-align: center; }
                    .smart-cta-btn { width: 100%; justify-content: center; }
                }
            `}} />
        </div>
    );
}
