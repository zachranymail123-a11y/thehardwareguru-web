import React from 'react';
import { Mail, MessageSquare, Youtube, Activity, Briefcase } from 'lucide-react';

/**
 * GURU CONTACT ENGINE V3.3 (E-E-A-T & ADSENSE FULL COMPLIANT - REAL DATA)
 * Cesta: src/app/contact/page.js
 * 🚀 CÍL: Jasná identifikace provozovatele (IČO, Adresa) pro schválení Seznam Partner a AdSense.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Contact Us | The Hardware Guru' : 'Kontakt | The Hardware Guru';
  const desc = isEn 
    ? 'Get in touch with The Hardware Guru. Business inquiries, hardware reviews, and community support.' 
    : 'Kontaktujte The Hardware Guru. Obchodní spolupráce, žádosti o recenze hardwaru a komunitní podpora.';

  const canonicalUrl = `${baseUrl}/contact`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'en': `${baseUrl}/en/contact`, 'cs': canonicalUrl, 'x-default': canonicalUrl }
    }
  };
}

export default function ContactPage(props) {
  const isEn = props?.isEn === true;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Contact" : "Kontakt", "item": `${baseUrl}${isEn ? '/en' : ''}/contact` }
    ]
  };

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": isEn ? "Contact The Hardware Guru" : "Kontaktujte The Hardware Guru",
    "description": isEn ? "Official contact information." : "Oficiální kontaktní informace.",
    "url": `${baseUrl}${isEn ? '/en' : ''}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "name": "The Hardware Guru",
      "email": "thehardwareguru@seznam.cz"
    }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(contactPageSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="contact-badge">
            <Mail size={16} /> {isEn ? 'GET IN TOUCH' : 'OZVĚTE SE NÁM'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CONTACT' : 'KONTAKTUJTE'} <span style={{ color: '#66fcf1', textShadow: '0 0 30px rgba(102, 252, 241, 0.5)' }}>{isEn ? 'US' : 'NÁS'}</span>
          </h1>
        </header>

        <section className="content-box-style">
          <div className="guru-prose">
            <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '40px' }}>
              {isEn 
                ? 'Whether you have a business inquiry, want us to review your hardware, or just need to say hi, we are here for you.' 
                : 'Ať už máte zájem o obchodní spolupráci, chcete nám zaslat hardware k recenzi, nebo jen chcete pozdravit, jsme tu pro vás.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="contact-card">
                    <Mail size={32} color="#66fcf1" style={{ marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#fff' }}>E-mail</h3>
                    <p style={{ margin: 0, color: '#9ca3af', fontWeight: 'bold' }}>thehardwareguru@seznam.cz</p>
                </div>
                <div className="contact-card">
                    <MessageSquare size={32} color="#5865F2" style={{ marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#fff' }}>Discord</h3>
                    <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{ margin: 0, color: '#5865F2', textDecoration: 'none', fontWeight: 'bold' }}>Guru Community</a>
                </div>
            </div>

            {/* 🚀 GURU FIX: Reálná data pro Seznam a AdSense (Identifikace provozovatele) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '30px', borderRadius: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Briefcase size={24} color="#66fcf1" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', borderLeft: 'none', paddingLeft: 0 }}>
                  {isEn ? 'Operator Details' : 'Provozovatel webu'}
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '1.1rem', color: '#d1d5db' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{isEn ? 'Name:' : 'Jméno / Fyzická osoba:'}</strong><br/>
                  Petr Ťapťuch
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>{isEn ? 'Address:' : 'Sídlo / Adresa:'}</strong><br/>
                  Albrechtická 560/94<br/>
                  794 01 Krnov<br/>
                  {isEn ? 'Czech Republic' : 'Česká republika'}
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>{isEn ? 'Reg. Number (IČO):' : 'IČO:'}</strong><br/>
                  69606846
                  <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#9ca3af' }}>{isEn ? 'Non-VAT payer' : 'Neplátce DPH'}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '20px', fontStyle: 'italic' }}>
                {isEn 
                  ? 'The portal is operated by an individual properly registered in the Czech Republic. For business or legal inquiries, please use the email above.' 
                  : 'Portál je provozován fyzickou osobou podnikající dle živnostenského zákona. Pro obchodní či právní dotazy využijte výše uvedený e-mail.'}
              </p>
            </div>

            <h2>{isEn ? 'Social Media' : 'Sociální sítě'}</h2>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn live"><Activity size={18}/> KICK</a>
              <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" className="social-btn yt"><Youtube size={18}/> YOUTUBE</a>
            </div>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .contact-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.1); margin-bottom: 20px; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 50px 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }
        .contact-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 30px; text-align: center; transition: 0.3s; }
        .contact-card:hover { border-color: rgba(102, 252, 241, 0.3); transform: translateY(-5px); }
        .social-btn { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; border: 1px solid transparent; }
        .social-btn.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn.live:hover { background: rgba(83, 252, 24, 0.2); }
        .social-btn.yt { background: rgba(255, 0, 0, 0.1); color: #ff0000; border-color: rgba(255, 0, 0, 0.3); }
        .social-btn.yt:hover { background: rgba(255, 0, 0, 0.2); }
        @media (max-width: 768px) { .content-box-style { padding: 30px 20px; } }
      `}} />
    </div>
  );
}
