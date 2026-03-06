import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { pin } = await req.json();
    if (pin !== process.env.GURU_PIN) return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 });

    const apiKey = process.env.RAWG_API_KEY;
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=${today},${nextWeek}&ordering=-added`);
    const data = await res.json();

    const games = data.results.map(g => ({
      rawg_id: g.id,
      name: g.name,
      released: g.released,
      image_url: g.background_image,
      platforms: g.platforms.map(p => p.platform.name)
    }));

    // GURU UPSERT: Přidá nové, nešahej na staré
    const { error } = await supabaseAdmin.from('herni_kalendar').upsert(games, { onConflict: 'rawg_id' });
    if (error) throw error;

    return NextResponse.json({ success: true, count: games.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
