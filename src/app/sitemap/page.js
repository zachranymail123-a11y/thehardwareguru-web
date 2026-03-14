import React from 'react';
import { 
  Map, 
  Layers, 
  Cpu, 
  Monitor, 
  FileText, 
  Swords, 
  TrendingUp, 
  Flame, 
  Heart, 
  Info, 
  BookOpen, 
  Wrench, 
  CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

/**
 * GURU HTML SITEMAP V2.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/sitemap/page.js
 * 🚀 CÍL: 100% zelená v GSC a perfektní navigace pro roboty.
 * 🛡️ FIX 1: Implementována generateMetadata s absolutními URL a jazykovým clusterem.
 * 🛡️ FIX 2: Přidáno BreadcrumbList schéma.
 * 🛡️ FIX 3: Rozšířeno o všechny chybějící sekce (Slovník, Tipy, Tweaky).
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy (Zlatý standard)
export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Sitemap & Navigation | The Hardware Guru' : 'Mapa stránek a Navigace | The Hardware Guru';
  const desc = isEn 
    ? 'Complete overview of all sections, benchmarks, processors and graphics cards on The Hardware Guru.' 
    : 'Kompletní přehled všech rubrik, benchmarků, procesorů a grafických karet na The Hardware Guru.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/sitemap`,
      languages: {
        'en': `${baseUrl}/en/sitemap`,
        'cs': `${baseUrl}/sitemap`,
        'x-default': `${baseUrl}/sitemap`
      }
    }
  };
}

export default async function SitemapPage(props) {
  const isEn = props?.isEn === true;

  const sections = [
    { 
      title: isEn ? 'Core Hubs' : 'Základní Huby', 
      icon: <Layers size={24} color="#a855f7" />, 
      links: [
        { name: isEn ? 'Home Page' : 'Úvodní stránka', url: '/' },
        { name: isEn ? 'Articles & News' : 'Články a novinky', url: '/clanky' },
        { name: isEn ? 'Game Deals' : 'Herní slevy', url: '/deals' },
        { name: isEn ? 'Support Guru' : 'Podpora Guru', url: '/support' }
      ]
    },
    { 
      title: isEn ? 'Guru Advice & Tips' : 'Guru Rádce a Tipy', 
      icon: <FileText size={24} color="#10b981" />, 
      links: [
        { name: isEn ? 'Guru Tweaky' : 'Guru Tweaky', url: '/tweaky' },
        { name: isEn ? 'Guides & Manuals' : 'Rady a Návody', url: '/rady' },
        { name: isEn ? 'Tips & Tricks' : 'Tipy a Triky', url: '/tipy' },
        { name: isEn ? 'Hardware Glossary' : 'Hardwarový Slovník', url: '/slovnik' }
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
      title: isEn ? 'VS Engines' : 'Srovnávače (VS Engine)', 
      icon: <Swords size={24} color="#ff0055" />, 
      links: [
        { name: isEn ? 'GPU VS Engine' : 'Srovnávač grafických karet', url: '/gpuvs' },
        { name: isEn ? 'CPU VS Engine' : 'Srovnávač procesorů', url: '/cpuvs' },
        { name: isEn ? 'Bottleneck Calculator' : 'Kalkulačka Bottlenecku', url: '/' }
      ]
    }
  ];

  // 🚀 ZLATÉ GSC SCHÉMA (Breadcrumbs)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Sitemap" : "Mapa stránek", "item": `${baseUrl}${isEn ? '/en' : ''}/sitemap` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.05)' }}>
            <Map size={16} /> GURU NAVIGATION
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>
            {isEn ? 'SITE' : 'MAPA'} <span style={{ color: '#a855f7' }}>{isEn ? 'MAP' : 'STRÁNEK'}</span>
          </h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {sections.map((section, i) => (
                <div key={i} style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                        {section.icon}
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '950', margin: 0, textTransform: 'uppercase', color: '#fff' }}>{section.title}</h2>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {section.links.map((link, j) => (
                            <li key={j}>
                                <Link href={isEn ? `/en${link.url === '/' ? '' : link.url}` : link.url} style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#a855f7' }}>&bull;</span> {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        {/* 🚀 GURU GLOBÁLNÍ CTA TLAČÍTKA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Help us build this database by supporting us." : "Podpoř projekt Hardware Guru a získej ty nejlepší slevy."}
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

      <style dangerouslySetInnerHTML={{__html: `
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        @media (max-width: 768px) {
            .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 14px; }
        }
      `}} />
    </div>
  );
}
