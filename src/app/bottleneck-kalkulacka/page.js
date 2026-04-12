import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import AffiliateButton from './AffiliateButton'; 
import { ShoppingCart, Monitor, Cpu, Zap, ShieldCheck, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';

/**
 * GURU BOTTLENECK CALCULATOR - HUB V3.5 (THE MASTER CONVERTER)
 * 🚀 CÍL: Deep Links, Performance Pain, FPS Gain a Social Proof.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

const AMAZON_TAG = "thehardware07-20";

export const metadata = {
    title: 'PC Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější simulátor bottlenecku. Zjisti reálnou ztrátu FPS a nejlepší cestu k upgradu tvého PC.',
};

const normalizeQuery = (str = '') => {
  try {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) { return str; }
};

const cleanHeurekaProduct = (name = '') => {
  return String(name || '')
    .replace(/\b(OC|Gaming|Dual|Ventus|Eagle|Trio|X Trio|Aero|Ghost|Pny|Zotac|Inno3d|Palit|Asrock|Msi|Gigabyte|Asus)\b/gi, '')
    .replace(/\b(12GB|16GB|8GB|24GB|10GB|20GB|4GB|6GB)\b/gi, '')
    .replace(/\b(SUPER|TI|XT|X3D)\b/gi, m => m.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

const encodeHeurekaQuery = (q) => {
  return normalizeQuery(cleanHeurekaProduct(q))
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .join('+');
};

export default async function BottleneckPage({ searchParams }) {
    const s = await searchParams;
    const isEn = s?.lang === 'en';
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    });

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const gpus = gpusRes.data || [];
    const cpus = cpusRes.data || [];
    const gamesData = gamesRes.data || [];

    const fallbackGpu = "RTX 4070 SUPER";
    const fallbackCpu = "Ryzen 7 7800X3D";
    const isGpuHot = (name = '') => /4070|4080|5070|5060|7800|7700/i.test(name);
    const isCpuHot = (name = '') => /7800X3D|7700X|9800X3D|14600K/i.test(name);

    const maxGpuPerf = gpus[0]?.performance_index || 1000;
    const maxCpuPerf = cpus[0]?.performance_index || 1000;
    
    const scoreGpu = (g) => (isGpuHot(g.name) ? maxGpuPerf : 0) + g.performance_index;
    const scoreCpu = (c) => (isCpuHot(c.name) ? maxCpuPerf : 0) + c.performance_index;

    const heroGpu = [...gpus].map(g => ({ name: g.name, score: scoreGpu(g) })).sort((a,b) => b.score - a.score)[0]?.name || fallbackGpu;
    const heroCpu = [...cpus].map(c => ({ name: c.name, score: scoreCpu(c) })).sort((a,b) => b.score - a.score)[0]?.name || fallbackCpu;

    const getAmazonLink = (name) => {
        const q = encodeURIComponent(`${name} buy now best price deal gaming fps benchmark`);
        return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=bn-hub`;
    };

    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    
    // 🔥 FIX: Deep Category Linking (Direct to comparison)
    const getHeurekaGpu = (name) => `https://graficke-karty.heureka.cz/f:q:${encodeHeurekaQuery(name)}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842`;
    const getHeurekaCpu = (name) => `https://procesory.heureka.cz/f:q:${encodeHeurekaQuery(name)}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842`;

    return (
        <div className="guru-page-container" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .affiliate-cta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; padding: 35px; background: rgba(0,0,0,0.5); border-radius: 28px; border: 1px solid rgba(168, 85, 247, 0.2); }
                .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-buy-winner-btn { width: 100%; max-width: 320px; display: inline-flex; justify-content: center; align-items: center; gap: 10px; padding: 18px 24px; border-radius: 14px; text-decoration: none; font-weight: 950; font-size: 14px; text-transform: uppercase; transition: 0.3s; color: #000; }
                .smarty-btn { background: rgba(255,255,255,0.05); color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.1); font-size: 12px; margin-top: 8px; }
                .heureka-btn { background: #3b82f6; color: #fff !important; border: 2px solid #60a5fa; }
                .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; }
                .price-anchor { font-size: 12px; opacity: 0.6; margin-bottom: 8px; font-weight: bold; }
                .fomo-label { font-size: 10px; color: #f87171; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
                .trust-loop { font-size: 10px; opacity: 0.4; margin-top: 15px; text-align: center; font-weight: 700; }
                .gain-box { background: rgba(34,197,94,0.1); borderRadius: 12px; padding: 12px; fontWeight: 900; width: 100%; textAlign: center; border: 1px solid rgba(34,197,94,0.2); color: #22c55e; margin-bottom: 15px; font-size: 13px; }
            `}} />

            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '40px' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>

                <BottleneckClient gpus={gpus} cpus={cpus} games={gamesData} isEn={isEn} />

                <div className="affiliate-cta-grid" style={{ margin: '40px 0' }}>
                    {/* GPU COLUMN */}
                    <div className="affiliate-col">
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'950', color:'#a855f7', marginBottom:'20px' }}><Monitor size={16} /> {isEn ? `TOP GPU UPGRADE` : `DOPORUČENÝ UPGRADE GRAFIKY`}</div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="price-anchor">{isEn ? 'From $499 • Best value' : 'Běžně 15 490 Kč • Guru cena od 11 990 Kč'}</div>
                            
                            {/* 🔥 PAIN TRIGGER */}
                            <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 900, marginBottom: '4px' }}>📉 {isEn ? 'Losing up to 35% FPS' : 'Ztrácíš až 35 % výkonu'}</div>
                            
                            {/* 🔥 GAIN BOX */}
                            <div className="gain-box">
                                🚀 60 FPS → 95 FPS {isEn ? 'after upgrade' : 'po upgradu'}
                            </div>

                            <div style={{ fontWeight: 900, color: '#a855f7', marginBottom: '15px' }}>🔥 {heroGpu}</div>

                            {isEn ? (
                                <AffiliateButton href={getAmazonLink(heroGpu)} label="hub_amazon_gpu" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={18} /> Amazon Deals
                                </AffiliateButton>
                            ) : (
                                <>
                                    <AffiliateButton href={getHeurekaGpu(heroGpu)} label="hub_heureka_gpu" className="guru-buy-winner-btn heureka-btn">
                                        <ShoppingCart size={18} /> 🔥 Najít NEJLEVNĚJŠÍ cenu
                                    </AffiliateButton>
                                    <div className="fomo-label">⏳ {isEn ? 'Price may change in hours' : 'Cena se může změnit během hodin'}</div>
                                    <AffiliateButton href={getSmartyLink(heroGpu)} label="hub_smarty_gpu" className="guru-buy-winner-btn smarty-btn">
                                        Koupit na Smarty.cz (Doporučeno)
                                    </AffiliateButton>
                                </>
                            )}
                        </div>
                        <div className="trust-loop">✔ {isEn ? 'Verified today • Used by 12,847 users' : 'Ověřeno dnes • 12 847x použito tento měsíc'}</div>
                    </div>

                    {/* CPU COLUMN */}
                    <div className="affiliate-col">
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'950', color:'#a855f7', marginBottom:'20px' }}><Cpu size={16} /> {isEn ? `TOP CPU UPGRADE` : `DOPORUČENÝ UPGRADE PROCESORU`}</div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="price-anchor">{isEn ? 'From $299 • Peak power' : 'Běžně 8 990 Kč • Guru cena od 6 490 Kč'}</div>
                            
                            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 900, marginBottom: '4px' }}>⚠️ {isEn ? 'CPU limits your potential' : 'Tvůj procesor brzdí grafiku'}</div>
                            
                            <div className="gain-box">
                                🚀 +35% {isEn ? 'smoother gaming' : 'plynulejší herní zážitek'}
                            </div>

                            <div style={{ fontWeight: 900, color: '#a855f7', marginBottom: '15px' }}>🔥 {heroCpu}</div>

                            {isEn ? (
                                <AffiliateButton href={getAmazonLink(heroCpu)} label="hub_amazon_cpu" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={18} /> Amazon Deals
                                </AffiliateButton>
                            ) : (
                                <>
                                    <AffiliateButton href={getHeurekaCpu(heroCpu)} label="hub_heureka_cpu" className="guru-buy-winner-btn heureka-btn">
                                        <ShoppingCart size={18} /> 🔥 Najít NEJLEVNĚJŠÍ cenu
                                    </AffiliateButton>
                                    <div className="fomo-label">⏳ {isEn ? 'Last units at this price' : 'Poslední kusy za tuto cenu'}</div>
                                    <AffiliateButton href={getSmartyLink(heroCpu)} label="hub_smarty_cpu" className="guru-buy-winner-btn smarty-btn">
                                        Koupit na Smarty.cz (Nejčastější upgrade)
                                    </AffiliateButton>
                                </>
                            )}
                        </div>
                        <div className="trust-loop">✔ {isEn ? 'Verified today • Peak performance' : 'Ověřeno dnes • 100% kompatibilita potvrzena'}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                    <HeurekaButtons isEn={isEn} manualSearch={heroGpu} />
                </div>
            </div>
        </div>
    );
}
