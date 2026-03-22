import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, Swords, Calendar, Zap, Cpu, Activity, BarChart3, 
  Gamepad2, LayoutList, TrendingUp, ArrowRight, Info, Heart, Flame 
} from 'lucide-react';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText';

/**
 * GURU CPU DUELS ENGINE - DETAIL V75.1 (UI REVERT & 404 FINAL FIX)
 * 🚀 CÍL: Návrat k původnímu Guru designu + odstranění 404 chyb.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = true;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/Intel |AMD |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  // Používáme základní select, který je v DB ověřený
  const selectQuery = `*,cpuA:cpus!cpu_a_id(*),cpuB:cpus!cpu_b_id(*)`;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  const performSearch = async (targetSlug, method = 'eq') => {
    // 🔥 GURU FIX: PostgREST vyžaduje % pro ilike vyhledávání
    const filter = method === 'eq' ? `slug=eq.${targetSlug}` : `slug=ilike.%${targetSlug}%`;
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, { headers, cache: 'no-store' });
        const data = await res.json();
        return data?.[0] || null;
    } catch (e) { return null; }
  };

  // 1. Přesný název (amd-ryzen-7-9700x-vs-amd-ryzen-7-9800x3d)
  let duel = await performSearch(cleanSlug);
  if (duel) return duel;

  // 2. Ořezaný o výrobce (ryzen-7-9700x-vs-ryzen-7-9800x3d)
  const vendorless = cleanSlug.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '');
  if (vendorless !== cleanSlug) {
      duel = await performSearch(vendorless);
      if (duel) return duel;
  }

  // 3. Agresivní fuzzy hledání přes LIKE
  duel = await performSearch(vendorless, 'ilike');
  return duel;
});

const getRelatedArticles = async (cpuA, cpuB) => {
    if (!supabaseUrl) return [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const nameA = normalizeName(cpuA || '');
    const nameB = normalizeName(cpuB || '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=title,title_en,slug,slug_en,created_at,image_url&or=(title.ilike.%${encodeURIComponent(nameA)}%,title.ilike.%${encodeURIComponent(nameB)}%)&order=created_at.desc&limit=3`, { headers });
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
};

export async function generateMetadata({ params }) {
  const { slug } = params; // 🛡️ FIX: params není Promise
  const duel = await getDuelData(slug);
  if (!duel) return { title: "CPU Duel | Hardware Guru" };
  const isEn = slug?.startsWith('en-');
  return { title: isEn ? `${duel.cpuA.name} vs ${duel.cpuB.name} Benchmarks` : `${duel.cpuA.name} vs ${duel.cpuB.name} - Testy a Výkon` };
}

// 🛡️ POUZE JEDEN DEFAULT EXPORT - CPU DUEL DETAIL
export default async function CpuDuelDetail({ params }) {
  const { slug } = params; // 🛡️ FIX: params není Promise
  const duel = await getDuelData(slug);
  
  if (!duel) notFound();

  const isEn = slug?.startsWith('en-');
  const { cpuA, cpuB } = duel;
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(duel.created_at || Date.now()));

  const perfA = cpuA.performance_index || 0;
  const perfB = cpuB.performance_index || 0;
  const winner = perfA > perfB ? cpuA : cpuB;
  const perfDiff = Math.round((Math.max(perfA, perfB) / Math.min(perfA, perfB) - 1) * 100);

  const relatedArticles = await getRelatedArticles(cpuA.name, cpuB.name);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} style={{ color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }}>
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT NA VÝBĚR'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0055', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(255, 0, 85, 0.3)', borderRadius: '50px', background: 'rgba(255, 0, 85, 0.1)' }}>
            <Swords size={14} /> GURU CPU BATTLE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {cpuA.name} <span style={{ color: '#ff0055' }}>vs</span> {cpuB.name}
          </h1>
          {perfDiff > 0 && (
            <div style={{ marginTop: '20px', color: '#66fcf1', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {winner.name} {isEn ? 'is' : 'je o'} {perfDiff}% {isEn ? 'faster' : 'výkonnější'}
            </div>
          )}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '50px' }}>
           <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <span style={{ fontSize: '9px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>{cpuA.vendor}</span>
              <h2 style={{ fontSize: '28px', margin: '0', fontWeight: '950' }}>{normalizeName(cpuA.name)}</h2>
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '4px', background: '#0071c5', borderRadius: '24px 24px 0 0' }}></div>
           </div>
           <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <span style={{ fontSize: '9px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>{cpuB.vendor}</span>
              <h2 style={{ fontSize: '28px', margin: '0', fontWeight: '950' }}>{normalizeName(cpuB.name)}</h2>
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '4px', background: '#ed1c24', borderRadius: '24px 24px 0 0' }}></div>
           </div>
        </div>

        {/* 🚀 GURU: SEO ANALYSIS SECTION */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '25px', color: '#fff', fontSize: '1.6rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Info size={24} color="#f59e0b" /> Analýza výkonu
                </h2>
                <div style={{ color: '#d1d5db', lineHeight: '1.8' }}>
                    <GuruCpuCompareText 
                        cpu1Name={normalizeName(cpuA.name)} 
                        cpu2Name={normalizeName(cpuB.name)} 
                        perfDiff={cpuA.performance_index > cpuB.performance_index ? -perfDiff : perfDiff} 
                        cpu1Cores={cpuA.cores} 
                        cpu2Cores={cpuB.cores} 
                        isEn={isEn} 
                    />
                </div>
            </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" style={{ flex: '1', maxWidth: '300px', textAlign: 'center', padding: '18px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', textDecoration: 'none', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase' }}>DEALS</a>
          <a href="/support" style={{ flex: '1', maxWidth: '300px', textAlign: 'center', padding: '18px', background: '#eab308', color: '#000', textDecoration: 'none', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase' }}>SUPPORT</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
            .guru-grid-ring { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}
