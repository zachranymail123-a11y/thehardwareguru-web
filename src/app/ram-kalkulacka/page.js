import React from 'react';
import DramCalculator from '../../components/DramCalculator';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowRight, Cpu, HardDrive, BookOpen, AlertCircle, 
  ShoppingCart, Calculator, Zap, ShieldCheck, Activity,
  FileText, Lightbulb
} from 'lucide-react';

export const metadata = {
  title: 'DRAM SIMULÁTOR | Hardware Guru',
  description: 'Profesionální simulátor pro taktování DDR4 a DDR5. Výpočet stability a latence.',
};

export default function RamCalcPage() {
  return (
    <div className="guru-clean-wrapper">
      
      {/* MONETIZACE SCRIPT - Trixam */}
      <Script 
        src="//serve.affiliate.heureka.cz/js/trixam.min.js" 
        strategy="afterInteractive"
      />

      {/* REKLAMA SCRIPT - Sklik */}
      <Script strategy="afterInteractive" id="sklik-init">
        {`
          window.fort_aw_p = window.fort_aw_p || {};
          window.fort_aw_p["sklikAd_408873"] = { id: 408873, format: "728x90" };
          window.fort_aw_p["sklikAd_408655"] = { id: 408655, format: "300x600" };
        `}
      </Script>

      <main className="guru-main-center">
        
        {/* HERO HEADER */}
        <header className="hero-header">
          <h1 className="hero-title">DRAM <span>SIMULÁTOR</span></h1>
          <p className="hero-subtitle">Profesionální modelování stability a latence pamětí</p>
        </header>

        <div className="guru-main-layout">
          
          {/* HLAVNÍ CONTENT - TOOL AREA */}
          <section className="tool-section">
            <DramCalculator isEn={false} />

            {/* EDUKATIVNÍ BLOKY POD NÁSTROJEM */}
            <div className="tool-info-footer">
              <div className="info-box shadow-subtle">
                <h3><Lightbulb size={20} color="#facc15" /> GURU RADY</h3>
                <p>U AMD Ryzen 7000/9000 je ideální sweetspot <strong>6000 MT/s</strong>. Pro Intel s čipy Hynix A-die doporučujeme tREFI 65535 pro nejnižší latenci.</p>
                <Link href="/clanky" className="clean-link">Číst více tipů <ArrowRight size={14}/></Link>
              </div>

              <div className="info-box shadow-subtle">
                <h3><FileText size={20} color="#a855f7" /> ČLÁNKY</h3>
                <ul className="clean-list">
                  <li><Link href="#">Nejlepší RAM 2026</Link></li>
                  <li><Link href="#">Jak taktovat DDR5</Link></li>
                </ul>
              </div>
            </div>
          </section>

          {/* SIDEBAR - POUZE MONETIZACE A EKOSYSTÉM */}
          <aside className="guru-sidebar-clean">
            
            {/* HEUREKA WIDGET */}
            <div className="sidebar-widget heureka-white">
              <h4 className="widget-label">VÝHODNÝ NÁKUP</h4>
              <a 
                href="https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link" 
                className="trixam-button" 
                data-trixam-positionid="276034" 
                target="_blank"
                rel="noopener noreferrer"
              >
                👉 RAM za nejlepší ceny
              </a>
              <HeurekaButtons />
            </div>

            {/* SKLIK AD */}
            <div className="sidebar-ad">
              <span className="ad-meta">REKLAMA</span>
              <div id="sklikAd_408655" className="sklik-placeholder"></div>
            </div>

            {/* GURU EKOSYSTÉM */}
            <div className="sidebar-widget ecosystem-dark shadow-neon">
              <h4 className="widget-label purple">GURU EKOSYSTÉM</h4>
              <nav className="eco-nav-clean">
                <Link href="/bottleneck-kalkulacka" className="eco-link-clean"><AlertCircle size={16} /> Bottleneck Calc</Link>
                <Link href="/fps-kalkulacka" className="eco-item-clean"><Zap size={16} /> FPS Kalkulačka</Link>
                <Link href="/cpuvs" className="eco-link-clean"><Cpu size={16} /> CPU Duel</Link>
                <Link href="/gpuvs" className="eco-link-clean"><HardDrive size={16} /> GPU Duel</Link>
                <Link href="/slovnik" className="eco-link-clean"><BookOpen size={16} /> Slovník</Link>
              </nav>
            </div>

          </aside>
        </div>

        {/* CLEAN CSS STYLY */}
        <style dangerouslySetInnerHTML={{__html: `
          .guru-clean-wrapper { 
            min-height: 100vh; 
            background-color: #050505; 
            background-image: radial-gradient(circle at 50% 50%, #111 0%, #050505 100%);
            color: #fff; 
            padding: 60px 0; 
          }
          .guru-main-center { max-width: 1280px; margin: 0 auto; padding: 0 20px; }
          .hero-header { text-align: center; margin-bottom: 50px; }
          .hero-title { font-size: 56px; font-weight: 950; text-transform: uppercase; letter-spacing: -3px; }
          .hero-title span { color: #a855f7; }
          .hero-subtitle { color: #6b7280; font-size: 18px; margin-top: 10px; }

          .guru-main-layout { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
          
          .info-box { background: #0f1115; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; }
          .tool-info-footer { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-top: 30px; }
          .clean-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
          .clean-list a { color: #a855f7; text-decoration: none; font-weight: 600; font-size: 14px; }
          .clean-link { color: #a855f7; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; margin-top: 15px; }

          .sidebar-widget { padding: 25px; border-radius: 20px; margin-bottom: 25px; }
          .heureka-white { background: #fff; color: #000; }
          .ecosystem-dark { background: #0a0b0d; border: 1px solid rgba(168, 85, 247, 0.2); }
          .widget-label { font-size: 11px; font-weight: 950; color: #666; margin-bottom: 15px; letter-spacing: 1px; }
          .widget-label.purple { color: #a855f7; }

          .trixam-button { display: block; background: #f7e000; color: #000; text-decoration: none; padding: 14px; border-radius: 12px; font-weight: 900; text-align: center; font-size: 14px; box-shadow: 0 4px 0 #d9c700; }
          .eco-link-clean { display: flex; align-items: center; gap: 12px; padding: 12px; color: #fff; text-decoration: none; font-weight: 600; border-radius: 10px; transition: 0.2s; background: rgba(255,255,255,0.02); margin-bottom: 6px; }
          .eco-link-clean:hover { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

          .sklik-placeholder { min-height: 600px; background: rgba(255,255,255,0.01); border: 1px dashed #222; }
          .ad-meta { font-size: 9px; color: #444; margin-bottom: 5px; display: block; text-align: center; }

          @media (max-width: 1100px) {
            .guru-main-layout { grid-template-columns: 1fr; }
            .guru-sidebar-clean { display: none; }
          }
        `}} />
      </main>
    </div>
  );
}
