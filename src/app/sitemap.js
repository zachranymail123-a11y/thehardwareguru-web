import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V18.0 (ALL URLS & 404 FIX)
 * Cesta: src/app/sitemap.js
 * 🚀 CÍL: 100% pokrytí VŠECH adres bez umělých limitů. 
 * 🛡️ FIX 1: Dynamický výpočet počtu sitemáp na základě reálného počtu CPU v databázi. 
 * 🛡️ FIX 2: Pokud je chunk prázdný, vrací kořenovou URL, aby Next.js nehodil chybu 404.
 * 🛡️ FIX 3: Plně optimalizované dotazy pro Supabase, aby nedošlo k přetížení paměti.
 */

export const revalidate = 86400; // Sitemapa se obnoví každých 24 hodin

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://thehardwareguru.cz';

// 🚀 GURU: Dynamicky zjistíme, kolik sitemáp reálně potřebujeme
export async function generateSitemaps() {
  try {
    const { count } = await supabase.from('cpus').select('*', { count: 'exact', head: true });
    const cpuCount = count || 100; // Záchrana, pokud dotaz selže
    
    // Na jednu sitemapu dáme 2 procesory.
    // 2 CPU * (cca 50 GPU) * (8 her) * (3 rozlišení + base) = ~2 600 URL v jedné sitemapě. (Extrémně bezpečné pro limity Googlu)
    const chunks = Math.ceil(cpuCount / 2);
    
    const sitemaps = [{ id: 0 }]; // ID 0 je pro články, profily a statické stránky
    for (let i = 1; i <= chunks; i++) {
      sitemaps.push({ id: i });
    }
    return sitemaps;
  } catch (error) {
    // Pokud selže výpočet, vrátíme fallback mapy
    return Array.from({ length: 20 }, (_, i) => ({ id: i }));
  }
}

// 🛡️ Bezpečný slugify fallback
const slugify = (text) => text ? text.toLowerCase().replace(/nvidia|amd|geforce|radeon|intel|processor|graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const cleanGpuSlug = (slug, name) => slug || slugify(name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

export default async function sitemap({ id }) {
  const currentId = parseInt(id, 10);
  const currentDate = new Date().toISOString();
  const routes = [];

  try {
    // ====================================================================
    // 📌 ID 0: STATICKÉ STRÁNKY, ČLÁNKY, PROFILY, UPGRADY A DUELY
    // ====================================================================
    if (currentId === 0) {
        const [posts, cpus, gpus, cpuUpg, gpuUpg, cpuDuels, gpuDuels] = await Promise.all([
            supabase.from('posts').select('slug'),
            supabase.from('cpus').select('name, slug'),
            supabase.from('gpus').select('name, slug'),
            supabase.from('cpu_upgrades').select('slug, slug_en'),
            supabase.from('gpu_upgrades').select('slug, slug_en'),
            supabase.from('cpu_duels').select('slug, slug_en'),
            supabase.from('gpu_duels').select('slug, slug_en')
        ]);

        // Statické stránky
        const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support'];
        staticPaths.forEach(p => {
            routes.push({ url: `${baseUrl}${p}`, lastModified: currentDate, priority: 1.0 });
            routes.push({ url: `${baseUrl}/en${p}`, lastModified: currentDate, priority: 0.9 });
        });

        // Články
        posts?.data?.forEach(p => {
            if (p.slug) {
                routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastModified: currentDate, priority: 0.8 });
                routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastModified: currentDate, priority: 0.7 });
            }
        });

        const coreGames = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

        // CPU Profily a jejich FPS
        cpus?.data?.forEach(c => {
            const safeSlug = c.slug || slugify(c.name);
            if (!safeSlug) return;
            routes.push({ url: `${baseUrl}/cpu/${safeSlug}`, lastModified: currentDate, priority: 0.8 });
            routes.push({ url: `${baseUrl}/en/cpu/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
            routes.push({ url: `${baseUrl}/cpu-performance/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
            routes.push({ url: `${baseUrl}/en/cpu-performance/${safeSlug}`, lastModified: currentDate, priority: 0.6 });
            routes.push({ url: `${baseUrl}/cpu-recommend/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
            routes.push({ url: `${baseUrl}/en/cpu-recommend/${safeSlug}`, lastModified: currentDate, priority: 0.6 });
            
            coreGames.forEach(gm => {
                routes.push({ url: `${baseUrl}/cpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.7 });
                routes.push({ url: `${baseUrl}/en/cpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.6 });
            });
        });

        // GPU Profily a jejich FPS
        gpus?.data?.forEach(g => {
            const safeSlug = cleanGpuSlug(g.slug, g.name);
            if (!safeSlug) return;
            routes.push({ url: `${baseUrl}/gpu/${safeSlug}`, lastModified: currentDate, priority: 0.8 });
            routes.push({ url: `${baseUrl}/en/gpu/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
            routes.push({ url: `${baseUrl}/gpu-performance/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
            routes.push({ url: `${baseUrl}/en/gpu-performance/${safeSlug}`, lastModified: currentDate, priority: 0.6 });
            routes.push({ url: `${baseUrl}/gpu-recommend/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
            routes.push({ url: `${baseUrl}/en/gpu-recommend/${safeSlug}`, lastModified: currentDate, priority: 0.6 });

            coreGames.forEach(gm => {
                routes.push({ url: `${baseUrl}/gpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.7 });
                routes.push({ url: `${baseUrl}/en/gpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.6 });
            });
        });

        // Duely a Upgrady
        [...(cpuUpg?.data || [])].forEach(u => {
            if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastModified: currentDate, priority: 0.6 });
            if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastModified: currentDate, priority: 0.5 });
        });
        [...(gpuUpg?.data || [])].forEach(u => {
            if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastModified: currentDate, priority: 0.6 });
            if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastModified: currentDate, priority: 0.5 });
        });
        [...(cpuDuels?.data || [])].forEach(d => {
            if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastModified: currentDate, priority: 0.6 });
            if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastModified: currentDate, priority: 0.5 });
        });
        [...(gpuDuels?.data || [])].forEach(d => {
            if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastModified: currentDate, priority: 0.6 });
            if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastModified: currentDate, priority: 0.5 });
        });

        return routes;
    }

    // ====================================================================
    // 📌 ID > 0: MEGA BOTTLENECK CLUSTER (VŠECHNA CPU, GPU, HRY, ROZLIŠENÍ)
    // ====================================================================
    if (currentId > 0) {
        const limit = 2; 
        const offset = (currentId - 1) * limit;

        // Vytáhneme POUZE ty CPU, které patří do tohoto ID (Chrání paměť serveru)
        const cpusRes = await supabase.from('cpus').select('name, slug').order('performance_index', { ascending: false }).range(offset, offset + limit - 1);
        
        // Záchranná brzda proti 404 prázdnému poli
        if (!cpusRes.data || cpusRes.data.length === 0) {
            return [{ url: baseUrl, lastModified: currentDate }];
        }

        // Vytáhneme kompletně všechny grafiky a hry v DB
        const [gpusRes, gamesRes] = await Promise.all([
            supabase.from('gpus').select('name, slug'),
            supabase.from('games').select('slug')
        ]);

        const gpus = gpusRes.data || [];
        const dbGames = gamesRes?.data?.map(g => g.slug).filter(Boolean) || [];
        const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'fortnite', 'starfield', 'cs2', 'rdr2', 'alan-wake-2', 'hogwarts-legacy'];
        const resolutions = ['1080p', '1440p', '4k'];

        // Generování masivní matice všech kombinací
        cpusRes.data.forEach(c => {
            gpus.forEach(g => {
                const safeCpuSlug = c.slug || slugify(c.name);
                const safeGpuSlug = cleanGpuSlug(g.slug, g.name);
                if (!safeCpuSlug || !safeGpuSlug) return;

                const pairPath = `/bottleneck/${safeCpuSlug}-with-${safeGpuSlug}`;
                
                // Základní bottleneck
                routes.push({ url: `${baseUrl}${pairPath}`, lastModified: currentDate, priority: 0.6 });
                routes.push({ url: `${baseUrl}/en${pairPath}`, lastModified: currentDate, priority: 0.5 });
                
                games.forEach(game => {
                    // Hra (bez rozlišení)
                    routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.5 });
                    routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.4 });

                    // Rozlišení
                    resolutions.forEach(res => {
                        routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, lastModified: currentDate, priority: 0.5 });
                        routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, lastModified: currentDate, priority: 0.4 });
                    });
                });
            });
        });

        // Finální pojistka proti chybě 404
        if (routes.length === 0) routes.push({ url: baseUrl, lastModified: currentDate });
        return routes;
    }

  } catch (error) {
    console.error("GURU SITEMAP ENGINE CRASH:", error);
    // Jakákoliv chyba by sitemapu zničila - pošleme alespoň kořen ať to nespadne do 404
    return [{ url: baseUrl, lastModified: new Date().toISOString() }];
  }
}
