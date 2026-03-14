import './globals.css'; 
import Script from 'next/script';
import SestavyBubble from '../components/SestavyBubble'; 
import Tracker from '../components/Tracker'; 
import SocialTracker from '../components/SocialTracker';
import SupportWidget from '../components/SupportWidget';
import Navbar from '../components/Navbar'; 
import { Analytics } from '@vercel/analytics/react';
import VisitorCounter from '../components/VisitorCounter';

/**
 * GURU ROOT LAYOUT V4.6 (ADSENSE & RSS EDITION)
 * Cesta: src/app/layout.js
 * 🚀 CÍL: Aktivace globální reklamy a propuštění 195.8K stránek do indexu.
 * 🛡️ ADS: Nasazen globální Google AdSense skript (ca-pub-5468223287024993).
 * 🛡️ SEO: Zachovány RSS feedy a dynamické generování canonicalů v page.js.
 */

export const metadata = {
  title: {
    default: 'The Hardware Guru | Tech, Gaming & AI',
    template: '%s | The Hardware Guru'
  },
  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI.',
  metadataBase: new URL('https://thehardwareguru.cz'),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default async function RootLayout({ children, params }) {
  // Await params pro Next.js 15 (Striktní architektura)
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || resolvedParams?.lang || 'cs';

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };

  return (
    <html lang={locale}>
      <head>
        {/* 🚀 GOOGLE ADSENSE GLOBAL TAG (Povinné pro schválení a Auto Ads) */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* 🚀 GURU RSS FEEDY */}
        <link rel="alternate" type="application/rss+xml" title="The Hardware Guru RSS - Novinky" href="https://thehardwareguru.cz/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="The Hardware Guru RSS - Srovnání" href="https://thehardwareguru.cz/rss-comparisons.xml" />
        
        {/* Google Analytics & GTM */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9W5FBC9P68" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-9W5FBC9P68');`}
        </Script>
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div id="guru-env-bridge" style={{ display: 'none' }} data-url={envVars.NEXT_PUBLIC_SUPABASE_URL} data-key={envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
        
        <Navbar />
        <SocialTracker />
        <Tracker />

        <main style={{ paddingTop: '90px', flex: 1, position: 'relative', width: '100%', overflowX: 'hidden' }}>
          {children}
        </main>

        <footer style={{ padding: '60px 20px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: '#0a0b0d' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .guru-footer-link { color: #9ca3af; text-decoration: none; transition: 0.2s; font-size: 13px; font-weight: bold; text-transform: uppercase; }
            .guru-footer-link:hover { color: #fff !important; }
            .guru-footer-sitemap { color: #a855f7 !important; font-weight: 950 !important; }
            .guru-counter-box { background: #000; border: 1px solid #a855f7; padding: 2px 10px; border-radius: 6px; color: #fff; margin: 0 5px; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); }
            .copyright { color: #4b5563; font-size: 12px; margin-top: 20px; font-weight: 600; }
          `}} />
          
          <VisitorCounter locale={locale} />

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
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

          <div className="copyright">
            © {new Date().getFullYear()} The Hardware Guru. Pro hráče, s láskou k železu.
          </div>
        </footer>

        <SestavyBubble />
        <SupportWidget />
        <Analytics />
      </body>
    </html>
  )
}
