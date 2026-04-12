'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound, usePathname } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd';
import { ShoppingCart, Monitor, Cpu, Activity, Gamepad2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BottleneckResultPage({ params, searchParams }) {
    const p = use(params); // 🔥 FIX: Next.js 15 async params
    const s = use(searchParams);
    const pathname = usePathname() || '';
    
    const [data, setData] = useState({ gpus: [], cpus: [], games: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            const [g, c, gm] = await Promise.all([
                supabase.from('gpus').select('*').order('performance_index', { ascending: false }),
                supabase.from('cpus').select('*').order('performance_index', { ascending: false }),
                supabase.from('games').select('*').order('name', { ascending: true })
            ]);
            setData({ gpus: g.data || [], cpus: c.data || [], games: gm.data || [] });
            setLoading(false);
        };
        fetchAll();
    }, []);

    if (loading) return null;
    if (!s.cpuId || !s.gpuId || !p.slug) return notFound();

    const gpu = data.gpus.find(g => String(g.id) === String(s.gpuId));
    const cpu = data.cpus.find(c => String(c.id) === String(s.cpuId));

    const handleHeurekaAction = (e, name) => {
        e.preventDefault();
        const cleanName = name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '+');
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${cleanName}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-res`;
        if (navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify({ platform: 'heureka', category: 'bn_res', page: pathname })], { type: 'text/plain' }));
        }
        setTimeout(() => { window.location.href = targetUrl; }, 150);
    };

    return (
        <div className="guru-page-wrapper" style={{ backgroundColor: '#0a0b0d', paddingTop: '100px', color: '#fff' }}>
            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <SeznamAd zoneId={408654} width={970} height={210} />
                
                <BottleneckClient 
                    gpus={data.gpus} cpus={data.cpus} games={data.games} 
                    isEn={p.slug.startsWith('en-')} initialCpuId={s.cpuId} initialGpuId={s.gpuId}
                />

                <div className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '50px' }}>
                    <div className="affiliate-col" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                        <div style={{ color: '#a855f7', fontWeight: 900, fontSize: '12px', marginBottom: '10px' }}>UPGRADE GRAFIKY</div>
                        <div style={{ fontWeight: 950, fontSize: '18px', marginBottom: '20px' }}>{gpu?.name}</div>
                        <button onClick={(e) => handleHeurekaAction(e, gpu?.name)} style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', width: '100%', border: 'none', fontWeight: 950, cursor: 'pointer' }}>ZJISTIT CENU</button>
                    </div>
                    <div className="affiliate-col" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                        <div style={{ color: '#a855f7', fontWeight: 900, fontSize: '12px', marginBottom: '10px' }}>UPGRADE PROCESORU</div>
                        <div style={{ fontWeight: 950, fontSize: '18px', marginBottom: '20px' }}>{cpu?.name}</div>
                        <button onClick={(e) => handleHeurekaAction(e, cpu?.name)} style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', width: '100%', border: 'none', fontWeight: 950, cursor: 'pointer' }}>ZJISTIT CENU</button>
                    </div>
                </div>

                {/* 🔥 GURU TOOLS - CHYBĚJÍCÍ TLAČÍTKA 🔥 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
                    <a href="/fps-kalkulacka" style={{ background: '#000', border: '1px solid #06b6d4', padding: '20px', borderRadius: '15px', textDecoration: 'none', textAlign: 'center', color: '#fff', fontWeight: 950 }}>FPS KALKULAČKA</a>
                    <a href="/bottleneck-kalkulacka" style={{ background: '#fff', border: '1px solid #a855f7', padding: '20px', borderRadius: '15px', textDecoration: 'none', textAlign: 'center', color: '#000', fontWeight: 950 }}>BOTTLENECK TEST</a>
                </div>
            </div>
        </div>
    );
}
