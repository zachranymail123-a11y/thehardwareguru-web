import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Novinky ze světa hardwaru';
    let bg = searchParams.get('bg');

    if (!bg || bg === 'null' || bg === 'undefined') {
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
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: '#0b0c10',
          }}
        >
          <img src={bg} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11, 12, 16, 0.8)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '100px 50px', zIndex: 10, textAlign: 'center' }}>
            <div style={{ backgroundColor: '#ff0055', color: 'white', padding: '20px 40px', borderRadius: '10px', fontSize: 40, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '5px', marginBottom: '60px' }}>
              The Hardware Guru
            </div>

            <div style={{ fontSize: 100, fontWeight: 900, color: 'white', lineHeight: 1.1, fontFamily: 'sans-serif', marginBottom: '60px', textShadow: '0 10px 40px rgba(0,0,0,1)' }}>
              {title}
            </div>

            <div style={{ width: '300px', height: '15px', backgroundColor: '#66fcf1', boxShadow: '0 0 30px #66fcf1' }} />
          </div>

          <div style={{ position: 'absolute', bottom: '80px', color: 'rgba(255, 255, 255, 0.5)', fontSize: 36, fontWeight: 'bold', letterSpacing: '4px', zIndex: 10 }}>
            WWW.THEHARDWAREGURU.CZ
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      }
    );
  } catch (e) {
    return new Response(`Chyba: ${e.message}`, { status: 500 });
  }
}
