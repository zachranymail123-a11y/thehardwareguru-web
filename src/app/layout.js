import './globals.css'; 
import Script from 'next/script';
import SestavyBubble from '../components/SestavyBubble'; 
import { Analytics } from '@vercel/analytics/react'; // TADY JE IMPORT ANALYTIKY

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
  
  openGraph: {
    title: 'The Hardware Guru | Tech, Gaming & AI',
    description: 'Hardware, gaming a tech novinky na jednom místě.',
    url: 'https://www.thehardwareguru.cz',
    siteName: 'The Hardware Guru',
    images: [
      {
        url: 'https://i.postimg.cc/QdWxszv3/bg-guru.png',
        width: 1200,
        height: 630,
        alt: 'The Hardware Guru Banner',
      },
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'The Hardware Guru',
    description: 'Tech, Gaming & AI novinky.',
    images: ['https://i.postimg.cc/QdWxszv3/bg-guru.png'],
  },

  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        {/* --- ONESIGNAL PUSH NOTIFIKACE --- */}
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="beforeInteractive" />
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
        {/* --------------------------------- */}

        {/* --- GURU BUBNA NA SESTAVY --- */}
        <SestavyBubble />

        {children}

        {/* --- VERCEL ANALYTICS (MĚŘÁK NÁVŠTĚVNOSTI) --- */}
        <Analytics />
      </body>
    </html>
  )
}
