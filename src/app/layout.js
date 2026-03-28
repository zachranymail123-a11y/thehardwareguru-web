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
 * GURU ROOT LAYOUT V7.7 (SMART AD RECOVERY)
 * 🚀 CÍL: Reklamy viditelné, fallbacky skryté (pokud neběží AdBlock).
 * 🚀 VRSTVY: Postranní ads jsou z-index 9999 (před pozadím).
 */

export const metadata = {
  title: { default: 'Hardware Guru', template: '%s | Hardware Guru' },
  description: 'PC Benchmarks, Tech News & AI Tools',
}

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'cs';
  const isEn = locale === 'en';

  return (
    <html lang={locale}>
      <head>
        {/* SSP Script s nejvyšší prioritou */}
        <Script src="https://ssp.seznam.cz/static/js/ssp.js" strategy="beforeInteractive" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous"></script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9W5FBC9P68" strategy="afterInteractive" />
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* 💸 VINĚTA / INTERSTITIAL (Volá se chytře přes komponentu) */}
        <SeznamInterstitial />

        <Navbar />
        <SocialTracker />
        <Tracker />

        {/* CSS PRO POSTRANNÍ ADS (Z-INDEX FIX) */}
        <style dangerouslySetInnerHTML={{__html: `
          .skyscraper-left, .skyscraper-right {
            position: fixed;
            top: 130px;
            width: 300px;
            display: none;
            z-index: 9999 !important; /* PŘED POZADÍM */
            pointer-events: auto;
          }
          .skyscraper-left { left: calc(50% - 940px); }
          .skyscraper-right { right: calc(50% - 940px); }

          /* Pravidla pro monitory dle tvého příkazu */
          @media (min-width: 1550px) { .skyscraper-right { display: block; } }
          @media (min-width: 2100px) { .skyscraper-left { display: block; } }
        `}} />

        {/* BOČNÍ REKLAMY BEZ STATICKÝCH TŘÍD */}
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
