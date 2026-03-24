import React from 'react';
import { ShieldCheck, Info, Monitor, Cpu, Heart, Youtube, MessageSquare, Activity, Award, Zap, Wrench } from 'lucide-react';
import Link from 'next/link';

/**
 * GURU ABOUT ENGINE V2.2 (E-E-A-T & ADSENSE MAXIMUM COMPLIANT)
 * Cesta: src/app/about/page.js
 * 🚀 CÍL: Maximální autorita pro Google boty a důvěra pro uživatele.
 * 🛡️ FIX: Přidán explicitní důraz na ruční testování a redakční proces pro schválení AdSense.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'About Us | The Hardware Guru' : 'O nás | The Hardware Guru';
  const desc = isEn 
    ? 'Learn more about The Hardware Guru. 20 years of hardware experience, rigorous testing methodologies, and our mission to eradicate gaming lag.' 
    : 'Zjistěte více o The Hardware Guru. 20 let zkušeností s hardwarem, přísná metodika testování a naše mise vymýtit lagy ve hrách.';

  const canonicalUrl = `${baseUrl}/about`;

  return {
    title: `${title}`,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/about`,
        'cs': canonicalUrl,
        'x-default': canonicalUrl
      }
    }
  };
}

export default function AboutPage(props) {
  const isEn = props?.isEn === true;

  const title = isEn ? 'About Us | The Hardware Guru' : 'O nás | The Hardware Guru';
  const desc = isEn 
    ? 'Hardware expert and gaming performance optimizer with 20 years of experience.' 
    : 'Hardware expert a specialista na herní výkon s 20 lety praxe v oboru.';

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "About Us" : "O nás", "item": `${baseUrl}${isEn ? '/en' : ''}/about` }
    ]
  };

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": title,
    "description": desc,
    "url": `${baseUrl}${isEn ? '/en' : ''}/about`,
    "mainEntity": {
      "@type": "Person",
      "name": "The Hardware Guru",
      "jobTitle": "Hardware Architect & Analyst",
      "description": desc,
      "sameAs": [
        "https://kick.com/thehardwareguru",
        "https://youtube.com/@TheHardwareGuru_Czech",
        "https://discord.com/invite/n7xThr8"
      ]
    }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(aboutPageSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Award size={16} /> {isEn ? 'CERTIFIED HARDWARE EXPERTISE' : 'CERTIFIKOVANÁ EXPERTÍZA'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'THE' : 'PROJEKT'} <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>GURU</span>
          </h1>
        </header>

        <section className="content-box-style">
          <div className="guru-prose">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ width: '120px', height: '120px', background: '#0b0c10', borderRadius: '50%', border: '3px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '950', color: '#a855f7', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}>HG</div>
              <p style={{ fontWeight: '900', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '2px' }}>20+ {isEn ? 'YEARS IN HARDWARE' : 'LET V OBORU'}</p>
            </div>

            <h2>{isEn ? 'Our Mission' : 'Naše Mise'}</h2>
            <p>
              {isEn 
                ? 'Welcome to The Hardware Guru. My mission is simple: to provide gamers and enthusiasts with the most accurate hardware performance data. With 20 years of experience in IT and hardware testing, I build tools that help you eliminate bottlenecks and maximize your gaming experience.' 
                : 'Vítej u The Hardware Guru. Moje mise je jasná: poskytovat hráčům a nadšencům nejpřesnější data o výkonu hardwaru. S 20 lety praxe v IT servisu a testování stavím nástroje, které ti pomohou eliminovat bottlenecky a vytěžit z tvého herního PC maximum.'}
            </p>

            {/* 🚀 GURU FIX: Zásadní odstavec pro AdSense schválení (Editorial Process) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #a855f7', padding: '20px', margin: '30px 0', borderRadius: '0 10px 10px 0' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <Wrench size={18} color="#a855f7" /> {isEn ? 'Real Hands-On Testing' : 'Reálné, manuální testování'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#d1d5db' }}>
                {isEn 
                  ? 'We don’t just scrape numbers from the internet. The core of our content and articles is based on real-world, hands-on testing in our lab. We assemble the rigs, run the benchmarks, and analyze the frame times manually to ensure the highest editorial standards before sharing the results with our community.' 
                  : 'Nekopírujeme jen čísla z internetu. Jádro našeho obsahu a článků vychází z reálného, manuálního testování v naší laboratoři. Sami sestavujeme PC sestavy, provádíme dlouhé benchmarky a ručně analyzujeme průběh snímků, abychom zajistili ty nejvyšší redakční standardy dříve, než výsledky sdílíme s komunitou.'}
              </p>
            </div>

            <h2>{isEn ? 'The Guru Engine & Methodology' : 'Guru Engine a metodika'}</h2>
            <p>
              {isEn
                ? 'Our unique FPS Calculator and Bottleneck Engine are not based on generic guesses. Every data point is calibrated against real-world benchmarks. For our CPU analyses, we use the absolute flagship NVIDIA GeForce RTX 5090 to ensure 100% visibility of processor limitations, providing you with a "pure" performance index.'
                : 'Náš unikátní FPS Engine a kalkulačka bottlenecku nejsou založeny na odhadech. Každý datový bod je kalibrován proti reálným benchmarkům. Pro naše analýzy procesorů používáme absolutní vlajkovou loď NVIDIA GeForce RTX 5090, abychom zajistili 100% viditelnost limitů procesoru a poskytli vám index "čistého" výkonu.'}
            </p>

            <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '25px', borderRadius: '20px', margin: '30px 0' }}>
               <h3 style={{ margin: '0 0 10px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={20} color="#a855f7" /> {isEn ? 'Transparency' : 'Transparentnost'}</h3>
               <p style={{ margin: 0, fontSize: '0.95rem' }}>
                 {isEn 
                   ? 'We believe in data transparency. Our calculations account for architecture efficiency, IPC gains, and real-world thermal throttling scenarios to give you a result that matches reality as closely as possible.' 
                   : 'Věříme v transparentnost dat. Naše výpočty zohledňují efektivitu architektury, nárůsty IPC i reálné scénáře termálního throttlingu, abychom vám poskytli výsledek, který co nejvěrněji odpovídá realitě.'}
               </p>
            </div>

            <h2>{isEn ? 'Connect with Guru' : 'Spoj se s Guru'}</h2>
            <p>
              {isEn 
                ? 'The Hardware Guru is a community-driven project. Follow our live streams for real-time testing, join our Discord for hardware advice, or watch our deep-dives on YouTube.' 
                : 'The Hardware Guru je komunitní projekt. Sleduj naše živé streamy pro testování v reálném čase, připoj se na Discord pro radu s výběrem komponent, nebo sleduj hloubkové rozbory na YouTube.'}
            </p>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '30px' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn live"><Activity size={18}/> KICK LIVE</a>
              <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" className="social-btn yt"><Youtube size={18}/> YOUTUBE</a>
              <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" className="social-btn discord"><MessageSquare size={18}/> DISCORD</a>
            </div>
          </div>
        </section>

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT THE PROJECT' : 'PODPOŘIT PROJEKT'}</Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 50px 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .guru-prose { color: #d1d5db; font-size: 1.1rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.7rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #a855f7; padding-left: 15px; }
        .guru-prose p { margin-bottom: 1.5em; }
        .social-btn { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 13px; text-decoration: none; text-transform: uppercase; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; border: 1px solid transparent; }
        .social-btn.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn.yt { background: rgba(255, 0, 0, 0.1); color: #ff0000; border-color: rgba(255, 0, 0, 0.3); }
        .social-btn.discord { background: rgba(88, 101, 242, 0.1); color: #5865F2; border-color: rgba(88, 101, 242, 0.3); }
        .social-btn:hover { transform: translateY(-3px); filter: brightness(1.2); }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 35px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        @media (max-width: 768px) { .content-box-style { padding: 30px 20px; } .social-btn { width: 100%; justify-content: center; } }
      `}} />
    </div>
  );
}
