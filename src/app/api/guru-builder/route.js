import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { budget } = await req.json();
    const budgetNum = Number(budget);

    // Načtení komponent z tvé tabulky
    const { data: dbComponents, error: dbError } = await supabase.from('components').select('*');
    if (dbError) throw dbError;

    // Funkce, která vezme cenu z DB, nebo tvoji pevnou cenu, pokud je v DB 0 nebo blbost
    const getComp = (name, backupPrice) => {
      const c = dbComponents.find(item => item.name === name);
      const finalPrice = (c && c.price > 1000) ? c.price : backupPrice;
      return { ...c, price: finalPrice };
    };

    // TVŮJ BETONOVÝ ZÁKLAD (Pevné ceny jako pojistka proti nule v DB)
    let build = {
      gpu: getComp('GIGABYTE GeForce RTX 5070 EAGLE OC 12G', 17390),
      cpu: getComp('AMD Ryzen 7 7700', 6290),
      mb: getComp('MSI MAG B850 TOMAHAWK WIFI', 5499),
      ram: getComp('Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30', 2899),
      ssd: getComp('Samsung 990 PRO 2TB', 4899),
      psu: getComp('Seasonic Core GX-650 ATX 3.1', 2199)
    };

    const getPartsPrice = (b) => b.gpu.price + b.cpu.price + b.mb.price + b.ram.price + b.ssd.price;
    let budgetLeft = budgetNum - (getPartsPrice(build) + build.psu.price);

    // UPGRADY (Pevné ceny pro případ, že v DB je u 5090/5080 pořád nula)
    const gpu5090 = getComp('GIGABYTE GeForce RTX 5090 GAMING OC 32G', 54990);
    const gpu5080 = getComp('GIGABYTE GeForce RTX 5080 GAMING OC 16G', 31990);
    if (budgetLeft >= (gpu5090.price - build.gpu.price)) {
      build.gpu = gpu5090;
      budgetLeft -= (gpu5090.price - build.gpu.price);
    } else if (budgetLeft >= (gpu5080.price - build.gpu.price)) {
      build.gpu = gpu5080;
      budgetLeft -= (gpu5080.price - build.gpu.price);
    }

    const cpu9800 = getComp('AMD Ryzen 7 9800X3D', 12990);
    if (budgetLeft >= (cpu9800.price - build.cpu.price)) {
      build.cpu = cpu9800;
      budgetLeft -= (cpu9800.price - build.cpu.price);
    }

    // Výpočet zdroje
    const reqPwr = (build.cpu.tdp || 65) + (build.gpu.tgp || 250) + 100;
    if (reqPwr > 850) build.psu = getComp('Seasonic Vertex GX-1000 ATX 3.0', 4990);
    else if (reqPwr > 650) build.psu = getComp('Seasonic Focus GX-850 ATX 3.0', 3490);
    else build.psu = getComp('Seasonic Core GX-650 ATX 3.1', 2199);

    const finalTotal = getPartsPrice(build) + build.psu.price;
    const slug = `guru-sestava-${budget}-${Date.now()}`;

    // ULOŽENÍ (Včetně povinného 'usage')
    const { error: insertError } = await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${finalTotal.toLocaleString()} Kč`,
      budget: budget,
      usage: "Gaming", // FIX: Tohle tam musí být!
      components: Object.keys(build).map(key => ({
        part: key.toUpperCase(),
        name: build[key].name,
        price: build[key].price,
        link: build[key].product_url
      })),
      total_price: finalTotal,
      content: "Sestava sestavená podle aktuálních skladových cen.",
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]);

    if (insertError) throw insertError;
    return NextResponse.json({ success: true, url: `/sestavy/${slug}` });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
