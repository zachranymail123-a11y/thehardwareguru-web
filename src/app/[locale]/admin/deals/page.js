import { createClient } from '@supabase/supabase-js';

// Inicializace Supabase klienta pro serverové komponenty
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Tvrdé SEO: Meta tagy pro stránku se slevami
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

  // Načtení her z databáze, seřazeno od nejnovější
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
  
  // 🔥 GURU FIX: Odstraněno "NA HRK" pro maximalizaci prokliků (Curiosity Gap) 🔥
  const ctaText = isEn ? "VIEW ALL GREAT DEALS →" : "ZOBRAZIT VŠECHNY VÝHODNÉ NABÍDKY →";
  const hrkMainLink = "https://www.hrkgame.com/#a_aid=TheHardwareGuru";

  // --- GURU MASTER STYLES ---
  const globalStyles = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    color: '#fff', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed',
    paddingTop: '120px', // Odsazení pro Navbar
    paddingBottom: '80px'
  };
  
  const headerCardStyles = { 
    background: 'rgba(31, 40, 51, 0.95)', 
    padding: '50px 40px', 
    borderRadius: '25px', 
    border: '1px solid #eab308', 
    boxShadow: '0 15px 45px rgba(0,0,0,0.6)', 
    textAlign: 'center', 
    marginBottom: '60px',
    maxWidth: '1200px',
    margin: '0 auto 60px auto'
  };
  
  const titleStyles = { 
    color: '#fff', 
    fontSize: '3.5rem', 
    margin: '0 0 15px 0', 
    textTransform: 'uppercase', 
    fontWeight: '900', 
    lineHeight: '1.1', 
    textShadow: '0 0 15px rgba(234, 179, 8, 0.5)' 
  };

  const gridStyles = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  return (
    <div style={globalStyles}>
      
      {/* 🚀 NEPRŮSTŘELNÉ GURU STYLY (ABSOLUTNÍ OVERRIDE PROTI MODRÝM ODKAZŮM) 🚀 */}
      <style>{`
        .guru-cta-button {
          display: inline-block;
          margin-top: 30px;
          padding: 18px 45px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff !important;
          font-weight: 900;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 16px;
          text-decoration: none !important;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .guru-cta-button:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
          border-color: #fbd38d;
          color: #ffffff !important;
        }

        /* Guru Deal Card Styles */
        .deal-card {
          text-decoration: none !important;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(234, 179, 8, 0.3);
          background: rgba(17, 19, 24, 0.85);
          backdrop-filter: blur(10px);
          color: #fff !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .deal-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(234, 179, 8, 0.3);
          border-color: #eab308;
        }
        .deal-card * {
          text-decoration: none !important;
        }
        
        .deal-img-wrap {
          position: relative;
          height: 220px;
          width: 100%;
          background: #0b0c10;
          border-bottom: 1px solid rgba(234, 179, 8, 0.3);
          overflow: hidden;
        }
        .deal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .deal-card:hover .deal-img {
          transform: scale(1.1);
        }
        .deal-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #ea580c;
          color: #fff !important;
          padding: 6px 14px;
          border-radius: 10px;
          font-weight: 900;
          font-size: 1.1rem;
          box-shadow: 0 0 15px rgba(234,88,12,0.6);
          z-index: 10;
        }
        
        .deal-content {
          padding: 25px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .deal-title {
          color: #fff !important;
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 10px 0;
          line-height: 1.2;
        }
        .deal-desc {
          color: #9ca3af !important;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 25px;
          flex-grow: 1;
        }
        .deal-btn {
          width: 100%;
          padding: 15px;
          background: #eab308;
          color: #000 !important;
          text-align: center;
          border-radius: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: background 0.3s;
        }
        .deal-card:hover .deal-btn {
          background: #facc15;
        }
      `}</style>

      <main style={{ padding: '0 20px' }}>
        
        {/* Hlavička stránky - GURU STYLE */}
        <div style={headerCardStyles}>
          <h1 style={titleStyles}>
            {pageTitle}
          </h1>
          <p style={{ color: '#eab308', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {pageSubtitle}
          </p>
          
          {/* 🔥 GURU HLAVNÍ CTA TLAČÍTKO 🔥 */}
          <a
            href={hrkMainLink}
            target="_blank"
            rel="nofollow sponsored"
            className="guru-cta-button"
          >
            {ctaText}
          </a>
        </div>

        {/* Mřížka karet her */}
        <div style={gridStyles}>
          {deals && deals.map((deal) => (
            /* CELÁ KARTA JE ODKAZ NA HRK (DeepLink) s neprůstřelnou classou */
            <a 
              key={deal.id}
              href={deal.affiliate_link}
              target="_blank"
              rel="nofollow sponsored"
              className="deal-card"
            >
              {/* Obrázek hry */}
              <div className="deal-img-wrap">
                {deal.image_url ? (
                  <img 
                    src={deal.image_url} 
                    alt={deal.title} 
                    className="deal-img"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    No Image
                  </div>
                )}
                {/* Cenovka plovoucí přes obrázek */}
                <div className="deal-badge">
                  {isEn ? deal.price_en : deal.price_cs}
                </div>
              </div>

              {/* Obsah karty */}
              <div className="deal-content">
                <h2 className="deal-title">
                  {deal.title}
                </h2>
                
                <p className="deal-desc">
                  {isEn ? deal.description_en : deal.description_cs}
                </p>

                {/* Tlačítko pro vizuální efekt dole na kartě */}
                <div className="deal-btn">
                  {buyText}
                </div>
              </div>
            </a>
          ))}
          
          {/* Hláška, když nejsou žádné hry - GURU STYLE */}
          {(!deals || deals.length === 0) && (
            <div style={{ gridColumn: '1 / -1' }}>
               <div style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '60px 20px', borderRadius: '25px', border: '1px solid #a855f7', textAlign: 'center', boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)' }}>
                  <h3 style={{ color: '#a855f7', fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                    {isEn ? "GURU SYSTEMS ARE SCANNING FOR NEW DEALS..." : "GURU SYSTÉMY SKENUJÍ NOVÉ SLEVY..."}
                  </h3>
                  <p style={{ color: '#9ca3af', marginTop: '15px', fontSize: '1.1rem' }}>
                    {isEn ? "No deals available at the moment. Check back later!" : "Momentálně zde nejsou žádné slevy. Zkus to později!"}
                  </p>
               </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
