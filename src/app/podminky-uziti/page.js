"use client";
import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TermsOfService() {
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  const content = {
    cs: {
      title: 'PODMÍNKY UŽITÍ',
      subtitle: 'Pravidla základny. Sleduj, čti, ale nebuď kokot.',
      section1: 'Obsah webu',
      text1: 'Veškerý obsah na webu The Hardware Guru je chráněn autorským právem. Kopírování bez souhlasu autora je zakázáno.',
      section2: 'Odpovědnost',
      text2: 'Veškeré technické zásahy a tweaky provádíte na vlastní nebezpečí. Guru neručí za odpálený hardware při nesprávné aplikaci rad.',
      back: 'ZPĚT NA ZÁKLADNU'
    },
    en: {
      title: 'TERMS OF SERVICE',
      subtitle: 'Base rules. Watch, read, but don\'t be a prick.',
      section1: 'Website Content',
      text1: 'All content on The Hardware Guru website is protected by copyright. Copying without author\'s consent is prohibited.',
      section2: 'Liability',
      text2: 'All technical interventions and tweaks are performed at your own risk. Guru is not responsible for blown hardware due to incorrect application of advice.',
      back: 'BACK TO BASE'
    }
  };

  const t = isEn ? content.en : content.cs;

  return (
    <div style={pageWrapper}>
      <article style={container}>
        <div style={contentBox}>
          <header style={{ marginBottom: '40px' }}>
            <Link href={isEn ? "/en" : "/"} style={backLink}><ArrowLeft size={16} /> {t.back}</Link>
            <div style={{ color: '#eab308', marginBottom: '20px' }}><FileText size={56} /></div>
            <h1 style={titleStyle}>{t.title}</h1>
            <p style={subtitleStyle}>{t.subtitle}</p>
          </header>

          <div className="article-body">
            <h2>{t.section1}</h2>
            <p>{t.text1}</p>
            <h2>{t.section2}</h2>
            <p>{t.text2}</p>
            <p style={{ marginTop: '50px', fontSize: '14px', color: '#444' }}>Hardware Guru System v2.0</p>
          </div>
        </div>
      </article>
    </div>
  );
}

const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px 80px' };
const container = { maxWidth: '850px', margin: '0 auto' };
const contentBox = { background: 'rgba(10, 11, 13, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '32px', padding: '60px', border: '1px solid rgba(234, 179, 8, 0.2)', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' };
const backLink = { display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', textDecoration: 'none', fontWeight: '900', fontSize: '13px', marginBottom: '35px', textTransform: 'uppercase' };
const titleStyle = { fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: '950', textTransform: 'uppercase', color: '#fff', margin: 0 };
const subtitleStyle = { color: '#9ca3af', fontSize: '20px', fontWeight: '600', marginTop: '15px' };
