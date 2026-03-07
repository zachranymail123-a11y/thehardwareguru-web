import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function generateMetadata({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Best Game Deals | The Hardware Guru' : 'Nejlevnější hry | The Hardware Guru',
    description: isEn ? 'Get the best game keys.' : 'Získej herní klíče za nejlepší ceny.',
  };
}

export const revalidate = 0;

export default async function DealsPage({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  const { data: deals, error } = await supabase
    .from('game_deals')
    .select('*')
    .order('created_at', { ascending: false });

  const pageTitle = isEn ? "🔥 BEST GAME DEALS" : "🔥 HRY ZA TY NEJNIŽŠÍ CENY";
  const pageSubtitle = isEn ? "FINAL PRICES AFTER DISCOUNT CODES!" : "VÝSLEDNÉ CENY PO POUŽITÍ SLEVOVÝCH KÓDŮ!";
  const buyText = isEn ? "BUY NOW" : "KOUPIT HNED";
  const hrkMainLink = "https://www.hrkgame.com/#a_aid=TheHardwareGuru";

  return (
    <div className="guru-deals-page" style={{ 
      minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
      backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '140px', paddingBottom: '100px', color: '#fff' 
    }}>
      
      <style>{`
        .guru-deals-container { max-width: 1240px; margin: 0 auto; padding: 0 20px; }
        .guru-header-card { 
            background: rgba(31, 40, 51, 0.95); padding: 50px 30px; border-radius: 25px; 
            border: 1px solid #eab308; box-shadow: 0 20px 60px rgba(0,0,0,0.8); 
            text-align: center; margin-bottom: 70px; backdrop-filter: blur(10px);
        }
        .deals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 35px; }
        
        .guru-card {
          background: rgba(17, 19, 24, 0.98); border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 22px; overflow: hidden; display: flex; flex-direction: column;
          height: 100%; transition: 0.4s ease; text-decoration: none !important;
          color: #fff !important; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .guru-card:hover { transform: translateY(-10px); border-color: #eab308; box-shadow: 0 20px 45px rgba(234, 179, 8, 0.3); }

        .card-img-container {
          width: 100%; height: 210px; background: #000; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .card-img { width: 100%; height: 100%; object-fit: cover; }
        
        /* 🔥 GURU PRICE BADGE WITH CODE INFO 🔥 */
        .card-badge {
          position: absolute; top: 12px; right: 12px; background: #ea580c;
          padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 1.1rem;
          box-shadow: 0 4px 15px rgba(234,88,12,0.6); z-index: 10;
          display: flex; flex-direction: column; align-items: center;
        }
        .badge-code-info { font-size: 9px; text-transform: uppercase; margin-top: 2px; opacity: 0.9; }

        .card-body { padding: 25px; flex-grow: 1; display: flex; flex-direction: column; }
        .card-title { font-size: 21px; font-weight: 950; color: #fff !important; text-transform: uppercase; line-height: 1.2; margin-bottom: 12px !important; }
        
        /* 🔥 GURU DISCOUNT BOX 🔥 */
        .discount-code-box {
          background: rgba(255, 0, 85, 0.1); border: 1px dashed #ff0055;
          padding: 10px; border-radius: 10px; color: #ff0055; font-weight: 950;
          text-align: center; margin-bottom: 20px; letter-spacing: 2px;
          text-transform: uppercase;
        }
        .discount-label { font-size: 10px; color: #ff0055; font-weight: 900; margin-bottom: 4px; display: block; text-align: center; }

        .card-desc { color: #9ca3af !important; font-size: 14px; line-height: 1.5; margin-bottom: 25px; flex-grow: 1; }
        .card-btn { background: #eab308; color: #000 !important; text-align: center; padding: 14px; border-radius: 12px; font-weight: 950; text-transform: uppercase; font-size: 13px; }
      `}</style>

      <div className="guru-deals-container">
        <div className="guru-header-card">
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: '950', textShadow: '0 0 20px rgba(234, 179, 8, 0.5)', margin: 0 }}>{pageTitle}</h1>
          <p style={{ color: '#eab308', fontWeight: '900', letterSpacing: '2px', marginTop: '10px' }}>{pageSubtitle}</p>
          <a href={hrkMainLink} target="_blank" rel="nofollow sponsored" style={{ display: 'inline-block', marginTop: '30px', padding: '15px 40px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: '15px', color: '#fff', fontWeight: '900', textTransform: 'uppercase', textDecoration: 'none' }}>VŠECHNY NABÍDKY →</a>
        </div>

        <div className="deals-grid">
          {deals && deals.map((deal) => (
            <a key={deal.id} href={deal.affiliate_link} target="_blank" rel="nofollow sponsored" className="guru-card">
              <div className="card-img-container">
                <img src={deal.image_url} alt="" className="card-img" />
                <div className="card-badge">
                  {isEn ? deal.price_en : deal.price_cs}
                  {deal.discount_code && (
                    <span className="badge-code-info">{isEn ? "WITH CODE" : "S KÓDEM"}</span>
                  )}
                </div>
              </div>
              <div className="card-body">
                <h2 className="card-title">{deal.title}</h2>
                
                {deal.discount_code && (
                  <div>
                    <span className="discount-label">{isEn ? "USE CODE:" : "POUŽIJ KÓD:"}</span>
                    <div className="discount-code-box">{deal.discount_code}</div>
                  </div>
                )}

                <p className="card-desc">{isEn ? deal.description_en : deal.description_cs}</p>
                <div className="card-btn">{buyText}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
