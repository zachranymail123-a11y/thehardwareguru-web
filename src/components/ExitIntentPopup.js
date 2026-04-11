"use client";
import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShoppingCart, X, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * GURU EXIT INTENT POPUP V2.9 - DEFINITIVE CATEGORY LINKS FIX
 * 🚀 CÍL: Návrat k přímým kategoriím s přesným utm_content=Text%20link.
 */

export default function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const pathname = usePathname() || '';
    const isEn = pathname.startsWith('/en');

    useEffect(() => {
        if (sessionStorage.getItem('guru_exit_shown')) {
            setHasTriggered(true);
            return;
        }

        const handleMouseOut = (e) => {
            if (e.clientY < 10 && e.relatedTarget === null && !hasTriggered) {
                setIsVisible(true);
                setHasTriggered(true);
                sessionStorage.setItem('guru_exit_shown', 'true');
            }
        };

        document.addEventListener('mouseout', handleMouseOut);
        
        return () => {
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [hasTriggered]);

    if (!isVisible) return null;

    // 🔥 DEFINITIVNÍ FIX: Správné odkazy na kategorie přesně dle adminu (Text%20link) 🔥
    const cpuLink = isEn 
        ? "https://www.amazon.com/s?k=computer+processor+cpu&tag=thehardware07-20" 
        : "https://procesory.heureka.cz/#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
        
    const gpuLink = isEn 
        ? "https://www.amazon.com/s?k=graphics+card+gpu&tag=thehardware07-20" 
        : "https://graficke-karty.heureka.cz/#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'linear-gradient(135deg, #111827 0%, #000000 100%)', border: '1px solid #a855f7', borderRadius: '24px', padding: '40px', maxWidth: '600px', width: '90%', position: 'relative', boxShadow: '0 25px 50px rgba(168, 85, 247, 0.2)', textAlign: 'center', animation: 'scaleIn 0.3s ease-out' }}>
                
                <button 
                    onClick={() => setIsVisible(false)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '5px' }}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(234, 179, 8, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '20px' }}>
                    <AlertTriangle size={40} color="#eab308" />
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '10px', lineHeight: '1.2' }}>
                    {isEn ? "Wait! Don't leave your FPS on the table!" : "Počkej! Nenechávej své FPS na stole!"}
                </h2>
                
                <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '30px' }}>
                    {isEn 
                        ? "Before you go, check out today's biggest hardware discounts. Upgrading your bottlenecking component might be cheaper than you think." 
                        : "Než odejdeš, podívej se na dnešní největší slevy hardwaru. Upgrade tvé slabé komponenty může být levnější, než si myslíš."}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <a 
                        href={gpuLink} 
                        target="_blank" 
                        rel="nofollow sponsored" 
                        onClick={() => setIsVisible(false)} 
                        className="heureka-hn-link hover-scale"
                        data-trixam-positionid="276026"
                        data-trixam-codetype="link"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(90deg, #9333ea 0%, #06b6d4 100%)', color: '#fff', padding: '16px', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase', textDecoration: 'none', transition: '0.3s', boxShadow: '0 10px 20px rgba(168, 85, 247, 0.3)' }}
                    >
                        <Zap size={20} />
                        {isEn ? "Show Graphics Card Deals" : "Ukázat slevy grafických karet"}
                    </a>
                    
                    <a 
                        href={cpuLink} 
                        target="_blank" 
                        rel="nofollow sponsored" 
                        onClick={() => setIsVisible(false)} 
                        className="heureka-hn-link hover-scale"
                        data-trixam-positionid="276027"
                        data-trixam-codetype="link"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase', textDecoration: 'none', transition: '0.3s' }}
                    >
                        <ShoppingCart size={20} color="#a855f7" />
                        {isEn ? "Show Processor Deals" : "Ukázat slevy procesorů"}
                    </a>
                </div>

                <button onClick={() => setIsVisible(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.9rem', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }}>
                    {isEn ? "No thanks, I like my stuttering PC." : "Ne, díky, vyhovuje mi, když se mi PC seká."}
                </button>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .hover-scale:hover { transform: scale(1.02); filter: brightness(1.1); }
            `}} />
        </div>
    );
}
