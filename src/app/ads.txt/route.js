/**
 * GURU ADS.TXT ENGINE
 * Cesta: src/app/ads.txt/route.js
 * 🚀 CÍL: Trvalá autorizace pro Google AdSense a A-ADS. 
 * Tento kód se postará o to, že se ads.txt nikdy nesmaže při Vercel buildu.
 */

export const runtime = "nodejs";
export const revalidate = 86400; // Cache na 24 hodin

export async function GET() {
  // Spojené záznamy pro Google AdSense a A-ADS (každý na novém řádku)
  const adsTxtContent = 
    "google.com, pub-5468223287024993, DIRECT, f08c47fec0942fa0\n" +
    "a-ads.com, 2431217, DIRECT";

  return new Response(adsTxtContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    },
  });
}
