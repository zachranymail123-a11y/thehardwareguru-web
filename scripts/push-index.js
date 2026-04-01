const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const keys = JSON.parse(process.env.GOOGLE_JSON_KEY);

// Tohle je ten neprůstřelný štít na rozbitý Google klíč z GitHubu
const privateKey = keys.private_key ? keys.private_key.replace(/\\n/g, '\n') : null;

const jwtClient = new google.auth.JWT(
  keys.client_email, null, privateKey, ['https://www.googleapis.com/auth/indexing'], null
);

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function runGuruIndexer() {
    console.log('🚀 Startuji rotující GURU Indexing Engine...');
    
    // ZDE JE TA OPRAVA: POUZE 'name'
    const { data: cpusRaw, error: cpuErr } = await supabase.from('cpus').select('name').order('performance_index', { ascending: false }).limit(100);
    const { data: gpusRaw, error: gpuErr } = await supabase.from('gpus').select('name').order('performance_index', { ascending: false }).limit(100);

    if (cpuErr || gpuErr || !cpusRaw || !gpusRaw) {
        console.error('❌ Chyba při načítání DB:', cpuErr || gpuErr);
        return;
    }

    const cpus = shuffleArray([...cpusRaw]).slice(0, 15);
    const gpus = shuffleArray([...gpusRaw]).slice(0, 15);

    console.log(`🎲 Dnešní rotace: Vybráno náhodných ${cpus.length} CPU a ${gpus.length} GPU z TOP 100.`);

    let urlsToIndex = [];

    for (let i = 0; i < cpus.length; i++) {
        for (let j = 0; j < 7; j++) {
            if (!gpus[j]) continue;
            const cpuSlug = slugify(cpus[i].name);
            const gpuSlug = slugify(gpus[j].name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            urlsToIndex.push(`https://thehardwareguru.cz/fps-kalkulacka/gta-6-predikce/${cpuSlug}-vs-${gpuSlug}-1440p`);
        }
    }

    for (let i = 0; i < cpus.length; i++) {
        for (let j = 7; j < gpus.length; j++) {
            if (!gpus[j]) continue;
            const cpuSlug = slugify(cpus[i].name);
            const gpuSlug = slugify(gpus[j].name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            urlsToIndex.push(`https://thehardwareguru.cz/bottleneck/${cpuSlug}-with-${gpuSlug}-in-cyberpunk-2077-at-1440p`);
        }
    }

    urlsToIndex = shuffleArray(urlsToIndex).slice(0, 200);
    console.log(`📦 Vygenerováno ${urlsToIndex.length} unikátních adres pro dnešní relaci.`);

    if (urlsToIndex.length === 0) return;

    await jwtClient.authorize();
    const indexing = google.indexing('v3');
    let successCount = 0;
    let errorCount = 0;

    for (const url of urlsToIndex) {
        try {
            await indexing.urlNotifications.publish({ auth: jwtClient, requestBody: { url: url, type: 'URL_UPDATED' } });
            successCount++;
            console.log(`✅ [${successCount}] Odesláno: ${url}`);
            await new Promise(resolve => setTimeout(resolve, 500)); 
        } catch (err) {
            errorCount++;
            console.error(`❌ Chyba u odesílání ${url}:`, err.message);
        }
    }
    console.log(`\n🏁 HOTOVO! Úspěšně odesláno: ${successCount} | Chyby: ${errorCount}`);
}

runGuruIndexer().catch(err => {
    console.error('🔥 KRITICKÁ CHYBA SKRIPTU:', err);
    process.exit(1);
});
