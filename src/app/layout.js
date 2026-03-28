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

/**
 * GURU ROOT LAYOUT V7.4 (THE "FINALLY VISIBLE" UPDATE)
 * 🚀 CÍL: Oprava vrstvení (Z-INDEX). Ads jsou konečně PŘED pozadím.
 * 1080p = jen pravý | 1440p+ = oba.
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

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || resolvedParams?.lang || 'cs';
  const isEn = locale === 'en';

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };

  const baseUrl = "https://thehardwareguru.cz";

  return (
    <html lang={locale}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous"></script>
        <Script src="https://ssp.seznam.cz/static/js/ssp.js" strategy="afterInteractive" />
        
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9W5FBC9P68" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-9W5FBC9P68');`}
        </Script>
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        <Navbar />
        <SocialTracker />
        <Tracker />

        {/* 🔥 SVISLÉ REKLAMY - TEĎ UŽ STREJNĚ VIDITELNÉ 🔥 */}
        <style dangerouslySetInnerHTML={{__html: `
          .skyscraper-left, .skyscraper-right {
            position: fixed;
            top: 130px;
            width: 300px;
            display: none;
            z-index: 100; /* 🚀 TEĎ JSOU PŘED POZADÍM */
            pointer-events: auto;
          }
          
          /* Odsunutí o 920px, aby to na homepage neřezalo do obsahu */
          .skyscraper-left { left: calc(50% - 920px); }
          .skyscraper-right { right: calc(50% - 920px); }

          /* LEVEL 1: 1080p (Standardní desktop) -> JEN PRAVÁ */
          @media (min-width: 1550px) {
            .skyscraper-right { display: block; }
          }

          /* LEVEL 2: 1440p a více -> OBĚ STRANY */
          @media (min-width: 2150px) {
            .skyscraper-left { display: block; }
          }
        `}} />

        <aside className="skyscraper-left guru-ad-fallback">
          <SeznamAd zoneId={408655} width={300} height={600} />
        </aside>

        <aside className="skyscraper-right guru-ad-fallback">
          <SeznamAd zoneId={408655} width={300} height={600} />
        </aside>

        {/* MAIN MÁ NÍZKÝ Z-INDEX, ABY ADS BYLY PŘED NÍM */}
        <main style={{ paddingTop: '90px', flex: 1, position: 'relative', width: '100%', overflowX: 'hidden', zIndex: 1 }}>
          {children}
          <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
             <ShareWidget isEn={isEn} />
          </div>
        </main>

        <div style={{ width: '100%', background: '#0a0b0d', position: 'relative', zIndex: 110, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
           <style dangerouslySetInnerHTML={{__html: `
              .footer-ad-container { display: flex; justify-content: center; width: 100%; }
              .f-desktop { display: none; }
              @media (min-width: 769px) { .f-desktop { display: flex; } .f-mobile { display: none; } }
           `}} />
           <div className="footer-ad-container f-desktop">
              <SeznamAd zoneId={408654} width={970} height={210} />
           </div>
           <div className="footer-ad-container f-mobile">
              <SeznamAd zoneId={408651} width={300} height={250} />
           </div>
        </div>

        <footer style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          background: '#0a0b0d', 
          position: 'relative', 
          zIndex: 120, /* 🚀 PŘEKRYJE ADS PŘI DOJETÍ DOLŮ */
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <VisitorCounter locale={locale} />
          <div className="copyright" style={{ color: '#4b5563', fontSize: '12px', marginTop: '20px' }}>
            © {new Date().getFullYear()} The Hardware Guru. Pro hráče, s láskou k železu.
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
