import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, Share2, Activity, Cpu, Zap, ShoppingCart, Search, Crosshair, Swords, BookOpen, ArrowRight } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Nyní dynamicky generujeme ty nejkrásnější SEO metadata z URL slugu!
export async function generateMetadata({ params }) {
    const { data } = await supabase.from('guru_benchmarks').select('*').eq('slug', params.slug).single();
    if (!data) return { title: 'Výsledek nebyl nalezen | The Hardware Guru' };
    
    return {
        title: `${data.nickname} dosáhl skóre ${data.total_score.toLocaleString()}! | GURU Benchmark`,
        description: `Podívej se na výsledek zátěžového testu hráče ${data.nickname}. CPU: ${data.cpu_name}, GPU: ${data.gpu_name}. Otestuj svůj PC i ty!`,
        openGraph: {
            title: `Skóre ${data.total_score.toLocaleString()} - ${data.nickname} | GURU Benchmark`,
            description: `Porazíš tuto sestavu? CPU: ${data.cpu_name} | GPU: ${data.gpu_name}`,
            type: 'website'
        }
    };
}

export default async function ResultPageCZ({ params }) {
    // Hledáme v databázi podle nového sloupce "slug"
    const { data: result } = await supabase.from('guru_benchmarks').select('*').eq('slug', params.slug).single();

    if (!result) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '100px 20px' }}><h1>Výsledek nenalezen!</h1></div>;
    }

    // Inteligentní GURU Zhodnocení
    const isCpuBottleneck = result.cpu_score < (result.gpu_score * 0.4);
    const isGpuBottleneck = result.gpu_score < (result.cpu_score * 0.4);
    
    let evaluationText = "Tvoje sestava je skvěle vyvážená! Není potřeba akutní upgrade.";
    let evaluationColor = "#3b82f6";

    if (isCpuBottleneck) {
        evaluationText = "⚠️ MASIVNÍ BOTTLENECK! Tvůj procesor krutě brzdí tvou grafickou kartu. Přicházíš o FPS!";
        evaluationColor = "#ff0055";
    } else if (isGpuBottleneck) {
        evaluationText = "⚠️ GPU BOTTLENECK! Tvůj procesor se nudí, protože grafická karta nestíhá.";
        evaluationColor = "#f59e0b";
    }

    return (
        <div style={{ background: '#0a0b0d', color: '#fff', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}><Trophy style={{display:'inline'}}/> Oficiální Výsledek</div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
                        {result.nickname}
                    </h1>
                </div>

                <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '18px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Celkové GURU Skóre</div>
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.5)', margin: '10px 0', lineHeight: '1' }}>
                        {result.total_score.toLocaleString()}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
                        <div style={{ background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.2)', padding: '20px', borderRadius: '16px' }}>
                            <Cpu size={24} color="#ff0055" style={{margin:'0 auto 10px'}} />
                            <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>CPU Skóre</div>
                            <div style={{ fontSize: '24px', fontWeight: '950', color: '#ff0055' }}>{result.cpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '14px', color: '#fff', marginTop: '10px', fontWeight: 'bold' }}>{result.cpu_name}</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '20px', borderRadius: '16px' }}>
                            <Zap size={24} color="#10b981" style={{margin:'0 auto 10px'}} />
                            <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>GPU Skóre</div>
                            <div style={{ fontSize: '24px', fontWeight: '950', color: '#10b981' }}>{result.gpu_score.toLocaleString()}</div>
                            <div style={{ fontSize: '14px', color: '#fff', marginTop: '10px', fontWeight: 'bold' }}>{result.gpu_name}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${evaluationColor}`, borderRadius: '16px', padding: '30px', textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '950', color: evaluationColor, marginBottom: '15px' }}>{evaluationText}</h2>
                    
                    {isCpuBottleneck && (
                        <div>
                            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Zahoď ten starý křemík. Pořiď si moderní procesor, který tvoji grafiku konečně nakrmí daty.</p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <a href="https://www.heureka.cz/?h[fraze]=herni+procesor" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f97316', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                                    <Search size={18} /> Najít CPU na Heurece
                                </a>
                            </div>
                        </div>
                    )}

                    {isGpuBottleneck && (
                        <div>
                            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Tvoje grafika je brzda. Pro plynulé hraní bez sekání potřebuješ novou GPU.</p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <a href="https://www.heureka.cz/?h[fraze]=graficka+karta" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f97316', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                                    <Search size={18} /> Najít GPU na Heurece
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <p style={{ color: '#9ca3af', marginBottom: '15px' }}>Pošli tento odkaz kámošům a ukaž jim, kdo je tady pánem.</p>
                    <input type="text" readOnly value={`https://thehardwareguru.cz/benchmark/result/${result.slug}`} style={{ width: '100%', maxWidth: '700px', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: '#000', color: '#fff', textAlign: 'center', fontSize: '16px', marginBottom: '20px' }} onClick={(e) => { e.target.select(); navigator.clipboard.writeText(e.target.value); alert('Zkopírováno!'); }} />
                    <br/>
                    <Link href="/benchmark" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#a855f7', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', fontSize: '16px' }}>
                        <Play size={18} /> Otestovat svůj PC
                    </Link>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '950', color: '#fff', marginBottom: '20px', textAlign: 'center', textTransform: 'uppercase' }}>Další GURU Nástroje</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        <Link href="/bottleneck-calculator" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' }}><Activity size={14} /> Bottleneck Kalkulačka</Link>
                        <Link href="/cpu-index" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' }}><Swords size={14} /> CPU Duely</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
