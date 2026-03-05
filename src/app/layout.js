import './globals.css'; 
import Script from 'next/script';
import SestavyBubble from '../components/SestavyBubble'; 
import Tracker from '../components/Tracker'; 
import SocialTracker from '../components/SocialTracker';
import SupportWidget from '../components/SupportWidget';
import Navbar from '../components/Navbar'; // GURU FIX: Zde je sjednocená navigace pro celý web!
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: {
    default: 'The Hardware Guru | Tech, Gaming & AI',
    template: '%s | The Hardware Guru'
  },
  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI. Tvůj průvodce moderní technologií.',
  keywords: ['hardware', 'gaming', 'AI', 'recenze', 'PC sestavy', 'The Hardware Guru', 'stream'],
  authors: [{ name: 'The Hardware Guru' }],
  creator: 'The Hardware Guru',
  metadataBase: new URL('https://www.thehardwareguru.cz'),
  
  // GURU FIX: Google SEO optimalizace pro CZ i EN mutaci
  alternates: {
    languages: {
      'cs': 'https://www.thehardwareguru.cz',
      'en': 'https://www.thehardwareguru.cz/en',
    },
  },
  
  openGraph: {
    title: 'The Hardware Guru | Tech, Gaming & AI',
    description: 'Hardware, gaming a tech novinky na jednom místě.',
    url: 'https://www.thehardwareguru.cz',
    siteName: 'The Hardware Guru',
    images: [
      {
        url: '/bg-guru.png',
        width: 1200,
        height: 630,
        alt: 'The Hardware Guru Banner',
      },
    ],
    locale: 'cs_CZ',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'The Hardware Guru',
    description: 'Tech, Gaming & AI novinky.',
    images: ['/bg-guru.png'],
  },

  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children, params }) {
  // GURU FIX: Dynamické načtení jazyka, defaultně 'cs', pokud jsme na EN verzi, vezme 'en'
  const locale = params?.lang || 'cs';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Hardware Guru',
    url: 'https://www.thehardwareguru.cz',
    logo: 'https://www.thehardwareguru.cz/bg-guru.png',
    sameAs: [
      'https://youtube.com/@TheHardwareGuru_Czech',
      'https://kick.com/TheHardwareGuru',
      'https://discord.com/invite/n7xThr8',
      'https://www.instagram.com/thehardwareguru_czech'
    ]
  };

  return (
    <html lang={locale}>
      <body>
        {/* --- GLOBÁLNÍ SJEDNOCENÁ NAVIGACE --- */}
        <Navbar />
        
        <SocialTracker /> 
        <Tracker />
        
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          strategy="afterInteractive" 
        />
        <Script id="onesignal-init" strategy="lazyOnload">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "1ea5ad89-5f3e-4922-b2c8-e8cd05304047",
              });
            });
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <SestavyBubble />
        <SupportWidget />

        {/* --- Odsazení obsahu webu pod plovoucí lištou --- */}
        <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
          {children}
        </main>

        <Analytics />
      </body>
    </html>
  )
}
