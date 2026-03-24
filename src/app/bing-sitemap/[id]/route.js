} else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            // 🚀 FIX: Vracíme na tvých originálních 5!
            const limit = 5; 
            const offset = (chunkId - 1) * limit;

            const { data: cpus } = await supabase.from('cpus').select('name').order('name').range(offset, offset + limit - 1); 
            if (!cpus || cpus.length === 0) return new Response(emptyXml, { headers: xmlHeaders });

            const [gRes, gamesRes] = await Promise.all([
                supabase.from('gpus').select('name, slug'),
                supabase.from('games').select('slug')
            ]);
            const gpus = gRes.data || [];
            const games = gamesRes.data?.map(g => g.slug).filter(Boolean) || ['cyberpunk-2077'];
            const resolutions = ['1080p', '1440p', '4k'];

            cpus.forEach(cpu => {
                const cpuSlug = slugify(cpu.name); 
                gpus.forEach(gpu => {
                    const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
                    const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
                    routes.push({ url: `${baseUrl}${pairPath}`, priority: '0.6', changefreq: 'monthly' });
                    routes.push({ url: `${baseUrl}/en${pairPath}`, priority: '0.5' });
                    games.forEach(game => {
                        routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, priority: '0.5' });
                        routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, priority: '0.4' });
                        resolutions.forEach(res => {
                            routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, priority: '0.4' });
                            routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, priority: '0.3' });
                        });
                    });
                });
            });
