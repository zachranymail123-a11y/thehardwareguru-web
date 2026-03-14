import React from 'react';
import { Scale, AlertTriangle } from 'lucide-react';

/**
 * GURU TERMS ENGINE V3.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/terms-of-service/page.js
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const canonicalUrl = `${baseUrl}/terms-of-service`;

  return {
    title: isEn ? 'Terms of Service | The Hardware Guru' : 'Podmínky použití | The Hardware Guru',
    description: isEn ? 'Terms of service and usage conditions for The Hardware Guru database.' : 'Podmínky použití a pravidla webu The Hardware Guru.',
    alternates: {
      canonical: canonicalUrl,
      languages: { 'en': `${baseUrl}/en/terms-of-service`, 'cs': canonicalUrl, 'x-default': canonicalUrl }
    }
  };
}

export default function TermsOfServicePage(props) {
  const isEn = props?.isEn === true;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Terms of Service" : "Podmínky použití", "item": `${baseUrl}${isEn ? '/en' : ''}/terms-of-service` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Scale size={16} /> {isEn ? 'LEGAL AGREEMENT' : 'PRÁVNÍ UJEDNÁNÍ'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'TERMS OF' : 'PODMÍNKY'} <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245, 158, 11, 0.5)' }}>{isEn ? 'SERVICE' : 'POUŽITÍ'}</span>
          </h1>
        </header>

        <section className="content-box-style">
          <div className="guru-prose">
            {isEn ? (
              <>
                <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>
                <h2>1. Agreement to Terms</h2>
                <p>By accessing and using The Hardware Guru ("the Website"), you agree to be bound by these Terms of Service.</p>
                
                <h2>2. Informational Purpose Only</h2>
                <p>All content provided on The Hardware Guru, including benchmark data, FPS estimates, bottleneck calculations, and PC building advice, is for informational and educational purposes only.</p>
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '15px', margin: '20px 0' }}>
                    <AlertTriangle size={24} color="#ef4444" style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0, color: '#ef4444', fontWeight: 'bold' }}>Disclaimer: We assume no liability for any hardware damage, data loss, or financial loss resulting from the use of guides, tweaks, or recommendations found on this Website. Overclocking and system modifications are done entirely at your own risk.</p>
                </div>

                <h2>3. Accuracy of Data</h2>
                <p>We strive to provide the most accurate hardware benchmarks using our predictive models and aggregated data. However, real-world performance may vary depending on your specific system configuration.</p>
                
                <h2>4. Affiliate Links & Advertising</h2>
                <p>The Website participates in various affiliate marketing programs and uses Google AdSense to serve advertisements.</p>

                <h2>5. Intellectual Property</h2>
                <p>The original content, features, and functionality of The Hardware Guru are owned by us and are protected by intellectual property laws. You may not scrape, copy, or redistribute our database without permission.</p>
              </>
            ) : (
              <>
                <p>Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}</p>
                <h2>1. Souhlas s podmínkami</h2>
                <p>Přístupem na web The Hardware Guru a jeho používáním souhlasíte s těmito Podmínkami použití.</p>
                
                <h2>2. Pouze informativní charakter</h2>
                <p>Veškerý obsah poskytovaný na The Hardware Guru, včetně dat z benchmarků, odhadů FPS, výpočtů bottlenecku a rad ke stavbě PC, slouží výhradně k informativním účelům.</p>
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '15px', margin: '20px 0' }}>
                    <AlertTriangle size={24} color="#ef4444" style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0, color: '#ef4444', fontWeight: 'bold' }}>Zřeknutí se odpovědnosti: Neneseme žádnou odpovědnost za případné poškození hardwaru, ztrátu dat nebo finanční ztráty vzniklé použitím návodů či tweaků z tohoto webu. Úpravy systému provádíte na vlastní nebezpečí.</p>
                </div>

                <h2>3. Přesnost dat</h2>
                <p>Snažíme se poskytovat co nejpřesnější benchmarky pomocí našich prediktivních modelů. Reálný výkon se však může lišit v závislosti na konkrétní konfiguraci vašeho systému.</p>
                
                <h2>4. Affiliate odkazy a inzerce</h2>
                <p>Tento web se účastní affiliate marketingových programů (např. Alza.cz, Amazon) a k zobrazování reklam využívá službu Google AdSense.</p>

                <h2>5. Duševní vlastnictví</h2>
                <p>Originální obsah a databáze webu The Hardware Guru jsou naším majetkem. Není povoleno strojově těžit (scrapoat) ani dále distribuovat naši databázi bez souhlasu.</p>
              </>
            )}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 50px 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .guru-prose { color: #d1d5db; font-size: 1.1rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.6rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .guru-prose p { margin-bottom: 1.5em; }
        @media (max-width: 768px) { .content-box-style { padding: 30px 20px; } }
      `}} />
    </div>
  );
}
