import React, { cache } from 'react';
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
  LayoutList,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ArrowUpCircle,
  Monitor,
  Crosshair
} from 'lucide-react';

/**
 * GURU GPU UPGRADE ENGINE - DETAIL V113.0 (SEO CLUSTER BOOST)
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    const diff = Math.round((b.performance_index / a.performance_index - 1) * 100);
    return { winner: b, loser: a, diff };
}

const findGpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;

  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  };

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${slugPart}&limit=1`, { headers });
      const data = await res.json();
      if (data?.length) return data[0];
  } catch(e){}

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${slugPart}*&order=slug.asc`, { headers });
      const data = await res.json();
      if (data?.length) return data[0];
  } catch(e){}

  try {
      const cleanString = slugPart.replace(/-/g, ' ');
      const tokens = cleanString.split(/\s+/);

      const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');

      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers });
      const data = await res.json();
      return data?.[0] || null;
  } catch(e){}

  return null;
};

const getSimilarUpgrades = async (gpuId, currentSlug) => {
    if (!supabaseUrl || !gpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=title_cs,title_en,slug,slug_en&or=(old_gpu_id.eq.${gpuId},new_gpu_id.eq.${gpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 }
        });
        return await res.json();
    } catch {
        return [];
    }
};

const getUpgradeData = cache(async (slug) => {

  const cleanSlug = slug.replace(/^en-/, '');

  const selectQuery = `*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))`;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      next: { revalidate: 86400 }
    }
  );

  const data = await res.json();
  return data[0] || null;
});

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

export default async function App({ params }) {

  const slug = params?.slug ?? null;

  const upgrade = await getUpgradeData(slug);

  if (!upgrade) {
    return (
      <div style={{color:'#f00',padding:'100px',textAlign:'center'}}>
        UPGRADE PATH NENALEZENA
      </div>
    )
  }

  const isEn = slug?.startsWith('en-');

  const { oldGpu: gpuA, newGpu: gpuB } = upgrade;

  const { diff } = calculatePerf(gpuA, gpuB);

  const similar = await getSimilarUpgrades(gpuA.id, upgrade.slug);

  return (
    <div style={{minHeight:'100vh',background:'#0a0b0d',paddingTop:'120px',paddingBottom:'100px',color:'#fff'}}>

      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'0 20px'}}>

        <header style={{textAlign:'center',marginBottom:'60px'}}>

          <h1 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:'900'}}>
            {gpuA.name} → {gpuB.name}
          </h1>

          <div style={{marginTop:'20px',fontSize:'20px',color:'#a855f7'}}>
            +{diff}% performance
          </div>

        </header>

        {/* 🚀 PROGRAMMATIC SEO UPGRADE LINKS */}

        <section style={{marginBottom:'60px'}}>

          <h2 style={{fontSize:'24px',fontWeight:'900',marginBottom:'20px',display:'flex',gap:'10px',alignItems:'center'}}>
            <ArrowUpCircle size={26}/> {isEn ? "More GPU Upgrade Paths" : "Další upgrade cesty"}
          </h2>

          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
            gap:'16px'
          }}>

            <a className="similar-link-card" href={`/gpu-upgrade/${slugify(gpuA.name)}-to-rtx-4070`}>
              {gpuA.name} → RTX 4070
            </a>

            <a className="similar-link-card" href={`/gpu-upgrade/${slugify(gpuA.name)}-to-rtx-4080`}>
              {gpuA.name} → RTX 4080
            </a>

            <a className="similar-link-card" href={`/gpu-upgrade/${slugify(gpuA.name)}-to-rx-7900-xt`}>
              {gpuA.name} → RX 7900 XT
            </a>

            <a className="similar-link-card" href={`/gpuvs/${slugify(gpuA.name)}-vs-${slugify(gpuB.name)}`}>
              {gpuA.name} vs {gpuB.name}
            </a>

          </div>

        </section>

        {similar.length > 0 && (
          <section>

            <h2 style={{fontSize:'22px',fontWeight:'900',marginBottom:'20px'}}>
              {isEn ? "Related Upgrades" : "Související upgrady"}
            </h2>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'14px'}}>

              {similar.map((s,i)=>(
                <a key={i}
                   href={isEn?`/en/gpu-upgrade/${s.slug_en}`:`/gpu-upgrade/${s.slug}`}
                   className="similar-link-card">
                   {isEn ? s.title_en : s.title_cs}
                </a>
              ))}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}
