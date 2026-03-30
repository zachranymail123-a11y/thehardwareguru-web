import React from 'react';
import { 
  ShoppingCart, Zap, ShieldCheck, Flame, Heart, 
  Cpu, Monitor, Smartphone, ChevronRight, Award, 
  Layers, BookOpen, Swords, Home, Newspaper, Lightbulb
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import Link from 'next/link';

/**
 * GURU HARDWARE HUB V2.1 (COMMISSION HIDDEN)
 * 🚀 CÍL: Skryta procenta provizí, nahrazeno marketingovými labely.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props.isEn === true;
  const title = isEn ? 'Guru Hardware Hub | Best PC Components' : 'Guru Hardware Hub | Elitní výběr komponent';
  const desc = isEn 
    ? 'Verified hardware and accessories recommended by Guru. Get the best prices with exclusive deals.' 
    : 'Prověřený hardware a doplňky doporučené Guruem. Nakupuj tam, kde dostaneš nejvíc za svý prachy.';

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

  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";

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
            <Award size={18} /> GURU VERIFIED SHOPPING
          </div>
          <h1 className="main-title">
            GURU <span style={{ color: '#a855f7' }}>HARDWARE</span> HUB
          </h1>
          <p className="main-subtitle">
            {isEn 
              ? "Forget overpriced shops. Here are components and accessories that Guru actually recommends." 
              : "Zapomeň na předražené e-shopy. Tady jsou komponenty a doplňky, které Guru reálně doporučuje."}
          </p>
        </header>

        <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <div className="hub-grid">
          <section className="hub-card premium-border">
            <div className="card-header">
              <div className="vendor-logo">SHOPCOM</div>
              <div className="commission-badge">{isEn ? 'GURU EXCLUSIVE' : 'GURU EXKLUZIVNĚ'}</div>
            </div>
            <div className="card-body">
              <Cpu size={50} color="#a855f7" />
              <h2>{isEn ? 'Hardware & Builds' : 'Hardware & Buildy'}</h2>
              <p>{isEn ? 'Looking for a GPU or CPU? Shopcom has the best deals now.' : 'Hledáš grafiku, procesor nebo celou mašinu? Na Shopcomu teď Guru drží nejlepší dealy.'}</p>
              <ul className="hub-list">
                <li><Zap size={14} /> {isEn ? 'GPUs in stock' : 'Grafické karty skladem'}</li>
                <li><Zap size={14} /> {isEn ? 'Fair priced Gaming PCs' : 'Gaming PC za férový ceny'}</li>
                <li><Zap size={14} /> {isEn ? 'Verified pricing' : 'Guruem prověřené ceny'}</li>
              </ul>
            </div>
            <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn shopcom-bg">
              <ShoppingCart size={20} /> {isEn ? 'GO TO SHOPCOM' : 'DO OBCHODU SHOPCOM'}
            </a>
          </section>

          <section className="hub-card desk-border">
            <div className="card-header">
              <div className="vendor-logo">CUBENEST</div>
              <div className="commission-badge">{isEn ? 'VERIFIED DEAL' : 'OVĚŘENÝ DEAL'}</div>
            </div>
            <div className="card-body">
              <Smartphone size={50} color="#66fcf1" />
              <h2>{isEn ? 'Elite Desk Setup' : 'Elitní Desk Setup'}</h2>
              <p>{isEn ? 'Mess on the desk? Cubenest makes the sexiest MagSafe stands.' : 'Máš na stole bordel? Cubenest dělá ty nejvíc sexy stojánky a MagSafe nabíječky.'}</p>
              <ul className="hub-list">
                <li><Zap size={14} /> {isEn ? '3-in-1 chargers' : '3v1 bezdrátové nabíječky'}</li>
                <li><Zap size={14} /> {isEn ? 'Magnetic iPad stands' : 'Magnetické stojany pro iPad'}</li>
                <li><Zap size={14} /> {isEn ? 'Premium materials' : 'Prémiové materiály'}</li>
              </ul>
            </div>
            <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="hub-cta-btn cubenest-bg">
              <ShoppingCart size={20} /> {isEn ? 'EQUIP SETUP' : 'VYBAVIT DESK SETUP'}
            </a>
          </section>
        </div>

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
        .premium-border { border-top: 4px solid #a855f7; }
        .desk-border { border-top: 4px solid #66fcf1; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .vendor-logo { font-size: 24px; font-weight: 950; letter-spacing: -1px; }
        .commission-badge { background: #10b981; color: #000; padding: 4px 12px; border-radius: 8px; font-size: 10px; font-weight: 950; }
        .card-body h2 { font-size: 28px; font-weight: 950; margin: 20px 0 10px 0; text-transform: uppercase; }
        .card-body p { color: #9ca3af; line-height: 1.6; margin-bottom: 25px; }
        .hub-list { list-style: none; padding: 0; margin: 0 0 35px 0; display: flex; flex-direction: column; gap: 10px; }
        .hub-list li { display: flex; alignItems: center; gap: 10px; color: #d1d5db; font-size: 14px; fontWeight: 600; }
        .hub-cta-btn { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 20px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; }
        .shopcom-bg { background: #a855f7; color: #fff; }
        .cubenest-bg { background: #66fcf1; color: #000; }
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
