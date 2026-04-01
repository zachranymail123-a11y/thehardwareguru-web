const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

async function runBingIndexer() {
    console.log('🚀 Startuji samostatný BING Indexing Engine...');
    
    // 1. Zjištění historie (Bing a Google sdílí stejnou paměť v DB)
    const { data: indexedData, error: indexedErr } = await supabase.from('indexed_urls').select('url');
    if (indexedErr) return console.error('❌ Chyba DB:', indexedErr);
    
    const indexedSet = new Set(indexedData.map(row => row.url));

    // 2. Hardware data
    const { data: cpusRaw } = await supabase.from('cpus').select('name').order('performance_index', { ascending: false }).limit(100);
    const { data: gpusRaw } = await supabase.from('gpus').select('name').order('performance_index', { ascending: false }).limit(100);

    let allPossibleUrls = [];
    for (let i = 0; i < cpusRaw.length; i++) {
        for (let j = 0; j < gpusRaw.length; j++) {
            const cpuSlug = slugify(cpusRaw[i].name);
            const gpuSlug = slugify(gpusRaw[j].name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            allPossibleUrls.push(`https://thehardwareguru.cz/fps-kalkulacka/gta-6-predikce/${cpuSlug}-vs-${gpuSlug}-1440p`);
            allPossibleUrls.push(`https://thehardwareguru.cz/bottleneck/${cpuSlug}-with-${gpuSlug}-in-cyberpunk-2077-at-1440p`);
        }
    }

    // 3. Filtrace a limit pro BING (teď 100, můžeme pak zvednout)
    const urlsToBing = allPossibleUrls.filter(url => !indexedSet.has(url)).slice(0, 100);

    if (urlsToBing.length === 0) return console.log('✅ Bing nemá co indexovat.');

    // 4. Odeslání do Bingu
    const bingApiKey = process.env.BING_API_KEY;
    console.log(`🟢 Odesílám ${urlsToBing.length} adres do Bingu...`);
    
    try {
        const response = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${bingApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                siteUrl: "https://thehardwareguru.cz",
                urlList: urlsToBing
            })
        });

        if (response.ok) {
            console.log(`✅ [Bing] Úspěšně odesláno!`);
            // Zapíšeme do DB jen ty, co Bing sežral (pokud chceme, aby je Google už nezkoušel)
            const insertData = urlsToBing.map(url => ({ url }));
            await supabase.from('indexed_urls').insert(insertData);
            console.log(`💾 Uloženo do historie.`);
        } else {
            const errData = await response.json();
            console.error(`❌ [Bing] Chyba:`, errData);
        }
    } catch (err) {
        console.error(`❌ [Bing] Fatální chyba:`, err.message);
    }
}

runBingIndexer();
