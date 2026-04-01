import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';
import { ShoppingCart } from 'lucide-react';

/**
 * GURU BOTTLENECK CALCULATOR RESULT - V1.7 (AFFILIATE BOMB FIXED)
 * 🚀 CÍL: Integrace modrých affiliate tlačítek s dynamickým vyhledáváním zvolené GPU.
 */

export const dynamic = 'force-dynamic';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

export async function generateMetadata({ params }) {
    const p = await params;
    const cleanSlug = (p.slug || '').replace(/-/g, ' ').toUpperCase();
    return { title: `Bottleneck: ${cleanSlug} | The Hardware Guru` };
}

export default async function BottleneckResultPage({ params, searchParams }) {
    const p = await params;
    const s = await searchParams;
    
    if (!s.cpuId || !s.gpuId || !p.slug) return notFound();

    const isEn = p.slug.startsWith('en-');
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
    
    // Dynamická detekce hry
    let selectedGameSlug = 'generic';
    if (gamesRes.data && gamesRes.data.length > 0) {
        const sortedGames = [...gamesRes.data].sort((a, b) => (b.slug?.length || 0) - (a.slug?.length || 0));
        const matchedGame = sortedGames.find(g => g.slug && p.slug.includes(g.slug));
        if (matchedGame) selectedGameSlug = matchedGame.slug;
    }

    // 🔥 ZÍSKÁNÍ JMÉNA GPU PRO AFFILIATE 🔥
    const selectedGpu = gpusRes.data?.find(g => String(g.id) === String(s.gpuId));
    const gpuName = selectedGpu ? selectedGpu.name : 'Graphics Card';
    const searchName = normalizeName(gpuName).trim();

    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    const getHeurekaLink = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

    return (
        <div className="guru-page-wrapper" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
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

                /* Affiliate Bomb Grid & Buttons */
                .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
                .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
                .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
                .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
                
                @keyframes pulse-smarty { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
                @keyframes pulse-heureka { 0% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 120, 212, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0); } }
                
                .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
                .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; animation: pulse-smarty 2s infinite; }
                .smarty-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 15px 30px rgba(234, 179, 8, 0.5); }
                .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; animation: pulse-heureka 2s infinite; animation-delay: 1s; }
                .heureka-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 10px 20px rgba(0, 120, 212, 0.5); }

                @media (max-width: 768px) {
                    .guru-page-wrapper { paddingTop: 80px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; }
                    .inner-container { padding: 0 15px !important; }
                    .affiliate-cta-grid { padding: 20px; }
                    .affiliate-col-title { font-size: 14px; margin-bottom: 20px; }
                    .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
                    .guru-buy-winner-btn { max-width: 100%; width: 100%; padding: 16px; font-size: 15px; }
                }
            `}} />

            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
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

                {/* 🔥 NOVÝ GURU AFFILIATE BOMB GRID (Modrá tlačítka s trackováním) 🔥 */}
                <div className="affiliate-cta-grid" style={{ margin: '40px 0', borderLeft: '4px solid #66fcf1' }}>
                    <div className="affiliate-col">
                        <div className="affiliate-col-title" style={{ color: '#66fcf1' }}>
                            <ShoppingCart size={16} /> {isEn ? `BUY ${normalizeName(gpuName)}` : `KOUPIT ${normalizeName(gpuName)}`}
                        </div>
                        <div className="affiliate-btn-wrap">
                            <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                <ShoppingCart size={16} /> Smarty.cz
                            </a>
                            <a 
                                href={getHeurekaLink(searchName)} 
                                data-trixam-positionid="276026" 
                                data-trixam-codetype="link" 
                                target="_blank" 
                                rel="nofollow sponsored" 
                                className="guru-buy-winner-btn heureka-btn heureka-hn-link"
                            >
                                <ShoppingCart size={16} /> Heureka.cz
                            </a>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                    <HeurekaButtons isEn={isEn} manualSearch={gpuName} positionId="276026" />
                </div>

            </div>

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
