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
  ExternalLink
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - DETAIL V90.0 (SEO BOOST)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🚀 Přidán programmatic SEO linking pro GPU vs stránky
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/graphics|gpu/gi, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

function calculatePerf(a, b) {
  if (!a?.performance_index || !b?.performance_index) {
    return { winner: null, loser: null, diff: 0 };
  }

  if (a.performance_index > b.performance_index) {
    return {
      winner: a,
      loser: b,
      diff: Math.round((a.performance_index / b.performance_index - 1) * 100)
    };
  }

  if (b.performance_index > a.performance_index) {
    return {
      winner: b,
      loser: a,
      diff: Math.round((b.performance_index / a.performance_index - 1) * 100)
    };
  }

  return { winner: null, loser: null, diff: 0 };
}

const findGpu = async (slugPart) => {
  if (!supabaseUrl) return null;

  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks) return null;

  const searchPattern = `%${chunks.join('%')}%`;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/gpus?select=*&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    }
  );

  const data = await res.json();
  return data[0] || null;
};

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl) return null;

  const cleanSlug = slug.replace(/^en-/, '');

  const res = await fetch(
    `${supabaseUrl}/rest/v1/gpu_duels?select=*,gpuA:gpus!gpu_a_id(*),gpuB:gpus!gpu_b_id(*)&slug=eq.${cleanSlug}&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    }
  );

  const data = await res.json();
  return data[0] || null;
});

export default async function GpuDuelDetail({ params }) {

  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);

  if (!duel) {
    return <div style={{ padding: 100 }}>DUEL NOT FOUND</div>;
  }

  const isEn = slug?.startsWith('en-');

  const { gpuA, gpuB } = duel;

  const { winner, loser, diff } = calculatePerf(gpuA, gpuB);

  const normalizeName = (name='') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi,'');

  return (
    <div style={{ minHeight:'100vh', background:'#0a0b0d', paddingTop:'120px', paddingBottom:'100px', color:'#fff' }}>
      
      <main style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 20px' }}>

        <header style={{ textAlign:'center', marginBottom:'50px' }}>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:'900' }}>
            {gpuA.name} <span style={{ color:'#ff0055' }}>vs</span> {gpuB.name}
          </h1>

          {winner && (
            <div style={{ marginTop:'20px', fontSize:'20px', color:'#66fcf1' }}>
              {winner.name} {isEn ? 'is about' : 'je přibližně'} <b>{diff}%</b> {isEn ? 'faster' : 'rychlejší'}
            </div>
          )}
        </header>

        {/* 🚀 PROGRAMMATIC GPU DUELS */}
        <section style={{ marginBottom:'60px' }}>

          <h2 style={{ fontSize:'26px', fontWeight:'900', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
            <Swords size={26}/> {isEn ? 'Popular GPU Comparisons' : 'Populární srovnání GPU'}
          </h2>

          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
            gap:'15px'
          }}>

            <a href={`/gpuvs/${slugify(gpuA.name)}-vs-${slugify(gpuB.name)}`} className="similar-link-card">
              {gpuA.name} vs {gpuB.name}
            </a>

            <a href={`/gpuvs/${slugify(gpuA.name)}-vs-rtx-4090`} className="similar-link-card">
              {gpuA.name} vs RTX 4090
            </a>

            <a href={`/gpuvs/${slugify(gpuB.name)}-vs-rtx-4080`} className="similar-link-card">
              {gpuB.name} vs RTX 4080
            </a>

            <a href={`/gpuvs/${slugify(gpuA.name)}-vs-rx-7900-xt`} className="similar-link-card">
              {gpuA.name} vs RX 7900 XT
            </a>

          </div>

        </section>

      </main>
    </div>
  );
}
