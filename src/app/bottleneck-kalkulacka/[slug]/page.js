import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU BOTTLENECK CALCULATOR RESULT - V1.2 (SEZNAM ADS INTEGRATION)
 * 🚀 CÍL: Monetizace výsledků kalkulačky skrze Seznam Partner.
 */

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const p = await params;
    const cleanSlug = (p.slug || '').replace(/-/g, ' ').toUpperCase();
    return { title: `Bottleneck: ${cleanSlug} | The Hardware Guru` };
}

export default async function BottleneckResultPage({ params, searchParams }) {
    const p = await params;
    const s = await searchParams;
    
    if (!s.cpuId || !s.gpuId || !p.slug) return notFound();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const resolutionStr = p.slug.includes('2160p') ? '2160p' : p.slug.includes('1440p') ? '1440p' : '1080p';
    let selectedGameSlug = 'generic';
    if (p.slug.includes('cyberpunk')) selectedGameSlug = 'cyberpunk-2077';
    else if (p.slug.includes('cs2')) selectedGameSlug = 'cs2';
    else if (p.slug.includes('alan-wake')) selectedGameSlug = 'alan-wake-2';
    else if (p.slug.includes('valorant')) selectedGameSlug = 'valorant';

    return (
        <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* 🔥 SEZNAM AD #1: TOP PLACEMENT (NAD KALKULAČKOU) */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={gamesRes.data || []} 
                    initialCpuId={s.cpuId}
                    initialGpuId={s.gpuId}
                    initialGameSlug={selectedGameSlug}
                    initialResolution={resolutionStr}
                />

                {/* 🔥 SEZNAM AD #2: BOTTOM PLACEMENT (POD KALKULAČKOU) */}
                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

            </div>
        </div>
    );
}
