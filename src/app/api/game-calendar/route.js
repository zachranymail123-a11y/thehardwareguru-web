import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Helper pro vytvoření slugu (stejný jako používáš všude jinde)
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();

export async function GET() {
  const apiKey = process.env.RAWG_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: "Missing RAWG_API_KEY",
      games: [
        { id: 1, name: "Guru Mystery Game", released: "Coming Soon", background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e", platforms: [{platform: {name: "PC"}}] }
      ] 
    });
  }

  // Inicializace Supabase pro kontrolu duplicit
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const start = formatDate(today);
    const end = formatDate(nextWeek);

    const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=${start},${end}&ordering=-added&page_size=12`;

    // U RAWG API necháme cache, ať neplýtváme limity
    const res = await fetch(url, { next: { revalidate: 3600 } }); 
    const data = await res.json();

    let games = data.results || [];

    // 🚀 GURU FIX: ANTI-DUPLICATOR
    if (games.length > 0) {
      // 1. Vytvoříme seznam slugů z her, co nám vrátil RAWG
      const gameSlugs = games.map(g => slugify(g.name));

      // 2. Zeptáme se DB: "Máš už některý z těchto slugů u sebe?"
      const { data: existingPosts, error } = await supabase
        .from('posts')
        .select('slug')
        .in('slug', gameSlugs);

      if (!error && existingPosts) {
        const existingSlugs = existingPosts.map(p => p.slug);
        // 3. Odfiltrujeme ty, které už v DB existují!
        games = games.filter(g => !existingSlugs.includes(slugify(g.name)));
      }
    }

    return NextResponse.json({ 
      games: games 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
