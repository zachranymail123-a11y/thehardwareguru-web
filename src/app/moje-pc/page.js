import Link from 'next/link';

// 🔥 SEO META TAGY PRO GOOGLE INDEXACI (zachováno)
export const metadata = {
  title: 'Na čem jede Guru? | Můj osobní PC Build',
  description: 'Zajímá tě, na čem stříhám, streamuju a hraju? Tady je můj osobní dual-GPU stroj bez kompromisů. Podívej se na hardware, kterému věří The Hardware Guru.',
};

export default function MojePcPage() {
  return (
    <main className="min-h-screen bg-black text-gray-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Tlačítko zpět */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/" className="text-purple-500 hover:text-purple-400 font-bold flex items-center transition-colors">
          <span>&larr; Zpět na hlavní stránku</span>
        </Link>
      </div>

      <section className="max-w-5xl mx-auto p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-12">
          {/* Styl nadpisu stejný jako na ostatních stránkách */}
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl uppercase border-b-2 border-cyan-500 pb-2 inline-block">
            Na čem jede Guru?
          </h1>
          <p className="mt-6 text-xl text-gray-400">
            Lidi se mě furt ptají, z čeho streamuju a na čem hraju. Tady to máte. Žádné kompromisy, brutální airflow a dedikovaný HW na stream. Stroj, co se nezapotí ani při tom nejtvrdším nasazení.
          </p>
        </div>

        <div className="space-y-6">
          {/* PROCESOR A DESKA - stylováno jako ohraničená karta */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
              <span className="text-red-500 mr-2">CPU & DESKA:</span> AMD Ryzen 7 9800X3D + Gigabyte X870E Aorus Elite
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Proč to tak je:</strong> 9800X3D je absolutní a neohrožený král gamingu díky 3D V-Cache. Drtí tabulky ve všech hrách. A protože potřebuju naprostou stabilitu a konektivitu pro hromadu disků, sedí to v X870E Aorus Elite s brutální napájecí kaskádou.
            </p>
          </div>

          {/* DUAL GPU SETUP - stylováno jako ohraničená karta */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
              <span className="text-green-500 mr-2">DUAL GPU:</span> MSI RTX 5070 Ti 16GB (Hry) + MSI RTX 5060 (Stream)
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Proč to tak je:</strong> Tohle je ten pravej flex. 5070 Ti s 16GB VRAM mě tahá ve hrách na Ultra detaily s obrovskými FPS. Ale když zapnu stream na Kicku, veškerou zátěž na kódování (Encode) videa hodím na tu druhou RTX 5060. Výsledek? Hraju, jako bych vůbec nestreamoval. Nulový FPS drop.
            </p>
          </div>

          {/* RAM & SSD - stylováno jako ohraničená karta */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
              <span className="text-purple-500 mr-2">PAMĚTI:</span> G.Skill Trident Z5 RGB 6000 CL28 + 3x Kingston KC3000 2TB
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Proč to tak je:</strong> 6000MHz je pro AM5 sweetspot, ale CL28 z toho dělá latencí naprostou raketu. Úplná špička. A disky? 3x Kingston KC3000 (celkem 6TB) znamená, že mám místo na všechny hry světa a záznamy ze streamů, všechno v extrémní Gen4 rychlosti a spolehlivosti.
            </p>
          </div>

          {/* CHLAZENÍ - stylováno jako ohraničená karta */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
              <span className="text-blue-500 mr-2">CHLAZENÍ:</span> Arctic Liquid Freezer III 360 ARGB (Push-Pull 6x Montech)
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Proč to tak je:</strong> Kdo mě zná, ví, že na teploty jsem úchyl. Pastu dávám prémiovou Noctua NT-H2. Vodník od Arcticu je sám o sobě bestie, ale s mým Push-Pull modem (3 větráky foukají skrz, 3 táhnou ven) to chladí jako mrazák a můžu si dovolit nechat to běžet krásně potichu.
            </p>
          </div>

          {/* SKŘÍŇ A AIRFLOW - stylováno jako ohraničená karta */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
              <span className="text-gray-400 mr-2">AIRFLOW & CASE:</span> NZXT H7 Flow + Fractal Design + Be quiet!
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Proč to tak je:</strong> Dvě grafiky vyrobí tunu tepla. NZXT H7 Flow je dokonalý větrný tunel. Nahoru a dolů jsem narval 6x Fractal Design Aspect 12 RGB PWM pro masivní tah vzduchu a vzadu to všechno okamžitě vyfukuje vysokorychlostní 140mm Be quiet! Light Wings. Hardware uvnitř má naprostý komfort.
            </p>
          </div>

          {/* ZDROJ - stylováno jako ohraničená karta */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
              <span className="text-yellow-500 mr-2">ZDROJ:</span> Seasonic Focus GX-1000
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Proč to tak je:</strong> Krmit dvě grafiky a nabušenej procesor vyžaduje brutální a hlavně čistou dodávku proudu. Seasonic je pro mě už roky absolutní zlatý standard. S 1000W mám klidné spaní a hromadu rezervy.
            </p>
          </div>
        </div>

        {/* CTA - Dotazy a Komunita - stylováno jako ohraničená karta */}
        <div className="mt-16 text-center p-8 bg-gray-950 rounded-xl border border-gray-800 shadow-inner">
          <h3 className="text-3xl font-bold text-white mb-4">Máš dotaz k mýmu buildu?</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Chceš podobnou dual-GPU bestii na profi streamování, nebo poradit s něčím normálním, abys nekoupil blbost? Od toho tu jsem. Doraž na stream nebo rovnou do naší komunity!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            {/* KICK TLAČÍTKO - Stylováno jako červené tlačítko s barvou platformy */}
            <a 
              href="https://kick.com/thehardwareguru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#53FC18] text-black font-bold rounded-lg hover:bg-[#45d113] transition-colors text-xl flex items-center justify-center border border-[#53FC18]"
            >
              <span className="mr-3">🟢</span> Sleduj mě na Kicku
            </a>
            
            {/* DISCORD TLAČÍTKO - Stylováno jako červené tlačítko s barvou platformy */}
            <a 
              href="https://discord.com/invite/n7xThr8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#5865F2] text-white font-bold rounded-lg hover:bg-[#4752C4] transition-colors text-xl flex items-center justify-center border border-[#5865F2]"
            >
              <span className="mr-3">👾</span> Připoj se na Discord
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
