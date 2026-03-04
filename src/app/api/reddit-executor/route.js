import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Vynutí čerstvá data a vypne cache na Vercelu [cite: 2026-03-04]
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  console.log("🚀 Executor API startuje...");

  try {
    // 1. Vytáhneme JEDEN článek, který má reddit = FALSE [cite: 2026-03-04]
    // Seřadíme od nejstaršího (ascending: true), aby šly popořadě [cite: 2026-03-04]
    const { data: post, error: dbError } = await supabase
      .from('posts')
      .select('*')
      .eq('reddit', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(); // maybeSingle nezpůsobí chybu, když nic nenajde [cite: 2026-03-04]

    if (dbError) {
      console.error("❌ Chyba Supabase:", dbError.message);
      return NextResponse.json({ error: "DB Error", details: dbError.message }, { status: 500 });
    }

    if (!post) {
      console.log("📭 Všechny články už jsou zpracovány.");
      return NextResponse.json({ message: "Žádné další články k odeslání." });
    }

    console.log(`📦 Zpracovávám: ${post.title} (ID: ${post.id})`);

    // 2. Příprava dat pro Make.com Webhook [cite: 2026-03-04]
    const payload = {
      title: post.title,
      slug: post.slug,
      seo_description: post.seo_description || "Nový článek na webu!",
      image_url: post.image_url,
      type: post.type || 'info'
    };

    // 3. Výstřel na Make.com [cite: 2026-03-04]
    const response = await fetch(process.env.REDDIT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // 4. Update v DB (Důležité: provede se jen při úspěchu 200 OK) [cite: 2026-03-04]
    if (response.ok) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ reddit: true })
        .eq('id', post.id);

      if (updateError) {
        console.error("❌ Nepodařilo se označit článek jako odeslaný:", updateError.message);
        throw updateError;
      }
      
      console.log(`✅ Hotovo! ID ${post.id} posláno a označeno.`);
      return NextResponse.json({ success: true, id: post.id, title: post.title });
    } else {
      const errorData = await response.text();
      console.error("❌ Make.com Webhook error:", errorData);
      return NextResponse.json({ error: "Webhook failed", status: response.status }, { status: 500 });
    }

  } catch (error) {
    console.error("💥 Kritická chyba:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
