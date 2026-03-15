import { BetaAnalyticsDataClient } from "@google-analytics/data";

export async function GET() {
  try {

    const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");

    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: privateKey,
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
          name: "eventCount",
        },
      ],
      dimensions: [
        {
          name: "eventName",
        },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: {
            value: "page_view",
          },
        },
      },
    });

    const pageviews = Number(
      response.rows?.[0]?.metricValues?.[0]?.value ?? 0
    );

    // realistický odhad unikátních návštěvníků
    const visitors = Math.round(pageviews * 0.7);

    return Response.json(
      {
        pageviews,
        visitors,
        formatted_pageviews: pageviews.toLocaleString("cs-CZ"),
        formatted_visitors: visitors.toLocaleString("cs-CZ"),
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
