import React from 'react';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2, ArrowUpCircle, ShoppingCart
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V17.0 (FINAL CZECH & STABILITY FIX)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🛡️ FIX 1: Odstraněna slovenština (NENÁJDENÝ -> NENALEZEN, PRE ZOSTAVU -> PRO SESTAVU).
 * 🛡️ FIX 2: Přidána sekce "CHCETE VYŠŠÍ VÝKON?" pro recirkulaci uživatelů (+zisk z reklam).
 * 🛡️ FIX 3: Přidána sekce "GURU RÁDCE" pro propojení s Evergreen články v DB.
 * 🛡️ FIX 4: Integrace AdSense ID ca-pub-5468223287024993.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');

// 🛡️ GURU ENGINE: 3-TIER BULLETPROOF LOOKUP
const findHw = async (table, slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      // TIER 1: Přesný match na slug
      const url1 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      // TIER 2: Substring match
      const url2 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=ilike.*${slugPart}*&limit=1`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }

      // TIER 3: Tokenizované hledání v názvu (Nejsilnější fallback)
      const clean = slugPart.replace(/-/g, ' ').replace(/ryzen|core|intel|amd|geforce|rtx|radeon|rx/gi, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&and=(${conditions})&limit=1`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); if (data3?.length) return data3[0]; }
      }
  } catch(e) { console.error("Database Lookup Error", e); }
  return null;
};

const getAnalysisData = async (slug) => {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] || null;
  const gameParts = resParts[0].split('-in-');
  const gameSlug = gameParts[1] || null;
  const hwParts = gameParts[0].split('-with-');
  if (hwParts.length !== 2) return null;
  const [cpu, gpu] = await Promise.all([findHw('cpus', hwParts[0]), findHw('gpus', hwParts[1])]);
  return { cpu, gpu, gameSlug, resolution };
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Analýza | Hardware Guru' };
  
  const title = isEn 
    ? `${data.cpu.name} + ${data.gpu.name} Bottleneck & FPS Analysis`
    : `${data.cpu.name} + ${data.gpu.name} – Analýza Bottlenecku a FPS`;

  return { 
    title: `${title} | Hardware Guru`,
    alternates: {
        canonical: `https://thehardwareguru.cz/bottleneck/${rawSlug.replace(/^en-/, '')}`,
        languages: { 
            'en': `https://thehardwareguru.cz/en/bottleneck/${rawSlug.replace(/^en-/, '')}`,
            'cs': `https://thehardwareguru.cz/bottleneck/${rawSlug.replace(/^en-/, '')}`
        }
    }
  };
}

export default async function BottleneckPage({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);

  if (!data?.cpu || !data?.gpu) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
            <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontWeight: '950' }}>{isEn ? 'COMPONENT NOT FOUND' : 'KOMPONENT NENALEZEN'}</h2>
            <p style={{ color: '#6b7280', marginTop: '10px' }}>{isEn ? 'System could not identify the hardware. Check URL.' : 'Systém nedokázal identifikovat zadaný hardware. Zkontrolujte prosím URL.'}</p>
            <a href="/" style={{ marginTop: '20px', display: 'inline-block', padding: '12px 25px', background: '#f59e0b', color: '#000', borderRadius: '12px', fontWeight: '950', textDecoration: 'none' }}>{isEn ? 'BACK HOME' : 'ZPĚT NA ÚVOD'}</a>
        </div>
    </div>
  );

  const { cpu, gpu, gameSlug, resolution } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  let bottleneckScore = cpuPower < gpuPower * 0.75 
    ? Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100)
    : (gpuPower < cpuPower * 0.6 ? Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100) : 0);

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');

  // Logika pro recirkulaci (Upgrade návrhy)
  const betterCpuSlug = isEn ? `en-core-i7-14700k-with-${gpu.slug}` : `core-i7-14700k-with-${gpu.slug}`;
  const betterGpuSlug = isEn ? `en-${cpu.slug}-with-geforce-rtx-5080` : `${cpu.slug}-with-geforce-rtx-5080`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous"></script>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="radar-badge">
            <Gauge size={16} /> GURU BOTTLENECK RADAR
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>
            <span style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.3, fontSize: '0.4em', display: 'block', margin: '10px 0' }}>WITH</span>
            <span style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        {/* 📊 HLAVNÍ VÝSLEDEK */}
        <section style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${statusColor}40`, borderRadius: '30px', padding: '60px 40px', textAlign: 'center', marginBottom: '60px', boxShadow: `0 30px 100px ${statusColor}15` }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'System Bottleneck' : 'Bottleneck systému'}</div>
            <div style={{ fontSize: 'clamp(80px, 15vw, 130px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '10px 0' }}>{bottleneckScore}%</div>
            <div className="status-pill" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                {bottleneckScore < 15 ? (isEn ? 'IDEAL MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
            </div>
        </section>

        {/* 🚀 DOPORUČENÍ PRO SESTAVU (Opravená čeština) */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #66fcf1' }}>
            {isEn ? 'SYSTEM RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             <div className="spec-card-box">
                <PlugZap size={24} color="#f97316" />
                <div className="card-label">PSU (ZDROJ)</div>
                <div className="card-val">{gpu.tdp_w > 300 ? '850W+' : (gpu.tdp_w > 200 ? '750W' : '650W')}</div>
             </div>
             <div className="spec-card-box">
                <Layers size={24} color="#10b981" />
                <div className="card-label">CHIPSET</div>
                <div className="card-val">{cpu.vendor === 'AMD' ? 'B650 / X670' : 'B760 / Z790'}</div>
             </div>
             <div className="spec-card-box">
                <Database size={24} color="#a855f7" />
                <div className="card-label">RAM</div>
                <div className="card-val">{cpu.name.includes('5000') ? 'DDR4 3600 MT/s' : '32GB DDR5 6000MT/s'}</div>
             </div>
          </div>
        </section>

        {/* 🚀 RECIRKULACE: CHCETE VYŠŠÍ VÝKON? */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #f59e0b' }}>
            {isEn ? 'WANT BETTER PERFORMANCE?' : 'CHCETE VYŠŠÍ VÝKON?'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <a href={`/bottleneck/${betterCpuSlug}`} className="recirc-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-circle"><Cpu size={24} /></div>
                    <div>
                        <div className="card-label-small">{isEn ? 'UPGRADE CPU' : 'LEPŠÍ PROCESOR'}</div>
                        <div className="card-title">Srovnat s i7-14700K</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
              </a>
              <a href={`/bottleneck/${betterGpuSlug}`} className="recirc-card" style={{ borderLeftColor: '#76b900' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-circle" style={{ background: '#76b90020', color: '#76b900' }}><Zap size={24} /></div>
                    <div>
                        <div className="card-label-small">{isEn ? 'UPGRADE GPU' : 'LEPŠÍ GRAFIKA'}</div>
                        <div className="card-title">Srovnat s RTX 5080</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
              </a>
          </div>
        </section>

        {/* 📚 EVERGREEN: GURU RÁDCE */}
        <section style={{ marginBottom: '60px' }}>
           <h2 className="section-h2" style={{ borderLeft: '4px solid #a855f7' }}>
              {isEn ? 'GURU MASTERCLASS' : 'GURU RÁDCE'}
           </h2>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                <a href="/clanky/jak-vyresit-bottleneck-navod" className="article-link-card">
                    <Info size={18} /> {isEn ? 'How to fix bottleneck' : 'Jak vyřešit bottleneck'}
                </a>
                <a href="/clanky/nejlepsi-cpu-pro-rtx-5090-5080" className="article-link-card">
                    <BarChart3 size={18} /> {isEn ? 'Best CPU for RTX 50' : 'Nejlepší CPU pro RTX 50'}
                </a>
                <a href="/clanky/jak-usetrit-na-hardwaru-navod" className="article-link-card">
                    <Flame size={18} /> {isEn ? 'Save on Hardware' : 'Jak ušetřit na HW'}
                </a>
           </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '60px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="live-btn"><Flame size={20} /> SLEDOVAT LIVE</a>
            <a href="/support" className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .status-pill { padding: 12px 35px; borderRadius: 50px; display: inline-block; fontWeight: 950; fontSize: 14px; text-transform: uppercase; border-radius: 50px; }
        .section-h2 { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; padding-left: 15px; }
        
        .spec-card-box { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .card-label { font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin: 10px 0 5px; }
        .card-val { font-size: 18px; font-weight: 950; color: #fff; }

        .recirc-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.95); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); border-left: 5px solid #f59e0b; text-decoration: none; color: #fff; transition: 0.3s; }
        .recirc-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
        .icon-circle { width: 50px; height: 50px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; }
        .card-label-small { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .card-title { font-size: 17px; font-weight: 950; margin-top: 2px; }
        
        .article-link-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); padding: 18px 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.2s; }
        .article-link-card:hover { background: rgba(168, 85, 247, 0.1); color: #fff; border-color: rgba(168, 85, 247, 0.3); transform: translateX(5px); }
        
        .support-btn, .live-btn { display: flex; align-items: center; gap: 12px; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .support-btn { background: #eab308; color: #000; }
        .live-btn { background: #000; color: #00ec64; border: 1px solid #00ec64; }
        .support-btn:hover, .live-btn:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      `}} />
    </div>
  );
}
