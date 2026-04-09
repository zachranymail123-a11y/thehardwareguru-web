import React from 'react';
import { headers } from 'next/headers';
import { 
  Cpu, Monitor, Zap, TrendingUp, BookOpen, Wrench, ChevronRight, Gamepad2, AlertTriangle, Crosshair, Layers, Database, Activity, ShieldCheck
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
    ? "Master your PC performance. Understand CPU/GPU/RAM bottlenecks, calculate your FPS, eliminate stuttering, and unlock maximum power with overclocking." 
    : "Ovládněte výkon svého PC. Zjistěte, co je CPU/GPU a RAM bottleneck, jak eliminovat stuttering a jak z hardwaru vymáčknout maximum pomocí undervoltingu.";

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

  // 🥇 GOOGLE GOLDEN RICH SCHEMA (Rozšířené pro absolutní dominanci)
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
            "acceptedAnswer": { "@type": "Answer", "text": isEn ? "A CPU bottleneck is worse because it causes severe stuttering and low 1% FPS. A GPU bottleneck is normal, meaning your graphics card is fully utilized at 100%." : "CPU bottleneck je horší, protože způsobuje trhání obrazu a záseky. GPU bottleneck je naopak žádoucí stav, kdy využíváte grafiku na plných 100 %." }
          },
          {
            "@type": "Question",
            "name": isEn ? "Does RAM speed affect bottleneck?" : "Má rychlost RAM vliv na bottleneck?",
            "acceptedAnswer": { "@type": "Answer", "text": isEn ? "Yes. Slow RAM or insufficient VRAM can starve the CPU/GPU of data, causing massive frame drops in modern games." : "Ano. Pomalá RAM nebo nedostatek VRAM způsobí, že procesor či grafika nemají data včas, což vyústí v masivní záseky v moderních hrách." }
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.05)' }}>
            <Zap size={16} /> {isEn ? 'Hardware Guru Masterclass' : 'Hardware Guru Masterclass'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {isEn ? 'The Ultimate Guide to ' : 'Ultimátní průvodce: '}
            <span style={{ color: 'transparent', WebkitTextStroke: '2px #66fcf1', backgroundImage: 'linear-gradient(to right, #66fcf1, #06b6d4)', WebkitBackgroundClip: 'text' }}>
              {isEn ? 'Bottlenecks & FPS' : 'Bottleneck & Výkon'}
            </span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginTop: '25px', lineHeight: '1.6', maxWidth: '750px', margin: '25px auto 0' }}>
            {isEn 
              ? "Stop losing frames. Learn exactly how CPU, GPU, and RAM interactions work, uncover the hidden potential of undervolting, eliminate stuttering, and build a perfectly balanced gaming rig." 
              : "Přestaňte ztrácet FPS a potýkat se se záseky obrazu. Zjistěte, jak přesně funguje interakce mezi CPU, GPU a RAM, odhalte potenciál undervoltingu a postavte si dokonale vyvážené herní dělo."}
          </p>
        </header>

        {/* TOP REKLAMA S MIN-HEIGHT PROTI KOLAPSU */}
        <div style={{ marginBottom: '50px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="ad-desktop-wrapper" style={{ minHeight: '90px' }}>
            <SeznamAd zoneId={408654} width={970} height={210} />
          </div>
          <div className="ad-mobile-wrapper" style={{ minHeight: '250px' }}>
            <SeznamAd zoneId={408651} width={300} height={250} />
          </div>
        </div>

        {/* OBSAH - PROSE STYLES */}
        <article className="prose prose-invert prose-lg max-w-none" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#d1d5db' }}>
          
          {/* KAPITOLA 1: Co je Bottleneck */}
          <section className="mb-16">
            <h2 style={{ fontSize: '2rem', color: '#fff', borderLeft: '4px solid #a855f7', paddingLeft: '15px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '1. The Anatomy of a Hardware Bottleneck' : '1. Anatomie Hardwarového Bottlenecku'}
            </h2>
            <p>
              {isEn 
                ? "Imagine a six-lane highway merging into a single lane. It doesn't matter how fast the cars (data) are driving; the single lane dictates the overall speed of traffic. In your PC, a bottleneck occurs when one component operates significantly slower than another, throttling your system's maximum potential."
                : "Představte si šestiproudou dálnici, která se najednou zužuje do jednoho pruhu. Je úplně jedno, jak rychlá auta (data) po ní jedou – ten jeden úzký pruh diktuje celkovou propustnost a rychlost dopravy. Ve vašem počítači nastává úzké hrdlo (bottleneck) tehdy, když jedna komponenta pracuje výrazně pomaleji než zbytek, čímž nekompromisně omezuje maximální možný výkon celé sestavy."}
            </p>
            <p>
              {isEn 
                ? "The rendering of a single frame in a video game is a pipeline. The CPU calculates game logic, physics, and AI, then prepares a 'draw call' for the graphics card. The GPU takes this data, renders the textures, applies lighting, and sends it to your monitor. If any part of this chain is too slow, the entire system waits."
                : "Vykreslení jediného snímku ve hře je jako štafetový závod. Procesor (CPU) nejprve spočítá herní logiku, fyziku a umělou inteligenci. Následně připraví tzv. 'draw call' pro grafickou kartu. Grafika (GPU) tato data převezme, potáhne modely texturami, vypočítá osvětlení a pošle výsledek na monitor. Pokud je kdokoliv v této štafetě pomalý, ten rychlejší musí stát a čekat."}
            </p>
          </section>

          {/* KAPITOLA 2: CPU vs GPU */}
          <section className="mb-16 bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl">
            <h2 style={{ fontSize: '2rem', color: '#fff', borderLeft: '4px solid #66fcf1', paddingLeft: '15px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '2. CPU vs. GPU Bottleneck: The Good and The Bad' : '2. CPU vs. GPU Bottleneck: Který je ten zlý?'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontSize: '1.3rem', fontWeight: '900' }}><Cpu size={24}/> {isEn ? "CPU Bottleneck (The Nightmare)" : "CPU Bottleneck (Noční můra)"}</h3>
                <p style={{ fontSize: '1rem' }}>
                  {isEn 
                    ? "This happens in lower resolutions (1080p) where the GPU renders frames faster than the CPU can prepare them. Symptoms include severe stuttering, terrible 1% low FPS, and inconsistent frame times. Your expensive GPU sits at 60% usage, doing nothing."
                    : "K tomuto scénáři dochází primárně v nižších rozlišeních (1080p), kde grafika vykresluje snímky tak rychle, že je procesor nestíhá připravovat. Symptomy? Brutální trhání obrazu (stuttering), katastrofální propady 1% Low FPS a neplynulý zážitek. Vaše drahá grafika se navíc fláká na 60 % a nevyužívá svůj potenciál."}
                </p>
              </div>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontSize: '1.3rem', fontWeight: '900' }}><Monitor size={24}/> {isEn ? "GPU Bottleneck (The Goal)" : "GPU Bottleneck (Váš cíl)"}</h3>
                <p style={{ fontSize: '1rem' }}>
                  {isEn 
                    ? "Common in 1440p or 4K gaming, or when maxing out Ray Tracing. Here, the GPU is running at 99-100% capacity. This is exactly what you want! It means you are extracting every drop of performance from your most expensive component, and frame pacing is smooth."
                    : "Nastává při hraní ve 1440p, 4K, nebo při maximálním nastavení Ray Tracingu. Grafická karta jede na 99–100 % svých možností. Tohle je přesně to, co chcete! Znamená to, že vaše nejdražší komponenta v PC dře na maximum, dodávka snímků na monitor je plynulá a neobjevují se náhlé záseky."}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#66fcf1', color: '#000', padding: '15px 30px', borderRadius: '15px', fontWeight: '950', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 10px 20px rgba(102, 252, 241, 0.2)' }} className="hover-scale">
                  <Crosshair size={20}/> {isEn ? "Run our Real-Time System Test" : "Spustit Živý Test Sestavy"}
                </a>
            </div>
          </section>

          {/* MIDDLE REKLAMA (Break the text) */}
          <div style={{ margin: '40px 0', display: 'flex', justifyContent: 'center', width: '100%', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="ad-desktop-wrapper" style={{ minHeight: '90px' }}>
              <SeznamAd zoneId={408873} width={728} height={90} />
            </div>
            <div className="ad-mobile-wrapper" style={{ minHeight: '100px' }}>
              <SeznamAd zoneId={408678} width={320} height={100} />
            </div>
          </div>

          {/* KAPITOLA 3: RAM a VRAM (Častá chyba) */}
          <section className="mb-16">
            <h2 style={{ fontSize: '2rem', color: '#fff', borderLeft: '4px solid #10b981', paddingLeft: '15px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '3. The Silent Killers: RAM Speed and VRAM Limits' : '3. Tiší zabijáci: Rychlost RAM a limit VRAM'}
            </h2>
            <p>
              {isEn 
                ? "People often obsess over the CPU and GPU, entirely ignoring memory. This is a fatal mistake in modern PC building."
                : "Lidé jsou často naprosto posedlí výběrem správného procesoru a grafiky, ale úplně ignorují operační paměť. V dnešní době je to fatální chyba."}
            </p>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                <Database size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '5px' }}/>
                <div>
                  <strong style={{ color: '#fff' }}>{isEn ? "System RAM Speed (DDR4/DDR5):" : "Rychlost operační paměti (DDR4/DDR5):"}</strong> 
                  {isEn 
                    ? " Your CPU needs data fast. If you pair a high-end Ryzen processor with slow memory (e.g., leaving XMP/EXPO turned off in the BIOS), you artificially create a severe CPU bottleneck."
                    : " Váš procesor potřebuje data z paměti tryskovou rychlostí. Pokud k silnému Ryzenu koupíte pomalé RAM, nebo zapomenete v BIOSu zapnout XMP/EXPO profil, uměle si vytvoříte masivní CPU bottleneck."}
                </div>
              </li>
              <li style={{ display: 'flex', gap: '15px' }}>
                <Layers size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '5px' }}/>
                <div>
                  <strong style={{ color: '#fff' }}>{isEn ? "Graphics VRAM Capacity:" : "Kapacita VRAM (paměť grafiky):"}</strong> 
                  {isEn 
                    ? " Modern AAA games demand massive amounts of VRAM for textures. If your GPU only has 8GB and the game needs 10GB, textures are offloaded to system RAM, causing catastrophic stutters that drop your game to 5 FPS."
                    : " Moderní AAA hry (jako Alan Wake 2 nebo Cyberpunk) polykají gigabyty paměti pro textury. Pokud má vaše grafika jen 8 GB VRAM, ale hra potřebuje 10 GB, data začnou přetékat do pomalé systémové RAM. Výsledek? Katastrofální záseky a pád na 5 FPS."}
                </div>
              </li>
            </ul>
          </section>

          {/* KAPITOLA 4: Overclocking a Undervolting */}
          <section className="mb-16">
            <h2 style={{ fontSize: '2rem', color: '#fff', borderLeft: '4px solid #f59e0b', paddingLeft: '15px', fontWeight: '900', textTransform: 'uppercase' }}>
              {isEn ? '4. Overclocking & Undervolting: The Cure?' : '4. Overclocking a Undervolting: Je to lék?'}
            </h2>
            <p>
              {isEn 
                ? "If your hardware is slightly lagging behind, performance tuning is the ultimate tool. However, the days of just pushing frequency sliders to the right and hoping it doesn't crash are over."
                : "Pokud váš hardware mírně nestíhá a způsobuje bottleneck, hardwarový tuning je ultimátním řešením. Zapomeňte ale na staré časy, kdy se jen posouvaly jezdce frekvence doprava, dokud PC nespadlo."}
            </p>
            <p>
              {isEn 
                ? "Today, the meta is " : "Dnes je absolutním trendem tzv. "}
              <strong style={{ color: '#f59e0b' }}>Undervolting</strong>. 
              {isEn 
                ? " By carefully lowering the voltage supplied to your CPU or GPU, you dramatically reduce heat output and power consumption. Modern processors boost their clock speeds based on temperature headroom. Less heat means higher sustained boost clocks for a longer period of time, effectively giving you free FPS and a quieter PC."
                : " Pečlivým snížením napětí dodávaného do grafiky (přes MSI Afterburner) nebo procesoru (přes Curve Optimizer pro AMD) drasticky snížíte vyzařované teplo a spotřebu. Moderní čipy totiž zvyšují svůj výkon podle toho, jak dobré mají teploty. Méně tepla = trvale vyšší Boost frekvence. Výsledkem jsou FPS zdarma, nulový Thermal Throttling a tichý chod ventilátorů."}
            </p>
            <blockquote style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)', borderLeft: '4px solid #f59e0b', padding: '20px', borderRadius: '0 15px 15px 0', fontStyle: 'italic', margin: '30px 0' }}>
              <strong><AlertTriangle size={18} style={{ display: 'inline', marginBottom: '2px' }}/> {isEn ? "Guru Tip:" : "Guru Tip:"}</strong> {isEn ? "You cannot fix a massive 40% bottleneck with overclocking. If you pair an RTX 4090 with a 10-year-old Intel Core i7, no amount of voltage tweaking will save you. You need a hardware upgrade." : "Snažit se overclockingem vyřešit masivní 40% bottleneck je zbytečné. Pokud spárujete RTX 4090 se starým procesorem, žádná magie s napětím vás nezachrání. V takovém bodě musíte otevřít peněženku."}
            </blockquote>
          </section>

        </article>

        {/* AFFILIATE BUTTONS (Konverze na konci článku) */}
        <div style={{ margin: '60px 0', padding: '40px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '30px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px' }}>
              {isEn ? "Ready to fix your bottleneck?" : "Jste připraveni vyřešit svůj bottleneck?"}
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
              {isEn ? "Upgrade your weakest link today and unlock the true performance of your machine." : "Upgradujte svůj nejslabší článek v sestavě a odemkněte skutečný výkon vašeho stroje."}
            </p>
            <HeurekaButtons isEn={isEn} />
        </div>

        {/* GURU MASSIVE SEO HUB (INTERNÍ PROLINKOVÁNÍ SILO) */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '50px', marginTop: '50px' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', fontWeight: '950', textTransform: 'uppercase', marginBottom: '40px', color: '#fff' }}>
            {isEn ? 'Explore The Guru Arsenal' : 'Prozkoumejte Guru Arzenál'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', textDecoration: 'none', transition: '0.3s' }} className="hover-scale">
              <Gamepad2 size={32} color="#66fcf1" style={{ marginBottom: '15px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'FPS & Bottleneck Calc' : 'FPS & Bottleneck Kalkulačka'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>{isEn ? 'Test your build in 100+ games in real-time.' : 'Otestujte svoji sestavu ve více než 100 hrách živě.'}</p>
            </a>

            <a href={isEn ? "/en/tipy" : "/tipy"} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', textDecoration: 'none', transition: '0.3s' }} className="hover-scale">
              <Wrench size={32} color="#a855f7" style={{ marginBottom: '15px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'Guru Tweaks & Tips' : 'Guru Tipy a Návody'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>{isEn ? 'Unlock hidden Windows settings for max FPS.' : 'Odhalte skrytá nastavení Windows pro max FPS.'}</p>
            </a>

            <a href={isEn ? "/en/clanky" : "/clanky"} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', textDecoration: 'none', transition: '0.3s' }} className="hover-scale">
              <BookOpen size={32} color="#f59e0b" style={{ marginBottom: '15px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{isEn ? 'Tech News & Dictionary' : 'HW Slovník a Články'}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>{isEn ? 'Understand the tech jargon and stay updated.' : 'Pochopte složité technologické výrazy a novinky.'}</p>
            </a>

          </div>
        </section>

        {/* SOCIÁLNÍ SÍTĚ UŽIVATELE (Autorita pro Google) */}
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
