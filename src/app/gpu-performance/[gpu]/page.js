import React, { cache } from "react";
import { BarChart3, Gamepad2, Swords, ArrowUpCircle } from "lucide-react";

export const revalidate = 86400;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

const normalizeName = (name = "") =>
  name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, "");

const findGpu = cache(async (gpuSlug) => {
  if (!supabaseUrl) return null;

  const clean = gpuSlug.replace(/-/g, " ");

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/gpus?select=*&slug=ilike.*${clean}*&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 86400 },
      }
    );

    const data = await res.json();
    return data?.[0] || null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }) {
  const gpu = await findGpu(params.gpu);

  if (!gpu) {
    return { title: "GPU Performance | The Hardware Guru" };
  }

  const title = `${gpu.name} Performance Benchmarks`;

  return {
    title,
    description: `Gaming FPS benchmarks and performance analysis for ${gpu.name}.`,
    alternates: {
      canonical: `https://www.thehardwareguru.cz/gpu-performance/${params.gpu}`,
    },
  };
}

export default async function GpuHubPage({ params }) {
  const gpuSlug = params.gpu;

  const gpu = await findGpu(gpuSlug);

  if (!gpu) {
    return (
      <div style={{ color: "#fff", padding: "120px", textAlign: "center" }}>
        GPU NOT FOUND
      </div>
    );
  }

  const cleanGpu = normalizeName(gpu.name);

  const games = ["cyberpunk-2077", "warzone", "starfield"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0b0d",
        paddingTop: "120px",
        paddingBottom: "100px",
        color: "#fff",
      }}
    >
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}>
        <header style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1
            style={{
              fontSize: "clamp(2rem,5vw,3rem)",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          >
            {cleanGpu} Gaming Performance
          </h1>

          <p style={{ color: "#9ca3af", marginTop: "20px" }}>
            Benchmark FPS analysis and upgrade recommendations for {cleanGpu}.
          </p>
        </header>

        {/* FPS BENCHMARK LINKS */}

        <section style={{ marginBottom: "60px" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>
            <Gamepad2 size={22} /> FPS Benchmarks
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "15px",
            }}
          >
            {games.map((game) => (
              <a
                key={game}
                href={`/gpu-performance/${gpuSlug}/${game}/1440p`}
                className="similar-link-card"
              >
                {cleanGpu} {game.replace("-", " ")} FPS
              </a>
            ))}
          </div>
        </section>

        {/* GPU VS */}

        <section style={{ marginBottom: "60px" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>
            <Swords size={22} /> GPU Comparisons
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "15px",
            }}
          >
            <a
              className="similar-link-card"
              href={`/gpuvs/${slugify(gpu.name)}-vs-rtx-4090`}
            >
              {cleanGpu} vs RTX 4090
            </a>

            <a
              className="similar-link-card"
              href={`/gpuvs/${slugify(gpu.name)}-vs-rtx-4080`}
            >
              {cleanGpu} vs RTX 4080
            </a>

            <a
              className="similar-link-card"
              href={`/gpuvs/${slugify(gpu.name)}-vs-rx-7900-xt`}
            >
              {cleanGpu} vs RX 7900 XT
            </a>
          </div>
        </section>

        {/* GPU UPGRADES */}

        <section style={{ marginBottom: "60px" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>
            <ArrowUpCircle size={22} /> Upgrade Paths
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "15px",
            }}
          >
            <a
              className="similar-link-card"
              href={`/gpu-upgrade/rtx-3060-to-${gpuSlug}`}
            >
              RTX 3060 → {cleanGpu}
            </a>

            <a
              className="similar-link-card"
              href={`/gpu-upgrade/rtx-2070-to-${gpuSlug}`}
            >
              RTX 2070 → {cleanGpu}
            </a>

            <a
              className="similar-link-card"
              href={`/gpu-upgrade/rx-6600-to-${gpuSlug}`}
            >
              RX 6600 → {cleanGpu}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
