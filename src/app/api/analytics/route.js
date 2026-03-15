import { BetaAnalyticsDataClient } from "@google-analytics/data";

export async function GET() {
  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
    });

    const [response] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: "2024-01-01",
          endDate: "today",
        },
      ],
      metrics: [
        {
          name: "screenPageViews",
        },
      ],
    });

    const pageviews = Number(
      response.rows?.[0]?.metricValues?.[0]?.value ?? 0
    );

    // BONUS: realistický odhad návštěvníků
    const visitors = Math.round(pageviews * 0.7);

    return Response.json(
      {
        pageviews,
        visitors,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("GA API ERROR:", error);

    return Response.json(
      {
        pageviews: 0,
        visitors: 0,
        error: "analytics_unavailable",
      },
      { status: 500 }
    );
  }
}
