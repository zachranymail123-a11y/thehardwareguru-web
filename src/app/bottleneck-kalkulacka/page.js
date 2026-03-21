import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BottleneckClient from './BottleneckClient';

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
                
                {/* 🔥 ADS SLOT #1: TOP PLACEMENT (POD TITULKEM) */}
                <div className="guru-hub-ad-slot">
                    <span className="ad-label">Advertisement</span>
                    <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                    <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                </div>

                <BottleneckClient 
                    gpus={gpusRes.data || []} 
                    cpus={cpusRes.data || []} 
                    games={gamesRes.data || []} 
                />

                {/* 🔥 ADS SLOT #2: BOTTOM PLACEMENT (POD NÁSTROJEM) */}
                <div className="guru-hub-ad-slot" style={{ marginTop: '50px' }}>
                    <span className="ad-label">Sponsored Hardware Setup</span>
                    <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                    <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-hub-ad-slot { 
                    margin-bottom: 40px; 
                    padding: 15px; 
                    background: rgba(255, 255, 255, 0.02); 
                    border: 1px solid rgba(255, 255, 255, 0.05); 
                    border-radius: 20px; 
                    text-align: center; 
                }
                .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
                .ad-desktop { display: block; } .ad-mobile { display: none; }
                
                @media (max-width: 768px) {
                    .ad-desktop { display: none; } .ad-mobile { display: block; }
                }
            `}} />
        </div>
    );
}
