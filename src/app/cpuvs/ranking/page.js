'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script'; 
import { 
  Trophy, Zap, Cpu, Monitor, ChevronRight, Gamepad2, AlertTriangle, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU CPU RANKING V2.6 (V10 HARD-LOCK UPDATE)
 * 🚀 CÍL: Fix Heureka linků na V10 Hard-Lock a zachování build stability.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const slugify = (text) => text?.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() || 'unknown';
const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export default function CpuRankingPage({ isEn = false }) {
  const pathname = usePathname() || '';
  const [cpus, setCpus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from('cpus')
          .select('*')
          .order('performance_index', { ascending: false, nullsFirst: false });
        setCpus(data || []);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  // 🔥 V10 HARD-LOCK REDIRECT LOGIC 🔥
  const handleHeurekaAction = (e, name, subId) => {
    e.preventDefault();
    const q = encodeURIComponent(name + ' cena');
    const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${q}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
    
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = { platform: 'heureka', category: 'cpu_ranking', sub_id: subId, page: pathname };
      navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
    }
    setTimeout(() => { window.location.href = targetUrl; }, 150);
  };

  if (loading) return null;
  if (!cpus.length) return <div style={{ color: '#fff', background: '#0a0b0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DATABASE ERROR</div>;

  return (
    <div className="guru-ranking-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="ranking-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '8px 25px', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '50px', background: 'rgba(245,158,11,0.1)', marginBottom: '20px' }}>
            <Trophy size={18} /> GURU RANKING SYSTEM
          </div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: 1.0 }}>
            {isEn ? 'CPU' : 'ŽEBŘÍČEK'} <span style={{ color: '#f59e0b', textShadow: '0 0 40px rgba(245, 158, 11, 0.4)' }}>{isEn ? 'TIER LIST' : 'PROCESORŮ'}</span>
          </h1>
          
          <div style={{ marginTop: '15px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
            {isEn ? '🔥 Best gaming processors (2026)' : '🔥 Nejlepší procesory (2026)'}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="quick-link-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', fontWeight: '950', fontSize: '11px', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid #06b6d4', color: '#06b6d4', background: 'rgba(255,255,255,0.02)' }}><Gamepad2 size={14} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="quick-link-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', fontWeight: '950', fontSize: '11px', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid #a855f7', color: '#a855f7', background: 'rgba(255,255,255,0.02)' }}><AlertTriangle size={14} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
          </div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <HeurekaButtons isEn={isEn} manualSearch="nejlepší procesory cena" />
        </div>

        <div className="ranking-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cpus.map((cpu, index) => {
            const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24';
            const safeSlug = cpu.slug || slugify(cpu.name);
            const isTop3 = index < 3;
            
            return (
              <React.Fragment key={cpu.id || index}>
                <div className="ranking-card-container" style={{ position: 'relative' }}>
                  {index === 0 && (
                    <div style={{ position: 'absolute', top: '-12px', right: '30px', background: '#f59e0b', color: '#000', padding: '4px 15px', borderRadius: '10px', fontSize: '11px', fontWeight: '950', zIndex: 10 }}>
                      🏆 BEST CPU
                    </div>
                  )}

                  <div className="ranking-card" style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 17, 21, 0.98)', padding: '25px 30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>
                      <div className="rank-num" style={{ width: '50px', fontSize: '24px', fontWeight: '950', color: isTop3 ? '#f59e0b' : '#4b5563' }}>{index + 1}.</div>
                      <div className="v-bar" style={{ width: '4px', height: '50px', borderRadius: '10px', marginRight: '25px', backgroundColor: vendorColor }}></div>
                      
                      <div style={{ flex: 1 }}>
                        <Link href={isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h2 style={{ fontSize: '1.4rem', fontWeight: '950', margin: 0, textTransform: 'uppercase' }}>{normalizeName(cpu.name)}</h2>
                        </Link>
                        
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {!isEn ? (
                            <button 
                              onClick={(e) => handleHeurekaAction(e, cpu.name, `v10-rank-${index + 1}`)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '12px', color: '#60a5fa', fontWeight: '900', textDecoration: 'underline' }}
                            >
                              🔥 Porovnat ceny →
                            </button>
                          ) : (
                            <a href={`https://www.amazon.com/s?k=${encodeURIComponent(cpu.name)}&tag=thehardware07-20`} target="_blank" rel="nofollow sponsored" style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '900', textDecoration: 'underline' }}>
                              🔥 Check Price →
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="score-box" style={{ textAlign: 'center', padding: '0 40px', borderLeft: '1px solid rgba(255,255,255,0.05)', margin: '0 15px' }}>
                        <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: '950', textTransform: 'uppercase' }}>PERF SCORE</div>
                        <div className="score-val" style={{ fontSize: '26px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '8px', color: isTop3 ? '#f59e0b' : '#fff' }}>
                          <Zap size={18} fill={isTop3 ? '#f59e0b' : 'none'} /> {cpu.performance_index || '0'}
                        </div>
                      </div>
                      <ChevronRight size={20} style={{ color: '#4b5563' }} />
                  </div>
                </div>

                {index === 4 && (
                  <div style={{ margin: '15px 0', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <a
            href={isEn ? "https://www.amazon.com/s?k=gaming+processor&tag=thehardware07-20" : "https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=procesor+cena&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-rank-footer"}
            target="_blank"
            rel="nofollow sponsored"
            className="guru-buy-winner-btn"
            style={{ padding: '18px 40px', borderRadius: '18px', textDecoration: 'none', fontWeight: '950', fontSize: '16px', textTransform: 'uppercase', transition: '0.3s', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '10px', background: !isEn ? 'linear-gradient(135deg, #3b82f6 0%, #0078d4 100%)' : '#f59e0b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          >
            <ShoppingCart size={20} /> {isEn ? '💰 Best Processor Deals' : '💰 Zobrazit ceny procesorů'}
          </a>
        </div>
      </main>
    </div>
  );
}
