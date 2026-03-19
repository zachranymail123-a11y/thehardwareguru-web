import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from '../../bottleneck-kalkulacka/BottleneckClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'PC Bottleneck Calculator 2026 | The Hardware Guru',
    description: 'The most accurate AI-driven bottleneck simulator. Find out if your CPU is throttling your GPU.',
};

export default async function EnBottleneckPage() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    const supabase = createClient(url, key);
    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, vendor, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, vendor, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    return (
        <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={gamesRes.data || []} 
                    isEn={true} 
                />
            </div>
        </div>
    );
}
