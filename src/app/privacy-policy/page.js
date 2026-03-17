import React from 'react';
import { Lock } from 'lucide-react';

/**
 * GURU PRIVACY ENGINE V3.1 (ADSENSE COMPLIANT)
 * Cesta: src/app/privacy-policy/page.js
 * 🛡️ FIX: Obsahuje povinné pasáže pro Google AdSense a GDPR.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const canonicalUrl = `${baseUrl}/privacy-policy`;

  return {
    title: isEn ? 'Privacy Policy | The Hardware Guru' : 'Zásady ochrany osobních údajů | The Hardware Guru',
    description: isEn ? 'Privacy policy and data handling information for The Hardware Guru.' : 'Zásady ochrany osobních údajů a nakládání s daty na webu The Hardware Guru.',
    alternates: {
      canonical: canonicalUrl,
      languages: { 'en': `${baseUrl}/en/privacy-policy`, 'cs': canonicalUrl, 'x-default': canonicalUrl }
    }
  };
}

export default function PrivacyPolicyPage(props) {
  const isEn = props?.isEn === true;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Privacy Policy" : "Ochrana soukromí", "item": `${baseUrl}${isEn ? '/en' : ''}/privacy-policy` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.1)' }}>
            <Lock size={16} /> {isEn ? 'DATA SECURITY' : 'ZABEZPEČENÍ DAT'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'PRIVACY' : 'ZÁSADY'} <span style={{ color: '#10b981', textShadow: '0 0 30px rgba(16, 185, 129, 0.5)' }}>{isEn ? 'POLICY' : 'SOUKROMÍ'}</span>
          </h1>
        </header>

        <section className="content-box-style">
          <div className="guru-prose">
            {isEn ? (
              <>
                <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>
                <h2>1. Introduction</h2>
                <p>Welcome to The Hardware Guru. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.</p>
                
                <h2>2. Data Collection & Analytics</h2>
                <p>We use <strong>Google Analytics 4</strong> to monitor website traffic and user behavior. This tool uses cookies to collect anonymous data such as pages visited, time spent on the site, and general location (country/city).</p>
                
                <h2>3. Advertising (Google AdSense)</h2>
                <p>Our website uses <strong>Google AdSense</strong> to display advertisements. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.</p>

                <h2>4. Affiliates and External Links</h2>
                <p>Our site contains affiliate links to third-party stores (e.g., Alza, Amazon, HRK Game). Ak kliknete na affiliate odkaz a nakúpite, môžeme získať províziu bez akýchkoľvek ďalších nákladov pre vás.</p>

                <h2>5. Your Rights</h2>
                <p>Under the GDPR, you have the right to access, rectify, or erase your personal data. Please contact us at info@thehardwareguru.cz.</p>
              </>
            ) : (
              <>
                <p>Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}</p>
                <h2>1. Úvod</h2>
                <p>Vítejte na webu The Hardware Guru. Respektujeme vaše soukromí a zavazujeme se chránit vaše osobní údaje. Tyto zásady vysvětlují, jak shromažďujeme, používáme a chráníme vaše informace.</p>
                
                <h2>2. Analytika a sběr dat</h2>
                <p>K monitorování návštěvnosti využíváme <strong>Google Analytics 4</strong>. Tento nástroj využívá soubory cookies pro sběr anonymních dat, jako jsou navštívené stránky a čas strávený na webu.</p>
                
                <h2>3. Reklamy (Google AdSense)</h2>
                <p>Náš web využívá <strong>Google AdSense</strong> pro zobrazování reklam. Dodavatelé třetích stran, včetně společnosti Google, používají soubory cookie k zobrazování reklam na základě vašich předchozích návštěv. Používání inzertních souborů cookie umožňuje společnosti Google a jejím partnerům zobrazovat personalizované reklamy uživatelům na základě jejich návštěv na vašich stránkách a dalších stránkách na internetu.</p>

                <h2>4. Affiliate odkazy a externí weby</h2>
                <p>Náš web obsahuje affiliate odkazy na obchody třetích stran. Pokud přes náš odkaz nakoupíte, můžeme získat drobnou provizi, aniž by se tím zvýšila vaše cena.</p>

                <h2>5. Vaše práva (GDPR)</h2>
                <p>Podle nařízení GDPR máte právo na přístup ke svým údajům, jejich opravu nebo výmaz. Kontaktujte nás na info@thehardwareguru.cz.</p>
              </>
            )}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 50px 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .guru-prose { color: #d1d5db; font-size: 1.1rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.6rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #10b981; padding-left: 15px; }
        .guru-prose p { margin-bottom: 1.5em; }
        @media (max-width: 768px) { .content-box-style { padding: 30px 20px; } }
      `}} />
    </div>
  );
}
