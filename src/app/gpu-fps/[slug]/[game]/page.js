import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
 Gamepad2, Monitor, ChevronLeft, ChevronRight, Zap, Swords, ShoppingCart, Activity, CheckCircle2, ArrowRight, Flame, Heart, BarChart3, Gauge, Trophy, Info, Crosshair, AlertTriangle
} from 'lucide-react';
import GuruAnalysisText from '../../../../components/GuruAnalysisText';
import SeznamAd from '../../../../components/SeznamAd';
import HeurekaButtons from '../../../../components/HeurekaButtons'; 

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const getCleanSearchName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '').trim();

const findGpuBySlug = async (gpuSlug) => {
 if (!supabaseUrl || !gpuSlug) return null;
 const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
 try {
     const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'force-cache' });
     if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
     const clean = gpuSlug.replace(/-/g, " ").trim();
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
 const isEn = rawSlug.startsWith('en-');
 const cleanSlug = rawSlug.replace(/^en-/, '');
 const gpu = await findGpuBySlug(cleanSlug);
 if (!gpu) return { title: '404 | The Hardware Guru' };
 const safeSlug = gpu.slug || slugify(gpu.name);
 return {
   title: isEn ? `FPS test of ${gpu.name} in ${params.game} | Guru Benchmarks` : `Test FPS ${gpu.name} ve hře ${params.game} | Guru Testy`,
   alternates: { canonical: `${baseUrl}/gpu-fps/${safeSlug}/${params.game}`, languages: { 'en': `${baseUrl}/en/gpu-fps/${safeSlug}/${params.game}`, 'cs': `${baseUrl}/gpu-fps/${safeSlug}/${params.game}` } }
 };
}

export default async function GpuFpsHunterPage(props) {
 const params = await props.params;
 const rawSlug = params?.slug || '';
 const isEn = rawSlug.startsWith('en-');
 const cleanSlug = rawSlug.replace(/^en-/, '');
 const gameSlug = params?.game || '';

 const gpu = await findGpuBySlug(cleanSlug);
 if (!gpu) notFound();

 const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
 const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');
 const safeSlug = gpu.slug || slugify(gpu.name);

 const gamesToShow = [
   { id: 'resident-evil-requiem', name: 'Resident Evil Requiem', key: 'resident_evil_requiem' },
   { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
   { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
   { id: 'starfield', name: 'Starfield', key: 'starfield' },
   { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' },
   { id: 'gta-v', name: 'GTA V', key: 'gta_v' } 
 ];

 const getVerdict = (fps) => {
   if (fps >= 100) return { text: isEn ? 'ULTIMATE EXPERIENCE' : 'ULTIMÁTNÍ ZÁŽITEK', color: '#10b981' };
   if (fps >= 60) return { text: isEn ? 'SMOOTH GAMING' : 'PLYNULÉ HRANÍ', color: '#66fcf1' };
   if (fps >= 30) return { text: isEn ? 'PLAYABLE' : 'HRATELNÉ', color: '#eab308' };
   return { text: isEn ? 'NOT RECOMMENDED' : 'NEDOSTATEČNÝ VÝKON', color: '#ef4444' };
 };

 const searchName = getCleanSearchName(gpu.name);
 const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
 const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`;

 return (
   <div className="guru-hunter-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
     <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
       
       <div style={{ marginBottom: '30px' }}>
         <Link href={isEn ? `/en/gpu-fps/${safeSlug}` : `/gpu-fps/${safeSlug}`} className="guru-back-btn">
           <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU' : 'ZPĚT NA GRAFIKU'}
         </Link>
       </div>

       <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
           <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
           <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
       </div>

       <header style={{ textAlign: 'center', marginBottom: '40px' }}>
         <div className="hunter-badge">
           <Gamepad2 size={16} /> GURU FPS ANALYSIS
         </div>
         <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
           <span style={{ color: vendorColor }}>{normalizeName(gpu.name)}</span> <br/>
           <span style={{ color: '#fff' }}>{gameSlug.replace(/-/g, ' ').toUpperCase()}</span>
         </h1>
       </header>

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
                               href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(searchName)}+cena#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-gpu-fps-detail`}
                               className="guru-buy-winner-btn heureka-btn v10-hl-btn"
                               data-subid="v10-gpu-fps-detail"
                               data-cat="gpu_fps_hunter"
                               style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                           >
                               <ShoppingCart size={16} /> Heureka.cz
                           </a>
                       </>
                   )}
               </div>
           </div>
       </div>

       <div className="fps-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '60px' }}>
         {gamesToShow.map((game) => {
           const dbKey = game.key;
           let fpsValue = Number(fpsData[`${dbKey}_1440p`] || fpsData[`${dbKey}_1080p`] || 0);
           const verdict = getVerdict(fpsValue);
           const isActive = gameSlug === game.id;

           return (
             <Link key={game.id} href={`/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}/${game.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
               <div className="game-fps-card" style={{ background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(15, 17, 21, 0.95)', border: isActive ? `2px solid ${vendorColor}` : '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: '0.3s' }}>
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: verdict.color }}></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                   <h3 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', margin: 0, color: isActive ? vendorColor : '#fff' }}>{game.name}</h3>
                   <span style={{ fontSize: '10px', fontWeight: '950', color: verdict.color, letterSpacing: '1px' }}>1440p ULTRA</span>
                 </div>
                 <div className="fps-main-val" style={{ fontSize: '64px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>
                   {fpsValue || '??'} <span style={{ fontSize: '20px', color: '#4b5563' }}>FPS</span>
                 </div>
                 <div style={{ marginTop: '15px', color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span>{verdict.text}</span>
                   <ChevronRight size={16} />
                 </div>
               </div>
             </Link>
           );
         })}
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
           <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
               <Gamepad2 size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span>
           </a>
           <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
               <AlertTriangle size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span>
           </a>
       </div>

       {!isEn && (
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
               <HeurekaButtons isEn={false} manualSearch={gpu.name} positionId="276026" />
           </div>
       )}

       <section className="massive-seo-hub" style={{ marginBottom: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
           <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: `4px solid ${vendorColor}`, paddingLeft: '15px' }}>PROZKOUMEJ GURU DATABÁZI</h2>
           <div className="seo-hub-grid">
               <div className="hub-column">
                   <div className="hub-col-header"><Swords size={20} color="#ff0055" /> HW Souboje</div>
                   <ul className="hub-links-list">
                       <li><a href="/cpuvs"><ChevronRight size={16} /> Souboje Procesorů</a></li>
                       <li><a href="/gpuvs"><ChevronRight size={16} /> Souboje Grafických Karet</a></li>
                   </ul>
               </div>
           </div>
       </section>

     </main>

     <div className="sticky-bottom-anchor">
         <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
         <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
     </div>

     <Script id="v10-hl-script" strategy="lazyOnload">
         {`
             if (typeof window !== 'undefined') {
                 document.addEventListener('click', function(e) {
                     const btn = e.target.closest('.v10-hl-btn');
                     if (btn) {
                         e.preventDefault();
                         const targetUrl = btn.href;
                         const subId = btn.getAttribute('data-subid');
                         const cat = btn.getAttribute('data-cat');
                         if (navigator.sendBeacon) {
                             navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: cat, sub_id: subId, page: window.location.pathname }));
                         }
                         setTimeout(() => { window.location.href = targetUrl; }, 150);
                     }
                 });
             }
         `}
     </Script>

     <style dangerouslySetInnerHTML={{__html: `
       .hunter-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
       .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
       .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
       .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
       .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
       .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
       .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
       .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; }
       .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; }
       .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }
       .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
       .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
       .ad-mobile-wrapper { display: none; width: 100%; }
       @media (max-width: 768px) {
           .guru-hunter-wrapper { padding-top: 80px !important; }
           .inner-container { padding: 0 15px !important; }
           .ad-desktop-wrapper { display: none !important; }
           .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
           .main-h1 { font-size: 1.6rem !important; }
           .fps-matrix-grid { grid-template-columns: 1fr !important; gap: 15px; }
       }
     `}} />
   </div>
 );
}
