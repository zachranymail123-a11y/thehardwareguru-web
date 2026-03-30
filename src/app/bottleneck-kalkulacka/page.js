import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';
import SeznamAd from '../../components/SeznamAd';

/**
 * GURU BOTTLENECK CALCULATOR - HUB V1.6 (MONEY FIX UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", odstranění mrtvé zóny, přidání Sticky Bottom Anchor. Zákaz cache zachován.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; // 🚀 GURU FIX: Absolutní zákaz cache pro tuto stránku

export const metadata = {
    title: 'PC Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější AI simulátor bottlenecku. Zjisti, jestli tvůj procesor brzdí grafiku.',
};

export default async function BottleneckPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Chyba konfigurace (Missing ENV).</div>;
    }

    // 🚀 GURU FIX: Supabase klient s vynuceným 'no-store', aby ignoroval Vercel Cache
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    });

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, vendor, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, vendor, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    return (
        <div className="guru-page-container" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            {/* 🚀 RESPONSIVE ADS SYSTEM & MOBILE OPTIMIZATION */}
            <style dangerouslySetInnerHTML={{ __html: `
                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .ad-mobile-wrapper { display: none; width: 100%; }

                /* 🔥 STICKY BOTTOM ANCHOR CSS */
                .sticky-bottom-anchor {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: rgba(10, 11, 13, 0.98);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9999;
                    padding: 10px 0;
                    display: flex;
                    justify-content: center;
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
                }

                @media (max-width: 768px) {
                    .guru-page-container { padding-top: 80px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .inner-container { padding: 0 15px !important; }
                }
            `}} />

            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* 🔥 GURU MONEY FIX: TOP BANNER ABOVE FOLD */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <div className="ad-desktop-wrapper">
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>
                    <div className="ad-mobile-wrapper" style={{ margin: '0 -20px' }}>
                        <SeznamAd zoneId={408651} width={300} height={250} />
                    </div>
                </div>

                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={gamesRes.data || []} 
                />

            </div>

            {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
            <div className="sticky-bottom-anchor">
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={90} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={100} />
                </div>
            </div>
        </div>
    );
}
