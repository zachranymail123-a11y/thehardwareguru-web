import { NextResponse } from 'next/server';

/**
 * GURU ANALYTICS ENGINE V4.0 (PAGEVIEWS MODE)
 * Cesta: src/app/api/analytics/route.js
 * 🚀 ZMĚNA: místo totalUsers vrací screenPageViews (pageviews)
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // cache 1 hodinu (šetří GA API)

export async function GET() {
  const propertyId = process.env.GA_PROPERTY_ID || '';
  const clientEmail = process.env.GA_CLIENT_EMAIL || '';

  // Načtení private key z Vercelu
  let privateKey = process.env.GA_PRIVATE_KEY || '';

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const cleanPropertyId = propertyId.replace('properties/', '');

  if (!cleanPropertyId || !clientEmail || !privateKey) {
    return NextResponse.json({
      pageviews: "0",
      debug_error: "Env proměnné se nenačetly na serveru!"
    });
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
      dateRanges: [
        { startDate: '2024-01-01', endDate: 'today' }
      ],
      metrics: [
        { name: 'screenPageViews' }
      ],
    });

    const pageViews = parseInt(
      response.rows?.[0]?.metricValues?.[0]?.value || "0",
      10
    );

    const formatted = pageViews.toLocaleString('cs-CZ');

    return NextResponse.json({
      pageviews: formatted,
      status: "live",
      raw_pageviews: pageViews
    });

  } catch (error) {

    console.error("GA4 FETCH ERROR:", error);

    return NextResponse.json({
      pageviews: "0",
      debug_error: error.message || "Neznámá chyba"
    }, { status: 200 });

  }
}
