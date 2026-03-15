export const dynamic = "force-dynamic";

import Link from "next/link";

const baseUrl = "https://thehardwareguru.cz";

async function getAllPages() {

  const res = await fetch(`${baseUrl}/guru-sitemap.xml`);
  const xml = await res.text();

  const sitemapUrls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (m) => m[1]
  );

  let allUrls = [];

  for (const sitemap of sitemapUrls) {
    try {
      const r = await fetch(sitemap);
      const sitemapXml = await r.text();

      const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
        (m) => m[1]
      );

      allUrls.push(...urls);
    } catch {}
  }

  return allUrls.slice(0, 5000);
}

export const metadata = {
  title: "Kompletní mapa webu | The Hardware Guru",
  description:
    "Kompletní seznam všech stránek webu The Hardware Guru. CPU, GPU, benchmarky, články a hardware databáze.",
  alternates: {
    canonical: `${baseUrl}/all`,
    languages: {
      en: `${baseUrl}/en/all`,
      cs: `${baseUrl}/all`,
      "x-default": `${baseUrl}/all`,
    },
  },
  robots: "index, follow",
};

export default async function AllPages() {
  const pages = await getAllPages();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: pages.map((url, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: url,
    })),
  };

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "120px 20px",
        color: "#fff",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />

      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900 }}>
          Kompletní mapa webu
        </h1>

        <p style={{ color: "#9ca3af" }}>
          Kompletní přehled všech stránek webu ({pages.length} URL)
        </p>
      </header>

      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
          gap: 10,
          listStyle: "none",
          padding: 0,
        }}
      >
        {pages.map((url, i) => (
          <li key={i}>
            <Link
              href={url}
              style={{
                display: "block",
                padding: "10px 14px",
                border: "1px solid #1f2937",
                borderRadius: 8,
                textDecoration: "none",
                color: "#a855f7",
                fontWeight: 700,
              }}
            >
              {url.replace(baseUrl, "")}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
