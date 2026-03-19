import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const cleanSlug = slug.replace(/-/g, ' ').toUpperCase();
    
    return {
        title: `Bottleneck: ${cleanSlug} | The Hardware Guru`,
        description: `Detailní analýza úzkého hrdla. Zjisti, jestli tento procesor brzdí grafiku v ${cleanSlug}. Včetně 1% Lows a latence.`,
        alternates: {
            canonical: `${baseUrl}/bottleneck-kalkulacka/${slug}`
        }
    };
}

export default async function BottleneckResultPage({ params, searchParams }) {
    const { cpuId, gpuId } = await searchParams;
    const { slug } = await params;

    if (!cpuId || !gpuId || !slug) return notFound();

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    );

    const [gpusRes, cpusRes, gamesRes] = await Promise.all([
        supabase.from('gpus').select('id, name, vendor, performance_index, vram_gb').order('performance_index', { ascending: false }),
        supabase.from('cpus').select('id, name, vendor, performance_index').order('performance_index', { ascending: false }),
        supabase.from('games').select('id, name, slug').order('name', { ascending: true })
    ]);

    const gpus = gpusRes.data || [];
    const cpus = cpusRes.data || [];
    
    const games = gamesRes.data?.length > 0 ? gamesRes.data : [
        { id: 1, name: 'Cyberpunk 2077', slug: 'cyberpunk-2077' },
        { id: 2, name: 'Counter-Strike 2', slug: 'cs2' },
        { id: 3, name: 'Alan Wake 2', slug: 'alan-wake-2' },
        { id: 4, name: 'Valorant', slug: 'valorant' },
        { id: 5, name: 'Obecná / Průměrná hra', slug: 'generic' }
    ];

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
                    gpus={gpus} 
                    cpus={cpus} 
                    games={games} 
                    isEn={false} 
                    initialCpuId={cpuId}
                    initialGpuId={gpuId}
                    initialGameSlug={selectedGameSlug}
                    initialResolution={resolutionStr}
                />
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": `Bottleneck Result: ${slug.replace(/-/g, ' ')}`,
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "All",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CZK" },
                        "description": `Simulace bottlenecku pro ${slug.replace(/-/g, ' ')} v profesionálním GURU Enginu.`
                    })
                }}
            />
        </div>
    );
}
