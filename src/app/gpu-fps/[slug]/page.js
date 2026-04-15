import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
 Gamepad2, 
 Monitor, 
 ChevronLeft, 
 ChevronRight, 
 Zap, 
 Swords, 
 ShoppingCart, 
 Activity, 
 CheckCircle2, 
 ArrowRight,
 Flame,
 Heart,
 BarChart3,
 Gauge, 
 Trophy,
 Info,
 Crosshair,
 AlertTriangle
} from 'lucide-react';
import GuruAnalysisText from '../../../components/GuruAnalysisText';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU FPS HUNTER V2.2 (PROPS EN FIX & V10 HARD-LOCK)
 * 🚀 CÍL: Oprava čtení props.isEn pro správnou lokalizaci z proxy + V10 Hard-Lock.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// Pomocná funkce pro e-shopy
const getCleanSearchName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '').trim();

const findGpuBySlug = async (gpuSlug) => {
 if (!supabaseUrl || !gpuSlug) return null;
 const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
 
 // 🔥 FIX: Před dotazem do DB musíme vždy očistit slug od jazykového prefixu "en-"
 const cleanSlugForDb = gpuSlug.replace(/^en-/, '');

 try {
     const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlugForDb}&limit=1`, { headers, cache: 'force-cache' });
     if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
     
     const clean = cleanSlugForDb.replace(/-/g, " ").trim();
     const chunks = clean.match(/\d+|[a-zA-Z]+/g);
     if (chunks && chunks.length > 0) {
         const searchPattern = `%${chunks.join('%')}%`;
         const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
         const res2 = await fetch(url2, { headers, cache: 'force-cache' });
         if (res2.ok) { const data2 = await res2.json(); return data2[0] || null; }
     }
 } catch(e) {}
 return null;
};

export async function generateMetadata(props) {
 const params = await props.params;
 const rawSlug = params?.slug || '';
 // Detekce jazyka pro metadata
 const isEn = props.isEn === true || rawSlug.startsWith('en-');
 const cleanSlug = rawSlug.replace(/^en-/, '');
 const gpu = await findGpuBySlug(cleanSlug);
 if (!gpu) return { title: '404 | The Hardware Guru' };
 const safeSlug = gpu.slug || slugify(gpu.name);
 return {
   title: isEn ? `How much FPS does ${gpu.name} get? | Guru Benchmarks` : `Kolik FPS má ${gpu.name} ve hrách? | Guru Testy`,
   alternates: { canonical: `${baseUrl}/gpu-fps/${safeSlug}`, languages: { 'en': `${baseUrl}/en/gpu-fps/${safeSlug}`, 'cs': `${baseUrl}/gpu-fps/${safeSlug}` } }
 };
}

export default async function GpuFpsHunterPage(props) {
 const params = await props.params;
 const rawSlug = params?.slug || '';
 // 🔥 Detekce jazyka z URL nebo props
 const isEn = props.isEn === true || rawSlug.startsWith('en-');
 const cleanSlug = rawSlug.replace(/^en-/, '');

 const gpu = await findGpuBySlug(cleanSlug);
 if (!gpu) notFound();

 const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
 const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');
 const safeSlug = gpu.slug || slugify(gpu.name);

 const gamesToShow = [
   { id: 'resident_evil_requiem', name: 'Resident Evil Requiem', key: 'resident_evil_requiem' },
   { id: 'cyberpunk', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
   { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
   { id: 'starfield', name: 'Starfield', key: 'starfield' },
   { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' }
 ];

 const getVerdict = (fps) => {
   if (fps >= 100) return { text: isEn ? 'ULTIMATE EXPERIENCE' : 'ULTIMÁTNÍ ZÁŽITEK', color: '#10b981' };
   if (fps >= 60) return { text: isEn ? 'SMOOTH GAMING' : 'PLYNULÉ HRANÍ', color: '#66fcf1' };
   if (fps >= 30) return { text: isEn ? 'PLAYABLE' : 'HRATELNÉ', color: '#eab308' };
   return { text: isEn ? 'NOT RECOMMENDED' : 'NEDOSTATEČNÝ VÝKON', color: '#ef4444' };
 };

 // 🔥 OPRAVENÉ AFFILIATE LINKY S V10 HARD-LOCK 🔥
 const searchName = getCleanSearchName(gpu.name);
 const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
 const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`;

 return (
   <div className="guru-fps-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
     
     <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
       
       <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
           <div className="ad-desktop-wrapper">
               <SeznamAd zoneId={408654} width={970} height={210} />
           </div>
           <div className="ad-mobile-wrapper">
               <SeznamAd zoneId={408651} width={300} height={250} />
           </div>
       </div>

       <header style={{ textAlign: 'center', marginBottom: '40px' }}>
         <div className="hunter-badge">
           <Gamepad2 size={16} /> GURU FPS HUNTER
         </div>
         <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
           <span style={{ color: '#d1d5db' }}>{normalizeName(gpu.name)}</span> <br/>
           <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON A FPS'}</span>
         </h1>
       </header>

       {/* 🔥 NOVÝ GURU AFFILIATE BOMB GRID (Modrá tlačítka s V10 Hard-Lock) 🔥 */}
       <div className="affiliate-cta-grid" style={{ marginBottom: '50px', borderColor: `${vendorColor}40` }}>
            <div className="affiliate-col">
                <div className="affiliate-col-title" style={{ color: vendorColor }}>
                    <ShoppingCart size={16} /> {isEn ? `BUY ${normalizeName(gpu.name)}` : `KOUPIT ${normalizeName(gpu.name)}`}
                </div>
                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={getAmazonLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                            <ShoppingCart size={16} /> Check Price on Amazon
                        </a>
                    ) : (
                        <>
                            <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                <ShoppingCart size={16} /> Smarty.cz
                            </a>
                            <a 
                                href={`https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeURIComponent(searchName)}+cena#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-gpu-fps-top`} 
                                data-subid="v10-gpu-fps-top"
                                data-cat="gpu_fps_hunter"
                                target="_blank" 
                                rel="nofollow sponsored" 
                                className="guru-buy-winner-btn heureka-btn v10-hl-btn"
                            >
                                <ShoppingCart size={16} /> Heureka.cz
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>

       <div className="fps-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '60px', marginTop: '40px' }}>
         {gamesToShow.map((game) => {
           const fpsValue = Number(fpsData[`${game.key}_1440p`] || fpsData[`${game.key}_1080p`] || 0);
           const verdict = getVerdict(fpsValue);

           return (
             <a key={game.id} href={`/${isEn ? 'en/' : ''}gpu-fps/${rawSlug}/${game.id.replace(/_/g, '-')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
               <div className="game-fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: '0.3s' }}>
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: verdict.color }}></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                   <h3 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{game.name}</h3>
                   <span style={{ fontSize: '10px', fontWeight: '950', color: verdict.color, letterSpacing: '1px' }}>1440p ULTRA</span>
                 </div>
                 <div className="fps-val-main" style={{ fontSize: '64px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>
                   {fpsValue > 0 ? fpsValue : 'N/A'} <span style={{ fontSize: '20px', color: '#4b5563' }}>FPS</span>
                 </div>
                 <div style={{ marginTop: '15px', color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span>{verdict.text}</span>
                   <ChevronRight size={16} />
                 </div>
               </div>
             </a>
           );
         })}
       </div>

       <section style={{ marginBottom: '60px' }}>
           <div className="analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950' }}>{isEn ? 'Performance Analysis' : 'Analýza výkonu'}</h2>
               <GuruAnalysisText 
                   cpuName="Intel Core i9-14900K" 
                   gpuName={gpu.name} 
                   gameName="modern games" 
                   resolution="1440p" 
                   bottleneckPercent={0} 
                   isCpuBound={false} 
                   fps={Number(fpsData['cyberpunk_2077_1440p'] || 0)} 
                   isEn={isEn} 
               />
           </div>
       </section>

       {/* 🔥 GURU TOOLS - POVINNÁ TLAČÍTKA NA KALKULAČKY 🔥 */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '60px', marginBottom: '60px' }}>
           <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
               <Gamepad2 size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span>
           </a>
           <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
               <AlertTriangle size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span>
           </a>
       </div>

       {/* 🔥 HEUREKA WIDGET SCHOVÁN PRO EN VERZI 🔥 */}
       {!isEn && (
           <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
               <div className="v10-hl-container" data-subid="v10-gpu-fps-widget" data-cat="gpu_fps_hunter">
                   <HeurekaButtons isEn={false} manualSearch={gpu.name} positionId="276026" />
               </div>
           </div>
       )}

       <section className="semantic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
           <a href={`/${isEn ? 'en/' : ''}bottleneck/${safeSlug}-with-ryzen-7-7800x3d`} className="deep-link-card" style={{ borderTop: '4px solid #ff0055' }}>
               <Gauge size={32} color="#ff0055" />
               <h3>Bottleneck Radar</h3>
               <p>{isEn ? 'Is your CPU bottlenecking this GPU?' : 'Nezpomaluje tvůj procesor tuhle grafiku?'}</p>
               <ChevronRight className="arrow" />
           </a>
           <a href={`/${isEn ? 'en/' : ''}gpuvs`} className="deep-link-card" style={{ borderTop: '4px solid #a855f7' }}>
               <Swords size={32} color="#a855f7" />
               <h3>GPU Srovnávač</h3>
               <p>{isEn ? 'Compare against the competition.' : 'Srovnej tuhle kartu s konkurencí.'}</p>
               <ChevronRight className="arrow" />
           </a>
           <a href={`/${isEn ? 'en/' : ''}gpu/${safeSlug}`} className="deep-link-card" style={{ borderTop: '4px solid #66fcf1' }}>
               <Activity size={32} color="#66fcf1" />
               <h3>Detailní Profil</h3>
               <p>{isEn ? 'Full specs and architecture.' : 'Kompletní technické specifikace.'}</p>
               <ChevronRight className="arrow" />
           </a>
       </section>

       <section className="massive-seo-hub" style={{ marginBottom: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
           <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: `4px solid ${vendorColor}`, paddingLeft: '15px' }}>
               {isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}
           </h2>
           <div className="seo-hub-grid">
               <div className="hub-column">
                   <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                   <ul className="hub-links-list">
                       <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                       <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"}><ChevronRight size={16} /> {isEn ? 'Graphics Card Battles' : 'Souboje Grafických Karet'}</a></li>
                       <li><a href={isEn ? "/en/cpu-index" : "/cpu-index"}><ChevronRight size={16} /> {isEn ? 'Processor Database' : 'Katalog Procesorů'}</a></li>
                       <li><a href={isEn ? "/en/gpu-index" : "/gpu-index"}><ChevronRight size={16} /> {isEn ? 'Graphics Cards Database' : 'Katalog Grafických Karet'}</a></li>
                   </ul>
               </div>
               <div className="hub-column">
                   <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                   <ul className="hub-links-list">
                       <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'Bottleneck Test' : 'Bottleneck Test'}</a></li>
                       <li><a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'GTA VI FPS Predictor' : 'GTA VI FPS Kalkulačka'}</a></li>
                       <li><a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"}><ChevronRight size={16} /> {isEn ? 'Game Archive' : 'Archiv her'}</a></li>
                       <li><a href={isEn ? "/en/clanky" : "/clanky"}><ChevronRight size={16} /> {isEn ? 'News & Articles' : 'Články a Novinky'}</a></li>
                   </ul>
               </div>
           </div>
       </section>

       <div className="footer-btns" style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
         <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> DEALS</a>
         <a href="/support" className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
       </div>
     </main>

     <div className="sticky-bottom-anchor">
         <div className="ad-desktop-wrapper">
             <SeznamAd zoneId={408654} width={970} height={90} />
         </div>
         <div className="ad-mobile-wrapper">
             <SeznamAd zoneId={408651} width={300} height={100} />
         </div>
     </div>

     {/* 🔥 V10 HARD-LOCK SCRIPT PRO SERVER COMPONENT 🔥 */}
     <Script id="v10-hl-script" strategy="lazyOnload">
         {`
             if (typeof window !== 'undefined') {
                 document.addEventListener('click', function(e) {
                     const btn = e.target.closest('.v10-hl-btn, .v10-hl-container a, .v10-hl-container button');
                     if (btn) {
                         e.preventDefault();
                         const container = e.target.closest('.v10-hl-container');
                         const subId = btn.getAttribute('data-subid') || (container ? container.getAttribute('data-subid') : 'unknown');
                         const cat = btn.getAttribute('data-cat') || (container ? container.getAttribute('data-cat') : 'gpu_fps_hunter');
                         const targetUrl = btn.href || (btn.tagName === 'A' ? btn.href : null);

                         if (navigator.sendBeacon && targetUrl) {
                             navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: cat, sub_id: subId, page: window.location.pathname }));
                         }
                         if (targetUrl) {
                             setTimeout(() => { window.location.href = targetUrl; }, 150);
                         }
                     }
                 });
             }
         `}
     </Script>

     <style dangerouslySetInnerHTML={{__html: `
       .hunter-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
       
       .game-fps-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2) !important; box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
       .deep-link-card { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; }
       .deep-link-card h3 { font-size: 18px; font-weight: 950; margin: 15px 0 10px 0; text-transform: uppercase; }
       .deep-link-card p { font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0; }
       .deep-link-card .arrow { position: absolute; bottom: 30px; right: 30px; opacity: 0.2; }

       /* 🔥 CSS PRO AFFILIATE GRID A TLAČÍTKA 🔥 */
       .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
       .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
       .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
       .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
       
       @keyframes pulse-smarty { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
       
       .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
       .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; animation: pulse-smarty 2s infinite; }
       .smarty-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 15px 30px rgba(234, 179, 8, 0.5); }
       .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; }
       .heureka-btn:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 10px 20px rgba(0, 120, 212, 0.5); }
       
       /* 🔥 NOVÉ: CSS PRO AMAZON TLAČÍTKO 🔥 */
       .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }
       .amazon-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 15px 30px rgba(245, 158, 11, 0.5); }

       .seo-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
       .hub-column { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
       .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
       .hub-links-list { list-style: none; padding: 0; margin: 0; }
       .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 15px; font-weight: bold; transition: 0.3s; }
       .hub-links-list a:hover { color: #66fcf1; transform: translateX(10px); }

       .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; border: none; text-decoration: none; transition: 0.3s; }
       .guru-support-btn { background: #eab308; color: #000; }
       .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }

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

       .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
       .ad-mobile-wrapper { display: none; width: 100%; }

       @media (max-width: 768px) {
           .guru-fps-wrapper { padding-top: 80px !important; }
           .inner-container { padding: 0 15px !important; }
           .ad-desktop-wrapper { display: none !important; }
           .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
           .main-h1 { font-size: 1.6rem !important; }
           .fps-matrix-grid { grid-template-columns: 1fr !important; gap: 15px; }
           .game-fps-card { padding: 20px !important; border-radius: 18px !important; }
           .fps-val-main { font-size: 3.5rem !important; }
           .analysis-box { padding: 25px 15px !important; border-radius: 20px !important; }
           .semantic-grid { grid-template-columns: 1fr !important; }
           .deep-link-card { padding: 20px !important; }
           .guru-deals-btn, .guru-support-btn { width: 100% !important; }
           .seo-hub-grid { grid-template-columns: 1fr; }
           .hub-column { padding: 25px; }
           .affiliate-cta-grid { padding: 20px; }
           .affiliate-col-title { font-size: 14px; margin-bottom: 20px; }
           .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
           .guru-buy-winner-btn { max-width: 100%; width: 100%; padding: 16px; font-size: 15px; }
       }
     `}} />
   </div>
 );
}
