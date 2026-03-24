import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

/**
 * GURU PRIVACY ENGINE V3.2 (ADSENSE & SEZNAM FULL COMPLIANT)
 * Cesta: src/app/privacy-policy/page.js
 * 🛡️ FIX: Kompletní GDPR, identifikace správce, cookies opt-out a odstraněn SK text v EN verzi.
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.1)', marginBottom: '20px' }}>
            <Lock size={16} /> {isEn ? 'DATA SECURITY & GDPR' : 'ZABEZPEČENÍ DAT & GDPR'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'PRIVACY' : 'ZÁSADY'} <span style={{ color: '#10b981', textShadow: '0 0 30px rgba(16, 185, 129, 0.5)' }}>{isEn ? 'POLICY' : 'SOUKROMÍ'}</span>
          </h1>
        </header>

        <section className="content-box-style">
          <div className="guru-prose">
            {isEn ? (
              <>
                <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US')}</p>
                
                <h2>1. Data Controller</h2>
                <p>
                  The data controller determining the purposes and means of processing personal data on this website is:<br/>
                  <strong>Name:</strong> Petr Ťapťuch<br/>
                  <strong>Registered Office:</strong> Albrechtická 560/94, 794 01 Krnov, Czech Republic<br/>
                  <strong>Reg. Number (IČO):</strong> 69606846<br/>
                  <strong>Contact Email:</strong> thehardwareguru@seznam.cz
                </p>

                <h2>2. Introduction</h2>
                <p>Welcome to The Hardware Guru. We respect your privacy and are committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR). This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.</p>
                
                <h2>3. Data Collection & Analytics</h2>
                <p>We use <strong>Google Analytics 4</strong> to monitor website traffic and user behavior. This tool uses cookies to collect anonymous data such as pages visited, time spent on the site, and general location (country/city). No personally identifiable information is stored in our analytics database.</p>
                
                <h2>4. Advertising & Cookies (Google AdSense & Seznam)</h2>
                <p>Our website uses third-party advertising companies, including <strong>Google AdSense</strong> and <strong>Seznam Partner</strong>, to serve ads when you visit our site. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
                <ul>
                  <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.</li>
                  <li>Users may opt-out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer" style={{color: '#10b981'}}>Google Ads Settings</a>.</li>
                  <li>You can manage your cookie preferences at any time using the cookie banner located at the bottom of our website.</li>
                </ul>

                <h2>5. Affiliates and External Links</h2>
                <p>Our site contains affiliate links to third-party stores. If you click on an affiliate link and make a purchase, we may receive a commission at no additional cost to you. We are not responsible for the privacy practices of these external websites.</p>

                <h2>6. Your Rights</h2>
                <p>Under the GDPR, you have the right to access, rectify, restrict processing, or erase your personal data. You also have the right to data portability and the right to object to processing. To exercise any of these rights, please contact us at <strong>thehardwareguru@seznam.cz</strong>.</p>
              </>
            ) : (
              <>
                <p><strong>Poslední aktualizace:</strong> {new Date().toLocaleDateString('cs-CZ')}</p>
                
                <h2>1. Správce osobních údajů</h2>
                <p>
                  Správcem osobních údajů, který určuje účel a prostředky zpracování na tomto webu, je:<br/>
                  <strong>Jméno:</strong> Petr Ťapťuch<br/>
                  <strong>Sídlo:</strong> Albrechtická 560/94, 794 01 Krnov, Česká republika<br/>
                  <strong>IČO:</strong> 69606846 (Neplátce DPH)<br/>
                  <strong>Kontaktní e-mail:</strong> thehardwareguru@seznam.cz
                </p>

                <h2>2. Úvod</h2>
                <p>Vítejte na webu The Hardware Guru. Respektujeme vaše soukromí a zavazujeme se chránit vaše osobní údaje v souladu s Obecným nařízením o ochraně osobních údajů (GDPR). Tyto zásady vysvětlují, jak shromažďujeme, používáme a chráníme vaše informace.</p>
                
                <h2>3. Analytika a sběr dat</h2>
                <p>K monitorování návštěvnosti využíváme <strong>Google Analytics 4</strong>. Tento nástroj využívá soubory cookies pro sběr anonymních dat, jako jsou navštívené stránky a čas strávený na webu. V naší analytické databázi nejsou uchovávány žádné osobně identifikovatelné údaje.</p>
                
                <h2>4. Reklamy a Cookies (Google AdSense a Seznam Partner)</h2>
                <p>Náš web využívá reklamní systémy třetích stran, včetně <strong>Google AdSense</strong> a sítě <strong>Seznam Partner</strong>, k zobrazování reklam. Tyto společnosti mohou používat údaje (nikoli však jméno, adresu, e-mailovou adresu nebo telefonní číslo) o vašich návštěvách těchto i jiných webových stránek k poskytování reklam na zboží a služby, které vás zajímají.</p>
                <ul>
                  <li>Používání inzertních souborů cookie umožňuje společnosti Google a jejím partnerům zobrazovat personalizované reklamy na základě vašich návštěv na našich stránkách a dalších webech.</li>
                  <li>Uživatelé se mohou z personalizované inzerce odhlásit návštěvou stránky <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer" style={{color: '#10b981'}}>Nastavení reklam Google</a>.</li>
                  <li>Své preference ohledně cookies můžete kdykoliv změnit pomocí vyskakovací lišty v dolní části našeho webu.</li>
                </ul>

                <h2>5. Affiliate odkazy a externí weby</h2>
                <p>Náš web obsahuje affiliate odkazy na obchody třetích stran. Pokud přes náš odkaz nakoupíte, můžeme získat drobnou provizi, aniž by se tím zvýšila vaše koncová cena. Neneseme odpovědnost za zásady ochrany osobních údajů na těchto webech třetích stran.</p>

                <h2>6. Vaše práva (GDPR)</h2>
                <p>Podle nařízení GDPR máte právo na přístup ke svým údajům, jejich opravu, omezení zpracování nebo úplný výmaz. Máte také právo na přenositelnost údajů a právo vznést námitku proti zpracování. Pro uplatnění těchto práv nás prosím kontaktujte na <strong>thehardwareguru@seznam.cz</strong>.</p>
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
        .guru-prose ul { margin-bottom: 1.5em; padding-left: 20px; }
        .guru-prose li { margin-bottom: 0.5em; }
        @media (max-width: 768px) { .content-box-style { padding: 30px 20px; } }
      `}} />
    </div>
  );
}
