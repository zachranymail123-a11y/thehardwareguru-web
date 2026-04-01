const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// 1. Inicializace Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Google Klíče
const keys = JSON.parse(process.env.GOOGLE_JSON_KEY);
const jwtClient = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  ['https://www.googleapis.com/auth/indexing'],
  null
);

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 3. Hlavní engine
async function runGuruIndexer() {
    console.log('🚀 Startuji GURU Indexing Engine přes GitHub Actions...');
    
    const { data: cpus, error: cpuErr } = await supabase.from('cpus').select('name, slug').order('performance_index', { ascending: false }).limit(20);
    const { data: gpus, error: gpuErr } = await supabase.from('gpus').select('name, slug').order('performance_index', { ascending: false }).limit(20);

    if (cpuErr || gpuErr || !cpus || !gpus) {
        console.error('❌ Chyba při načítání DB:', cpuErr || gpuErr);
        return;
    }

    console.log(`📊 Načteno ${cpus.length} CPU a ${gpus.length} GPU z databáze.`);

    let urlsToIndex = [];

    // Ošetření: Použije jen tolik HW, kolik reálně v DB je
    const cpuLimit = Math.min(10, cpus.length);
    const gpuLimit = Math.min(10, gpus.length);

    for (let i = 0; i < cpuLimit; i++) {
        for (let j = 0; j < gpuLimit; j++) {
            const cpuSlug = cpus[i].slug || slugify(cpus[i].name);
            const gpuSlug = gpus[j].slug || slugify(gpus[j].name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            urlsToIndex.push(`https://thehardwareguru.cz/fps-kalkulacka/gta-6-predikce/${cpuSlug}-vs-${gpuSlug}-1440p`);
        }
    }

    // Ošetření pro druhou smyčku (Bottleneck)
    const cpuLimit2 = Math.min(20, cpus.length);
    const gpuLimit2 = Math.min(20, gpus.length);

    for (let i = 10; i < cpuLimit2; i++) {
        for (let j = 10; j < gpuLimit2; j++) {
            const cpuSlug = cpus[i].slug || slugify(cpus[i].name);
            const gpuSlug = gpus[j].slug || slugify(gpus[j].name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            urlsToIndex.push(`https://thehardwareguru.cz/bottleneck/${cpuSlug}-with-${gpuSlug}-in-cyberpunk-2077-at-1440p`);
        }
    }

    urlsToIndex = urlsToIndex.slice(0, 200);
    console.log(`📦 Vygenerováno ${urlsToIndex.length} VIP adres pro Google.`);

    if (urlsToIndex.length === 0) {
        console.log('⚠️ Žádné adresy k odeslání. Nemáš prázdnou databázi?');
        return;
    }

    await jwtClient.authorize();
    const indexing = google.indexing('v3');

    let successCount = 0;
    let errorCount = 0;

    for (const url of urlsToIndex) {
        try {
            await indexing.urlNotifications.publish({
                auth: jwtClient,
                requestBody: { url: url, type: 'URL_UPDATED' }
            });
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

// Spuštění s tvrdým zachycením pádů
runGuruIndexer().catch(err => {
    console.error('🔥 KRITICKÁ CHYBA SKRIPTU:', err);
    process.exit(1); // Donutí GitHub zahlásit chybu červeně
});
