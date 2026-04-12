"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const HIGH_END_REGEX = /4090|4080|4070|7900|7800/;

const computeDecision = (currentSubId, strength, amazonVariant, currentVariant, isHighEnd) => {
    let query = isHighEnd ? "rtx+4070+super+12gb" : "rtx+4060+8gb+graphics+card";
    let amzPriceFilter = isHighEnd ? "p_36:15000-40000" : "p_36:7000-15000"; 

    if (strength === 'hot') {
        query = isHighEnd ? "rtx+4080+super+16gb+card" : "rtx+4070+super+12gb+card";
        amzPriceFilter = isHighEnd ? "p_36:25000-60000" : "p_36:15000-30000";
    } else if (strength === 'warm') {
        query = isHighEnd ? "rtx+4070+ti+super+16gb" : "rtx+4060+ti+16gb+card";
        amzPriceFilter = isHighEnd ? "p_36:20000-35000" : "p_36:10000-18000";
    }

    const amzParams = new URLSearchParams({
        k: query,
        tag: 'thehardware07-20',
        ascsubtag: currentSubId,
        s: 'featured',
        rh: `${amzPriceFilter},p_n_condition-type:6461716011,p_n_feature_thirty-three_browse-bin:23720418011`
    });
    
    const amz = `https://www.amazon.com/s?${amzParams.toString()}`;
    const h_gpu = `https://graficke-karty.heureka.cz/?haff=276049&hanoi-service=1&utmi_cp=1&f=3&min-price=${isHighEnd ? 18000 : 5000}${isHighEnd ? '&max-price=60000&sort=price_desc' : ''}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${currentSubId}`;
    const h_cpu = `https://procesory.heureka.cz/?haff=276049&hanoi-service=1&utmi_cp=1&f=3&min-price=${isHighEnd ? 8000 : 3000}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${currentSubId}`;
    
    const finalTargetLink = amazonVariant ? amz : (currentVariant === 'cpu' ? h_cpu : h_gpu);
    
    return { 
        finalTargetLink, 
        platform: amazonVariant ? 'amazon' : 'heureka',
        query, 
        strength 
    };
};

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [funnelVariant, setFunnelVariant] = useState('gpu');
    const [isCzUser, setIsCzUser] = useState(false);
    const [delaySticky, setDelaySticky] = useState(false);
    const [scrollDepth, setScrollDepth] = useState(0); 
    const [useAmazon, setUseAmazon] = useState(null);
    
    const trackedRef = useRef(false);
    const reengagedRef = useRef(false);
    const subIdRef = useRef('');
    const subIdLockedRef = useRef(null); 
    const funnelLockRef = useRef(null); 
    const urgencyRef = useRef('');
    const handleScrollRef = useRef(null);
    const clickLockRef = useRef(false);
    const impressionSentRef = useRef(false);
    const amazonVariantRef = useRef(null);
    const lastDepthBucketRef = useRef(0);
    const baseMetaRef = useRef(null); 

    const lowerPath = pathname.toLowerCase();
    const isEn = lowerPath.startsWith('/en');
    const isHighEnd = HIGH_END_REGEX.test(lowerPath) 
        || lowerPath.includes('bottleneck') || lowerPath.includes('high-end') 
        || lowerPath.includes('4k') || lowerPath.includes('ultra');

    useEffect(() => {
        funnelLockRef.current = null;
        subIdLockedRef.current = null;
        impressionSentRef.current = false;
        reengagedRef.current = false;
        trackedRef.current = false;
    }, [pathname]);

    const intentSource = useMemo(() => {
        if (pathname.includes('bottleneck')) return 'calc';
        if (pathname.includes('gpu')) return 'gpu';
        if (pathname.includes('cpu')) return 'cpu';
        return 'generic';
    }, [pathname]);

    const getIntentStrength = (depth) => {
        if (typeof window === 'undefined') return 'cold';
        const vh = window.innerHeight || 800;
        if (depth > vh * 2.2) return 'hot';
        if (depth > 800) return 'warm';
        return 'cold';
    };

    const buildSubId = (cz, variant, returning, depth = 0) => {
        if (typeof window === 'undefined' || !baseMetaRef.current) return '';
        const { device, geo, source } = baseMetaRef.current;
        const sessionTime = typeof performance !== 'undefined' ? Math.floor(performance.now() / 1000) : 0;
        const pages = typeof sessionStorage !== 'undefined' ? Number(sessionStorage.getItem('guru_pages') || 1) : 1;
        const engagement = pages > 3 ? 'hot' : (sessionTime > 60 ? 'engaged' : 'cold');
        const strength = getIntentStrength(depth);
        return ['v35', 'sticky', variant, returning ? 'ret' : 'new', isHighEnd ? 'high' : 'mid', device, geo, source, engagement, strength, intentSource].join('-');
    };

    if (!subIdLockedRef.current && subIdRef.current) {
        subIdLockedRef.current = subIdRef.current;
    }

    if (subIdLockedRef.current && useAmazon !== null && !funnelLockRef.current) {
        funnelLockRef.current = computeDecision(
            subIdLockedRef.current,
            getIntentStrength(scrollDepth),
            useAmazon,
            funnelVariant,
            isHighEnd
        );
    }
    const decision = funnelLockRef.current;

    useEffect(() => {
        if (useAmazon !== null) return; 
        if (amazonVariantRef.current === null) {
            const variant = isEn || (!isCzUser && Math.random() < 0.7);
            amazonVariantRef.current = variant;
            setUseAmazon(variant);
        } else {
            setUseAmazon(amazonVariantRef.current);
        }
    }, [isCzUser, isEn, useAmazon]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const pages = Number(sessionStorage.getItem('guru_pages') || 0);
        sessionStorage.setItem('guru_pages', (pages + 1).toString());
        const nav = typeof navigator !== 'undefined' ? navigator : null;
        const tz = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || '';
        const cz = tz.includes('Prague') || (nav && (nav.language?.includes('cs') || (nav.languages && nav.languages.some(l => l.includes('cs')))));
        setIsCzUser(!!cz);
        if (nav && !baseMetaRef.current) {
            const device = /Mobi|Android/i.test(nav.userAgent) ? 'm' : 'd';
            const geo = !!cz ? 'cz' : 'int';
            const host = window.location.hostname;
            const ref = document.referrer;
            const source = ref && host && ref.includes(host) ? 'internal' : ref ? 'external' : 'direct';
            baseMetaRef.current = { device, geo, source };
        }
    }, []);

    useEffect(() => {
        const newSubId = buildSubId(isCzUser, funnelVariant, isReturning, scrollDepth);
        if (newSubId) subIdRef.current = newSubId;
    }, [isCzUser, funnelVariant, isReturning, scrollDepth]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        let timeout;
        let attached = false;
        if (!urgencyRef.current) urgencyRef.current = "TOP NABÍDKA";
        const lastExitTs = Number(localStorage.getItem('guru_exit_shown_ts') || 0);
        const seenExit = sessionStorage.getItem('guru_exit_shown') === '1' || (lastExitTs && (Date.now() - lastExitTs < 3600000));
        if (seenExit) {
            setDelaySticky(true);
            timeout = setTimeout(() => setDelaySticky(false), 30000);
        }
        let variant = localStorage.getItem('sticky_funnel_variant');
        if (!variant) {
            const pages = typeof sessionStorage !== 'undefined' ? Number(sessionStorage.getItem('guru_pages') || 0) : 0;
            variant = pages > 2 ? 'gpu' : (Math.random() < 0.6 ? 'gpu' : 'cpu');
            localStorage.setItem('sticky_funnel_variant', variant);
        }
        setFunnelVariant(variant);
        setIsReturning(localStorage.getItem('visited_before') === '1');
        let ticking = false;
        handleScrollRef.current = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(() => {
                    const triggerPoint = Math.max(300, window.innerHeight * 0.6);
                    if (window.scrollY > triggerPoint) {
                        setIsVisible(true);
                        sessionStorage.setItem('sticky_seen', '1');
                        localStorage.setItem('sticky_last_shown', Date.now().toString());
                        window.removeEventListener('scroll', handleScrollRef.current);
                    }
                    setScrollDepth(window.scrollY);
                    ticking = false;
                });
            }
        };
        if (sessionStorage.getItem('sticky_seen') === '1' || seenExit) {
            setIsVisible(true);
        } else {
            window.addEventListener('scroll', handleScrollRef.current, { passive: true });
            attached = true;
        }
        return () => {
            if (attached && handleScrollRef.current) window.removeEventListener('scroll', handleScrollRef.current);
            if (timeout) clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        if (!isVisible || impressionSentRef.current || typeof window === 'undefined' || !decision) return;
        impressionSentRef.current = true;
        const payload = { event: 'impression', page: pathname, sub_id: subIdLockedRef.current, intent_strength: decision.strength, platform: decision.platform };
        const beaconUrl = `${supabaseUrl}/rest/v1/affiliate_impressions?apikey=${supabaseKey}`;
        if (navigator.sendBeacon) navigator.sendBeacon(beaconUrl, new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' }));
    }, [isVisible, decision]);

    const uiText = useMemo(() => {
        if (!decision) return "";
        const isDiscountUser = isReturning || scrollDepth > 1500;
        const gpuPrice = isDiscountUser ? (isHighEnd ? "14 990 (-17%)" : "6 490 (-14%)") : (isHighEnd ? "15 990 (-11%)" : "6 990 (-7%)");
        const cpuPrice = isDiscountUser ? (isHighEnd ? "6 490 (-19%)" : "3 490 (-18%)") : (isHighEnd ? "6 990 (-13%)" : "3 990 (-7%)");
        const gpuName = isHighEnd ? (decision.strength === 'hot' ? "RTX 4080 Super 16GB" : "RTX 4070 Super 12GB") : (decision.strength === 'hot' ? "RTX 4070 Super 12GB" : "RTX 4060 8GB");
        const cpuName = isHighEnd ? "Ryzen 7 7800X3D" : "Ryzen 5 7600";
        const urgency = decision.strength === 'hot' ? "SKLADEM DNES" : urgencyRef.current;
        if (useAmazon) return `🔥 ${gpuName} DEALS - ${decision.strength === 'hot' ? "BEST PRICE" : "LAST PIECES"} ⚡`;
        if (funnelVariant === 'cpu') return isReturning ? `🔥 ${cpuName} OD ${cpuPrice} ⚡` : `🔥 ${cpuName} OD ${cpuPrice} – ${urgency}`;
        return isReturning ? `🔥 ${gpuName} OD ${gpuPrice} ⚡` : `🔥 ${gpuName} OD ${gpuPrice} – ${urgency}`;
    }, [decision, isReturning, scrollDepth, isHighEnd, useAmazon, funnelVariant]);

    const handleClick = (e) => {
        if (clickLockRef.current || !decision) return;
        clickLockRef.current = true;
        if (e && e.cancelable) { e.preventDefault(); e.stopPropagation(); }
        setTimeout(() => { clickLockRef.current = false; }, 800);
        const nav = typeof navigator !== 'undefined' ? navigator : null;
        if (nav?.vibrate && decision.strength !== 'cold') nav.vibrate(10);
        const redirectLink = `/go?to=${encodeURIComponent(decision.finalTargetLink)}&subid=${subIdLockedRef.current}`;
        const payload = { platform: decision.platform, category: 'sticky_mobile', sub_id: subIdLockedRef.current, page: pathname };
        const beaconUrl = `${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`;
        if (nav?.sendBeacon) nav.sendBeacon(beaconUrl, new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' }));
        if (typeof window !== 'undefined') {
            localStorage.setItem('sticky_clicks', (Number(localStorage.getItem('sticky_clicks') || 0) + 1).toString());
            localStorage.setItem('sticky_last_click', Date.now().toString());
            let newTab = null;
            try { newTab = window.open('about:blank', '_blank', 'noopener,noreferrer'); } catch (err) {}
            if (newTab && !newTab.closed) newTab.location.href = redirectLink;
            else window.location.href = redirectLink;
        }
    };

    if (useAmazon === null) return null; 
    if (!isVisible || delaySticky || !decision) return null; 
    const clickCount = typeof window !== 'undefined' ? Number(localStorage.getItem('sticky_clicks') || 0) : 0;
    const lastClickTime = typeof window !== 'undefined' ? Number(localStorage.getItem('sticky_last_click') || 0) : 0;
    if (clickCount > 4 && (Date.now() - lastClickTime < 86400000)) return null;

    return (
        <div className="guru-mobile-sticky-wrapper">
            <a onPointerDown={handleClick} href={decision.finalTargetLink} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-mobile-sticky-btn">
                <span style={{ position: 'absolute', top: '-6px', right: '15px', background: '#22c55e', color: 'white', padding: '2px 10px', fontSize: '10px', borderRadius: '20px', fontWeight: '900', boxShadow: '0 4px 10px rgba(34, 197, 94, 0.4)', border: '2px solid #000' }}>
                    ✔ SKLADEM DNES • 🔥 NEJPRODÁVANĚJŠÍ • ⚡ DOPORUČENO
                </span>
                <Zap size={20} color="white" />
                <span>{uiText}</span>
            </a>
            <style dangerouslySetInnerHTML={{__html: `
                .guru-mobile-sticky-wrapper {
                    position: fixed; 
                    bottom: 80px; /* 🔥 FIX: Posunuto nad Mobile Anchor Ad pro bezpečnost revenue 🔥 */
                    left: 15px; right: 15px; 
                    z-index: 999999;
                    padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
                    animation: slideUpSticky 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    will-change: transform; backface-visibility: hidden; transform: translate3d(0,0,0);
                    contain: layout style paint; pointer-events: auto;
                    background: transparent !important;
                }
                .guru-mobile-sticky-btn {
                    position: relative; display: flex; align-items: center; justify-content: center; gap: 10px;
                    background: linear-gradient(90deg, #9333ea 0%, #06b6d4 100%);
                    color: #fff; padding: 16px; border-radius: 16px; font-weight: 950; text-transform: uppercase;
                    text-decoration: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(168, 85, 247, 0.4);
                    transition: transform 0.1s ease-out, filter 0.2s; width: 100%; box-sizing: border-box;
                    touch-action: manipulation; font-size: 13px; letter-spacing: 0.3px; cursor: pointer;
                    animation: slideUpSticky 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), pulseGlow 8s infinite 1s;
                }
                .guru-mobile-sticky-btn:active { transform: scale(0.94); filter: brightness(1.2); }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 0 rgba(168, 85, 247, 0.4); }
                    50% { box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 25px rgba(168, 85, 247, 0.7); }
                }
                @keyframes slideUpSticky { from { transform: translateY(150px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}} />
        </div>
    );
}
