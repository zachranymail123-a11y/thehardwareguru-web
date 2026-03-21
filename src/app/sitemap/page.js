import React from 'react';
import { 
  Map, Layers, Cpu, Monitor, FileText, Swords, TrendingUp, 
  Flame, Heart, Info, BookOpen, Wrench, CheckCircle2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

/**
 * GURU HTML SITEMAP V2.6 (ADS INJECTION & LINK FIX UPDATE)
 * 🚀 CÍL: Oprava odkazu na Bottleneck Kalkulačku a nasazení reklamy.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  try { await props.params; } catch(e) {}
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
  try { await props.params; } catch(e) {}
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
        { name: isEn ? 'Bottleneck Calc' : 'Kalkulačka Bottlenecku', url: '/bottleneck-kalkulacka' } // 🛡️ ODKAZ A NÁZEV OPRAVEN
      ]
    }
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Sitemap" : "Mapa stránek", "item": `${baseUrl}${isEn ? '/en' : ''}/sitemap` }
    ]
  };

  const navSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Guru Navigation Map",
    "itemListElement": sections.flatMap((s, i) => s.links.map((l, j) => ({
      "@type": "SiteNavigationElement",
      "position": i * 10 + j,
      "name": l.name,
      "url": `${baseUrl}${isEn ? '/en' : ''}${l.url === '/' ? '' : l.url}`
    })))
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(navSchema) }} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '70px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '8px 25px', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Map size={18} /> GURU SYSTEM NAVIGATION
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: 1.0, letterSpacing: '-2px' }}>
            {isEn ? 'SITE' : 'MAPA'} <span style={{ color: '#a855f7', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)' }}>{isEn ? 'MAP' : 'STRÁNEK'}</span>
          </h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {sections.map((section, i) => (
                <React.Fragment key={i}>
                    <div style={{ background: 'rgba(15, 17, 21, 0.98)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '45px 35px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', borderTop: `3px solid ${section.icon.props.color}` }}>
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

                    {/* 🔥 ADS SLOT: INJEKCE DO GRIDU (PO 2. KARTĚ) */}
                    {i === 1 && (
                        <div className="guru-sitemap-ad-slot grid-span-ad">
                            <span className="ad-label">Sponsored Hardware Recommendation</span>
                            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>

        <div style={{ marginTop: '100px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '25px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</Link>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .sitemap-link { color: #9ca3af; text-decoration: none; font-weight: 900; font-size: 16px; transition: 0.3s; display: flex; align-items: center; gap: 12px; }
        .sitemap-link:hover { color: #fff; transform: translateX(8px); }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 20px 40px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 16px; text-transform: uppercase; border-radius: 20px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 30px rgba(234, 179, 8, 0.3); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 20px 40px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 16px; text-transform: uppercase; border-radius: 20px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4); border: 1px solid rgba(255,255,255,0.1); }
        .guru-support-btn:hover, .guru-deals-btn:hover { transform: translateY(-5px); filter: brightness(1.1); }

        .guru-sitemap-ad-slot { margin: 15px 0; padding: 15px; background: rgba(168, 85, 247, 0.02); border: 1px solid rgba(168, 85, 247, 0.1); border-radius: 32px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }
        
        @media (min-width: 768px) { .grid-span-ad { grid-column: 1 / -1; } }
        @media (max-width: 768px) { .ad-desktop { display: none; } .ad-mobile { display: block; } }
      `}} />
    </div>
  );
}
