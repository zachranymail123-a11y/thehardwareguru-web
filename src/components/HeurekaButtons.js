import React from 'react';
import DramCalculator from '../../components/DramCalculator';
import HeurekaButtons from '../../components/HeurekaButtons'; // OPRAVENO: Velké B podle názvu souboru
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
    <div className="guru-page-wrapper">
      
      {/* HEUREKA TRIXAM SCRIPT (image_bd3bf2.png) */}
      <Script 
        src="//serve.affiliate.heureka.cz/js/trixam.min.js" 
        strategy="afterInteractive"
      />

      {/* SKLIK RETARGETING / DISPLAY SCRIPT - Nutné pro zobrazení reklam */}
      <Script strategy="afterInteractive" id="sklik-init">
        {`
          window.fort_aw_p = window.fort_aw_p || {};
          window.fort_aw_p["sklikAd_408873"] = { id: 408873, format: "728x90" };
          window.fort_aw_p["sklikAd_408655"] = { id: 408655, format: "300x600" };
        `}
      </Script>

      <main className="guru-main-container">
        <div className="guru-grid-layout">
          
          {/* LEVÝ SLOUPEC: V.I.P. SESTAVA & SMARTY AD */}
          <aside className="guru-left-sidebar">
            <div className="vip-sestava-card shadow-neon">
              <div className="vip-header">
                <ShoppingCart size={18} className="text-yellow" />
                <div>
                  <small>ULTIMÁTNÍ HERNÍ DĚLO</small>
                  <h3>V.I.P. GURU SESTAVA</h3>
                </div>
              </div>
              <div className="vip-list">
                <div className="vip-item"><span>AMD Ryzen 7 9800X3D</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>GIGABYTE X870E AORUS ELITE</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>Kingston 32GB 6000MT/s</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>ZOTAC RTX 5070 Twin Edge</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>MSI SPATIUM M461 2TB</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>Case dle výběru</span> <button>KOUPIT</button></div>
              </div>
            </div>

            <div className="smarty-ad-wrap">
              <a href="https://smarty.cz" target="_blank" rel="nofollow">
                <img src="https://thehardwareguru.cz/smarty-banner.png" alt="Jsem Smarty" className="smarty-img" />
              </a>
            </div>
          </aside>

          {/* STŘEDOVÝ SLOUPEC: DRAM SIMULÁTOR */}
          <section className="guru-center-content">
            <div className="simulator-header">
              <h1 className="simulator-title">DRAM <span>SIMULÁTOR</span></h1>
            </div>
            
            <DramCalculator isEn={false} />

            <div className="bottom-info-grid">
              <div className="guru-card-dark">
                <h3><Lightbulb size={18} color="#facc15" /> GURU RADY & TIPY</h3>
                <p>Nezapomeň, že u <strong>AMD Ryzen 7000/9000</strong> je FCLK klíčem k výkonu. Vždy se snaž o poměr 1:1 na 6000 MT/s. Pro Intel uživatele s čipy <strong>Hynix A-die</strong> doporučujeme tREFI 65535 pro maximální snížení latence v herní zátěži.</p>
                <Link href="/clanky" className="guru-link">Další rady a tipy <ArrowRight size={14}/></Link>
              </div>

              <div className="guru-card-dark">
                <h3><FileText size={18} color="#a855f7" /> SOUVISEJÍCÍ ČLÁNKY</h3>
                <ul className="article-list">
                  <li><Link href="#">Nejlepší herní RAM pro rok 2026</Link></li>
                  <li><Link href="#">Průvodce taktováním DDR5 pro začátečníky</Link></li>
                  <li><Link href="#">Jaký má reálný vliv latence na 1% Low FPS?</Link></li>
                </ul>
              </div>
            </div>
          </section>

          {/* PRAVÝ SLOUPEC: HEUREKA, REKLAMA & EKOSYSTÉM */}
          <aside className="guru-right-sidebar">
            <div className="heureka-widget shadow-neon">
              <h4 className="widget-title">VÝHODNÝ NÁKUP</h4>
              <div className="heureka-trixam-wrap">
                {/* OPRAVENÝ HEUREKA ODKAZ Z image_bd3bf2.png */}
                <a 
                  href="https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link" 
                  className="heureka-hn-link" 
                  data-trixam-positionid="276034" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  👉 💰 RAM paměti za nejnižší ceny
                </a>
              </div>
              
              {/* HEUREKA BUTTONS KOMPONENTA */}
              <HeurekaButtons />
            </div>

            <div className="sklik-sidebar-ad">
              <span className="ad-label">REKLAMA</span>
              <div id="sklikAd_408655" className="sklik-container"></div>
            </div>

            <div className="ecosystem-widget shadow-neon">
              <h4 className="eco-title">GURU EKOSYSTÉM</h4>
              <nav className="eco-nav">
                <Link href="/bottleneck-kalkulacka" className="eco-item"><AlertCircle size={16} /> <span>Bottleneck Calc</span></Link>
                <Link href="/fps-kalkulacka" className="eco-item"><Zap size={16} /> <span>FPS Kalkulačka</span></Link>
                <Link href="/cpuvs" className="eco-item"><Cpu size={16} /> <span>CPU Duel</span></Link>
                <Link href="/gpuvs" className="eco-item"><HardDrive size={16} /> <span>GPU Duel</span></Link>
                <Link href="/slovnik" className="eco-item"><BookOpen size={16} /> <span>Guru Slovník</span></Link>
              </nav>
            </div>
          </aside>

        </div>

        {/* CSS STYLY PŘESNĚ PODLE image_bd9d89.png */}
        <style dangerouslySetInnerHTML={{__html: `
          .guru-page-wrapper { min-height: 100vh; background-color: #0a0b0d; color: #fff; padding-top: 100px; padding-bottom: 100px; }
          .guru-main-container { maxWidth: 1600px; margin: 0 auto; padding: 0 20px; }
          .guru-grid-layout { display: grid; grid-template-columns: 280px 1fr 320px; gap: 30px; }
          
          /* VIP SESTAVA */
          .vip-sestava-card { background: rgba(15, 17, 21, 0.8); border: 1px solid #eab308; border-radius: 12px; padding: 15px; }
          .vip-header { display: flex; gap: 10px; margin-bottom: 20px; }
          .vip-header small { color: #eab308; font-weight: 900; font-size: 10px; }
          .vip-header h3 { font-size: 14px; font-weight: 900; }
          .vip-list { display: flex; flex-direction: column; gap: 10px; }
          .vip-item { display: flex; justify-content: space-between; align-items: center; font-size: 11px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; }
          .vip-item span { color: #9ca3af; }
          .vip-item button { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid #66fcf1; font-size: 9px; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
          
          /* CENTER CONTENT */
          .simulator-header { text-align: center; margin-bottom: 40px; }
          .simulator-title { font-size: 60px; font-weight: 950; text-transform: uppercase; letter-spacing: -3px; }
          .simulator-title span { color: #a855f7; text-shadow: 0 0 30px rgba(168, 85, 247, 0.4); }
          .bottom-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
          .guru-card-dark { background: rgba(15, 17, 21, 0.7); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 16px; }
          .guru-card-dark h3 { font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
          .article-list { padding-left: 20px; display: flex; flex-direction: column; gap: 10px; color: #a855f7; font-weight: 600; }
          .guru-link { color: #a855f7; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; font-weight: 700; }

          /* SIDEBARS & WIDGETS */
          .heureka-widget { background: #fff; border-radius: 12px; padding: 20px; color: #000; }
          .widget-title { font-size: 12px; font-weight: 900; color: #666; margin-bottom: 15px; }
          .heureka-hn-link { display: block; background: #f7e000; padding: 12px; border-radius: 8px; text-decoration: none; color: #000; font-weight: 900; text-align: center; font-size: 13px; margin-bottom: 10px; }
          
          .ecosystem-widget { background: rgba(15, 17, 21, 0.9); padding: 20px; border-radius: 16px; border: 1px solid rgba(168, 85, 247, 0.2); }
          .eco-title { color: #a855f7; font-size: 12px; font-weight: 950; margin-bottom: 15px; }
          .eco-nav { display: flex; flex-direction: column; gap: 5px; }
          .eco-item { display: flex; align-items: center; gap: 12px; padding: 10px 15px; color: #fff; text-decoration: none; background: rgba(255,255,255,0.03); border-radius: 10px; font-size: 14px; font-weight: 600; }
          .eco-item:hover { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

          .sklik-sidebar-ad { margin: 20px 0; }
          .sklik-container { min-height: 600px; background: rgba(255,255,255,0.01); border: 1px dashed #333; }
          .ad-label { font-size: 9px; color: #444; margin-bottom: 5px; display: block; text-align: center; }
          .smarty-ad-wrap { margin-top: 20px; border-radius: 12px; overflow: hidden; }
          .smarty-img { width: 100%; display: block; }
          .shadow-neon { box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
          .text-yellow { color: #eab308; }

          @media (max-width: 1200px) {
            .guru-grid-layout { grid-template-columns: 1fr; }
            .guru-left-sidebar, .guru-right-sidebar { display: none; }
          }
        `}} />
      </main>
    </div>
  );
}
