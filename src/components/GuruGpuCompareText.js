import React from 'react';
import { Info, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function GuruGpuCompareText({ 
  gpu1Name, 
  gpu2Name, 
  perfDiff = 0, 
  gpu1Vram = 0, 
  gpu2Vram = 0, 
  isEn = false 
}) {
  
  // Ošetření dat
  const diff = Math.abs(Math.round(Number(perfDiff) || 0));
  const v1 = Number(gpu1Vram) || 0;
  const v2 = Number(gpu2Vram) || 0;
  
  const isGpu1Better = Number(perfDiff) < 0; // Pokud je diff negativní, GPU1 je lepší
  const winnerGpu = isGpu1Better ? gpu1Name : gpu2Name;
  const loserGpu = isGpu1Better ? gpu2Name : gpu1Name;

  // 1. ODSTAVEC: Jádro výkonu (Performance Analysis)
  const renderPerformance = () => {
    if (diff < 5) {
      return isEn 
        ? `When comparing the ${gpu1Name} and ${gpu2Name}, we are looking at two highly competitive graphics cards with almost identical raw processing power. The performance difference in modern gaming is practically negligible, making both cards a solid choice depending on their current market price.`
        : `Při srovnání grafických karet ${gpu1Name} a ${gpu2Name} vidíme dva extrémně vyrovnané soupeře s téměř totožným hrubým výkonem. Rozdíl ve snímkové frekvenci je v moderních hrách zanedbatelný, což znamená, že obě karty představují skvělou volbu – rozhodovat by měla především jejich aktuální pořizovací cena.`;
    } 
    
    return isEn
      ? `In terms of raw gaming performance, the ${winnerGpu} takes a clear lead, offering roughly ${diff}% more processing power compared to the ${loserGpu}. This performance gap will be noticeably visible in high-fidelity titles, providing higher framerates and a smoother overall gaming experience.`
      : `Z hlediska čistého herního výkonu je jasným vítězem ${winnerGpu}, který nabízí zhruba o ${diff} % vyšší výpočetní sílu než ${loserGpu}. Tento výkonnostní náskok jasně pocítíte u graficky náročných AAA titulů, kde vám silnější karta zajistí znatelně vyšší a stabilnější FPS.`;
  };

  // 2. ODSTAVEC: Analýza paměti (VRAM Analysis)
  const renderVram = () => {
    if (v1 === 0 || v2 === 0) return null; // Pokud chybí data, odstavec se nevykreslí
    
    if (v1 === v2) {
      return isEn
        ? `Both cards are equipped with ${v1}GB of VRAM. This frame buffer is currently the standard for this performance tier, allowing for high-resolution textures without causing severe stuttering or asset pop-in.`
        : `Obě karty disponují shodnou kapacitou videopaměti (${v1} GB VRAM). Tento frame buffer je pro tuto výkonnostní třídu standardem a bez problémů zvládne načítání detailních textur bez nepříjemného trhání obrazu.`;
    }

    const higherVram = v1 > v2 ? v1 : v2;
    const lowerVram = v1 > v2 ? v2 : v1;
    const vramWinner = v1 > v2 ? gpu1Name : gpu2Name;
    
    return isEn
      ? `Memory capacity is another crucial factor. The ${vramWinner} features a larger ${higherVram}GB frame buffer compared to the ${lowerVram}GB found on its competitor. This extra VRAM provides significant future-proofing, especially for gaming at 1440p or 4K resolutions with ultra textures enabled.`
      : `Kapacita videopaměti je dalším klíčovým faktorem tohoto duelu. Model ${vramWinner} nabízí podstatně větší frame buffer o velikosti ${higherVram} GB oproti ${lowerVram} GB u svého soupeře. Tato extra paměť znamená obrovskou výhodu do budoucna, obzvláště pokud plánujete hrát v rozlišení 1440p nebo 4K s texturami na maximum.`;
  };

  return (
    <div style={{ marginTop: '20px', lineHeight: '1.7', color: '#d1d5db', fontSize: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: `4px solid #a855f7` }}>
        <Zap color="#a855f7" size={20} />
        <span style={{ fontWeight: 'bold', color: '#fff' }}>
          {isEn ? 'Hardware Guru Deep Dive Analysis' : 'Hloubková analýza Hardware Guru'}
        </span>
      </div>
      
      <p style={{ marginBottom: '15px' }}>{renderPerformance()}</p>
      {renderVram() && <p style={{ marginBottom: '15px' }}>{renderVram()}</p>}
    </div>
  );
}
