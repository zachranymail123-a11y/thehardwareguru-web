import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, Cpu, Zap, Twitter, Facebook, Layers, Gamepad2, Share2, BookOpen, GraduationCap, Lightbulb, Zap as Flash, Swords } from 'lucide-react';
import SeznamAd from '../../../../../components/SeznamAd';
import HeurekaButtons from '../../../../../components/HeurekaButtons';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" /></svg>
);

export async function generateMetadata({ params }) {
    const p = await params;
    const { data } = await supabase.from('guru_benchmarks').select('*').eq('slug', p.slug).single();
    if (!data) return { title: 'Result Not Found | Hardware Guru' };
    return { title: `${data.nickname} scored ${data.total_score.toLocaleString()}! | GURU Benchmark` };
}

export default async function ResultPageEN({ params }) {
    const p = await params;
    const { data: result } = await supabase.from('guru_benchmarks').select('*').eq('slug', p.slug).single();
    const { data: topList } = await supabase.from('guru_benchmarks').select('nickname, total_score, cpu_name, gpu_name').order('total_score', { ascending: false }).limit(10);

    if (!result) return <div style={{ background: '#0a0b0d', minHeight: '100vh', color: '#fff', display:'flex', alignItems:'center', justifyContent:'center' }}><h1>404 | Result Not Found</h1></div>;

    const isCpuBottleneck = result.cpu_score < (result.gpu_score * 0.45);
    const isGpuBottleneck = result.gpu_score < (result.cpu_score * 0.45);
    let evalColor = isCpuBottleneck ? "#ff0055" : (isGpuBottleneck ? "#f59e0b" : "#10b981");

    const shareUrl = `https://thehardwareguru.cz/en/benchmark/result/${result.slug}`;

    return (
        <div style={{ background: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', padding: '120px 20px 60px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* TOP AD */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                {/* HEADER, CTR TEXT AND SHARING WITH X ICON */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}><Trophy size={18} style={{display:'inline', verticalAlign:'middle', marginRight:'10px'}}/> OFFICIAL GURU RESULT</div>
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '0.9', textShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}>{result.nickname}</h1>
                    
                    <div style={{ marginTop: '20px' }}>
                        <h2 style={{ color: '#ff00ff', fontWeight: '950', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>
                             🚀 DON'T BE SELFISH, SHOW THEM THE POWER!
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" style={{ background: '#1877f2', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><Facebook fill="#fff" stroke="none" /></a>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=My PC just scored ${result.total_score.toLocaleString()} on GURU Benchmark! Can you beat me?`} target="_blank" style={{ background: '#000', border:'1px solid #333', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><Twitter fill="#fff" stroke="none" /></a>
                            <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=My PC Benchmark Result: ${result.total_score.toLocaleString()}`} target="_blank" style={{ background: '#ff4500', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><RedditIcon size={24} /></a>
                        </div>
                    </div>
                </div>

                {/* COMPLETE GURU HUB (EN VERSION) */}
                <div style={{ marginBottom: '40px', background: 'rgba(15, 17, 21, 0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '25px', borderRadius: '24px', backdropFilter: 'blur(15px)', textAlign:'center' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        <Link href="/en/bottleneck-calculator" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#38bdf8', border: '1px solid #38bdf8', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Layers size={14} /> BOTTLENECK</Link>
                        <Link href="/en/fps-calculator" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#a855f7', border: '1px solid #a855f7', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Gamepad2 size={14} /> FPS CALCULATOR</Link>
                        <Link href="/en/cpu-index" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#66fcf1', border: '1px solid #66fcf1', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Cpu size={14} /> CPU CATALOG</Link>
                        <Link href="/en/gpu-index" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#ff0055', border: '1px solid #ff0055', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Zap size={14} /> GPU CATALOG</Link>
                        <Link href="/en/cpuvs" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#66fcf1', border: '1px solid #66fcf1', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Swords size={14} /> CPU BATTLES</Link>
                        <Link href="/en/gpuvs" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#ff0055', border: '1px solid #ff0055', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Swords size={14} /> GPU BATTLES</Link>
                        <Link href="/en/clanky" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#fff', border: '1px solid #fff', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><BookOpen size={14} /> HW NEWS</Link>
                        <Link href="/en/slovnik" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#9ca3af', border: '1px solid #9ca3af', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><GraduationCap size={14} /> GLOSSARY</Link>
                        <Link href="/en/tipy" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#a855f7', border: '1px solid #a855f7', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Lightbulb size={14} /> TIPS</Link>
                        <Link href="/en/tweaky" style={{ padding: '10px 15px', borderRadius: '8px', fontWeight: '900', background: 'rgba(15, 17, 21, 0.8)', color: '#f59e0b', border: '1px solid #f59e0b', textDecoration: 'none', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px' }}><Flash size={14} /> TWEAKS</Link>
                    </div>
                </div>

                {/* RESULT CARD - LARGE AD INSIDE */}
                <div style={{ background: 'rgba(15, 17, 21, 0.9)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '30px', padding: '50px 40px', textAlign: 'center', marginBottom: '40px', backdropFilter: 'blur(15px)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                    <div style={{ fontSize: '18px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px' }}>TOTAL GURU SCORE</div>
                    <div style={{ fontSize: 'clamp(5rem, 15vw, 10rem)', fontWeight: '950', color: '#fff', margin: '10px 0', lineHeight: '1' }}>{result.total_score.toLocaleString()}</div>
                    
                    <div style={{ margin: '30px 0', display: 'flex', justifyContent: 'center' }}>
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
                        <div style={{ background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.2)', padding: '25px', borderRadius: '20px' }}>
                            <Cpu size={32} color="#ff0055" />
                            <div style={{ color: '#ff0055', fontSize: '32px', fontWeight: '950' }}>{result.cpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '14px', color: '#fff' }}>{result.cpu_name}</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '25px', borderRadius: '20px' }}>
                            <Zap size={32} color="#10b981" />
                            <div style={{ color: '#10b981', fontSize: '32px', fontWeight: '950' }}>{result.gpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '14px', color: '#fff' }}>{result.gpu_name}</div>
                        </div>
                    </div>
                </div>

                {/* EVALUATION - LARGE AD INSTEAD OF THREE SMALL ONES */}
                <div style={{ background: 'rgba(15, 17, 21, 0.8)', border: `2px solid ${evalColor}`, borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '950', color: evalColor, marginBottom: '20px', textTransform: 'uppercase' }}>
                        {isCpuBottleneck ? "⚠️ MASSIVE CPU BOTTLENECK!" : isGpuBottleneck ? "⚠️ MASSIVE GPU BOTTLENECK!" : "PERFECTLY BALANCED BUILD!"}
                    </h2>
                    <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '35px', lineHeight: '1.6' }}>
                        {isCpuBottleneck ? `Your CPU ${result.cpu_name} is severely limiting your graphics card. You need a faster CPU!` : isGpuBottleneck ? `Your GPU ${result.gpu_name} cannot keep up with this CPU. Time for a GPU upgrade!` : "Your CPU and GPU are a perfect match. No significant bottleneck detected!"}
                    </p>
                    
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
                        <p style={{ color: '#9ca3af', marginBottom: '30px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>RECOMMENDED UPGRADE FOR MAXIMUM FPS:</p>
                        
                        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                            <SeznamAd zoneId={408654} width={970} height={210} />
                        </div>

                        <HeurekaButtons isEn={true} />
                        
                        <div style={{ marginTop: '40px' }}>
                            <Link href="/en/benchmark" style={{ background: '#ff0055', color: '#fff', padding: '16px 35px', borderRadius: '14px', fontWeight: '950', textDecoration:'none', textTransform:'uppercase', fontSize:'18px' }}>TRY AGAIN AND BEAT THEM!</Link>
                        </div>
                    </div>
                </div>

                {/* HALL OF FAME - TOP 10 WITH AD INSIDE */}
                <div style={{ background: 'rgba(15, 17, 21, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', padding: '50px 40px', marginBottom: '40px' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '950', color: '#fff', marginBottom: '40px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <Trophy size={36} color="#f59e0b" /> GURU TOP 10 HALL OF FAME
                    </h2>

                    <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topList.map((row, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 150px', alignItems: 'center', padding: '20px 30px', background: row.nickname === result.nickname ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)', borderRadius: '16px', border: row.nickname === result.nickname ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontWeight: '950', color: idx === 0 ? '#f59e0b' : '#4b5563', fontSize: '24px' }}>#{idx + 1}</span>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '18px', color: '#fff' }}>{row.nickname}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.cpu_name} • {row.gpu_name?.split(',')[1] || row.gpu_name}</div>
                                </div>
                                <div style={{ fontWeight: '950', color: '#a855f7', fontSize: '26px', textAlign: 'right' }}>{row.total_score.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

            </div>
        </div>
    );
}
