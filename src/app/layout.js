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
  const locale = params?.lang || 'cs';

  return (
    <html lang={locale}>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#0a0b0d', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
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

        {/* 📰 GURU GOOGLE NEWS / SUBSCRIBE WITH GOOGLE ENGINE (Verified Snippet) */}
        <Script 
          src="https://news.google.com/swg/js/v1/swg-basic.js" 
          strategy="afterInteractive" 
          type="application/javascript"
          async
        />
        <Script id="google-news-swg-init" strategy="afterInteractive">
          {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAow2M_FDA:openaccess",
                clientOptions: { theme: "light", lang: "${locale}" },
              });
            });
          `}
        </Script>

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
