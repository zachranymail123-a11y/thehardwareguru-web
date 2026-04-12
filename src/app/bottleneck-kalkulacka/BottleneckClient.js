'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound, usePathname } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd'; // 🔥 FIX: Opravená cesta (3 úrovně zpět)
import HeurekaButtons from '../../../components/HeurekaButtons'; // 🔥 FIX: Opravená cesta
import ShareResultButton from '../../../components/ShareResultButton'; // 🔥 FIX: Opravená cesta
import { ShoppingCart, Monitor, Cpu, Activity, Gamepad2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BottleneckResultPage({ params, searchParams }) {
    // Next.js 14/15 async params handling
    const p = use(params);
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

    // 🔥 V10 HARD-LOCK REDIRECT 🔥
    const handleHeurekaAction = (e, name, cat) => {
        e.preventDefault();
        const cleanName = name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '+');
        const subId = `v10-bn-res-${cat}`;
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${cleanName}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: `bn_res_${cat}`, sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
    };

    return (
        <div className="guru-page-wrapper" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff' }}>
            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>
                
                <BottleneckClient 
                    gpus={data.gpus} cpus={data.cpus} games={data.games} 
                    isEn={p.slug.startsWith('en-')} initialCpuId={s.cpuId} initialGpuId={s.gpuId}
                />

                <div className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '50px' }}>
                    <div className="affiliate-col" style={{ background: 'rgba(255,255,255,0.02)', padding: '35px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.2)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase', marginBottom: '15px' }}>
                            <Monitor size={16} style={{ display: 'inline', marginRight: '8px' }} /> UPGRADE GRAFIKY
                        </div>
                        <div style={{ fontWeight: 950, fontSize: '20px', marginBottom: '25px', color: '#fff' }}>{gpu?.name}</div>
                        <button 
                            onClick={(e) => handleHeurekaAction(e, gpu?.name, 'gpu')}
                            style={{ background: '#3b82f6', color: '#fff', padding: '18px', borderRadius: '14px', width: '100%', border: 'none', fontWeight: 950, cursor: 'pointer', fontSize: '15px', textTransform: 'uppercase' }}
                        >
                            <ShoppingCart size={18} style={{ display: 'inline', marginRight: '8px' }} /> NAJÍT CENU
                        </button>
                    </div>

                    <div className="affiliate-col" style={{ background: 'rgba(255,255,255,0.02)', padding: '35px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.2)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase', marginBottom: '15px' }}>
                            <Cpu size={16} style={{ display: 'inline', marginRight: '8px' }} /> UPGRADE PROCESORU
                        </div>
                        <div style={{ fontWeight: 950, fontSize: '20px', marginBottom: '25px', color: '#fff' }}>{cpu?.name}</div>
                        <button 
                            onClick={(e) => handleHeurekaAction(e, cpu?.name, 'cpu')}
                            style={{ background: '#3b82f6', color: '#fff', padding: '18px', borderRadius: '14px', width: '100%', border: 'none', fontWeight: 950, cursor: 'pointer', fontSize: '15px', textTransform: 'uppercase' }}
                        >
                            <ShoppingCart size={18} style={{ display: 'inline', marginRight: '8px' }} /> NAJÍT CENU
                        </button>
                    </div>
                </div>

                {/* 🔥 GURU TOOLS - TLAČÍTKA NA KALKULAČKY 🔥 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
                    <a href="/fps-kalkulacka" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid #06b6d4', padding: '20px', borderRadius: '15px', textDecoration: 'none', textAlign: 'center', color: '#fff', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Gamepad2 size={24} color="#06b6d4" /> FPS KALKULAČKA
                    </a>
                    <a href="/bottleneck-kalkulacka" style={{ background: '#fff', border: '1px solid #a855f7', padding: '20px', borderRadius: '15px', textDecoration: 'none', textAlign: 'center', color: '#000', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Activity size={24} color="#a855f7" /> BOTTLENECK TEST
                    </a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                    <HeurekaButtons isEn={p.slug.startsWith('en-')} />
                </div>
            </div>

            <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10,11,13,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>
        </div>
    );
}
