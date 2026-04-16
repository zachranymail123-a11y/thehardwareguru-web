import React from 'react';
import DramCalculator from '../../components/DramCalculator';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowRight, Cpu, HardDrive, BookOpen, AlertCircle, 
  ShoppingCart, Calculator, Zap, ShieldCheck, Activity,
  FileText, Lightbulb, TrendingUp, Search
} from 'lucide-react';

export const metadata = {
  title: 'DRAM Overclocking Simulátor | RAM Kalkulačka latence | Hardware Guru',
  description: 'Profesionální simulátor pro taktování DDR4 a DDR5. Výpočet stability, efektivního výkonu a časování podle typu čipu a IMC zátěže.',
  alternates: { canonical: 'https://thehardwareguru.cz/ram-kalkulacka' },
};

export default function RamCalcPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'scroll', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* HEUREKA TRIXAM SCRIPT (image_bd3bf2.png) */}
      <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />

      <main style={{ maxWidth: '1250px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        {/* TOP AD SLOT - SKLIK DESKTOP ANCHOR (ID 408873 z image_bd3fae.png) */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
          <div id="sklikAd_408873" style={{ width: '728px', height: '90px', background: 'rgba(255,255,255,0.02)', border: '1px dashed #333' }}></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1', letterSpacing: '-3px' }}>
            DRAM <span style={{ color: '#a855f7', textShadow: '0 0 40px rgba(168, 85, 247, 0.6)' }}>SIMULÁTOR</span>
          </h1>
        </header>

        <div className="guru-layout-grid">
          
          <section className="calc-main-section">
            <div className="sticky-wrapper">
              <DramCalculator isEn={false} />
            </div>

            {/* RADY, TIPY A ČLÁNKY (SEO & CONTENT HUB) */}
            <div className="guru-content-grid">
              <div className="content-card">
                <h3><Lightbulb size={24} color="#facc15" /> GURU RADY & TIPY</h3>
                <p>Nezapomeň, že u <strong>AMD Ryzen 7000/9000</strong> je FCLK klíčem k výkonu. Vždy se snaž o poměr 1:1 na 6000 MT/s. Pro Intel uživatele s čipy <strong>Hynix A-die</strong> doporučujeme tREFI 65535 pro maximální snížení latence v herní zátěži.</p>
                <Link href="/clanky" className="guru-text-link">Další rady a tipy <ArrowRight size={14}/></Link>
              </div>

              <div className="content-card">
                <h3><FileText size={24} color="#a855f7" /> SOUVISEJÍCÍ ČLÁNKY</h3>
                <ul className="guru-article-list">
                  <li><Link href="/clanky/nejlepsi-herni-ram">Nejlepší herní RAM pro rok 2026</Link></li>
                  <li><Link href="/clanky/jak-taktovat-ddr5">Průvodce taktováním DDR5 pro začátečníky</Link></li>
                  <li><Link href="/clanky/vliv-latence-na-fps">Jaký má reálný vliv latence na 1% Low FPS?</Link></li>
                </ul>
              </div>
            </div>
          </section>

          {/* SIDEBAR (image_bd3569.png & image_bd3bf2.png) */}
          <aside className="guru-sidebar">
            
            {/* HEUREKA BUTTONS - AFFILIATE (ID 276034) */}
            <div className="heureka-sidebar-box shadow-neon">
              <h4 className="sidebar-title">VÝHODNÝ NÁKUP</h4>
              <div className="heureka-link-wrap">
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
              <div className="heureka-buttons-grid">
                 <a href="https://ram.heureka.cz/f:21133:43715891/" target="_blank" rel="noopener noreferrer" className="h-btn">Hynix A-die</a>
                 <a href="https://ram.heureka.cz/f:21133:351421/" target="_blank" rel="noopener noreferrer" className="h-btn">Samsung B-die</a>
              </div>
            </div>

            {/* SEZNAM REKLAMA - SIDEBAR VELKÝ (ID 408655) */}
            <div className="ad-sidebar-wrap">
              <span className="ad-tag">REKLAMA</span>
              <div id="sklikAd_408655" className="sklik-box">
                {/* Sklik iframe placeholder */}
              </div>
            </div>

            {/* GURU EKOSYSTÉM (PŘESNĚ PODLE image_bd3569.png) */}
            <div className="ecosystem-card shadow-neon">
              <h4 className="eco-title">GURU EKOSYSTÉM</h4>
              <nav className="eco-nav">
                <Link href="/bottleneck-kalkulacka" className="eco-link"><AlertCircle size={18} /> <span>Bottleneck Calc</span></Link>
                <Link href="/fps-kalkulacka" className="eco-link"><Zap size={18} /> <span>FPS Kalkulačka</span></Link>
                <Link href="/cpuvs" className="eco-link"><Cpu size={18} /> <span>CPU Duel</span></Link>
                <Link href="/gpuvs" className="eco-link"><HardDrive size={18} /> <span>GPU Duel</span></Link>
                <Link href="/psu-kalkulacka" className="eco-link"><Calculator size={18} /> <span>PSU Kalkulačka</span></Link>
                <Link href="/slovnik" className="eco-link"><BookOpen size={18} /> <span>Guru Slovník</span></Link>
              </nav>
            </div>

          </aside>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .guru-layout-grid { display: grid; grid-template-columns: 1fr 340px; gap: 40px; }
          .sticky-wrapper { position: sticky; top: 100px; z-index: 10; }
          
          /* HEUREKA STYLING */
          .heureka-sidebar-box { background: #fff; padding: 25px; border-radius: 20px; color: #000; }
          .sidebar-title { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #666; margin-bottom: 15px; }
          .heureka-hn-link { display: block; background: #f7e000; color: #000; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 950; text-align: center; font-size: 14px; margin-bottom: 15px; transition: 0.2s; }
          .heureka-hn-link:hover { transform: scale(1.03); }
          .heureka-buttons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .h-btn { background: #000; color: #fff; text-decoration: none; padding: 10px; border-radius: 8px; font-size: 11px; font-weight: bold; text-align: center; }
          
          /* ECOSYSTEM PODLE SCREENU */
          .ecosystem-card { background: rgba(15, 17, 21, 0.9); padding: 25px; border-radius: 24px; border: 1px solid rgba(168, 85, 247, 0.2); }
          .eco-title { color: #a855f7; font-size: 12px; font-weight: 900; letter-spacing: 2px; margin-bottom: 20px; }
          .eco-nav { display: flex; flex-direction: column; gap: 8px; }
          .eco-link { display: flex; align-items: center; gap: 15px; padding: 12px 18px; border-radius: 15px; background: rgba(255,255,255,0.03); color: #fff; text-decoration: none; font-weight: 600; transition: 0.2s; }
          .eco-link:hover { background: rgba(168, 85, 247, 0.15); transform: translateX(5px); color: #a855f7; }

          /* SKLIK AD */
          .ad-sidebar-wrap { margin-bottom: 30px; }
          .ad-tag { font-size: 9px; color: #444; margin-bottom: 8px; display: block; letter-spacing: 2px; }
          .sklik-box { width: 300px; height: 600px; background: rgba(255,255,255,0.01); border: 1px dashed #333; margin: 0 auto; }

          /* CONTENT BOTTOM */
          .guru-content-grid { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
          .content-card { background: rgba(15, 17, 21, 0.6); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 20px; }
          .content-card h3 { display: flex; align-items: center; gap: 12px; font-size: 1.2rem; margin-bottom: 15px; }
          .guru-article-list { padding-left: 20px; display: grid; gap: 10px; color: #a855f7; font-weight: 600; font-size: 14px; }
          .guru-text-link { color: #a855f7; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; }
          
          .shadow-neon { box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
          @media (max-width: 900px) { .guru-layout-grid { grid-template-columns: 1fr; } .guru-content-grid { grid-template-columns: 1fr; } .sticky-wrapper { position: static; } }
        `}} />
      </main>
    </div>
  );
}
