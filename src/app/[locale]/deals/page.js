import { createClient } from '@supabase/supabase-js';

// GURU ENGINE: Inicializace Supabase pro veřejné čtení
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Tvrdé SEO: Meta tagy pro Google a sociální sítě
export async function generateMetadata({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Best Game Deals | The Hardware Guru' : 'Nejlevnější hry | The Hardware Guru',
    description: isEn 
      ? 'Get the best game keys at the lowest prices. Handpicked deals with discount codes.' 
      : 'Získej herní klíče za nejnižší ceny. Vybrané slevy a exkluzivní slevové kódy.',
  };
}

// Zamezení cachování pro bleskové aktualizace cen
export const revalidate = 0;

export default async function DealsPage({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  // Načtení her z databáze (včetně sloupce discount_code)
  const { data: deals, error } = await supabase
    .from('game_deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Guru Search Error:", error);
  }

  // Texty rozhraní podle jazyka
  const pageTitle = isEn ? "🔥 BEST GAME DEALS" : "🔥 HRY ZA TY NEJNIŽŠÍ CENY";
  const pageSubtitle = isEn ? "FINAL PRICES AFTER DISCOUNT CODES!" : "VÝSLEDNÉ CENY PO POUŽITÍ SLEVOVÝCH KÓDŮ!";
  const buyText = isEn ? "BUY NOW" : "KOUPIT HNED";
  const hrkMainLink = "https://www.hrkgame.com/#a_aid=TheHardwareGuru";

  return (
    <div className="guru-deals-page" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")', 
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed', 
      paddingTop: '140px', 
      paddingBottom: '100px', 
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      
      {/* 🚀 GURU SUPREME CSS OVERRIDE (MAXIMUM STRENGTH) 🚀 */}
      <style>{`
        .guru-deals-container { max-width: 1240px; margin: 0 auto; padding: 0 20px; }
        .guru-deals-container a { text-decoration: none !important; color: inherit !important; }
        
        .guru-header-card { 
            background: rgba(31, 40, 51, 0.95); padding: 50px 30px; border-radius: 25px; 
            border: 1px solid #eab308; box-shadow: 0 20px 60px rgba(0,0,0,0.8); 
            text-align: center; margin-bottom: 70px; backdrop-filter: blur(10px);
        }

        .deals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 35px; }
        
        .guru-card {
          background: rgba(17, 19, 24, 0.98); border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 22px; overflow: hidden; display: flex; flex-direction: column;
          height: 100%; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          text-decoration: none !important; color: #fff !important; position: relative; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .guru-card:hover { transform: translateY(-10px); border-color: #eab308; box-shadow: 0 20px 45px rgba(234, 179, 8, 0.3); }

        .card-img-container {
          width: 100%; height: 210px; background: #000; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .card-img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s ease; }
        .guru-card:hover .card-img { transform: scale(1.08); }
        
        /* 🔥 GURU PRICE BADGE WITH CODE INFO 🔥 */
        .card-badge {
          position: absolute; top: 12px; right: 12px; 
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
          padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 1.1rem;
          box-shadow: 0 4px 15px rgba(234,88,12,0.6); z-index: 10;
          display: flex; flex-direction: column; align-items: center;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .badge-code-info { font-size: 9px; text-transform: uppercase; margin-top: 2px; opacity: 0.9; letter-spacing: 0.5px; }

        .card-body { padding: 25px; flex-grow: 1; display: flex; flex-direction: column; }
        .card-title { font-size: 21px; font-weight: 950; color: #fff !important; text-transform: uppercase; line-height: 1.2; margin: 0 0 12px 0 !important; }
        
        /* 🔥 GURU DISCOUNT BOX (LUXUS EDITION) 🔥 */
        .discount-code-box {
          background: rgba(255, 0, 85, 0.08); border: 1px dashed #ff0055;
          padding: 12px; border-radius: 12px; color: #ff0055; font-weight: 950;
          text-align: center; margin-bottom: 25px; letter-spacing: 2px;
          text-transform: uppercase; font-size: 16px;
          box-shadow: inset 0 0 15px rgba(255, 0, 85, 0.1);
        }
        .discount-label { font-size: 10px; color: #ff0055; font-weight: 950; margin-bottom: 5px; display: block; text-align: center; letter-spacing: 1px; }

        .card-desc { color: #9ca3af !important; font-size: 14px; line-height: 1.5; margin-bottom: 25px; flex-grow: 1; }
        
        .card-btn { 
          background: #eab308; color: #000 !important; text-align: center; 
          padding: 15px; border-radius: 14px; font-weight: 950; 
          text-transform: uppercase; font-size: 14px; letter-spacing: 1px;
          transition: 0.3s; box-shadow: 0 4px 15px rgba(234, 179, 8, 0.2);
        }
        .guru-card:hover .card-btn { background: #facc15; transform: scale(1.02); }

        .guru-main-cta {
          display: inline-block; margin-top: 30px; padding: 18px 45px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff !important; font-weight: 950; font-size: 1.2rem;
          text-transform: uppercase; border-radius: 18px; text-decoration: none !important;
          box-shadow: 0 10px 35px rgba(249, 115, 22, 0.4); border: 2px solid rgba(255, 255, 255, 0.1);
          transition: 0.3s;
        }
        .guru-main-cta:hover { transform: translateY(-5px); box-shadow: 0 15px 45px rgba(249, 115, 22, 0.6); }
      `}</style>

      <div className="guru-deals-container">
        {/* Hlavička stránky */}
        <div className="guru-header-card">
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: '950', textShadow: '0 0 25px rgba(234, 179, 8, 0.6)', margin: 0 }}>
            {pageTitle}
          </h1>
          <p style={{ color: '#eab308', fontWeight: '900', letterSpacing: '2px', marginTop: '15px', textTransform: 'uppercase' }}>
            {pageSubtitle}
          </p>
          <a href={hrkMainLink} target="_blank" rel="nofollow sponsored" className="guru-main-cta">
            {isEn ? "VIEW ALL GREAT DEALS →" : "VŠECHNY VÝHODNÉ NABÍDKY →"}
          </a>
        </div>

        {/* Mřížka slevových karet */}
        <div className="deals-grid">
          {deals && deals.map((deal) => (
            <a key={deal.id} href={deal.affiliate_link} target="_blank" rel="nofollow sponsored" className="guru-card">
              
              {/* Horní sekce: Obrázek a Cena */}
              <div className="card-img-container">
                <img src={deal.image_url} alt={deal.title} className="card-img" />
                <div className="card-badge">
                  {isEn ? deal.price_en : deal.price_cs}
                  {/* Signalizace ceny s kódem */}
                  {deal.discount_code && (
                    <span className="badge-code-info">{isEn ? "WITH CODE" : "S KÓDEM"}</span>
                  )}
                </div>
              </div>

              {/* Dolní sekce: Informace o hře */}
              <div className="card-body">
                <h2 className="card-title">{deal.title}</h2>
                
                {/* 🔥 GURU DISCOUNT SECTION 🔥 */}
                {deal.discount_code && (
                  <div>
                    <span className="discount-label">{isEn ? "USE CODE:" : "POUŽIJ KÓD:"}</span>
                    <div className="discount-code-box">{deal.discount_code}</div>
                  </div>
                )}

                <p className="card-desc">
                  {isEn ? deal.description_en : deal.description_cs}
                </p>

                <div className="card-btn">{buyText}</div>
              </div>
            </a>
          ))}
          
          {/* Fallback pro prázdný stav */}
          {(!deals || deals.length === 0) && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 20px', background: 'rgba(31, 40, 51, 0.8)', borderRadius: '30px', border: '1px dashed #444' }}>
              <h3 style={{ color: '#eab308', fontSize: '1.8rem', fontWeight: '950' }}>
                {isEn ? "GURU SYSTEMS SCANNING FOR DEALS..." : "GURU SYSTÉMY SKENUJÍ NOVÉ PEKLO..."}
              </h3>
              <p style={{ color: '#9ca3af', marginTop: '10px' }}>
                {isEn ? "No active deals found. Check back later!" : "Momentálně zde nejsou žádné slevy. Zkus to za chvíli!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
