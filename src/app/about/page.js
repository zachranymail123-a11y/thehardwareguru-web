import React from 'react';
import { ShieldCheck, Info, Monitor, Cpu, Heart, Flame, Youtube, MessageSquare, Activity } from 'lucide-react';
import Link from 'next/link';

export const runtime = "nodejs";
export const revalidate = 86400;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'About Us | The Hardware Guru' : 'O nás | The Hardware Guru';
  const desc = isEn 
    ? 'Learn more about The Hardware Guru. 20 years of hardware experience, testing methodologies, and our mission to eradicate gaming lag.' 
    : 'Zjistěte více o The Hardware Guru. 20 let zkušeností s hardwarem, metodika testování a naše mise vymýtit lagy ve hrách.';

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/about`,
      languages: {
        'en': `${baseUrl}/en/about`,
        'cs': `${baseUrl}/about`,
        'x-default': `${baseUrl}/about`
      }
    }
  };
}

export default function AboutPage(props) {
  const isEn = props?.isEn === true;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "About Us" : "O nás", "item": `${baseUrl}${isEn ? '/en' : ''}/about` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Info size={16} /> {isEn ? 'THE GURU STORY' : 'PŘÍBĚH GURU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'ABOUT' : 'O'} <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>{isEn ? 'US' : 'NÁS'}</span>
          </h1>
        </header>

        <section className="content-box-style">
          <div className="guru-prose">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ width: '120px', height: '120px', background: '#0b0c10', borderRadius: '50%', border: '3px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '950', color: '#a855f7', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}>HG</div>
            </div>

            <h2>{isEn ? 'Our Mission' : 'Naše Mise'}</h2>
            <p>
              {isEn 
                ? 'Welcome to The Hardware Guru! I am your guide to modern technology, hardcore hardware, and gaming. With over 20 years of practical experience in IT service and hardware testing, my mission is simple: to eradicate lags, tame frame rates, and build an ideal environment where every geek feels at home.' 
                : 'Vítej ve světě The Hardware Guru! Jsem tvůj průvodce moderní technologií, hardwarem a gamingem. S více než 20 lety praxe v IT servisu a testování hardwaru je moje mise jednoduchá: vymýtit lagy, zkrotit FPS a vytvořit ideální místo, kde se každý geek cítí jako doma.'}
            </p>

            <h2>{isEn ? 'Testing Methodology' : 'Metodika Testování'}</h2>
            <p>
              {isEn
                ? 'We do not rely on manufacturer claims. Every CPU and GPU benchmark in our database is strictly calculated and calibrated using pure processing power indices. For instance, our CPU gaming tests are conducted alongside the absolute flagship NVIDIA GeForce RTX 5090 to ensure 100% CPU bottleneck visibility without GPU limitations.'
                : 'Nespoléháme se na tvrzení výrobců. Každý CPU a GPU benchmark v naší databázi je striktně kalkulován a kalibrován na základě indexů hrubého výpočetního výkonu. Například naše herní testy procesorů simulují zapojení absolutní vlajkové lodi NVIDIA GeForce RTX 5090, abychom zajistili 100% viditelnost CPU bottlenecku bez grafického omezení.'}
            </p>

            <h2>{isEn ? 'Join the Community' : 'Přidej se ke komunitě'}</h2>
            <p>
              {isEn 
                ? 'The Hardware Guru is not just a database; it is a living organism. Join our Discord, tune into our live streams on Kick, or watch deep-dive analyses on YouTube.' 
                : 'The Hardware Guru není jen databáze, je to živý organismus. Připoj se na náš Discord, sleduj živé streamy na platformě Kick nebo detailní hardwarové rozbory na YouTube.'}
            </p>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '30px' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn live"><Activity size={18}/> KICK LIVE</a>
              <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" className="social-btn yt"><Youtube size={18}/> YOUTUBE</a>
              <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" className="social-btn discord"><MessageSquare size={18}/> DISCORD</a>
            </div>
          </div>
        </section>

        <div style={{ marginTop: '60px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 50px 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 4px solid #a855f7; padding-left: 15px; }
        .guru-prose p { margin-bottom: 1.5em; }
        .social-btn { padding: 14px 28px; border-radius: 14px; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; border: 1px solid transparent; }
        .social-btn.live { background: rgba(83, 252, 24, 0.1); color: #53fc18; border-color: rgba(83, 252, 24, 0.3); }
        .social-btn.live:hover { background: rgba(83, 252, 24, 0.2); }
        .social-btn.yt { background: rgba(255, 0, 0, 0.1); color: #ff0000; border-color: rgba(255, 0, 0, 0.3); }
        .social-btn.yt:hover { background: rgba(255, 0, 0, 0.2); }
        .social-btn.discord { background: rgba(88, 101, 242, 0.1); color: #5865F2; border-color: rgba(88, 101, 242, 0.3); }
        .social-btn.discord:hover { background: rgba(88, 101, 242, 0.2); }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        @media (max-width: 768px) { .content-box-style { padding: 30px 20px; } .social-btn { width: 100%; justify-content: center; } }
      `}} />
    </div>
  );
}
