"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicializace Supabase pro měření konverzí z tohoto specifického tlačítka
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const isEn = pathname.startsWith('/en');

    // Tlačítko se objeví až po odskrolování 300px, aby neotravovalo hned v hlavičce
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

    // 🔥 OPRAVA: Přidán haff=276049 a křížek (#) nahrazen ampersandem (&) 🔥
    const link = isEn 
        ? "https://www.amazon.com/s?k=pc+components&tag=thehardware07-20" 
        : "https://www.heureka.cz/?h%5Bfraze%5D=pc+komponenty&haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=StickyMobile";

    // 🔥 AGRESIVNÍ TEXTY PRO MAXIMÁLNÍ CTR 🔥
    const text = isEn ? "SEE TODAY'S DEALS" : "ZJISTIT DNEŠNÍ SLEVY";

    if (!isVisible) return null;

    return (
        <div className="guru-mobile-sticky-wrapper">
            <a 
                onClick={trackClick}
                href={link}
                target="_blank"
                rel="nofollow sponsored"
                className="guru-mobile-sticky-btn"
            >
                <ShoppingCart size={20} color="white" />
                <span>{text}</span>
            </a>
        </div>
    );
}
