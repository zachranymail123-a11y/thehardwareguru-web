import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, Cpu, Zap, Twitter, Facebook, Layers, Gamepad2 } from 'lucide-react';
// FIX: Opravená cesta k importům (5 úrovní nahoru pro EN verzi)
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
    return { title: `${data.nickname} - Score ${data.total_score.toLocaleString()} | GURU Benchmark` };
}

export default async function ResultPageEN({ params }) {
    const p = await params;
    const { data: result } = await supabase.from('guru_benchmarks').select('*').eq('slug', p.slug).single();
    const { data: topList } = await supabase.from('guru_benchmarks').select('nickname, total_score, cpu_name, gpu_name').order('total_score', { ascending: false }).limit(10);

    if (!result) return <div style={{ background: '#0a0b0d', minHeight: '100vh', color: '#fff', display:'flex', alignItems:'center', justifyContent:'center' }}><h1>404 | Result Not Found</h1></div>;

    const isCpuBottleneck = result.cpu_score < (result.gpu_score * 0.45);
    const isGpuBottleneck = result.gpu_score < (result.cpu_score * 0.45);
    
    let evalTitle = "Perfectly Balanced Build!";
    let evalDesc = "Your CPU and GPU are a perfect match. No significant bottleneck detected.";
    let evalColor = "#10b981";

    if (isCpuBottleneck) {
        evalTitle = "⚠️ CPU BOTTLENECK DETECTED!";
        evalDesc = "Your processor is severely limiting your graphics card. You are losing FPS because the GPU is waiting for the CPU.";
        evalColor = "#ff0055";
    } else if (isGpuBottleneck) {
        evalTitle = "⚠️ GPU BOTTLENECK DETECTED!";
        evalDesc = "Your graphics card cannot keep up with your CPU performance. There is room for a much stronger GPU.";
        evalColor = "#f59e0b";
    }

    const shareUrl = `https://thehardwareguru.cz/en/benchmark/result/${result.slug}`;

    return (
        <div style={{ background: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', padding: '120px 20px 60px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}><Trophy size={18} style={{display:'inline', verticalAlign:'middle', marginRight:'10px'}}/> OFFICIAL GURU RESULT</div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1' }}>{result.nickname}</h1>
                    
                    {/* SOCIAL SHARING WITH X */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" style={{ background: '#1877f2', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><Facebook fill="#fff" stroke="none" /></a>
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" style={{ background: '#000', border:'1px solid #333', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><Twitter fill="#fff" stroke="none" /></a>
                        <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`} target="_blank" style={{ background: '#ff4500', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><RedditIcon size={24} /></a>
                    </div>
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.9)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '30px', padding: '50px 40px', textAlign: 'center', marginBottom: '40px', backdropFilter: 'blur(15px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '18px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px' }}>Total GURU Score</div>
                    <div style={{ fontSize: '8rem', fontWeight: '950', color: '#fff', margin: '10px 0', lineHeight: '1', textShadow: '0 0 40px rgba(168, 85, 247, 0.6)' }}>
                        {result.total_score.toLocaleString()}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
                        <div style={{ background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.2)', padding: '25px', borderRadius: '20px' }}>
                            <Cpu size={32} color="#ff0055" style={{margin:'0 auto 15px'}} />
                            <div style={{ color: '#ff0055', fontSize: '32px', fontWeight: '950' }}>{result.cpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '10px' }}>{result.cpu_name}</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '25px', borderRadius: '20px' }}>
                            <Zap size={32} color="#10b981" style={{margin:'0 auto 15px'}} />
                            <div style={{ color: '#10b981', fontSize: '32px', fontWeight: '950' }}>{result.gpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '10px' }}>{result.gpu_name}</div>
                        </div>
                    </div>
                </div>

                {/* GURU EVALUATION */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: `2px solid ${evalColor}`, borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px', boxShadow: `0 0 30px ${evalColor}22` }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '950', color: evalColor, marginBottom: '15px', textTransform: 'uppercase' }}>{evalTitle}</h2>
                    <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '25px', lineHeight: '1.6' }}>{evalDesc}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                        <Link href="/en/bottleneck-calculator" style={{ padding: '15px', borderRadius: '12px', background: '#000', color: '#38bdf8', border: '1px solid #38bdf8', textDecoration: 'none', fontWeight: '900' }}>Bottleneck Guide →</Link>
                        <Link href="/en/clanky" style={{ padding: '15px', borderRadius: '12px', background: '#000', color: '#fff', border: '1px solid #fff', textDecoration: 'none', fontWeight: '900' }}>Optimization Tips →</Link>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
                        <p style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold' }}>Based on your test, we recommend these components for maximum FPS:</p>
                        <HeurekaButtons isEn={true} />
                    </div>
                </div>

                {/* TOP 10 LEADERBOARD */}
                <div style={{ background: 'rgba(15, 17, 21, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', marginBottom: '40px' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '950', color: '#fff', marginBottom: '30px', textTransform: 'uppercase' }}>GURU TOP 10 HALL OF FAME</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {topList.map((row, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 120px', alignItems: 'center', padding: '15px 25px', background: row.nickname === result.nickname ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)', borderRadius: '12px', border: row.nickname === result.nickname ? '1px solid #a855f7' : '1px solid transparent' }}>
                                <span style={{ fontWeight: '950', color: '#6b7280' }}>#{idx + 1}</span>
                                <div style={{ fontWeight: '900', color: '#fff' }}>{row.nickname}</div>
                                <div style={{ fontWeight: '950', color: '#a855f7', textAlign: 'right' }}>{row.total_score.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

            </div>
        </div>
    );
}
