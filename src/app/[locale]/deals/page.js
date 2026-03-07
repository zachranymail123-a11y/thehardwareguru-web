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
  const pageTitle = isEn ? "🔥 Best Game Deals" : "🔥 Hry za ty nejnižší ceny";
  const pageSubtitle = isEn ? "Support the channel by purchasing through these links!" : "Nákupem přes tyto odkazy přímo podpoříš kanál!";
  const buyText = isEn ? "BUY NOW" : "KOUPIT HNED";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Hlavička stránky */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">
            {pageTitle}
          </h1>
          <p className="text-xl text-orange-500 font-medium">
            {pageSubtitle}
          </p>
        </div>

        {/* Mřížka karet her */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {deals && deals.map((deal) => (
            /* CELÁ KARTA JE ODKAZ NA HRK (DeepLink) - Otevírá se do nového okna */
            <a 
              key={deal.id}
              href={deal.affiliate_link}
              target="_blank"
              rel="nofollow sponsored"
              className="group block bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-orange-500 hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full cursor-pointer"
            >
              {/* Obrázek hry */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-800 border-b border-neutral-800 group-hover:border-orange-500 transition-colors">
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
                <div className="absolute top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg font-black text-lg shadow-lg">
                  {isEn ? deal.price_en : deal.price_cs}
                </div>
              </div>

              {/* Obsah karty */}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold text-white mb-3 line-clamp-2">
                  {deal.title}
                </h2>
                
                <p className="text-neutral-400 text-sm mb-6 flex-grow line-clamp-3">
                  {isEn ? deal.description_en : deal.description_cs}
                </p>

                {/* Tlačítko pro vizuální efekt dole na kartě */}
                <div className="w-full py-3 px-4 bg-neutral-800 group-hover:bg-orange-600 text-white font-black text-center rounded-xl transition-colors duration-300 shadow-inner">
                  {buyText}
                </div>
              </div>
            </a>
          ))}
          
          {(!deals || deals.length === 0) && (
            <div className="col-span-full text-center text-neutral-500 py-20 text-xl font-medium">
              {isEn ? "No deals available at the moment. Check back later!" : "Momentálně zde nejsou žádné slevy. Zkus to později!"}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
