'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
 Zap, Cpu, Monitor, ShieldCheck, ShoppingCart, Info, ArrowRight, Settings2, Play, CheckCircle2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../components/SeznamAd';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function PsuClient({ cpus = [], gpus = [], isEn = false }) {
    const pathname = usePathname() || '';
    const [selectedCpu, setSelectedCpu] = useState('');
    const [selectedGpu, setSelectedGpu] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    const getPsuRecommendation = (totalTdp) => {
        // Přidáme 100W pro desku, disky, větráky a rezervu a dalších 25% na rezervu/účinnost
        const targetWattage = (totalTdp + 100) * 1.25; 
        
        if (targetWattage <= 550) return { watts: 550, name: "Seasonic B12 BC-550", tier: "80 PLUS Bronze" };
        if (targetWattage <= 650) return { watts: 650, name: "Seasonic Focus GX-650", tier: "80 PLUS Gold" };
        if (targetWattage <= 750) return { watts: 750, name: "Corsair RM750e", tier: "80 PLUS Gold ATX 3.0" };
        if (targetWattage <= 850) return { watts: 850, name: "Corsair RM850x", tier: "80 PLUS Gold ATX 3.0" };
        if (targetWattage <= 1000) return { watts: 1000, name: "be quiet! Pure Power 12 M 1000W", tier: "80 PLUS Gold ATX 3.0" };
        return { watts: 1200, name: "Seasonic Vertex GX-1200", tier: "80 PLUS Gold ATX 3.0" };
    };

    const handleCalculate = () => {
        setIsCalculating(true);
        setTimeout(() => {
            const cpuObj = cpus.find(c => c.id.toString() === selectedCpu);
            const gpuObj = gpus.find(g => g.id.toString() === selectedGpu);
            
            if (cpuObj && gpuObj) {
                const cpuTdp = Number(cpuObj.tdp_w) || 65;
                const gpuTdp = Number(gpuObj.tdp_w) || 200;
                const totalTdp = cpuTdp + gpuTdp;
                const rec = getPsuRecommendation(totalTdp);
                
                setResult({
                    cpuTdp,
                    gpuTdp,
                    baseSystem: 100,
                    totalLoad: totalTdp + 100,
                    recommendation: rec
                });
            }
            setIsCalculating(false);
        }, 600);
    };

    const handleAffiliateClick = (e, productName) => {
        e.preventDefault();
        const cleanName = productName.replace(/\s+/g, '+');
        const subId = `v10-psu-calc`;
        
        const platform = isEn ? 'amazon' : 'heureka';
        const targetUrl = isEn 
            ? `https://www.amazon.com/s?k=${cleanName}&tag=thehardware07-20&ascsubtag=${subId}`
            : `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${cleanName}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}&o=3`;
        
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform, category: 'psu_recommendation', sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
        setTimeout(() => { window.location.href = targetUrl; }, 150);
    };

    return (
        <div className="guru-psu-wrapper" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '120px', paddingBottom: '120px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                
                <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '50px', background: 'rgba(250, 204, 21, 0.05)', marginBottom: '20px' }}>
                        <Zap size={16} /> {isEn ? 'POWER SUPPLY CALCULATOR' : 'KALKULAČKA ZDROJE'}
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        {isEn ? 'PSU' : 'PSU'} <span style={{ color: '#facc15', textShadow: '0 0 30px rgba(250, 204, 21, 0.4)' }}>{isEn ? 'CALCULATOR' : 'KALKULAČKA'}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginTop: '15px' }}>
                        {isEn ? 'Find out exactly how many watts you need for your PC.' : 'Zjisti, jak silný napájecí zdroj potřebuješ pro svou sestavu.'}
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                    {/* INPÚTY */}
                    <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #facc15', paddingLeft: '15px' }}>
                            <Settings2 size={20} color="#facc15" /> {isEn ? 'System config' : 'Tvoje sestava'}
                        </h3>
                        
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', marginBottom: '10px' }}><Cpu size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {isEn ? 'Processor' : 'Procesor'}</label>
                            <select value={selectedCpu} onChange={(e) => setSelectedCpu(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #333', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', outline: 'none' }}>
                                <option value="">{isEn ? '-- Select CPU --' : '-- Vyber procesor --'}</option>
                                {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', marginBottom: '10px' }}><Monitor size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {isEn ? 'Graphics Card' : 'Grafická karta'}</label>
                            <select value={selectedGpu} onChange={(e) => setSelectedGpu(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #333', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', outline: 'none' }}>
                                <option value="">{isEn ? '-- Select GPU --' : '-- Vyber grafiku --'}</option>
                                {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>

                        <button 
                            onClick={handleCalculate} 
                            disabled={!selectedCpu || !selectedGpu || isCalculating}
                            style={{ width: '100%', background: '#facc15', color: '#000', border: 'none', padding: '18px', borderRadius: '14px', fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', cursor: (!selectedCpu || !selectedGpu || isCalculating) ? 'not-allowed' : 'pointer', opacity: (!selectedCpu || !selectedGpu) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' }}
                        >
                            {isCalculating ? '...' : <><Play size={18} /> {isEn ? 'Calculate PSU' : 'Spočítat zdroj'}</>}
                        </button>
                    </div>

                    {/* VÝSLEDEK & UP-SELL */}
                    <div style={{ background: result ? 'linear-gradient(145deg, rgba(250, 204, 21, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)' : 'rgba(15, 17, 21, 0.95)', border: result ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: '0.5s' }}>
                        {!result ? (
                            <div style={{ textAlign: 'center', color: '#4b5563' }}>
                                <Zap size={64} style={{ opacity: 0.2, margin: '0 auto 20px' }} />
                                <p style={{ fontWeight: 'bold' }}>{isEn ? 'Select your hardware to see the recommended power supply.' : 'Vyber hardware a zjisti doporučený výkon zdroje.'}</p>
                            </div>
                        ) : (
                            <div className="psu-result-box" style={{ animation: 'fadeIn 0.5s ease' }}>
                                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '950', color: '#facc15', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>{isEn ? 'Recommended Power' : 'Doporučený výkon'}</div>
                                    <div style={{ fontSize: '5rem', fontWeight: '950', color: '#fff', lineHeight: '1', textShadow: '0 0 40px rgba(250, 204, 21, 0.4)' }}>
                                        {result.recommendation.watts} <span style={{ fontSize: '2rem', color: '#facc15' }}>W</span>
                                    </div>
                                    <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '10px' }}>{isEn ? `Max system load: ~${result.totalLoad}W` : `Max. zátěž sestavy: ~${result.totalLoad}W`}</div>
                                </div>

                                <div style={{ background: '#000', borderRadius: '16px', padding: '25px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#22c55e20', color: '#22c55e', padding: '4px 12px', borderRadius: '50px', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '15px' }}>
                                        <ShieldCheck size={14} /> GURU {isEn ? 'CHOICE' : 'DOPORUČENÍ'}
                                    </div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: '950', margin: '0 0 5px 0', color: '#fff' }}>{result.recommendation.name}</h4>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>{result.recommendation.tier}</div>
                                    
                                    <a 
                                        href="#"
                                        onClick={(e) => handleAffiliateClick(e, result.recommendation.name)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: isEn ? '#f59e0b' : '#3b82f6', color: isEn ? '#000' : '#fff', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', fontSize: '14px', transition: 'transform 0.2s ease' }}
                                    >
                                        <ShoppingCart size={18} /> {isEn ? 'Check price on Amazon' : 'Koupit na Heureka.cz'}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
