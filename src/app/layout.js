import './globals.css'; 
import Script from 'next/script';
import Tracker from '../components/Tracker'; 
import SocialTracker from '../components/SocialTracker';
import PartnerWidget from '../components/PartnerWidget'; // 🔥 PONECHÁN DLE PŘÁNÍ
import Navbar from '../components/Navbar'; 
import { Analytics } from '@vercel/analytics/react';
import VisitorCounter from '../components/VisitorCounter';
import ShareWidget from '../components/ShareWidget';
import CookieBanner from '../components/CookieBanner';
import AdBlockDetector from '../components/AdBlockDetector';

import MobileAnchorAd from '../components/MobileAnchorAd';
import AdTracker from '../components/AdTracker';

// 🔥 IMPORTY PRO VIP SESTAVU A PARTNERY
import { Cpu, ShieldCheck, Layers, Gamepad2, Lightbulb, Bookmark, ShoppingCart, Rocket } from 'lucide-react';

/**
 * GURU ROOT LAYOUT V10.1 (FULL AFFILIATE WALLS - 2 COLUMNS)
 * 🚀 CÍL: Rozšíření affiliate strategie na pravý sloupec (GURU PARTNEŘI) s automatickým zarovnáním bannerů do 2 SLOUPCŮ a responzivitou.
 */

export const metadata = {
  title: {
    default: 'Hardware Guru | PC Benchmarks, Tech News & AI Tools',
    template: '%s | Hardware Guru'
  },
  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI.',
  metadataBase: new URL('https://thehardwareguru.cz'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

// --- GURU VIP BOX COMPONENT (GLOBÁLNÍ PRO LAYOUT - LEVÁ STRANA) ---
const GuruBuildItem = ({ icon, name, link }) => (
    <li style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ background: 'rgba(102, 252, 241, 0.05)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(102, 252, 241, 0.1)', flexShrink: 0, color: '#66fcf1' }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', lineHeight: '1.3' }}>{name}</div>
        </div>
        <a href={link} target="_blank" rel="nofollow sponsored" style={{ background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(102, 252, 241, 0.3)', transition: '0.3s', whiteSpace: 'nowrap', flexShrink: 0 }} className="hover-scale">KOUPIT</a>
    </li>
);

const GlobalVIPBox = ({ isEn }) => {
  const links = {
    cpu: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FAMD-Ryzen-7-9800X3D-4p200972`,
    mobo: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FGIGABYTE-X870E-AORUS-ELITE-X3D-4p249878`,
    ram: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FKingston-FURY-Beast-Black-DDR5-32GB-6000MT-s-CL30-DIMM-2x16GB-EXPO-XMP-4p205565`,
    gpu: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FZOTAC-NVIDIA-GeForce-RTX-5070-Twin-Edge-4p242198`,
    disk: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FMSI-SPATIUM-M461-M-2-2TB-4p116277`,
    case: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FVyhledavani%2Fpocitacove-skrine%3Fquery%3Datx%26s%3Dp`
  };

  return (
    <div className="global-vip-container">
      <aside className="guru-build-box-vip group">
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '200px', height: '200px', background: 'rgba(102, 252, 241, 0.15)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1, marginBottom: '10px' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <ShoppingCart size={24} color="#eab308" style={{ filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.6))' }} />
            </div>
            <div>
                <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px', color: '#eab308', display: 'block' }}>
                    {isEn ? 'ULTIMATE GAMING SETUP' : 'ULTIMÁTNÍ HERNÍ DĚLO'}
                </span>
                <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '950', margin: '3px 0 0 0', textTransform: 'uppercase', lineHeight: '1.2' }}>
                    {isEn ? 'V.I.P. GURU BUILD' : 'V.I.P. GURU SESTAVA'}
                </h2>
            </div>
        </div>

        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#9ca3af', position: 'relative', zIndex: 1, margin: 0, marginBottom: '15px' }}>
            {isEn ? 'The best components selected by Hardware Guru.' 
                   : 'Nejlepší komponenty aktuálně na trhu. Postav si absolutní bestii podle Guru.'}
        </p>

        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
          <GuruBuildItem icon={<Cpu size={18}/>} name="AMD Ryzen 7 9800X3D" link={links.cpu} />
          <GuruBuildItem icon={<ShieldCheck size={18}/>} name="GIGABYTE X870E AORUS ELITE" link={links.mobo} />
          <GuruBuildItem icon={<Layers size={18}/>} name="Kingston 32GB 6000MT/s" link={links.ram} />
          <GuruBuildItem icon={<Gamepad2 size={18}/>} name="ZOTAC RTX 5070 Twin Edge" link={links.gpu} />
          <GuruBuildItem icon={<Lightbulb size={18}/>} name="MSI SPATIUM M461 2TB" link={links.disk} />
          <GuruBuildItem icon={<Bookmark size={18}/>} name="Case dle výběru" link={links.case} />
        </ul>
      </aside>

      <div className="smarty-banner-aligned">
          <div className="smarty-ctr-text-aligned">
              <p style={{ margin: 0, color: '#eab308', fontSize: '14px', fontWeight: 'bold', lineHeight: '1.4' }}>
                  {isEn ? "Don't like this build? Configure your own with our partner." : "Nezdá se ti zrovna tato sestava? Nakonfiguruj si svou u našeho partnera."}
              </p>
          </div>
          <a href="https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=74f145c2" target="_top" className="smarty-image-link-aligned">
              <img src="https://doc.ehub.cz/b/6b6bfd74/74f145c2.jpg" alt="Smarty.cz - Lítáme v tom spolu" />
          </a>
          <img style={{ border: 0, display: 'none' }} src="https://ehub.cz/system/scripts/imp.php?a_aid=71c85dea&a_bid=74f145c2" width="1" height="1" alt="" />
      </div>
    </div>
  );
};

// --- GURU PARTNERS BOX COMPONENT (GLOBÁLNÍ PRO LAYOUT - PRAVÁ STRANA) ---
const GlobalPartnersBox = ({ isEn }) => {
  const partnerBanners = [
    { bid: '96e7ab3f', hash: '1326470c', ext: 'png' },
    { bid: 'e4b93c4e', hash: '002222e6', ext: 'jpg' },
    { bid: '09a93de3', hash: 'ff360e3f', ext: 'jpg' },
    { bid: '44ce6d67', hash: '3337b1fb', ext: 'jpg' },
    { bid: '85ac6758', hash: '09b05422', ext: 'png' },
    { bid: '40ba2316', hash: '05c13202', ext: 'png' },
    { bid: 'dc46f460', hash: 'c0824462', ext: 'jpg' }
  ];

  return (
    <div className="global-partners-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', padding: '0 5px' }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <Rocket size={20} color="#a855f7" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))' }} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '950', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {isEn ? 'GURU PARTNERS' : 'GURU PARTNEŘI'}
        </h2>
      </div>

      <div className="partners-grid">
        {partnerBanners.map(banner => (
          <div key={banner.bid} className="partner-banner-wrapper hover-scale">
            <a href={`https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=${banner.bid}`} target="_top" rel="nofollow sponsored" style={{ display: 'block', width: '100%', height: '100%' }}>
              <img src={`https://doc.ehub.cz/b/${banner.hash}/${banner.bid}.${banner.ext}`} alt="Hardware Guru Partner" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </a>
            <img style={{ border: 0, display: 'none' }} src={`https://ehub.cz/system/scripts/imp.php?a_aid=71c85dea&a_bid=${banner.bid}`} width="1" height="1" alt="" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || resolvedParams?.lang || 'cs';
  const isEn = locale === 'en';

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };

  const baseUrl = "https://thehardwareguru.cz";
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Hardware Guru",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "image": [`${baseUrl}/logo.png`],
    "sameAs": [
      "https://kick.com/thehardwareguru",
      "https://youtube.com/@TheHardwareGuru_Czech"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Hardware Guru",
    "url": isEn ? `${baseUrl}/en` : baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <html lang={locale}>
      <head>
        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993"
          crossOrigin="anonymous"
        ></script>

        {/* 🔥 SEZNAM SSP REKLAMY (Skript zachován pro vnitřní články, ale bez layout bannerů) 🔥 */}
        <Script src="https://ssp.seznam.cz/static/js/ssp.js" strategy="afterInteractive" />

        {/* 🔥 HEUREKA AFFILIATE SKRIPT 🔥 */}
        <Script 
          async 
          type="text/javascript" 
          src="//serve.affiliate.heureka.cz/js/trixam.min.js" 
          strategy="lazyOnload" 
        />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />

        <link rel="alternate" type="application/rss+xml" title="The Hardware Guru RSS - Novinky" href="https://thehardwareguru.cz/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="The Hardware Guru RSS - Srovnání" href="https://thehardwareguru.cz/rss-comparisons.xml" />
        
        {/* 🔥 ONESIGNAL NOTIFIKACE 🔥 */}
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="afterInteractive" />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "1ea5ad89-5f3e-4922-b2c8-e8cd05304047",
              });
            });
          `}
        </Script>

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9W5FBC9P68" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-9W5FBC9P68');`}
        </Script>
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <AdTracker />

        <div id="guru-env-bridge" style={{ display: 'none' }} data-url={envVars.NEXT_PUBLIC_SUPABASE_URL} data-key={envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
        
        <Navbar />

        <SocialTracker />
        <Tracker />

        {/* ✅ CHYTRÉ CSS: Dva sloupce pro affiliate, které se srovnají inline, pokud je málo místa 🔥 */}
        <style dangerouslySetInnerHTML={{__html: `
          .global-vip-container, .global-partners-container {
              display: block;
              width: 100%;
              max-width: 1200px;
              margin: 40px auto 0 auto;
              padding: 0 20px;
              box-sizing: border-box;
          }
          
          /* Skrýt scrollbary a definovat responzivní grid pro mobily/notebooky */
          .global-vip-container::-webkit-scrollbar, .global-partners-container::-webkit-scrollbar { display: none; }
          
          /* Zde zůstává grid i pro menší rozlišení, když to není na boku */
          .global-partners-container .partners-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: 15px;
          }

          /* STYLOVÁNÍ PRAVÝCH PARTNERSKÝCH BANNERŮ */
          .partner-banner-wrapper {
              background: rgba(17, 19, 24, 0.95);
              border: 1px solid rgba(168, 85, 247, 0.2);
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
          }
          .partner-banner-wrapper:hover {
              border-color: #a855f7;
              box-shadow: 0 15px 40px rgba(168, 85, 247, 0.25);
          }

          /* STYLOVÁNÍ LEVÉHO VIP BOXU (Stejné jako V9.1) */
          .guru-build-box-vip {
            background-color: rgba(17, 19, 24, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 20px;
            border: 1px solid rgba(102, 252, 241, 0.2);
            color: #fff;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(102, 252, 241, 0.05);
            width: 100%; 
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            border-top: 4px solid #eab308;
            margin-bottom: 20px; 
            box-sizing: border-box; 
          }
          .hover-scale { transition: transform 0.3s ease; }
          .hover-scale:hover { transform: scale(1.05); }

          .smarty-banner-aligned {
              width: 100%;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
          }
          .smarty-ctr-text-aligned {
              text-align: center;
              background: rgba(234, 179, 8, 0.05);
              border: 1px solid rgba(234, 179, 8, 0.2);
              padding: 15px;
              border-radius: 16px 16px 0 0; 
              width: 100%;
              box-sizing: border-box;
          }
          .smarty-image-link-aligned {
              display: inline-block;
              border-radius: 0 0 16px 16px; 
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              width: 100%; 
              border: 1px solid rgba(234, 179, 8, 0.2);
              border-top: none; 
              box-sizing: border-box;
          }
          .smarty-image-link-aligned img {
              display: block;
              width: 100%; 
              height: auto;
          }

          /* 🚨 BREAKPOINT 1950px: ZDE SE TO FIXUJE DO BOKU A DO DVOU SLOUPCŮ */
          @media (min-width: 1950px) {
              .global-vip-container {
                  position: fixed;
                  top: 100px;
                  left: 20px;
                  width: 380px;
                  margin: 0;
                  padding: 0 2px 20px 0;
                  max-height: calc(100vh - 120px);
                  overflow-y: auto;
                  z-index: 50;
              }
              .global-partners-container {
                  position: fixed;
                  top: 100px;
                  right: 20px;
                  width: 320px; 
                  margin: 0;
                  padding: 0 0 20px 2px;
                  max-height: calc(100vh - 120px);
                  overflow-y: auto;
                  z-index: 50;
              }
              
              /* 🔥 MAGIE DVOU SLOUPCŮ (2 COLUMNS) 🔥 */
              .global-partners-container .partners-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr); /* 2 sloupce vedle sebe */
                  gap: 15px; /* Rovnoměrná mezera */
              }
          }
        `}} />

        {/* 🔥 GLOÁLNÍ AFFILIATE BOXY */}
        <GlobalVIPBox isEn={isEn} />
        <GlobalPartnersBox isEn={isEn} />

        <main style={{ paddingTop: '90px', flex: 1, position: 'relative', width: '100%', overflowX: 'hidden' }}>
          {children}
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
             <ShareWidget isEn={isEn} />
          </div>
        </main>

        <footer style={{ padding: '60px 20px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: '#0a0b0d' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .guru-footer-link { color: #9ca3af; text-decoration: none; transition: 0.2s; font-size: 13px; font-weight: bold; text-transform: uppercase; }
            .guru-footer-link:hover { color: #fff !important; }
            .guru-footer-sitemap { color: #a855f7 !important; font-weight: 950 !important; }
            .copyright { color: #4b5563; font-size: 12px; margin-top: 20px; font-weight: 600; }
            .eeat-link { color: #6b7280; font-size: 11px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; transition: 0.2s; }
            .eeat-link:hover { color: #d1d5db; }
          `}} />
          
          <VisitorCounter locale={locale} />

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <a href={locale === 'en' ? "/en/clanky/jak-vyresit-bottleneck-navod" : "/clanky/jak-vyresit-bottleneck-navod"} className="guru-footer-link">
              {locale === 'en' ? 'How to fix bottleneck' : 'Jak vyřešit Bottleneck'}
            </a>
            <span style={{ color: '#333' }}>|</span>
            <a href={locale === 'en' ? "/en/clanky/nejlepsi-cpu-pro-rtx-5090-5080" : "/clanky/nejlepsi-cpu-pro-rtx-5090-5080"} className="guru-footer-link">
              {locale === 'en' ? 'Best CPU for RTX 50' : 'Nejlepší CPU pro RTX 50'}
            </a>
            <span style={{ color: '#333' }}>|</span>
            <a href={locale === 'en' ? "/en/sitemap" : "/sitemap"} className="guru-footer-link guru-footer-sitemap">
              {locale === 'en' ? 'COMPLETE NAVIGATION' : 'KOMPLETNÍ NAVIGACE'}
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
            <a href={locale === 'en' ? "/en/about" : "/about"} className="eeat-link">{locale === 'en' ? 'About Us' : 'O nás'}</a>
            <span style={{ color: '#333' }}>•</span>
            <a href={locale === 'en' ? "/en/contact" : "/contact"} className="eeat-link">{locale === 'en' ? 'Contact' : 'Kontakt'}</a>
            <span style={{ color: '#333' }}>•</span>
            <a href={locale === 'en' ? "/en/privacy-policy" : "/privacy-policy"} className="eeat-link">{locale === 'en' ? 'Privacy Policy' : 'Ochrana soukromí'}</a>
            <span style={{ color: '#333' }}>•</span>
            <a href={locale === 'en' ? "/en/terms-of-service" : "/terms-of-service"} className="eeat-link">{locale === 'en' ? 'Terms of Service' : 'Podmínky použití'}</a>
          </div>

          <div className="copyright">
            © {new Date().getFullYear()} The Hardware Guru. Pro hráče, s láskou k železu.
          </div>
        </footer>

        <PartnerWidget /> {/* 🔥 PONECHÁN DLE PŘÁNÍ (VLEZLÝ WIDGET) */}
        <AdBlockDetector />
        <CookieBanner />
        <Analytics />
        <MobileAnchorAd />
      </body>
    </html>
  )
}
