import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// TATO ŘÁDKA VYNUTÍ ČERSTVÁ DATA PŘI KAŽDÉM VOLÁNÍ (VYPNE CACHE) [cite: 2026-03-04]
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  console.log("🚀 Reddit Executor API startuje...");

  try {
    // 1. Vytáhneme JEDEN článek, který má reddit = FALSE [cite: 2026-03-04]
    const { data: post, error: dbError } = await supabase
      .from('posts')
      .select('*')
      .eq('reddit', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (dbError) {
      console.error("❌ Chyba Supabase:", dbError.message);
      return NextResponse.json({ error: "DB Error", details: dbError.message }, { status: 500 });
    }

    if (!post) {
      console.log("📭 Žádný nový materiál k postování.");
      return NextResponse.json({ message: "Všechny články už jsou na Redditu." });
    }

    console.log(`📦 Našel jsem čerstvý kousek: ${post.title}`);

    // 2. Příprava dat pro Make.com Webhook [cite: 2026-03-04]
    const redditPayload = {
      title: `[GURU ${post.type ? post.type.toUpperCase() : 'INFO'}] ${post.title}`,
      slug: post.slug, // Přidáno pro Make.com mapování [cite: 2026-03-04]
      seo_description: post.seo_description || "Nový článek na webu!", // Přidáno pro Make.com mapování [cite: 2026-03-04]
      subreddit: "TheHardwareGuru_Info",
      flair: post.type === 'game' ? "GURU TWEAK" : "RECENZE",
      image_url: post.image_url
    };

    // 3. Výstřel na Make.com přes tvůj REDDIT_WEBHOOK_URL [cite: 2026-03-04]
    const response = await fetch(process.env.REDDIT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(redditPayload)
    });

    if (response.ok) {
      // 4. Označíme v DB jako odeslané (UPDATE na TRUE) [cite: 2026-03-04]
      const { error: updateError } = await supabase
        .from('posts')
        .update({ reddit: true })
        .eq('id', post.id);

      if (updateError) throw updateError;
      
      console.log(`✅ Úspěch! "${post.title}" (ID: ${post.id}) je na Redditu.`);
      return NextResponse.json({ 
        success: true, 
        posted: post.title,
        id: post.id 
      });
    } else {
      const errorText = await response.text();
      console.error("❌ Make.com neodpovídá:", errorText);
      return NextResponse.json({ error: "Make.com error", details: errorText }, { status: 500 });
    }

  } catch (error) {
    console.error("💥 Kritická chyba Executora:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
