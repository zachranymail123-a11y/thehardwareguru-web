import React from 'react';
import { headers } from 'next/headers';
import { 
  Cpu, Monitor, Zap, TrendingUp, BookOpen, Wrench, ChevronRight, Gamepad2, ShieldAlert, Crosshair
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
    ? "Master your PC performance. Understand CPU/GPU bottlenecks, calculate your FPS, and unlock maximum power with our extreme overclocking tips." 
    : "Ovládněte výkon svého PC. Zjistěte, co je CPU/GPU bottleneck, jak spočítat FPS a jak z hardwaru vymáčknout maximum pomocí overclockingu.";

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

  // 🥇 GOOGLE GOLDEN RICH SCHEMA (Article + FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": isEn ? "What is a PC Bottleneck? The Ultimate FPS & Overclocking Guide" : "Co je to Bottleneck? Ultimátní průvodce FPS a Overclockingem",
        "description": isEn ? "Learn how to identify and fix PC bottlenecks to maximize your gaming FPS." : "Naučte se identifikovat a vyřešit bottleneck v PC a maximalizovat tak své herní FPS.",
        "author": {
          "@type": "Person",
          "name": "The Hardware Guru",
          "url": "https://www.youtube.com/@TheHardwareGuru_Czech"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Hardware Guru",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`
          }
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": isEn ? "What is a bottleneck in a PC?" : "Co je to bottleneck v PC?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": isEn ? "A bottleneck occurs when one PC component, usually the CPU or GPU, is significantly slower than the rest, limiting overall performance and FPS." : "Bottleneck nastává, když jedna komponenta (typicky CPU nebo GPU) nestíhá zpracovávat data tak rychle jako zbytek systému, což omezuje maximální výkon a FPS."
            }
          },
          {
            "@type": "Question",
            "name": isEn ? "Does overclocking fix a bottleneck?" : "Vyřeší overclocking bottleneck?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": isEn ? "Overclocking the limiting component (e.g., overclocking a bottlenecking CPU) can reduce the severity of the bottleneck, yielding a free FPS boost, but it rarely eliminates a massive hardware gap completely." : "Přetaktování slabší komponenty může snížit dopad bottlenecku a přidat FPS zdarma, ale zřídkakdy zcela eliminuje masivní rozdíl mezi generacemi hardwaru."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="guru-megapage-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* JSON-LD Script pro Google Golden Rich */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        {/* HERO SECTION */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.05)' }}>
            <Zap size={16} /> {isEn ? 'Hardware Guru Masterclass' : 'Hardware Guru Masterclass'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {isEn ? 'The Ultimate Guide to ' : 'Ultimátní průvodce: '}
            <span style={{ color: 'transparent', WebkitTextStroke: '2px #66fcf1', backgroundImage: 'linear-gradient(to right, #66fcf1, #06b6d4)', WebkitBackgroundClip: 'text' }}>
              {isEn ? 'Bottlenecks & FPS' : 'Bottleneck & Výkon'}
            </span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginTop: '25px', lineHeight: '1.6', maxWidth: '700px', margin: '25px auto 0' }}>
            {isEn 
              ? "Stop losing frames. Learn exactly how CPU and GPU interactions work, uncover the hidden potential of overclocking, and build a perfectly balanced gaming rig." 
              : "Přestaňte ztrácet FPS. Zjistěte, jak přesně funguje interakce mezi procesorem a grafikou, odhalte potenciál overclockingu a postavte si dokonale vyvážené herní dělo."}
          </p>
        </header>

        {/* REKLAMA DESKTOP/MOBILE */}
        <div style={{ marginBottom: '50px', display: 'flex', justifyContent: 'center' }}>
          <div className="ad-desktop-wrapper">
            <SeznamAd zoneId={408654} width={728} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
            <SeznamAd zoneId={408651} width={300} height={250} />
          </div>
        </div>

        {/* OBSAH - PROSE STYLES */}
        <article className="prose prose-invert prose-lg max-w-none" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#d1d5db' }}>
          
          <section className="mb-16">
            <h2 style={{ fontSize: '2rem', color: '#fff', borderLeft: '4px solid #a855f7', paddingLeft: '15px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '1. What Exactly is a Hardware Bottleneck?' : '1. Co je to vlastně HW Bottleneck?'}
            </h2>
            <p>
              {isEn 
                ? "Imagine a six-lane highway merging into a single lane. It doesn't matter how fast the cars are driving; the single lane dictates the overall speed of traffic. In your PC, a bottleneck occurs when one component operates significantly slower than another, throttling your system's maximum potential."
                : "Představte si šestiproudou dálnici, která se najednou zužuje do jednoho pruhu. Je jedno, jak rychlá auta po ní jedou – ten jeden pruh diktuje celkovou rychlost dopravy. Ve vašem počítači nastává úzké hrdlo (bottleneck) tehdy, když jedna komponenta pracuje výrazně pomaleji než zbytek, čímž omezuje maximální možný výkon."}
            </p>
            <p>
              {isEn 
                ? "The most common conflict happens between the processor and the graphics card. If you pair an extremely powerful " 
                : "Nejčastější konflikt nastává na lince procesor – grafická karta. Pokud spojíte extrémně výkonnou "}
              <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'underline' }}>
                {isEn ? "graphics card" : "grafickou kartu"}
              </a>
              {isEn 
                ? " with a weak CPU, the graphics card will constantly wait for instructions, leading to stuttering and low FPS."
                : " se slabým procesorem, grafika bude neustále čekat na instrukce. Výsledek? Záseky (stuttering) a nízké FPS."}
            </p>
          </section>

          <section className="mb-16 bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl">
            <h2 style={{ fontSize: '2rem', color: '#fff', borderLeft: '4px solid #66fcf1', paddingLeft: '15px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '2. CPU vs. GPU Bottleneck: Which is worse?' : '2. CPU vs. GPU Bottleneck: Co je horší?'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontSize: '1.3rem', fontWeight: '900' }}><Cpu size={24}/> CPU Bottleneck</h3>
                <p style={{ fontSize: '1rem' }}>
                  {isEn 
                    ? "Occurs primarily in lower resolutions (1080p) or e-sports titles like CS2 and Valorant. The CPU cannot calculate physics and feed frames fast enough. This is the worst type of bottleneck because it causes micro-stutters and inconsistent frame times."
                    : "Nastává primárně v nižších rozlišeních (1080p) nebo v e-sport titulech jako CS2. Procesor nestíhá počítat fyziku a AI. Toto je ten nejhorší typ bottlenecku, protože způsobuje trhání obrazu a nekonzistentní odezvu (1% Low FPS propady)."}
                </p>
              </div>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontSize: '1.3rem', fontWeight: '900' }}><Monitor size={24}/> GPU Bottleneck</h3>
                <p style={{ fontSize: '1rem' }}>
                  {isEn 
                    ? "Occurs in 4K gaming or when using heavy Ray Tracing. Your CPU is relaxed while the graphics card is sweating at 100%. This is actually the 'good' bottleneck. It means you are using your expensive GPU to its absolute maximum."
                    : "Nastává při hraní ve 4K nebo při zapnutí Ray Tracingu. Procesor se nudí, zatímco grafika potí krev na 100 %. Tohle je vlastně „dobrý“ bottleneck. Znamená to, že vaši drahou grafickou kartu využíváte na absolutní maximum."}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#66fcf1', color: '#000', padding: '12px 25px', borderRadius: '12px', fontWeight: '900', textTransform: 'uppercase', textDecoration: 'none' }}>
                  <Crosshair size={18}/> {isEn ? "Run our Real-Time Bottleneck Test" : "Spustit náš živý Bottleneck Test"}
                </a>
            </div>
          </section>

          <section className="mb-16">
            <h2 style={{ fontSize: '2rem', color: '#fff', borderLeft: '4px solid #f59e0b', paddingLeft: '15px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '3. Overclocking: Free FPS or Dangerous Myth?' : '3. Overclocking (Přetaktování): FPS zdarma, nebo nebezpečí?'}
            </h2>
            <p>
              {isEn 
                ? "If your hardware is lagging behind, overclocking is the ultimate tool of PC enthusiasts. Pushing the core clocks of your "
                : "Pokud váš hardware nestíhá, overclocking je ultimátní zbraní PC nadšenců. Zvýšením taktů na vašem "}
              <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ color: '#f59e0b', fontWeight: 'bold', textDecoration: 'underline' }}>
                {isEn ? "processor" : "procesoru"}
              </a>
              {isEn 
                ? " or GPU can effectively squeeze an extra 5-15% of raw performance, mitigating a minor bottleneck without spending a dime."
                : " nebo grafice můžete z hardwaru doslova vyždímat 5 až 15 % hrubého výkonu navíc, čímž často zjemníte bottleneck bez jediné utracené koruny."}
            </p>
            <blockquote style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)', borderLeft: '4px solid #f59e0b', padding: '20px', borderRadius: '0 15px 15px 0', fontStyle: 'italic', margin: '30px 0' }}>
              <strong>{isEn ? "Guru Tip:" : "Guru Tip:"}</strong> {isEn ? "Don't blindly turn sliders to max. Modern overclocking is about undervolting (lowering the voltage to reduce heat) while keeping clocks high. Less heat = higher sustained boost frequencies." : "Netočte s posuvníky naslepo. Moderní přetaktování je dnes spíše o undervoltingu (snížení napětí pro lepší teploty), díky čemuž si karta udrží vysoké boost frekvence mnohem déle."}
            </blockquote>
          </section>

        </article>

        {/* AFFILIATE BUTTONS (Nenápadně vloženy pro konverze) */}
        <div style={{ margin: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <HeurekaButtons isEn={isEn} />
        </div>

        {/* GURU MASSIVE SEO HUB (ZDE JE TVOJE INTERNÍ PROLINKOVÁNÍ) */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '50px', marginTop: '50px' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', fontWeight: '950', textTransform: 'uppercase', marginBottom: '40px', color: '#fff' }}>
            {isEn ? 'Explore The Guru Arsenal' : 'Prozkoumejte Guru Arzenál'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            {/* Box 1: Kalkulačky */}
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', textDecoration: 'none', transition: '0.3s' }} className="hover-scale">
              <Gamepad2 size={32} color="#66fcf1" style={{ marginBottom: '15px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'FPS & Bottleneck Calc' : 'FPS & Bottleneck Kalkulačka'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>{isEn ? 'Test your build in 100+ games in real-time.' : 'Otestujte svoji sestavu ve více než 100 hrách živě.'}</p>
            </a>

            {/* Box 2: Tipy a Tweaky */}
            <a href={isEn ? "/en/tipy" : "/tipy"} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', textDecoration: 'none', transition: '0.3s' }} className="hover-scale">
              <Wrench size={32} color="#a855f7" style={{ marginBottom: '15px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'Guru Tweaks & Tips' : 'Guru Tipy a Návody'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>{isEn ? 'Unlock hidden Windows settings for max FPS.' : 'Odhalte skrytá nastavení Windows pro max FPS.'}</p>
            </a>

            {/* Box 3: Slovník / Články */}
            <a href={isEn ? "/en/clanky" : "/clanky"} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', textDecoration: 'none', transition: '0.3s' }} className="hover-scale">
              <BookOpen size={32} color="#f59e0b" style={{ marginBottom: '15px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'Tech News & Dictionary' : 'HW Slovník a Články'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>{isEn ? 'Understand the tech jargon and stay updated.' : 'Pochopte složité technologické výrazy a novinky.'}</p>
            </a>

          </div>
        </section>

        {/* SOCIÁLNÍ SÍTĚ UŽIVATELE (Autorita) */}
        <div style={{ marginTop: '80px', padding: '40px', background: 'linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(6, 182, 212, 0.1))', borderRadius: '30px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '20px' }}>
            {isEn ? 'Join The Hardware Guru Community' : 'Připojte se ke komunitě Hardware Guru'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 25px', background: '#ff0000', color: '#fff', fontWeight: 'bold', borderRadius: '12px', textDecoration: 'none' }}>YouTube</a>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 25px', background: '#53fc18', color: '#000', fontWeight: 'bold', borderRadius: '12px', textDecoration: 'none' }}>Kick Stream</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 25px', background: '#5865F2', color: '#fff', fontWeight: 'bold', borderRadius: '12px', textDecoration: 'none' }}>Discord</a>
          </div>
        </div>

      </main>
    </div>
  );
}
