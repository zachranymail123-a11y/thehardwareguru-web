import React from 'react';
import { 
  Map, Layers, Cpu, Monitor, FileText, Swords, TrendingUp, 
  Flame, Heart, Info, BookOpen, Wrench, CheckCircle2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import SeznamAd from '../../components/SeznamAd';

/**
 * GURU HTML SITEMAP V2.9 (MONEY FIX UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchoru, eliminace hluchých míst.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const params = await props.params;
  const isEn = props.isEn === true;
  const title = isEn ? 'Sitemap & Guru Navigation | The Hardware Guru' : 'Mapa stránek a Guru Navigace | The Hardware Guru';
  return {
    title: `${title} | The Hardware Guru`,
    description: isEn ? 'Complete overview of PC hardware benchmarks, CPU/GPU rankings, and tech guides.' : 'Kompletní přehled hardwarových benchmarků, žebříčků a tech návodů na Hardware Guru.',
    alternates: {
      canonical: `${baseUrl}/sitemap`,
      languages: { 'en': `${baseUrl}/en/sitemap`, 'cs': `${baseUrl}/sitemap` }
    }
  };
}

export default async function SitemapPage(props) {
  const params = await props.params;
  const isEn = props.isEn === true;

  const sections = [
    { 
      title: isEn ? 'Core Hubs' : 'Základní Huby', 
      icon: <Layers size={24} color="#a855f7" />, 
      links: [
        { name: isEn ? 'Home Page' : 'Úvodní základna Guru', url: '/' },
        { name: isEn ? 'Articles & News' : 'Hardwarové články a novinky', url: '/clanky' },
        { name: isEn ? 'Game Deals' : 'Nejlepší herní slevy', url: '/deals' },
        { name: isEn ? 'Support Guru' : 'Podpora a Donaty', url: '/support' }
      ]
    },
    { 
      title: isEn ? 'Hardware Rankings' : 'Hardware Žebříčky', 
      icon: <TrendingUp size={24} color="#f59e0b" />, 
      links: [
        { name: isEn ? 'CPU Tier List' : 'Žebříček procesorů (CPU Tier List)', url: '/cpuvs/ranking' },
        { name: isEn ? 'CPU Database' : 'Katalog procesorů (Index)', url: '/cpu-index' },
        { name: isEn ? 'GPU Tier List' : 'Žebříček grafik (GPU Tier List)', url: '/gpuvs/ranking' },
        { name: isEn ? 'GPU Database' : 'Katalog grafik (Index)', url: '/gpu-index' }
      ]
    },
    { 
      title: isEn ? 'Guru Advice & Tips' : 'Guru Rádce a Tipy', 
      icon: <FileText size={24} color="#10b981" />, 
      links: [
        { name: isEn ? 'Windows & Game Tweaks' : 'Guru Tweaky a Optimalizace', url: '/tweaky' },
        { name: isEn ? 'Guides & Manuals' : 'Rady a Návody pro PC', url: '/rady' },
        { name: isEn ? 'Tech Tips' : 'Tipy a Triky pro hráče', url: '/tipy' },
        { name: isEn ? 'Tech Glossary' : 'Hardwarový Slovník pojmů', url: '/slovnik' }
      ]
    },
    { 
      title: isEn ? 'Comparison Engines' : 'Srovnávače (VS Engine)', 
      icon: <Swords size={24} color="#f43f5e" />, 
      links: [
        { name: isEn ? 'GPU Comparison' : 'Srovnávač grafických karet', url: '/gpuvs' },
        { name: isEn ? 'CPU Comparison' : 'Srovnávač procesorů', url: '/cpuvs' },
        { name: isEn ? 'Bottleneck Calc' : 'Kalkulačka Bottlenecku', url: '/bottleneck-kalkulacka' }
      ]
    }
  ];

  return (
    <div className="guru-sitemap-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '70px' }}>
          <div className="sitemap-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '8px 25px', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Map size={18} /> GURU SYSTEM NAVIGATION
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: 1.0, letterSpacing: '-2px' }}>
            {isEn ? 'SITE' : 'MAPA'} <span style={{ color: '#a855f7', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)' }}>{isEn ? 'MAP' : 'STRÁNEK'}</span>
          </h1>
        </header>

        {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
        <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <div className="sitemap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {sections.map((section, i) => (
                <div key={i} className="sitemap-section-card" style={{ background: 'rgba(15, 17, 21, 0.98)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '45px 35px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', borderTop: `3px solid ${section.icon.props.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
                        {section.icon}
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '950', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{section.title}</h2>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {section.links.map((link, j) => (
                            <li key={j}>
                                <Link href={isEn ? `/en${link.url === '/' ? '' : link.url}` : link.url} className="sitemap-link">
                                    <ChevronRight size={16} style={{ color: section.icon.props.color }} /> {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        <div className="footer-btns" style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '25px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</Link>
        </div>

      </main>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .sitemap-link { color: #9ca3af; text-decoration: none; font-weight: 900; font-size: 16px; transition: 0.3s; display: flex; align-items: center; gap: 12px; line-height: 1.4; }
        .sitemap-link:hover { color: #fff; transform: translateX(8px); }
        
        .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 20px 40px; border-radius: 20px; font-weight: 950; font-size: 16px; text-transform: uppercase; text-decoration: none; transition: 0.3s; }
        .guru-support-btn { background: #eab308; color: #000 !important; box-shadow: 0 10px 30px rgba(234, 179, 8, 0.3); }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4); border: 1px solid rgba(255,255,255,0.1); }
        .guru-support-btn:hover, .guru-deals-btn:hover { transform: translateY(-5px); filter: brightness(1.1); }

        /* 🔥 STICKY BOTTOM ANCHOR CSS */
        .sticky-bottom-anchor {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 11, 13, 0.98);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
        }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-sitemap-wrapper { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 2.2rem !important; }
            .sitemap-section-card { padding: 30px 20px !important; border-radius: 24px !important; }
            .sitemap-link { font-size: 14px !important; }
            .footer-btns { flex-direction: column; }
            .guru-deals-btn, .guru-support-btn { width: 100% !important; padding: 18px !important; font-size: 14px !important; }
        }
      `}} />
    </div>
  );
}
