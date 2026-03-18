import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE - V6.4 (REAL-TIME DATABASE FETCH)
 * 🛡️ FIX: Vynucení nulové cache pro okamžité zobrazení nových her.
 * 🛡️ FIX: Dark Mode pro HTML Selecty (konec bílých roletek).
 * 🛡️ SEO: Google Golden Rich + Maximální prolinkování.
 */

// 🚀 GURU RULE: Totální bypass cache pro real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  // NEXT.js 15 Fix: Ošetření params
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
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
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  
  // Inicializace klienta přímo ve funkci pro server-side fetch
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY // Používáme SR key pro stabilní fetch
  );

  // 🚀 GURU DATA FETCH: Vynucujeme čerstvá data bez mezipaměti
  const [gpuRes, cpuRes, gameRes] = await Promise.all([
    supabase.from('gpus').select('id,name,vendor,slug').order('name'),
    supabase.from('cpus').select('id,name').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  // GOOGLE GOLDEN RICH DATA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Guru GTA 6 Predictor",
    "url": `${baseUrl}/fps-kalkulacka`,
    "description": "Zjisti odhad výkonu pro GTA VI na tvém PC.",
    "applicationCategory": "GameTool"
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '100px', color: '#fff' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="guru-badge"><Gamepad2 size={16} /> GURU FPS ENGINE</div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'FPS' : 'ROZJEDU'} <span style={{ color: '#a855f7' }}>TO?</span>
          </h1>

          <div className="main-bait-panel">
            <div className="bait-tag"><Sparkles size={14} /> EXKLUZIVNÍ AI MODUL</div>
            <h2 className="bait-title">CHCETE VĚDĚT, JAK VÁM POJEDE <span style={{color: '#f43f5e'}}>GTA VI?</span></h2>
            <p className="bait-desc">Databáze her je nyní LIVE. Každá nově přidaná hra se zobrazí okamžitě po refreshi.</p>
          </div>
        </header>

        {/* 🚀 KLIENTSKÁ KOMPONENTA S ROLETKAMI */}
        <FpsCalculatorClient 
          gpus={gpuRes.data || []} 
          cpus={cpuRes.data || []} 
          games={gameRes.data || []} 
          isEn={isEn} 
        />

        <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/cpu-index" className="silo-mini-card"><Cpu size={20} color="#f59e0b" /> KATALOG PROCESORŮ <ArrowRight size={16} /></a>
            <a href="/gpu-index" className="silo-mini-card"><Monitor size={20} color="#66fcf1" /> KATALOG GRAFIK <ArrowRight size={16} /></a>
            <a href="/cpuvs" className="silo-mini-card highlight"><Zap size={20} color="#a855f7" /> BOTTLENECK NÁSTROJ <ArrowRight size={16} /></a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
        
        /* 🔥 DARK SELECT FIX: Koniec bielych roletiek */
        select {
          background-color: #0f1115 !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          outline: none;
        }
        select option {
          background-color: #1a1d23 !important;
          color: #ffffff !important;
        }

        .main-bait-panel { background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; margin-top: 30px; border-bottom: 2px solid #f43f5e; box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
        .bait-tag { display: inline-flex; align-items: center; gap: 6px; background: #f43f5e; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 950; margin-bottom: 15px; }
        .bait-title { font-size: 22px; font-weight: 950; margin: 0; text-transform: uppercase; }
        .bait-desc { font-size: 14px; color: #9ca3af; margin: 10px 0 0; }

        .silo-mini-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.9); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; font-weight: 950; font-size: 13px; transition: 0.3s; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #a855f7; }
        .silo-mini-card.highlight { border-color: rgba(168, 85, 247, 0.5); }
      `}} />
    </div>
  );
}
