import { createClient } from '@supabase/supabase-js'

export const revalidate = 86400

const baseUrl = 'https://thehardwareguru.cz'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 🚀 GURU: Dynamicky zjistíme počet CPU a rozdělíme Sitemapu po 2 CPU na chunk
export async function generateSitemaps() {
  try {
    const { count } = await supabase
      .from('cpus')
      .select('*', { count: 'exact', head: true })

    const cpuCount = count || 100
    const chunks = Math.ceil(cpuCount / 2)

    // Next.js vyžaduje params.id jako string
    return Array.from({ length: chunks + 1 }, (_, i) => ({ id: i.toString() }))
  } catch {
    return Array.from({ length: 20 }, (_, i) => ({ id: i.toString() }))
  }
}

const slugify = (text) =>
  text
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '')

const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

export default async function sitemap({ id }) {
  const currentId = parseInt(id, 10)
  const routes = []
  const now = new Date()

  try {
    // ====================================================================
    // 📌 ID 0: STATICKÉ STRÁNKY, ČLÁNKY, PROFILY, UPGRADY A DUELY (CZ i EN)
    // ====================================================================
    if (currentId === 0) {
      const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support'];
      
      staticPaths.forEach(p => {
          routes.push({ url: `${baseUrl}${p}`, lastModified: now, priority: 1.0 });
          routes.push({ url: `${baseUrl}/en${p}`, lastModified: now, priority: 0.9 });
      });

      const [posts, cpus, gpus, cpuUpg, gpuUpg, cpuDuels, gpuDuels] = await Promise.all([
          supabase.from('posts').select('slug'),
          supabase.from('cpus').select('name, slug'),
          supabase.from('gpus').select('name, slug'),
          supabase.from('cpu_upgrades').select('slug, slug_en'),
          supabase.from('gpu_upgrades').select('slug, slug_en'),
          supabase.from('cpu_duels').select('slug, slug_en'),
          supabase.from('gpu_duels').select('slug, slug_en')
      ]);

      posts?.data?.forEach(p => {
          if (p.slug) {
              routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastModified: now, priority: 0.8 });
              routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastModified: now, priority: 0.7 });
          }
      });

      const coreGames = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

      cpus?.data?.forEach(c => {
          const safeSlug = c.slug || slugify(c.name);
          if (!safeSlug) return;
          routes.push({ url: `${baseUrl}/cpu/${safeSlug}`, lastModified: now, priority: 0.8 });
          routes.push({ url: `${baseUrl}/en/cpu/${safeSlug}`, lastModified: now, priority: 0.7 });
          routes.push({ url: `${baseUrl}/cpu-performance/${safeSlug}`, lastModified: now, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/cpu-performance/${safeSlug}`, lastModified: now, priority: 0.6 });
          routes.push({ url: `${baseUrl}/cpu-recommend/${safeSlug}`, lastModified: now, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/cpu-recommend/${safeSlug}`, lastModified: now, priority: 0.6 });
          coreGames.forEach(gm => {
              routes.push({ url: `${baseUrl}/cpu-fps/${safeSlug}/${gm}`, lastModified: now, priority: 0.7 });
              routes.push({ url: `${baseUrl}/en/cpu-fps/${safeSlug}/${gm}`, lastModified: now, priority: 0.6 });
          });
      });

      gpus?.data?.forEach(g => {
          const safeSlug = cleanGpuSlug(g.slug, g.name);
          if (!safeSlug) return;
          routes.push({ url: `${baseUrl}/gpu/${safeSlug}`, lastModified: now, priority: 0.8 });
          routes.push({ url: `${baseUrl}/en/gpu/${safeSlug}`, lastModified: now, priority: 0.7 });
          routes.push({ url: `${baseUrl}/gpu-performance/${safeSlug}`, lastModified: now, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/gpu-performance/${safeSlug}`, lastModified: now, priority: 0.6 });
          routes.push({ url: `${baseUrl}/gpu-recommend/${safeSlug}`, lastModified: now, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/gpu-recommend/${safeSlug}`, lastModified: now, priority: 0.6 });
          coreGames.forEach(gm => {
              routes.push({ url: `${baseUrl}/gpu-fps/${safeSlug}/${gm}`, lastModified: now, priority: 0.7 });
              routes.push({ url: `${baseUrl}/en/gpu-fps/${safeSlug}/${gm}`, lastModified: now, priority: 0.6 });
          });
      });

      [...(cpuUpg?.data || [])].forEach(u => {
          if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastModified: now, priority: 0.6 });
          if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastModified: now, priority: 0.5 });
      });
      [...(gpuUpg?.data || [])].forEach(u => {
          if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastModified: now, priority: 0.6 });
          if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastModified: now, priority: 0.5 });
      });
      [...(cpuDuels?.data || [])].forEach(d => {
          if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastModified: now, priority: 0.6 });
          if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastModified: now, priority: 0.5 });
      });
      [...(gpuDuels?.data || [])].forEach(d => {
          if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastModified: now, priority: 0.6 });
          if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastModified: now, priority: 0.5 });
      });

      return routes;
    }

    // ====================================================================
    // 📌 ID > 0: MEGA BOTTLENECK CLUSTER
    // ====================================================================
    const limit = 2
    const offset = (currentId - 1) * limit

    const { data: cpus } = await supabase
      .from('cpus')
      .select('name,slug')
      .range(offset, offset + limit - 1)

    // Fail-safe
    if (!cpus?.length) {
      return [{ url: baseUrl, lastModified: now }]
    }

    const [gpusRes, gamesRes] = await Promise.all([
      supabase.from('gpus').select('name,slug'),
      supabase.from('games').select('slug')
    ])

    const gpus = gpusRes.data || [];
    const dbGames = gamesRes?.data?.map(g => g.slug).filter(Boolean) || [];
    const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
    const resolutions = ['1080p','1440p','4k']

    cpus.forEach(cpu => {
      const cpuSlug = cpu.slug || slugify(cpu.name)

      gpus?.forEach(gpu => {
        const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name)
        if (!cpuSlug || !gpuSlug) return;

        const basePath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`

        routes.push({ url: `${baseUrl}${basePath}`, lastModified: now, priority: 0.6 })
        routes.push({ url: `${baseUrl}/en${basePath}`, lastModified: now, priority: 0.5 })

        games.forEach(game => {
          routes.push({ url: `${baseUrl}${basePath}-in-${game}`, lastModified: now, priority: 0.5 })
          routes.push({ url: `${baseUrl}/en${basePath}-in-${game}`, lastModified: now, priority: 0.4 })

          resolutions.forEach(res => {
            routes.push({ url: `${baseUrl}${basePath}-in-${game}-at-${res}`, lastModified: now, priority: 0.5 })
            routes.push({ url: `${baseUrl}/en${basePath}-in-${game}-at-${res}`, lastModified: now, priority: 0.4 })
          })
        })
      })
    })

    if (routes.length === 0) {
      routes.push({ url: baseUrl, lastModified: now });
    }

    return routes

  } catch {
    return [{ url: baseUrl, lastModified: now }]
  }
}
