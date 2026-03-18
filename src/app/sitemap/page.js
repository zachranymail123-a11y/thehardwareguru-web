import React from 'react';
import { Map, Layers, FileText, Swords, TrendingUp, Flame, Heart } from 'lucide-react';
import Link from 'next/link';

/**
 * GURU HTML SITEMAP V2.3 (FINAL STABILITY FIX)
 * 🛡️ FIX: Kompletní ošetření props pro Next.js 15 (asynchronní params).
 * 🛡️ FIX: Prevence Digest chyb při proxy volání z /en/sitemap.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  // Ošetření asynchronních params pro Next.js 15
  const params = await props.params;
  const isEn = props.isEn === true;

  const title = isEn ? 'Sitemap & Navigation | The Hardware Guru' : 'Mapa stránek a Navigace | The Hardware Guru';
  return {
    title: `${title} | The Hardware Guru`,
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
  // Důležité: isEn může přijít jako prop z proxy, nebo ho detekujeme
  const isEn = props.isEn === true;

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
      title: isEn ? 'Hardware Rankings' : 'Hardware Žebříčky', 
      icon: <TrendingUp size={24} color="#f59e0b" />, 
      links: [
        { name: isEn ? 'CPU Tier List' : 'Žebříček procesorů', url: '/cpuvs/ranking' },
        { name: isEn ? 'CPU Database' : 'Katalog procesorů', url: '/cpu-index' },
        { name: isEn ? 'GPU Tier List' : 'Žebříček grafik', url: '/gpuvs/ranking' },
        { name: isEn ? 'GPU Database' : 'Katalog grafik', url: '/gpu-index' }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '950', textTransform: 'uppercase' }}>
            {isEn ? 'SITE' : 'MAPA'} <span style={{ color: '#a855f7' }}>{isEn ? 'MAP' : 'STRÁNEK'}</span>
          </h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {sections.map((section, i) => (
                <div key={i} style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '950', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {section.icon} {section.title}
                    </h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {section.links.map((link, j) => (
                            <li key={j} style={{ marginBottom: '10px' }}>
                                <Link href={isEn ? `/en${link.url === '/' ? '' : link.url}` : link.url} style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 'bold' }}>
                                    • {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
