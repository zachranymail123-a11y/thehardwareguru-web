import React from 'react';
import { ChevronLeft, CheckCircle2, Monitor, ArrowRight, ThumbsUp, AlertTriangle } from 'lucide-react';

/**
 * GURU GPU RECOMMEND ENGINE V1.6 (BULLETPROOF PARAMS)
 * Cesta: src/app/gpu-recommend/[slug]/page.js
 * 🛡️ FIX: Imunní vůči názvu složky (params.slug vs params.gpu). Ošetřeno pro Vercel build.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${gpuSlug}*&order=slug.asc`, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  try {
      const cleanString = gpuSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res3 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata({ params }) {
  // Ochrana parametrů (funguje jak pro [slug], tak pro [gpu] složky)
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };
  
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  return {
    title: isEn ? `Should I buy ${gpu.name}? Guru Verdict` : `Vyplatí se koupit ${gpu.name}? Verdikt Guru`,
    description: isEn ? `Hardware Guru recommendation for ${gpu.name}.` : `Doporučení a analýza cena/výkon pro grafiku ${gpu.name}.`,
    alternates: {
      canonical: `https://thehardwareguru.cz/gpu-recommend/${safeSlug}`,
      languages: { 'en': `https://thehardwareguru.cz/en/gpu-recommend/${safeSlug}`, 'cs': `https://thehardwareguru.cz/gpu-recommend/${safeSlug}` }
    }
  };
}

export default async function GpuRecommendPage({ params }) {
  // Ochrana parametrů
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', minHeight: '100vh' }}>GPU NENALEZENO</div>;

  const isHighEnd = (gpu.performance_index || 0) > 100;
  const isMidRange = (gpu.performance_index || 0) > 50 && (gpu.performance_index || 0) <= 100;

  const getVerdict = () => {
      if (isHighEnd) return { icon: <ThumbsUp size={40} />, color: '#10b981', en: 'EXCELLENT BUY', cz: 'VÝBORNÁ KOUPĚ' };
      if (isMidRange) return { icon: <CheckCircle2 size={40} />, color: '#66fcf1', en: 'GOOD VALUE', cz: 'DOBRÝ POMĚR CENA/VÝKON' };
      return { icon: <AlertTriangle size={40} />, color: '#eab308', en: 'CONSIDER ALTERNATIVES', cz: 'ZVAŽTE ALTERNATIVY' };
  };

  const verdict = getVerdict();
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU PROFILE' : 'ZPĚT NA PROFIL'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102,252,241,0.05)' }}>
            <Monitor size={16} /> GURU RECOMMENDATION
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            {isEn ? 'SHOULD YOU BUY' : 'VYPLATÍ SE KOUPIT'} <br/>
            <span style={{ color: '#66fcf1' }}>{normalizeName(gpu.name)}?</span>
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '60px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: verdict.color, display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {verdict.icon}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? verdict.en : verdict.cz}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '1.1rem', maxWidth: '600px', margin: '30px auto 0', lineHeight: '1.8' }}>
                    {isEn ? (
                        <p>Based on current market data, specifications, and gaming benchmarks, the <strong>{gpu.name}</strong> is considered to be a <strong>{verdict.en.toLowerCase()}</strong> for your next PC build.</p>
                    ) : (
                        <p>Na základě aktuálních dat z trhu, specifikací a herních benchmarků hodnotíme grafickou kartu <strong>{gpu.name}</strong> jako <strong>{verdict.cz.toLowerCase()}</strong> pro vaši novou PC sestavu.</p>
                    )}
                </div>
            </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="launch-btn">
                <ArrowRight size={20} /> <span style={{ marginLeft: '10px' }}>{isEn ? 'Launch GPU VS Engine' : 'Spustit VS Engine'}</span>
            </a>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        .launch-btn { display: inline-flex; align-items: center; justify-content: center; padding: 18px 40px; background: linear-gradient(135deg, #66fcf1 0%, #45a29e 100%); color: #0b0c10; border-radius: 16px; font-weight: 950; font-size: 15px; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .launch-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
      `}} />
    </div>
  );
}
