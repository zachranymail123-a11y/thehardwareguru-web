import Link from 'next/link';

// 🔥 SEO META TAGY PRO GOOGLE INDEXACI
export const metadata = {
  title: 'Na čem jede Guru? | Můj osobní PC Build',
  description: 'Zajímá tě, na čem stříhám, streamuju a hraju? Tady je můj osobní dual-GPU stroj bez kompromisů. Podívej se na hardware, kterému věří The Hardware Guru.',
};

export default function MojePcPage() {
  return (
    // Tmavé pozadí webu sladěné s tvým designem
    <main className="min-h-screen bg-[#050505] text-gray-200 py-12 px-4 sm:px-6 lg:px-8 font-sans" style={{ backgroundImage: "url('/tvuj-background.jpg')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' }}>
      
      {/* Tlačítko zpět */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/" className="text-[#00e5ff] hover:text-cyan-300 font-bold flex items-center transition-colors uppercase tracking-wider text-sm">
          &larr; Zpět na hlavní stránku
        </Link>
      </div>

      {/* HLAVNÍ KARTA V TVÉM STYLU */}
      <div className="max-w-4xl mx-auto bg-[#0d131a]/95 backdrop-blur-md border border-[#164e63] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.05)]">
        
        {/* Hlavička karty */}
        <div className="text-center py-10 border-b border-[#164e63] bg-[#0b0f14]/80">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-widest uppercase">
            GURU OSOBNÍ BUILD
          </h1>
          <p className="text-[#00e5ff] font-bold text-xl mt-3 tracking-wide">
            Ultimátní Dual-GPU streaming bestie
          </p>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-sm px-4">
            Lidi se mě furt ptají, z čeho streamuju a na čem hraju. Tady to máte. Žádné kompromisy, brutální airflow a dedikovaný HW na stream. Stroj, co se nezapotí ani při tom nejtvrdším nasazení.
          </p>
        </div>

        {/* Komponenty */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* CPU & Deska */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-[#00e5ff] font-bold text-sm uppercase w-36 shrink-0">CPU & DESKA</span>
              <span className="text-gray-100 font-semibold text-lg">AMD Ryzen 7 9800X3D + Gigabyte X870E Aorus Elite</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 sm:ml-[10rem] italic border-l-2 border-gray-700 pl-3">
              "9800X3D je absolutní a neohrožený král gamingu díky 3D V-Cache. Drtí tabulky ve všech hrách. A protože potřebuju naprostou stabilitu a konektivitu, sedí to v X870E Aorus Elite s brutální napájecí kaskádou."
            </p>
          </div>

          {/* DUAL GPU */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-[#00e5ff] font-bold text-sm uppercase w-36 shrink-0">HERNÍ GPU</span>
              <span className="text-gray-100 font-semibold text-lg">MSI RTX 5070 Ti 16GB</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mt-2">
              <span className="text-[#00e5ff] font-bold text-sm uppercase w-36 shrink-0">STREAM GPU</span>
              <span className="text-gray-100 font-semibold text-lg">MSI RTX 5060</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 sm:ml-[10rem] italic border-l-2 border-gray-700 pl-3">
              "Tohle je ten pravej flex. 5070 Ti mě tahá ve hrách na Ultra s obřími FPS. Ale když zapnu stream na Kicku, veškerou zátěž na kódování videa hodím na tu druhou RTX 5060. Výsledek? Hraju, jako bych vůbec nestreamoval. Nulový FPS drop."
            </p>
          </div>

          {/* RAM & SSD */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-[#00e5ff] font-bold text-sm uppercase w-36 shrink-0">RAM & ÚLOŽIŠTĚ</span>
              <span className="text-gray-100 font-semibold text-lg">G.Skill Trident Z5 RGB 6000 CL28 + 3x Kingston KC3000 2TB</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 sm:ml-[10rem] italic border-l-2 border-gray-700 pl-3">
              "6000MHz je pro AM5 sweetspot, ale CL28 latence z toho dělá raketu. Disky? Celkem 6TB špičkového Gen4 úložiště znamená, že mám místo na všechny hry světa i záznamy ze streamů bez kompromisů na rychlosti."
            </p>
          </div>

          {/* CHLAZENÍ */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-[#00e5ff] font-bold text-sm uppercase w-36 shrink-0">CHLAZENÍ</span>
              <span className="text-gray-100 font-semibold text-lg">Arctic Liquid Freezer III 360 (Push-Pull 6x Montech)</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 sm:ml-[10rem] italic border-l-2 border-gray-700 pl-3">
              "Jsem úchyl na teploty. Pastu dávám prémiovou Noctua NT-H2. Vodník od Arcticu s mým Push-Pull modem (3 větráky skrz, 3 ven) chladí jako mrazák a můžu si dovolit nechat to běžet naprosto potichu."
            </p>
          </div>

          {/* CASE & AIRFLOW */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-[#00e5ff] font-bold text-sm uppercase w-36 shrink-0">AIRFLOW & CASE</span>
              <span className="text-gray-100 font-semibold text-lg">NZXT H7 Flow + 6x Fractal Design + 1x Be quiet!</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 sm:ml-[10rem] italic border-l-2 border-gray-700 pl-3">
              "Dvě grafiky vyrobí tunu tepla. NZXT H7 Flow je dokonalý větrný tunel. Nahoru a dolů 6x Fractal Design Aspect 12 RGB pro masivní tah, vzadu to vyfukuje vysokorychlostní 140mm Be quiet! Light Wings."
            </p>
          </div>

          {/* ZDROJ */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-[#00e5ff] font-bold text-sm uppercase w-36 shrink-0">ZDROJ</span>
              <span className="text-gray-100 font-semibold text-lg">Seasonic Focus GX-1000</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 sm:ml-[10rem] italic border-l-2 border-gray-700 pl-3">
              "Krmit dvě grafiky a nabušenej procesor vyžaduje brutální a čistou dodávku proudu. Seasonic je pro mě absolutní zlatý standard. S 1000W mám klidné spaní a hromadu rezervy."
            </p>
          </div>

        </div>

        {/* CTA PATIČKA - Přesná kopie tvého stylu */}
        <div className="bg-[#0b0f14] p-8 text-center border-t border-[#164e63]">
          <p className="text-[#fbbf24] text-sm font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <span>⚠️</span> REALIZACE PROBÍHÁ JAKO HOBBY PROJEKT A KOMUNITNÍ POMOC PRO DIVÁKY
          </p>
          <p className="text-gray-300 text-sm mb-6">
            Vše se řeší soukromě na Discordu. Podmínkou je <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="text-[#53FC18] font-bold hover:underline">SUBSCRIBE NA KICKU 💚</a>
          </p>
          <a 
            href="https://discord.com/invite/n7xThr8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold py-4 px-10 rounded transition-colors uppercase tracking-wider text-center"
          >
            DOMLUVIT STAVBU NA DISCORDU 🛠️
          </a>
        </div>

      </div>
    </main>
  );
}
