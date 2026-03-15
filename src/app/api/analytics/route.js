import { NextResponse } from 'next/server';

/**
 * GURU ANALYTICS ENGINE V5.0 (STABLE COUNTER)
 * Pageviews counter s historickou základnou.
 */

export const revalidate = 3600; // cache 1 hodinu

export async function GET() {

  const propertyId = process.env.GA_PROPERTY_ID || '';
  const clientEmail = process.env.GA_CLIENT_EMAIL || '';
  let privateKey = process.env.GA_PRIVATE_KEY || '';

  const historicalBase = 8000; // 👈 nastav podle staré návštěvnosti

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
      pageviews: historicalBase,
      status: "fallback"
    });
  }

  try {

    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');

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

    const gaViews = parseInt(
      response.rows?.[0]?.metricValues?.[0]?.value || "0",
      10
    );

    const totalViews = historicalBase + gaViews;

    const formatted = totalViews.toLocaleString('cs-CZ');

    return NextResponse.json({
      pageviews: formatted,
      raw_pageviews: totalViews,
      status: "live",
      ga_views: gaViews
    });

  } catch (error) {

    console.error("GA4 ERROR:", error);

    return NextResponse.json({
      pageviews: historicalBase,
      raw_pageviews: historicalBase,
      status: "fallback"
    });

  }
}
