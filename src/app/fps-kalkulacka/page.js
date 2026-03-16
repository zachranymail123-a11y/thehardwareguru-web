import React from 'react';
import { Gamepad2, Monitor, Cpu, Info, ArrowRight } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';

/**
 * GURU FPS ENGINE - V1.6 (FINAL VERIFIED)
 * 🛡️ FIX: Ultra-bezpečný fetch. Pokud existují tabulky, data se zobrazí.
 * 🛡️ SEO: Prolinkování na existující cesty webu.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const fetchDatabase = async () => {
    if (!supabaseUrl) return { gpus: [], cpus: [], games: [] };
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    
    try {
        // GURU: Taháme pouze základní info pro selecty. Žádné riziko pádu na joinu.
        const [gpuRes, cpuRes, gameRes] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/gpus?select=id,name,vendor,slug&performance_index=gt.0&order=name.asc`, { headers, cache: 'no-store' }),
            fetch(`${supabaseUrl}/rest/v1/cpus?select=id,name,vendor,slug&performance_index=gt.0&order=name.asc`, { headers, cache: 'no-store' }),
            fetch(`${supabaseUrl}/rest/v1/games?select=id,name,slug&order=name.asc`, { headers, cache: 'no-store' })
        ]);

        return { 
            gpus: gpuRes.ok ? await gpuRes.json() : [], 
            cpus: cpuRes.ok ? await cpuRes.json() : [], 
            games: gameRes.ok ? await gameRes.json() : [] 
        };
    } catch (e) { 
        return { gpus: [], cpus: [], games: [] }; 
    }
};

export default async function FpsKalkulackaPage(props) {
  // Rozpoznání jazyka z URL (funguje i pro proxy)
  const isEn = props?.params?.lang === 'en' || props?.searchParams?.lang === 'en' || false;
  const { gpus, cpus, games } = await fetchDatabase();

  // Opravené cesty - v CZ verzi /bottleneck, v EN verzi /en/bottleneck
  const bottleneckUrl = isEn ? "/en/bottleneck" : "/bottleneck";
  const rankingUrl = isEn ? "/en/cpuvs/ranking" : "/cpuvs/ranking";

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

        {/* Předání dat do klienta */}
        <FpsCalculatorClient gpus={gpus} cpus={cpus} games={games} isEn={isEn} />

        {/* 🚀 PROLINKOVÁNÍ (OPRAVENO) */}
        <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <a href={bottleneckUrl} className="silo-mini-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Info size={20} color="#a855f7" /> {isEn ? 'Check PC Bottleneck' : 'Zkontrolovat Bottleneck'}
                </div>
                <ArrowRight size={16} />
            </a>
            <a href={rankingUrl} className="silo-mini-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Cpu size={20} color="#f59e0b" /> {isEn ? 'CPU Performance Tier List' : 'Žebříček procesorů'}
                </div>
                <ArrowRight size={16} />
            </a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .silo-mini-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.9); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; font-weight: 950; text-transform: uppercase; font-size: 13px; transition: 0.3s; }
        .silo-mini-card:hover { transform: translateY(-3px); border-color: #a855f7; background: rgba(168, 85, 247, 0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      `}} />
    </div>
  );
}
