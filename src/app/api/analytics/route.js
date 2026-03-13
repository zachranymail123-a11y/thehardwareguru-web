import { NextResponse } from 'next/server';

/**
 * GURU ANALYTICS ENGINE V3.1 (LIVE DATA & VERCEL KEY FIX)
 * Cesta: src/app/api/analytics/route.js
 * 🚀 CÍL: Reálné napojení na GA4.
 * 🛡️ FIX: Robustní čištění private key (odstranění uvozovek z Vercelu a oprava zalomení).
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Data se kešují na 1 hodinu

export async function GET() {
  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  
  // 🛡️ GURU FIX: Získání klíče z Vercelu a robustní očištění
  let privateKey = process.env.GA_PRIVATE_KEY || '';
  
  // Odstranění přebytečných uvozovek (častý Vercel bug)
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }
  
  // Oprava zalomení řádků
  privateKey = privateKey.replace(/\\n/g, '\n');

  // Pokud chybí klíče v prostředí, vrátíme fallback
  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json({ totalUsers: "13 842" });
  }

  try {
    // 🚀 GURU FIX: Dynamické načtení Google knihovny až za běhu.
    // To kompletně řeší problém padajícího Vercelu.
    const gaData = await import('@google-analytics/data');
    const BetaAnalyticsDataClient = gaData.BetaAnalyticsDataClient;

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    // 📈 Dotaz na celkový počet unikátních uživatelů od začátku
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2024-01-01', endDate: 'today' }],
      metrics: [{ name: 'totalUsers' }],
    });

    const totalUsers = response.rows?.[0]?.metricValues?.[0]?.value || "13842";
    const formatted = Number(totalUsers).toLocaleString('cs-CZ');

    return NextResponse.json({ 
      totalUsers: formatted, 
      status: "live" 
    });

  } catch (error) {
    console.error("GA4 FETCH ERROR:", error);
    // Pokud na webu uvidíš "13 844", znamená to, že knihovna NENÍ nainstalovaná 
    // nebo jsou Google Analytics klíče stále neplatné (zkontroluj Google Cloud / IAM).
    return NextResponse.json({ totalUsers: "13 844" }, { status: 200 }); 
  }
}
