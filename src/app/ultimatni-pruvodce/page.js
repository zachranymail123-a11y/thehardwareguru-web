import React from 'react';
import { headers } from 'next/headers';
import { 
  Cpu, Monitor, Zap, TrendingUp, BookOpen, Wrench, ChevronRight, Gamepad2, AlertTriangle, Crosshair, Layers, Database, Activity, ShieldCheck, Flame
} from 'lucide-react';
import HeurekaButtons from '../../components/HeurekaButtons';
import SeznamAd from '../../components/SeznamAd';

export const runtime = "nodejs";
export const revalidate = 86400;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata() {
  const headersList = headers();
  const fullUrl = headersList.get('referer') || "";
  const isEn = fullUrl.includes('/en');

  const title = isEn 
    ? "Ultimate Guide: PC Bottleneck, FPS & Overclocking | Hardware Guru" 
    : "Ultimátní průvodce: Co je Bottleneck, FPS a Overclocking | Hardware Guru";
  const description = isEn 
    ? "Master your PC performance. Understand CPU/GPU bottlenecks, fix stuttering, use our FPS calculator, and learn extreme overclocking tips." 
    : "Ovládněte výkon PC. Co je CPU a GPU bottleneck, jak vyřešit stuttering, použijte naši FPS kalkulačku a naučte se Guru overclocking tipy.";

  return {
    title,
    description,
    alternates: {
      canonical: isEn ? `${baseUrl}/en/ultimate-guide` : `${baseUrl}/ultimatni-pruvodce`,
    }
  };
}

export default function UltimateGuidePage() {
  const headersList = headers();
  const fullUrl = headersList.get('referer') || "";
  const isEn = fullUrl.includes('/en');

  // 🥇 GOOGLE GOLDEN RICH SCHEMA (FAQ + Article pro Nultou pozici v Googlu)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": isEn ? "What is a PC Bottleneck? The Ultimate FPS & Overclocking Guide" : "Co je to Bottleneck? Ultimátní průvodce FPS a Overclockingem",
        "description": isEn ? "Learn how to identify and fix PC bottlenecks to maximize your gaming FPS." : "Naučte se identifikovat a vyřešit bottleneck v PC a maximalizovat tak své herní FPS.",
        "author": { "@type": "Person", "name": "The Hardware Guru", "url": "https://www.youtube.com/@TheHardwareGuru_Czech" },
        "publisher": { "@type": "Organization", "name": "Hardware Guru", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` } }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": isEn ? "What is a bottleneck in a PC?" : "Co je to bottleneck v PC?",
            "acceptedAnswer": { "@type": "Answer", "text": isEn ? "A bottleneck occurs when one PC component is significantly slower than the rest, limiting overall performance and causing FPS drops." : "Bottleneck nastává, když jedna komponenta nestíhá zpracovávat data tak rychle jako zbytek systému, což omezuje výkon a způsobuje propady FPS." }
          },
          {
            "@type": "Question",
            "name": isEn ? "Is CPU or GPU bottleneck worse?" : "Je horší CPU nebo GPU bottleneck?",
            "acceptedAnswer": { "@type": "Answer", "text": isEn ? "A CPU bottleneck is worse because it causes severe stuttering. A GPU bottleneck is normal, meaning your graphics card is fully utilized." : "CPU bottleneck je horší, protože způsobuje trhání obrazu. GPU bottleneck je normální stav, kdy využíváte grafiku naplno." }
          }
        ]
      }
    ]
  };

  return (
    <div className="guru-megapage-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        {/* HERO SECTION */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00ffcc', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '8px 24px', border: '1px solid rgba(0, 255, 204, 0.3)', borderRadius: '50px', background: 'rgba(0, 255, 204, 0.05)', boxShadow: '0 0 20px rgba(0,255,204,0.1)' }}>
            <Zap size={18} /> {isEn ? 'Hardware Guru Masterclass' : 'Hardware Guru Masterclass'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {isEn ? 'The Ultimate Guide to ' : 'Ultimátní průvodce: '}
            <span style={{ color: 'transparent', WebkitTextStroke: '1px #00ffcc', backgroundImage: 'linear-gradient(to right, #00ffcc, #a855f7)', WebkitBackgroundClip: 'text', display: 'block', marginTop: '10px' }}>
              {isEn ? 'Bottleneck & FPS' : 'Bottleneck & Výkon'}
            </span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginTop: '30px', lineHeight: '1.6', maxWidth: '750px', margin: '30px auto 0' }}>
            {isEn 
              ? "Stop losing frames. Uncover how CPU, GPU, and RAM interact. Use our tools, read the glossary, and learn extreme overclocking to build the perfect PC." 
              : "Přestaňte ztrácet FPS. Zjistěte, jak přesně interaguje procesor, grafika a RAM. Prolinkovali jsme pro vás naše nejlepší nástroje, slovník a tipy pro maximální výkon."}
          </p>
        </header>

        {/* TOP REKLAMA (Ošetřená proti kolapsu) */}
        <div style={{ marginBottom: '50px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="ad-desktop-wrapper" style={{ minHeight: '90px' }}>
            <SeznamAd zoneId={408654} width={970} height={210} />
          </div>
          <div className="ad-mobile-wrapper" style={{ minHeight: '250px' }}>
            <SeznamAd zoneId={408651} width={300} height={250} />
          </div>
        </div>

        {/* OBSAH - S POUŽITÍM CUSTOM PROSE STYLŮ Z GLOBALS.CSS */}
        <article className="prose prose-invert max-w-none" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#d1d5db' }}>
          
          <section className="mb-16">
            <h2 style={{ fontSize: '2.2rem', color: '#fff', borderLeft: '5px solid #00ffcc', paddingLeft: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '1. The Core of PC Bottleneck' : '1. Jádro problému: Co je Bottleneck?'}
            </h2>
            <p>
              {isEn 
                ? "In the world of PC building, hardware is a team. If you pair a monster "
                : "Ve světě počítačů funguje hardware jako tým. Pokud zkombinujete monstrózní "}
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="text-[#00ffcc] font-bold hover:underline">
                {isEn ? "graphics card (GPU)" : "grafickou kartu (GPU)"}
              </a>
              {isEn 
                ? " with an outdated "
                : " se zastaralým "}
              <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="text-[#a855f7] font-bold hover:underline">
                {isEn ? "processor (CPU)" : "procesorem (CPU)"}
              </a>
              {isEn 
                ? ", you create a bottleneck. The faster component literally has to wait for the slower one to finish its job. To see if your current rig suffers from this, immediately check our "
                : ", vytvoříte úzké hrdlo – bottleneck. Rychlejší komponenta doslova čeká, až ta pomalejší dokončí svou práci. Abyste zjistili, zda tímto trpí i vaše sestava, využijte naši "}
              <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="text-[#f59e0b] font-bold hover:underline bg-[#f59e0b] bg-opacity-10 px-2 py-1 rounded">
                {isEn ? "Live FPS & Bottleneck Calculator" : "Živou FPS & Bottleneck Kalkulačku"}
              </a>.
            </p>

            {/* BLOCKQUOTE (Využívá tvoje CSS styly) */}
            <blockquote>
              <strong className="text-[#00ffcc] uppercase tracking-wider flex items-center gap-2"><Flame size={20}/> Guru Fact:</strong> 
              <br/>
              {isEn 
                ? "Every PC has a bottleneck. If there wasn't one, you would have infinite FPS. The goal is to move the bottleneck to the GPU, not eliminate it entirely." 
                : "Každý počítač má bottleneck. Kdyby ho neměl, generoval by nekonečno FPS. Cílem není bottleneck zcela odstranit, ale přesunout ho na grafickou kartu (GPU). Pokud nerozumíte základním pojmům, nahlédněte do našeho "}
              {!isEn && <a href="/clanky" className="text-white font-bold underline">HW Slovníku a článků</a>}.
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 style={{ fontSize: '2.2rem', color: '#fff', borderLeft: '5px solid #a855f7', paddingLeft: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '2. CPU vs. GPU Bottleneck (Comparison)' : '2. CPU vs. GPU Bottleneck (Srovnání)'}
            </h2>
            <p>
              {isEn 
                ? "Not all bottlenecks are created equal. Depending on your resolution and the games you play, the limiting factor changes drastically. For deep dives into specific hardware matchups, browse our "
                : "Není bottleneck jako bottleneck. V závislosti na vašem rozlišení a hrách se limitující faktor drasticky mění. Pro hloubkovou analýzu konkrétních kombinací si projděte naše "}
              <a href={isEn ? "/en/clanky" : "/clanky"} className="text-[#a855f7] font-bold hover:underline">
                {isEn ? "Hardware Reviews & Articles" : "Hardwarové recenze a články"}
              </a>.
            </p>

            {/* TABULKA (Google Golden Rich miluje tabulky, navázáno na tvoje CSS) */}
            <div className="overflow-x-auto mt-8 mb-8">
              <table>
                <thead>
                  <tr>
                    <th>{isEn ? "Feature" : "Vlastnost"}</th>
                    <th style={{ color: '#66fcf1' }}><Cpu size={18} className="inline mr-2"/> CPU Bottleneck</th>
                    <th style={{ color: '#a855f7' }}><Monitor size={18} className="inline mr-2"/> GPU Bottleneck</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{isEn ? "Common Resolution" : "Typické rozlišení"}</strong></td>
                    <td>1080p (FullHD), E-sports</td>
                    <td>1440p (QHD), 4K (UHD)</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? "Symptoms" : "Symptomy ve hře"}</strong></td>
                    <td>{isEn ? "Micro-stuttering, massive 1% low drops" : "Záseky (stuttering), hrozné propady 1% Low FPS"}</td>
                    <td>{isEn ? "Smooth frame pacing, lower max FPS" : "Plynulý obraz, ale nižší maximální FPS"}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? "GPU Usage" : "Využití Grafiky (GPU)"}</strong></td>
                    <td>{isEn ? "Usually sits around 50-70%" : "Fláká se kolem 50-70 %"}</td>
                    <td>{isEn ? "Pinned at 99-100%" : "Zatížena na maximum 99-100 %"}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? "Guru Verdict" : "Guru Verdikt"}</strong></td>
                    <td className="text-red-400 font-bold">{isEn ? "BAD (Upgrade CPU)" : "ŠPATNÉ (Nutný upgrade CPU)"}</td>
                    <td className="text-green-400 font-bold">{isEn ? "GOOD (Optimal setup)" : "DOBRÉ (Ideální stav)"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* MIDDLE REKLAMA */}
          <div style={{ margin: '40px 0', display: 'flex', justifyContent: 'center', width: '100%', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="ad-desktop-wrapper" style={{ minHeight: '90px' }}>
              <SeznamAd zoneId={408873} width={728} height={90} />
            </div>
            <div className="ad-mobile-wrapper" style={{ minHeight: '100px' }}>
              <SeznamAd zoneId={408678} width={320} height={100} />
            </div>
          </div>

          <section className="mb-16">
            <h2 style={{ fontSize: '2.2rem', color: '#fff', borderLeft: '5px solid #f59e0b', paddingLeft: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '3. Overclocking, Tweaks & Fixes' : '3. Overclocking, Tipy a Tweaky'}
            </h2>
            <p>
              {isEn 
                ? "Can you fix a bottleneck for free? Sometimes. If your PC is underperforming, before spending money on upgrades, you should check our "
                : "Můžete vyřešit bottleneck zadarmo? Někdy ano. Pokud váš PC zaostává za očekáváním, než utratíte peníze za nový hardware, bezpodmínečně si prostudujte naši sekci "}
              <a href={isEn ? "/en/tipy" : "/tipy"} className="text-[#f59e0b] font-bold hover:underline">
                {isEn ? "Guru OS Tweaks & Optimization" : "Guru OS Tweaky a Optimalizace"}
              </a>
              {isEn 
                ? " where we reveal hidden Windows settings that unlock raw performance."
                : ", kde odhalujeme skrytá nastavení Windows, která uvolní hrubý výkon."}
            </p>
            
            <ul style={{ listStyleType: 'none', padding: 0, marginTop: '20px' }}>
              <li style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                <Activity size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '5px' }}/>
                <div>
                  <strong style={{ color: '#fff' }}>Undervolting:</strong> 
                  {isEn 
                    ? " Modern overclocking is about reducing voltage. Less heat allows modern processors and GPUs to boost higher and longer."
                    : " Dnešní overclocking je o snižování napětí. Méně tepla dovoluje čipům udržet turbo frekvence mnohem déle. Vždy si zkontrolujte teploty!"}
                </div>
              </li>
              <li style={{ display: 'flex', gap: '15px' }}>
                <Database size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '5px' }}/>
                <div>
                  <strong style={{ color: '#fff' }}>XMP / EXPO Profiles:</strong> 
                  {isEn 
                    ? " A massive CPU bottleneck is often caused simply by forgetting to enable high-speed RAM profiles in the BIOS."
                    : " Obrovský CPU bottleneck si lidé často způsobují sami tím, že v BIOSu nezapnou XMP/EXPO profil pro operační paměti RAM."}
                </div>
              </li>
            </ul>
          </section>

        </article>

        {/* AFFILIATE BUTTONS */}
        <div style={{ margin: '60px 0', padding: '40px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '30px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px' }}>
              {isEn ? "Time for an Upgrade?" : "Čas na Upgrade Sestavy?"}
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '40px', fontSize: '1.1rem' }}>
              {isEn ? "If tweaking isn't enough, replace the bottlenecking component. Check today's lowest prices:" : "Pokud softwarové tweaky nestačí, je na čase vyměnit tu brzdu. Zkontrolujte aktuální nejnižší ceny komponent:"}
            </p>
            <HeurekaButtons isEn={isEn} />
        </div>

        {/* GURU MASSIVE SEO HUB (Rozcestník) */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '60px', marginTop: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', fontWeight: '950', textTransform: 'uppercase', marginBottom: '50px', color: '#fff' }}>
            {isEn ? 'Dive Deeper into The Guru Arsenal' : 'Ponořte se do Guru Arzenálu'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
            
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="guru-spider-link block group" style={{ padding: '30px', background: 'rgba(255,255,255,0.02)' }}>
              <Gamepad2 size={36} color="#00ffcc" style={{ marginBottom: '20px' }} className="group-hover:scale-110 transition-transform duration-300"/>
              <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'Live FPS Calculator' : 'Živá FPS Kalkulačka'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0, fontWeight: 'normal' }}>{isEn ? 'Select your CPU/GPU and see real gaming performance immediately.' : 'Vyberte si CPU a GPU a okamžitě uvidíte reálný herní výkon.'}</p>
            </a>

            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-spider-link block group" style={{ padding: '30px', background: 'rgba(255,255,255,0.02)' }}>
              <Cpu size={36} color="#a855f7" style={{ marginBottom: '20px' }} className="group-hover:scale-110 transition-transform duration-300"/>
              <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'CPU Battles' : 'Souboje Procesorů'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0, fontWeight: 'normal' }}>{isEn ? 'Compare processors head-to-head to find the best value.' : 'Porovnejte procesory tváří v tvář a najděte ten nejlepší.'}</p>
            </a>

            <a href={isEn ? "/en/tipy" : "/tipy"} className="guru-spider-link block group" style={{ padding: '30px', background: 'rgba(255,255,255,0.02)' }}>
              <Wrench size={36} color="#f59e0b" style={{ marginBottom: '20px' }} className="group-hover:scale-110 transition-transform duration-300"/>
              <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'Guru PC Tweaks' : 'Guru PC Návody'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0, fontWeight: 'normal' }}>{isEn ? 'Step-by-step guides for maximum optimization.' : 'Krok za krokem návody pro maximální optimalizaci systému.'}</p>
            </a>

            <a href={isEn ? "/en/clanky" : "/clanky"} className="guru-spider-link block group" style={{ padding: '30px', background: 'rgba(255,255,255,0.02)' }}>
              <BookOpen size={36} color="#ef4444" style={{ marginBottom: '20px' }} className="group-hover:scale-110 transition-transform duration-300"/>
              <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'News & Dictionary' : 'Novinky a Slovník'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0, fontWeight: 'normal' }}>{isEn ? 'Stay updated and understand PC hardware jargon.' : 'Zůstaňte v obraze a pochopte složité technologické termíny.'}</p>
            </a>

          </div>
        </section>

      </main>
    </div>
  );
}
