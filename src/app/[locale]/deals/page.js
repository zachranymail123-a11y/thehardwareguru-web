import { createClient } from '@supabase/supabase-js';

// Inicializace Supabase klienta pro serverové komponenty
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Tvrdé SEO: Meta tagy pro Google
export async function generateMetadata({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  return {
    title: isEn ? 'Best Game Deals | The Hardware Guru' : 'Nejlevnější hry | The Hardware Guru',
    description: isEn 
      ? 'Get the best game keys at the lowest prices. Handpicked deals by The Hardware Guru.' 
      : 'Získej herní klíče za ty absolutně nejnižší ceny. Vybrané slevy od The Hardware Guru.',
  };
}

// Zamezení cachování pro aktuální ceny a slevy
export const revalidate = 0;

export default async function DealsPage({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  // Načtení her z databáze
  const { data: deals, error } = await supabase
    .from('game_deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Chyba při načítání slev:", error);
  }

  // Texty podle jazyka
  const pageTitle = isEn ? "🔥 BEST GAME DEALS" : "🔥 HRY ZA TY NEJNIŽŠÍ CENY";
  const pageSubtitle = isEn ? "SUPPORT THE CHANNEL BY PURCHASING THROUGH THESE LINKS!" : "NÁKUPEM PŘES TYTO ODKAZY PŘÍMO PODPOŘÍŠ KANÁL!";
  const buyText = isEn ? "BUY NOW" : "KOUPIT HNED";
  const ctaText = isEn ? "VIEW ALL GREAT DEALS →" : "ZOBRAZIT VŠECHNY VÝHODNÉ NABÍDKY →";
  const hrkMainLink = "https://www.hrkgame.com/#a_aid=TheHardwareGuru";

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")', 
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed',
      paddingTop: '140px',
      paddingBottom: '100px',
      color: '#fff'
    }}>
      
      {/* 🚀 GURU SUPREME CSS OVERRIDE (FORCE STYLE) 🚀 */}
      <style>{`
        .guru-deals-wrapper a {
          text-decoration: none !important;
          color: inherit !important;
        }
        .guru-header-card {
          background: rgba(31, 40, 51, 0.95);
          padding: 60px 40px;
          border-radius: 30px;
          border: 1px solid #eab308;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          text-align: center;
          max-width: 1200px;
          margin: 0 auto 80px auto;
          backdrop-filter: blur(10px);
        }
        .guru-main-cta {
          display: inline-block;
          margin-top: 35px;
          padding: 20px 50px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff !important;
          font-weight: 900;
          font-size: 1.3rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .deals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 35px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .guru-card {
          background: rgba(17, 19, 24, 0.9);
          border: 1px solid rgba(234, 179, 8, 0.3);
          border-radius: 25px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.4s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          position: relative;
        }
        .guru-card:hover {
          transform: translateY(-10px);
          border-color: #eab308;
          box-shadow: 0 20px 45px rgba(234, 179, 8, 0.25);
        }
        .guru-card-img-container {
          position: relative;
          height: 200px;
          width: 100%;
          background: #000;
          overflow: hidden;
          display: block !important;
        }
        .guru-card-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
          transition: transform 0.6s ease;
        }
        .guru-card-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #ea580c;
          color: #fff !important;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 950;
          font-size: 1.1rem;
          box-shadow: 0 5px 15px rgba(234,88,12,0.6);
          z-index: 20;
        }
        .guru-card-body {
          padding: 25px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          background: rgba(31, 40, 51, 0.5);
        }
        .guru-card-title {
          font-size: 22px;
          font-weight: 900;
          color: #fff !important;
          margin: 0 0 12px 0 !important;
          line-height: 1.1;
          text-transform: uppercase;
        }
        .guru-card-desc {
          color: #9ca3af !important;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 25px;
          flex-grow: 1;
        }
        .guru-card-btn {
          background: #eab308;
          color: #000 !important;
          text-align: center;
          padding: 16px;
          border-radius: 15px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 14px;
        }
      `}</style>

      <main className="guru-deals-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* HLAVIČKA */}
        <div className="guru-header-card">
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4rem)', 
            fontWeight: '950', 
            textShadow: '0 0 20px rgba(234, 179, 8, 0.6)',
            marginBottom: '10px'
          }}>
            {pageTitle}
          </h1>
          <p style={{ color: '#eab308', fontWeight: '900', letterSpacing: '2px', fontSize: '1.1rem' }}>
            {pageSubtitle}
          </p>
          
          <a href={hrkMainLink} target="_blank" rel="nofollow sponsored" className="guru-main-cta">
            {ctaText}
          </a>
        </div>

        {/* MŘÍŽKA S KARTAMI */}
        <div className="deals-grid">
          {deals && deals.map((deal) => (
            <a key={deal.id} href={deal.affiliate_link} target="_blank" rel="nofollow sponsored" className="guru-card">
              
              {/* Sekce obrázku s neprůstřelným zobrazením */}
              <div className="guru-card-img-container">
                {deal.image_url ? (
                  <img 
                    src={deal.image_url} 
                    alt={deal.title} 
                    className="guru-card-img" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#111' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#66fcf1', fontWeight: '900', fontSize: '1.5rem', boxShadow: '0 0 15px rgba(102, 252, 241, 0.4)' }}>HG</div>
                    <span style={{ marginTop: '10px', fontSize: '10px', color: '#444', fontWeight: '900' }}>IMAGE MISSING</span>
                  </div>
                )}
                
                {/* Cenovka */}
                <div className="guru-card-badge">
                  {isEn ? deal.price_en : deal.price_cs}
                </div>
              </div>

              {/* Obsah karty */}
              <div className="guru-card-body">
                <h2 className="guru-card-title">{deal.title}</h2>
                <p className="guru-card-desc">
                  {isEn ? deal.description_en : deal.description_cs}
                </p>
                <div className="guru-card-btn">
                  {buyText}
                </div>
              </div>
            </a>
          ))}
          
          {/* Prázdný stav */}
          {(!deals || deals.length === 0) && (
            <div className="guru-empty-state" style={{ gridColumn: '1 / -1', background: 'rgba(31, 40, 51, 0.95)', padding: '80px 20px', borderRadius: '30px', border: '1px solid #a855f7', textAlign: 'center', boxShadow: '0 0 40px rgba(168, 85, 247, 0.2)' }}>
              <h3 style={{ color: '#a855f7', fontSize: '1.8rem', fontWeight: '950', marginBottom: '15px' }}>
                {isEn ? "GURU SYSTEMS SCANNING FOR DEALS..." : "GURU SYSTÉMY SKENUJÍ NOVÉ SLEVY..."}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>
                {isEn ? "No deals available right now. Check back later!" : "Momentálně zde nejsou žádné slevy. Zkus to později!"}
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
