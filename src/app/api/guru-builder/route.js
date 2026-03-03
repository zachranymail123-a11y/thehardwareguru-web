// ... (začátek API route zůstává) ...

    // 1. CÍLENÉ VYHLEDÁVÁNÍ CEN (Alza, Smarty, Mironet)
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz aktuální cena RTX 4000 5000 Radeon 9070 Ryzen 7000 9000 březen 2026`,
        num: 10 
      })
    });
    const searchData = await serperRes.json();

    // 2. GURU PROMPT S TVRDÝMI PRAVIDLY
    const prompt = `
      Jsi nekompromisní The Hardware Guru. Tvým úkolem je sestavit ŠPIČKOVÝ HERNÍ PC.
      Máš k dispozici tyto reálné ceny: ${JSON.stringify(searchData.organic.map(s => s.snippet))}

      STRIKTNÍ TECHNICKÁ PRAVIDLA (PORUŠENÍ = FAIL):
      1. PLATFORMA: Pouze AMD (žádný Intel!). Procesory Ryzen 7000 nebo 9000.
      2. ZÁKLADNÍ DESKY: Pouze čipsety B850, X870 nebo X870E (socket AM5).
      3. PAMĚTI: Vždy DDR5 (minimálně 6000MHz).
      4. GRAFIKA: Pouze NVIDIA RTX řady 4000 nebo 5000. Pokud AMD Radeon, tak pouze modely 9070 nebo 9070 XT.
      5. KOMPATIBILITA: Ryzen 7000/9000 NESMÍ být v desce B550/X570!

      AKTUÁLNOST:
      - Pokud v datech vidíš RTX 3060 nebo B550, IGNORUJ JE. Jsou to zastaralé nesmysly.
      - Celková cena sestavy musí být kolem ${budget} Kč.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Mašina: [Název]",
        "components": [
          {"part": "CPU", "name": "...", "price": 0},
          {"part": "Motherboard", "name": "...", "price": 0},
          {"part": "GPU", "name": "...", "price": 0},
          {"part": "RAM", "name": "...", "price": 0},
          {"part": "SSD", "name": "...", "price": 0},
          {"part": "PSU", "name": "...", "price": 0}
        ],
        "explanation": "Guru zdůvodnění výběru a potvrzení kompatibility...",
        "total_price": 0
      }
    `;

// ... (zbytek pro OpenAI a Supabase zůstává) ...
