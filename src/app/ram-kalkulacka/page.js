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
    <div className="guru-page-wrapper">
      
      {/* HEUREKA TRIXAM SCRIPT */}
      <Script 
        src="//serve.affiliate.heureka.cz/js/trixam.min.js" 
        strategy="afterInteractive"
      />

      {/* SKLIK REKLAMNÍ SKRIPTY */}
      <Script strategy="afterInteractive" id="sklik-init">
        {`
          window.fort_aw_p = window.fort_aw_p || {};
          window.fort_aw_p["sklikAd_408873"] = { id: 408873, format: "728x90" };
          window.fort_aw_p["sklikAd_408655"] = { id: 408655, format: "300x600" };
        `}
      </Script>

      <main className="guru-main-container">
        
        {/* TOP ANCHOR AD */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div id="sklikAd_408873"></div>
        </div>

        <div className="guru-grid-layout">
          
          {/* LEVÝ SLOUPEC: V.I.P. SESTAVA & SMARTY */}
          <aside className="guru-left-sidebar">
            <div className="vip-sestava-card shadow-neon">
              <div className="vip-header">
                <ShoppingCart size={18} style={{ color: '#eab308' }} />
                <div>
                  <small style={{ color: '#eab308', fontWeight: '900', fontSize: '10px' }}>ULTIMÁTNÍ HERNÍ DĚLO</small>
                  <h3 style={{ fontSize: '14px', fontWeight: '900' }}>V.I.P. GURU SESTAVA</h3>
                </div>
              </div>
              <div className="vip-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="vip-item"><span>AMD Ryzen 7 9800X3D</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>GIGABYTE X870E AORUS ELITE</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>Kingston 32GB 6000MT/s</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>ZOTAC RTX 5070 Twin Edge</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>MSI SPATIUM M461 2TB</span> <button>KOUPIT</button></div>
                <div className="vip-item"><span>Case dle výběru</span> <button>KOUPIT</button></div>
              </div>
            </div>

            <div className="smarty-ad-wrap" style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden' }}>
              <a href="https://smarty.cz" target="_blank" rel="nofollow">
                <img src="https://thehardwareguru.cz/smarty-banner.png" alt="Smarty.cz" style={{ width: '100%', display: 'block' }} />
              </a>
            </div>
          </aside>

          {/* STŘEDOVÝ SLOUPEC: DRAM SIMULÁTOR */}
          <section className="guru-center-content">
            <div className="simulator-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 className="simulator-title" style={{ fontSize: '60px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '-3px' }}>
                DRAM <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}>SIMULÁTOR</span>
              </h1>
            </div>
            
            <DramCalculator isEn={false} />

            <div className="bottom-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
              <div className="guru-card-dark">
                <h3 style={{ fontSize: '16px', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lightbulb size={18} color="#facc15" /> GURU RADY & TIPY
                </h3>
                <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>
                  Nezapomeň, že u <strong>AMD Ryzen 7000/9000</strong> je FCLK klíčem k výkonu. Vždy se snaž o poměr 1:1 na 6000 MT/s. Pro Intel uživatele s čipy <strong>Hynix A-die</strong> doporučujeme tREFI 65535 pro maximální snížení latence v herní zátěži.
                </p>
                <Link href="/clanky" className="guru-link">Další rady <ArrowRight size={14}/></Link>
              </div>

              <div className="guru-card-dark">
                <h3 style={{ fontSize: '16px', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="#a855f7" /> SOUVISEJÍCÍ ČLÁNKY
                </h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#a855f7', fontWeight: '600', fontSize: '14px' }}>
                  <li><Link href="#">Nejlepší herní RAM pro rok 2026</Link></li>
                  <li><Link href="#">Průvodce taktováním DDR5</Link></li>
                  <li><Link href="#">Jaký má reálný vliv latence na 1% Low FPS?</Link></li>
                </ul>
              </div>
            </div>
          </section>

          {/* PRAVÝ SLOUPEC: HEUREKA, REKLAMA & EKOSYSTÉM */}
          <aside className="guru-right-sidebar">
            <div className="heureka-widget shadow-neon" style={{ background: '#fff', borderRadius: '12px', padding: '20px', color: '#000' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#666', marginBottom: '15px' }}>VÝHODNÝ NÁKUP</h4>
              <div className="heureka-trixam-wrap">
                <a 
                  href="https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link" 
                  className="heureka-hn-link" 
                  data-trixam-positionid="276034" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', background: '#f7e000', padding: '12px', borderRadius: '8px', textDecoration: 'none', color: '#000', fontWeight: '900', textAlign: 'center', fontSize: '13px', marginBottom: '10px' }}
                >
                  👉 💰 RAM paměti za nejnižší ceny
                </a>
              </div>
              
              <HeurekaButtons />
            </div>

            <div className="sklik-sidebar-ad" style={{ margin: '20px 0' }}>
              <span style={{ fontSize: '9px', color: '#444', marginBottom: '5px', display: 'block', textAlign: 'center' }}>REKLAMA</span>
              <div id="sklikAd_408655" style={{ minHeight: '600px', background: 'rgba(255,255,255,0.01)', border: '1px dashed #333' }}></div>
            </div>

            <div className="ecosystem-widget shadow-neon" style={{ background: 'rgba(15, 17, 21, 0.9)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <h4 style={{ color: '#a855f7', fontSize: '12px', fontWeight: '950', marginBottom: '15px' }}>GURU EKOSYSTÉM</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Link href="/bottleneck-kalkulacka" className="eco-item"><AlertCircle size={16} /> <span>Bottleneck Calc</span></Link>
                <Link href="/fps-kalkulacka" className="eco-item"><Zap size={16} /> <span>FPS Kalkulačka</span></Link>
                <Link href="/cpuvs" className="eco-item"><Cpu size={16} /> <span>CPU Duel</span></Link>
                <Link href="/gpuvs" className="eco-item"><HardDrive size={16} /> <span>GPU Duel</span></Link>
                <Link href="/psu-kalkulacka" className="eco-item"><Calculator size={16} /> <span>PSU Kalkulačka</span></Link>
                <Link href="/slovnik" className="eco-item"><BookOpen size={16} /> <span>Guru Slovník</span></Link>
              </nav>
            </div>
          </aside>

        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .guru-page-wrapper { min-height: 100vh; background-color: #0a0b0d; color: #fff; padding-top: 100px; padding-bottom: 100px; }
          .guru-main-container { max-width: 1600px; margin: 0 auto; padding: 0 20px; }
          .guru-grid-layout { display: grid; grid-template-columns: 280px 1fr 320px; gap: 30px; }
          .vip-item span { color: #9ca3af; }
          .vip-item button { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid #66fcf1; font-size: 9px; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
          .guru-card-dark { background: rgba(15, 17, 21, 0.7); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 16px; }
          .guru-link { color: #a855f7; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; font-weight: 700; }
          .eco-item { display: flex; align-items: center; gap: 12px; padding: 10px 15px; color: #fff; text-decoration: none; background: rgba(255,255,255,0.03); border-radius: 10px; font-size: 14px; font-weight: 600; }
          .eco-item:hover { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
          .shadow-neon { box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
          @media (max-width: 1200px) {
            .guru-grid-layout { grid-template-columns: 1fr; }
            .guru-left-sidebar, .guru-right-sidebar { display: none; }
          }
        `}} />
      </main>
    </div>
  );
}
