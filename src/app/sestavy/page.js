import React from 'react';
import { 
  ShoppingCart, Zap, ShieldCheck, Flame, Heart, 
  Cpu, Monitor, Smartphone, ChevronRight, Award, 
  Layers, BookOpen, Swords, Home, Newspaper, Lightbulb,
  Apple, RefreshCw, Truck, Gamepad2, Search
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import Link from 'next/link';

/**
 * GURU HARDWARE HUB V3.2 (AFFILIATE FIX)
 * 🚀 CÍL: Agresivní affiliate konverze s přesnými a_bid parametry.
 * 💰 EHUB ID: 71c85dea
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props.isEn === true;
  const title = isEn ? 'Guru Hardware Hub | Best Tech Deals' : 'Guru Hardware Hub | Kde nakupuje Guru?';
  const desc = isEn 
    ? 'Expertly curated hardware, iPhones, and accessories. Verified links for the best market prices.' 
    : 'Prověřené PC komponenty, Apple produkty a herní doplňky. Guru výběr s nejlepšími cenami na trhu.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/sestavy`,
      languages: { 'en': `${baseUrl}/en/sestavy`, 'cs': `${baseUrl}/sestavy` }
    }
  };
}

export default function HardwareHubPage(props) {
  const isEn = props.isEn === true;

  // 🔥 OSTRÉ EHUB TRACKING LINKY
  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const ALZA_SK_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=4d8d02fb";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";
  const IPHONE_MARKET_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=2bcd6f9d";
  const JABKOLEVNE_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=85731c2c";
  
  // 🔥 OPRAVENÉ LINKY PODLE SCREENSHOTŮ
  const SMARTY_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06";
  const XM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=0ff74973";

  // 🔥 HEUREKA DEEP LINKS
  const hUtm = "utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const HEUREKA_CPU = `https://www.heureka.cz/?h%5Bfraze%5D=procesor#${hUtm}`;
  const HEUREKA_GPU = `https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#${hUtm}`;

  return (
    <div className="guru-hub-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <nav className="nav-sestavy">
        <Link href={isEn ? "/en" : "/"} className="nav-item"><Home size={16} /> {isEn ? "HOME" : "DOMŮ"}</Link>
        <Link href={isEn ? "/en/clanky" : "/clanky"} className="nav-item"><Newspaper size={16} /> {isEn ? "ARTICLES" : "ČLÁNKY"}</Link>
        <Link href={isEn ? "/en/tipy" : "/tipy"} className="nav-item"><Lightbulb size={16} /> {isEn ? "TIPS" : "TIPY"}</Link>
        <Link href={isEn ? "/en/sestavy" : "/sestavy"} className="nav-item active"><Monitor size={16} /> {isEn ? "HUB" : "GURU HUB"}</Link>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="money-badge">
            <Award size={18} /> GURU VERIFIED PARTNERS
          </div>
          <h1 className="main-title">
            GURU <span style={{ color: '#a855f7' }}>HARDWARE</span> HUB
          </h1>
          <p className="main-subtitle">
            {isEn 
              ? "No hallucinations. Only verified partners where Guru actually shops for components and gear." 
              : "Žádné nesmysly. Pouze prověření partneři, u kterých Guru reálně nakupuje komponenty a vybavení."}
          </p>
        </header>

        {/* TOP AD SLOT */}
        <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <div className="hub-grid">
          
          {/* 🔥 HEUREKA.CZ - DUAL CTA CARD */}
          <section className="hub-card heureka-border">
            <div className="card-header">
              <div className="vendor-logo">HEUREKA.CZ</div>
              <div className="commission-badge" style={{background: '#eab308', color: '#000'}}>NEJNIŽŠÍ CENY</div>
            </div>
            <div className="card-body">
              <Search size={50} color="#eab308" />
              <h2>{isEn ? "Compare Hardware Prices" : "Cenový srovnávač"}</h2>
              <p>{isEn ? "Don't overpay. Compare the market and find the absolute lowest prices for CPUs and GPUs." : "Neplať víc, než musíš. Srovnej si nabídky e-shopů a nakup procesory nebo grafiky za tu absolutně nejnižší cenu."}</p>
              <ul className="hub-list">
                <li><Zap size={14} /> {isEn ? "Independent comparison" : "Nezávislé srovnání cen"}</li>
                <li><Zap size={14} /> {isEn ? "Thousands of stores" : "Tisíce ověřených e-shopů"}</li>
                <li><Zap size={14} /> {isEn ? "Real user reviews" : "Reálné recenze uživatelů"}</li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href={HEUREKA_CPU} target="_blank" rel="nofollow sponsored" className="hub-cta-btn heureka-bg" data-trixam-positionid="276027">
                  <Cpu size={20} /> {isEn ? "COMPARE CPUS" : "SROVNAT PROCESORY"}
                </a>
                <a href={HEUREKA_GPU} target="_blank" rel="nofollow sponsored" className="hub-cta-btn heureka-bg" data-trixam-positionid="276027">
                  <Monitor size={20} /> {isEn ? "COMPARE GPUS" : "SROVNAT GRAFIKY"}
                </a>
            </div>
          </section>

          {/* SHOPCOM.CZ - Hardware Guru Main Choice */}
          <section className="hub-card premium-border">
            <div className="card-header">
              <div className="vendor-logo">SHOPCOM.CZ</div>
              <div className="commission-badge">GURU VOLBA</div>
            </div>
            <div className="card-body">
              <Cpu size={50} color="#a855f7" />
              <h2>Komponenty & PC Buildy</h2>
              <p>Specialista na grafické karty a procesory za bezkonkurenční ceny. Tady Guru staví ty nejvýkonnější herní mašiny.</p>
              <ul className="hub-list">
                <li><Zap size={14} /> Grafiky a CPU skladem</li>
                <li><Zap size={14} /> Individuální herní sestavy</li>
                <li><Zap size={14} /> Odborná podpora při výběru</li>
              </ul>
            </div>
            <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn shopcom-bg">
              <ShoppingCart size={20} /> DO OBCHODU SHOPCOM
            </a>
          </section>

          {/* SMARTY.CZ - Gaming & Tech */}
          <section className="hub-card smarty-border">
            <div className="card-header">
              <div className="vendor-logo">SMARTY.CZ</div>
              <div className="commission-badge" style={{background: '#ec4899', color: '#fff'}}>GAMING GEAR</div>
            </div>
            <div className="card-body">
              <Gamepad2 size={50} color="#ec4899" />
              <h2>{isEn ? "Gaming & Electronics" : "Gaming & Elektronika"}</h2>
              <p>{isEn ? "Top destination for gaming gear, consoles, and smart tech to level up your setup." : "Specialista na herní železo, konzole a chytrou elektroniku. Ideální pro rozšíření tvého herního doupěte."}</p>
              <ul className="hub-list">
                <li><Zap size={14} /> {isEn ? "Premium gaming peripherals" : "Prémiové herní periferie"}</li>
                <li><Zap size={14} /> {isEn ? "Consoles and games" : "Konzole a nejnovější hry"}</li>
                <li><Zap size={14} /> {isEn ? "Fast delivery" : "Expresní doručení na pobočky"}</li>
              </ul>
            </div>
            <a href={SMARTY_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn smarty-bg">
              <ShoppingCart size={20} /> {isEn ? "SHOP AT SMARTY" : "NAKUPOVAT NA SMARTY"}
            </a>
          </section>

          {/* ALZA.SK - Slovak Market Leader */}
          <section className="hub-card desk-border">
            <div className="card-header">
              <div className="vendor-logo">ALZA.SK</div>
              <div className="commission-badge">SK GIGANT</div>
            </div>
            <div className="card-body">
              <RefreshCw size={50} color="#66fcf1" />
              <h2>Elektronika pro Slovensko</h2>
              <p>Lídr trhu s nejširší nabídkou hardwaru. Pokud jsi ze Slovenska a chceš mít komponenty doma hned druhý den, vol Alzu.</p>
              <ul className="hub-list">
                <li><Truck size={14} /> Nejrychlejší doprava (AlzaBoxy)</li>
                <li><Zap size={14} /> Obrovský výběr herních periferií</li>
                <li><Zap size={14} /> Bezproblémové reklamace</li>
              </ul>
            </div>
            <a href={ALZA_SK_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn alza-bg">
              <ShoppingCart size={20} /> NAKUPOVAT NA ALZA.SK
            </a>
          </section>

          {/* XM.CZ - Smart Home */}
          <section className="hub-card xm-border">
            <div className="card-header">
              <div className="vendor-logo">XM.CZ</div>
              <div className="commission-badge" style={{background: '#f97316', color: '#fff'}}>CHYTRÝ DOMOV</div>
            </div>
            <div className="card-body">
              <Smartphone size={50} color="#f97316" />
              <h2>{isEn ? "Smart Home & Phones" : "Chytrá elektronika"}</h2>
              <p>{isEn ? "From Xiaomi phones to robotic vacuums. Everything you need for a fully automated smart home." : "Od Xiaomi telefonů po robotické vysavače. Špičkový e-shop pro kompletní vybavení tvé chytré domácnosti."}</p>
              <ul className="hub-list">
                <li><Zap size={14} /> {isEn ? "Smart home ecosystems" : "Chytré domácí ekosystémy"}</li>
                <li><Zap size={14} /> {isEn ? "Phones and wearables" : "Telefony a nositelná elektronika"}</li>
                <li><Zap size={14} /> {isEn ? "Great price/performance" : "Skvělý poměr cena/výkon"}</li>
              </ul>
            </div>
            <a href={XM_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn xm-bg">
              <ShoppingCart size={20} /> {isEn ? "SHOP AT XM.CZ" : "VYBAVIT CHYTRÝ DOMOV"}
            </a>
          </section>

          {/* CUBENEST - Premium Accessories */}
          <section className="hub-card desk-border">
            <div className="card-header">
              <div className="vendor-logo">CUBENEST</div>
              <div className="commission-badge">DESK SETUP</div>
            </div>
            <div className="card-body">
              <Smartphone size={50} color="#66fcf1" />
              <h2>Elite Apple doplňky</h2>
              <p>Prémiové MagSafe nabíječky, hliníkové stojany a doplňky, které dělají z obyčejného stolu Guru herní doupě.</p>
              <ul className="hub-list">
                <li><Zap size={14} /> 3v1 bezdrátové stanice</li>
                <li><Zap size={14} /> Designové iPad stojany</li>
                <li><Zap size={14} /> Kvalitní hliníkové zpracování</li>
              </ul>
            </div>
            <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn cubenest-bg">
              <ShoppingCart size={20} /> VYBAVIT DESK SETUP
            </a>
          </section>

          {/* IPHONEMARKET.CZ - Used iPhones with warranty */}
          <section className="hub-card premium-border">
            <div className="card-header">
              <div className="vendor-logo">IPHONEMARKET</div>
              <div className="commission-badge">IPHONY SE ZÁRUKOU</div>
            </div>
            <div className="card-body">
              <Apple size={50} color="#a855f7" />
              <h2>Prověřené použité iPhony</h2>
              <p>Nejlepší cesta k iPhonu za zlomek ceny. Každý kus je profesionálně otestován a prodáván se zárukou.</p>
              <ul className="hub-list">
                <li><Zap size={14} /> 100% funkčnost zaručena</li>
                <li><Zap size={14} /> Záruka na každý kus</li>
                <li><Zap size={14} /> Ekologická a levná volba</li>
              </ul>
            </div>
            <a href={IPHONE_MARKET_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn shopcom-bg">
              <ShoppingCart size={20} /> VYBRAT IPHONE
            </a>
          </section>

          {/* JABKOLEVNE.CZ - Affordable Apple Ecosystem */}
          <section className="hub-card desk-border">
            <div className="card-header">
              <div className="vendor-logo">JABKOLEVNE.CZ</div>
              <div className="commission-badge">APPLE EKOSYSTÉM</div>
            </div>
            <div className="card-body">
              <RefreshCw size={50} color="#66fcf1" />
              <h2>MacBooky & iPady levně</h2>
              <p>Široká nabídka použitých Maců, iPadů a Apple Watch. Ideální místo, pokud chceš doplnit svůj Apple ekosystém a ušetřit.</p>
              <ul className="hub-list">
                <li><Zap size={14} /> MacBooky pro práci i střih</li>
                <li><Zap size={14} /> iPady pro studenty i hráče</li>
                <li><Zap size={14} /> Férové posouzení stavu</li>
              </ul>
            </div>
            <a href={JABKOLEVNE_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn jabko-bg">
              <ShoppingCart size={20} /> KOUPIT LEVNÝ APPLE
            </a>
          </section>

        </div>

        {/* SEO HUB */}
        <section className="seo-hub">
          <h2 className="hub-title">{isEn ? 'GURU KNOWLEDGE BASE' : 'GURU KNIHOVNA ZNALOSTÍ'}</h2>
          <div className="hub-silo-grid">
            <Link href={isEn ? "/en/cpuvs/ranking" : "/cpuvs/ranking"} className="hub-item">
              <Cpu size={24} color="#66fcf1" />
              <span>{isEn ? 'CPU Rank' : 'Žebříček CPU'}</span>
            </Link>
            <Link href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="hub-item">
              <Monitor size={24} color="#ff0055" />
              <span>{isEn ? 'GPU Rank' : 'Žebříček GPU'}</span>
            </Link>
            <Link href={isEn ? "/en/rady" : "/rady"} className="hub-item">
              <BookOpen size={24} color="#a855f7" />
              <span>{isEn ? 'Guides' : 'Praktické rady'}</span>
            </Link>
            <Link href={isEn ? "/en/slovnik" : "/slovnik"} className="hub-item">
              <Layers size={24} color="#eab308" />
              <span>{isEn ? 'Wiki' : 'HW Slovník'}</span>
            </Link>
          </div>
        </section>

      </main>

      {/* STICKY BOTTOM ANCHOR */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper-fixed">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper-fixed">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .nav-sestavy { display: flex; justify-content: center; gap: 25px; padding: 20px; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(168, 85, 247, 0.2); position: fixed; top: 0; left:0; width: 100%; z-index: 100; }
        .nav-item { color: #9ca3af; text-decoration: none; font-size: 13px; font-weight: 900; display: flex; align-items: center; gap: 8px; transition: 0.2s; text-transform: uppercase; }
        .nav-item:hover, .nav-item.active { color: #a855f7; }
        .main-title { font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 950; text-transform: uppercase; letter-spacing: -2px; margin: 0; line-height: 1; text-align: center; }
        .main-subtitle { margin-top: 20px; color: #9ca3af; font-size: 20px; max-width: 800px; margin-inline: auto; text-align: center; }
        .money-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.4); padding: 8px 20px; border-radius: 50px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; }
        
        .hub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 40px; margin-top: 60px; }
        .hub-card { background: rgba(15, 17, 21, 0.95); border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); padding: 40px; display: flex; flex-direction: column; transition: 0.3s; position: relative; overflow: hidden; backdrop-filter: blur(20px); }
        .hub-card:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.8); }
        
        /* CARD BORDERS */
        .premium-border { border-top: 4px solid #a855f7; }
        .desk-border { border-top: 4px solid #66fcf1; }
        .heureka-border { border-top: 4px solid #eab308; }
        .smarty-border { border-top: 4px solid #ec4899; }
        .xm-border { border-top: 4px solid #f97316; }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .vendor-logo { font-size: 24px; font-weight: 950; letter-spacing: -1px; }
        .commission-badge { background: #10b981; color: #000; padding: 4px 12px; border-radius: 8px; font-size: 10px; font-weight: 950; }

        .card-body h2 { font-size: 28px; font-weight: 950; margin: 20px 0 10px 0; text-transform: uppercase; }
        .card-body p { color: #9ca3af; line-height: 1.6; margin-bottom: 25px; }

        .hub-list { list-style: none; padding: 0; margin: 0 0 35px 0; display: flex; flex-direction: column; gap: 10px; }
        .hub-list li { display: flex; alignItems: center; gap: 10px; color: #d1d5db; font-size: 14px; fontWeight: 600; }

        /* BUTTONS */
        .hub-cta-btn { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 20px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; }
        .hub-cta-btn:hover { filter: brightness(1.1); transform: scale(1.02); }
        .shopcom-bg { background: #a855f7; color: #fff; }
        .cubenest-bg { background: #66fcf1; color: #000; }
        .alza-bg { background: #22c55e; color: #fff; }
        .jabko-bg { background: #fff; color: #000; }
        .heureka-bg { background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); color: #000; }
        .smarty-bg { background: #ec4899; color: #fff; }
        .xm-bg { background: #f97316; color: #fff; }

        .seo-hub { margin-top: 80px; padding: 40px; background: rgba(0,0,0,0.4); border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); }
        .hub-title { font-size: 16px; font-weight: 950; text-align: center; margin-bottom: 30px; color: #4b5563; text-transform: uppercase; }
        .hub-silo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; }
        .hub-item { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; transition: 0.3s; border: 1px solid transparent; }
        .hub-item span { font-size: 12px; font-weight: 900; color: #9ca3af; text-transform: uppercase; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        .ad-desktop-wrapper { display: flex; justify-content: center; }
        .ad-mobile-wrapper { display: none; }
        @media (max-width: 768px) {
            .nav-sestavy { justify-content: flex-start !important; overflow-x: auto; padding: 15px !important; }
            .ad-desktop-wrapper, .ad-desktop-wrapper-fixed { display: none !important; }
            .ad-mobile-wrapper, .ad-mobile-wrapper-fixed { display: flex !important; justify-content: center; }
            .hub-grid { grid-template-columns: 1fr !important; }
            .hub-silo-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}} />
    </div>
  );
}
