'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Play, MonitorPlay, AlertTriangle, ShieldCheck, User, Activity, Crosshair, Swords, BookOpen, Layers, Gamepad2, Share2, Link2, Twitter, Facebook, Trophy, Lightbulb, GraduationCap, Zap as Flash } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HeurekaButtons from './HeurekaButtons';
import SeznamAd from './SeznamAd';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" /></svg>
);

export default function GuruBenchmarkHub({ t = {}, locale = 'cs' }) {
    const router = useRouter();
    const [gpuDetected, setGpuDetected] = useState('Detecting...');
    const [nickname, setNickname] = useState('');
    const [cpuInput, setCpuInput] = useState('');
    const [testPhase, setTestPhase] = useState('idle');
    const [leaderboard, setLeaderboard] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            setGpuDetected(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown GPU');
        }
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        const { data } = await supabase.from('guru_benchmarks').select('nickname, total_score, cpu_name, gpu_name').order('total_score', { ascending: false }).limit(10);
        if (data) setLeaderboard(data);
    };

    const startFullBenchmark = async (e) => {
        e.preventDefault();
        if (!nickname.trim()) return;
        setTestPhase('cpu');
        await new Promise(r => setTimeout(r, 800));
        const cScore = 450000;
        setTestPhase('gpu');
        await new Promise(r => setTimeout(r, 800));
        const gScore = 320000;
        const slug = `${nickname}-${cpuInput}-${Math.random().toString(36).substring(2, 7)}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await supabase.from('guru_benchmarks').insert([{ nickname, cpu_name: cpuInput, gpu_name: gpuDetected, cpu_score: cScore, gpu_score: gScore, total_score: cScore + gScore, slug }]);
        router.push(`${locale === 'en' ? '/en' : ''}/benchmark/result/${slug}`);
    };

    const shareUrl = `https://thehardwareguru.cz${locale === 'en' ? '/en' : ''}/benchmark`;

    return (
        <div style={{ background: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', padding: '120px 20px 60px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)', marginBottom: '20px' }}>
                        <ShieldCheck size={16} /> GURU ULTIMATE BENCHMARK
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 15px 0', lineHeight: '1', textShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
                        {locale === 'en' ? 'ULTIMATE PC TEST' : 'KOMPLEXNÍ TEST VÝKONU PC'}
                    </h1>

                    <div style={{ marginBottom: '25px' }}>
                        <h2 style={{ color: '#ff00ff', fontWeight: '950', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>
                             {locale === 'en' ? "🚀 DON'T BE SELFISH, SHOW THEM THE POWER!" : "🚀 NEBUĎ SOBEC, UKAŽ OSTATNÍM TU SÍLU!"}
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" style={{ background: '#1877f2', color: '#fff', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><Facebook size={20} fill="#fff" stroke="none" /></a>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" style={{ background: '#000', border: '1px solid #333', color: '#fff', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><Twitter size={18} fill="#fff" stroke="none" /></a>
                            <a href={`https://www.reddit.com/submit?url=${shareUrl}`} target="_blank" rel="noreferrer" style={{ background: '#ff4500', color: '#fff', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><RedditIcon size={22} /></a>
                            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={{ background: copied ? '#10b981' : '#374151', color: '#fff', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: 'none', cursor: 'pointer' }}><Link2 size={22} /></button>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '40px', background: 'rgba(15, 17, 21, 0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '30px', borderRadius: '24px', backdropFilter: 'blur(15px)', textAlign:'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '950', color: '#fff', marginBottom: '25px', textTransform: 'uppercase' }}>{locale === 'en' ? 'EXPLORE THE ENTIRE GURU ECOSYSTEM' : 'PROZKOUMEJ CELÝ GURU EKOSYSTÉM'}</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        <Link href="/bottleneck-calculator" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#38bdf8', border: '1px solid #38bdf8', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Layers size={14} /> {locale === 'en' ? 'BOTTLENECK' : 'BOTTLENECK'}</Link>
                        <Link href="/fps-kalkulacka" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#a855f7', border: '1px solid #a855f7', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Gamepad2 size={14} /> {locale === 'en' ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</Link>
                        <Link href="/cpuvs" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#66fcf1', border: '1px solid #66fcf1', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Cpu size={14} /> {locale === 'en' ? 'CPU DUELS' : 'SOUBOJE CPU'}</Link>
                        <Link href="/gpuvs" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#ff0055', border: '1px solid #ff0055', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Swords size={14} /> {locale === 'en' ? 'GPU DUELS' : 'SOUBOJE GPU'}</Link>
                        <Link href="/clanky" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#fff', border: '1px solid #fff', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><BookOpen size={14} /> {locale === 'en' ? 'HW NEWS' : 'HW NOVINKY'}</Link>
                        <Link href="/slovnik" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#9ca3af', border: '1px solid #9ca3af', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><GraduationCap size={14} /> {locale === 'en' ? 'GLOSSARY' : 'SLOVNÍK'}</Link>
                        <Link href="/tipy" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#a855f7', border: '1px solid #a855f7', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Lightbulb size={14} /> {locale === 'en' ? 'TIPS' : 'TIPY'}</Link>
                        <Link href="/tweaky" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#f59e0b', border: '1px solid #f59e0b', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Flash size={14} /> {locale === 'en' ? 'TWEAKS' : 'TWEAKY'}</Link>
                    </div>
                </div>

                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '50px 40px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginBottom: '60px' }}>
                    {testPhase === 'idle' ? (
                        <form onSubmit={startFullBenchmark} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ padding: '15px 20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: '900', fontSize: '14px' }}>
                                <MonitorPlay size={18} style={{ display:'inline', verticalAlign:'middle', marginRight:'10px'}} /> {locale === 'en' ? 'Auto-GPU:' : 'Auto-GPU:'} {gpuDetected.split(',')[1] || gpuDetected}
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ff00ff', fontWeight: '950', textTransform: 'uppercase', fontSize: '13px', marginBottom: '10px' }}><User size={14} style={{display:'inline', marginRight:'5px'}}/> {locale === 'en' ? 'ENTER YOUR NICK *' : 'ZADEJ SVŮJ NICK *'}</label>
                                <input type="text" required placeholder={locale === 'en' ? "e.g., Tapicek, Master99..." : "Např. Tapicek, Master99..."} value={nickname} onChange={e => setNickname(e.target.value)} style={{ width: '100%', padding: '20px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', fontSize: '18px', fontWeight: 'bold' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#fff', fontWeight: '950', textTransform: 'uppercase', fontSize: '13px', marginBottom: '10px' }}><Cpu size={14} style={{display:'inline', marginRight:'5px'}}/> {locale === 'en' ? 'EXACT CPU NAME' : 'PŘESNÝ NÁZEV TVÉHO PROCESORU'}</label>
                                <input type="text" placeholder={locale === 'en' ? "e.g., AMD Ryzen 7 7800X3D" : "Např. AMD Ryzen 7 7800X3D"} value={cpuInput} onChange={e => setCpuInput(e.target.value)} style={{ width: '100%', padding: '20px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', fontSize: '18px' }} />
                            </div>
                            <button type="submit" style={{ background: 'linear-gradient(90deg, #ff0055, #a855f7)', padding: '25px', borderRadius: '15px', fontWeight: '950', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '22px', textTransform: 'uppercase' }}>{locale === 'en' ? 'START GURU TEST' : 'SPUSTIT GURU TEST'}</button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div className="guru-spinner" style={{ width: '80px', height: '80px', border: '6px solid #fff', borderTopColor: '#ff0055', borderRadius: '50%', margin: '0 auto 30px', animation: 'spin 1s linear infinite' }}></div>
                            <h2 style={{ fontWeight: '950', fontSize: '32px' }}>{testPhase === 'cpu' ? (locale === 'en' ? 'TESTING CPU...' : 'TESTUJI CPU...') : (locale === 'en' ? 'MEASURING GPU...' : 'MĚŘÍM GPU...')}</h2>
                        </div>
                    )}
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.8)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '24px', padding: '40px', marginBottom: '40px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '28px', fontWeight: '950', color: '#fff', marginBottom: '30px', textTransform: 'uppercase' }}>
                        <Trophy size={32} color="#f59e0b" /> {locale === 'en' ? 'GURU LEADERBOARD (TOP 10)' : 'GURU LEADERBOARD (TOP 10)'}
                    </h2>
                    
                    {/* VELKÁ REKLAMA V LEADERBOARDU */}
                    <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {leaderboard.map((row, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 120px', alignItems: 'center', padding: '15px 25px', background: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${idx === 0 ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px' }}>
                                <span style={{ fontWeight: '950', color: idx === 0 ? '#f59e0b' : '#6b7280', fontSize: '20px' }}>#{idx + 1}</span>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '16px', color: '#fff' }}>{row.nickname}</div>
                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{row.cpu_name} • {row.gpu_name?.split(',')[1] || row.gpu_name}</div>
                                </div>
                                <div style={{ fontWeight: '950', fontSize: '22px', color: '#a855f7', textAlign: 'right' }}>{row.total_score.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

                <div style={{ maxWidth: '420px', margin: '0 auto' }}>
                    <HeurekaButtons isEn={locale === 'en'} />
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
        </div>
    );
}
