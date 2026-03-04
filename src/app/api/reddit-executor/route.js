// reddit_executor.js
import { createClient } from '@supabase/supabase-base';

// Inicializace Supabase (použij své proměnné prostředí)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runRedditExecutor() {
  console.log("🚀 Reddit Executor startuje...");

  try {
    // 1. Vytáhneme JEDEN článek, který má reddit = FALSE
    // Podle tvého screenu to vezme ID 818 (nejstarší z těch FALSE)
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('reddit', false)
      .eq('status', 'published') // Pro jistotu, aby to nebralo rozepsané věci
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !post) {
      console.log("📭 Žádný nový materiál k postování. Reddit column je u všeho TRUE.");
      return;
    }

    console.log(`📦 Našel jsem čerstvý kousek: ${post.title}`);

    // 2. Příprava dat pro tvůj Vercel Webhook
    // Podle tvé struktury poznáme typ (game/hardware/news)
    const redditPayload = {
      title: `[GURU ${post.type.toUpperCase()}] ${post.title}`,
      text: `${post.seo_description || post.content.substring(0, 200)}...\n\nCelý článek najdeš zde: https://www.thehardwareguru.cz/clanky/${post.slug}\n\n🦾 Sleduj r/TheHardwareGuru_Info pro denní nálož HW fixů!`,
      subreddit: "TheHardwareGuru_Info",
      flair: post.type === 'game' ? "GURU TWEAK" : "RECENZE",
      image_url: post.image_url
    };

    // 3. Výstřel na Make.com přes tvůj REDDIT_WEBHOOK_URL
    const response = await fetch(process.env.REDDIT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(redditPayload)
    });

    if (response.ok) {
      // 4. Označíme v DB jako odeslané (UPDATE na TRUE)
      const { error: updateError } = await supabase
        .from('posts')
        .update({ reddit: true })
        .eq('id', post.id);

      if (updateError) throw updateError;
      console.log(`✅ Úspěch! "${post.title}" (ID: ${post.id}) je na Redditu.`);
    } else {
      console.error("❌ Make.com Webhook neodpovídá:", response.statusText);
    }

  } catch (error) {
    console.error("💥 Kritická chyba Executora:", error.message);
  }
}

runRedditExecutor();
