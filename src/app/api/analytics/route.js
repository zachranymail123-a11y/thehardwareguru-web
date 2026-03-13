import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

/**
 * GURU ANALYTICS ENGINE V2.2 - LIVE PRODUCTION
 * Cesta: src/app/api/analytics/route.js
 * 🚀 CÍL: Agregace reálných uživatelů z GA4.
 * 🛡️ BEZPEČNOST: Klíče jsou pouze na serveru.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache na 1 hodinu pro úsporu Google API kvót

export async function GET() {
  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  // 🚀 FIX: Vercel/Next.js někdy przní zalomení řádků v soukromém klíči
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json({ totalUsers: "8 589+" });
  }

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    // 📈 Dotaz na 'totalUsers' od začátku roku 2024 (nebo spuštění webu)
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2024-01-01', endDate: 'today' }],
      metrics: [{ name: 'totalUsers' }],
    });

    const totalUsers = response.rows?.[0]?.metricValues?.[0]?.value || "8589";
    
    // Formátování (např. 12500 -> 12 500)
    const formatted = Number(totalUsers).toLocaleString('cs-CZ');

    return NextResponse.json({ 
      totalUsers: formatted,
      status: "synced" 
    });

  } catch (error) {
    console.error("GA4 FETCH ERROR:", error);
    // Fallback, aby web nezamrzl při chybě API
    return NextResponse.json({ totalUsers: "9 124+" }, { status: 200 });
  }
}
