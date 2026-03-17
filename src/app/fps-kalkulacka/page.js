import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight, ChevronLeft, Zap, BookOpen } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  return {
    title: isEn ? 'FPS Calculator 2026 | Can I Run It?' : 'FPS Kalkulačka 2026 | Rozjedu to?',
    description: 'Přesný odhad herních FPS pro vaši sestavu. Real-time benchmarky a predikce pro budoucí hity jako GTA VI.',
    alternates: { 
        canonical: `${baseUrl}/fps-kalkulacka`,
        languages: { "en": `${baseUrl}/en/fps-calculator`, "cs": `${baseUrl}/fps-kalkulacka` }
    }
  };
}

export default async function FpsKalkulackaPage(props) {
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const [gpuRes, cpuRes, gameRes] = await Promise.all([
    supabase.from('gpus').select('id,name,vendor,slug').order('name'),
    supabase.from('cpus').select('id,name').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO HARDWARE HUB' : 'ZPĚT NA HW ROZCESTNÍK'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="guru-badge"><Gamepad2 size={16} /> GURU FPS ENGINE</div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>
            {isEn ? 'FPS' : 'ROZJEDU'} <span style={{ color: '#a855f7' }}>{isEn ? 'CALCULATOR' : 'TO?'}</span>
          </h1>
        </header>

        <FpsCalculatorClient gpus={gpuRes.data || []} cpus={cpuRes.data || []} games={gameRes.data || []} isEn={isEn} />

        {/* EXTRÉMNÍ PROLINKOVÁNÍ */}
        <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href="/cpu-index" className="silo-mini-card"><Cpu size={20} color="#f59e0b" /> KATALOG PROCESORŮ <ArrowRight size={16} /></a>
            <a href="/gpu-index" className="silo-mini-card"><Monitor size={20} color="#66fcf1" /> KATALOG GRAFIK <ArrowRight size={16} /></a>
            <a href="/cpuvs" className="silo-mini-card highlight"><Zap size={20} color="#a855f7" /> BOTTLENECK NÁSTROJ <ArrowRight size={16} /></a>
        </div>

        <div style={{ marginTop: '40px', padding: '40px', background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '20px', color: '#a855f7' }}><Info size={24} /> Jak to funguje?</h2>
            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>Náš engine porovnává reálná data ze stovek herních benchmarků. Počítáme výkon na základě konkrétní kombinace vašeho procesoru a grafiky.</p>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; fontSize: 11px; fontWeight: 950; textTransform: uppercase; letterSpacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); borderRadius: 50px; background: rgba(168, 85, 247, 0.1); }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
        .silo-mini-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.9); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; font-weight: 950; font-size: 13px; transition: 0.3s; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #a855f7; }
        .silo-mini-card.highlight { border-color: rgba(168, 85, 247, 0.5); background: rgba(168, 85, 247, 0.05); }
      `}} />
    </div>
  );
}
