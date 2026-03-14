import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  FileText, 
  Video, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  Flame, 
  Heart, 
  ArrowRight,
  Monitor,
  Activity
} from 'lucide-react';

/**
 * GURU REPORTS ENGINE V1.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/reports/page.js
 * 🚀 CÍL: 100% zelená v GSC a blesková indexace technických souhrnů z videí.
 * 🛡️ FIX 1: Přepsáno na Server Component (SSR) pro maximální SEO a rychlost.
 * 🛡️ FIX 2: Implementován Golden Rich standard - ItemList a BreadcrumbList JSON-LD.
 * 🛡️ FIX 3: Plná podpora CZ/EN varianty v rámci jednoho souboru.
 * 🛡️ DESIGN: Nasazen Guru Supreme vizuál (neon, dark, blur).
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy (Zlatý standard)
export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Technical Video Reports | Hardware Guru' : 'Technické reporty z videí | Hardware Guru';
  const desc = isEn 
    ? 'Automatic technical summaries and benchmark analysis from my hardware videos.' 
    : 'Automatické technické souhrny a analýzy benchmarků z mých hardwarových videí.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/reports`,
      languages: {
        'en': `${baseUrl}/en/reports`,
        'cs': `${baseUrl}/reports`,
        'x-default': `${baseUrl}/reports`
      }
    }
  };
}

export default async function ReportsPage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. GURU FETCH: Načtení dat z tabulky reports
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU REPORTS FETCH FAIL:", error);
    return (
      <div style={{ padding: '100px', background: '#0a0b0d', color: '#ef4444', textAlign: 'center', minHeight: '100vh' }}>
        <h2>CHYBA PŘI NAČÍTÁNÍ DATABÁZE</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const safeReports = reports || [];

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (ItemList pro seznam reportů)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "Hardware Video Reports" : "Hardwarové reporty z videí",
    "description": isEn ? "Summaries of latest tech videos and benchmarks." : "Souhrny nejnovějších technických videí a benchmarků.",
    "itemListElement": safeReports.map((report, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": report.title,
      "url": report.url // Odkaz přímo na video nebo detail (pokud existuje)
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Reports" : "Reporty", "item": `${baseUrl}${isEn ? '/en' : ''}/reports` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={pageWrapper}>
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .report-card { 
            background: rgba(15, 17, 21, 0.95); 
            border: 1px solid rgba(255, 255, 255, 0.05); 
            border-top: 4px solid #ff0000; 
            border-radius: 28px; 
            padding: 40px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
        }
        .report-card:hover { 
            transform: translateY(-8px); 
            border-color: #ff000066; 
            box-shadow: 0 25px 60px rgba(255, 0, 0, 0.15); 
        }
        .report-content { color: #d1d5db; line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; margin-bottom: 30px; }
        .video-btn { display: inline-flex; align-items: center; gap: 10px; background: rgba(255, 0, 0, 0.1); color: #ff0000; padding: 15px 30px; border-radius: 14px; text-decoration: none; font-weight: 950; font-size: 14px; text-transform: uppercase; border: 1px solid rgba(255, 0, 0, 0.3); transition: 0.3s; }
        .video-btn:hover { background: #ff0000; color: #fff; box-shadow: 0 0 30px rgba(255, 0, 0, 0.4); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
      `}} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0000', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(255, 0, 0, 0.3)', borderRadius: '50px', background: 'rgba(255, 0, 0, 0.05)' }}>
            <Video size={16} /> GURU VIDEO REPORTS
          </div>
          <h1 style={titleStyle}>
            {isEn ? <>TECH <span style={{ color: '#ff0000' }}>REPORTS</span></> : <>GURU <span style={{ color: '#ff0000' }}>REPORTY</span></>}
          </h1>
          <p style={{ marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '20px' }}>
            {isEn ? 'Automatic technical summaries from my videos.' : 'Automatické technické souhrny z mých videí.'}
          </p>
        </header>

        <div style={{ display: 'grid', gap: '40px' }}>
          {safeReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px dashed #333' }}>
              {isEn ? 'NO REPORTS GENERATED YET' : 'ZATÍM NEBYLY VYGENEROVÁNY ŽÁDNÉ REPORTY'}
            </div>
          ) : (
            safeReports.map((report) => (
              <article key={report.id} className="report-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '20px' }}>
                  <Calendar size={14} /> {new Date(report.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                  <span style={{ opacity: 0.2 }}>|</span>
                  <span style={{ color: '#ff0000' }}>AI ANALÝZA</span>
                </div>
                
                <h2 style={{ fontSize: '2rem', fontWeight: '950', margin: '0 0 25px 0', color: '#fff', textTransform: 'uppercase', lineHeight: '1.2' }}>
                  {report.title}
                </h2>
                
                <div className="report-content">
                  {report.content}
                </div>

                {report.url && (
                  <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <a href={report.url} target="_blank" rel="noopener noreferrer" className="video-btn">
                      <Play size={18} fill="currentColor" /> {isEn ? 'WATCH VIDEO' : 'KOUKNOUT NA VIDEO'} <ArrowRight size={16} />
                    </a>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* 🚀 GURU GLOBÁLNÍ CTA TLAČÍTKA (Golden standard) */}
        <div style={{ marginTop: '100px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Want to see more hardware tests? Support the Guru project." : "Chceš vidět další testy hardwaru? Podpoř projekt Guru."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ padding: '80px 20px 40px', textAlign: 'center', color: '#4b5563', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px' }}>
        © {new Date().getFullYear()} The Hardware Guru System • Automatic Report Engine
      </footer>
    </div>
  );
}

const pageWrapper = { 
  minHeight: '100vh', 
  backgroundColor: '#0a0b0d', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover', 
  backgroundAttachment: 'fixed', 
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '120px'
};

const titleStyle = { 
  fontSize: 'clamp(40px, 8vw, 72px)', 
  fontWeight: '950', 
  textTransform: 'uppercase', 
  letterSpacing: '-2px', 
  margin: 0,
  lineHeight: '0.9'
};
