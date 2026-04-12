import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import AffiliateButton from './AffiliateButton'; // 🔥 NOVÝ IMPORT
import { ShoppingCart, Monitor, Cpu, Zap, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

/**
 * GURU BOTTLENECK CALCULATOR - HUB V3.3 (THE TRACKING MASTER)
 * 🚀 CÍL: Client-side tracking fix, Savings hooks a Primary CTA stack.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

const AMAZON_TAG = "thehardware07-20";

export const metadata = {
    title: 'PC Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější AI simulátor bottlenecku. Zjisti, jestli tvůj procesor brzdí grafiku.',
};

const normalizeQuery = (str = '') => {
  try {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) { return str; }
};

const cleanHeurekaGpuName = (name = '') => {
  return name
    .replace(/(Graphics Card|GPU)/gi, '')
    .replace(/\b\d+\s*-?\s*Core\b/gi, '')
    .replace(/\b\d+(\.\d+)?GHz\b/gi, '')
    .replace(/\bBOX\b|\bTray\b/gi, '')
    .replace(/\b(Gaming|Dual|Ventus|Eagle|Trio|Ghost|Aero|Pny|Zotac|Inno3d|Palit|Asrock)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanHeurekaCpuName = (name = '') => {
  return name
    .replace(/(Processor|CPU)/gi, '')
    .replace(/\b\d+\s*-?\s*Core\b/gi, '')
    .replace(/\b\d+(\.\d+)?GHz\b/gi, '')
    .replace(/\bBOX\b|\bTray\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const encodeHeurekaQuery = (q, cleanFn) => {
  return normalizeQuery(cleanFn(q)).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).join('+');
};

export default async function BottleneckPage({ searchParams }) {
    const s = searchParams;
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
        const q = `${name} gaming benchmark fps test review best price deal discount buy online free shipping in stock fast delivery`;
        return `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=bn-hub`;
    };

    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    const getHeurekaGpu = (name) => `https://graficke-karty.heureka.cz/f:q:${encodeHeurekaQuery(name, cleanHeurekaGpuName)}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
    const getHeurekaCpu = (name) => `https://procesory.heureka.cz/f:q:${encodeHeurekaQuery(name, cleanHeurekaCpuName)}/?h%5Bfraze%5D=${encodeHeurekaQuery(name, cleanHeurekaCpuName)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

    return (
        <div className="guru-page-container" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .affiliate-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 35px; background: rgba(0,0,0,0.5); border-radius: 28px; border: 1px solid rgba(168, 85, 247, 0.2); width: 100%; box-sizing: border-box; }
                .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .affiliate-btn-wrap { display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center; }
                .guru-buy-winner-btn { width: 100%; max-width: 320px; display: inline-flex; justify-content: center; align-items: center; gap: 10px; padding: 20px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 14px; text-transform: uppercase; transition: 0.3s; color: #000; }
                .smarty-btn { background: #facc15; border: 2px solid #fef08a; }
                .heureka-btn { background: #3b82f6; color: #fff !important; border: 2px solid #60a5fa; }
                .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; animation: pulse-btn 2s infinite; }
                @keyframes pulse-btn { 0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(168, 85, 247, 0); } 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); } }
                .price-anchor { font-size: 11px; opacity: 0.6; margin-bottom: 8px; font-weight: bold; }
                .gain-hook { font-size: 12px; color: #22c55e; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; }
                .conversion-detail { font-size: 10px; opacity: 0.5; margin-top: 4px; text-align: center; display: flex; align-items: center; gap: 3px; }
            `}} />

            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '40px' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>

                <BottleneckClient gpus={gpus} cpus={cpus} games={gamesData} isEn={isEn} />

                <div className="affiliate-cta-grid" style={{ margin: '40px 0' }}>
                    {/* GPU UPGRADE COLUMN */}
                    <div className="affiliate-col">
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'950', color:'#a855f7', marginBottom:'20px' }}><Monitor size={16} /> {isEn ? `TOP GPU UPGRADE` : `NEJLEPŠÍ UPGRADE GRAFIKY`}</div>
                        <div className="affiliate-btn-wrap">
                            <div style={{ fontWeight:'900', color:'#fff', marginBottom: '4px' }}>{heroGpu}</div>
                            <div className="price-anchor">{isEn ? 'From $399 • Best value' : 'Od 9 990 Kč • Nejlepší poměr cena/výkon'}</div>
                            <div className="gain-hook">🚀 {isEn ? '+40-70% smoother gameplay' : '+40-70 % plynulejší hraní'}</div>

                            {/* 🔥 FIX #4: SMART STACK LABEL */}
                            <div className="conversion-detail" style={{ opacity: 0.8, color: '#22c55e', fontWeight: '950' }}>🟢 {isEn ? 'Cheapest option first' : 'Nejlevnější možnost nahoře'}</div>

                            {isEn ? (
                                <AffiliateButton href={getAmazonLink(heroGpu)} label="hub_amazon_gpu" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={18} /> 🔥 {isEn ? 'Unlock smoother gameplay NOW' : 'Získej plynulejší hraní TEĎ'}
                                </AffiliateButton>
                            ) : (
                                <>
                                    {/* 🔥 FIX #1 & #3: CLIENT WRAPPER + REVENUE MULTIPLIER (30%) */}
                                    <AffiliateButton href={getHeurekaGpu(heroGpu)} label="hub_heureka_gpu" positionId="276026" className="guru-buy-winner-btn heureka-btn">
                                        🔥 Najít NEJLEVNĚJŠÍ cenu GPU → teď (ušetříš až 30 %)
                                    </AffiliateButton>
                                    
                                    <div className="conversion-detail"><ShieldCheck size={10} /> {isEn ? '⚡ Price drops tracked in real time' : '⚡ Sleduje pokles cen v reálném čase (ověřeno dnes)'}</div>

                                    <AffiliateButton href={getSmartyLink(heroGpu)} label="hub_smarty_gpu" className="guru-buy-winner-btn smarty-btn">
                                        <ShoppingCart size={18} /> Koupit na Smarty.cz
                                    </AffiliateButton>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CPU UPGRADE COLUMN */}
                    <div className="affiliate-col">
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'950', color:'#a855f7', marginBottom:'20px' }}><Cpu size={16} /> {isEn ? `TOP CPU UPGRADE` : `NEJLEPŠÍ UPGRADE PROCESORU`}</div>
                        <div className="affiliate-btn-wrap">
                            <div style={{ fontWeight:'900', color:'#fff', marginBottom: '4px' }}>{heroCpu}</div>
                            <div className="price-anchor">{isEn ? 'From $249 • Extreme speed' : 'Od 5 990 Kč • Špičkový výkon'}</div>
                            <div className="gain-hook">🚀 {isEn ? '+30-60% smoother gameplay' : '+30-60 % plynulejší hraní'}</div>

                            <div className="conversion-detail" style={{ opacity: 0.8, color: '#22c55e', fontWeight: '950' }}>🟢 {isEn ? 'Cheapest option first' : 'Nejlevnější možnost nahoře'}</div>

                            {isEn ? (
                                <AffiliateButton href={getAmazonLink(heroCpu)} label="hub_amazon_cpu" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={18} /> 🔥 {isEn ? 'Unlock smoother gameplay NOW' : 'Získej plynulejší hraní TEĎ'}
                                </AffiliateButton>
                            ) : (
                                <>
                                    <AffiliateButton href={getHeurekaCpu(heroCpu)} label="hub_heureka_cpu" positionId="276027" className="guru-buy-winner-btn heureka-btn">
                                        🔥 Najít NEJLEVNĚJŠÍ cenu CPU → teď (ušetříš až 30 %)
                                    </AffiliateButton>
                                    
                                    <div className="conversion-detail"><ShieldCheck size={10} /> {isEn ? '⚡ Price drops tracked in real time' : '⚡ Sleduje pokles cen v reálném čase (ověřeno dnes)'}</div>

                                    <AffiliateButton href={getSmartyLink(heroCpu)} label="hub_smarty_cpu" className="guru-buy-winner-btn smarty-btn">
                                        <ShoppingCart size={18} /> Koupit na Smarty.cz
                                    </AffiliateButton>
                                </>
                            )}
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
