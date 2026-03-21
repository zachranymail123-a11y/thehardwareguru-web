"use client";
import React from 'react';
import { Home, Lightbulb, Book, PenTool, Newspaper, Monitor, Tv, Disc as DiscordIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * GURU SESTAVY HUB V1.1 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Monetizace rozcestníku sestav skrze strategické A-ADS sloty.
 */

export default function SestavyPage() {
  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: 'sans-serif', 
      padding: '0 0 40px 0' 
    }}>
      
      {/* HLAVNÍ NAVIGACE */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '25px', 
        padding: '20px', 
        background: 'rgba(0,0,0,0.7)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap'
      }}>
        <Link href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/clanky" style={navItemStyle}><Newspaper size={18} /> ČLÁNKY</Link>
        <Link href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/sestavy" style={{...navItemStyle, color: '#eab308'}}><Monitor size={18} /> SESTAVY</Link>
        <Link href="/slovnik" style={navItemStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={navItemStyle}><PenTool size={18} /> PRAKTICKÉ RADY</Link>
      </nav>

      <div style={{ padding: '40px 20px' }}>
        
        {/* SOCIAL BAR */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '40px' }}>
          <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
          <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
          <Link href="/support" style={socialBtnStyle('#eab308', true)}>SUPPORT</Link>
        </div>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD SOCIÁLNÍMI SÍTĚMI */}
        <div className="guru-sestavy-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        {/* HLAVNÍ OBSAH */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h1 style={{ textAlign: 'center', fontSize: '48px', fontWeight: '950', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '40px' }}>
            Herní <span style={{ color: '#eab308' }}>Sestavy</span>
          </h1>

          <div style={{
            background: 'rgba(17, 19, 24, 0.85)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(234, 179, 8, 0.4)', 
            borderRadius: '28px', 
            padding: '40px',
            boxShadow: '0 0 40px rgba(234, 179, 8, 0.1)'
          }}>
            
            <div style={{ color: '#9ca3af', fontSize: '18px', lineHeight: '1.8', marginBottom: '30px', fontWeight: '300' }}>
              <p style={{ marginBottom: '20px' }}>
                Trh s hardwarem se v posledních dnech totálně <span style={{ color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #eab308' }}>utrhl ze řetězu</span>. 
                Ceny procesorů a grafik skáčou nahoru a dolů a statické tabulky se stávají neaktuálními během pár hodin.
              </p>
              <p>
                Chci pro vás to nejlepší, ne "to, co bylo levné včera". Proto sestavy navrhuji individuálně.
              </p>
            </div>

            {/* 🔥 ADS SLOT #2: MID-CONTENT PLACEMENT (PŘED CTA) */}
            <div className="guru-sestavy-ad-slot" style={{ border: 'none', margin: '20px 0 40px' }}>
                <span className="ad-label">Sponsored Hardware Recommendation</span>
                <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            </div>

            <div style={{ 
              background: 'rgba(0, 0, 0, 0.4)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '20px', 
              padding: '30px', 
              textAlign: 'center' 
            }}>
              <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '15px' }}>
                Navrhnu vám mašinu na míru
              </h2>
              <p style={{ color: '#fff', fontSize: '16px', marginBottom: '30px', fontWeight: 'bold' }}>
                Individuální návrh sestavy řeším osobně na mém Discordu. <br/>
                Jedinou podmínkou je aktivní <span style={{ color: '#eab308' }}>Subscribe na mém Kicku</span>.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noopener noreferrer" style={{...ctaBtnStyle, background: '#eab308', color: '#000'}}>
                  <Tv size={20} /> SUBSCRIBE NA KICKU
                </a>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={{...ctaBtnStyle, background: '#5865F2', color: '#fff'}}>
                  <DiscordIcon size={20} /> DOVAL NA DISCORD
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-sestavy-ad-slot { max-width: 800px; margin: 0 auto 40px; padding: 15px; background: rgba(234, 179, 8, 0.02); border: 1px solid rgba(234, 179, 8, 0.1); border-radius: 24px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }
        @media (max-width: 768px) { .ad-desktop { display: none; } .ad-mobile { display: block; } }
      `}} />
    </div>
  );
}

const navItemStyle = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' };
const socialBtnStyle = (color, isSupport = false) => ({ color: color, textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: `1px solid ${color}`, padding: '8px 16px', borderRadius: '12px', background: isSupport ? `${color}1a` : 'transparent' });
const ctaBtnStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 25px', borderRadius: '12px', fontWeight: '900', textTransform: 'uppercase', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' };
