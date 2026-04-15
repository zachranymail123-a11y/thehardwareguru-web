'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Play, MonitorPlay, AlertTriangle, ShieldCheck, User, Activity, Crosshair, Swords, BookOpen, Layers, Gamepad2, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HeurekaButtons from './HeurekaButtons'; // Import tvé Heureka komponenty

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function GuruBenchmarkHub({ t = {}, locale = 'cs' }) {
    const router = useRouter();
    const canvasRef = useRef(null);
    
    const [gpuDetected, setGpuDetected] = useState('Detekuji...');
    const [nickname, setNickname] = useState('');
    const [cpuInput, setCpuInput] = useState('');
    const [testPhase, setTestPhase] = useState('idle');

    useEffect(() => { 
        detectGPU(); 
        
        // Sklik inicializace pro SPA (Next.js)
        try {
            if (window.szn && window.szn.ads && window.szn.ads.push) {
                // Horní banner (Homepage-Top)
                window.szn.ads.push({ id: "szn-seznam-ad-408654" });
                // Spodní banner (Clanek-InText)
                window.szn.ads.push({ id: "szn-seznam-ad-408651" });
            }
        } catch (e) {
            console.error("Sklik Ads Error:", e);
        }
    }, []);

    const detectGPU = () => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Neznámé GPU';
                setGpuDetected(renderer);
            } else {
                setGpuDetected('WebGL nepodporováno');
            }
        } catch (e) { setGpuDetected('Neznámé GPU'); }
    };

    const generateSlug = (nick, cpu, gpu) => {
        const cleanString = `${nick}-${cpu}-${gpu}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return `${cleanString}-${Math.random().toString(36).substring(2, 6)}`;
    };

    const startFullBenchmark = async (e) => {
        e.preventDefault();
        if (!nickname.trim()) { alert(locale === 'cs' ? 'Zadej svou přezdívku!' : 'Enter your nickname!'); return; }

        setTestPhase('cpu');
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const startCpu = performance.now();
        let primeCount = 0;
        for (let i = 2; i <= 300000; i++) {
            let isPrime = true;
            for (let j = 2; j <= Math.sqrt(i); j++) { if (i % j === 0) { isPrime = false; break; } }
            if (isPrime) primeCount++;
        }
        const cpuScore = Math.round(10000000 / Math.round(performance.now() - startCpu));

        setTestPhase('gpu');
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');
        let gpuScore = 0;

        if (gl) {
            const vsSource = `attribute vec4 aVertexPosition; void main() { gl_Position = aVertexPosition; }`;
            const fsSource = `precision highp float; uniform vec2 u_resolution; void main() { vec2 uv = gl_FragCoord.xy / u_resolution; vec2 c = uv * 4.0 - vec2(2.0); vec2 z = vec2(0.0); int iters = 0; for(int i = 0; i < 3000; i++) { z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c; if(length(z) > 4.0) break; iters++; } gl_FragColor = vec4(float(iters)/3000.0, 0.0, 0.0, 1.0); }`;
            const vertexShader = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vertexShader, vsSource); gl.compileShader(vertexShader);
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fragmentShader, fsSource); gl.compileShader(fragmentShader);
            const program = gl.createProgram(); gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program); gl.useProgram(program);
            const positionBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
            const positionLocation = gl.getAttribLocation(program, 'aVertexPosition'); gl.enableVertexAttribArray(positionLocation); gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            const resolutionLocation = gl.getUniformLocation(program, 'u_resolution'); gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            const pixels = new Uint8Array(4); const startGpu = performance.now();
            for (let i = 0; i < 30; i++) { gl.drawArrays(gl.TRIANGLES, 0, 6); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels); }
            gpuScore = Math.round(50000000 / Math.round(performance.now() - startGpu));
        }

        setTestPhase('saving');
        const cleanGpuNameShort = (gpuDetected.split(',')[1] ? gpuDetected.split(',')[1].trim() : gpuDetected).replace('ANGLE (', '').replace(')', '');
        const finalCpuName = cpuInput.trim() || `Unknown CPU (${navigator.hardwareConcurrency} Threads)`;
        const seoSlug = generateSlug(nickname, finalCpuName, cleanGpuNameShort);

        const { data, error } = await supabase.from('guru_benchmarks').insert([{
            nickname: nickname.trim(), cpu_name: finalCpuName, gpu_name: cleanGpuNameShort, cpu_score: cpuScore, gpu_score: gpuScore, total_score: cpuScore + gpuScore, slug: seoSlug, browser: navigator.userAgent.substring(0, 50), os: navigator.platform || 'Unknown'
        }]).select();

        if (data && data[0]) {
            router.push(`${locale === 'en' ? '/en' : ''}/benchmark/result/${data[0].slug}`);
        } else {
            alert("Došlo k chybě při ukládání. Zkus to znovu.");
            setTestPhase('idle');
        }
    };

    const prefix = locale === 'en' ? '/en' : '';
    
    // Fallback texty - kdyby selhal překlad, VŽDY SE NĚCO VYPÍŠE
    const fallbackNickLabel = locale === 'en' ? 'Enter your Nickname' : 'Zadej svůj Nick';
    const fallbackNickPlace = locale === 'en' ? 'e.g. Tapicek, Master99...' : 'Např. Tapicek, Master99...';
    const fallbackCpuLabel = locale === 'en' ? 'Exact Processor Name' : 'Přesný název tvého procesoru';
    const fallbackCpuPlace = locale === 'en' ? 'e.g. AMD Ryzen 7 7800X3D' : 'Např. AMD Ryzen 7 7800X3D';
    const fallbackCpuDesc = locale === 'en' ? 'Optional, but recommended for the leaderboard!' : 'Nepovinné, ale doporučené pro Síň slávy!';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif', padding: '40px 20px' }}>
            
            {/* HORNÍ REKLAMNÍ BANNER (Sklik - Homepage-Top) */}
            <div style={{ maxWidth: '970px', margin: '0 auto 40px', minHeight: '210px', display: 'flex', justifyContent: 'center' }}>
                <div id="szn-seznam-ad-408654"></div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <canvas ref={canvasRef} width="1024" height="1024" style={{ display: 'none' }}></canvas>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)', marginBottom: '20px', backdropFilter: 'blur(5px)' }}>
                        <ShieldCheck size={16} /> GURU ULTIMATE BENCHMARK
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0', lineHeight: '1', textShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
                        {t.title || (locale === 'en' ? 'PC Performance Test' : 'Komplexní Test Výkonu')}
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {t.description || (locale === 'en' ? 'Test your CPU and GPU power in the browser.' : 'Otestuj hrubou sílu procesoru a grafiky přímo v prohlížeči.')}
                    </p>
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.85)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(168, 85, 247, 0.05)', marginBottom: '40px', backdropFilter: 'blur(15px)' }}>
                    
                    {testPhase === 'idle' ? (
                        <form onSubmit={startFullBenchmark} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: '900' }}>
                                    <MonitorPlay size={18} style={{display:'inline', verticalAlign: 'middle', marginRight:'5px'}}/> Auto-GPU: {gpuDetected.split(',')[1] || gpuDetected}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', fontSize: '16px', letterSpacing: '1px' }}>
                                    <User size={20} color="#a855f7" /> {t.nickLabel || fallbackNickLabel} <span style={{color: '#ff0055'}}>*</span>
                                </label>
                                <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t.nickPlaceholder || fallbackNickPlace} style={{ width: '100%', padding: '20px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '18px', fontWeight: 'bold', outline: 'none', transition: 'border 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#a855f7'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', fontSize: '16px', letterSpacing: '1px' }}>
                                    <Cpu size={20} color="#ff0055" /> {t.cpuLabel || fallbackCpuLabel}
                                </label>
                                <input type="text" value={cpuInput} onChange={(e) => setCpuInput(e.target.value)} placeholder={t.cpuPlaceholder || fallbackCpuPlace} style={{ width: '100%', padding: '20px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '18px', outline: 'none', transition: 'border 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#ff0055'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '10px' }}><AlertTriangle size={14} style={{display:'inline', color: '#f59e0b'}}/> {t.cpuDesc || fallbackCpuDesc}</div>
                            </div>

                            <button type="submit" style={{ background: 'linear-gradient(90deg, #ff0055, #a855f7)', color: '#fff', padding: '25px', borderRadius: '16px', border: 'none', fontWeight: '950', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '10px', textTransform: 'uppercase', transition: '0.3s', boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)' }} className="hover:scale-105">
                                <Play size={28} fill="currentColor" /> {t.startBtn || (locale === 'en' ? 'START BENCHMARK' : 'SPUSTIT BENCHMARK')}
                            </button>
                        </form>
                    ) : (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <div className="guru-spinner" style={{ width: '100px', height: '100px', border: '6px solid rgba(255, 255, 255, 0.1)', borderTopColor: testPhase === 'cpu' ? '#ff0055' : testPhase === 'gpu' ? '#10b981' : '#a855f7', borderRadius: '50%', margin: '0 auto 40px', animation: 'spin 1s linear infinite' }}></div>
                            <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
                                {testPhase === 'cpu' && (t.testingCpu || 'TESTUJI CPU...')}
                                {testPhase === 'gpu' && (t.testingGpu || 'TESTUJI GPU...')}
                                {testPhase === 'saving' && (t.testingSaving || 'ZAPISUJI...')}
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '40px' }}>
                                <div style={{ opacity: testPhase === 'cpu' ? 1 : 0.3, color: '#ff0055', transform: testPhase === 'cpu' ? 'scale(1.2)' : 'none', transition: '0.3s' }}><Cpu size={32} /></div>
                                <div style={{ opacity: testPhase === 'gpu' ? 1 : 0.3, color: '#10b981', transform: testPhase === 'gpu' ? 'scale(1.2)' : 'none', transition: '0.3s' }}><Zap size={32} /></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* HEUREKA BUTTONS - Integrováno přímo pod kartou s testem */}
                <div style={{ maxWidth: '420px', margin: '0 auto 40px auto' }}>
                    <HeurekaButtons isEn={locale === 'en'} />
                </div>

                {/* SPODNÍ REKLAMNÍ BANNER (Sklik - Clanek-InText) */}
                <div style={{ maxWidth: '300px', margin: '0 auto 40px', minHeight: '250px', display: 'flex', justifyContent: 'center' }}>
                    <div id="szn-seznam-ad-408651"></div>
                </div>

                {/* PROLINKOVÁNÍ VE STYLU HOMEPAGE */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '50px', paddingBottom: '50px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', marginBottom: '30px', textAlign: 'center', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {t.exploreMore || (locale === 'en' ? 'Explore More Tools' : 'Další GURU Nástroje')}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        <Link href={`${prefix}/bottleneck-calculator`} style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }} className="hover:bg-[#38bdf8] hover:text-black hover:scale-105">
                            <Layers size={18} /> {locale === 'en' ? 'BOTTLENECK' : 'BOTTLENECK'}
                        </Link>
                        <Link href={`${prefix}/fps-kalkulacka`} style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }} className="hover:bg-[#a855f7] hover:text-white hover:scale-105">
                            <Gamepad2 size={18} /> {locale === 'en' ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}
                        </Link>
                        <Link href={`${prefix}/cpuvs`} style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.3)' }} className="hover:bg-[#66fcf1] hover:text-black hover:scale-105">
                            <Cpu size={18} /> {locale === 'en' ? 'CPU BATTLES' : 'SOUBOJE CPU'}
                        </Link>
                        <Link href={`${prefix}/gpuvs`} style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 0, 85, 0.1)', color: '#ff0055', border: '1px solid rgba(255, 0, 85, 0.3)' }} className="hover:bg-[#ff0055] hover:text-white hover:scale-105">
                            <Swords size={18} /> {locale === 'en' ? 'GPU BATTLES' : 'SOUBOJE GPU'}
                        </Link>
                        <Link href={`${prefix}/clanky`} style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }} className="hover:bg-white/20 hover:scale-105">
                            <BookOpen size={18} /> {locale === 'en' ? 'HARDWARE NEWS' : 'HW NOVINKY'}
                        </Link>
                    </div>
                </div>

            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                /* Ochrana proti přepsání placeholderu prohlížečem */
                ::placeholder { color: rgba(255,255,255,0.4) !important; font-weight: normal; }
            `}} />
        </div>
    );
}
