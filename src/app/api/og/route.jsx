import { ImageResponse } from 'next/og';

export const runtime = 'edge'; // Běží na superrychlých Edge serverech Vercelu

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Vytáhneme nadpis a obrázek z URL adresy
    const title = searchParams.get('title') || 'Novinky ze světa hardwaru';
    let bg = searchParams.get('bg');

    // Pokud AI nevygenerovala obrázek, hodíme tam tvůj default
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
            padding: '80px',
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Tmavý gradient přes obrázek, aby byl bílý text vždycky čitelný */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(to top, rgba(11,12,16, 0.95) 0%, rgba(11,12,16, 0.5) 50%, rgba(11,12,16, 0.1) 100%)',
            }}
          />

          {/* Vrstva s textem */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Značka */}
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
                width: 'fit-content',
              }}
            >
              The Hardware Guru
            </div>

            {/* Hlavní nadpis článku */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                fontFamily: 'sans-serif',
              }}
            >
              {title}
            </div>
            
            {/* Guru neonová linka */}
            <div 
              style={{
                width: '150px',
                height: '8px',
                backgroundColor: '#66fcf1',
                marginTop: '10px'
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630, // Standardní rozměr pro sociální sítě
      }
    );
  } catch (e) {
    return new Response(`Nepodařilo se vygenerovat obrázek`, { status: 500 });
  }
}
