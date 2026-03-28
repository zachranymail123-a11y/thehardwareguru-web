import './globals.css'; 
import Script from 'next/script';
import SestavyBubble from '../components/SestavyBubble'; 
import Tracker from '../components/Tracker'; 
import SocialTracker from '../components/SocialTracker';
import SupportWidget from '../components/SupportWidget';
import Navbar from '../components/Navbar'; 
import { Analytics } from '@vercel/analytics/react';
import VisitorCounter from '../components/VisitorCounter';
import ShareWidget from '../components/ShareWidget';
import CookieBanner from '../components/CookieBanner';
import SeznamAd from '../components/SeznamAd';
import MobileAnchorAd from '../components/MobileAnchorAd';
import SeznamInterstitial from '../components/SeznamInterstitial';

/**
 * GURU ROOT LAYOUT V7.8 (FINAL STACKING & SEO FIX)
 * 🚀 CÍL: Ads viditelné před pozadím, dynamické fallbacky, Golden Rich SEO.
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
}

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'cs';
  const isEn = locale === 'en';

  const baseUrl = "https://thehardwareguru.cz";
  
  // Google Golden Rich Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Hardware Guru",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
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
        {/* SSP Script s nejvyšší prioritou pro Vinětu */}
        <Script src="https://ssp.seznam.cz/static/js/ssp.js" strategy="beforeInteractive" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous"></script>
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9W5FBC9P68" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-9W5FBC9P68');`}
        </Script>
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* 💸 VINĚTA / INTERSTITIAL */}
        <SeznamInterstitial />

        <Navbar />
        <SocialTracker />
        <Tracker />

        {/* CSS PRO POSTRANNÍ ADS (Z-INDEX 9999 = VŽDY NAHOŘE) */}
        <style dangerouslySetInnerHTML={{__html: `
          .skyscraper-left, .skyscraper-right {
            position: fixed;
            top: 130px;
            width: 300px;
            display: none;
            z-index: 9999 !important;
            pointer-events: auto;
          }
          .skyscraper-left { left: calc(50% - 940px); }
          .skyscraper-right { right: calc(50% - 940px); }

          /* 1080p monitory -> JEN PRAVÁ */
          @media (min-width: 1550px) { .skyscraper-right { display: block; } }
          
          /* 1440p+ monitory -> OBĚ */
          @media (min-width: 2100px) { .skyscraper-left { display: block; } }
        `}} />

        <aside className="skyscraper-left">
          <SeznamAd zoneId={408655} width={300} height={600} />
        </aside>

        <aside className="skyscraper-right">
          <SeznamAd zoneId={408655} width={300} height={600} />
        </aside>

        <main style={{ paddingTop: '90px', flex: 1, position: 'relative', width: '100%', overflowX: 'hidden', zIndex: 1 }}>
          {children}
          <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
             <ShareWidget isEn={isEn} />
          </div>
        </main>

        {/* SPODNÍ REKLAMNÍ ZÓNA */}
        <div style={{ width: '100%', background: '#0a0b0d', position: 'relative', zIndex: 10000, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
           <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SeznamAd zoneId={408654} width={970} height={210} />
           </div>
        </div>

        <footer style={{ padding: '40px 20px', textAlign: 'center', background: '#0a0b0d', position: 'relative', zIndex: 10001, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <VisitorCounter locale={locale} />
          <div className="copyright" style={{ color: '#4b5563', fontSize: '12px', marginTop: '20px' }}>
            © {new Date().getFullYear()} The Hardware Guru.
          </div>
        </footer>

        <SestavyBubble />
        <SupportWidget />
        <CookieBanner />
        <Analytics />
        <MobileAnchorAd />
      </body>
    </html>
  )
}
