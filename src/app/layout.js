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
  // GURU FIX: Zajištění správného locale pro HTML
  const locale = params?.lang || 'cs';

  return (
    <html lang={locale}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0b0d' }}>
        
        <Navbar />
        
        <SocialTracker /> 
        <Tracker />
        
        {/* --- GURU FIX: Zde je 90px odsazení, aby Navbar nesežral obsah --- */}
        <main style={{ paddingTop: '90px', minHeight: '100vh', position: 'relative' }}>
          {children}
        </main>

        <SestavyBubble />
        <SupportWidget />
        <Analytics />

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
