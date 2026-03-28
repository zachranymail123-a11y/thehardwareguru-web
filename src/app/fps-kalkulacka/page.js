import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../components/SeznamAd';

/**
 * GURU FPS ENGINE - V6.5 (MOBILE OPTIMIZED)
 * 🚀 CÍL: Maximální monetizace skrze Seznam Partner a perfektní mobilní zobrazení.
 */

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const p = await props.params;
  const s = await props.searchParams;
  const isEn = p?.lang === 'en' || s?.lang === 'en' || false;
  return {
    title: isEn ? 'GTA VI FPS Predictor & Calculator | The Hardware Guru' : 'GTA VI FPS Predikce & Kalkulačka | The Hardware Guru',
    description: 'Zjisti jako první, kolik FPS ti dá GTA VI na tvé sestavě. Unikátní AI odhad výkonu založený na reálných datech.',
    alternates: { 
        canonical: `${baseUrl}/fps-kalkulacka`,
        languages: { "en": `${baseUrl}/en/fps-calculator`, "cs": `${baseUrl}/fps-kalkulacka` }
    }
  };
}

export default async function FpsKalkulackaPage(props) {
  const p = await props.params;
  const s = await props.searchParams;
  const isEn = p?.lang === 'en' || s?.lang === 'en' || false;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const [gpuRes, cpuRes, gameRes] = await Promise.all([
    supabase.from('gpus').select('id,name,vendor,slug').order('name'),
    supabase.from('cpus').select('id,name').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  return (
    <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="guru-badge"><Gamepad2 size={16} /> GURU FPS ENGINE</div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'FPS' : 'ROZJEDU'} <span style={{ color: '#a855f7' }}>TO?</span>
          </h1>

          <div className="main-bait-panel">
            <div className="bait-tag"><Sparkles size={14} /> EXKLUZIVNÍ AI MODUL</div>
            <h2 className="bait-title">CHCETE VĚDĚT, JAK VÁM POJEDE <span style={{color: '#f43f5e'}}>GTA VI?</span></h2>
            <p className="bait-desc">Stačí níže zadat vaši sestavu. Po výpočtu se vám odemkne <strong>přesný odhad pro GTA VI</strong>!</p>
          </div>
        </header>

        {/* 🔥 SEZNAM AD #1: TOP BANNER (STRIKTNÍ SEPARACE) */}
        <div style={{ marginBottom: '40px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <FpsCalculatorClient gpus={gpuRes.data || []} cpus={cpuRes.data || []} games={gameRes.data || []} isEn={isEn} />
        </div>

        {/* 🔥 SEZNAM AD #2: BOTTOM BANNER (POUZE MOBIL) */}
        <div className="ad-mobile-wrapper" style={{ marginTop: '50px' }}>
          <SeznamAd zoneId={408651} width={300} height={250} />
        </div>

        <div className="silo-grid" style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/cpu-index" className="silo-mini-card"><Cpu size={20} color="#f59e0b" /> KATALOG PROCESORŮ <ArrowRight size={16} /></a>
            <a href="/gpu-index" className="silo-mini-card"><Monitor size={20} color="#66fcf1" /> KATALOG GRAFIK <ArrowRight size={16} /></a>
            <a href="/cpuvs" className="silo-mini-card highlight"><Zap size={20} color="#a855f7" /> BOTTLENECK NÁSTROJ <ArrowRight size={16} /></a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
        
        .main-bait-panel { background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; margin-top: 30px; border-bottom: 2px solid #f43f5e; box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
        .bait-tag { display: inline-flex; align-items: center; gap: 6px; background: #f43f5e; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 950; margin-bottom: 15px; }
        .bait-title { font-size: 22px; font-weight: 950; margin: 0; text-transform: uppercase; }
        .bait-desc { font-size: 14px; color: #9ca3af; margin: 10px 0 0; }

        .silo-mini-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.9); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; font-weight: 950; font-size: 13px; transition: 0.3s; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #a855f7; }
        .silo-mini-card.highlight { border-color: rgba(168, 85, 247, 0.5); }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-page-wrapper { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 2rem !important; }
            .main-bait-panel { padding: 20px !important; margin-top: 20px !important; }
            .bait-title { font-size: 18px !important; }
            .silo-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
            .silo-mini-card { padding: 20px !important; }
        }
      `}} />
    </div>
  );
}
