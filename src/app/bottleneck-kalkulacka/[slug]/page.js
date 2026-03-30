import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU BOTTLENECK CALCULATOR RESULT - V1.5 (MONEY FIX UPDATE)
 * 🚀 CÍL: Dynamické rozpoznání hry, Top Banner viewability a zavedení Sticky Bottom Anchoru.
 */

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const p = await params;
    const cleanSlug = (p.slug || '').replace(/-/g, ' ').toUpperCase();
    return { title: `Bottleneck: ${cleanSlug} | The Hardware Guru` };
}

export default async function BottleneckResultPage({ params, searchParams }) {
    const p = await params;
    const s = await searchParams;
    
    if (!s.cpuId || !s.gpuId || !p.slug) return notFound();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const resolutionStr = p.slug.includes('2160p') ? '2160p' : p.slug.includes('1440p') ? '1440p' : '1080p';
    
    // 🚀 GURU DYNAMICKÁ DETEKCE HRY: Místo natvrdo napsaných her prohledáme celou DB
    let selectedGameSlug = 'generic';
    if (gamesRes.data && gamesRes.data.length > 0) {
        // Seřadíme hry od nejdelšího slugu po nejkratší pro přesný match (např. aby se nepletlo gta-v a gta-v-online)
        const sortedGames = [...gamesRes.data].sort((a, b) => (b.slug?.length || 0) - (a.slug?.length || 0));
        const matchedGame = sortedGames.find(g => g.slug && p.slug.includes(g.slug));
        
        if (matchedGame) {
            selectedGameSlug = matchedGame.slug;
        }
    }

    return (
        <div className="guru-page-wrapper" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            {/* 🚀 RESPONSIVE ADS & MOBILE FIXES */}
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
                    .guru-page-wrapper { paddingTop: 80px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; }
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
                    initialCpuId={s.cpuId}
                    initialGpuId={s.gpuId}
                    initialGameSlug={selectedGameSlug}
                    initialResolution={resolutionStr}
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
