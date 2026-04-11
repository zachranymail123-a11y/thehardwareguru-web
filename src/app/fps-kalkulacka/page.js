import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight, ChevronLeft, Zap, Sparkles, Swords, ChevronRight } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 

/**
 * GURU FPS ENGINE - V6.9 (FIXED DATABASE FETCH + I18N FIX)
 * 🚀 CÍL: Přidání 'performance_index' do dotazů na databázi pro zprovoznění dynamického výpočtu FPS. Oprava angličtiny.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

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
  
  // 🔥 FINÁLNÍ A NEJBEZPEČNĚJŠÍ DETEKCE (čte signál přímo z EN Proxy) 🔥
  const isEn = props.isEnProxy === true || p?.lang === 'en' || s?.lang === 'en' || false;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
  });

  const [gpuRes, cpuRes, gameRes] = await Promise.all([
    supabase.from('gpus').select('id,name,vendor,slug,performance_index').order('name'),
    supabase.from('cpus').select('id,name,performance_index').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  return (
    <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="guru-badge"><Gamepad2 size={16} /> GURU FPS ENGINE</div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CAN I' : 'ROZJEDU'} <span style={{ color: '#a855f7' }}>{isEn ? 'RUN IT?' : 'TO?'}</span>
          </h1>

          <div className="main-bait-panel">
            <div className="bait-tag"><Sparkles size={14} /> {isEn ? 'EXCLUSIVE AI MODULE' : 'EXKLUZIVNÍ AI MODUL'}</div>
            <h2 className="bait-title">{isEn ? 'WANT TO KNOW HOW YOUR PC HANDLES ' : 'CHCETE VĚDĚT, JAK VÁM POJEDE '}<span style={{color: '#f43f5e'}}>GTA VI?</span></h2>
            <p className="bait-desc">{isEn ? 'Enter your setup below. An ' : 'Stačí níže zadat vaši sestavu. Po výpočtu se vám odemkne '}<strong>{isEn ? 'accurate GTA VI estimate' : 'přesný odhad pro GTA VI'}</strong>{isEn ? ' will unlock after the calculation!' : '!'}</p>
          </div>
        </header>

        <div style={{ marginTop: '30px' }}>
          <FpsCalculatorClient gpus={gpuRes.data || []} cpus={cpuRes.data || []} games={gameRes.data || []} isEn={isEn} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <HeurekaButtons isEn={isEn} manualSearch="RTX 5090" positionId="276026" />
        </div>

        <div className="silo-grid" style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-mini-card"><Cpu size={20} color="#f59e0b" /> {isEn ? 'CPU DATABASE' : 'KATALOG PROCESORŮ'} <ArrowRight size={16} /></a>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-mini-card"><Monitor size={20} color="#66fcf1" /> {isEn ? 'GPU DATABASE' : 'KATALOG GRAFIK'} <ArrowRight size={16} /></a>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="silo-mini-card highlight"><Zap size={20} color="#a855f7" /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK NÁSTROJ'} <ArrowRight size={16} /></a>
        </div>

        <section className="massive-seo-hub" style={{ marginTop: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '50px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>
                {isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}
            </h2>
            <div className="seo-hub-grid">
                <div className="hub-column">
                    <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"}><ChevronRight size={16} /> {isEn ? 'Graphics Card Battles' : 'Souboje Grafických Karet'}</a></li>
                        <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                        <li><a href={isEn ? "/en/gpu-index" : "/gpu-index"}><ChevronRight size={16} /> {isEn ? 'Graphics Cards Database' : 'Katalog Grafických Karet'}</a></li>
                        <li><a href={isEn ? "/en/cpu-index" : "/cpu-index"}><ChevronRight size={16} /> {isEn ? 'Processor Database' : 'Katalog Procesorů'}</a></li>
                    </ul>
                </div>
                <div className="hub-column">
                    <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'Bottleneck Test' : 'Bottleneck Test'}</a></li>
                        <li><a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"}><ChevronRight size={16} /> {isEn ? 'Game Archive' : 'Archiv her'}</a></li>
                        <li><a href={isEn ? "/en/clanky" : "/clanky"}><ChevronRight size={16} /> {isEn ? 'News & Articles' : 'Články a Novinky'}</a></li>
                        <li><a href={isEn ? "/en/tipy" : "/tipy"}><ChevronRight size={16} /> {isEn ? 'GURU Tips' : 'GURU Tipy'}</a></li>
                    </ul>
                </div>
            </div>
        </section>

      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
        
        .main-bait-panel { background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; margin-top: 30px; border-bottom: 2px solid #f43f5e; box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
        .bait-tag { display: inline-flex; align-items: center; gap: 6px; background: #f43f5e; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 950; margin-bottom: 15px; }
        .bait-title { font-size: 22px; font-weight: 950; margin: 0; text-transform: uppercase; }
        .bait-desc { font-size: 14px; color: #9ca3af; margin: 10px 0 0; }

        .silo-mini-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.9); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; font-weight: 950; font-size: 13px; transition: 0.3s; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #a855f7; }
        .silo-mini-card.highlight { border-color: rgba(168, 85, 247, 0.5); }

        .seo-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .hub-column { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
        .hub-links-list { list-style: none; padding: 0; }
        .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 15px; font-weight: bold; transition: 0.3s; }
        .hub-links-list a:hover { color: #66fcf1; transform: translateX(10px); }

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
            .guru-page-wrapper { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 2rem !important; }
            .main-bait-panel { padding: 20px !important; margin-top: 20px !important; }
            .bait-title { font-size: 18px !important; }
            .silo-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
            .silo-mini-card { padding: 20px !important; }
            .seo-hub-grid { grid-template-columns: 1fr; }
            .hub-column { padding: 25px; }
        }
      `}} />
    </div>
  );
}
