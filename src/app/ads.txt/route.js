/**
 * GURU ADS.TXT ENGINE
 * Cesta: src/app/ads.txt/route.js
 * 🚀 CÍL: Trvalá autorizace pro Google AdSense a obě A-ADS jednotky (Desktop + Mobile).
 */

export const runtime = "nodejs";
export const revalidate = 86400; // Cache na 24 hodin

export async function GET() {
  // Záznamy pro Google a obě A-ADS jednotky
  const adsTxtContent = 
    "google.com, pub-5468223287024993, DIRECT, f08c47fec0942fa0\n" +
    "a-ads.com, 2431217, DIRECT\n" +
    "a-ads.com, 2431218, DIRECT";

  return new Response(adsTxtContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    },
  });
}
