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

const findGpuBySlug = async (gpuSlug) => {
 const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
 const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers });
 const data = await res.json();
 return data?.[0] || null;
};

export default async function GpuFpsHunterPage(props) {
 const params = await props.params;
 const rawSlug = params?.slug || '';
 // 🔥 Detekce jazyka z URL nebo z proxy
 const isEn = props.isEnProxy === true || rawSlug.startsWith('en-');
 const cleanSlug = rawSlug.replace(/^en-/, '');
 const gameSlug = params?.game || '';

 const gpu = await findGpuBySlug(cleanSlug);
 if (!gpu) return notFound();

 const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
 const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

 const gamesToShow = [
   { id: 'resident-evil-requiem', name: 'Resident Evil Requiem', key: 'resident_evil_requiem' },
   { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
   { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
   { id: 'starfield', name: 'Starfield', key: 'starfield' },
   { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' }
 ];

 const dbKey = gameSlug.replace(/-/g, '_');
 const fpsValue = fpsData[`${dbKey}_1440p`] || fpsData[`${dbKey}_1080p`] || 0;

 return (
   <div className="guru-fps-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
     <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
       
       <div style={{ marginBottom: '30px' }}>
         <Link href={isEn ? `/en/gpu-fps/${cleanSlug}` : `/gpu-fps/${cleanSlug}`} className="guru-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#66fcf1', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
           <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
         </Link>
       </div>

       <header style={{ textAlign: 'center', marginBottom: '40px' }}>
         <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>
           <span style={{ color: vendorColor }}>{gpu.name}</span> <br/>
           <span style={{ color: '#fff' }}>{gameSlug.replace(/-/g, ' ').toUpperCase()}</span>
         </h1>
         <div style={{ fontSize: '10rem', fontWeight: '950', color: '#fff' }}>{fpsValue || '??'}</div>
       </header>

       {/* Affiliate Sekce */}
       <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
          {isEn ? (
              <a href={`https://www.amazon.com/s?k=${encodeURIComponent(gpu.name)}&tag=thehardware07-20`} target="_blank" style={{ background: '#f59e0b', color: '#000', padding: '20px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}>BUY ON AMAZON</a>
          ) : (
              <a href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(gpu.name)}#utm_source=thehardwareguru.cz`} target="_blank" style={{ background: '#0078d4', color: '#fff', padding: '20px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}>KOUPIT NA HEUREKA</a>
          )}
       </div>

     </main>
   </div>
 );
}
