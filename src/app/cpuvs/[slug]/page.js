import React from 'react';
import Script from 'next/script'; 
import { notFound } from 'next/navigation';
import { 
 ChevronLeft, Activity, Swords, CheckCircle2, Database, ArrowRight, Gamepad2, AlertTriangle, ShoppingCart, Trophy, Zap, LayoutList
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import GuruCpuCompareText from '../../../components/GuruCpuCompareText';
import GuruInContentOffer from '../../../components/GuruInContentOffer';

export const runtime = "nodejs";
export const revalidate = 3600; 

const AMAZON_TAG = "thehardware07-20";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const findCpuBySlug = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${slugPart.replace(/^en-/, '')}&limit=1`, { 
        headers: authHeaders, 
        next: { revalidate: 3600 } 
      });
      if (res.ok) { 
          const data = await res.json(); 
          if (data?.length) return data[0]; 
      }
  } catch(e) {}
  return null;
};

const getCompareData = async (slug) => {
  if (!slug) return null;
  const parts = slug.replace(/^en-/, '').split('-vs-');
  if (parts.length !== 2) return null;
  const [cpuA, cpuB] = await Promise.all([findCpuBySlug(parts[0]), findCpuBySlug(parts[1])]);
  return { cpuA, cpuB };
};

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = params;
  const data = await getCompareData(rawSlug);
  if (!data?.cpuA || !data?.cpuB) return { title: 'Comparison | Hardware Guru' };
  const isEn = rawSlug.startsWith('en-');
  return {
    title: isEn 
      ? `${data.cpuA.name} vs ${data.cpuB.name} - Price & Gaming Performance (2026)`
      : `${data.cpuA.name} vs ${data.cpuB.name} - Srovnání, výkon a cena (2026)`,
    alternates: { canonical: `${baseUrl}/cpuvs/${rawSlug}` }
  };
}

export default async function CpuComparePage({ params }) {
  const { slug: rawSlug } = params;
  const isEn = rawSlug.startsWith('en-');
  const data = await getCompareData(rawSlug);

  if (!data?.cpuA || !data?.cpuB) return notFound();

  const { cpuA, cpuB } = data;

  const winnerCpu = cpuA.performance_index >= cpuB.performance_index ? cpuA : cpuB;
  const loserCpu = cpuA.performance_index >= cpuB.performance_index ? cpuB : cpuA;
  const perfDiff = Math.round((winnerCpu.performance_index / loserCpu.performance_index - 1) * 100);
  const winnerBrand = normalizeName(winnerCpu.name).trim();
  
  // 🔥 INTELIGENTNÍ DOPORUČENÍ - VŽDY SILNĚJŠÍ CESTA 🔥
  const isWinnerUltimate = winnerCpu.name.includes('9800X3D') || winnerCpu.name.includes('9950X');
  const upgradeProduct = isWinnerUltimate ? "ASUS ROG CROSSHAIR X870E" : "AMD Ryzen 7 9800X3D";
  const upgradeCategory = isWinnerUltimate ? "mb" : "cpu";

  // 🔥 AFFILIATE LINKY PRO EXISTUJÍCÍ TLAČÍTKA (V10 GOLDEN OPRAVA FRAGMENTU) 🔥
  const getHeurekaUrl = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name + ' procesor')}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=cpuvs-direct`;
  const getAmazonUrl = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${AMAZON_TAG}&ascsubtag=cpuvs-direct`;

  const finalWinnerLink = isEn ? getAmazonUrl(winnerCpu.name) : getHeurekaUrl(winnerCpu.name);
  
  const ctaText = isEn 
    ? (perfDiff > 20 ? `🔥 Upgrade to ${winnerBrand} (+${perfDiff}%)` : `🔥 Best price for ${winnerBrand}`)
    : (perfDiff > 20 ? `🔥 Upgrade na ${winnerBrand} (+${perfDiff}%)` : `🔥 Výhodná koupě ${winnerBrand}`);

  return (
    <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#f59e0b', padding: '10px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(245, 158, 11, 0.3)' }}><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
        </div>

        <SeznamAd zoneId={408654} width={970} height={210} />

        <header style={{ textAlign: 'center', margin: '50px 0' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
            {normalizeName(cpuA.name)} <span style={{color: '#f59e0b'}}>VS</span> {normalizeName(cpuB.name)}
          </h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${winnerCpu.id === cpuA.id ? '#10b981' : '#4b5563'}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: winnerCpu.id === cpuA.id ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none' }}>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '950', margin: 0 }}>{normalizeName(cpuA.name)}</h2>
                <a href={isEn ? getAmazonUrl(cpuA.name) : getHeurekaUrl(cpuA.name)} target="_blank" rel="nofollow sponsored" style={{ display: 'inline-block', marginTop: '15px', color: '#9ca3af', fontSize: '12px', textDecoration: 'underline' }}>{isEn ? 'Check price' : 'Zjistit cenu'}</a>
            </div>
            <div style={{ background: '#f59e0b', color: '#000', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>VS</div>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${winnerCpu.id === cpuB.id ? '#10b981' : '#4b5563'}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: winnerCpu.id === cpuB.id ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none' }}>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '950', margin: 0 }}>{normalizeName(cpuB.name)}</h2>
                <a href={isEn ? getAmazonUrl(cpuB.name) : getHeurekaUrl(cpuB.name)} target="_blank" rel="nofollow sponsored" style={{ display: 'inline-block', marginTop: '15px', color: '#9ca3af', fontSize: '12px', textDecoration: 'underline' }}>{isEn ? 'Check price' : 'Zjistit cenu'}</a>
            </div>
        </div>

        {/* 🔥 GURU INTELIGENTNÍ DOPORUČENÍ (V12) - NABÍZÍ SILNĚJŠÍ HW NEŽ JE V TESTU 🔥 */}
        <div style={{ margin: '40px 0' }}>
            <GuruInContentOffer 
                productName={upgradeProduct} 
                category={upgradeCategory} 
                reason="upgrade"
                isEn={isEn}
                subId={`cpuvs-smart-path-${winnerBrand}`}
            />
        </div>

        <div style={{ marginBottom: '40px', background: 'rgba(0,0,0,0.4)', padding: '35px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px', fontWeight: '950', color: '#10b981', textTransform: 'uppercase', fontSize: '18px' }}>
              🏆 {isEn ? 'Best Value Performance' : 'Vítěz srovnání'}: {winnerBrand}
            </div>
            <a 
              href={finalWinnerLink} 
              target="_blank" 
              rel="nofollow sponsored noopener noreferrer" 
              style={{ background: isEn ? '#f59e0b' : 'linear-gradient(135deg, #3b82f6 0%, #0078d4 100%)', color: isEn ? '#000' : '#fff', padding: '18px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}
            >
              <ShoppingCart size={20} /> {ctaText}
            </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', borderRadius: '15px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}><Gamepad2 size={24} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', borderRadius: '15px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}><Activity size={24} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
        </div>

        <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <GuruCpuCompareText cpu1Name={normalizeName(cpuA.name)} cpu2Name={normalizeName(cpuB.name)} perfDiff={perfDiff} cpu1Cores={cpuA.cores} cpu2Cores={cpuB.cores} isEn={isEn} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><HeurekaButtons isEn={isEn} /></div>
      </main>

      <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
            <SeznamAd zoneId={408654} width={970} height={90} />
      </div>
    </div>
  );
}
