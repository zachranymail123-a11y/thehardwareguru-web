import React, { cache } from 'react';
import Script from 'next/script'; 
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { 
 ChevronLeft, Activity, Swords, CheckCircle2, Database, ArrowRight, Gamepad2, AlertTriangle, ShoppingCart, Trophy, Zap, LayoutList
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import GuruCpuCompareText from '../../../components/GuruCpuCompareText';

/**
 * GURU CPU COMPARE ENGINE - V4.0 (FIXED VS LOGIC + MONETIZATION)
 * 🚀 CÍL: Fix 404 (správná VS logika), garantovaný tracking, Rich Snippets a Money Loop.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const findCpuBySlug = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${slugPart.replace(/^en-/, '')}&limit=1`, { 
        headers: authHeaders, 
        next: { revalidate: 3600 } 
      });
      if (res.ok) { 
          const data = await res.json(); 
          if (data?.length) return data[0]; 
      }
  } catch(e) {}
  return null;
};

const getCompareData = async (slug) => {
  if (!slug) return null;
  const parts = slug.replace(/^en-/, '').split('-vs-');
  if (parts.length !== 2) return null;
  const [cpuA, cpuB] = await Promise.all([findCpuBySlug(parts[0]), findCpuBySlug(parts[1])]);
  return { cpuA, cpuB };
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const data = await getCompareData(rawSlug);
  if (!data?.cpuA || !data?.cpuB) return { title: 'Comparison | Hardware Guru' };
  
  const isEn = rawSlug.startsWith('en-');
  return {
    title: isEn 
      ? `${data.cpuA.name} vs ${data.cpuB.name} - Price & Performance (2026)`
      : `${data.cpuA.name} vs ${data.cpuB.name} - Srovnání, cena a výkon (2026)`,
    alternates: { canonical: `${baseUrl}/cpuvs/${rawSlug}` }
  };
}

export default async function CpuComparePage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getCompareData(rawSlug);

  if (!data?.cpuA || !data?.cpuB) return notFound();

  const { cpuA, cpuB } = data;
  const perfDiff = Math.round((cpuB.performance_index / cpuA.performance_index - 1) * 100);
  const cpuBBrand = normalizeName(cpuB.name).trim();
  
  const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(cpuB.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
  const amazonLink = `https://www.amazon.de/s?k=${encodeURIComponent(cpuB.name)}&tag=thehardware07-21`;

  return (
    <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      {/* STICKY MOBILE CTA */}
      {!isEn && (
        <div className="mobile-anchor-trap">
          <a href={heurekaLink} target="_blank" rel="nofollow sponsored" className="heureka-hn-link pulse-button" data-trixam-positionid="276026">
            <ShoppingCart size={18} /> CENA {cpuBBrand}
          </a>
        </div>
      )}

      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="upgrade-badge"><Swords size={14} /> {isEn ? 'CPU BATTLE' : 'SOUBOJ PROCESORŮ'}</div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
            {normalizeName(cpuA.name)} <span style={{color: '#f59e0b'}}>VS</span> {normalizeName(cpuB.name)}
          </h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="gpu-card-box old-cpu" style={{ borderTop: '5px solid #4b5563', opacity: 0.8 }}><h2 className="gpu-name-text">{normalizeName(cpuA.name)}</h2></div>
            <div className="vs-badge" style={{ background: '#f59e0b', color: '#000', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>VS</div>
            <div className="gpu-card-box new-cpu" style={{ borderTop: '5px solid #f59e0b', transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}><h2 className="gpu-name-text">{normalizeName(cpuB.name)}</h2></div>
        </div>

        <div className="affiliate-cta-grid" style={{ marginBottom: '40px', background: 'rgba(0,0,0,0.4)', padding: '35px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ marginBottom: '15px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase', fontSize: '14px' }}>
                  {isEn ? `Check current availability and prices` : `Zjistit aktuální dostupnost a ceny`}
                </div>
                <div className="affiliate-btn-wrap" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <a href={isEn ? amazonLink : heurekaLink} target="_blank" rel="nofollow sponsored" className={`guru-buy-winner-btn pulse-button ${!isEn ? 'heureka-hn-link heureka-btn' : 'amazon-btn'}`} data-trixam-positionid="276026" data-trixam-content="Text link" data-trixam-medium="affiliate" style={{ padding: '18px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart size={20} /> {isEn ? `BUY ${cpuBBrand} CHEAPEST` : `🔥 KOUPIT ${cpuBBrand} NEJLEVNĚJI`}
                  </a>
                </div>
                {!isEn && (
                    <div style={{ marginTop: '15px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>
                      ✔ Alza, CZC, Datart a 50+ dalších | ⚡ Ceny se mění každých pár hodin
                    </div>
                )}
            </div>
        </div>

        <section style={{ marginBottom: '40px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px' }}><AlertTriangle size={16} /> BOTTLENECK</div>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} style={{ color: '#fff', textDecoration: 'none' }}><h3>{isEn ? 'SYSTEM CHECK' : 'KONTROLA SYSTÉMU'}</h3></a>
                </div>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px' }}><Gamepad2 size={16} /> FPS TEST</div>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} style={{ color: '#fff', textDecoration: 'none' }}><h3>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3></a>
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
            <div className="content-box-style analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950' }}>{isEn ? 'Battle Analysis' : 'Analýza souboje'}</h2>
                <GuruCpuCompareText cpu1Name={normalizeName(cpuA.name)} cpu2Name={normalizeName(cpuB.name)} perfDiff={perfDiff} cpu1Cores={cpuA.cores} cpu2Cores={cpuB.cores} isEn={isEn} />
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '15px', textTransform: 'uppercase', fontWeight: '950', marginBottom: '25px' }}><LayoutList size={24} /> {isEn ? 'SPECIFICATIONS' : 'PARAMETRY'}</h2>
          <div className="table-wrapper" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden' }}>
              {[
                { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}` },
                { label: isEn ? 'BOOST CLOCK' : 'BOOST TAKT', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz` },
                { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W` }
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: '950' }}>{row.valA}</div>
                  <div style={{ width: '180px', textAlign: 'center', fontSize: '10px', color: '#6b7280', fontWeight: '950' }}>{row.label}</div>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: '950', color: '#f59e0b' }}>{row.valB}</div>
                </div>
              ))}
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><HeurekaButtons isEn={isEn} /></div>
      </main>

      <div className="sticky-bottom-anchor"><SeznamAd zoneId={408654} width={970} height={90} /></div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .pulse-button { animation: pulse-cta 2s infinite; }
        .mobile-anchor-trap { position: fixed; bottom: 100px; right: 15px; z-index: 9999; }
        .mobile-anchor-trap a { background: #0078d4; color: #fff; padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 900; text-decoration: none; boxShadow: 0 10px 40px rgba(0,0,0,0.8); display: flex; alignItems: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2); }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; }
        .gpu-name-text { font-size: clamp(1.2rem, 3vw, 2rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff !important; }
        .amazon-btn { background: #f59e0b; color: #000 !important; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        @media (max-width: 768px) {
            .guru-grid-ring { grid-template-columns: 1fr !important; }
            .vs-badge { margin: 10px auto; transform: rotate(90deg); }
            .guru-tools-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}
