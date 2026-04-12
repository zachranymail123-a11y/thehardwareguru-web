'use client';

import React, { useEffect, useMemo, useState, use } from 'react'; // 🔥 FIX: Přidán use
import { createClient } from '@supabase/supabase-js';
import { notFound, usePathname } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';
import { ShoppingCart, Monitor, Cpu, ShieldCheck, Zap, Award } from 'lucide-react';

const normalizeQuery = (str = '') => { try { return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { return str; } };
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim();
const encodeHeureka = (name = '') => normalizeQuery(name).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).join('+');

export default function BottleneckResultPage({ params, searchParams }) {
    // 🔥 FIX: Rozbalení asynchronních params pro Next.js 15
    const p = use(params);
    const s = use(searchParams);
    const pathname = usePathname() || '';
    
    if (!s.cpuId || !s.gpuId || !p.slug) return notFound();

    const isEn = p.slug.startsWith('en-');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = useMemo(() => createClient(supabaseUrl, supabaseKey), [supabaseUrl, supabaseKey]);
    const [data, setData] = useState({ gpus: [], cpus: [], games: [] });

    useEffect(() => {
        const fetchAll = async () => {
            const [gRes, cRes, gmRes] = await Promise.all([
                supabase.from('gpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
                supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
                supabase.from('games').select('id, name, slug').order('name', { ascending: true })
            ]);
            setData({ gpus: gRes.data || [], cpus: cRes.data || [], games: gmRes.data || [] });
        };
        fetchAll();
    }, [supabase]); 

    const resolutionStr = p.slug.includes('2160p') ? '2160p' : p.slug.includes('1440p') ? '1440p' : '1080p';
    const selectedGpu = data.gpus.find(g => String(g.id) === String(s.gpuId));
    const selectedCpu = data.cpus.find(c => String(c.id) === String(s.cpuId));
    const gpuPerf = selectedGpu?.performance_index || 100;
    const cpuPerf = selectedCpu?.performance_index || 100;
    const isGpuWinner = (gpuPerf * (resolutionStr === '2160p' ? 1.4 : 1.2)) / (cpuPerf || 1) < 0.85;
    const gpuName = (data.gpus.find(item => item.performance_index > gpuPerf * 1.25) || data.gpus[0])?.name || 'RTX 5070';
    const cpuName = (data.cpus.find(item => item.performance_index > cpuPerf * 1.25) || data.cpus[0])?.name || 'Ryzen 7 9800X3D';

    const handleHeurekaAction = (e, name, cat) => {
        e.preventDefault();
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeHeureka(name)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-bn-res`;
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: `bn_res_${cat}`, sub_id: 'v10-res', page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
        setTimeout(() => { window.location.href = targetUrl; }, 150);
    };

    return (
        <div className="guru-page-wrapper" style={{ backgroundColor: '#0a0b0d', paddingTop: '100px', paddingBottom: '160px', color: '#fff' }}>
            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <BottleneckClient gpus={data.gpus} cpus={data.cpus} games={data.games} isEn={isEn} initialCpuId={s.cpuId} initialGpuId={s.gpuId} />
                <div className="affiliate-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '60px' }}>
                    <div className="affiliate-col" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                        <div style={{ color: '#a855f7', fontWeight: 900, marginBottom: '15px' }}>UPGRADE GRAFIKY</div>
                        <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '20px' }}>{gpuName}</div>
                        <a href="#" onClick={(e) => handleHeurekaAction(e, gpuName, 'gpu')} style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', display: 'block', textDecoration: 'none', fontWeight: 900 }}>NAJÍT NEJLEVNĚJŠÍ CENU</a>
                    </div>
                    <div className="affiliate-col" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                        <div style={{ color: '#a855f7', fontWeight: 900, marginBottom: '15px' }}>UPGRADE PROCESORU</div>
                        <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '20px' }}>{cpuName}</div>
                        <a href="#" onClick={(e) => handleHeurekaAction(e, cpuName, 'cpu')} style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', display: 'block', textDecoration: 'none', fontWeight: 900 }}>NAJÍT NEJLEVNĚJŠÍ CENU</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
