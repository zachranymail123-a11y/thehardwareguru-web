import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU AI SEO AUTOPILOT
 * 🚀 CÍL: Automaticky procházet nové články a odesílat je AI k auditu.
 * Spouštění: Cron-job.org (např. 1x denně v noci)
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function GET(req) {
  try {
    // 1. BEZPEČNOST: Ochrana proti neoprávněnému spuštění zvenčí
    const url = new URL(req.url);
    const secretKey = url.searchParams.get('key');
    
    // Zde doplň svůj tajný klíč, který používáš pro crony
    if (secretKey !== 'Wifik500') {
      return NextResponse.json({ error: 'Neplatný bezpečnostní klíč' }, { status: 401 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Chybí OPENAI_API_KEY' }, { status: 500 });
    }

    // 2. VÝBĚR DAT: Stáhneme 3 nejnovější články z tabulky posts
    const { data: posts, error: postsError } = await supabase
      .from('posts') // Pokud se tvá tabulka s články jmenuje jinak, uprav název zde
      .select('slug, title')
      .order('created_at', { ascending: false })
      .limit(10); // Stáhneme víc, abychom mohli filtrovat ty hotové

    if (postsError || !posts || posts.length === 0) {
      return NextResponse.json({ message: 'Nenalezeny žádné články k analýze.' });
    }

    // 3. KONTROLA: Které z nich už AI auditovalo?
    const { data: existingAudits } = await supabase
      .from('seo_audits')
      .select('url');
      
    const auditedUrls = existingAudits ? existingAudits.map(a => a.url) : [];

    // Najdeme 3 články, které ještě nebyly auditovány
    const toAudit = [];
    for (const post of posts) {
      const fullUrl = `${baseUrl}/clanky/${post.slug}`;
      if (!auditedUrls.includes(fullUrl)) {
        toAudit.push({ url: fullUrl, type: 'article' });
      }
      if (toAudit.length >= 3) break; // Zpracujeme max 3 najednou kvůli timeoutu Vercelu
    }

    if (toAudit.length === 0) {
      return NextResponse.json({ message: 'Všechny nedávné články už mají SEO audit hotový.' });
    }

    // 4. ANALÝZA: Pošleme vybrané URL do našeho AI Evaluátoru
    const results = [];
    for (const item of toAudit) {
      // Zavoláme ten skript, který jsme vytvořili v předchozím kroku
      const auditReq = await fetch(`${baseUrl}/api/admin/run-seo-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url, pageType: item.type })
      });
      
      const auditRes = await auditReq.json();
      results.push({ url: item.url, status: auditReq.ok ? 'success' : 'failed', detail: auditRes });
    }

    return NextResponse.json({ 
      success: true, 
      audited_count: results.length,
      results: results 
    });

  } catch (err) {
    console.error("Autopilot Error:", err);
    return NextResponse.json({ error: 'Interní chyba autopilota' }, { status: 500 });
  }
}
