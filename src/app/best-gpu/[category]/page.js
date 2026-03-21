import { createClient } from '@supabase/supabase-js';
import React from 'react';

/**
 * GURU BEST GPU ENGINE V1.1 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Monetizace nákupních kategorií grafik skrze A-ADS.
 */

export const revalidate = 86400;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const normalizeName = (name = '') =>
  name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

export async function generateMetadata({ params }) {
  const p = await params;
  const category = p.category;
  return {
    title: `Best GPU for ${category.replace('-', ' ')} | The Hardware Guru`,
    description: `Top graphics cards for ${category.replace('-', ' ')} gaming performance.`,
    alternates: {
      canonical: `https://thehardwareguru.cz/best-gpu/${category}`
    }
  };
}

export default async function BestGpuPage({ params }) {
  const p = await params;
  const category = p.category;

  const { data: gpus } = await supabase
    .from('gpus')
    .select('*')
    .order('performance_index', { ascending: false })
    .limit(20);

  if (!gpus) return null;

  return (
    <div style={{ minHeight:'100vh', background:'#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop:'120px', paddingBottom:'100px', color:'#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth:'1000px', margin:'0 auto', padding:'0 20px' }}>
        <header style={{ textAlign:'center', marginBottom:'40px' }}>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:'900', textTransform:'uppercase', margin: 0 }}>
            Best GPU for {category.replace('-', ' ')}
          </h1>
          <p style={{ color:'#9ca3af', marginTop:'20px', fontSize: '1.1rem' }}>
            Ranked graphics cards based on gaming performance and value.
          </p>
        </header>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD HLAVIČKOU */}
        <div className="guru-best-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <section>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'25px' }}>
            {gpus.map((gpu, i) => {
              const name = normalizeName(gpu.name);
              return (
                <React.Fragment key={gpu.slug}>
                  <a href={`/gpu/${gpu.slug}`} className="best-gpu-card">
                    <div style={{ fontSize:'12px', color:'#9ca3af', fontWeight: '900', marginBottom: '10px' }}>#{i+1}</div>
                    <h3 style={{ fontSize:'18px', fontWeight:'900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{name}</h3>
                    <div style={{ color:'#66fcf1', fontSize:'13px', fontWeight: 'bold' }}>Performance index: {gpu.performance_index}</div>
                  </a>

                  {/* 🔥 ADS SLOT #2: GRID INJECTION (PO 4. KARTĚ) */}
                  {i === 3 && (
                    <div className="guru-best-ad-slot grid-span-ad">
                      <span className="ad-label">Sponsored Hardware Recommendation</span>
                      <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                      <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .best-gpu-card { 
            display: block; 
            text-decoration: none; 
            color: inherit; 
            background: rgba(17, 19, 24, 0.9); 
            border: 1px solid rgba(255, 255, 255, 0.05); 
            padding: 30px; 
            border-radius: 20px; 
            transition: 0.3s; 
            border-top: 3px solid #333;
        }
        .best-gpu-card:hover { transform: translateY(-5px); border-color: #66fcf1; background: rgba(255, 255, 255, 0.02); }
        
        .guru-best-ad-slot { margin: 30px 0; padding: 15px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }
        
        @media (min-width: 768px) { .grid-span-ad { grid-column: 1 / -1; } }
        @media (max-width: 768px) {
            .ad-desktop { display: none; } .ad-mobile { display: block; }
            .best-gpu-card { padding: 20px; }
        }
      `}} />
    </div>
  );
}
