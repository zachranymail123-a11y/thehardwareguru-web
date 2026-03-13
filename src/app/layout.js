import './globals.css'; 
import Script from 'next/script';
import SestavyBubble from '../components/SestavyBubble'; 
import Tracker from '../components/Tracker'; 
import SocialTracker from '../components/SocialTracker';
import SupportWidget from '../components/SupportWidget';
import Navbar from '../components/Navbar'; 
import { Analytics } from '@vercel/analytics/react';

/**
 * GURU ROOT LAYOUT V2.6 (SEO CANONICAL, HREFLANG FIX & EVERGREEN FOOTER)
 * 🛡️ FIX 1: Absolutní Canonical URL namísto relativních (dle ChatGPT).
 * 🛡️ FIX 2: Přidán x-default do hreflang clusteru pro globální SEO signál.
 * 🛡️ FIX 3: Sjednocena doména na https://thehardwareguru.cz (bez www).
 * 🛡️ FIX 4: Přidán globální SEO Footer s Evergreen články.
 */

export const metadata = {
  title: {
    default: 'The Hardware Guru | Tech, Gaming & AI',
    template: '%s | The Hardware Guru'
  },

  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI. Tvůj průvodce moderní technologií.',

  // ✅ Sjednocená základní doména bez www
  metadataBase: new URL('https://thehardwareguru.cz'),

  alternates: {
    // 🚀 GURU SEO FIX: Použití absolutních URL zamezí chybám v GSC
    canonical: 'https://thehardwareguru.cz',
    languages: {
      'cs': 'https://thehardwareguru.cz',
      'en': 'https://thehardwareguru.cz/en',
      // 🚀 GURU SEO FIX: x-default je kritický pro správnou indexaci clusteru
      'x-default': 'https://thehardwareguru.cz'
    }
  },

  // ✅ Lepší crawl pro Google
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children, params }) {

  const locale = params?.locale || params?.lang || 'cs';

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_MAKE_WEBHOOK2_URL: process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL || ""
  };

  return (
    <html lang={locale}>
      <head>

        {/* 🚀 RSS FEEDY - Discovery linky pro Googlebot */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Hardware Guru RSS Feed"
          href="https://thehardwareguru.cz/rss.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Hardware Guru Comparisons RSS"
          href="https://thehardwareguru.cz/rss-comparisons.xml"
        />

        {/* GOOGLE ANALYTICS */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9W5FBC9P68"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9W5FBC9P68');
          `}
        </Script>

        {/* ADSENSE FUNDING CHOICES API (Pro AdBlock Recovery "Předplatit") */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.googlefc = window.googlefc || {};
              window.googlefc.controlledMessagingFunction = function(message) {
                // Logika pro ověření předplatitele. 
                // Prozatím vracíme false, takže se hláška zobrazí všem s AdBlockem.
                return false;
              };
            `
          }}
        />

      </head>

      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#0a0b0d',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>

        <div
          id="guru-env-bridge"
          style={{ display: 'none' }}
          data-url={envVars.NEXT_PUBLIC_SUPABASE_URL}
          data-key={envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}
          data-webhook={envVars.NEXT_PUBLIC_MAKE_WEBHOOK2_URL}
        />

        <Navbar />

        <SocialTracker />
        <Tracker />

        <main style={{
          paddingTop: '90px',
          flex: 1,
          position: 'relative',
          width: '100%',
          overflowX: 'hidden'
        }}>
          {children}
        </main>

        {/* 🚀 GURU SEO FOOTER (Evergreen Link Juice) */}
        <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: '#0a0b0d' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .guru-footer-link { color: #9ca3af; text-decoration: none; transition: 0.2s; }
            .guru-footer-link:hover { color: #fff !important; }
          `}} />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <a href={locale === 'en' ? "/en/clanky/jak-vyresit-bottleneck-navod" : "/clanky/jak-vyresit-bottleneck-navod"} className="guru-footer-link">
              {locale === 'en' ? 'How to fix bottleneck' : 'Jak vyřešit Bottleneck'}
            </a>
            <span style={{ color: '#333' }}>|</span>
            <a href={locale === 'en' ? "/en/clanky/nejlepsi-cpu-pro-rtx-5090-5080" : "/clanky/nejlepsi-cpu-pro-rtx-5090-5080"} className="guru-footer-link">
              {locale === 'en' ? 'Best CPU for RTX 50' : 'Nejlepší CPU pro RTX 50'}
            </a>
            <span style={{ color: '#333' }}>|</span>
            <a href={locale === 'en' ? "/en/clanky/jak-usetrit-na-hardwaru-navod" : "/clanky/jak-usetrit-na-hardwaru-navod"} className="guru-footer-link">
              {locale === 'en' ? 'Save on Hardware' : 'Jak ušetřit na HW'}
            </a>
          </div>
        </footer>

        <SestavyBubble />
        <SupportWidget />
        <Analytics />

        <Script
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
          type="application/javascript"
          async
        />

        <Script id="google-news-swg-init" strategy="afterInteractive">
          {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {

              window.swgSubscriptions = basicSubscriptions;

              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAow2M_FDA:openaccess",
                clientOptions: { theme: "light", lang: "${locale}" },
              });

            });
          `}
        </Script>

        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />

        <Script id="onesignal-init" strategy="lazyOnload">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];

            OneSignalDeferred.push(async function(OneSignal) {

              await OneSignal.init({
                appId: "1ea5ad89-5f3e-4922-b2c8-e8cd05304047"
              });

            });
          `}
        </Script>

      </body>
    </html>
  )
}
