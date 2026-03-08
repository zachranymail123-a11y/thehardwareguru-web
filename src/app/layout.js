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
  metadataBase: new URL('https://www.thehardwareguru.cz'),
  alternates: {
    languages: {
      'cs': 'https://www.thehardwareguru.cz',
      'en': 'https://www.thehardwareguru.cz/en',
    },
  },
}

export default function RootLayout({ children, params }) {
  // GURU JAZYKOVÁ LOGIKA: Zajištění správného locale pro HTML tag a skripty
  const locale = params?.locale || params?.lang || 'cs';

  // 🚀 GURU DATA BRIDGE (CSP-SAFE INJECTION): 
  // Načtení proměnných na straně serveru. Protože CSP blokuje inline skripty, 
  // propašujeme data přes atributy skrytého DOM elementu.
  // Tyto hodnoty jsou v Next.js na serveru (SSR) vždy dostupné.
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_MAKE_WEBHOOK2_URL: process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL || ""
  };

  return (
    <html lang={locale}>
      <head>
        {/* Odstraněna window.__ENV__ injekce, kterou blokovalo CSP jako hrozbu (ReferenceError/Hydration error) */}
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#0a0b0d', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* 🛡️ GURU SUPREME DATA BRIDGE: 
            Element, který CSP neřeší, ale klientský kód z něj bezpečně přečte konfiguraci. 
            Využíváme standardní 'data-' atributy pro maximální stabilitu. */}
        <div 
          id="guru-env-bridge" 
          style={{ display: 'none' }}
          data-url={envVars.NEXT_PUBLIC_SUPABASE_URL}
          data-key={envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}
          data-webhook={envVars.NEXT_PUBLIC_MAKE_WEBHOOK2_URL}
        />
        
        {/* PEVNÝ NAVBAR (Výška 90px) */}
        <Navbar />
        
        {/* GURU TRACKERY */}
        <SocialTracker /> 
        <Tracker />
        
        {/* --- 🛡️ GURU SHIELD: Odsazení 90px vyřeší překrývání oken! --- */}
        <main style={{ 
          paddingTop: '90px', 
          flex: 1,
          position: 'relative',
          width: '100%',
          overflowX: 'hidden'
        }}>
          {children}
        </main>

        {/* WIDGETY A ANALYTIKA */}
        <SestavyBubble />
        <SupportWidget />
        <Analytics />

        {/* 📰 GURU GOOGLE NEWS / SUBSCRIBE WITH GOOGLE ENGINE */}
        <Script 
          src="https://news.google.com/swg/js/v1/swg-basic.js" 
          strategy="afterInteractive" 
          type="application/javascript"
          async
        />
        <Script id="google-news-swg-init" strategy="afterInteractive">
          {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
              // 🚀 GURU FIX: ZACHOVÁNO pro funkční SPA tlačítka na podstránkách!
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

        {/* 💰 GURU GOOGLE ADSENSE ENGINE */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* ONESIGNAL NOTIFIKACE */}
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          strategy="afterInteractive" 
        />
        <Script id="onesignal-init" strategy="lazyOnload">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({ appId: "1ea5ad89-5f3e-4922-b2c8-e8cd05304047" });
            });
          `}
        </Script>
      </body>
    </html>
  )
}
