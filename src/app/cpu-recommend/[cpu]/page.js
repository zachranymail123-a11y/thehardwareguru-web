import React from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, 
  CheckCircle2,
  Cpu,
  ArrowRight,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU CPU RECOMMEND ENGINE V2.1 (MOBILE OPTIMIZED)
 * 🚀 CÍL: Maximální monetizace a perfektní mobilní zobrazení CPU verdiktů.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const url1 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  try {
      const cleanString = cpuSlug.replace(/-/g, ' ').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${conditions})&order=name.asc`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata({ params }) {
  const { cpu: rawCpuSlug } = params;
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn ? `Should I buy ${cpu.name}? Guru Verdict | The Hardware Guru` : `Vyplatí se koupit ${cpu.name}? Verdikt Guru | The Hardware Guru`,
    alternates: {
      canonical: `${baseUrl}/cpu-recommend/${cpu.slug}`,
      languages: { 'en': `${baseUrl}/en/cpu-recommend/${cpu.slug}`, 'cs': `${baseUrl}/cpu-recommend/${cpu.slug}` }
    }
  };
}

export default async function CpuRecommendPage({ params }) {
  const { cpu: rawCpuSlug } = params;
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) notFound();

  const isHighEnd = (cpu.performance_index || 0) > 80;
  const isMidRange = (cpu.performance_index || 0) > 40 && (cpu.performance_index || 0) <= 80;

  const getVerdict = () => {
      if (isHighEnd) return { icon: <ThumbsUp size={40} />, color: '#10b981', en: 'EXCELLENT BUY', cz: 'VÝBORNÁ KOUPĚ' };
      if (isMidRange) return { icon: <CheckCircle2 size={40} />, color: '#f59e0b', en: 'GOOD VALUE', cz: 'DOBRÝ POMĚR CENA/VÝKON' };
      return { icon: <AlertTriangle size={40} />, color: '#ef4444', en: 'CONSIDER ALTERNATIVES', cz: 'ZVAŽTE ALTERNATIVY' };
  };

  const verdict = getVerdict();

  return (
    <div className="recommend-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="recommendation-badge">
            <Cpu size={16} /> GURU RECOMMENDATION
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.1rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            {isEn ? 'SHOULD YOU BUY' : 'VYPLATÍ SE KOUPIT'} <br/>
            <span style={{ color: '#f59e0b' }}>{normalizeName(cpu.name)}?</span>
          </h1>
        </header>

        {/* 🔥 TOP AD SLOT - STRIKTNÍ SEPARACE */}
        <div style={{ marginBottom: '40px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <section style={{ marginBottom: '30px' }}>
            <div className="verdict-main-box" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '60px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: verdict.color, display: 'flex', justifycontent: 'center', marginBottom: '20px', justifyContent: 'center' }}>
                    {verdict.icon}
                </div>
                <div className="verdict-title" style={{ fontSize: '40px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? verdict.en : verdict.cz}
                </div>
                <div className="verdict-text" style={{ color: '#d1d5db', fontSize: '1.1rem', maxWidth: '600px', margin: '30px auto 0', lineHeight: '1.8' }}>
                    {isEn ? (
                        <p>Based on current market data, specifications, and gaming benchmarks, the <strong>{cpu.name}</strong> is considered to be a <strong>{verdict.en.toLowerCase()}</strong> for your next PC build or upgrade.</p>
                    ) : (
                        <p>Na základě aktuálních dat z trhu, specifikací a herních benchmarků hodnotíme procesor <strong>{cpu.name}</strong> jako <strong>{verdict.cz.toLowerCase()}</strong> pro vaši novou PC sestavu nebo upgrade.</p>
                    )}
                </div>
            </div>
        </section>

        {/* 🔥 INNER AD SLOT - STRIKTNÍ SEPARACE (POUZE MOBIL) */}
        <div className="ad-mobile-wrapper" style={{ marginBottom: '40px' }}>
            <SeznamAd zoneId={408651} width={300} height={250} />
        </div>

        <section style={{ textAlign: 'center', marginTop: '40px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Compare this CPU with others' : 'Porovnejte tento procesor s ostatními'}
            </div>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-battle-btn">
                <ArrowRight size={20} /> {isEn ? 'CPU VS ENGINE' : 'CPU VS ENGINE'}
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .recommendation-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(245,158,11,0.3); border-radius: 50px; background: rgba(245,158,11,0.05); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(245,158,11,0.1); transform: translateX(-5px); }
        .guru-battle-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 40px; background: #f59e0b; color: #fff; border-radius: 16px; font-weight: 950; fontSize: 15px; text-decoration: none; text-transform: uppercase; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-battle-btn:hover { transform: scale(1.05); filter: brightness(1.1); }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .recommend-page-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .verdict-main-box { padding: 30px 15px !important; border-radius: 20px !important; }
            .main-title { font-size: 1.6rem !important; }
            .verdict-title { font-size: 1.5rem !important; }
            .verdict-text { font-size: 0.95rem !important; margin-top: 20px !important; }
            .guru-battle-btn { width: 100%; justify-content: center; }
            main { padding: 0 15px !important; }
        }
      `}} />
    </div>
  );
}
