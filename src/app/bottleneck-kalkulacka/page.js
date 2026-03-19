import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';

// FIX: Vynucení dynamického renderingu, aby se předešlo chybám v cache/SSR
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'PC Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější AI simulátor bottlenecku. Zjisti, jestli tvůj procesor brzdí grafiku v CS2, Cyberpunk 2077 a dalších hrách.',
};

export default async function BottleneckPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // FIX podle ChatGPT: Pokud chybí ENV, vyhodíme chybu dřív, než to shodí celou aplikaci
    if (!supabaseUrl || !supabaseKey) {
        console.error("KRITICKÁ CHYBA: Chybí Supabase Environment Variables!");
        return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Chyba konfigurace databáze.</div>;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, vendor, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, vendor, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const games = gamesRes.data?.length > 0 ? gamesRes.data : [
        { id: 1, name: 'Cyberpunk 2077', slug: 'cyberpunk-2077' },
        { id: 2, name: 'Counter-Strike 2', slug: 'cs2' },
        { id: 3, name: 'Alan Wake 2', slug: 'alan-wake-2' },
        { id: 4, name: 'Valorant', slug: 'valorant' },
        { id: 5, name: 'Obecná / Průměrná hra', slug: 'generic' }
    ];

    return (
        <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={games} 
                    isEn={false} 
                />
            </div>
        </div>
    );
}
