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
    console.log("✅ JSON klíč z GitHubu přečten.");

    if (!keys.private_key) {
        throw new Error("V JSON souboru FAKT CHYBÍ 'private_key'! Zkontroluj, cos do GitHub Secrets zkopíroval.");
    }

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
// --- KONEC BLOKU ---

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

async function runGuruIndexer() {
    console.log('🚀 Startuji 100% přesný GURU Indexing Engine s pamětí...');
    
    // 1. Stáhneme si z databáze seznam toho, co už jsme Googlu poslali
    const { data: indexedData, error: indexedErr } = await supabase.from('indexed_urls').select('url');
    if (indexedErr) {
        console.error('❌ Chyba při načítání historie odeslaných URL:', indexedErr);
        return;
    }
    
    const indexedSet = new Set(indexedData.map(row => row.url));
    console.log(`📚 V paměti nalezeno ${indexedSet.size} již dříve odeslaných adres.`);

    // 2. Načteme náš hardware z DB
    const { data: cpusRaw, error: cpuErr } = await supabase.from('cpus').select('name').order('performance_index', { ascending: false }).limit(100);
    const { data: gpusRaw, error: gpuErr } = await supabase.from('gpus').select('name').order('performance_index', { ascending: false }).limit(100);

    if (cpuErr || gpuErr || !cpusRaw || !gpusRaw) {
        console.error('❌ Chyba při načítání DB hardwaru:', cpuErr || gpuErr);
        return;
    }

    let allPossibleUrls = [];

    // 3. Vygenerujeme absolutně všechny myslitelné kombinace pro TOP 100 hardwaru
    for (let i = 0; i < cpusRaw.length; i++) {
        for (let j = 0; j < gpusRaw.length; j++) {
            const cpuSlug = slugify(cpusRaw[i].name);
            const gpuSlug = slugify(gpusRaw[j].name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            
            allPossibleUrls.push(`https://thehardwareguru.cz/fps-kalkulacka/gta-6-predikce/${cpuSlug}-vs-${gpuSlug}-1440p`);
            allPossibleUrls.push(`https://thehardwareguru.cz/bottleneck/${cpuSlug}-with-${gpuSlug}-in-cyberpunk-2077-at-1440p`);
        }
    }

    // 4. Vyfiltrujeme z nich ty, které už jsou v naší paměti (indexedSet)
    const newUrls = allPossibleUrls.filter(url => !indexedSet.has(url));

    // 5. Ořízneme to na dnešních maximálně 200 kousků
    const urlsToIndex = newUrls.slice(0, 200);

    console.log(`📦 Připraveno ${urlsToIndex.length} zcela nových adres k odeslání.`);

    if (urlsToIndex.length === 0) {
        console.log('✅ Všechny možné adresy z TOP 100 hardwaru už byly odeslány v minulosti. Dnes není co na práci.');
        return;
    }

    // 6. Odpálení do Googlu
    await jwtClient.authorize();
    const indexing = google.indexing('v3');
    let successCount = 0;
    let errorCount = 0;
    let successfullySentUrls = [];

    for (const url of urlsToIndex) {
        try {
            await indexing.urlNotifications.publish({ auth: jwtClient, requestBody: { url: url, type: 'URL_UPDATED' } });
            successCount++;
            successfullySentUrls.push({ url: url }); // Přidáme na seznam úspěšných
            console.log(`✅ [${successCount}] Odesláno: ${url}`);
            await new Promise(resolve => setTimeout(resolve, 500)); 
        } catch (err) {
            errorCount++;
            console.error(`❌ Chyba u odesílání ${url}:`, err.message);
        }
    }

    // 7. Zápis úspěšných kousků navždy do Supabase paměti
    if (successfullySentUrls.length > 0) {
        const { error: insertErr } = await supabase.from('indexed_urls').insert(successfullySentUrls);
        if (insertErr) {
            console.error('❌ Pozor, nepodařilo se zapsat odeslané adresy do databáze:', insertErr);
        } else {
            console.log(`💾 Úspěšně uloženo ${successfullySentUrls.length} adres do tabulky indexed_urls. Zítra se jim skript vyhne obloukem.`);
        }
    }

    console.log(`\n🏁 HOTOVO! Úspěšně odesláno: ${successCount} | Chyby: ${errorCount}`);
}

runGuruIndexer().catch(err => {
    console.error('🔥 KRITICKÁ CHYBA SKRIPTU:', err);
    process.exit(1);
});
