"use client";
import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Eye, Database, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PrivacyPolicy() {
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  const content = {
    cs: {
      title: 'OCHRANA SOUKROMÍ',
      subtitle: 'Tvá data jsou u nás v bezpečí. Žádný bullshit, jen čistá technická fakta.',
      intro: 'Tento dokument vysvětluje, jak Hardware Guru nakládá s vašimi údaji. Transparentnost je pro nás prioritou.',
      section1: 'Jaké údaje sbíráme?',
      text1: 'Sbíráme pouze nezbytné technické údaje pro analýzu návštěvnosti (Google Analytics) a doručování notifikací (OneSignal). Žádná data neprodáváme třetím stranám.',
      section2: 'Cookies a sledování',
      text2: 'Používáme technické cookies pro správné fungování webu a analytické nástroje pro zlepšování obsahu, který tě baví.',
      section3: 'Notifikace (OneSignal)',
      text3: 'Pokud povolíš notifikace, OneSignal sbírá anonymní ID tvého prohlížeče, abychom tě mohli upozornit na nový článek nebo live stream na Kicku.',
      rights: 'Tvá práva',
      rightsText: 'Máš právo na přístup ke svým údajům, jejich opravu nebo výmaz. Vzhledem k tomu, že nesbíráme osobní identitu (jména/emaily), probíhá většina procesů na úrovni tvého prohlížeče.',
      back: 'ZPĚT NA ZÁKLADNU'
    },
    en: {
      title: 'PRIVACY POLICY',
      subtitle: 'Your data is safe with us. No bullshit, just clean technical facts.',
      intro: 'This document explains how Hardware Guru handles your data. Transparency is our priority.',
      section1: 'What data do we collect?',
      text1: 'We only collect essential technical data for traffic analysis (Google Analytics) and notification delivery (OneSignal). We never sell data to third parties.',
      section2: 'Cookies and Tracking',
      text2: 'We use technical cookies for proper website functionality and analytics tools to improve the content you enjoy.',
      section3: 'Notifications (OneSignal)',
      text3: 'If you enable notifications, OneSignal collects an anonymous ID of your browser so we can alert you about a new article or Kick live stream.',
      rights: 'Your Rights',
      rightsText: 'You have the right to access, correct, or delete your data. Since we do not collect personal identities (names/emails), most processes occur at your browser level.',
      back: 'BACK TO BASE'
    }
  };

  const t = isEn ? content.en : content.cs;

  return (
    <div style={pageWrapper}>
      <article style={container}>
        <div style={contentBox}>
          <header style={{ marginBottom: '50px' }}>
            <Link href={isEn ? "/en" : "/"} style={backLink}>
              <ArrowLeft size={16} /> {t.back}
            </Link>
            <div style={{ color: '#66fcf1', marginBottom: '25px', display: 'flex', gap: '15px' }}>
              <Lock size={56} style={{ filter: 'drop-shadow(0 0 10px rgba(102, 252, 241, 0.5))' }} />
            </div>
            <h1 style={titleStyle}>{t.title}</h1>
            <p style={subtitleStyle}>{t.subtitle}</p>
          </header>

          <div className="article-body">
            <p style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '40px' }}>{t.intro}</p>
            
            <div style={sectionGrid}>
              <div style={infoCard}>
                <Database size={24} color="#66fcf1" style={{ marginBottom: '15px' }} />
                <h2 style={sectionTitle}>{t.section1}</h2>
                <p style={sectionText}>{t.text1}</p>
              </div>

              <div style={infoCard}>
                <Eye size={24} color="#66fcf1" style={{ marginBottom: '15px' }} />
                <h2 style={sectionTitle}>{t.section2}</h2>
                <p style={sectionText}>{t.text2}</p>
              </div>

              <div style={infoCard}>
                <Bell size={24} color="#66fcf1" style={{ marginBottom: '15px' }} />
                <h2 style={sectionTitle}>{t.section3}</h2>
                <p style={sectionText}>{t.text3}</p>
              </div>
            </div>

            <div style={{ marginTop: '50px', borderTop: '1px solid rgba(102, 252, 241, 0.1)', paddingTop: '40px' }}>
               <h2 style={sectionTitle}>{t.rights}</h2>
               <p style={sectionText}>{t.rightsText}</p>
            </div>

            <p style={{ marginTop: '60px', fontSize: '13px', color: '#444', fontWeight: '900', letterSpacing: '1px' }}>
              LAST UPDATE: {new Date().toLocaleDateString()} | HARDWARE GURU SYSTEM v2.0
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

// --- GURU MASTER STYLES ---
const pageWrapper = { 
  minHeight: '100vh', 
  backgroundColor: '#0a0b0d', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover', 
  backgroundAttachment: 'fixed', 
  padding: '120px 20px 80px' 
};

const container = { maxWidth: '1000px', margin: '0 auto' };

const contentBox = { 
  background: 'rgba(10, 11, 13, 0.96)', 
  backdropFilter: 'blur(25px)', 
  borderRadius: '32px', 
  padding: '60px', 
  border: '1px solid rgba(102, 252, 241, 0.15)', 
  boxShadow: '0 40px 100px rgba(0,0,0,0.9)' 
};

const backLink = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  color: '#66fcf1', 
  textDecoration: 'none', 
  fontWeight: '900', 
  fontSize: '13px', 
  marginBottom: '35px', 
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const titleStyle = { 
  fontSize: 'clamp(32px, 5vw, 64px)', 
  fontWeight: '950', 
  textTransform: 'uppercase', 
  color: '#fff', 
  margin: 0,
  lineHeight: '1',
  letterSpacing: '-2px'
};

const subtitleStyle = { 
  color: '#9ca3af', 
  fontSize: '20px', 
  fontWeight: '700', 
  marginTop: '20px',
  lineHeight: '1.4'
};

const sectionGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '30px',
  margin: '40px 0'
};

const infoCard = {
  background: 'rgba(255,255,255,0.03)',
  padding: '30px',
  borderRadius: '20px',
  border: '1px solid rgba(102, 252, 241, 0.05)'
};

const sectionTitle = { 
  fontSize: '20px', 
  fontWeight: '900', 
  color: '#fff', 
  textTransform: 'uppercase', 
  marginBottom: '15px' 
};

const sectionText = { 
  color: '#9ca3af', 
  fontSize: '16px', 
  lineHeight: '1.6' 
};
