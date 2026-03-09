import React from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Swords, 
  Calendar,
  Trophy,
  Zap,
  Gamepad2,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

/**
 * GURU GPU UPGRADE ENGINE - V1.0 (SUPREME SEO)
 * Cesta: src/app/gpu-upgrade/[slug]/page.js
 * 🚀 SEO: Cílí na long-tail dotazy "upgrade from X to Y".
 * 🛡️ LOGIC: Dynamický výpočet výhodnosti (Worth It?) z performance_index.
 * 🛡️ DATA: JSON-LD FAQ Schema pro Rich Results v Google.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// --- HELPERS ---
function calculateUpgradeVerdict(oldGpu, newGpu) {
    if (!oldGpu?.performance_index || !newGpu?.performance_index) return { diff: 0, level: 'low' };
    const diff = Math.round((newGpu.performance_index / oldGpu.performance_index - 1) * 100);
    
    if (diff < 15) return { diff, level: 'low' };
    if (diff < 35) return { diff, level: 'mid' };
    return { diff, level: 'high' };
}

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

// 🛡️ GURU ENGINE: Vyhledávání karty z DB
const findGpu = async (slugPart) => {
  if (!supabaseUrl) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks) return null;
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

// 🚀 GURU ENGINE: Bleskové generování Programmatic SEO obsahu
async function generateAndPersistUpgrade(slug) {
  if (!supabaseUrl) return null;

  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.split('-to-');
    if (parts.length !== 2) return null;

    const [oldGpu, newGpu] = await Promise.all([
        findGpu(parts[0]),
        findGpu(parts[1])
    ]);

    if (!oldGpu || !newGpu) return null;

    const { diff, level } = calculateUpgradeVerdict(oldGpu, newGpu);
    
    const title_cs = `Upgrade z ${oldGpu.name} na ${newGpu.name} – Vyplatí se to?`;
    const title_en = `Upgrade from ${oldGpu.name} to ${newGpu.name} – Is it worth it?`;

    const content_en = `<h2>Should you upgrade?</h2><p>Upgrading from <strong>${oldGpu.name}</strong> to <strong>${newGpu.name}</strong> provides approximately <strong>${diff}% performance gain</strong> in games. Based on our analysis, this is considered a ${level === 'high' ? 'major performance leap' : level === 'mid' ? 'moderate upgrade' : 'minor improvement'}.</p>`;
    const content_cs = `<h2>Vyplatí se upgrade?</h2><p>Přechod z <strong>${oldGpu.name}</strong> na <strong>${newGpu.name}</strong> přináší přibližně <strong>${diff}% nárůst výkonu</strong> ve hrách. Naše analýza tento upgrade hodnotí jako ${level === 'high' ? 'masivní skok' : level === 'mid' ? 'znatelný posun' : 'minimální zlepšení'}.</p>`;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, old_gpu_id: oldGpu.id, new_gpu_id: newGpu.id,
        title_cs, title_en, content_cs, content_en, 
        seo_description_cs: `Detailní rozbor upgradu z ${oldGpu.name} na ${newGpu.name}. Nárůst FPS o ${diff}%.`,
        seo_description_en: `Detailed upgrade analysis from ${oldGpu.name} to ${newGpu.name}. ${diff}% FPS gain.`,
        created_at: new Date().toISOString()
    };

    const selectQuery = "*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))";
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
    });

    if (!dbRes.ok) {
        const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const data = await checkExisting.json();
        return data[0];
    }
    const inserted = await dbRes.json();
    return inserted[0];
  } catch (err) { return null; }
}

const getUpgradeData = async (slug) => {
  if (!supabaseUrl) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const orQuery = `slug.eq.${slug},slug.eq.${cleanSlug},slug_en.eq.${slug}`;
  const selectQuery = `*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))`;
  
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&or=(${encodeURIComponent(orQuery)})&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistUpgrade(slug);
      return data[0];
  } catch (e) { return null; }
};

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const data = await getUpgradeData(slug);
  if (!data) return { title: '404 | Hardware Guru' };
  
  const isEn = slug?.startsWith('en-');
  const { oldGpu, newGpu } = data;
  const { diff } = calculateUpgradeVerdict(oldGpu, newGpu);

  const title = isEn 
    ? `${oldGpu.name} → ${newGpu.name} Upgrade – ${diff}% Faster in Games` 
    : `${oldGpu.name} → ${newGpu.name} Upgrade – o ${diff} % výkonnější`;

  const desc = isEn 
    ? `Is upgrading from ${oldGpu.name} to ${newGpu.name} worth it? See performance gain, FPS difference and real gaming benchmarks.` 
    : `Vyplatí se upgrade z ${oldGpu.name} na ${newGpu.name}? Podívejte se na nárůst výkonu, rozdíl v FPS a reálné herní benchmarky.`;

  const canonicalPath = `/gpu-upgrade/${data.slug}`;
  const canonicalUrl = isEn ? `https://www.thehardwareguru.cz/en${canonicalPath}` : `https://www.thehardwareguru.cz${canonicalPath}`;

  return { 
    title: `${title} | The Hardware Guru`, 
    description: desc,
    alternates: { canonical: canonicalUrl }
  };
}

export default async function GpuUpgradeDetail({ params }) {
  const slug = params?.slug ?? null;
  const data = await getUpgradeData(slug);
  if (!data) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>STRÁNKA NENALEZENA</div>;

  const isEn = slug?.startsWith('en-');
  const { oldGpu, newGpu } = data;
  const { diff, level } = calculateUpgradeVerdict(oldGpu, newGpu);

  const getLevelColor = () => {
    if (level === 'high') return '#10b981'; // Zelená (Go!)
    if (level === 'mid') return '#eab308';  // Žlutá (Consider)
    return '#ef4444';                       // Červená (Wait)
  };

  // 🚀 SEO SCHEMATA (JSON-LD)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is it worth upgrading from ${oldGpu.name} to ${newGpu.name}?` : `Vyplatí se upgrade z ${oldGpu.name} na ${newGpu.name}?`,
        "acceptedAnswer": { 
          "@type": "Answer", 
          "text": isEn 
            ? `Yes, ${newGpu.name} is approximately ${diff}% faster than ${oldGpu.name}. ${level === 'high' ? 'This is a significant performance boost.' : 'This is a moderate improvement.'}`
            : `Ano, ${newGpu.name} je přibližně o ${diff} % výkonnější než ${oldGpu.name}. ${level === 'high' ? 'Jedná se o významný skok ve výkonu.' : 'Jde o znatelné, ale ne revoluční zlepšení.'}`
        }
      }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: getLevelColor(), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${getLevelColor()}40`, borderRadius: '50px', background: `${getLevelColor()}10` }}>
            <TrendingUp size={16} /> {isEn ? 'GURU UPGRADE ANALYSIS' : 'GURU ANALÝZA UPGRADU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {normalizeName(oldGpu.name)} <ArrowRight style={{ display: 'inline', margin: '0 15px' }} size={40} color={getLevelColor()} /> {normalizeName(newGpu.name)}
          </h1>
        </header>

        {/* 🚀 VERDICT BOX */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${getLevelColor()}40`, borderLeft: `8px solid ${getLevelColor()}`, borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
                    <div>
                        <h2 style={{ fontSize: '13px', fontWeight: '950', color: getLevelColor(), textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            {isEn ? 'UPGRADE VERDICT' : 'VERDIKT UPGRADU'}
                        </h2>
                        <div style={{ fontSize: '32px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic' }}>
                            {level === 'high' ? (isEn ? 'WORTH EVERY PENNY' : 'JASNÁ VOLBA') : 
                             level === 'mid' ? (isEn ? 'DECENT UPGRADE' : 'ZNATELNÝ POSUN') : 
                             (isEn ? 'NOT RECOMMENDED' : 'RADĚJI POČKEJTE')}
                        </div>
                    </div>
                    <div style={{ background: getLevelColor(), color: '#000', padding: '20px 40px', borderRadius: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '42px', fontWeight: '950' }}>+{diff}%</div>
                        <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? 'TOTAL GAIN' : 'CELKOVÝ NÁRŮST'}</div>
                    </div>
                </div>
            </div>
        </section>

        {/* CONTENT BOX */}
        <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style">
                <div className="guru-prose-style" dangerouslySetInnerHTML={{ __html: isEn ? data.content_en : data.content_cs }} />
            </div>
        </section>

        {/* SPECS COMPARISON */}
        <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2" style={{ borderLeft: `4px solid ${getLevelColor()}` }}>{isEn ? 'TECHNICAL ADVANTAGE' : 'TECHNICKÝ POSUN'}</h2>
            <div className="table-wrapper">
                {[
                    { label: 'VRAM', valA: `${oldGpu.vram_gb} GB`, valB: `${newGpu.vram_gb} GB` },
                    { label: 'ARCHITECTURE', valA: oldGpu.architecture, valB: newGpu.architecture },
                    { label: 'TDP', valA: `${oldGpu.tdp_w} W`, valB: `${newGpu.tdp_w} W` },
                ].map((row, i) => (
                    <div key={i} className="spec-row-style">
                        <div style={{ flex: 1, textAlign: 'right', color: '#9ca3af' }}>{row.valA}</div>
                        <div className="table-label">{row.label}</div>
                        <div style={{ flex: 1, textAlign: 'left', fontWeight: 'bold', color: getLevelColor() }}>{row.valB}</div>
                    </div>
                ))}
            </div>
        </section>

        {/* CTA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="deals-btn-style"><Flame size={20} /> {isEn ? 'BUY NEW GPU CHEAP' : 'KOUPIT NOVOU KARTU'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn-style"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .spec-row-style { display: flex; align-items: center; padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #4b5563; text-transform: uppercase; letter-spacing: 2px; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; padding-left: 15px; }
        .guru-prose-style { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose-style h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-top: 1.5em; margin-bottom: 0.8em; text-transform: uppercase; }
        .deals-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); }
        .support-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        @media (max-width: 768px) { .table-label { width: 100px; } .deals-btn-style, .support-btn-style { width: 100%; } }
      `}} />
    </div>
  );
}
