import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';

export const revalidate = 3600; // Cache na 1 hodinu pro super rychlý load

// SEO Metadata (Google Golden Rich Rule)
export const metadata = {
    title: 'Bottleneck Kalkulačka 2026 | The Hardware Guru',
    description: 'Nejpřesnější AI bottleneck simulátor. Zjisti, jestli tvůj procesor brzdí grafickou kartu ve hrách jako CS2, Cyberpunk 2077 a dalších. Včetně 1% Lows a latence.',
    alternates: {
        canonical: 'https://thehardwareguru.cz/bottleneck-kalkulacka',
        languages: {
            'cs-CZ': 'https://thehardwareguru.cz/bottleneck-kalkulacka',
            'en-US': 'https://thehardwareguru.cz/en/bottleneck-calculator',
        },
    },
    openGraph: {
        title: 'Bottleneck Kalkulačka 2026 | Změř si výkon PC',
        description: 'Odhal úzké hrdlo svého PC. Brzdí tě procesor nebo grafika?',
        url: 'https://thehardwareguru.cz/bottleneck-kalkulacka',
        siteName: 'The Hardware Guru',
        images: [
            {
                url: 'https://thehardwareguru.cz/og-bottleneck.png', // Připrav si nějaký cool obrázek
                width: 1200,
                height: 630,
            },
        ],
        type: 'website',
    },
};

export default async function BottleneckPage() {
    // SERVER Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Tady stačí ANON key pro čtení listů
    );

    // Paralelní fetch dat pro maximální rychlost
    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, vendor, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, vendor, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const gpus = gpusRes.data || [];
    const cpus = cpusRes.data || [];
    
    // Fallback hry, pokud v DB zatím nemáš tabulku 'games' čistě pro bottleneck
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
                    gpus={gpus} 
                    cpus={cpus} 
                    games={games} 
                    isEn={false} 
                />
            </div>

            {/* Google Golden Rich Snippets pro celou aplikaci */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Guru Bottleneck Calculator",
                        "url": "https://thehardwareguru.cz/bottleneck-kalkulacka",
                        "description": "Profesionální simulátor úzkého hrdla PC (Bottleneck). Vypočítá CPU a GPU limity, 1% Low FPS a frame time latenci v reálném čase.",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "All",
                        "author": {
                            "@type": "Organization",
                            "name": "The Hardware Guru",
                            "url": "https://thehardwareguru.cz"
                        }
                    })
                }}
            />
        </div>
    );
}
