"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicializace Supabase pro měření konverzí z tohoto specifického tlačítka
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GURU MOBILE STICKY BUTTON V2.10 - DEFINITIVNÍ HEUREKA FIX
 * 🚀 CÍL: Fix na www.heureka.cz s parametrem h[fraze] a utm_content=Text%20link.
 */

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const isEn = pathname.startsWith('/en');

    // Tlačítko se objeví až po odskrolování 300px
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const trackClick = () => {
        const platform = isEn ? 'amazon' : 'heureka';
        supabase.from('affiliate_clicks_log').insert([{ platform, category: 'sticky_mobile' }]).then();
    };

    // 🔥 DEFINITIVNÍ FIX: www.heureka.cz + ?h[fraze] parametr + Text%20link 🔥
    const link = isEn 
        ? "https://www.amazon.com/s?k=pc+components&tag=thehardware07-20" 
        : "https://www.heureka.cz/?h%5Bfraze%5D=pc+komponenty#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";

    const text = isEn ? "SEE TODAY'S DEALS" : "ZJISTIT DNEŠNÍ SLEVY";

    if (!isVisible) return null;

    return (
        <div className="guru-mobile-sticky-wrapper">
            <a 
                onClick={trackClick}
                href={link}
                target="_blank"
                rel="nofollow sponsored"
                /* 🔥 AKTIVACE HEUREKA TRACKINGU 🔥 */
                className={`guru-mobile-sticky-btn ${!isEn ? 'heureka-hn-link' : ''}`}
                data-trixam-positionid="276026"
                data-trixam-codetype="link"
            >
                <ShoppingCart size={20} color="white" />
                <span>{text}</span>
            </a>
        </div>
    );
}
