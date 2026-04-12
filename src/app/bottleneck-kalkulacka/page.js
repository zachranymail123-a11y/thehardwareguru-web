import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 

/**
 * GURU BOTTLENECK CALCULATOR - HUB V3.7 (AFFILIATE UPDATE 2026)
 * 🚀 CÍL: Aktualizace hero HW pro affiliate prokliky na RTX 50 Series.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export const metadata = {
    title: 'PC Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější simulátor bottlenecku. Zjisti reálnou ztrátu FPS a nejlepší cestu k upgradu tvého PC.',
};

export default async function BottleneckPage({ searchParams }) {
    const s = await searchParams;
    const isEn = s?.lang === 'en';
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    });

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const gpus = gpusRes.data || [];
    const cpus = cpusRes.data || [];
    const gamesData = gamesRes.data || [];

    // 🔥 FIX: Aktualizace Hero HW pro HeurekaButtons na generaci RTX 50 (Standard 2026)
    const fallbackGpu = "RTX 5070";
    const isGpuHot = (name = '') => /5070|5080|5090|4090|ultra|high-end/i.test(name);
    const maxGpuPerf = gpus[0]?.performance_index || 1000;
    const scoreGpu = (g) => (isGpuHot(g.name) ? maxGpuPerf : 0) + g.performance_index;
    const heroGpu = [...gpus].map(g => ({ name: g.name, score: scoreGpu(g) })).sort((a,b) => b.score - a.score)[0]?.name || fallbackGpu;

    return (
        <div className="guru-page-container" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                {/* JEDINÁ INSTANCE KLIENTSKÉ KOMPONENTY */}
                <BottleneckClient gpus={gpus} cpus={cpus} games={gamesData} isEn={isEn} />

                {/* SPODNÍ HEUREKA/AMAZON BUTTONS - Hero HW synchronizován s RTX 50 */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0 40px 0' }}>
                    <HeurekaButtons isEn={isEn} manualSearch={heroGpu} />
                </div>
            </div>
            
            {/* STICKY BOTTOM AD */}
            <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10,11,13,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>
        </div>
    );
}
