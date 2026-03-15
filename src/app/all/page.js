import Link from "next/link";

async function getAllPages() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;

  // načíst sitemap index
  const res = await fetch(`${base}/guru-sitemap.xml`, {
    next: { revalidate: 3600 }
  });

  const xml = await res.text();

  // najít všechny sitemap soubory
  const sitemapUrls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    m => m[1]
  );

  let allUrls = [];

  // projít každou sitemapu
  for (const sitemap of sitemapUrls) {
    try {
      const res = await fetch(sitemap);
      const sitemapXml = await res.text();

      const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
        m => m[1]
      );

      allUrls.push(...urls);
    } catch {}
  }

  return allUrls;
}

export const metadata = {
  title: "Kompletní mapa webu",
  description: "Přehled všech stránek webu",
  robots: "index, follow"
};

export default async function AllPages() {
  const pages = await getAllPages();

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 20px" }}>
      <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 40 }}>
        Kompletní mapa webu
      </h1>

      <p style={{ marginBottom: 40, color: "#9ca3af" }}>
        Přehled všech stránek webu ({pages.length} URL)
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
          gap: 10
        }}
      >
        {pages.map((url, i) => (
          <Link
            key={i}
            href={url}
            style={{
              padding: "10px 14px",
              border: "1px solid #1f2937",
              borderRadius: 8,
              textDecoration: "none",
              color: "#66fcf1",
              fontWeight: 700
            }}
          >
            {url.replace("https://thehardwareguru.cz", "")}
          </Link>
        ))}
      </div>
    </main>
  );
}
