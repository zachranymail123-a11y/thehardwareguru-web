"use client";
import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShoppingCart, X, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicializace proměnných pro měření konverzí z Popupu
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * GURU EXIT INTENT POPUP V14.0 - THE FINAL FUNNEL
 * 🚀 CÍL: Předfiltrovaná Heureka (f=3), SKLADEM trigger, sendBeacon priority, Overlay close UX.
 */

export default function ExitIntentPopup({ cpuName = "Procesor", gpuName = "Grafická karta" }) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180);
    const pathname = usePathname() || '';
    const isEn = pathname.startsWith('/en');

    const triggerPopup = () => {
        if (hasTriggered) return;
        
        const now = Date.now();
        if (typeof window !== 'undefined') {
            localStorage.setItem('guru_timer_start', now.toString());
            localStorage.setItem('guru_exit_shown', now.toString());
        }
        
        setTimeLeft(180); // Tvrdý reset odpočtu
        setIsVisible(true);
        setHasTriggered(true);
    };

    // 1. Logika pro spuštění Popupu s 1h cooldownem (Exit + Timer + SCROLL)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastShown = localStorage.getItem('guru_exit_shown');
            const now = Date.now();
            
            if (lastShown && (now - Number(lastShown) < 3600000)) {
                setHasTriggered(true);
                return;
            }
        }

        let triggered = false; // Debounce proměnná pro ochranu proti race conditions

        const handleMouseOut = (e) => {
            if (e.clientY < 10 && e.relatedTarget === null && !triggered && !hasTriggered) {
                triggered = true;
                triggerPopup();
            }
        };

        const handleScroll = () => {
            if (triggered || hasTriggered) return;
            if (window.scrollY > 800) {
                triggered = true;
                triggerPopup();
            }
        };

        const timer = setTimeout(() => {
            if (!triggered && !hasTriggered) {
                triggered = true;
                triggerPopup();
            }
        }, 15000);

        document.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            document.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [hasTriggered]);

    // 2. Persistentní timer
    useEffect(() => {
        if (!isVisible || typeof window === 'undefined') return;

        let interval;
        const start = localStorage.getItem('guru_timer_start') || Date.now().toString();

        interval = setInterval(() => {
            const diff = Math.floor((Date.now() - Number(start)) / 1000);
            setTimeLeft(Math.max(180 - diff, 0));
        }, 1000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isVisible]);

    // 🔥 FIX 3: Primary sendBeacon pro maximalizaci capture rate při navigaci pryč 🔥
    const handleClick = (e, type) => {
        e.stopPropagation();
        
        const platform = isEn ? 'amazon' : 'heureka';
        const payload = { platform, category: `exit-${type}` };
        
        try {
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, blob);
            } else {
                fetch(`${supabaseUrl}/rest/v1/affiliate_clicks_log`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(() => {});
            }
        } catch (err) {}
        
        setIsVisible(false);
    };

    if (!isVisible) return null;

    // High-Intent jména
    const isHighIntentGpu = /RTX 40|RTX 30|RX 7|RX 6/i.test(gpuName);
    const isHighIntentCpu = /Ryzen 7|Ryzen 5|Core i7|Core i5/i.test(cpuName);

    const targetGpu = isHighIntentGpu ? gpuName : 'RTX 4060';
    const targetCpu = isHighIntentCpu ? cpuName : 'Ryzen 5 5600';

    // 🔥 FIX 1: PŘED-FILTROVANÁ KATEGORIE (&f=3) pro maximalizaci konverze bez search šumu 🔥
    const gpuLink = isEn 
        ? `https://www.amazon.com/s?k=${encodeURIComponent(`${targetGpu} graphics card`)}&tag=thehardware07-20&ascsubtag=exit-popup-gpu` 
        : `https://graficke-karty.heureka.cz/?haff=276049&hanoi-service=1&f=3&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=ExitPopup`;

    const cpuLink = isEn 
        ? `https://www.amazon.com/s?k=${encodeURIComponent(`${targetCpu} processor cpu`)}&tag=thehardware07-20&ascsubtag=exit-popup-cpu` 
        : `https://procesory.heureka.cz/?haff=276049&hanoi-service=1&f=3&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=ExitPopup`;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = String(timeLeft % 60).padStart(2, '0');

    return (
        // 🔥 FIX 2: Kliknutí mimo zavře popup (overlay click) 🔥
        <div 
            onClick={() => setIsVisible(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}
        >
            <div 
                // Zabrání zavření při kliknutí dovnitř modalu
                onClick={(e) => e.stopPropagation()}
                style={{ background: 'linear-gradient(135deg, #111827 0%, #000000 100%)', border: '1px solid #a855f7', borderRadius: '24px', padding: '40px', maxWidth: '600px', width: '90%', position: 'relative', boxShadow: '0 25px 50px rgba(168, 85, 247, 0.2)', textAlign: 'center', animation: 'scaleIn 0.3s ease-out', cursor: 'default' }}
            >
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '5px', touchAction: 'manipulation' }}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(234, 179, 8, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '20px' }}>
                    <AlertTriangle size={40} color="#eab308" />
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '10px', lineHeight: '1.2' }}>
                    {isEn ? "Wait! Don't leave your FPS on the table!" : "Počkej! Nenechávej své FPS na stole!"}
                </h2>
                
                <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '25px' }}>
                    {isEn 
                        ? <>Your PC is losing performance <strong>EVERY SECOND</strong> due to a bottleneck. Upgrading to {targetGpu} fixes this instantly.</>
                        : <>Tvůj PC ztrácí výkon <strong>KAŽDOU SEKUNDU</strong> kvůli bottlenecku. Upgrade na {targetGpu} to okamžitě vyřeší.</>}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '5px', padding: '10px', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '12px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                        <span style={{ fontSize: '14px', color: '#f87171', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {isEn ? `⏳ Deals expire in: ${minutes}:${seconds}` : `⏳ Sleva končí za: ${minutes}:${seconds}`}
                        </span>
                    </div>

                    {/* Single GPU CTA */}
                    <a 
                        href={gpuLink} 
                        target="_blank" 
                        rel="nofollow sponsored noopener noreferrer" 
                        onClick={(e) => handleClick(e, 'gpu')} 
                        className="hover-scale"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(90deg, #9333ea 0%, #06b6d4 100%)', color: '#fff', padding: '18px', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase', textDecoration: 'none', transition: '0.3s', boxShadow: '0 10px 20px rgba(168, 85, 247, 0.3)', width: '100%', cursor: 'pointer', willChange: 'transform', touchAction: 'manipulation' }}
                    >
                        <Zap size={20} />
                        {/* 🔥 FIX 4: SKLADEM = The Ultimate Conversion Trigger 🔥 */}
                        {isEn ? `🔥 ${targetGpu} - BEST DEALS IN STOCK` : `🔥 ${targetGpu} – NEJLEVNĚJŠÍ SKLADEM DNES`}
                    </a>
                    
                    <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 800, marginBottom: '8px' }}>
                        🚀 {isEn ? "Instant FPS boost after upgrade" : "Okamžité zlepšení FPS po upgradu"}
                    </div>

                    {/* CTA 2: Procesor */}
                    <a 
                        href={cpuLink} 
                        target="_blank" 
                        rel="nofollow sponsored noopener noreferrer" 
                        onClick={(e) => handleClick(e, 'cpu')} 
                        className="hover-scale"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase', textDecoration: 'none', transition: '0.3s', width: '100%', cursor: 'pointer', willChange: 'transform', touchAction: 'manipulation', marginTop: '4px' }}
                    >
                        <ShoppingCart size={20} color="#a855f7" />
                        {/* 🔥 FIX 4: SKLADEM = The Ultimate Conversion Trigger 🔥 */}
                        {isEn ? `🔥 ${targetCpu} - IN STOCK DEALS` : `🔥 ${targetCpu} – KDE KOUPIT NEJLEVNĚJI (SKLADEM)`}
                    </a>

                    <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 700, marginTop: '8px' }}>
                        {isEn ? "✔ Verified today • 1200+ users clicked" : "✔ Ověřeno dnes • 1200+ uživatelů kliklo"}
                    </div>
                </div>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }} 
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.9rem', marginTop: '25px', cursor: 'pointer', textDecoration: 'underline', touchAction: 'manipulation' }}
                >
                    {isEn ? "No thanks, I like my stuttering PC." : "Ne, díky, vyhovuje mi, když se mi PC seká."}
                </button>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .hover-scale { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s; }
                .hover-scale:hover { transform: scale(1.02); filter: brightness(1.1); }
            `}} />
        </div>
    );
}
