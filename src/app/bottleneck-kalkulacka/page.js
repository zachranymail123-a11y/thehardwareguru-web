import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';
import SeznamAd from '../../components/SeznamAd';

/**
 * GURU BOTTLENECK CALCULATOR - HUB V1.2 (SEZNAM ADS INTEGRATION)
 * 🚀 CÍL: Monetizace hlavního hubu kalkulačky skrze Seznam Partner.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'PC Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější AI simulátor bottlenecku. Zjisti, jestli tvůj procesor brzdí grafiku.',
};

export default async function BottleneckPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Chyba konfigurace (Missing ENV).</div>;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, vendor, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, vendor, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    return (
        <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* 🔥 SEZNAM AD #1: TOP PLACEMENT (OPRAVENO PRO MOBILY) */}
                <div style={{ marginBottom: '40px' }}>
                    <div className="ad-desktop-wrapper">
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>
                    <div className="ad-mobile-wrapper" style={{ margin: '0 -20px' }}>
                        <SeznamAd zoneId={408651} width={300} height={250} />
                    </div>
                </div>

                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={gamesRes.data || []} 
                />

                {/* 🔥 SEZNAM AD #2: BOTTOM PLACEMENT (300x250 JE OK) */}
                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

            </div>
        </div>
    );
}
