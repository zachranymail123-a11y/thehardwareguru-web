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
 * GURU ROOT LAYOUT V5.5 (SEO DUPLICITY & BING FIX)
 * 🚀 CÍL: Globální unikátnost titulků a Canonical URL fix.
 */

export const metadata = {
  title: {
    // 🔥 FIX: Změněno na unikátnější základ, aby se nepletl s Home Page
    default: 'Hardware Guru | PC Benchmarks, Tech News & AI Tools',
    // 🔥 FIX: %s vloží titulek z page.js, zbytek je unikátní přípona
    template: '%s | Hardware Guru'
  },
  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI.',
  metadataBase: new URL('https://thehardwareguru.cz'),
  // 🔥 FIX: Globální Canonical URL pro zamezení duplicit v Bingu (www vs non-www)
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Hardware Guru",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "image": [`${baseUrl}/logo.png`],
    "sameAs": [
      "https://kick.com/thehardwareguru",
      "https://youtube.com/@TheHardwareGuru_Czech"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Hardware Guru",
    "url": isEn ? `${baseUrl}/en` : baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <html lang={locale}>
      <head>
        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993"
          crossOrigin="anonymous"
        ></script>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }} />

        <link rel="alternate" type="application/rss+xml" title="The Hardware Guru RSS - Novinky" href="https://thehardwareguru.cz/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="The Hardware Guru RSS - Srovnání" href="https://thehardwareguru.cz/rss-comparisons.xml" />
        
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
            .copyright { color: #4b5563; font-size: 12px; margin-top: 20px; font-weight: 600; }
            .eeat-link { color: #6b7280; font-size: 11px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; transition: 0.2s; }
            .eeat-link:hover { color: #d1d5db; }
            
            /* GURU RESPONSIVE ADS */
            .ad-desktop-wrapper { display: block; }
            .ad-mobile-wrapper { display: none; }
            
            @media (max-width: 768px) {
              .ad-desktop-wrapper { display: none; }
              .ad-mobile-wrapper { display: block; }
            }
          `}} />
          
          {/* DESKTOP AD */}
          <div className="ad-desktop-wrapper">
            <div style={{ width: '100%', margin: '0 auto 40px', position: 'relative', zIndex: 99998 }}>
              <iframe 
                data-aa='2431217' 
                src='https://acceptable.a-ads.com/2431217/?size=Adaptive'
                style={{ border: 0, padding: 0, width: '70%', height: '100px', overflow: 'hidden', display: 'block', margin: 'auto' }}
              ></iframe>
            </div>
          </div>

          {/* MOBILE AD */}
          <div className="ad-mobile-wrapper">
            <div style={{ width: '100%', margin: '0 auto 40px', position: 'relative', zIndex: 99998 }}>
              <iframe 
                data-aa='2431218' 
                src='https://acceptable.a-ads.com/2431218/?size=Adaptive'
                style={{ border: 0, padding: 0, width: '70%', height: '100px', overflow: 'hidden', display: 'block', margin: 'auto' }}
              ></iframe>
            </div>
          </div>

          <VisitorCounter locale={locale} />

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
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

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
            <a href={locale === 'en' ? "/en/about" : "/about"} className="eeat-link">
              {locale === 'en' ? 'About Us' : 'O nás'}
            </a>
            <span style={{ color: '#333' }}>•</span>
            <a href={locale === 'en' ? "/en/contact" : "/contact"} className="eeat-link">
              {locale === 'en' ? 'Contact' : 'Kontakt'}
            </a>
            <span style={{ color: '#333' }}>•</span>
            <a href={locale === 'en' ? "/en/privacy-policy" : "/privacy-policy"} className="eeat-link">
              {locale === 'en' ? 'Privacy Policy' : 'Ochrana soukromí'}
            </a>
            <span style={{ color: '#333' }}>•</span>
            <a href={locale === 'en' ? "/en/terms-of-service" : "/terms-of-service"} className="eeat-link">
              {locale === 'en' ? 'Terms of Service' : 'Podmínky použití'}
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
