'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Trophy, Play, MonitorPlay, AlertTriangle, ArrowRight, Activity, Crosshair, Swords, BookOpen, ShoppingCart, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Inicializace standardního Supabase klienta přes veřejné proměnné
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function GuruBenchmarkHub({ t, locale = 'cs' }) {
    const [activeTab, setActiveTab] = useState('cpu'); // 'cpu' | 'gpu'
    const [isTesting, setIsTesting] = useState(false);
    
    // Stavy pro CPU
    const [cpuScore, setCpuScore] = useState(null);
    const [cpuTime, setCpuTime] = useState(null);
    const [cpuLeaderboard, setCpuLeaderboard] = useState([]);
    
    // Stavy pro GPU
    const [gpuScore, setGpuScore] = useState(null);
    const [gpuTime, setGpuTime] = useState(null);
    const [gpuName, setGpuName] = useState('Detekuji...');
    const [gpuLeaderboard, setGpuLeaderboard] = useState([]);
    
    const canvasRef = useRef(null);

    useEffect(() => {
        fetchLeaderboards();
        detectGPU();
    }, []);

    const fetchLeaderboards = async () => {
        const { data: cpuData } = await supabase.from('user_benchmarks').select('*').order('score', { ascending: false }).limit(5);
        if (cpuData) setCpuLeaderboard(cpuData);
        
        const { data: gpuData } = await supabase.from('gpu_benchmarks').select('*').order('score', { ascending: false }).limit(5);
        if (gpuData) setGpuLeaderboard(gpuData);
    };

    const detectGPU = () => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Neznámé GPU';
                setGpuName(renderer);
            } else {
                setGpuName('WebGL nepodporováno');
            }
        } catch (e) {
            setGpuName('Neznámé GPU');
        }
    };

    const runCpuBenchmark = () => {
        setIsTesting(true);
        setCpuScore(null);
        
        setTimeout(async () => {
            const start = performance.now();
            let primeCount = 0;
            const limit = 300000; 
            for (let i = 2; i <= limit; i++) {
                let isPrime = true;
                for (let j = 2; j <= Math.sqrt(i); j++) {
                    if (i % j === 0) { isPrime = false; break; }
                }
                if (isPrime) primeCount++;
            }
            const end = performance.now();
            const timeTaken = Math.round(end - start);
            const calcScore = Math.round(10000000 / timeTaken);
            
            setCpuScore(calcScore);
            setCpuTime(timeTaken);
            setIsTesting(false);

            await supabase.from('user_benchmarks').insert([{
                score: calcScore, time_taken_ms: timeTaken, cpu_cores: navigator.hardwareConcurrency || null,
                browser: navigator.userAgent.substring(0, 50), os: navigator.platform || 'Unknown'
            }]);
            fetchLeaderboards(); 
        }, 100);
    };

    const runGpuBenchmark = () => {
        setIsTesting(true);
        setGpuScore(null);

        setTimeout(async () => {
            const canvas = canvasRef.current;
            const gl = canvas.getContext('webgl');
            if (!gl) {
                alert(t.noWebgl);
                setIsTesting(false);
                return;
            }

            const vsSource = `attribute vec4 aVertexPosition; void main() { gl_Position = aVertexPosition; }`;
            const fsSource = `
                precision highp float;
                uniform vec2 u_resolution;
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution;
                    vec2 c = uv * 4.0 - vec2(2.0);
                    vec2 z = vec2(0.0);
                    int iters = 0;
                    for(int i = 0; i < 3000; i++) {
                        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
                        if(length(z) > 4.0) break;
                        iters++;
                    }
                    gl_FragColor = vec4(float(iters)/3000.0, 0.0, 0.0, 1.0);
                }
            `;

            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vsSource); gl.compileShader(vertexShader);
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fsSource); gl.compileShader(fragmentShader);

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader);
            gl.linkProgram(program); gl.useProgram(program);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
            
            const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
            gl.enableVertexAttribArray(positionLocation); gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

            const passes = 30; 
            const pixels = new Uint8Array(4); 
            const start = performance.now();

            for (let i = 0; i < passes; i++) {
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels); 
            }

            const end = performance.now();
            const timeTaken = Math.round(end - start);
            const calcScore = Math.round(50000000 / timeTaken);

            setGpuScore(calcScore);
            setGpuTime(timeTaken);
            setIsTesting(false);

            await supabase.from('gpu_benchmarks').insert([{
                score: calcScore, time_taken_ms: timeTaken, gpu_name: gpuName.substring(0, 100),
                browser: navigator.userAgent.substring(0, 50), os: navigator.platform || 'Unknown'
            }]);
            fetchLeaderboards();
        }, 150);
    };

    // INTELIGENTNÍ SYSTÉM UPGRADŮ
    const getUpgradeLinks = (type) => {
        const query = type === 'CPU' ? 'procesor' : 'grafická karta';
        const queryEn = type === 'CPU' ? 'gaming CPU' : 'gaming GPU';
        
        if (locale === 'cs') {
            return (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px' }}>
                    <a href={`https://www.heureka.cz/?h[fraze]=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f97316', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }} className="hover:scale-105 transition-transform">
                        <Search size={16} /> Heureka.cz
                    </a>
                    <a href={`https://www.smarty.cz/hledani?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }} className="hover:scale-105 transition-transform">
                        <ShoppingCart size={16} /> Smarty.cz
                    </a>
                </div>
            );
        } else {
            return (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px' }}>
                    <a href={`https://www.amazon.com/s?k=${encodeURIComponent(queryEn)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f59e0b', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }} className="hover:scale-105 transition-transform">
                        <ShoppingCart size={16} /> Amazon
                    </a>
                </div>
            );
        }
    };

    const prefix = locale === 'en' ? '/en' : '';
    const crossLinks = [
        { href: `${prefix}/bottleneck-calculator`, label: t.linkBottleneck, icon: <Activity size={18} /> },
        { href: `${prefix}/fps-kalkulacka`, label: t.linkFps, icon: <Crosshair size={18} /> },
        { href: `${prefix}/cpu-index`, label: t.linkCpuDuels, icon: <Swords size={18} /> },
        { href: `${prefix}/gpu-index`, label: t.linkGpuDuels, icon: <Zap size={18} /> },
        { href: `${prefix}/clanky`, label: t.linkArticles, icon: <BookOpen size={18} /> }
    ];

    return (
        <div style={{ background: '#0a0b0d', color: '#fff', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <canvas ref={canvasRef} width="1024" height="1024" style={{ display: 'none' }}></canvas>

                {/* Hlavička */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.05)', marginBottom: '20px' }}>
                        <Activity size={16} /> GURU BENCHMARK HUB
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0', lineHeight: '1.1' }}>
                        {t.title}
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
                        {t.description}
                    </p>
                </div>

                {/* GURU Taby */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('cpu')} style={{ padding: '12px 30px', borderRadius: '12px', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', transition: '0.3s', background: activeTab === 'cpu' ? '#ff0055' : 'rgba(255,255,255,0.05)', color: '#fff' }}>
                        <Cpu size={20} /> CPU TEST
                    </button>
                    <button onClick={() => setActiveTab('gpu')} style={{ padding: '12px 30px', borderRadius: '12px', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', transition: '0.3s', background: activeTab === 'gpu' ? '#10b981' : 'rgba(255,255,255,0.05)', color: '#fff' }}>
                        <MonitorPlay size={20} /> GPU TEST
                    </button>
                </div>

                {/* Hlavní Benchmark Karta */}
                <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${activeTab === 'cpu' ? 'rgba(255, 0, 85, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px', boxShadow: `0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px ${activeTab === 'cpu' ? 'rgba(255, 0, 85, 0.05)' : 'rgba(16, 185, 129, 0.05)'}` }}>
                    
                    {/* CPU SEKCE */}
                    {activeTab === 'cpu' && (
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#dc2626', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '12px', marginBottom: '20px' }}><AlertTriangle size={14} /> SINGLE-CORE TEST</div>
                            
                            {isTesting ? (
                                <div style={{ padding: '40px 0' }}>
                                    <div className="guru-spinner" style={{ width: '60px', height: '60px', border: '4px solid rgba(255, 0, 85, 0.2)', borderTopColor: '#ff0055', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
                                    <h3 style={{ fontSize: '24px', fontWeight: '950', color: '#ff0055' }}>{t.testingCpu}</h3>
                                </div>
                            ) : cpuScore ? (
                                <div style={{ animation: 'fadeIn 0.5s' }}>
                                    <div style={{ fontSize: '16px', color: '#9ca3af', textTransform: 'uppercase' }}>{t.yourScore} (CPU)</div>
                                    <div style={{ fontSize: '5rem', fontWeight: '950', color: '#ff0055', textShadow: '0 0 30px rgba(255, 0, 85, 0.4)', margin: '10px 0' }}>{cpuScore.toLocaleString()}</div>
                                    <div style={{ color: '#9ca3af', marginBottom: '20px' }}>{t.time}: {cpuTime} ms</div>
                                    <button onClick={runCpuBenchmark} style={{ background: '#ff0055', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Play size={16} /> {t.testAgain}</button>
                                </div>
                            ) : (
                                <div style={{ padding: '20px 0' }}>
                                    <Cpu size={64} style={{ color: '#374151', margin: '0 auto 20px' }} />
                                    <button onClick={runCpuBenchmark} style={{ background: '#ff0055', color: '#fff', padding: '16px 32px', borderRadius: '12px', border: 'none', fontWeight: '950', fontSize: '18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }} className="hover:scale-105"><Play size={20} /> {t.startCpu}</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* GPU SEKCE */}
                    {activeTab === 'gpu' && (
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#047857', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '12px', marginBottom: '20px' }}><Zap size={14} /> WEBGL COMPUTE (V-SYNC OFF)</div>
                            <div style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: '20px' }}>GPU: {gpuName}</div>
                            
                            {isTesting ? (
                                <div style={{ padding: '40px 0' }}>
                                    <div className="guru-spinner" style={{ width: '60px', height: '60px', border: '4px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
                                    <h3 style={{ fontSize: '24px', fontWeight: '950', color: '#10b981' }}>{t.testingGpu}</h3>
                                </div>
                            ) : gpuScore ? (
                                <div style={{ animation: 'fadeIn 0.5s' }}>
                                    <div style={{ fontSize: '16px', color: '#9ca3af', textTransform: 'uppercase' }}>{t.yourScore} (GPU)</div>
                                    <div style={{ fontSize: '5rem', fontWeight: '950', color: '#10b981', textShadow: '0 0 30px rgba(16, 185, 129, 0.4)', margin: '10px 0' }}>{gpuScore.toLocaleString()}</div>
                                    <div style={{ color: '#9ca3af', marginBottom: '20px' }}>{t.time}: {gpuTime} ms</div>
                                    <button onClick={runGpuBenchmark} style={{ background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Play size={16} /> {t.testAgain}</button>
                                </div>
                            ) : (
                                <div style={{ padding: '20px 0' }}>
                                    <MonitorPlay size={64} style={{ color: '#374151', margin: '0 auto 20px' }} />
                                    <button onClick={runGpuBenchmark} style={{ background: '#10b981', color: '#fff', padding: '16px 32px', borderRadius: '12px', border: 'none', fontWeight: '950', fontSize: '18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }} className="hover:scale-105"><Play size={20} /> {t.startGpu}</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Inteligentní Upgrade Doporučení */}
                {(cpuScore || gpuScore) && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '30px', textAlign: 'center', marginBottom: '40px', animation: 'fadeIn 0.5s' }}>
                        <h3 style={{ fontSize: '22px', fontWeight: '950', color: '#fff', marginBottom: '10px' }}>{t.upgradeTitle}</h3>
                        <p style={{ color: '#9ca3af', marginBottom: '20px' }}>{t.upgradeDesc}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {cpuScore && (
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#ff0055', marginBottom: '10px' }}>{t.needCpu}</div>
                                    {getUpgradeLinks('CPU')}
                                </div>
                            )}
                            {gpuScore && (
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>{t.needGpu}</div>
                                    {getUpgradeLinks('GPU')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Leaderboards */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: '950', color: '#fff', marginBottom: '20px' }}>
                        <Trophy size={24} color="#f59e0b" /> {t.leaderboard} ({activeTab.toUpperCase()})
                    </h2>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        {(activeTab === 'cpu' ? cpuLeaderboard : gpuLeaderboard).map((row, index) => (
                            <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: index === 0 ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ color: index === 0 ? '#f59e0b' : '#6b7280', fontWeight: '950', fontSize: '18px' }}>#{index + 1}</span>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#fff' }}>{activeTab === 'gpu' ? row.gpu_name?.split(',')[1] || row.gpu_name : `${row.os} PC`}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.time_taken_ms} ms</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: '950', color: activeTab === 'cpu' ? '#ff0055' : '#10b981', fontSize: '20px' }}>
                                    {row.score.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Komplexní GURU Rozcestník */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '950', color: '#fff', marginBottom: '20px', textAlign: 'center', textTransform: 'uppercase' }}>
                        {t.exploreMore}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        {crossLinks.map((link, idx) => (
                            <Link key={idx} href={link.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', transition: '0.2s' }} className="hover:bg-white/10 hover:border-purple-500">
                                {link.icon} {link.label} <ArrowRight size={14} style={{ marginLeft: '5px', color: '#9ca3af' }} />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
