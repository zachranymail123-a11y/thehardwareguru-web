"use client";

import React, { useState, useEffect } from 'react';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Tv, Disc as DiscordIcon } from 'lucide-react';
import Link from 'next/link';
import SeznamAd from '../../components/SeznamAd';

/**
 * GURU SESTAVY HUB V1.3 (MOBILE OPTIMIZED & ADS SEPARATION)
 * 🚀 CÍL: Maximální monetizace rozcestníku sestav a perfektní mobilní UX.
 */

export default function SestavyPage() {
  const [isEn, setIsEn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEn(window.location.pathname.startsWith('/en'));
    }
  }, []);

  const content = {
    title: isEn ? "PC BUILD" : "HERNÍ",
    subtitle: isEn ? "CONFIGURATOR" : "SESTAVY",
    description1: isEn 
      ? "The hardware market has gone completely crazy lately." 
      : "Trh s hardwarem se v posledních dnech totálně utrhl ze řetězu.",
    description2: isEn
      ? "Prices of CPUs and GPUs are jumping up and down, making static tables obsolete within hours."
      : "Ceny procesorů a grafik skáčou nahoru a dolů a statické tabulky se stávají neaktuálními během pár hodin.",
    description3: isEn
      ? "I want only the best for you, not 'what was cheap yesterday'. That's why I design builds individually."
      : "Chci pro vás to nejlepší, ne 'to, co bylo levné včera'. Proto sestavy navrhuji individuálně.",
    ctaTitle: isEn ? "Custom PC Build for You" : "Navrhnu vám mašinu na míru",
    ctaDesc: isEn 
      ? "I handle individual build designs personally on my Discord. The only condition is an active Subscribe on my Kick."
      : "Individuální návrh sestavy řeším osobně na mém Discordu. Jedinou podmínkou je aktivní Subscribe na mém Kicku.",
    kickBtn: isEn ? "SUBSCRIBE ON KICK" : "SUBSCRIBE NA KICKU",
    discordBtn: isEn ? "JOIN DISCORD" : "DOVAL NA DISCORD",
    nav: {
      home: isEn ? "HOME" : "HOMEPAGE",
      articles: isEn ? "ARTICLES" : "ČLÁNKY",
      tips: isEn ? "TIPS" : "TIPY",
      builds: isEn ? "BUILDS" : "SESTAVY",
      wiki: isEn ? "WIKI" : "SLOVNÍK",
      guides: isEn ? "GUIDES" : "RADY"
    }
  };

  return (
    <div className="guru-hub-wrapper" style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: 'sans-serif', 
      padding: '0 0 40px 0' 
    }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .nav-sestavy { display: flex; justify-content: center; gap: 25px; padding: 20px; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(234, 179, 8, 0.2); position: sticky; top: 0; z-index: 100; transition: 0.3s; }
        .nav-item { color: #fff; text-decoration: none; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 8px; transition: 0.2s; white-space: nowrap; }
        .nav-item:hover { color: #eab308; }

        .main-card { background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(15px); border: 1px solid rgba(234, 179, 8, 0.4); borderRadius: 28px; padding: 40px; boxShadow: 0 20px 50px rgba(0,0,0,0.5); }
        .cta-inner-box { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 30px; text-align: center; }

        .guru-cta-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px 30px; border-radius: 14px; font-weight: 950; text-transform: uppercase; text-decoration: none; font-size: 15px; transition: 0.3s; border: none; }
        .guru-cta-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-hub-wrapper { padding-top: 0px !important; }
            .nav-sestavy { justify-content: flex-start !important; overflow-x: auto; gap: 20px !important; padding: 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-h1 { font-size: 2.2rem !important; }
            .main-card { padding: 25px 15px !important; border-radius: 20px !important; }
            .desc-text { font-size: 1rem !important; line-height: 1.6 !important; }
            .cta-inner-box { padding: 20px 15px !important; }
            .cta-inner-box h2 { font-size: 1.4rem !important; }
            .guru-cta-btn { width: 100%; }
            .social-bar { gap: 10px !important; }
        }
      `}} />

      <nav className="nav-sestavy">
        <Link href="/" className="nav-item"><Home size={18} /> {content.nav.home}</Link>
        <Link href="/clanky" className="nav-item"><Newspaper size={18} /> {content.nav.articles}</Link>
        <Link href="/tipy" className="nav-item"><Lightbulb size={18} /> {content.nav.tips}</Link>
        <Link href="/sestavy" className="nav-item" style={{color: '#eab308'}}><Monitor size={18} /> {content.nav.builds}</Link>
        <Link href="/slovnik" className="nav-item"><Book size={18} /> {content.nav.wiki}</Link>
        <Link href="/rady" className="nav-item"><PenTool size={18} /> {content.nav.guides}</Link>
      </nav>

      <div className="inner-container" style={{ padding: '40px 20px' }}>
        
        <div className="social-bar" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '40px' }}>
          <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
          <Link href="/support" style={socialBtnStyle('#eab308', true)}>{isEn ? 'SUPPORT' : 'PODPORA'}</Link>
        </div>

        {/* 🔥 TOP AD SLOT - STRIKTNÍ SEPARACE */}
        <div style={{ marginBottom: '40px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h1 className="main-h1" style={{ textAlign: 'center', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '950', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '40px', lineHeight: 1 }}>
            {content.title} <span style={{ color: '#eab308' }}>{content.subtitle}</span>
          </h1>

          <div className="main-card">
            <div className="desc-text" style={{ color: '#d1d5db', fontSize: '18px', lineHeight: '1.8', marginBottom: '30px', fontWeight: '300' }}>
              <p style={{ marginBottom: '20px' }}>
                {content.description1} <span style={{ color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #eab308' }}>{isEn ? "completely loose" : "utrhl ze řetězu"}</span>. 
                {content.description2}
              </p>
              <p>
                {content.description3}
              </p>
            </div>

            {/* 🔥 MID AD SLOT - STRIKTNÍ SEPARACE (POUZE MOBIL) */}
            <div className="ad-mobile-wrapper" style={{ marginBottom: '40px' }}>
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>

            <div className="cta-inner-box">
              <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '15px' }}>
                {content.ctaTitle}
              </h2>
              <p style={{ color: '#fff', fontSize: '16px', marginBottom: '30px', fontWeight: 'bold' }}>
                {content.ctaDesc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" className="guru-cta-btn" style={{ background: '#eab308', color: '#000'}}>
                  <Tv size={20} /> {content.kickBtn}
                </a>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="guru-cta-btn" style={{ background: '#5865F2', color: '#fff'}}>
                  <DiscordIcon size={20} /> {content.discordBtn}
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const socialBtnStyle = (color, isSupport = false) => ({ color: color, textDecoration: 'none', fontWeight: '900', fontSize: '12px', border: `1px solid ${color}`, padding: '10px 20px', borderRadius: '12px', background: isSupport ? `${color}1a` : 'transparent', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '1px' });
