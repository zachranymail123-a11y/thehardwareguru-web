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
    marginBottom: '60px' 
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

  return (
    <div style={globalStyles}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hlavička stránky - GURU STYLE */}
        <div style={headerCardStyles}>
          <h1 style={titleStyles}>
            {pageTitle}
          </h1>
          <p style={{ color: '#eab308', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {pageSubtitle}
          </p>
        </div>

        {/* Mřížka karet her */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {deals && deals.map((deal) => (
            /* CELÁ KARTA JE ODKAZ NA HRK (DeepLink) */
            <a 
              key={deal.id}
              href={deal.affiliate_link}
              target="_blank"
              rel="nofollow sponsored"
              className="group block rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full cursor-pointer"
              style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
            >
              {/* Obrázek hry */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-800 border-b border-neutral-800 transition-colors" style={{ borderBottomColor: 'rgba(234, 179, 8, 0.3)' }}>
                {deal.image_url ? (
                  <img 
                    src={deal.image_url} 
                    alt={deal.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-neutral-600 font-bold uppercase tracking-wider">
                    No Image
                  </div>
                )}
                {/* Cenovka plovoucí přes obrázek */}
                <div className="absolute top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg font-black text-lg shadow-[0_0_15px_rgba(234,88,12,0.6)]">
                  {isEn ? deal.price_en : deal.price_cs}
                </div>
              </div>

              {/* Obsah karty */}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-black text-white mb-3 line-clamp-2" style={{ letterSpacing: '0.5px' }}>
                  {deal.title}
                </h2>
                
                <p className="text-neutral-400 text-sm mb-6 flex-grow line-clamp-3">
                  {isEn ? deal.description_en : deal.description_cs}
                </p>

                {/* Tlačítko pro vizuální efekt dole na kartě */}
                <div className="w-full py-3 px-4 text-white font-black text-center rounded-xl transition-all duration-300 shadow-inner" style={{ background: '#eab308', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {buyText}
                </div>
              </div>
            </a>
          ))}
          
          {/* Hláška, když nejsou žádné hry - GURU STYLE */}
          {(!deals || deals.length === 0) && (
            <div className="col-span-full">
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
