'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Play, MonitorPlay, AlertTriangle, ShieldCheck, User, Activity, Crosshair, Swords, BookOpen, Layers, Gamepad2, Share2, Link2, Facebook, Twitter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HeurekaButtons from './HeurekaButtons';
import SeznamAd from './SeznamAd'; // SPRÁVNÝ IMPORT TVÉ KOMPONENTY PRO REKLAMY

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Reddit Icon
const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default function GuruBenchmarkHub({ t = {}, locale = 'cs' }) {
    const router = useRouter();
    const canvasRef = useRef(null);
    
    const [gpuDetected, setGpuDetected] = useState('Detekuji...');
    const [nickname, setNickname] = useState('');
    const [cpuInput, setCpuInput] = useState('');
    const [testPhase, setTestPhase] = useState('idle');
    const [copied, setCopied] = useState(false);

    useEffect(() => { 
        detectGPU(); 
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

    const copyLink = () => {
        navigator.clipboard.writeText(`https://thehardwareguru.cz${locale === 'en' ? '/en' : ''}/benchmark`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const prefix = locale === 'en' ? '/en' : '';
    const shareUrl = `https://thehardwareguru.cz${prefix}/benchmark`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
            
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <canvas ref={canvasRef} width="1024" height="1024" style={{ display: 'none' }}></canvas>

                {/* HLAVIČKA NÁSTROJE */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)', marginBottom: '20px', backdropFilter: 'blur(5px)' }}>
                        <ShieldCheck size={16} /> GURU ULTIMATE BENCHMARK
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0', lineHeight: '1', textShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
                        {t.title || (locale === 'en' ? 'PC Performance Test' : 'Komplexní Test Výkonu PC')}
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {t.description || (locale === 'en' ? 'Test your CPU and GPU power in the browser.' : 'Jeden nástroj, který odhalí sílu tvého PC. Otestuj hrubou výpočetní sílu procesoru (Single-Core) a shaderový výkon grafické karty (WebGL) přímo v prohlížeči.')}
                    </p>
                </div>

                {/* SDÍLENÍ NÁSTROJE - NAHOŘE! */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                    <span style={{ fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
                        <Share2 size={16} style={{ marginRight:'8px' }}/> {locale === 'en' ? 'SHARE TOOL:' : 'SDÍLET NÁSTROJ:'}
                    </span>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" style={{ background: '#1877f2', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: '0.2s', boxShadow: '0 4px 15px rgba(24, 119, 242, 0.4)' }} className="hover:scale-110">
                         <Facebook size={20} fill="currentColor" stroke="none" />
                    </a>
                    <a href={`https://www.reddit.com/submit?url=${shareUrl}&title=GURU%20Benchmark%20-%20Test%20tvyho%20PC`} target="_blank" rel="noreferrer" style={{ background: '#ff4500', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: '0.2s', boxShadow: '0 4px 15px rgba(255, 69, 0, 0.4)' }} className="hover:scale-110">
                        <RedditIcon size={20} />
                    </a>
                    <button onClick={copyLink} style={{ background: copied ? '#10b981' : '#374151', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: '0.2s', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)' }} className="hover:scale-110">
                        <Link2 size={20} />
                    </button>
                </div>

                {/* GURU EKOSYSTÉM HUB - NAHOŘE (Design přesně podle image_de12a3) */}
                <div style={{ marginBottom: '40px', background: 'transparent', padding: '10px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', marginBottom: '25px', textAlign: 'center', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
                        {locale === 'en' ? 'EXPLORE GURU ECOSYSTEM' : 'PROZKOUMEJ CELÝ GURU EKOSYSTÉM'}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        
                        <Link href={`${prefix}/bottleneck-calculator`} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 17, 21, 0.8)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', backdropFilter: 'blur(5px)' }} className="hover:bg-[#38bdf8] hover:text-black">
                            <Layers size={16} /> {locale === 'en' ? 'BOTTLENECK' : 'BOTTLENECK'}
                        </Link>
                        
                        <Link href={`${prefix}/fps-kalkulacka`} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 17, 21, 0.8)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', backdropFilter: 'blur(5px)' }} className="hover:bg-[#a855f7] hover:text-white">
                            <Gamepad2 size={16} /> {locale === 'en' ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}
                        </Link>
                        
                        <Link href={`${prefix}/cpuvs`} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 17, 21, 0.8)', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.3)', backdropFilter: 'blur(5px)' }} className="hover:bg-[#66fcf1] hover:text-black">
                            <Cpu size={16} /> {locale === 'en' ? 'CPU BATTLES' : 'SOUBOJE CPU'}
                        </Link>
                        
                        <Link href={`${prefix}/gpuvs`} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 17, 21, 0.8)', color: '#ff0055', border: '1px solid rgba(255, 0, 85, 0.3)', backdropFilter: 'blur(5px)' }} className="hover:bg-[#ff0055] hover:text-white">
                            <Swords size={16} /> {locale === 'en' ? 'GPU BATTLES' : 'SOUBOJE GPU'}
                        </Link>
                        
                        <Link href={`${prefix}/clanky`} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 17, 21, 0.8)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(5px)' }} className="hover:bg-white/20">
                            <BookOpen size={16} /> {locale === 'en' ? 'HW NEWS' : 'HW NOVINKY'}
                        </Link>
                    </div>
                </div>

                {/* HORNÍ REKLAMNÍ BANNER (SPRÁVNÉ NASAZENÍ PŘES SEZNAMAD KOMPONENTU!) */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                {/* FORMULÁŘ NÁSTROJE */}
                <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(168, 85, 247, 0.05)', marginBottom: '40px', backdropFilter: 'blur(15px)' }}>
                    
                    {testPhase === 'idle' ? (
                        <form onSubmit={startFullBenchmark} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div style={{ padding: '15px 20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center' }}>
                                <MonitorPlay size={18} style={{ color: '#10b981', marginRight: '10px' }} />
                                <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '900' }}>Auto-GPU: {gpuDetected.split(',')[1] || gpuDetected}</span>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff00ff', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
                                    <User size={18} color="#ff00ff" /> {t.nickLabel || (locale === 'en' ? 'ENTER YOUR NICK' : 'ZADEJ SVŮJ NICK')} <span style={{color: '#ff0055'}}>*</span>
                                </label>
                                <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t.nickPlaceholder || (locale === 'en' ? 'e.g. Tapicek, Master99...' : 'Např. Tapicek, Master99...')} style={{ width: '100%', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '16px', fontWeight: 'bold', outline: 'none', transition: 'border 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#ff00ff'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
                                    <Cpu size={18} color="#ff0055" /> {t.cpuLabel || (locale === 'en' ? 'EXACT PROCESSOR NAME' : 'PŘESNÝ NÁZEV TVÉHO PROCESORU')}
                                </label>
                                <input type="text" value={cpuInput} onChange={(e) => setCpuInput(e.target.value)} placeholder={t.cpuPlaceholder || (locale === 'en' ? 'e.g. AMD Ryzen 7 7800X3D' : 'Např. AMD Ryzen 7 7800X3D')} style={{ width: '100%', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '16px', outline: 'none', transition: 'border 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#ff0055'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <AlertTriangle size={14} style={{ color: '#f59e0b' }}/> {t.cpuDesc || (locale === 'en' ? 'Optional, but recommended for the Hall of Fame!' : 'Nepovinné, ale doporučené pro Síň slávy!')}
                                </div>
                            </div>

                            <button type="submit" style={{ background: 'linear-gradient(90deg, #ff0055, #a855f7)', color: '#fff', padding: '20px', borderRadius: '12px', border: 'none', fontWeight: '950', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '10px', textTransform: 'uppercase', transition: '0.3s', boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)' }} className="hover:scale-105">
                                <Play size={24} fill="currentColor" /> {t.startBtn || (locale === 'en' ? 'START BENCHMARK' : 'SPUSTIT BENCHMARK')}
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

                {/* SPODNÍ REKLAMNÍ BANNER (SPRÁVNÉ NASAZENÍ PŘES SEZNAMAD KOMPONENTU!) */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

                {/* HEUREKA BUTTONS */}
                <div style={{ maxWidth: '420px', margin: '0 auto 40px auto' }}>
                    <HeurekaButtons isEn={locale === 'en'} />
                </div>

            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                ::placeholder { color: rgba(255,255,255,0.4) !important; font-weight: normal; }
            `}} />
        </div>
    );
}
