import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE - V2.5 (HARDENED PRODUCTION)
 * 🛡️ FIX 1: Opravena fatální syntaktická chyba v inline stylech.
 * 🛡️ FIX 2: Používá oficiální SDK pro maximální stabilitu.
 * 🛡️ FIX 3: Odstraněny filtry performance_index - načte vše z tvého CSV.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  return {
    title: isEn ? 'FPS Calculator 2026 | The Hardware Guru' : 'FPS Kalkulačka 2026 | The Hardware Guru',
    alternates: { 
        canonical: `${baseUrl}/fps-kalkulacka`,
        languages: { "en": `${baseUrl}/en/fps-calculator`, "cs": `${baseUrl}/fps-kalkulacka` }
    }
  };
}

export default async function FpsKalkulackaPage(props) {
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Načtení dat bez jakýchkoli omezujících filtrů
  const [gpuRes, cpuRes, gameRes] = await Promise.all([
    supabase.from('gpus').select('id,name,vendor,slug').order('name'),
    supabase.from('cpus').select('id,name,vendor,slug').order('name'),
    supabase.from('games').select('id,name,slug').order('name')
  ]);

  const gpus = gpuRes.data || [];
  const cpus = cpuRes.data || [];
  const games = gameRes.data || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Gamepad2 size={16} /> GURU FPS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'FPS' : 'ROZJEDU'} <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>{isEn ? 'CALCULATOR' : 'TO?'}</span>
          </h1>
        </header>

        <FpsCalculatorClient gpus={gpus} cpus={cpus} games={games} isEn={isEn} />

        {/* Prolinkování na funkční stránky webu (vyhýbáme se 404) */}
        <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="silo-mini-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Cpu size={20} color="#f59e0b" /> {isEn ? 'CPU Database' : 'Katalog procesorů'}
                </div>
                <ArrowRight size={16} />
            </a>
            <a href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-mini-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Monitor size={20} color="#66fcf1" /> {isEn ? 'GPU Database' : 'Katalog grafik'}
                </div>
                <ArrowRight size={16} />
            </a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .silo-mini-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.9); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; font-weight: 950; text-transform: uppercase; font-size: 13px; transition: 0.3s; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #a855f7; background: rgba(168, 85, 247, 0.05); }
      `}} />
    </div>
  );
}
