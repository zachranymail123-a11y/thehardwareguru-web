'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Play, MonitorPlay, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function GuruBenchmarkHub({ t, locale = 'cs' }) {
    const router = useRouter();
    const canvasRef = useRef(null);
    
    const [gpuDetected, setGpuDetected] = useState('Detekuji...');
    const [nickname, setNickname] = useState('');
    const [cpuInput, setCpuInput] = useState('');
    
    const [testPhase, setTestPhase] = useState('idle');

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
        } catch (e) {
            setGpuDetected('Neznámé GPU');
        }
    };

    // SEO GURU FUNKCE: Vygeneruje nádhernou URL zadanou uživatelem
    const generateSlug = (nick, cpu, gpu) => {
        const cleanString = `${nick}-${cpu}-${gpu}`
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Odstraní diakritiku (háčky, čárky)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Všechno co není písmeno/číslo změní na pomlčku
            .replace(/(^-|-$)+/g, ''); // Odstraní pomlčky na začátku a na konci

        const randomHash = Math.random().toString(36).substring(2, 6); // Přidá 4 znaky proti duplikátům
        return `${cleanString}-${randomHash}`;
    };

    const startFullBenchmark = async (e) => {
        e.preventDefault();
        if (!nickname.trim()) {
            alert(locale === 'cs' ? 'Zadej svou přezdívku!' : 'Enter your nickname!');
            return;
        }

        setTestPhase('cpu');

        // 1. CPU TEST
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const startCpu = performance.now();
        let primeCount = 0;
        for (let i = 2; i <= 300000; i++) {
            let isPrime = true;
            for (let j = 2; j <= Math.sqrt(i); j++) {
                if (i % j === 0) { isPrime = false; break; }
            }
            if (isPrime) primeCount++;
        }
        const cpuTime = Math.round(performance.now() - startCpu);
        const cpuScore = Math.round(10000000 / cpuTime);

        // 2. GPU TEST
        setTestPhase('gpu');
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');
        let gpuScore = 0;

        if (gl) {
            const vsSource = `attribute vec4 aVertexPosition; void main() { gl_Position = aVertexPosition; }`;
            const fsSource = `
                precision highp float; uniform vec2 u_resolution;
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution;
                    vec2 c = uv * 4.0 - vec2(2.0); vec2 z = vec2(0.0); int iters = 0;
                    for(int i = 0; i < 3000; i++) {
                        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
                        if(length(z) > 4.0) break; iters++;
                    }
                    gl_FragColor = vec4(float(iters)/3000.0, 0.0, 0.0, 1.0);
                }
            `;
            const vertexShader = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vertexShader, vsSource); gl.compileShader(vertexShader);
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fragmentShader, fsSource); gl.compileShader(fragmentShader);
            const program = gl.createProgram(); gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader);
            gl.linkProgram(program); gl.useProgram(program);

            const positionBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
            const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
            gl.enableVertexAttribArray(positionLocation); gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

            const passes = 30; const pixels = new Uint8Array(4); 
            const startGpu = performance.now();
            for (let i = 0; i < passes; i++) {
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels); 
            }
            const gpuTime = Math.round(performance.now() - startGpu);
            gpuScore = Math.round(50000000 / gpuTime);
        }

        const totalScore = cpuScore + gpuScore;

        setTestPhase('saving');
        
        const cleanGpuName = gpuDetected.split(',')[1] ? gpuDetected.split(',')[1].trim() : gpuDetected;
        const cleanGpuNameShort = cleanGpuName.replace('ANGLE (', '').replace(')', '');
        const finalCpuName = cpuInput.trim() || `Unknown ${navigator.hardwareConcurrency} Cores`;
        
        // Vytvoření SEO URL
        const seoSlug = generateSlug(nickname, finalCpuName, cleanGpuNameShort);

        const { data, error } = await supabase.from('guru_benchmarks').insert([{
            nickname: nickname.trim(),
            cpu_name: finalCpuName,
            gpu_name: cleanGpuNameShort,
            cpu_score: cpuScore,
            gpu_score: gpuScore,
            total_score: totalScore,
            slug: seoSlug, // Ukládáme SEO URL
            browser: navigator.userAgent.substring(0, 50),
            os: navigator.platform || 'Unknown'
        }]).select();

        if (data && data[0]) {
            const prefix = locale === 'en' ? '/en' : '';
            // Přesměrujeme na krásnou URL se slugem místo ID
            router.push(`${prefix}/benchmark/result/${data[0].slug}`);
        } else {
            alert("Došlo k chybě při ukládání. Zkus to znovu.");
            console.error(error);
            setTestPhase('idle');
        }
    };

    return (
        <div style={{ background: '#0a0b0d', color: '#fff', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <canvas ref={canvasRef} width="1024" height="1024" style={{ display: 'none' }}></canvas>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.05)', marginBottom: '20px' }}>
                        <ShieldCheck size={16} /> GURU ULTIMATE BENCHMARK
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0', lineHeight: '1.1' }}>
                        {t.title}
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        {t.description}
                    </p>
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(168, 85, 247, 0.05)' }}>
                    
                    {testPhase === 'idle' ? (
                        <form onSubmit={startFullBenchmark} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    <MonitorPlay size={14} style={{display:'inline', verticalAlign: 'middle'}}/> Auto-GPU: {gpuDetected.split(',')[1] || gpuDetected}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', fontSize: '14px' }}>
                                    <User size={16} /> {t.nickLabel} *
                                </label>
                                <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t.nickPlaceholder} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '18px', fontWeight: 'bold', outline: 'none' }} />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', fontSize: '14px' }}>
                                    <Cpu size={16} /> {t.cpuLabel}
                                </label>
                                <input type="text" value={cpuInput} onChange={(e) => setCpuInput(e.target.value)} placeholder={t.cpuPlaceholder} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '18px', outline: 'none' }} />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}><AlertTriangle size={12} style={{display:'inline'}}/> {t.cpuDesc}</div>
                            </div>

                            <button type="submit" style={{ background: 'linear-gradient(90deg, #ff0055, #a855f7)', color: '#fff', padding: '20px', borderRadius: '12px', border: 'none', fontWeight: '950', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', textTransform: 'uppercase', transition: '0.3s', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)' }} className="hover:scale-105">
                                <Play size={24} fill="currentColor" /> {t.startBtn}
                            </button>
                        </form>
                    ) : (
                        <div style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div className="guru-spinner" style={{ width: '80px', height: '80px', border: '4px solid rgba(255, 255, 255, 0.1)', borderTopColor: testPhase === 'cpu' ? '#ff0055' : testPhase === 'gpu' ? '#10b981' : '#a855f7', borderRadius: '50%', margin: '0 auto 30px', animation: 'spin 1s linear infinite' }}></div>
                            
                            <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
                                {testPhase === 'cpu' && t.testingCpu}
                                {testPhase === 'gpu' && t.testingGpu}
                                {testPhase === 'saving' && t.testingSaving}
                            </h3>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                                <div style={{ opacity: testPhase === 'cpu' ? 1 : 0.3, color: '#ff0055', fontWeight: 'bold' }}><Cpu size={24} /></div>
                                <div style={{ opacity: testPhase === 'gpu' ? 1 : 0.3, color: '#10b981', fontWeight: 'bold' }}><Zap size={24} /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
        </div>
    );
}
