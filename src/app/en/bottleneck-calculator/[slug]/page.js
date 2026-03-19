import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BottleneckClient from '../../../bottleneck-kalkulacka/BottleneckClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const p = await params;
    const cleanSlug = (p.slug || '').replace(/-/g, ' ').toUpperCase();
    return { title: `Bottleneck Analysis: ${cleanSlug} | The Hardware Guru` };
}

export default async function EnBottleneckResultPage({ params, searchParams }) {
    const p = await params;
    const s = await searchParams;
    if (!s.cpuId || !s.gpuId || !p.slug) return notFound();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    const supabase = createClient(url, key);
    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const resStr = p.slug.includes('2160p') ? '2160p' : p.slug.includes('1440p') ? '1440p' : '1080p';
    let gSlug = 'generic';
    if (p.slug.includes('cyberpunk')) gSlug = 'cyberpunk-2077';
    else if (p.slug.includes('cs2')) gSlug = 'cs2';
    else if (p.slug.includes('alan-wake')) gSlug = 'alan-wake-2';
    else if (p.slug.includes('valorant')) gSlug = 'valorant';

    return (
        <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={gamesRes.data || []} 
                    isEn={true} 
                    initialCpuId={s.cpuId}
                    initialGpuId={s.gpuId}
                    initialGameSlug={gSlug}
                    initialResolution={resStr}
                />
            </div>
        </div>
    );
}
