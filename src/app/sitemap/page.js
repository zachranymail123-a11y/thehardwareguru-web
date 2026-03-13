import React from 'react';
import { Map, Layers, Cpu, Monitor, FileText, Swords, TrendingUp } from 'lucide-react';
import Link from 'next/link';

/**
 * GURU HTML SITEMAP V1.2
 * Cesta: src/app/sitemap/page.js
 * 🚀 CÍL: Rozcestník pro uživatele a Googleboty (odstraňuje chybu 404 z /sitemap).
 * 🛡️ FIX: Doplněna chybějící sekce pro Tipy, Tweaky, Rady a Slovník.
 * 🛡️ FIX 2: Přidán odkaz na Katalog grafik (Index) do sekce Hardware Žebříčky.
 */

export const metadata = {
  title: 'Mapa stránek (Sitemap) | The Hardware Guru',
  description: 'Kompletní přehled všech rubrik, benchmarků, procesorů a grafických karet na The Hardware Guru.'
};

export default function SitemapPage() {
  const sections = [
    { title: 'Základní Huby', icon: <Layers size={24} color="#a855f7" />, links: [
        { name: 'Úvodní stránka', url: '/' },
        { name: 'Články a novinky', url: '/clanky' },
        { name: 'Herní slevy', url: '/deals' },
        { name: 'Podpora Guru', url: '/support' }
    ]},
    { title: 'Guru Rádce a Tipy', icon: <FileText size={24} color="#10b981" />, links: [
        { name: 'Guru Tweaky', url: '/tweaky' },
        { name: 'Rady a Návody', url: '/rady' },
        { name: 'Tipy a Triky', url: '/tipy' },
        { name: 'Hardwarový Slovník', url: '/slovnik' }
    ]},
    { title: 'Hardware Žebříčky', icon: <TrendingUp size={24} color="#f59e0b" />, links: [
        { name: 'Žebříček procesorů (CPU Tier List)', url: '/cpuvs/ranking' },
        { name: 'Katalog procesorů (Index)', url: '/cpu-index' },
        { name: 'Žebříček grafik (GPU Tier List)', url: '/gpuvs/ranking' },
        { name: 'Katalog grafik (Index)', url: '/gpu-index' }
    ]},
    { title: 'Srovnávače (VS Engine)', icon: <Swords size={24} color="#ff0055" />, links: [
        { name: 'Srovnávač grafických karet', url: '/gpuvs' },
        { name: 'Srovnávač procesorů', url: '/cpuvs' },
        { name: 'Kalkulačka Bottlenecku', url: '/' }
    ]}
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.05)' }}>
            <Map size={16} /> GURU NAVIGACE
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>
            Mapa <span style={{ color: '#a855f7' }}>Stránek</span>
          </h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {sections.map((section, i) => (
                <div key={i} style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                        {section.icon}
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '950', margin: 0, textTransform: 'uppercase' }}>{section.title}</h2>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {section.links.map((link, j) => (
                            <li key={j}>
                                <Link href={link.url} style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#a855f7' }}>&bull;</span> {link.name}
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
