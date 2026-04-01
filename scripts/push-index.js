const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- DETEKTIVNÍ BLOK PRO GOOGLE KLÍČ ---
let keys;
let jwtClient;
try {
    let rawKey = process.env.GOOGLE_JSON_KEY || "";
    rawKey = rawKey.trim();
    
    if (rawKey.startsWith("'") && rawKey.endsWith("'")) rawKey = rawKey.slice(1, -1);
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);

    keys = JSON.parse(rawKey);
    const privateKey = keys.private_key.replace(/\\n/g, '\n');
    
    jwtClient = new google.auth.JWT({
        email: keys.client_email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/indexing']
    });
} catch (err) {
    console.error("🔥 FATÁLNÍ CHYBA S GOOGLE KLÍČEM:", err.message);
    process.exit(1);
}

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

async function runGuruIndexer() {
    console.log('🚀 Startuji GURU Dvojitý Indexing Engine (Google + Bing)...');
    
    // 1. Zjištění historie ze Supabase
    const { data: indexedData, error: indexedErr } = await supabase.from('indexed_urls').select('url');
    if (indexedErr) {
        console.error('❌ Chyba při načítání historie odeslaných URL:', indexedErr);
        return;
    }
    const indexedSet = new Set(indexedData.map(row => row.url));
    console.log(`📚 V paměti nalezeno ${indexedSet.size} dříve odeslaných adres.`);

    // 2. Těžba dat hardwaru
    const { data: cpusRaw, error: cpuErr } = await supabase.from('cpus').select('name').order('performance_index', { ascending: false }).limit(100);
    const { data: gpusRaw, error: gpuErr } = await supabase.from('gpus').select('name').order('performance_index', { ascending: false }).limit(100);

    if (cpuErr || gpuErr || !cpusRaw || !gpusRaw) return console.error('❌ Chyba při načítání DB hardwaru:', cpuErr || gpuErr);

    let allPossibleUrls = [];

    // 3. Generování URL
    for (let i = 0; i < cpusRaw.length; i++) {
        for (let j = 0; j < gpusRaw.length; j++) {
            const cpuSlug = slugify(cpusRaw[i].name);
            const gpuSlug = slugify(gpusRaw[j].name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            allPossibleUrls.push(`https://thehardwareguru.cz/fps-kalkulacka/gta-6-predikce/${cpuSlug}-vs-${gpuSlug}-1440p`);
            allPossibleUrls.push(`https://thehardwareguru.cz/bottleneck/${cpuSlug}-with-${gpuSlug}-in-cyberpunk-2077-at-1440p`);
        }
    }

    // 4. Filtrace a ořez na dnešní dávku
    const urlsToIndex = allPossibleUrls.filter(url => !indexedSet.has(url)).slice(0, 200);

    if (urlsToIndex.length === 0) {
        return console.log('✅ Všechny dostupné adresy z TOP 100 hardwaru už byly odeslány. Dnes není co na práci.');
    }
    console.log(`📦 Připraveno ${urlsToIndex.length} zcela nových adres k odeslání.`);

    // ==========================================
    // 🎯 FÁZE 1: GOOGLE INDEXING API
    // ==========================================
    console.log('\n🔵 Odesílám do Googlu...');
    await jwtClient.authorize();
    const indexing = google.indexing('v3');
    let successCount = 0;
    let successfullySentUrls = [];

    for (const url of urlsToIndex) {
        try {
            await indexing.urlNotifications.publish({ auth: jwtClient, requestBody: { url: url, type: 'URL_UPDATED' } });
            successCount++;
            successfullySentUrls.push({ url: url });
            console.log(`✅ [Google] Odesláno: ${url}`);
            await new Promise(resolve => setTimeout(resolve, 500)); 
        } catch (err) {
            console.error(`❌ [Google] Chyba u ${url}:`, err.message);
        }
    }

    // ==========================================
    // 🎯 FÁZE 2: BING INDEXING API
    // ==========================================
    const bingApiKey = process.env.BING_API_KEY;
    if (bingApiKey) {
        console.log('\n🟢 Odesílám balík adres do Bingu...');
        try {
            const bingResponse = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${bingApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    siteUrl: "https://thehardwareguru.cz",
                    urlList: urlsToIndex
                })
            });
            const bingData = await bingResponse.json();
            
            // Bing vrací HTTP 200 a v JSONu zprávu (často jen prázdný objekt d, pokud je to OK)
            if (bingResponse.ok) {
                console.log(`✅ [Bing] Celý balík úspěšně sežrán! Limit pro zbytek dne zjistíš ve Webmaster Tools.`);
            } else {
                console.error(`❌ [Bing] Vrátil chybu:`, bingData);
            }
        } catch (err) {
            console.error(`❌ [Bing] Fatální chyba připojení:`, err.message);
        }
    } else {
        console.log('\n⚠️ BING_API_KEY nenalezen, přeskakuji Bing.');
    }

    // ==========================================
    // 💾 FÁZE 3: ZÁPIS DO SUPABASE PAMĚTI
    // ==========================================
    if (successfullySentUrls.length > 0) {
        console.log('\n💾 Ukládám progres do databáze...');
        const { error: insertErr } = await supabase.from('indexed_urls').insert(successfullySentUrls);
        if (insertErr) console.error('❌ Pozor, nepodařilo se zapsat do databáze:', insertErr);
        else console.log(`✅ Úspěšně zapsáno ${successfullySentUrls.length} adres do tabulky indexed_urls.`);
    }

    console.log(`\n🏁 HOTOVO! Všechny stroje ukončily práci.`);
}

runGuruIndexer().catch(err => {
    console.error('🔥 KRITICKÁ CHYBA SKRIPTU:', err);
    process.exit(1);
});
