import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const cleanSlug = slug.replace(/-/g, ' ').toUpperCase();
    
    return {
        title: `Bottleneck: ${cleanSlug} | The Hardware Guru`,
        description: `Detailní analýza úzkého hrdla pro sestavu ${cleanSlug}.`,
    };
}

export default async function BottleneckResultPage({ params, searchParams }) {
    // FIX: Next.js 14/15 vyžaduje await pro params a searchParams
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    
    const { cpuId, gpuId } = resolvedSearchParams;
    const { slug } = resolvedParams;

    if (!cpuId || !gpuId || !slug) return notFound();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Konfigurace DB nenalezena.</div>;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, vendor, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, vendor, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const resolutionStr = slug.includes('2160p') ? '2160p' : slug.includes('1440p') ? '1440p' : '1080p';
    let selectedGameSlug = 'generic';
    if (slug.includes('cyberpunk')) selectedGameSlug = 'cyberpunk-2077';
    else if (slug.includes('cs2')) selectedGameSlug = 'cs2';
    else if (slug.includes('alan-wake')) selectedGameSlug = 'alan-wake-2';
    else if (slug.includes('valorant')) selectedGameSlug = 'valorant';

    return (
        <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={gamesRes.data || []} 
                    isEn={false} 
                    initialCpuId={cpuId}
                    initialGpuId={gpuId}
                    initialGameSlug={selectedGameSlug}
                    initialResolution={resolutionStr}
                />
            </div>
        </div>
    );
}
