import React from 'react';
import DramCalculator from '../../components/DramCalculator';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowRight, Cpu, HardDrive, BookOpen, AlertCircle, 
  ShoppingCart, Calculator, Zap, ShieldCheck, Activity,
  FileText, Lightbulb, Search
} from 'lucide-react';

export const metadata = {
  title: 'DRAM SIMULÁTOR | Hardware Guru',
  description: 'Profesionální simulátor pro taktování DDR4 a DDR5. Výpočet stability, latence a propustnosti křemíku.',
};

export default function RamCalcPage() {
  return (
    <div className="guru-site-wrapper">
      
      {/* HEUREKA TRIXAM SCRIPT (image_bd3bf2.png) */}
      <Script 
        src="//serve.affiliate.heureka.cz/js/trixam.min.js" 
        strategy="afterInteractive"
      />

      {/* SEZNAM / SKLIK INITIALIZATION - image_bd3fae.png */}
      <Script strategy="afterInteractive" id="sklik-ads-init">
        {`
          window.fort_aw_p = window.fort_aw_p || {};
          window.fort_aw_p["sklikAd_408873"] = { id: 408873, format: "728x90" };
          window.fort_aw_p["sklikAd_408655"] = { id: 408655, format: "300x600" };
        `}
      </Script>

      <main className="guru-container">
        
        {/* TOP AD SLOT - SKLIK DESKTOP ANCHOR (ID 408873) */}
        <div className="ad-top-leaderboard">
          <div id="sklikAd_408873" className="sklik-placeholder-top"></div>
        </div>

        <div className="guru-main-grid">
          
          {/* LEVÝ SIDEBAR: V.I.P. SESTAVA & SMARTY */}
          <aside className="guru-sidebar-left">
            <div className="vip-build-card shadow-gold">
              <div className="vip-header">
                <ShoppingCart size={20} style={{ color: '#eab308' }} />
                <div>
                  <small className="gold-text">ULTIMÁTNÍ HERNÍ DĚLO</small>
                  <h3>V.I.P. GURU SESTAVA</h3>
                </div>
              </div>
              <div className="vip-products">
                <div className="p-item"><span>AMD Ryzen 7 9800X3D</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="p-item"><span>GIGABYTE X870E AORUS ELITE</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="p-item"><span>Kingston 32GB 6000MT/s</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="p-item"><span>ZOTAC RTX 5070 Twin Edge</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="p-item"><span>MSI SPATIUM M461 2TB</span> <button className="buy-btn">KOUPIT</button></div>
                <div className="p-item"><span>Case dle výběru</span> <button className="buy-btn">KOUPIT</button></div>
              </div>
            </div>

            <div className="smarty-banner-area">
              <a href="https://smarty.cz" target="_blank" rel="nofollow">
                <img src="https://thehardwareguru.cz/smarty-banner.png" alt="Smarty" className="banner-img" />
              </a>
            </div>
          </aside>

          {/* STŘEDOVÝ OBSAH: DRAM SIMULÁTOR */}
          <section className="guru-main-content">
            <div className="page-title-wrap">
              <h1 className="simulator-main-title">DRAM <span>SIMULÁTOR</span></h1>
            </div>
            
            {/* HLAVNÍ NÁSTROJ */}
            <DramCalculator isEn={false} />

            {/* CONTENT POD KALKULAČKOU */}
            <div className="guru-content-footer">
              <div className="card-glass shadow-purple">
                <h3><Lightbulb size={20} color="#facc15" /> GURU RADY & TIPY</h3>
                <p>Nezapomeň, že u <strong>AMD Ryzen 7000/9000</strong> je FCLK klíčem k výkonu. Vždy se snaž o poměr 1:1 na 6000 MT/s. Pro Intel uživatele doporučujeme tREFI 65535 pro maximální snížení latence.</p>
                <Link href="/clanky" className="guru-link-neon">Zobrazit další rady <ArrowRight size={14}/></Link>
              </div>

              <div className="card-glass shadow-purple">
                <h3><FileText size={20} color="#a855f7" /> SOUVISEJÍCÍ ČLÁNKY</h3>
                <ul className="article-links">
                  <li><Link href="#">Nejlepší herní RAM pro rok 2026</Link></li>
                  <li><Link href="#">Průvodce taktováním DDR5 pro začátečníky</Link></li>
                  <li><Link href="#">Jaký má reálný vliv latence na 1% Low FPS?</Link></li>
                </ul>
              </div>
            </div>
          </section>

          {/* PRAVÝ SIDEBAR: HEUREKA, SKLIK & EKOSYSTÉM */}
          <aside className="guru-sidebar-right">
            
            {/* HEUREKA WIDGET (image_be15ab.png) */}
            <div className="heureka-affiliate-section shadow-neon">
              <h4 className="widget-title">VÝHODNÝ NÁKUP</h4>
              <div className="trixam-link-area">
                <a 
                  href="https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link" 
                  className="heureka-main-link" 
                  data-trixam-positionid="276034" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  👉 💰 RAM paměti za nejnižší ceny
                </a>
              </div>
              
              {/* TLAČÍTKA HYNIX / SAMSUNG */}
              <HeurekaButtons />

              <div className="heureka-search-box">
                <div className="h-search-inner">
                   <img src="https://thehardwareguru.cz/heureka-logo-dark.png" alt="Heureka" className="h-logo-small" />
                   <div className="h-input-mock">
                      <span>Hledejte na Heurece...</span>
                      <div className="h-search-btn"><Search size={14} /></div>
                   </div>
                </div>
              </div>
            </div>

            {/* SEZNAM REKLAMA - SIDEBAR VELKÝ (ID 408655) */}
            <div className="sklik-sidebar-area">
              <span className="ad-label-sidebar">REKLAMA</span>
              <div id="sklikAd_408655" className="sklik-box-sidebar"></div>
            </div>

            {/* GURU EKOSYSTÉM (image_be2130.png) */}
            <div className="ecosystem-nav-widget shadow-purple">
              <h4 className="widget-title purple-text">GURU EKOSYSTÉM</h4>
              <nav className="eco-links">
                <Link href="/bottleneck-kalkulacka" className="eco-nav-item"><AlertCircle size={16} /> Bottleneck Calc</Link>
                <Link href="/fps-kalkulacka" className="eco-nav-item"><Zap size={16} /> FPS Kalkulačka</Link>
                <Link href="/cpuvs" className="eco-nav-item"><Cpu size={16} /> CPU Duel</Link>
                <Link href="/gpuvs" className="eco-nav-item"><HardDrive size={16} /> GPU Duel</Link>
                <Link href="/slovnik" className="eco-nav-item"><BookOpen size={16} /> Guru Slovník</Link>
              </nav>
            </div>

          </aside>
        </div>

        {/* GLOBÁLNÍ STYLY - OPRAVA POZADÍ A ROZLOŽENÍ */}
        <style dangerouslySetInnerHTML={{__html: `
          .guru-site-wrapper { 
            min-height: 100vh; 
            background-color: #050505; 
            background-image: url("/bg-guru.png"); 
            background-size: cover; 
            background-attachment: fixed;
            color: #fff; 
            padding: 80px 0;
          }
          .guru-container { max-width: 1680px; margin: 0 auto; padding: 0 30px; }
          .guru-main-grid { display: grid; grid-template-columns: 300px 1fr 340px; gap: 40px; align-items: start; }
          
          /* TYPOGRAFIE */
          .simulator-main-title { font-size: clamp(3rem, 8vw, 5rem); font-weight: 950; text-transform: uppercase; letter-spacing: -4px; margin-bottom: 40px; text-align: center; line-height: 1; }
          .simulator-main-title span { color: #a855f7; text-shadow: 0 0 40px rgba(168, 85, 247, 0.5); }
          
          /* VIP BUILD CARD */
          .vip-build-card { background: rgba(15, 17, 21, 0.9); border: 1px solid #eab308; border-radius: 16px; padding: 25px; }
          .vip-header { display: flex; gap: 12px; margin-bottom: 25px; }
          .gold-text { color: #eab308; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
          .vip-products { display: flex; flex-direction: column; gap: 12px; }
          .p-item { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
          .p-item span { color: #d1d5db; }
          .buy-btn { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid #66fcf1; font-size: 9px; font-weight: 900; padding: 5px 10px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
          .buy-btn:hover { background: #66fcf1; color: #000; }

          /* CARDS UNDER CALC */
          .guru-content-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 50px; }
          .card-glass { background: rgba(15, 17, 21, 0.75); border: 1px solid rgba(255,255,255,0.05); padding: 35px; border-radius: 20px; backdrop-filter: blur(10px); }
          .article-links { padding-left: 20px; display: flex; flex-direction: column; gap: 12px; color: #a855f7; font-weight: 700; font-size: 15px; }
          .guru-link-neon { color: #a855f7; text-decoration: none; font-weight: 900; font-size: 14px; display: flex; align-items: center; gap: 8px; margin-top: 20px; }

          /* HEUREKA WIDGET */
          .heureka-affiliate-section { background: #fff; border-radius: 20px; padding: 25px; color: #000; }
          .widget-title { font-size: 12px; font-weight: 900; letter-spacing: 1px; color: #444; margin-bottom: 20px; }
          .heureka-main-link { display: block; background: #f7e000; color: #000; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: 950; text-align: center; font-size: 14px; margin-bottom: 20px; box-shadow: 0 4px 0 #d9c700; }
          .heureka-search-box { margin-top: 25px; background: #1a1c1e; border-radius: 16px; padding: 20px; }
          .h-input-mock { background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-radius: 8px; font-size: 13px; color: #999; margin-top: 15px; }
          .h-search-btn { background: #00a8e8; color: #fff; padding: 6px; border-radius: 6px; }
          .h-logo-small { height: 20px; display: block; margin: 0 auto; }

          /* ECOSYSTEM NAV */
          .ecosystem-nav-widget { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 24px; border: 1px solid rgba(168, 85, 247, 0.2); }
          .eco-nav-item { display: flex; align-items: center; gap: 15px; padding: 14px 20px; color: #fff; text-decoration: none; background: rgba(255,255,255,0.03); border-radius: 14px; font-weight: 700; font-size: 15px; transition: 0.2s; margin-bottom: 8px; }
          .eco-nav-item:hover { background: rgba(168, 85, 247, 0.15); color: #a855f7; transform: translateX(8px); }
          .purple-text { color: #a855f7; }

          /* SKLIK REKLAMA */
          .ad-top-leaderboard { display: flex; justify-content: center; margin-bottom: 50px; }
          .sklik-placeholder-top { width: 728px; height: 90px; background: rgba(255,255,255,0.02); border: 1px dashed #333; }
          .sklik-box-sidebar { width: 300px; height: 600px; background: rgba(255,255,255,0.01); border: 1px dashed #333; margin: 0 auto; }
          .ad-label-sidebar { display: block; text-align: center; font-size: 10px; color: #444; margin-bottom: 10px; letter-spacing: 2px; }

          /* SHADOWS & UTILS */
          .shadow-gold { box-shadow: 0 10px 40px rgba(234, 179, 8, 0.15); }
          .shadow-neon { box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6); }
          .shadow-purple { box-shadow: 0 10px 40px rgba(168, 85, 247, 0.1); }
          .smarty-banner-area { margin-top: 30px; border-radius: 16px; overflow: hidden; }
          .banner-img { width: 100%; display: block; }

          @media (max-width: 1400px) {
            .guru-main-grid { grid-template-columns: 1fr; }
            .guru-sidebar-left, .guru-sidebar-right { display: none; }
            .guru-container { max-width: 1000px; }
          }
        `}} />
      </main>
    </div>
  );
}
