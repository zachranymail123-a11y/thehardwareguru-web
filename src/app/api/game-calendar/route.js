import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 🚀 GURU CALENDAR ENGINE
 * Automaticky tahá hry, které vycházejí v rozmezí dnes + 7 dní.
 */
export async function GET() {
  const apiKey = process.env.RAWG_API_KEY;
  
  if (!apiKey) {
    // Pokud chybí klíč, vrátíme demo data, aby web nespadl
    return NextResponse.json({ 
      error: "Missing RAWG_API_KEY",
      games: [
        { id: 1, name: "Guru Mystery Game", released: "Coming Soon", background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e", platforms: [{platform: {name: "PC"}}] }
      ] 
    });
  }

  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const start = formatDate(today);
    const end = formatDate(nextWeek);

    // GURU FETCH: Bereme hry s hodnocením nad 0, abychom odfiltrovali úplný balast
    const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=${start},${end}&ordering=-added&page_size=12`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache 1 hodina
    const data = await res.json();

    return NextResponse.json({ 
      games: data.results || [] 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
