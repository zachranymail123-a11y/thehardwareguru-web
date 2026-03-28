import Link from 'next/link';
import React from 'react';

/**
 * GURU PERSONAL RIG V2.0 (MOBILE OPTIMIZED & MULTILINGUAL)
 * 🚀 CÍL: Prezentace HW bez kompromisů s maximální monetizací a skvělým UX na mobilu.
 */

export async function generateMetadata(props) {
  const isEn = props?.searchParams?.lang === 'en';
  return {
    title: isEn ? 'Gurus Hardware Rig | My Personal PC Build' : 'Na čem jede Guru? | Můj osobní PC Build',
    description: isEn 
      ? 'Ever wondered what I use for editing, streaming, and gaming? Here is my personal dual-GPU setup.' 
      : 'Zajímá tě, na čem stříhám, streamuju a hraju? Tady je můj osobní dual-GPU stroj bez kompromisů.',
  };
}

export default function MojePcPage(props) {
  const isEn = props?.searchParams?.lang === 'en';

  const hwData = [
    {
      icon: '🖥️',
      title: isEn ? 'Processor & Motherboard' : 'Procesor & Základní deska',
      specs: 'AMD Ryzen 7 9800X3D + Gigabyte X870E Aorus Elite',
      desc: isEn 
        ? '9800X3D is the absolute king of gaming. X870E Aorus Elite provides the perfect base for stability and Gen5 future-proofing.' 
        : '9800X3D je absolutní král gamingu. V X870E Aorus Elite má ideální základnu pro stabilitu i Gen5 budoucnost.'
    },
    {
      icon: '🎮',
      title: 'Dual GPU Setup',
      specs: 'MSI RTX 5070 Ti 16GB (Gaming) + MSI RTX 5060 (Stream)',
      desc: isEn 
        ? '5070 Ti handles the ultra details, while 5060 encodes the stream for Kick. Zero FPS drops, maximum smoothness.' 
        : '5070 Ti tahá detaily, 5060 kóduje stream na Kicku. Nulové FPS dropy, maximální plynulost pro diváka i hráče.'
    },
    {
      icon: '⚡',
      title: isEn ? 'Memory & Storage' : 'Paměti & Úložiště',
      specs: 'G.Skill Trident Z5 RGB 6000 CL28 + 3x Kingston KC3000 2TB',
      desc: isEn 
        ? '6000MHz CL28 is lightning fast on AM5. 6TB Gen4 storage means no more worries about 4K footage space.' 
        : '6000MHz CL28 je na AM5 raketová rychlost. 6TB Gen4 úložiště znamená, že neřeším místo ani u 4K záznamů.'
    },
    {
      icon: '❄️',
      title: isEn ? 'Cooling' : 'Chlazení',
      specs: 'Arctic Liquid Freezer III 360 ARGB (Push-Pull)',
      desc: isEn 
        ? 'Push-Pull configuration with Montech fans keeps the CPU ice cold even during heavy video rendering.' 
        : 'Push-Pull konfigurace Montech větráků drží procesor v ledovém klidu i při renderu videa.'
    },
    {
      icon: '🌪️',
      title: isEn ? 'Case & Airflow' : 'Skříň & Airflow',
      specs: 'NZXT H7 Flow + be quiet! Light Wings 140mm',
      desc: isEn 
        ? 'Created a wind tunnel. The hardware feels great even during all-day streaming sessions.' 
        : 'Vytvořil jsem větrný tunel. Hardware se tu cítí skvěle i při celodenním streamování.'
    },
    {
      icon: '🔋',
      title: isEn ? 'Power Supply' : 'Zdroj',
      specs: 'Seasonic Focus GX-1000',
      desc: isEn 
        ? 'The foundation. Pure energy for two GPUs and a powerful CPU without compromises.' 
        : 'Naprostý základ. Čistá energie pro dvě GPU a výkonný procesor bez kompromisů.'
    }
  ];

  return (
    <div className="guru-pc-page" style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; font-size: 0.9rem; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .nav-special { color: #66fcf1 !important; border: 1px solid #66fcf1; padding: 8px 16px; border-radius: 6px; }
        
        .hw-box { 
          background: rgba(31, 40, 51, 0.7); 
          border: 1px solid rgba(69, 162, 158, 0.3); 
          padding: 30px; 
          border-radius: 16px; 
          margin-bottom: 25px;
          transition: all 0.3s;
        }
        .hw-box:hover { 
          border-color: #66fcf1; 
          background: rgba(31, 40, 51, 0.9); 
          transform: translateY(-5px); 
          box-shadow: 0 10px 30px rgba(102, 252, 241, 0.2);
        }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; margin-bottom: 30px; }
        .ad-mobile-wrapper { display: none; width: 100%; margin-bottom: 30px; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; text-align: center; }

        .social-btn { display: inline-flex; align-items: center; justify-content: center; padding: 15px 30px; border-radius: 12px; font-weight: 950; text-decoration: none; transition: 0.3s; text-transform: uppercase; border: none; }

        @media (max-width: 768px) {
            .guru-pc-page { padding-top: 80px !important; }
            .nav-bar { padding: 15px !important; flex-direction: column; gap: 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; flex-direction: column; align-items: center; }
            .main-h1 { font-size: 2rem !important; }
            .desc-p { font-size: 1rem !important; }
            .hw-box { padding: 20px !important; border-radius: 12px !important; }
            .hw-box h3 { font-size: 1rem !important; }
            .hw-box .specs-text { font-size: 1.1rem !important; }
            .cta-box { padding: 25px 15px !important; }
            .cta-box h2 { font-size: 1.5rem !important; }
            .social-btn { width: 100%; }
        }
      `}} />

      <nav className="nav-bar" style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.5)', zIndex: 100, position: 'relative' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '950', color: '#66fcf1', letterSpacing: '2px' }}>
          <Link href={isEn ? "/?lang=en" : "/"} style={{ color: 'inherit', textDecoration: 'none' }}>THE HARDWARE GURU</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            <Link href={isEn ? "/?lang=en" : "/"} className="nav-link nav-special">{isEn ? 'BACK HOME' : 'ZPĚT NA WEB'}</Link>
            <Link href={isEn ? "/sestavy?lang=en" : "/sestavy"} className="nav-link">{isEn ? 'PC BUILDS' : 'PC SESTAVY'}</Link>
        </div>
      </nav>

      <main className="inner-container" style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 className="main-h1" style={{ color: '#fff', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 20px 0', textShadow: '0 0 20px rgba(102, 252, 241, 0.4)' }}>
            {isEn ? '💻 My Personal Setup' : '💻 Na čem jede Guru?'}
          </h1>
          <p className="desc-p" style={{ fontSize: '1.2rem', color: '#e0e0e0', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' }}>
            {isEn 
              ? 'People keep asking what I use for streaming and gaming. Here it is. No compromises, brutal airflow, and dedicated streaming hardware.' 
              : 'Lidi se mě furt ptají, z čeho streamuju a na čem hraju. Tady to máte. Žádné kompromisy, brutální airflow a dedikovaný HW na stream.'}
          </p>
        </header>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT (STRIKTNÍ SEPARACE) */}
        <div className="ad-desktop-wrapper">
            <div style={{ width: '100%' }}>
                <span className="ad-label">Advertisement</span>
                <iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe>
            </div>
        </div>
        <div className="ad-mobile-wrapper">
            <span className="ad-label">Advertisement</span>
            <iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe>
        </div>

        {/* HW BLOCKS */}
        {hwData.map((item, index) => (
          <React.Fragment key={index}>
            <div className="hw-box">
              <h3 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {item.icon} {item.title}
              </h3>
              <div className="specs-text" style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>{item.specs}</div>
              <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>{item.desc}</p>
            </div>

            {/* 🔥 ADS SLOT #2: MID PLACEMENT (PO 3. BOXU) */}
            {index === 2 && (
              <>
                <div className="ad-desktop-wrapper">
                  <div style={{ width: '100%' }}>
                    <span className="ad-label">Sponsored Hardware Gear</span>
                    <iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe>
                  </div>
                </div>
                <div className="ad-mobile-wrapper">
                  <span className="ad-label">Sponsored Hardware Gear</span>
                  <iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe>
                </div>
              </>
            )}
          </React.Fragment>
        ))}

        <div className="cta-box" style={{ background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.95), rgba(11, 12, 16, 0.95))', borderRadius: '20px', border: '1px solid #45a29e', padding: '40px', textAlign: 'center', marginTop: '60px', boxShadow: '0 0 40px rgba(0,0,0,0.6)' }}>
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
            {isEn ? 'Any questions about my build?' : 'Máš dotaz k mýmu buildu?'}
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#e0e0e0' }}>
            {isEn ? 'Want advice on a similar beast, or just don\'t want to buy nonsense? Join the stream!' : 'Chceš poradit s podobnou bestií, nebo prostě nekoupit blbost? Doraž na stream!'}
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#53fc18', color: '#0b0c10' }}>
              {isEn ? 'FOLLOW ON KICK' : 'SLEDUJ MĚ NA KICKU'}
            </a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="social-btn" style={{ background: '#5865F2', color: '#fff' }}>
              {isEn ? 'JOIN DISCORD' : 'PŘIPOJ SE NA DISCORD'}
            </a>
          </div>
        </div>
      </main>

      <footer style={{ background: 'rgba(11, 12, 16, 0.98)', padding: '60px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '80px' }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
          </div>
          <p style={{ color: '#45a29e', opacity: 0.6, fontSize: '0.85rem', letterSpacing: '1px' }}>
            © 2026 THE HARDWARE GURU. POWERED BY AI & CAFFEINE.
          </p>
      </footer>
    </div>
  );
}
