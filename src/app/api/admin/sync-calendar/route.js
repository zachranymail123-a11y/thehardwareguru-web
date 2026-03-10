import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GURU ADMIN: Boží přístup k DB
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 🚀 GURU CHYTRÝ FORMÁTOVAČ NÁZVŮ
 * Vyřeší 'of', 'the' i specifické herní zkratky, aby název vypadal profesionálně.
 */
function formatGameTitle(str) {
  if (!str) return '';
  const exceptions = { 
    'gta v': 'GTA V', 
    'gta 5': 'GTA V', 
    'csgo': 'CS:GO', 
    'pubg': 'PUBG',
    'farcry': 'Far Cry',
    'cyberpunk 2077': 'Cyberpunk 2077'
  };
  
  const lowerStr = str.toLowerCase().trim();
  if (exceptions[lowerStr]) return exceptions[lowerStr];
  
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v|vs|via)$/i;
  
  return lowerStr.split(' ').map((word, index, arr) => {
    // První a poslední slovo vždy s velkým, ostatní podle seznamu malých slov
    if (index !== 0 && index !== arr.length - 1 && smallWords.test(word)) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

/**
 * 🚀 GURU CALENDAR SYNC ENGINE 2.1 (Smart Title & Video Support)
 */
export async function POST(req) {
  try {
    const { pin } = await req.json();
    if (pin !== process.env.GURU_PIN) {
      return NextResponse.json({ error: 'Špatný GURU PIN!' }, { status: 401 });
    }

    const apiKey = process.env.RAWG_API_KEY;
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // GURU FETCH: RAWG API
    const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=${today},${nextWeek}&ordering=-added`);
    const data = await res.json();

    if (!data.results) {
      throw new Error("RAWG API nevrátilo žádné výsledky.");
    }

    const games = data.results.map(g => ({
      rawg_id: g.id,
      // 🚀 GURU FIX: Aplikujeme formátování názvu před uložením do DB
      name: formatGameTitle(g.name),
      released: g.released,
      image_url: g.background_image,
      platforms: g.platforms?.map(p => p.platform.name) || [],
      // 🎥 VIDEO DETECTION: Zůstává zachována pro trailery
      video_id: g.clip?.video || null 
    }));

    // GURU UPSERT: Přidá nové hry, existující neaktualizuje (chráníme si případné ruční úpravy v DB)
    const { error } = await supabaseAdmin
      .from('herni_kalendar')
      .upsert(games, { onConflict: 'rawg_id' });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      count: games.length,
      message: `GURU SYNC: ${games.length} her úspěšně naformátováno a uloženo.`
    });

  } catch (err) {
    console.error("GURU SYNC FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
