import React from 'react';
import DramCalculator from '../../components/DramCalculator';
import Link from 'next/link';
import { ArrowRight, Cpu, HardDrive, BookOpen, AlertCircle, ShoppingCart, Calculator } from 'lucide-react';

export const metadata = {
  title: 'GURU RAM Overclocking Kalkulačka | Simulátor latence',
  description: 'Profesionální simulátor pro DDR4 a DDR5. Výpočet stability, efektivního výkonu a časování podle typu čipu a IMC zátěže.',
};

export default function RamCalcPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        {/* HEADER SEKCE */}
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1', letterSpacing: '-2px' }}>
            DRAM <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>SIMULÁTOR</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.2rem', marginTop: '15px', fontWeight: '500' }}>
            Profesionální OC modelování stability a propustnosti pamětí.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', alignItems: 'start' }}>
          
          {/* LEVÝ SLOUPEC: KALKULAČKA A OBSAH */}
          <section>
            <DramCalculator isEn={false} />

            {/* PROLINKOVÁNÍ NA DALŠÍ NÁSTROJE */}
            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Link href="/bottleneck-kalkulacka" className="guru-tool-link">
                <AlertCircle size={20} color="#a855f7" />
                <div>
                  <strong>Bottleneck Kalkulačka</strong>
                  <span>Brzdí tvá RAM procesor? Zjisti to zde.</span>
                </div>
              </Link>
              <Link href="/fps-kalkulacka" className="guru-tool-link">
                <Zap size={20} color="#66fcf1" />
                <div>
                  <strong>FPS Kalkulačka</strong>
                  <span>Kolik FPS přidá lepší časování RAM?</span>
                </div>
              </Link>
            </div>

            {/* TIPY A RADY PRO OC */}
            <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '20px' }}><BookOpen color="#a855f7" /> GURU RADY PRO LADĚNÍ</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '15px' }}>
                <li className="guru-list-item">🚀 <strong>tREFI:</strong> Čím vyšší, tím nižší latence, ale pozor na teploty čipů!</li>
                <li className="guru-list-item">⚡ <strong>Napětí:</strong> DDR5 Hynix A-die miluje napětí, ale Micron Rev.A má limit mnohem dříve.</li>
                <li className="guru-list-item">📉 <strong>Latence vs Propustnost:</strong> Někdy je stabilních 6000 CL30 lepší než nestabilních 7200 CL36.</li>
              </ul>
              <Link href="/clanky" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>
                Číst kompletní návod na taktování RAM <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* PRAVÝ SLOUPEC: ADS, HEUREKA, SIDEBAR */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* REKLAMNÍ SLOOT */}
            <div className="guru-ad-box">
              <span style={{ fontSize: '10px', color: '#444' }}>SPONSORED CONTENT</span>
              <div style={{ width: '100%', height: '250px', background: '#111', borderRadius: '12px', border: '1px dashed #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Místo pro tvou reklamu
              </div>
            </div>

            {/* HEUREKA BUTTONS - NEJLEPŠÍ RAM KITY */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', color: '#000' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '900' }}>🛒 DOPORUČENÉ RAM (HEUREKA)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="https://heureka.cz" target="_blank" className="heureka-btn">
                  Hynix A-die Kit (Best OC) <ShoppingCart size={14} />
                </a>
                <a href="https://heureka.cz" target="_blank" className="heureka-btn">
                  Samsung B-die DDR4 <ShoppingCart size={14} />
                </a>
              </div>
            </div>

            {/* DUELY PROLINKY */}
            <div className="guru-sidebar-links">
               <h4 style={{ color: '#a855f7', fontSize: '12px', letterSpacing: '1px' }}>POROVNAT KOMPONENTY</h4>
               <Link href="/cpuvs" className="sidebar-link"><Cpu size={14} /> CPU Duel</Link>
               <Link href="/gpuvs" className="sidebar-link"><HardDrive size={14} /> GPU Duel</Link>
               <Link href="/psu-kalkulacka" className="sidebar-link"><Calculator size={14} /> PSU Kalkulačka</Link>
               <Link href="/slovnik" className="sidebar-link"><BookOpen size={14} /> Guru Slovník</Link>
            </div>

          </aside>
        </div>

        {/* CSS STYLY PRO PROLINKY */}
        <style dangerouslySetInnerHTML={{__html: `
          .guru-tool-link {
            background: rgba(15, 17, 21, 0.9);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            gap: 15px;
            text-decoration: none;
            color: #fff;
            transition: 0.3s;
          }
          .guru-tool-link:hover {
            border-color: #a855f7;
            background: rgba(168, 85, 247, 0.05);
            transform: translateY(-3px);
          }
          .guru-tool-link strong { display: block; font-size: 16px; }
          .guru-tool-link span { font-size: 12px; color: #6b7280; }
          
          .heureka-btn {
            background: #f7e000;
            color: #000;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            text-decoration: none;
            font-weight: 900;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .guru-sidebar-links {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .sidebar-link {
            color: #9ca3af;
            text-decoration: none;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border-radius: 8px;
            background: rgba(255,255,255,0.02);
          }
          .sidebar-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
          .guru-list-item { padding-left: 20px; position: relative; color: #d1d5db; font-size: 14px; }
          .guru-list-item::before { content: '•'; color: #a855f7; position: absolute; left: 0; font-weight: bold; }
        `}} />
      </main>
    </div>
  );
}
