import './globals.css'; 
import Script from 'next/script';
import SestavyBubble from '../components/SestavyBubble'; 
import Tracker from '../components/Tracker'; 
import SocialTracker from '../components/SocialTracker';
import SupportWidget from '../components/SupportWidget';
import Navbar from '../components/Navbar'; 
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: {
    default: 'The Hardware Guru | Tech, Gaming & AI',
    template: '%s | The Hardware Guru'
  },

  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI. Tvůj průvodce moderní technologií.',

  // ✅ sjednocená canonical doména
  metadataBase: new URL('https://thehardwareguru.cz'),

  alternates: {
    canonical: '/',
    languages: {
      cs: '/',
      en: '/en'
    }
  },

  // ✅ lepší crawl pro Google
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

        {/* RSS FEED */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Hardware Guru RSS Feed"
          href="https://thehardwareguru.cz/rss.xml"
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
