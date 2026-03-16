import React from 'react';
import { Gamepad2, Info, Activity, Monitor, Cpu } from 'lucide-react';
import FpsCalculatorClient from './FpsCalculatorClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.params?.lang === 'en' || false;
  return {
    title: isEn ? 'FPS Calculator 2026 | The Hardware Guru' : 'FPS Kalkulačka 2026 | The Hardware Guru',
    alternates: { canonical: `${baseUrl}/fps-kalkulacka` }
  };
}

const fetchDatabase = async () => {
    if (!supabaseUrl) return { gpus: [], cpus: [], games: [] };
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    
    try {
        const [gpuRes, cpuRes, gameRes] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/gpus?select=id,name,vendor,slug,game_fps!gpu_id(*)&order=name.asc`, { headers, cache: 'no-store' }),
            fetch(`${supabaseUrl}/rest/v1/cpus?select=id,name,vendor,slug,cpu_game_fps!cpu_id(*)&order=name.asc`, { headers, cache: 'no-store' }),
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
  const isEn = props?.params?.lang === 'en' || false;
  const { gpus, cpus, games } = await fetchDatabase();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Gamepad2 size={16} /> GURU FPS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>
            FPS <span style={{ color: '#a855f7' }}>{isEn ? 'CALCULATOR' : 'KALKULAČKA'}</span>
          </h1>
        </header>

        {/* Předáváme už i hry z DB */}
        <FpsCalculatorClient gpus={gpus} cpus={cpus} games={games} isEn={isEn} />
      </main>
    </div>
  );
}
