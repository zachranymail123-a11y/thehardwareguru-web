import React from 'react';
import { FileText } from 'lucide-react';
import Link from 'next/link';

/**
 * GURU TERMS ENGINE V3.2 (E-E-A-T & ADSENSE FULL COMPLIANT)
 * Cesta: src/app/podminky-uziti/page.js
 * 🚀 CÍL: Právně neprůstřelné podmínky užití, nezbytné pro schválení monetizace.
 * 🛡️ FIX: Odstraněno "use client", přidána metadata a zprofesionalizován text.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Terms of Service | The Hardware Guru' : 'Podmínky užití | The Hardware Guru';
  const desc = isEn
    ? 'Terms of Service and usage rules for The Hardware Guru website.'
    : 'Podmínky užití a pravidla používání webu The Hardware Guru.';

  const canonicalUrl = isEn ? `${baseUrl}/en/terms-of-service` : `${baseUrl}/podminky-uziti`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'en': `${baseUrl}/en/terms-of-service`, 'cs': `${baseUrl}/podminky-uziti`, 'x-default': `${baseUrl}/podminky-uziti` }
    }
  };
}

export default function TermsOfService(props) {
  const isEn = props?.isEn === true;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Terms of Service" : "Podmínky užití", "item": isEn ? `${baseUrl}/en/terms-of-service` : `${baseUrl}/podminky-uziti` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '50px', background: 'rgba(234, 179, 8, 0.1)' }}>
            <FileText size={16} /> {isEn ? 'LEGAL AGREEMENT' : 'PRÁVNÍ UJEDNÁNÍ'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'TERMS OF' : 'PODMÍNKY'} <span style={{ color: '#eab308', textShadow: '0 0 30px rgba(234, 179, 8, 0.5)' }}>{isEn ? 'SERVICE' : 'UŽITÍ'}</span>
          </h1>
        </header>

        <section className="content-box-style">
          <div className="guru-prose">
            {isEn ? (
              <>
                <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US')}</p>
                
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using The Hardware Guru website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                
                <h2>2. Website Content & Copyright</h2>
                <p>All content on The Hardware Guru, including text, graphics, logos, and benchmarks, is the property of The Hardware Guru and is protected by international copyright laws. Unauthorized copying, reproduction, or distribution without prior written consent is strictly prohibited.</p>
                
                <h2>3. Limitation of Liability</h2>
                <p>All hardware tweaks, overclocking guides, and technical interventions described on this site are performed <strong>strictly at your own risk</strong>. The Hardware Guru is not responsible for any hardware damage, data loss, system instability, or voided warranties resulting from the application of our advice or tutorials.</p>

                <h2>4. External Links and Affiliates</h2>
                <p>This website may contain links to third-party websites and affiliate links. We are not responsible for the content or practices of these external sites. Any purchases made through affiliate links may earn us a commission, but it does not affect your final purchase price.</p>

                <h2>5. Modifications</h2>
                <p>We reserve the right to modify these terms at any time. Your continued use of the website following any changes signifies your acceptance of the revised terms.</p>
              </>
            ) : (
              <>
                <p><strong>Poslední aktualizace:</strong> {new Date().toLocaleDateString('cs-CZ')}</p>
                
                <h2>1. Akceptace podmínek</h2>
                <p>Přístupem na web The Hardware Guru a jeho používáním vyjadřujete svůj souhlas s těmito podmínkami užití. Pokud s jakoukoli částí těchto podmínek nesouhlasíte, web nepoužívejte.</p>
                
                <h2>2. Autorská práva a obsah</h2>
                <p>Veškerý obsah na webu The Hardware Guru, včetně textů, grafiky, log a naměřených benchmarků, je chráněn autorským právem. Jakékoliv kopírování, šíření nebo reprodukce bez předchozího písemného souhlasu autora je přísně zakázáno.</p>
                
                <h2>3. Vyloučení odpovědnosti</h2>
                <p>Veškeré návody, úpravy hardwaru (tweaky) a postupy pro přetaktování uvedené na tomto webu provádíte <strong>výhradně na vlastní nebezpečí</strong>. Provozovatel The Hardware Guru nenese žádnou odpovědnost za případné poškození hardwaru, ztrátu dat, nestabilitu systému nebo ztrátu záruky v důsledku nesprávné aplikace našich rad.</p>

                <h2>4. Externí a affiliate odkazy</h2>
                <p>Tento web může obsahovat odkazy na stránky třetích stran a affiliate odkazy. Neneseme odpovědnost za obsah ani postupy těchto externích webů. Za nákupy uskutečněné přes affiliate odkazy můžeme obdržet drobnou provizi, což však nijak neovlivňuje vaši koncovou cenu.</p>

                <h2>5. Změny podmínek</h2>
                <p>Vyhrazujeme si právo tyto podmínky kdykoliv upravit. Vaše další používání webu po zveřejnění změn znamená, že s novými podmínkami souhlasíte.</p>
              </>
            )}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 50px 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .guru-prose { color: #d1d5db; font-size: 1.1rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.6rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #eab308; padding-left: 15px; }
        .guru-prose p { margin-bottom: 1.5em; }
        @media (max-width: 768px) { .content-box-style { padding: 30px 20px; } }
      `}} />
    </div>
  );
}
