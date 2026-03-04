import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Inicializace Supabase klienta s tvými proměnnými prostředí [cite: 2026-03-04]
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  console.log("🚀 Reddit Executor API startuje...");

  try {
    // 1. Vytáhneme JEDEN článek, který má reddit = FALSE [cite: 2026-03-04]
    // Bereme nejstarší (ascending), aby se články postovaly postupně
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('reddit', false)
      .eq('status', 'published')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !post) {
      console.log("📭 Žádný nový materiál k postování.");
      return NextResponse.json({ message: "Všechny články už jsou na Redditu." });
    }

    console.log(`📦 Našel jsem čerstvý kousek: ${post.title}`);

    // 2. Příprava dat pro tvůj Make.com Webhook [cite: 2026-03-04]
    const redditPayload = {
      title: `[GURU ${post.type ? post.type.toUpperCase() : 'INFO'}] ${post.title}`,
      // Použijeme tvůj seo_description, nebo kousek obsahu bez HTML [cite: 2026-03-04]
      text: `${post.seo_description || "Nový článek na webu!"}\n\nCelý článek najdeš zde: https://www.thehardwareguru.cz/clanky/${post.slug}\n\n🦾 Sleduj r/TheHardwareGuru_Info pro denní nálož HW fixů!`,
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
      console.error("❌ Make.com Webhook neodpovídá:", response.statusText);
      return NextResponse.json({ error: "Make.com error" }, { status: 500 });
    }

  } catch (error) {
    console.error("💥 Kritická chyba Executora:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
