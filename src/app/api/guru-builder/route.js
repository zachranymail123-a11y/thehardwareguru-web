import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { budget } = await req.json();
    const budgetNum = Number(budget);

    // 1. Vytáhneme čerstvá data z DB (kde už máš ceny v pořádku)
    const { data: dbComponents, error: dbError } = await supabase
      .from('components')
      .select('*');

    if (dbError) throw dbError;

    const getComp = (name) => dbComponents.find(c => c.name === name);

    // 2. Tvůj betonový základ
    let build = {
      gpu: getComp('GIGABYTE GeForce RTX 5070 EAGLE OC 12G'),
      cpu: getComp('AMD Ryzen 7 7700'),
      mb: getComp('MSI MAG B850 TOMAHAWK WIFI'),
      ram: getComp('Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30'),
      ssd: getComp('Samsung 990 PRO 2TB'),
      psu: getComp('Seasonic Core GX-650 ATX 3.1')
    };

    const getPartsPrice = (b) => b.gpu.price + b.cpu.price + b.mb.price + b.ram.price + b.ssd.price;
    let budgetLeft = budgetNum - (getPartsPrice(build) + build.psu.price);

    // 3. Matematický upgrade (GPU -> CPU -> MB -> RAM)
    const gpu5090 = getComp('GIGABYTE GeForce RTX 5090 GAMING OC 32G');
    const gpu5080 = getComp('GIGABYTE GeForce RTX 5080 GAMING OC 16G');
    
    if (budgetLeft >= (gpu5090.price - build.gpu.price)) {
      build.gpu = gpu5090;
      budgetLeft -= (gpu5090.price - build.gpu.price);
    } else if (budgetLeft >= (gpu5080.price - build.gpu.price)) {
      build.gpu = gpu5080;
      budgetLeft -= (gpu5080.price - build.gpu.price);
    }

    const cpu9800 = getComp('AMD Ryzen 7 9800X3D');
    if (budgetLeft >= (cpu9800.price - build.cpu.price)) {
      build.cpu = cpu9800;
      budgetLeft -= (cpu9800.price - build.cpu.price);
    }

    const mbX870 = getComp('MSI MPG X870E CARBON WIFI');
    if (budgetLeft >= (mbX870.price - build.mb.price)) {
      build.mb = mbX870;
      budgetLeft -= (mbX870.price - build.mb.price);
    }

    const ram64 = getComp('Patriot Viper Venom 64GB KIT DDR5 6000MHz CL30');
    if (budgetLeft >= (ram64.price - build.ram.price)) {
      build.ram = ram64;
      budgetLeft -= (ram64.price - build.ram.price);
    }

    // 4. Výpočet zdroje podle tvého TDP+TGP pravidla
    const reqPwr = (build.cpu.tdp || 65) + (build.gpu.tgp || 250) + 100;
    if (reqPwr > 850) build.psu = getComp('Seasonic Vertex GX-1000 ATX 3.0');
    else if (reqPwr > 650) build.psu = getComp('Seasonic Focus GX-850 ATX 3.0');
    else build.psu = getComp('Seasonic Core GX-650 ATX 3.1');

    const finalTotal = getPartsPrice(build) + build.psu.price;
    const slug = `guru-sestava-${budget}-${Date.now()}`;

    // 5. Příprava komponent pro uložení (Včetně CASE)
    const componentsArray = [
      ...Object.keys(build).map(key => ({
        part: key.toUpperCase(),
        name: build[key].name,
        price: build[key].price,
        link: build[key].product_url
      })),
      { part: "CASE", name: "Dle vlastního výběru (Guru doporučuje Fractal Design)", price: 0, link: "https://www.alza.cz/pocitacove-skrine/18849057.htm" }
    ];

    // 6. Uložení sestavy - OPRAVENO O 'usage'
    const { error: insertError } = await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${finalTotal.toLocaleString()} Kč`,
      budget: budget,
      usage: "Gaming", // FIX: Tohle vyřeší tu SQL chybu!
      components: componentsArray,
      total_price: finalTotal,
      content: `Profesionálně odladěná herní sestava s grafikou ${build.gpu.name}.`,
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, url: `/sestavy/${slug}` });

  } catch (error) {
    console.error("BUILDER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
