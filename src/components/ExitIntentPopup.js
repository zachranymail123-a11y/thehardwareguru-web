"use client";
import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShoppingCart, X, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔥 2026 HARDWARE CONSTANTS
const HIGH_END_HW = /5090|5080|5070|4090|9950X|9900X|ultra|high-end/i;

export default function ExitIntentPopup({ cpuName = "Procesor", gpuName = "Grafická karta" }) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180);
    const pathname = usePathname() || '';
    
    const isEn = pathname.startsWith('/en');
    const platform = isEn ? 'amazon' : 'heureka';

    const triggerPopup = () => {
        if (hasTriggered) return;
        const now = Date.now();
        if (typeof window !== 'undefined') {
            localStorage.setItem('guru_timer_start', now.toString());
            localStorage.setItem('guru_exit_shown', now.toString());
        }
        setTimeLeft(180);
        setIsVisible(true);
        setHasTriggered(true);
    };

    // 1. Logika spuštění a Cooldown
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const lastShown = localStorage.getItem('guru_exit_shown');
        if (lastShown && (Date.now() - Number(lastShown) < 3600000)) {
            setHasTriggered(true);
            return;
        }

        let triggered = false;
        const handleMouseOut = (e) => {
            if (e.clientY < 10 && !triggered && !hasTriggered) {
                triggered = true;
                triggerPopup();
            }
        };

        const handleScroll = () => {
            if (triggered || hasTriggered) return;
            if (window.scrollY > 1200) {
                triggered = true;
                triggerPopup();
            }
        };

        const timer = setTimeout(() => {
            if (!triggered && !hasTriggered) {
                triggered = true;
                triggerPopup();
            }
        }, 25000);

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
        const start = localStorage.getItem('guru_timer_start') || Date.now().toString();
        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - Number(start)) / 1000);
            setTimeLeft(Math.max(180 - diff, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [isVisible]);

    // 3. Hardware Intent Detection 2026
    const targetGpu = HIGH_END_HW.test(gpuName) ? "RTX 5080" : "RTX 5060";
    const targetCpu = HIGH_END_HW.test(cpuName) ? "Ryzen 9 9950X" : "Ryzen 7 9700X";

    // 4. 🔥 FIX: Čistý vyhledávací string s haff ID a bezpečnými plusy
    const getLink = (type) => {
        const subId = `v15-exit-${type}`;
        const rawQuery = type === 'gpu' ? targetGpu : targetCpu;

        if (platform === 'amazon') {
            const amazonQuery = type === 'gpu' ? `${rawQuery} graphics card` : `${rawQuery} processor`;
            const safeAmazonQuery = amazonQuery.trim().replace(/\s+/g, '+');
            return `https://www.amazon.com/s?k=${safeAmazonQuery}&tag=thehardware07-20&ascsubtag=${subId}&s=featured`;
        }
        
        // POUZE ČISTÝ HAFF ODKAZ NA VYHLEDÁVÁNÍ (h[fraze])
        // .replace(/\s+/g, '+') nahradí mezery čistými znaky "+", takže URL bude "RTX+5080"
        const safeQuery = rawQuery.trim().replace(/\s+/g, '+');
        
        return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_content=${subId}`;
    };

    // 5. 🔥 FIX: Pouze tiché logování
    const handleLogClick = (type) => {
        const payload = { platform, category: `exit_popup_${type}`, sub_id: `v15-exit`, page: pathname };

        // A. sendBeacon (Primary for exit intent)
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        // B. Backup Queue (In case tab closes instantly)
        if (typeof window !== 'undefined') {
            const q = JSON.parse(localStorage.getItem('pending_clicks') || '[]');
            q.push(payload);
            localStorage.setItem('pending_clicks', JSON.stringify(q));
        }
    };

    if (!isVisible) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = String(timeLeft % 60).padStart(2, '0');

    return (
        <div 
            onClick={() => setIsVisible(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2147483647, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#0a0a0a', border: '2px solid #9333ea', borderRadius: '28px', padding: '40px', maxWidth: '550px', width: '90%', position: 'relative', boxShadow: '0 0 50px rgba(147, 51, 234, 0.4)', textAlign: 'center' }}
            >
                <button 
                    onClick={() => setIsVisible(false)}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}
                >
                    <X size={28} />
                </button>

                <div style={{ display: 'inline-flex', background: 'rgba(234, 179, 8, 0.15)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
                    <AlertTriangle size={48} color="#eab308" />
                </div>

                <h2 style={{ fontSize: '2.2rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px', lineHeight: '1.1', letterSpacing: '-1px' }}>
                    {isEn ? "Wait! Your PC is crying!" : "Počkej! Tvůj PC brečí!"}
                </h2>
                
                <p style={{ color: '#d1d5db', fontSize: '1.15rem', marginBottom: '30px', fontWeight: '500' }}>
                    {isEn 
                        ? <>Don't leave with a <strong>bottleneck</strong>. Upgrade to {targetGpu} and unlock your true FPS potential.</>
                        : <>Neodcházej s <strong>bottleneckem</strong>. Upgrade na {targetGpu} ti okamžitě odemkne plný výkon.</>}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '14px', border: '1px solid rgba(248, 113, 113, 0.2)', marginBottom: '10px' }}>
                        <span style={{ fontSize: '15px', color: '#f87171', fontWeight: 900, textTransform: 'uppercase' }}>
                            {isEn ? `⏳ DEALS EXPIRE IN: ${minutes}:${seconds}` : `⏳ SLEVA VYPRŠÍ ZA: ${minutes}:${seconds}`}
                        </span>
                    </div>

                    <a 
                        href={getLink('gpu')}
                        target="_blank"
                        rel="nofollow sponsored"
                        onClick={() => handleLogClick('gpu')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'linear-gradient(90deg, #9333ea 0%, #06b6d4 100%)', color: '#fff', padding: '20px', borderRadius: '18px', fontWeight: '950', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', textDecoration: 'none' }}
                    >
                        <Zap size={22} fill="white" />
                        {isEn ? `🔥 ${targetGpu} - BEST PRICE` : `🔥 ${targetGpu} – NEJLEVNĚJŠÍ SKLADEM`}
                    </a>

                    <a 
                        href={getLink('cpu')}
                        target="_blank"
                        rel="nofollow sponsored"
                        onClick={() => handleLogClick('cpu')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '18px', borderRadius: '18px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none' }}
                    >
                        <ShoppingCart size={20} color="#a855f7" />
                        {isEn ? `CHECK ${targetCpu} DEALS` : `KOUPIT ${targetCpu} NEJLEVNĚJI`}
                    </a>
                </div>

                <button 
                    onClick={() => setIsVisible(false)}
                    style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '0.9rem', marginTop: '30px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isEn ? "I don't care about my performance." : "Nezajímá mě výkon mého PC."}
                </button>
            </div>
        </div>
    );
}
