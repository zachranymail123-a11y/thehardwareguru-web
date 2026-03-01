import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'Novinky ze světa hardwaru';
    let bg = searchParams.get('bg');

    if (!bg || bg === 'null') {
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
            justifyContent: 'flex-end',
            position: 'relative',
          }}
        >
          {/* BEZPEČNÉ POZADÍ (Fyzický obrázek místo CSS backgroundImage) */}
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

          {/* ZTMAVOVACÍ PŘECHOD (Pro lepší čitelnost textu) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(to bottom, transparent, rgba(11, 12, 16, 0.95))',
            }}
          />

          {/* OBSAHOVÁ VRSTVA */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start', // Správná náhrada za fit-content
              padding: '80px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                backgroundColor: '#ff0055',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                fontSize: 24,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '20px',
              }}
            >
              The Hardware Guru
            </div>

            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
                fontFamily: 'sans-serif',
                marginBottom: '20px',
              }}
            >
              {title}
            </div>

            <div
              style={{
                width: '150px',
                height: '8px',
                backgroundColor: '#66fcf1',
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Nepodařilo se vygenerovat obrázek: ${e.message}`, { status: 500 });
  }
}
