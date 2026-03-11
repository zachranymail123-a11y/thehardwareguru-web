import React, { cache } from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  Monitor, 
  Gauge, 
  CheckCircle2,
  Flame,
  Heart,
  Swords
} from 'lucide-react';

/**
 * GURU BOTTLENECK & PAIRING ENGINE V1.2 (3-TIER LOOKUP FIX)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🛡️ FIX: Agresivní vyhledávání komponent (řeší "DATA NENALEZENA").
 * 🛡️ NEXT.JS 15: Ošetření 'params' jako Promise.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');

// 🛡️ GURU ENGINE: Robustní vyhledávání CPU
const findCpu = async (slug) => {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  // Tier 1: Exact slug match
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${slug}&limit=1`, { headers, cache: 'no-store' });
    const data = await res.json();
    if (data?.length) return data[0];
    
    // Tier 2: Tokenized fallback
    const clean = slug.replace(/-/g, ' ').replace(/ryzen|core|intel|amd/gi, '').trim();
    const tokens = clean.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length > 0) {
        const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
        const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&and=(${conditions})&limit=1`, { headers, cache: 'no-store' });
        const data2 = await res2.json();
        return data2?.[0] || null;
    }
  } catch (e) { return null; }
  return null;
};

// 🛡️ GURU ENGINE: Robustní vyhledávání GPU
const findGpu = async (slug) => {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  // Tier 1: Exact slug match
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&slug=eq.${slug}&limit=1`, { headers, cache: 'no-store' });
    const data = await res.json();
    if (data?.length) return data[0];
    
    // Tier 2: Tokenized fallback
    const clean = slug.replace(/-/g, ' ').replace(/geforce|rtx|radeon|rx|nvidia|amd/gi, '').trim();
    const tokens = clean.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length > 0) {
        const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
        const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*&and=(${conditions})&limit=1`, { headers, cache: 'no-store' });
        const data2 = await res2.json();
        return data2?.[0] || null;
    }
  } catch (e) { return null; }
  return null;
};

const getPairData = cache(async (slug) => {
  const cleanSlug = slug.replace(/^en-/, '');
  const parts = cleanSlug.split('-with-');
  if (parts.length !== 2) return null;
  const [cpu, gpu] = await Promise.all([findCpu(parts[0]), findGpu(parts[1])]);
  return { cpu, gpu };
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = rawSlug.startsWith('en-');
  const data = await getPairData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Analysis | Hardware Guru' };

  return { 
    title: isEn 
      ? `${data.cpu.name} + ${data.gpu.name} Bottleneck & Performance`
      : `${data.cpu.name} + ${data.gpu.name} – Bottleneck a výkon`,
  };
}

export default async function BottleneckPage({ params, isEn: forcedIsEn }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = forcedIsEn || rawSlug.startsWith('en-');
  const data = await getPairData(rawSlug);

  if (!data?.cpu || !data?.gpu) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#ff0055', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
      DATA NENALEZENA - ZKONTROLUJTE SLUGY V DATABÁZI
    </div>
  );

  const { cpu, gpu } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  // Výpočet bottlenecku
  let bottleneckScore = 0;
  let bottleneckType = 'none';
  if (cpuPower < gpuPower * 0.75) {
      bottleneckScore = Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100);
      bottleneckType = 'cpu';
  } else if (gpuPower < cpuPower * 0.6) {
      bottleneckScore = Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100);
      bottleneckType = 'gpu';
  }

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Gauge size={16} /> GURU BOTTLENECK ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: '#f59e0b' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', fontSize: '0.6em', opacity: 0.5 }}>+</span> <br/>
            <span style={{ color: '#66fcf1' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderTop: `8px solid ${statusColor}`, borderRadius: '24px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }}>
                <div style={{ fontSize: '13px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? 'Calculated Bottleneck' : 'Vypočítaný Bottleneck'}
                </div>
                <div style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '20px 0' }}>
                    {bottleneckScore}%
                </div>
                <div style={{ background: `${statusColor}20`, color: statusColor, padding: '12px 30px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '15px', border: `1px solid ${statusColor}40` }}>
                    {bottleneckScore < 15 ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    {bottleneckScore < 15 ? (isEn ? 'GREAT PAIRING' : 'SKVĚLÉ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
                </div>
            </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'GAME DEALS' : 'HRY ZA TOP CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-deals-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; border-radius: 16px; font-weight: 950; text-transform: uppercase; }
        .guru-support-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; background: #eab308; color: #000; text-decoration: none; border-radius: 16px; font-weight: 950; text-transform: uppercase; }
      `}} />
    </div>
  );
}
