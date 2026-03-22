import React from 'react';
import { Cpu } from 'lucide-react';

export default function GuruCpuCompareText({ 
  cpu1Name, 
  cpu2Name, 
  perfDiff = 0, 
  cpu1Cores = 0, 
  cpu2Cores = 0, 
  isEn = false 
}) {
  
  // Ošetření dat
  const diff = Math.abs(Math.round(Number(perfDiff) || 0));
  const c1 = Number(cpu1Cores) || 0;
  const c2 = Number(cpu2Cores) || 0;
  
  const isCpu1Better = Number(perfDiff) < 0; // Pokud je diff negativní, CPU1 je lepší
  const winnerCpu = isCpu1Better ? cpu1Name : cpu2Name;
  const loserCpu = isCpu1Better ? cpu2Name : cpu1Name;

  // 1. ODSTAVEC: Jádro výkonu (Gaming & Processing Performance)
  const renderPerformance = () => {
    if (diff < 5) {
      return isEn 
        ? `In this CPU matchup, the ${cpu1Name} and ${cpu2Name} deliver practically identical gaming performance. With a processing difference of less than 5%, you won't notice any meaningful gap in framerates. Choosing between them should come down to platform features, motherboard pricing, or specific productivity workloads.`
        : `V tomto procesorovém duelu nabízejí ${cpu1Name} i ${cpu2Name} prakticky identický herní výkon. S rozdílem menším než 5 % nepoznáte při hraní žádný znatelný rozdíl ve snímkové frekvenci. Rozhodovat by tak měla spíše cena základní desky, platforma nebo specifické pracovní nasazení.`;
    } 
    
    return isEn
      ? `When it comes to pure gaming and processing horsepower, the ${winnerCpu} clearly outperforms the ${loserCpu} by a margin of roughly ${diff}%. This performance gap is especially important for high refresh rate gaming at 1080p or 1440p, where the CPU needs to feed frames to the graphics card as fast as possible.`
      : `Pokud jde o čistý herní a výpočetní výkon, ${winnerCpu} jasně poráží model ${loserCpu} s náskokem zhruba ${diff} %. Tento výkonnostní rozdíl je klíčový zejména pro hraní s vysokou obnovovací frekvencí v rozlišení 1080p nebo 1440p, kde procesor musí krmit grafickou kartu daty co nejrychleji.`;
  };

  // 2. ODSTAVEC: Analýza jader (Cores Analysis)
  const renderCores = () => {
    if (c1 === 0 || c2 === 0) return null; // Bezpečnostní pojistka
    
    if (c1 === c2) {
      return isEn
        ? `Both processors feature a ${c1}-core architecture. This core count is a sweet spot for modern gaming, ensuring background tasks and game logic are handled smoothly without bottlenecking the system.`
        : `Oba procesory sdílejí architekturu s ${c1} jádry. Tento počet jader představuje pro moderní hraní ideální zlatou střední cestu – zajišťuje plynulý běh herní logiky i procesů na pozadí, aniž by docházelo k zasekávání celého systému.`;
    }

    const higherCores = c1 > c2 ? c1 : c2;
    const lowerCores = c1 > c2 ? c2 : c1;
    const coreWinner = c1 > c2 ? cpu1Name : cpu2Name;
    
    return isEn
      ? `Looking at multi-threaded capabilities, the ${coreWinner} brings a massive advantage with its ${higherCores} cores compared to the ${lowerCores} cores of its rival. While extra cores might not drastically boost average FPS in older titles, they provide a much smoother experience in heavy multitasking, streaming, and future CPU-intensive games.`
      : `Z pohledu vícevláknového výkonu přináší ${coreWinner} masivní výhodu díky svým ${higherCores} jádrům v porovnání s ${lowerCores} jádry konkurenta. Ačkoli jádra navíc nemusí okamžitě vystřelit průměrné FPS u starších her, poskytnou vám mnohem plynulejší zážitek při streamování, multitaskingu a hraní budoucích, na procesor náročných titulů.`;
  };

  return (
    <div style={{ marginTop: '20px', lineHeight: '1.7', color: '#d1d5db', fontSize: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: `4px solid #f59e0b` }}>
        <Cpu color="#f59e0b" size={20} />
        <span style={{ fontWeight: 'bold', color: '#fff' }}>
          {isEn ? 'Hardware Guru CPU Deep Dive' : 'Hloubková CPU analýza Guru'}
        </span>
      </div>
      
      <p style={{ marginBottom: '15px' }}>{renderPerformance()}</p>
      {renderCores() && <p style={{ marginBottom: '15px' }}>{renderCores()}</p>}
    </div>
  );
}
