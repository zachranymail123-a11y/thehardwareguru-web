import './globals.css'; 
import Script from 'next/script';
import { headers } from 'next/headers';
import Tracker from '../components/Tracker'; 
import SocialTracker from '../components/SocialTracker';
import PartnerWidget from '../components/PartnerWidget'; 
import Navbar from '../components/Navbar'; 
import { Analytics } from '@vercel/analytics/react';
import VisitorCounter from '../components/VisitorCounter';
import ShareWidget from '../components/ShareWidget';
import CookieBanner from '../components/CookieBanner';
import AdBlockDetector from '../components/AdBlockDetector';
import AdTracker from '../components/AdTracker';
import SeznamAd from '../components/SeznamAd';
import MobileStickyButton from '../components/MobileStickyButton';
import ExitIntentPopup from '../components/ExitIntentPopup';
import { Cpu, ShieldCheck, Layers, Gamepad2, Lightbulb, Bookmark, ShoppingCart, Rocket } from 'lucide-react';

export const metadata = {
  title: {
    default: 'Hardware Guru | PC Benchmarks, Tech News & AI Tools',
    template: '%s | Hardware Guru'
  },
  description: 'Exkluzivní novinky ze světa hardwaru, recenze her a streamy s unikátní AI.',
  metadataBase: new URL('https://thehardwareguru.cz'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
}

const GuruBuildItem = ({ icon, name, link, isEn }) => (
    <li style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ background: 'rgba(102, 252, 241, 0.05)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(102, 252, 241, 0.1)', flexShrink: 0, color: '#66fcf1' }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', lineHeight: '1.3' }}>{name}</div>
        </div>
        <a href={link} target="_blank" rel="nofollow sponsored" style={{ background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(102, 252, 241, 0.3)', transition: '0.3s', whiteSpace: 'nowrap', flexShrink: 0 }} className="hover-scale">
            {isEn ? 'BUY' : 'KOUPIT'}
        </a>
    </li>
);

const GlobalVIPBox = ({ isEn }) => {
  const links = {
    cpu: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FAMD-Ryzen-7-9800X3D-4p200972`,
    mobo: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FGIGABYTE-X870E-AORUS-ELITE-X3D-4p249878`,
    ram: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FKingston-FURY-Beast-Black-DDR5-32GB-6000MT-s-CL30-DIMM-2x16GB-EXPO-XMP-4p205565`,
    gpu: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FZOTAC-NVIDIA-GeForce-RTX-5070-Twin-Edge-4p242198`,
    disk: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FMSI-SPATIUM-M461-M-2-2TB-4p116277`,
    case: `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=https%3A%2F%2Fwww.smarty.cz%2FVyhledavani%2Fpocitacove-skrine%3Fquery%3Datx%26s%3Dp`
  };

  return (
    <div className="guru-side-box-left">
      <aside className="guru-build-box-vip group">
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '200px', height: '200px', background: 'rgba(102, 252, 241, 0.15)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1, marginBottom: '10px' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <ShoppingCart size={24} color="#eab308" style={{ filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.6))' }} />
            </div>
            <div>
                <span style={{ fontWeight: '950', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '11px', color: '#eab308', display: 'block' }}>
                    {isEn ? 'ULTIMATE GAMING SETUP' : 'ULTIMÁTNÍ HERNÍ DĚLO'}
                </span>
                <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: '950', margin: '3px 0 0 0', textTransform: 'uppercase', lineHeight: '1.2' }}>
                    {isEn ? 'V.I.P. GURU BUILD' : 'V.I.P. GURU SESTAVA'}
                </h3>
            </div>
        </div>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
          <GuruBuildItem icon={<Cpu size={18}/>} name="AMD Ryzen 7 9800X3D" link={links.cpu} isEn={isEn} />
          <GuruBuildItem icon={<ShieldCheck size={18}/>} name="GIGABYTE X870E AORUS ELITE" link={links.mobo} isEn={isEn} />
          <GuruBuildItem icon={<Layers size={18}/>} name="Kingston 32GB 6000MT/s" link={links.ram} isEn={isEn} />
          <GuruBuildItem icon={<Gamepad2 size={18}/>} name="ZOTAC RTX 5070 Twin Edge" link={links.gpu} isEn={isEn} />
          <GuruBuildItem icon={<Lightbulb size={18}/>} name="MSI SPATIUM M461 2TB" link={links.disk} isEn={isEn} />
          <GuruBuildItem icon={<Bookmark size={18}/>} name={isEn ? "Case of choice" : "Case dle výběru"} link={links.case} isEn={isEn} />
        </ul>
      </aside>
      <div className="guru-vip-addon" style={{ marginTop: '10px' }}>
          <div className="guru-vip-desc" style={{ textAlign: 'center', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '10px', borderRadius: '12px 12px 0 0' }}>
              <p style={{ margin: 0, color: '#eab308', fontSize: '13px', fontWeight: 'bold' }}>
                  {isEn ? "Configure your own build" : "Nakonfiguruj si vlastní sestavu"}
              </p>
          </div>
          <a href="https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=74f145c2" target="_top" style={{ display: 'block', borderRadius: '0 0 12px 12px', overflow: 'hidden', border: '1px solid rgba(234, 179, 8, 0.2)', borderTop: 'none' }}>
              <img src="https://wsrv.nl/?url=doc.ehub.cz/b/6b6bfd74/74f145c2.jpg&output=webp" alt="Smarty" style={{ width: '100%', display: 'block' }} />
          </a>
      </div>
    </div>
  );
};

const GlobalPartnersBox = ({ isEn }) => {
  const extLinks = [
    { id: '96e7ab3f', hash: '1326470c', ext: 'png' },
    { id: 'e4b93c4e', hash: '002222e6', ext: 'jpg' },
    { id: '09a93de3', hash: 'ff360e3f', ext: 'jpg' },
    { id: '44ce6d67', hash: '3337b1fb', ext: 'jpg' },
    { id: '85ac6758', hash: '09b05422', ext: 'png' },
    { id: '40ba2316', hash: '05c13202', ext: 'png' },
    { id: 'dc46f460', hash: 'c0824462', ext: 'jpg' }
  ];
  return (
    <div className="guru-side-box-right">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '10px', borderRadius: '12px' }}>
          <Rocket size={20} color="#a855f7" />
        </div>
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '950', margin: 0 }}>{isEn ? 'GURU CHOICES' : 'GURU DOPORUČUJE'}</h2>
      </div>
      <div className="guru-hub-grid">
        {extLinks.map(link => (
          <div key={link.id} className="guru-hub-item hover-scale">
            <a href={`https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=${link.id}`} target="_top" rel="nofollow sponsored">
              <img src={`https://wsrv.nl/?url=doc.ehub.cz/b/${link.hash}/${link.id}.${link.ext}&output=webp`} alt="Guru" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default async function RootLayout({ children }) {
  // 🔥 FIX ERRORU 500: Zabalené a awaitované headers() pro Next.js 15
  let isEn = false;
  try {
      const headersList = await headers();
      const fullUrl = headersList.get('x-url') || headersList.get('referer') || headersList.get('x-invoke-path') || "";
      if (fullUrl.includes('/en')) isEn = true;
  } catch (e) {}
  
  const locale = isEn ? 'en' : 'cs';
  const envVars = { NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "", NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "" };

  return (
    <html lang={locale}>
      <head>
        <Script src="https://ssp.seznam.cz/static/js/ssp.js" strategy="afterInteractive" />
        
        <Script 
          async 
          type="text/javascript" 
          src="//serve.affiliate.heureka.cz/js/trixam.min.js" 
          strategy="afterInteractive" 
        />

        {/* 🔥 PŘIDÁNO: Nový a bezpečnější Monetag Script v Next.js Injection formátu 🔥 */}
        <Script id="monetag" strategy="beforeInteractive">
          {`
          (function(s){
            s.dataset.zone='10883065';
            s.src='https://nap5k.com/tag.min.js';
          })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));
          `}
        </Script>

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9W5FBC9P68" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-9W5FBC9P68');`}
        </Script>
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '120px' }}>
        <AdTracker />
        <div id="guru-env-bridge" style={{ display: 'none' }} data-url={envVars.NEXT_PUBLIC_SUPABASE_URL} data-key={envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
        <Navbar lang={locale} />
        <SocialTracker />
        <Tracker />

        <main style={{ paddingTop: '90px', flex: 1, position: 'relative', width: '100%', overflowX: 'hidden' }}>
          {children}
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
             <ShareWidget isEn={isEn} />
          </div>
        </main>

        <GlobalVIPBox isEn={isEn} />
        <GlobalPartnersBox isEn={isEn} />

        <footer style={{ padding: '60px 20px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: '#0a0b0d' }}>
          <VisitorCounter locale={locale} />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <a href={isEn ? "/en/clanky/jak-vyresit-bottleneck-navod" : "/clanky/jak-vyresit-bottleneck-navod"} className="guru-footer-link">
              {isEn ? 'How to fix bottleneck' : 'Jak vyřešit Bottleneck'}
            </a>
            <span style={{ color: '#333' }}>|</span>
            <a href={isEn ? "/en/clanky/nejlepsi-cpu-pro-rtx-5090-5080" : "/clanky/nejlepsi-cpu-pro-rtx-5090-5080"} className="guru-footer-link">
              {isEn ? 'Best CPU for RTX 50' : 'Nejlepší CPU pro RTX 50'}
            </a>
            <span style={{ color: '#333' }}>|</span>
            <a href={isEn ? "/en/sitemap" : "/sitemap"} className="guru-footer-link" style={{color:'#a855f7', fontWeight:'950'}}>
              {isEn ? 'COMPLETE NAVIGATION' : 'KOMPLETNÍ NAVIGACE'}
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
            <a href={isEn ? "/en/about" : "/about"} className="eeat-link">{isEn ? 'About Us' : 'O nás'}</a>
            <span style={{ color: '#333' }}>•</span>
            <a href={isEn ? "/en/contact" : "/contact"} className="eeat-link">{isEn ? 'Contact' : 'Kontakt'}</a>
            <span style={{ color: '#333' }}>•</span>
            <a href={isEn ? "/en/privacy-policy" : "/privacy-policy"} className="eeat-link">{isEn ? 'Privacy Policy' : 'Ochrana soukromí'}</a>
            <span style={{ color: '#333' }}>•</span>
            <a href={isEn ? "/en/terms-of-service" : "/terms-of-service"} className="eeat-link">{isEn ? 'Terms of Service' : 'Podmínky použití'}</a>
          </div>

          <div style={{ color: '#4b5563', fontSize: '12px', marginTop: '20px', fontWeight: '600' }}>
            © {new Date().getFullYear()} The Hardware Guru. Pro hráče, s láskou k železu.
          </div>
        </footer>

        <PartnerWidget />
        <AdBlockDetector />
        <CookieBanner />
        <MobileStickyButton />
        <ExitIntentPopup />
        <Analytics />

        <div className="global-sticky-anchor">
            <div className="ad-desktop-anchor">
                <SeznamAd zoneId={408873} width={728} height={90} />
            </div>
            {/* 🔥 FIX: Mobile Anchor ID 408678 🔥 */}
            <div className="ad-mobile-anchor">
                <SeznamAd zoneId={408678} width={320} height={100} />
            </div>
        </div>
      </body>
    </html>
  )
}
