import { NextResponse } from 'next/server';

/**
 * GURU ANALYTICS ENGINE V3.3 (HISTORICAL MERGE)
 * Cesta: src/app/api/analytics/route.js
 * 🚀 CÍL: Zjistit přesný důvod selhání Google API a spojit historii s GA4.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Pro debugování vypneme cache úplně

export async function GET() {
  const propertyId = process.env.GA_PROPERTY_ID || '';
  const clientEmail = process.env.GA_CLIENT_EMAIL || '';
  
  // 1. Získání klíče z Vercelu
  let privateKey = process.env.GA_PRIVATE_KEY || '';
  
  // 2. Odstranění přebytečných uvozovek (častý Vercel bug)
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }
  
  // 3. Oprava zalomení řádků
  privateKey = privateKey.replace(/\\n/g, '\n');

  // 4. Očištění Property ID (kdybys tam omylem dal slovo 'properties/')
  const cleanPropertyId = propertyId.replace('properties/', '');

  if (!cleanPropertyId || !clientEmail || !privateKey) {
    return NextResponse.json({ totalUsers: "13 842", debug_error: "Env proměnné se nenačetly na serveru!" });
  }

  try {
    const gaData = await import('@google-analytics/data');
    const BetaAnalyticsDataClient = gaData.BetaAnalyticsDataClient;

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${cleanPropertyId}`,
      dateRanges: [{ startDate: '2024-01-01', endDate: 'today' }],
      metrics: [{ name: 'totalUsers' }],
    });

    // 🚀 GURU FIX: Sčítáme historii s nově nasazeným GA4
    const apiUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0", 10);
    const historicalBase = 13842; // Tvé staré publikum
    const totalUsers = historicalBase + apiUsers;

    const formatted = totalUsers.toLocaleString('cs-CZ');

    return NextResponse.json({ 
      totalUsers: formatted, 
      status: "live",
      ga4_users: apiUsers
    });

  } catch (error) {
    console.error("GA4 FETCH ERROR:", error);
    
    // 🚀 GURU DEBUG: Místo tichého selhání vypíšeme přesnou chybovou hlášku
    return NextResponse.json({ 
      totalUsers: "13 844", 
      debug_error: error.message || "Neznámá chyba",
      debug_email: clientEmail ? "Nalezen" : "Chybí",
      debug_property: cleanPropertyId
    }, { status: 200 }); 
  }
}
