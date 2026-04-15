import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, Cpu, Zap, Twitter, Facebook, Layers, Gamepad2, Share2, ArrowRight, Activity, BookOpen, Swords, ShieldCheck } from 'lucide-react';
import SeznamAd from '../../../../components/SeznamAd';
import HeurekaButtons from '../../../../components/HeurekaButtons';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Ikona Reddit ze tvého kódu
const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" /></svg>
);

export async function generateMetadata({ params }) {
    const p = await params;
    const { data } = await supabase.from('guru_benchmarks').select('*').eq('slug', p.slug).single();
    if (!data) return { title: 'Výsledek nenalezen | Hardware Guru' };
    return { 
        title: `${data.nickname} dosáhl skóre ${data.total_score.toLocaleString()}! | GURU Benchmark`,
        description: `Podívej se na brutální výkon sestavy s ${data.cpu_name} a ${data.gpu_name}. Otestuj svůj PC i ty na The Hardware Guru!`
    };
}

export default async function ResultPage({ params }) {
    const p = await params;
    const { data: result } = await supabase.from('guru_benchmarks').select('*').eq('slug', p.slug).single();
    const { data: topList } = await supabase.from('guru_benchmarks').select('nickname, total_score, cpu_name, gpu_name').order('total_score', { ascending: false }).limit(10);

    if (!result) {
        return (
            <div style={{ background: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.8)', padding: '40px', borderRadius: '24px', border: '1px solid #ff0055' }}>
                    <h1 style={{ fontWeight: '950' }}>VÝSLEDEK NENALEZEN</h1>
                    <Link href="/benchmark" style={{ color: '#ff0055', fontWeight: 'bold', marginTop: '20px', display: 'block' }}>Zpět na test</Link>
                </div>
            </div>
        );
    }

    const isCpuBottleneck = result.cpu_score < (result.gpu_score * 0.45);
    const isGpuBottleneck = result.gpu_score < (result.cpu_score * 0.45);
    
    let evalTitle = "Sestava je skvěle vyvážená!";
    let evalDesc = "Tvoje CPU a GPU tvoří perfektní tandem. Nemáš žádné výrazné úzké hrdlo a ze svého hardwaru ždímáš maximum.";
    let evalColor = "#10b981";

    if (isCpuBottleneck) {
        evalTitle = "⚠️ MASIVNÍ CPU BOTTLENECK!";
        evalDesc = "Tvůj procesor krutě brzdí grafickou kartu. Přicházíš o drahocenné FPS, protože grafika musí čekat na data z CPU. Je čas na upgrade procesoru!";
        evalColor = "#ff0055";
    } else if (isGpuBottleneck) {
        evalTitle = "⚠️ MASIVNÍ GPU BOTTLENECK!";
        evalDesc = "Tvoje grafika nestíhá výkon procesoru. Máš prostor pro mnohem silnější grafickou kartu, aniž bys musel měnit zbytek PC.";
        evalColor = "#f59e0b";
    }

    const shareUrl = `https://thehardwareguru.cz/benchmark/result/${result.slug}`;

    return (
        <div style={{ background: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', minHeight: '100vh', padding: '120px 20px 60px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* REKLAMA TOP (SeznamAd) */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}><Trophy size={18} style={{display:'inline', verticalAlign:'middle', marginRight:'10px'}}/> OFICIÁLNÍ GURU VÝSLEDEK</div>
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '0.9', textShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}>{result.nickname}</h1>
                    
                    {/* SDÍLENÍ POD NADPISEM - KOMPLETNÍ VČETNĚ X */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" style={{ background: '#1877f2', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', transition: '0.3s' }} className="hover:scale-110"><Facebook fill="#fff" stroke="none" /></a>
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" style={{ background: '#000', border:'1px solid #333', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', transition: '0.3s' }} className="hover:scale-110"><Twitter fill="#fff" stroke="none" /></a>
                        <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`} target="_blank" style={{ background: '#ff4500', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', transition: '0.3s' }} className="hover:scale-110"><RedditIcon size={28} /></a>
                    </div>
                </div>

                {/* KARTA S HLAVNÍM SKÓRE */}
                <div style={{ background: 'rgba(15, 17, 21, 0.9)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '30px', padding: '60px 40px', textAlign: 'center', marginBottom: '40px', backdropFilter: 'blur(15px)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
                    <div style={{ fontSize: '20px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px' }}>Celkové GURU Skóre</div>
                    <div style={{ fontSize: 'clamp(5rem, 15vw, 10rem)', fontWeight: '950', color: '#fff', margin: '10px 0', lineHeight: '1', textShadow: '0 0 50px rgba(168, 85, 247, 0.6)' }}>
                        {result.total_score.toLocaleString()}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginTop: '50px' }}>
                        <div style={{ background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.2)', padding: '35px', borderRadius: '24px', transition: '0.3s' }} className="hover:border-[#ff0055]">
                            <Cpu size={40} color="#ff0055" style={{margin:'0 auto 20px'}} />
                            <div style={{ color: '#ff0055', fontSize: '36px', fontWeight: '950' }}>{result.cpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '10px' }}>{result.cpu_name}</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '35px', borderRadius: '24px', transition: '0.3s' }} className="hover:border-[#10b981]">
                            <Zap size={40} color="#10b981" style={{margin:'0 auto 20px'}} />
                            <div style={{ color: '#10b981', fontSize: '36px', fontWeight: '950' }}>{result.gpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '10px' }}>{result.gpu_name}</div>
                        </div>
                    </div>
                </div>

                {/* AGRESIVNÍ EVALUACE S PROLINKOVÁNÍM */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: `2px solid ${evalColor}`, borderRadius: '24px', padding: '50px 40px', textAlign: 'center', marginBottom: '40px', boxShadow: `0 0 40px ${evalColor}22`, backdropFilter: 'blur(10px)' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '950', color: evalColor, marginBottom: '20px', textTransform: 'uppercase' }}>{evalTitle}</h2>
                    <p style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '35px', lineHeight: '1.7', maxWidth: '800px', margin: '0 auto 35px' }}>{evalDesc}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <Link href="/bottleneck-kalkulacka" style={{ padding: '18px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', textDecoration: 'none', fontWeight: '900', textTransform: 'uppercase', transition: '0.3s' }} className="hover:bg-[#38bdf8] hover:text-black">Vše o Bottlenecku →</Link>
                        <Link href="/clanky" style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid #fff', textDecoration: 'none', fontWeight: '900', textTransform: 'uppercase', transition: '0.3s' }} className="hover:bg-white hover:text-black">Tipy na optimalizaci →</Link>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
                        <p style={{ color: '#9ca3af', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Doporučený upgrade pro tvůj PC:</p>
                        <HeurekaButtons isEn={false} />
                    </div>
                </div>

                {/* SÍŇ SLÁVY - TOP 10 */}
                <div style={{ background: 'rgba(15, 17, 21, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', padding: '50px 40px', marginBottom: '40px', backdropFilter: 'blur(10px)' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '950', color: '#fff', marginBottom: '40px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <Trophy size={36} color="#f59e0b" /> GURU TOP 10 SÍŇ SLÁVY
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topList.map((row, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 150px', alignItems: 'center', padding: '20px 30px', background: row.nickname === result.nickname ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)', borderRadius: '16px', border: row.nickname === result.nickname ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
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

                {/* REKLAMA IN-TEXT (SeznamAd) */}
                <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

                {/* DALŠÍ PROLINKOVÁNÍ */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '60px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#fff', marginBottom: '35px', textTransform: 'uppercase' }}>PROZKOUMEJ CELÝ GURU EKOSYSTÉM</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        <Link href="/cpuvs" style={{ padding: '14px 28px', borderRadius: '12px', fontWeight: '900', background: 'rgba(102, 252, 241, 0.05)', color: '#66fcf1', border: '1px solid #66fcf1', textDecoration: 'none' }}>SOUBOJE CPU</Link>
                        <Link href="/gpuvs" style={{ padding: '14px 28px', borderRadius: '12px', fontWeight: '900', background: 'rgba(255, 0, 85, 0.05)', color: '#ff0055', border: '1px solid #ff0055', textDecoration: 'none' }}>SOUBOJE GPU</Link>
                        <Link href="/benchmark" style={{ padding: '14px 28px', borderRadius: '12px', fontWeight: '900', background: '#ff0055', color: '#fff', textDecoration: 'none' }}>ZKUSIT TEST ZNOVU</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
