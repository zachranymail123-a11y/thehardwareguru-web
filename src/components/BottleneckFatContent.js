"use client";
import React from 'react';
import { Cpu, Monitor, AlertTriangle, CheckCircle, TrendingUp, Link as LinkIcon } from 'lucide-react';

export default function BottleneckFatContent({ 
  cpuName, 
  gpuName, 
  gameName, 
  resolution, 
  bottleneckPercent, 
  bottleneckType, // Může být: 'CPU', 'GPU', 'Balanced'
  isEn = false 
}) {
  
  // 1. DYNAMICKÝ PROGRAMMATIC COPYWRITING (Generování unikátního textu)
  const generateVerdict = () => {
    let p1 = "";
    let p2 = "";

    // Logika pro první odstavec (Závisí na rozlišení a typu úzkého hrdla)
    if (bottleneckType === 'GPU') {
      p1 = isEn 
        ? `When pushing ${gameName} at ${resolution}, the visual demand skyrockets. In this scenario, your ${gpuName} is working at absolute maximum capacity, taking on the brunt of the rendering workload. `
        : `Rozlišení ${resolution} je v titulu ${gameName} pro grafické karty neúprosným testem. V tomto scénáři běží vaše ${gpuName} na absolutní maximum svých možností a bere na sebe veškerou zátěž spojenou s vykreslováním. `;
        
      if (resolution.includes('2160') || resolution.includes('4K')) {
        p1 += isEn 
          ? `4K gaming is incredibly punishing, meaning your ${cpuName} has plenty of breathing room while waiting for the graphics card to finish drawing frames.`
          : `Hraní ve 4K je extrémně náročné na grafickou paměť a čip, což znamená, že váš ${cpuName} má dostatek prostoru a v podstatě čeká, až grafika dokončí snímek.`;
      }
    } else if (bottleneckType === 'CPU') {
      p1 = isEn
        ? `At ${resolution}, the ${gpuName} is able to render frames at a blistering pace in ${gameName}. However, this creates a data bottleneck at the processor level. `
        : `Při hraní ${gameName} v rozlišení ${resolution} dokáže ${gpuName} generovat snímky neuvěřitelným tempem. To ale vytváří datovou zácpu na úrovni procesoru. `;
        
      if (resolution.includes('1080')) {
        p1 += isEn
          ? `Lower resolutions like 1080p shift the massive workload to the ${cpuName}, which struggles to feed physics and AI data to the GPU fast enough.`
          : `Nižší rozlišení jako 1080p extrémně přesouvají zátěž na ${cpuName}, který jednoduše nestíhá dostatečně rychle zásobovat grafickou kartu daty o fyzice a umělé inteligenci.`;
      }
    } else {
      p1 = isEn
        ? `The pairing of ${cpuName} and ${gpuName} running ${gameName} at ${resolution} is an engineering sweet spot. `
        : `Kombinace ${cpuName} a ${gpuName} při hraní ${gameName} v rozlišení ${resolution} představuje inženýrský ideál. `;
    }

    // Logika pro druhý odstavec (Hodnocení procenta)
    if (bottleneckPercent > 15) {
      p2 = isEn
        ? `With a calculated bottleneck of ${bottleneckPercent}%, you are leaving noticeable performance on the table. You might experience stuttering, especially in CPU-heavy scenes, or lower 1% low FPS drops.`
        : `S vypočítaným úzkým hrdlem na úrovni ${bottleneckPercent} % přicházíte o znatelný kus výkonu. V náročných scénách můžete zaznamenat záseky (stuttering) nebo výrazné propady 1% Low FPS.`;
    } else if (bottleneckPercent > 5) {
      p2 = isEn
        ? `A ${bottleneckPercent}% variance is entirely normal and highly playable. No system is perfectly balanced in every game engine, but this setup avoids severe frame drops.`
        : `Odchylka ${bottleneckPercent} % je naprosto normální a nijak neohrožuje plynulost hraní. Žádný systém není v každém herním enginu dokonale vyvážený, ale tato sestava se vyhne drastickým propadům FPS.`;
    } else {
      p2 = isEn
        ? `Achieving just ${bottleneckPercent}% variance means you have built a perfectly optimized machine for this specific workload. Every dollar spent is converting into raw frames.`
        : `Dosažení pouhé ${bottleneckPercent}% odchylky znamená, že máte perfektně optimalizovanou mašinu pro tuto zátěž. Každá investovaná koruna se zde mění v čisté snímky za vteřinu.`;
    }

    return { p1, p2 };
  };

  const { p1, p2 } = generateVerdict();

  // 2. DYNAMICKÉ TIPY (Actionable Advice pro uživatele)
  const renderTips = () => {
    if (bottleneckType === 'GPU') {
      return (
        <ul className="mt-4 space-y-3 text-sm text-gray-300">
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-purple-500 mt-0.5 shrink-0"/> <span>{isEn ? `Enable DLSS/FSR in ${gameName} on Quality or Balanced mode to relieve the GPU.` : `Zapněte DLSS/FSR v menu hry ${gameName} na režim Quality nebo Balanced pro odlehčení grafice.`}</span></li>
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-purple-500 mt-0.5 shrink-0"/> <span>{isEn ? "Lower Volumetric Fog, Shadows, and Ray Tracing settings." : "Snižte detaily volumetrické mlhy, stínů a vypněte Ray Tracing."}</span></li>
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-purple-500 mt-0.5 shrink-0"/> <span>{isEn ? `Your ${cpuName} is fine. Upgrading the CPU will NOT increase your FPS here.` : `Váš ${cpuName} je naprosto v pořádku. Upgrade procesoru vám zde FPS nezvýší.`}</span></li>
        </ul>
      );
    } else if (bottleneckType === 'CPU') {
      return (
        <ul className="mt-4 space-y-3 text-sm text-gray-300">
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-cyan-500 mt-0.5 shrink-0"/> <span>{isEn ? "Increase graphics settings! Turn on Ray Tracing to shift the load back to the GPU." : "Zvyšte grafické detaily! Zapněte Ray Tracing, abyste přesunuli zátěž zpět na grafiku."}</span></li>
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-cyan-500 mt-0.5 shrink-0"/> <span>{isEn ? "Close background apps (Discord, Chrome tabs) to free up CPU threads." : "Zavřete aplikace na pozadí (Discord, Chrome), abyste uvolnili vlákna procesoru."}</span></li>
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-cyan-500 mt-0.5 shrink-0"/> <span>{isEn ? `To get 100% out of your ${gpuName}, consider upgrading to an X3D processor.` : `Abyste vymáčkli 100 % z vaší ${gpuName}, zvažte upgrade na procesor s 3D V-Cache.`}</span></li>
        </ul>
      );
    } else {
      return (
        <ul className="mt-4 space-y-3 text-sm text-gray-300">
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0"/> <span>{isEn ? "Excellent pairing. You don't need to tweak anything." : "Vynikající kombinace. Nemusíte vůbec nic ladit."}</span></li>
          <li className="flex gap-3 items-start"><CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0"/> <span>{isEn ? "Lock your framerate to your monitor's refresh rate for the smoothest experience." : "Uzamkněte FPS na obnovovací frekvenci vašeho monitoru pro nejplynulejší zážitek."}</span></li>
        </ul>
      );
    }
  };

  // 3. VÝPOČET ZÁTĚŽE PRO VIZUÁLNÍ BAR
  const cpuLoad = bottleneckType === 'CPU' ? 100 : (100 - bottleneckPercent);
  const gpuLoad = bottleneckType === 'GPU' ? 100 : (100 - bottleneckPercent);

  return (
    <div className="w-full mt-10 mb-12">
      {/* Nadpis sekce */}
      <div className="mb-6 border-b border-white/10 pb-4">
        <h2 className="text-2xl md:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          {isEn ? "Hardware Guru Verdict & Architecture" : "Guru Verdikt & Analýza Architektury"}
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-bold uppercase tracking-wider">
          {cpuName} × {gpuName} @ {resolution}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEVÝ SLOUPEC: Textový verdikt (SEO Fat Content) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
            {/* Dekorativní glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${bottleneckType === 'GPU' ? 'bg-purple-600' : 'bg-cyan-600'}`}></div>
            
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <TrendingUp className={bottleneckType === 'GPU' ? 'text-purple-500' : 'text-cyan-500'} />
              {isEn ? "Performance Breakdown" : "Detailní rozbor výkonu"}
            </h3>
            
            <p className="text-gray-300 leading-relaxed mb-4">{p1}</p>
            <p className="text-gray-300 leading-relaxed font-semibold">{p2}</p>
          </div>

          {/* Vizuální Load Bar (Zvyšuje dobu na stránce, vypadá profi) */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              {isEn ? "Simulated Hardware Utilization" : "Simulované využití hardwaru"}
            </h4>
            
            {/* CPU Bar */}
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold flex items-center gap-2 text-white"><Cpu size={16} className="text-cyan-400"/> CPU Load</span>
                <span className="font-mono text-cyan-400">{cpuLoad.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black rounded-full h-3 border border-white/10 overflow-hidden">
                <div className="bg-cyan-500 h-3 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000" style={{ width: `${cpuLoad}%` }}></div>
              </div>
            </div>

            {/* GPU Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold flex items-center gap-2 text-white"><Monitor size={16} className="text-purple-400"/> GPU Load</span>
                <span className="font-mono text-purple-400">{gpuLoad.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black rounded-full h-3 border border-white/10 overflow-hidden">
                <div className="bg-purple-500 h-3 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" style={{ width: `${gpuLoad}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* PRAVÝ SLOUPEC: Actionable Tipy a Silo Prolinkování */}
        <div className="space-y-6">
          
          {/* Box s tipy */}
          <div className="bg-gradient-to-b from-black to-gray-900 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-3">
              <AlertTriangle size={20} className="text-yellow-500" />
              {isEn ? "Guru Optimization Tips" : "Tipy pro optimalizaci"}
            </h3>
            {renderTips()}
          </div>

          {/* SEO Silo Interní linky (Vyhledávače to milují) */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <LinkIcon size={16} />
              {isEn ? "Explore Similar Scenarios" : "Prozkoumat podobné scénáře"}
            </h3>
            <ul className="space-y-3">
              {/* Zde můžeš generovat dynamické odkazy do budoucna, ukázka: */}
              <li>
                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  {cpuName} vs {gpuName} @ {resolution === '1080p' ? '1440p' : '1080p'}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  {isEn ? "Will upgrading the GPU fix this?" : "Vyřeší tohle lepší grafická karta?"}
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
