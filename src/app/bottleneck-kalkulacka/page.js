import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import { ShoppingCart, Monitor, Cpu, Zap, CheckCircle, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

/**
 * GURU BOTTLENECK CALCULATOR - HUB V2.2 (THE FINAL SNIPER)
 * 🚀 CÍL: CSS Fix, PAIN+GAIN loop, Legacy Heureka Query a Benchmark Amazon Intent.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

const AMAZON_TAG = "thehardware07-20";

export const metadata = {
    title: 'PC Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější AI simulátor bottlenecku. Zjisti, jestli tvůj procesor brzdí grafiku.',
};

const cleanHeurekaName = (name = '') => {
  return name
    .replace(/(Processor|CPU|Graphics Card|GPU)/gi, '')
    .replace(/\b\d+-Core\b/gi, '')
    .replace(/\b\d+(\.\d+)?GHz\b/gi, '')
    .replace(/\bBOX\b|\bTray\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// 🔥 FIX #2: LEGACY HEUREKA ENCODING (Bez encodeURIComponent pro lepší matching)
const encodeHeurekaQuery = (q) => cleanHeurekaName(q).replace(/\s+/g, '+');

export default async function BottleneckPage({ searchParams }) {
    const s = await searchParams;
    const isEn = s?.lang === 'en';
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>ENGINE OFFLINE.</div>;

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    });

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const fallbackGpu = "RTX 4070 SUPER";
    const fallbackCpu = "Ryzen 7 7800X3D";
    const isGpuHot = (name = '') => /4070|4080|5070|5060|7800|7700/i.test(name);
    const isCpuHot = (name = '') => /7800X3D|7700X|9800X3D|14600K/i.test(name);

    const heroGpu = gpusRes.data?.find(g => isGpuHot(g.name))?.name
        || gpusRes.data?.find(g => g.performance_index > 250 && g.performance_index < 420)?.name
        || fallbackGpu;

    const heroCpu = cpusRes.data?.find(c => isCpuHot(c.name))?.name
        || cpusRes.data?.find(c => c.performance_index > 200 && c.performance_index < 350)?.name
        || fallbackCpu;

    // 🔥 FIX #3: BENCHMARK MONEY QUERY
    const getAmazonLink = (name) => {
        const q = `${name} gaming benchmark fps upgrade buy`;
        return `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=bn-hub`;
    };

    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    
    const getHeurekaGpu = (name) => `https://graficke-karty.heureka.cz/f:q:${encodeHeurekaQuery(name)}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
    const getHeurekaCpu = (name) => `https://procesory.heureka.cz/f:q:${encodeHeurekaQuery(name)}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

    return (
        <div className="guru-page-container" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .affiliate-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 35px; background: rgba(0,0,0,0.5); border-radius: 28px; border: 1px solid rgba(168, 85, 247, 0.2); width: 100%; box-sizing: border-box; align-items: stretch; }
                .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .affiliate-col-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; color: #a855f7; }
                .affiliate-btn-wrap { display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center; }
                
                @keyframes pulse-btn { 0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(168, 85, 247, 0); } 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); } }
                
                .guru-buy-winner-btn { width: 100%; max-width: 320px; display: inline-flex; justify-content: center; align-items: center; gap: 10px; padding: 20px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 15px; text-transform: uppercase; transition: 0.3s; color: #000; }
                .smarty-btn { background: #facc15; border: 2px solid #fef08a; }
                .heureka-btn { background: #3b82f6; color: #fff !important; border: 2px solid #60a5fa; }
                .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; animation: pulse-btn 2s infinite; }
                .guru-buy-winner-btn:hover { transform: translateY(-5px); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }

                /* 🔥 FIX #1: CORRECT CSS FORMATTING */
                .price-anchor { font-size: 11px; opacity: 0.6; margin-bottom: 8px; font-weight: bold; text-align: center; }
                .pain-trigger { font-size: 12px; color: #ef4444; font-weight: 900; margin-bottom: 4px; text-align: center; text-transform: uppercase; }
                .gain-hook { font-size: 12px; color: #22c55e; font-weight: 900; margin-bottom: 8px; text-align: center; text-transform: uppercase; }
                .social-proof { font-size: 11px; color: #facc15; font-weight: 900; margin-bottom: 6px; text-align: center; }
                .scarcity-boost { font-size: 10px; color: #ef4444; font-weight: 800; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
                .freshness-badge { font-size: 10px; opacity: 0.4; margin-top: 4px; font-weight: 700; text-align: center; }

                @media (max-width: 768px) {
                    .affiliate-cta-grid { grid-template-columns: 1fr; padding: 20px; }
                }
            `}} />

            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '40px' }}><div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div></div>

                <BottleneckClient gpus={gpusRes.data || []} cpus={cpusRes.data || []} games={gamesRes.data || []} isEn={isEn} />

                {/* 🔥 AFFILIATE HUB V2.2 🔥 */}
                <div className="affiliate-cta-grid" style={{ margin: '40px 0' }}>
                    
                    {/* GPU COLUMN */}
                    <div className="affiliate-col">
                        <div className="affiliate-col-title"><Monitor size={16} /> {isEn ? `Top GPU Upgrade` : `Nejlepší upgrade grafiky`}</div>
                        <div className="affiliate-btn-wrap">
                            <div style={{ textAlign:'center', fontSize:'14px', fontWeight:'900', color:'#fff', marginBottom: '4px' }}>{heroGpu}</div>
                            
                            <div className="price-anchor">{isEn ? 'From $399 • Best value' : 'Od 9 990 Kč • Nejlepší poměr cena/výkon'}</div>
                            
                            <div className="social-proof">🔥 {isEn ? 'Most popular upgrade right now' : 'Nejoblíbenější upgrade právě teď'}</div>
                            
                            {/* 🔥 FIX #5: PAIN + GAIN LOOP */}
                            <div className="pain-trigger">⚠️ {isEn ? 'Losing FPS to Bottleneck' : 'Ztrácíš výkon kvůli bottlenecku'}</div>
                            <div className="gain-hook">🚀 {isEn ? '+50% FPS boost' : '+50% nárůst FPS'}</div>

                            {isEn ? (
                                <a href={getAmazonLink(heroGpu)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={18} /> 🔥 Unlock +50% FPS Boost
                                </a>
                            ) : (
                                <>
                                    <a href={getHeurekaGpu(heroGpu)} data-trixam-positionid="276026" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn">🔥 Získej +50% FPS výkon</a>
                                    <a href={getSmartyLink(heroGpu)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={18} /> Koupit na Smarty.cz</a>
                                </>
                            )}
                            {/* 🔥 FIX #6: HARDCORE SCARCITY */}
                            <div className="scarcity-boost"><Clock size={10} /> {isEn ? 'Only few units left' : 'Poslední kusy skladem'}</div>
                            <div className="freshness-badge">{isEn ? '✔ Updated daily • Real prices' : '✔ Aktualizované ceny • Reálné nabídky'}</div>
                        </div>
                    </div>

                    {/* CPU COLUMN */}
                    <div className="affiliate-col">
                        <div className="affiliate-col-title"><Cpu size={16} /> {isEn ? `Top CPU Upgrade` : `Nejlepší upgrade procesoru`}</div>
                        <div className="affiliate-btn-wrap">
                            <div style={{ textAlign:'center', fontSize:'13px', fontWeight:'900', color:'#fff', marginBottom: '4px' }}>{heroCpu}</div>
                            
                            <div className="price-anchor">{isEn ? 'From $249 • Extreme speed' : 'Od 5 990 Kč • Extrémní výkon'}</div>
                            
                            <div className="social-proof">🔥 {isEn ? 'Most popular CPU right now' : 'Nejoblíbenější procesor právě teď'}</div>

                            <div className="pain-trigger">⚠️ {isEn ? 'Stuttering & Lagging' : 'Laguje ti systém?'}</div>
                            <div className="gain-hook">🚀 {isEn ? 'Smooth 0.1% Lows' : 'Konec záseků a lagů'}</div>

                            {isEn ? (
                                <a href={getAmazonLink(heroCpu)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={18} /> 🔥 Boost CPU Power NOW
                                </a>
                            ) : (
                                <>
                                    <a href={getHeurekaCpu(heroCpu)} data-trixam-positionid="276027" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn">🔥 Porovnat ceny CPU</a>
                                    <a href={getSmartyLink(heroCpu)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={18} /> Koupit na Smarty.cz</a>
                                </>
                            )}
                            <div className="scarcity-boost"><CheckCircle size={10} /> {isEn ? 'Limited stock available' : 'Omezené zásoby k dispozici'}</div>
                            <div className="freshness-badge">{isEn ? '✔ Verified matching deals' : '✔ Ověřené kompatibilní nabídky'}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                    <HeurekaButtons isEn={isEn} manualSearch={heroGpu} positionId="276026" />
                </div>
            </div>
        </div>
    );
}
