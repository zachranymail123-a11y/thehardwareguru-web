'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Play, MonitorPlay, AlertTriangle, ShieldCheck, User, Activity, Crosshair, Swords, BookOpen, Layers, Gamepad2, Share2, Link2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HeurekaButtons from './HeurekaButtons';

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
    const [copied, setCopied] = useState(false);

    useEffect(() => { 
        detectGPU(); 
        
        // Bezpečné načtení Sklik reklam s lehkým zpožděním, aby byl DOM v Next.js 100% ready
        const loadAds = setTimeout(() => {
            try {
                if (window.szn && window.szn.ads && window.szn.ads.push) {
                    window.szn.ads.push({ id: "szn-seznam-ad-408654" }); // Top banner
                    window.szn.ads.push({ id: "szn-seznam-ad-408651" }); // Bottom banner
                }
            } catch (e) {
                console.error("Sklik Ads Error:", e);
            }
        }, 500);

        return () => clearTimeout(loadAds);
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
    
    // Fallback texty pro formulář
    const fallbackNickLabel = locale === 'en' ? 'Enter your Nickname' : 'Zadej svůj Nick';
    const fallbackNickPlace = locale === 'en' ? 'e.g. Tapicek, Master99...' : 'Např. Tapicek, Master99...';
    const fallbackCpuLabel = locale === 'en' ? 'Exact Processor Name' : 'Přesný název tvého procesoru';
    const fallbackCpuPlace = locale === 'en' ? 'e.g. AMD Ryzen 7 7800X3D' : 'Např. AMD Ryzen 7 7800X3D';
    const fallbackCpuDesc = locale === 'en' ? 'Optional, but recommended for the leaderboard!' : 'Nepovinné, ale doporučené pro Síň slávy!';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
            
            {/* HORNÍ REKLAMNÍ BANNER (Sklik - Homepage-Top) */}
            <div style={{ maxWidth: '970px', margin: '0 auto 40px', minHeight: '210px', display: 'flex', justifyContent: 'center' }}>
                <div id="szn-seznam-ad-408654"></div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <canvas ref={canvasRef} width="1024" height="1024" style={{ display: 'none' }}></canvas>

                {/* HLAVIČKA NÁSTROJE */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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

                {/* GURU EKOSYSTÉM HUB (Přesunuto nahoru) */}
                <div style={{ marginBottom: '50px', background: 'rgba(15, 17, 21, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '30px', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#fff', marginBottom: '25px', textAlign: 'center', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {locale === 'en' ? 'EXPLORE GURU ECOSYSTEM' : 'PROZKOUMEJ CELÝ GURU EKOSYSTÉM'}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        <Link href={`${prefix}/bottleneck-calculator`} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(56, 189, 248, 0.05)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' }} className="hover:bg-[#38bdf8] hover:text-black hover:scale-105">
                            <Layers size={16} /> {locale === 'en' ? 'BOTTLENECK' : 'BOTTLENECK'}
                        </Link>
                        <Link href={`${prefix}/fps-kalkulacka`} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(168, 85, 247, 0.05)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.4)' }} className="hover:bg-[#a855f7] hover:text-white hover:scale-105">
                            <Gamepad2 size={16} /> {locale === 'en' ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}
                        </Link>
                        <Link href={`${prefix}/cpuvs`} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(102, 252, 241, 0.05)', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.4)' }} className="hover:bg-[#66fcf1] hover:text-black hover:scale-105">
                            <Cpu size={16} /> {locale === 'en' ? 'CPU BATTLES' : 'SOUBOJE CPU'}
                        </Link>
                        <Link href={`${prefix}/gpuvs`} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 0, 85, 0.05)', color: '#ff0055', border: '1px solid rgba(255, 0, 85, 0.4)' }} className="hover:bg-[#ff0055] hover:text-white hover:scale-105">
                            <Swords size={16} /> {locale === 'en' ? 'GPU BATTLES' : 'SOUBOJE GPU'}
                        </Link>
                        <Link href={`${prefix}/clanky`} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }} className="hover:bg-white/20 hover:scale-105">
                            <BookOpen size={16} /> {locale === 'en' ? 'HW NEWS' : 'HW NOVINKY'}
                        </Link>
                    </div>
                </div>

                {/* SDÍLENÍ NÁSTROJE PŘED SPUŠTĚNÍM */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                    <span style={{ fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
                        <Share2 size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'5px'}}/> {locale === 'en' ? 'SHARE TOOL:' : 'SDÍLET NÁSTROJ:'}
                    </span>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" style={{ background: '#1877f2', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: '0.2s', boxShadow: '0 4px 15px rgba(24, 119, 242, 0.4)' }} className="hover:scale-110">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>
                    </a>
                    <a href={`https://www.reddit.com/submit?url=${shareUrl}&title=GURU%20Benchmark%20-%20Test%20tvyho%20PC`} target="_blank" rel="noreferrer" style={{ background: '#ff4500', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: '0.2s', boxShadow: '0 4px 15px rgba(255, 69, 0, 0.4)' }} className="hover:scale-110">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.505 1.12-.823 2.686-1.373 4.417-1.469l.865-4.053c.036-.164.19-.283.359-.283h.032l2.914.613a1.256 1.256 0 0 1 1.434-1.315zm-9.043 8.354a1.26 1.26 0 0 0-1.26 1.26c0 .695.564 1.26 1.26 1.26.695 0 1.26-.565 1.26-1.26a1.26 1.26 0 0 0-1.26-1.26zm8.066 0a1.26 1.26 0 0 0-1.26 1.26c0 .695.564 1.26 1.26 1.26.695 0 1.26-.565 1.26-1.26a1.26 1.26 0 0 0-1.26-1.26zm-4.032 4.148c-1.503 0-2.698-.387-2.836-.431a.333.333 0 0 0-.197.636c.036.012 1.348.462 3.033.462 1.684 0 2.996-.45 3.032-.462a.333.333 0 0 0-.197-.636c-.138.044-1.333.431-2.835.431z"/></svg>
                    </a>
                    <button onClick={copyLink} style={{ background: copied ? '#10b981' : '#374151', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: '0.2s', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)' }} className="hover:scale-110">
                        <Link2 size={20} />
                    </button>
                </div>

                {/* FORMULÁŘ NÁSTROJE */}
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

                {/* HEUREKA BUTTONS */}
                <div style={{ maxWidth: '420px', margin: '0 auto 40px auto' }}>
                    <HeurekaButtons isEn={locale === 'en'} />
                </div>

                {/* SPODNÍ REKLAMNÍ BANNER (Sklik - Clanek-InText) */}
                <div style={{ maxWidth: '300px', margin: '0 auto 40px', minHeight: '250px', display: 'flex', justifyContent: 'center' }}>
                    <div id="szn-seznam-ad-408651"></div>
                </div>

            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                ::placeholder { color: rgba(255,255,255,0.4) !important; font-weight: normal; }
            `}} />
        </div>
    );
}
