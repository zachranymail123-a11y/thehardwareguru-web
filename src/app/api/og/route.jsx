import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Vytáhneme nadpis z URL
    const title = searchParams.get('title') || 'Novinky ze světa hardwaru';
    let bg = searchParams.get('bg');

    // Defaultní obrázek, pokud AI žádný nevygenerovala
    if (!bg || bg === 'null') {
      bg = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1080&q=80';
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Vycentrujeme obsah vertikálně
            alignItems: 'center', // Vycentrujeme obsah horizontálně
            position: 'relative',
          }}
        >
          {/* BEZPEČNÉ POZADÍ (Fyzický obrázek na celou plochu) */}
          <img
            src={bg}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* CELOPLOŠNÝ ZTMAVOVACÍ FILTR (Pro lepší čitelnost textu) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(11, 12, 16, 0.7)',
            }}
          />

          {/* HLAVNÍ OBSAHOVÁ VRSTVA (Vycentrovaná) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '80px',
              zIndex: 10,
              textAlign: 'center',
            }}
          >
            {/* The Hardware Guru Badge (Nahoře) */}
            <div
              style={{
                backgroundColor: '#ff0055',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '5px',
                fontSize: 32,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '40px',
              }}
            >
              The Hardware Guru
            </div>

            {/* Hlavní nadpis článku (Obří, uprostřed) */}
            <div
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
                fontFamily: 'sans-serif',
                marginBottom: '40px',
                textShadow: '0 5px 30px rgba(0,0,0,0.8)',
              }}
            >
              {title}
            </div>

            {/* Neonová Guru linka */}
            <div
              style={{
                width: '250px',
                height: '10px',
                backgroundColor: '#66fcf1',
              }}
            />
          </div>

          {/* ---> NOVÁ WEBOVÁ ADRESA NA SPODKU OBRÁZKU <--- */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 28,
              fontWeight: 'bold',
              letterSpacing: '2px',
              zIndex: 10,
              fontFamily: 'sans-serif',
            }}
          >
            www.thehardwareguru.cz
          </div>
        </div>
      ),
      {
        // ---> NOVÝ INSTAGRAM-FRIENDLY ROZMĚR NA VÝŠKU <---
        width: 1080,
        height: 1920, // Formát 9:16
      }
    );
  } catch (e) {
    return new Response(`Nepodařilo se vygenerovat obrázek: ${e.message}`, { status: 500 });
  }
}
