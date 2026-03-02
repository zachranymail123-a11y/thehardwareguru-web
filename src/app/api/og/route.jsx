import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parametry z URL
    const title = searchParams.get('title') || 'Novinky ze světa hardwaru';
    let bg = searchParams.get('bg');

    // Defaultní obrázek, pokud AI žádný nevygenerovala nebo je link rozbitý
    if (!bg || bg === 'null' || bg === 'undefined') {
      bg = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&q=80';
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: '#0b0c10',
          }}
        >
          {/* POZADÍ */}
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

          {/* FILTR */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(11, 12, 16, 0.75)',
            }}
          />

          {/* OBSAH */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 60px',
              zIndex: 10,
              textAlign: 'center',
            }}
          >
            {/* BADGE */}
            <div
              style={{
                backgroundColor: '#ff0055',
                color: 'white',
                padding: '10px 25px',
                borderRadius: '5px',
                fontSize: 28,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '30px',
              }}
            >
              The Hardware Guru
            </div>

            {/* NADPIS */}
            <div
              style={{
                fontSize: 65,
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
                fontFamily: 'sans-serif',
                marginBottom: '30px',
                textShadow: '0 5px 20px rgba(0,0,0,0.9)',
              }}
            >
              {title}
            </div>

            {/* NEON LINKA */}
            <div
              style={{
                width: '200px',
                height: '8px',
                backgroundColor: '#66fcf1',
                boxShadow: '0 0 15px #66fcf1',
              }}
            />
          </div>

          {/* URL DOLE */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 24,
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
        width: 1200,
        height: 630, // Standardní OG rozměr
      }
    );
  } catch (e) {
    console.error(e.message);
    return new Response(`Chyba generování: ${e.message}`, { status: 500 });
  }
}
