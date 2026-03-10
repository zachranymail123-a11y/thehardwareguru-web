import Link from 'next/link';

// 🔥 SEO META TAGY PRO GOOGLE INDEXACI
export const metadata = {
  title: 'Na čem jede Guru? | Můj osobní PC Build',
  description: 'Zajímá tě, na čem stříhám, streamuju a hraju? Tady je můj osobní dual-GPU stroj bez kompromisů.',
};

export default function MojePcPage() {
  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    }}>
      
      {/* STEJNÉ CSS TŘÍDY JAKO NA HLAVNÍ STRÁNCE */}
      <style>{`
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .nav-special { color: #66fcf1 !important; border: 1px solid #66fcf1; padding: 5px 12px; border-radius: 4px; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { box-shadow: 0 0 15px currentColor; transform: scale(1.05); }
        .hw-box { 
          background: rgba(31, 40, 51, 0.7); 
          border: 1px solid #45a29e; 
          padding: 30px; 
          border-radius: 12px; 
          margin-bottom: 25px;
          transition: all 0.3s;
        }
        .hw-box:hover { 
          border-color: #66fcf1; 
          background: rgba(31, 40, 51, 0.9); 
          transform: translateY(-5px); 
          box-shadow: 0 0 20px rgba(102, 252, 241, 0.2);
        }
      `}</style>

      {/* HLAVIČKA TVÉHO WEBU */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>THE HARDWARE GURU</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" className="nav-link nav-special">ZPĚT NA HLAVNÍ WEB</Link>
            <Link href="/sestavy" className="nav-link">PC SESTAVY</Link>
            <Link href="/slovnik" className="nav-link">SLOVNÍK</Link>
        </div>
      </nav>

      {/* HLAVNÍ OBSAH */}
      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
        
        {/* Nápis jako na hlavní stránce */}
        <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '15px', fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 10px rgba(102, 252, 241, 0.5)' }}>
          💻 Na čem jede Guru?
        </h1>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '50px', color: '#e0e0e0', lineHeight: '1.6' }}>
          Lidi se mě furt ptají, z čeho streamuju a na čem hraju. Tady to máte.<br/>
          <strong style={{color: '#66fcf1'}}>Žádné kompromisy, brutální airflow a dedikovaný HW na stream.</strong>
        </p>

        {/* SEZNAM KOMPONENTŮ (Každý má tvůj hover a border efekt z hlavní strany) */}
        <div className="hw-box">
          <h3 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🖥️ Procesor & Základní deska</h3>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>
            AMD Ryzen 7 9800X3D + Gigabyte X870E Aorus Elite
          </div>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
            9800X3D je absolutní a neohrožený král gamingu. Drtí tabulky ve všech hrách. A protože potřebuju naprostou stabilitu a konektivitu pro hromadu disků, sedí to v X870E Aorus Elite s brutální napájecí kaskádou.
          </p>
        </div>

        <div className="hw-box">
          <h3 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🎮 Dual GPU Setup</h3>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>
            MSI RTX 5070 Ti 16GB (Hry) + MSI RTX 5060 (Stream)
          </div>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
            Tohle je ten pravej flex. 5070 Ti mě tahá ve hrách na max detaily. Ale když zapnu stream na Kicku, veškerou zátěž na kódování (Encode) hodím na druhou RTX 5060. Výsledek? Nulový FPS drop ve hře.
          </p>
        </div>

        <div className="hw-box">
          <h3 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>⚡ Paměti & Úložiště</h3>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>
            G.Skill Trident Z5 RGB 6000 CL28 + 3x Kingston KC3000 2TB
          </div>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
            6000MHz je pro AM5 sweetspot a CL28 latence z toho dělá raketu. Disky? 3x Kingston KC3000 (celkem 6TB) v extrémní Gen4 rychlosti, takže mám místo na všechny hry i záznamy ze streamů bez kompromisů.
          </p>
        </div>

        <div className="hw-box">
          <h3 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>❄️ Chlazení</h3>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>
            Arctic Liquid Freezer III 360 ARGB (Push-Pull 6x Montech) + Noctua NT-H2
          </div>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
            Kdo mě zná, ví, že na teploty jsem úchyl. Pastu dávám prémiovou Noctua NT-H2. Vodník od Arcticu s mým Push-Pull modem chladí jako mrazák a můžu to nechat běžet naprosto potichu.
          </p>
        </div>

        <div className="hw-box">
          <h3 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🌪️ Skříň & Airflow</h3>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>
            NZXT H7 Flow + 6x Fractal Design Aspect 12 + Be quiet! Light Wings 140mm
          </div>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
            Dvě grafiky vyrobí tunu tepla. NZXT H7 Flow tvoří dokonalý větrný tunel. Nahoře a dole je 6x Fractal Design Aspect 12 RGB pro masivní tah, vzadu to vyfukuje vysokorychlostní 140mm Be quiet! Hardware se tu cítí jako v lázních.
          </p>
        </div>

        <div className="hw-box">
          <h3 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🔋 Zdroj</h3>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>
            Seasonic Focus GX-1000
          </div>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
            Krmit dvě grafiky a nabušenej procesor vyžaduje brutální a čistou dodávku proudu. Seasonic je pro mě absolutní zlatý standard. S 1000W mám klidné spaní a hromadu rezervy.
          </p>
        </div>

        {/* CALL TO ACTION ODKAZY ZE STRÁNKY */}
        <div style={{ background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.95), rgba(11, 12, 16, 0.95))', borderRadius: '15px', border: '1px solid #45a29e', padding: '40px', textAlign: 'center', marginTop: '60px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
            Máš dotaz k mýmu buildu?
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#e0e0e0' }}>
            Chceš podobnou dual-GPU bestii, nebo poradit s něčím normálním, abys nekoupil blbost? <br/>
            Od toho tu jsem. Doraž na stream nebo rovnou do naší komunity!
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#53fc18', color: '#0b0c10', border: 'none', fontSize: '1.1rem' }}>
              SLEDUJ MĚ NA KICKU
            </a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="social-btn" style={{ background: '#5865F2', color: '#fff', border: 'none', fontSize: '1.1rem' }}>
              PŘIPOJ SE NA DISCORD
            </a>
          </div>
        </div>

      </main>

      {/* PATIČKA TVÉHO WEBU */}
      <footer style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '40px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
          </div>
          <p style={{ color: '#45a29e', opacity: 0.7, fontSize: '0.8rem' }}>© 2026 The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>

    </div>
  );
}
