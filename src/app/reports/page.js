import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
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
  Activity,
  Play
} from 'lucide-react';

/**
 * GURU REPORTS ENGINE V1.3 (MOBILE OPTIMIZED & ADS SEPARATION)
 * 🚀 CÍL: Maximální monetizace technických souhrnů a perfektní mobilní UX.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn ? 'Technical Video Reports | Hardware Guru' : 'Technické reporty z videí | Hardware Guru',
    alternates: {
      canonical: `${baseUrl}/reports`,
      languages: { 'en': `${baseUrl}/en/reports`, 'cs': `${baseUrl}/reports` }
    }
  };
}

export default async function ReportsPage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  const safeReports = reports || [];

  // Google Golden Rich: ItemList Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": safeReports.map((report, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}reports`, // Update when report detail pages exist
      "name": report.title
    }))
  };

  return (
    <div className="guru-archive-wrapper" style={pageWrapper}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .report-card { 
            background: rgba(15, 17, 21, 0.95); 
            border: 1px solid rgba(255, 255, 255, 0.05); 
            border-top: 4px solid #ff0000; 
            border-radius: 28px; 
            padding: 40px; 
            transition: 0.3s;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
        }
        .report-card:hover { transform: translateY(-5px); border-color: #ff000066; }
        .report-content { color: #d1d5db; line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; margin-bottom: 30px; }
        .video-btn { display: inline-flex; align-items: center; gap: 10px; background: rgba(255, 0, 0, 0.1); color: #ff0000; padding: 15px 30px; border-radius: 14px; text-decoration: none; font-weight: 950; font-size: 14px; text-transform: uppercase; border: 1px solid rgba(255, 0, 0, 0.3); transition: 0.3s; }
        
        .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; font-size: 15px; text-transform: uppercase; text-decoration: none; transition: 0.3s; }
        .guru-support-btn { background: #eab308; color: #000 !important; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; flex-direction: column; align-items: center; width: 100%; margin: 30px 0; }
        .ad-mobile-wrapper { display: none; flex-direction: column; align-items: center; width: 100%; margin: 25px 0; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }

        @media (max-width: 768px) {
            .guru-archive-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; }
            .report-card { padding: 25px !important; border-radius: 20px !important; }
            .report-card h2 { font-size: 1.4rem !important; }
            .report-content { font-size: 1rem !important; line-height: 1.6 !important; }
            .video-btn { width: 100%; justify-content: center; }
            .footer-cta { margin-top: 60px !important; }
        }
      `}} />

      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="reports-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0000', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(255, 0, 0, 0.3)', borderRadius: '50px', background: 'rgba(255, 0, 0, 0.05)' }}>
            <Video size={16} /> GURU VIDEO REPORTS
          </div>
          <h1 style={titleStyle}>
            {isEn ? <>TECH <span style={{ color: '#ff0000' }}>REPORTS</span></> : <>GURU <span style={{ color: '#ff0000' }}>REPORTY</span></>}
          </h1>
          <p style={{ marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '18px' }}>
            {isEn ? 'Automatic technical summaries from my videos.' : 'Automatické technické souhrny z mých videí.'}
          </p>
        </header>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT (STRIKTNÍ SEPARACE) */}
        <div className="ad-desktop-wrapper">
            <span className="ad-label">Advertisement</span>
            <iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe>
        </div>
        <div className="ad-mobile-wrapper">
            <span className="ad-label">Advertisement</span>
            <iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe>
        </div>

        <div className="reports-grid" style={{ display: 'grid', gap: '40px' }}>
          {safeReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px dashed #333' }}>
              {isEn ? 'NO REPORTS YET' : 'ZATÍM ŽÁDNÉ REPORTY'}
            </div>
          ) : (
            safeReports.map((report, index) => (
              <React.Fragment key={report.id}>
                <article className="report-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '20px' }}>
                    <Calendar size={14} /> {new Date(report.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                    <span style={{ color: '#ff0000' }}>AI ANALÝZA</span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '950', margin: '0 0 25px 0', color: '#fff', textTransform: 'uppercase', lineHeight: '1.2' }}>{report.title}</h2>
                  <div className="report-content">{report.content}</div>
                  {report.url && (
                    <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <a href={report.url} target="_blank" rel="noopener noreferrer" className="video-btn">
                        <Play size={18} fill="currentColor" /> {isEn ? 'WATCH VIDEO' : 'KOUKNOUT NA VIDEO'} <ArrowRight size={16} />
                      </a>
                    </div>
                  )}
                </article>

                {/* 🔥 ADS SLOT #2: LIST INJECTION (POUZE MOBIL PO 2. REPORTU) */}
                {index === 1 && (
                  <div className="ad-mobile-wrapper">
                    <span className="ad-label">Sponsored Tech Insight</span>
                    <iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>

        <div className="footer-cta" style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</Link>
          </div>
        </div>
      </main>

      <footer style={{ padding: '80px 20px 40px', textAlign: 'center', color: '#4b5563', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px' }}>
        © {new Date().getFullYear()} The Hardware Guru System
      </footer>
    </div>
  );
}

const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', color: '#fff', display: 'flex', flexDirection: 'column', paddingTop: '120px' };
const titleStyle = { fontSize: 'clamp(2rem, 7vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0, lineHeight: '1' };
