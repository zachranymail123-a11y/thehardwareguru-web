import React from 'react';
import DramCalculator from '../../components/DramCalculator';
import Link from 'next/link';
import { ArrowRight, Cpu, HardDrive, BookOpen, AlertCircle, ShoppingCart, Calculator, Zap, ShieldCheck, Activity } from 'lucide-react';

export const metadata = {
  title: 'DRAM Overclocking Simulátor | RAM Kalkulačka latence | Hardware Guru',
  description: 'Profesionální simulátor pro taktování DDR4 a DDR5. Vypočítejte si absolutní latenci, stabilitu a efektivní propustnost podle typu vašeho čipu.',
  alternates: {
    canonical: 'https://thehardwareguru.cz/ram-kalkulacka',
  },
  openGraph: {
    title: 'DRAM Simulátor | Hardware Guru',
    description: 'Pokročilé modelování chování operačních pamětí a stability IMC řadiče.',
    url: 'https://thehardwareguru.cz/ram-kalkulacka',
    siteName: 'Hardware Guru',
    images: [
      {
        url: '/og-dram.png', // Nezapomeň tento obrázek nahrát do public složky
        width: 1200,
        height: 630,
        alt: 'Hardware Guru DRAM Simulator',
      },
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
};

export default function RamCalcPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'scroll', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '0.9', letterSpacing: '-3px' }}>
            DRAM <span style={{ color: '#a855f7', textShadow: '0 0 40px rgba(168, 85, 247, 0.6)' }}>SIMULÁTOR</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.25rem', marginTop: '20px', fontWeight: '500', maxWidth: '750px', margin: '20px auto 0' }}>
            První český simulátor křemíkového chování. Počítejte stabilitu, True Latency Index a efektivitu propustnosti v reálném čase.
          </p>
        </header>

        <div className="guru-layout-grid">
          
          <section className="calc-main-section">
            <div className="sticky-wrapper">
              <DramCalculator isEn={false} />
            </div>

            <div className="seo-content-block">
              <div className="seo-card">
                <h2><Activity size={20} color="#a855f7" /> Proč záleží na latenci RAM?</h2>
                <p>Absolutní latence v nanosekundách (ns) určuje rychlost, s jakou procesor přistupuje k datům. Zatímco vysoké MT/s zvyšuje teoretickou propustnost, správné časování (CL, tRCD, tRP) je klíčové pro herní plynulost a eliminaci micro-stutteringu.</p>
              </div>
              <div className="seo-card">
                <h2><Zap size={20} color="#a855f7" /> Význam sekundárního časování tRFC</h2>
                <p>tRFC (Row Refresh Cycle Time) patří mezi nejdůležitější sekundární timingy. U moderních DDR5 modulů s vysokou hustotou čipů má tRFC drastický dopad na celkovou odezvu. Ladění tRFC spolu s tREFI dokáže u Hynix A-die čipů snížit latenci o 5 až 10 ns.</p>
              </div>
              <div className="seo-card">
                <h2><ShieldCheck size={20} color="#a855f7" /> Stabilita a limity IMC</h2>
                <p>Náš engine simuluje zátěž na paměťový řadič (IMC). U procesorů AMD Ryzen 7000 je ideální sweetspot kolem <strong>6000 MT/s</strong> (v režimu 1:1), zatímco u platformy Intel se maximální stabilní frekvence liší podle kvality křemíku a typu základní desky.</p>
              </div>
            </div>
          </section>

          <aside className="guru-sidebar">
            <div className="sidebar-promo">
              <span className="ad-label">SPONSORED CONTENT</span>
              <div className="ad-placeholder">Místo pro tvou reklamu</div>
            </div>

            <div className="heureka-section">
              <h4>⭐ DOPORUČENO PRO OVERCLOCKING</h4>
              <div className="heureka-list">
                <a href="https://ram.heureka.cz/f:21133:43715891;q:hynix%20a-die/" target="_blank" rel="noopener noreferrer" className="heureka-btn">
                  Hynix A-die (Extreme OC) <ShoppingCart size={14} />
                </a>
                <a href="https://ram.heureka.cz/f:21133:351421/" target="_blank" rel="noopener noreferrer" className="heureka-btn">
                  Samsung B-die (DDR4 King) <ShoppingCart size={14} />
                </a>
              </div>
              <p className="affiliate-note">Komunitou ověřené kity s nejlepším potenciálem.</p>
            </div>

            <div className="nav-links-card">
               <h4>GURU EKOSYSTÉM</h4>
               <Link href="/bottleneck-kalkulacka" className="side-nav-link"><AlertCircle size={14} /> Bottleneck Calc</Link>
               <Link href="/fps-kalkulacka" className="side-nav-link"><Zap size={14} /> FPS Kalkulačka</Link>
               <Link href="/cpuvs" className="side-nav-link"><Cpu size={14} /> CPU Duel</Link>
               <Link href="/gpuvs" className="side-nav-link"><HardDrive size={14} /> GPU Duel</Link>
               <Link href="/slovnik" className="side-nav-link"><BookOpen size={14} /> Guru Slovník</Link>
            </div>
          </aside>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .guru-layout-grid { display: grid; grid-template-columns: 1fr 320px; gap: 40px; }
          .calc-main-section { min-height: 700px; } /* Prevence CLS */
          .sticky-wrapper { position: sticky; top: 100px; z-index: 10; max-width: 100%; }
          
          @media (max-height: 850px) { .sticky-wrapper { position: static; } }

          .seo-content-block { margin-top: 50px; display: grid; gap: 20px; }
          .seo-card { background: rgba(15, 17, 21, 0.6); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; }
          .seo-card h2 { font-size: 1.25rem; margin: 0 0 12px 0; display: flex; align-items: center; gap: 10px; color: #fff; }
          .seo-card p { color: #9ca3af; line-height: 1.6; margin: 0; font-size: 0.9rem; }
          .heureka-section { background: #fff; padding: 25px; border-radius: 20px; color: #000; }
          .heureka-section h4 { margin: 0 0 15px 0; font-weight: 950; font-size: 12px; letter-spacing: 1px; }
          .heureka-list { display: grid; gap: 10px; }
          .heureka-btn { background: #f7e000; color: #000; padding: 12px; border-radius: 10px; text-align: center; text-decoration: none; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
          .heureka-btn:hover { transform: scale(1.03); }
          .affiliate-note { font-size: 9px; color: #888; margin-top: 12px; text-align: center; font-weight: bold; }
          .nav-links-card { background: rgba(15, 17, 21, 0.8); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 10px; }
          .nav-links-card h4 { font-size: 11px; color: #a855f7; letter-spacing: 2px; margin-bottom: 10px; }
          .side-nav-link { color: #d1d5db; text-decoration: none; font-size: 14px; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.03); transition: 0.2s; }
          .side-nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); transform: translateX(5px); }
          .ad-placeholder { width: 100%; height: 250px; background: #000; border-radius: 15px; border: 1px dashed #333; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #444; }
          .ad-label { font-size: 9px; color: #444; margin-bottom: 8px; display: block; letter-spacing: 2px; }

          @media (max-width: 900px) {
            .guru-layout-grid { grid-template-columns: 1fr; }
            .sticky-wrapper { position: static; }
          }
        `}} />
      </main>
    </div>
  );
}
