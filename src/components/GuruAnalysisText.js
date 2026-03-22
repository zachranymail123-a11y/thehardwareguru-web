import React from 'react';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function GuruAnalysisText({ 
  cpuName, 
  gpuName, 
  gameName, 
  resolution, 
  bottleneckPercent = 0, 
  isCpuBound = true, 
  fps = 0, 
  isEn = false 
}) {
  
  // Ošetření dat, aby to nespadlo
  const bnValue = Math.round(Number(bottleneckPercent) || 0);
  const fpsValue = Math.round(Number(fps) || 0);
  const safeRes = resolution || '1080p';

  // 1. ODSTAVEC: Úvodní zhodnocení (Intro)
  const renderIntro = () => {
    if (isEn) {
      return `Combining the ${cpuName} processor with the ${gpuName} graphics card creates a highly specific setup for running ${gameName} at ${safeRes} resolution. When analyzing this exact hardware pairing, we look closely at how the workloads are distributed between the processor and the graphics card to ensure you get the smoothest possible gaming experience.`;
    }
    return `Kombinace procesoru ${cpuName} a grafické karty ${gpuName} představuje velmi specifickou sestavu pro hraní titulu ${gameName} v rozlišení ${safeRes}. Při analýze tohoto hardwarového spojení se zaměřujeme především na to, jak je zátěž rozdělena mezi procesor a grafiku, abychom zjistili, zda z vaší sestavy dostáváte maximum možného výkonu.`;
  };

  // 2. ODSTAVEC: Jádro problému (Bottleneck Logic)
  const renderAnalysis = () => {
    if (bnValue < 10) {
      // Vyvážená sestava
      return isEn 
        ? `Great news! This build is incredibly well-balanced. With a bottleneck of just ${bnValue}%, neither the ${cpuName} nor the ${gpuName} is severely limiting the other. You can expect highly stable frame pacing and zero stuttering caused by hardware mismatch in ${gameName}.`
        : `Skvělá zpráva! Tato sestava je neuvěřitelně dobře vyvážená. S bottleneckem pouhých ${bnValue} % se ${cpuName} a ${gpuName} navzájem nijak zásadně nebrzdí. Ve hře ${gameName} tak můžete očekávat maximální stabilitu snímků (frame pacing) bez otravných záseků způsobených hardwarovým deficitem.`;
    } 
    
    if (isCpuBound) {
      // CPU brzdí grafiku
      return isEn
        ? `However, our tests reveal a significant CPU bottleneck of roughly ${bnValue}%. The ${cpuName} is simply not fast enough to process game logic and feed data to the ${gpuName} at ${safeRes}. Because the graphics card has to wait for the processor, you are leaving valuable performance on the table.`
        : `Naše testy však u tohoto nastavení odhalily znatelný CPU bottleneck ve výši zhruba ${bnValue} %. V praxi to znamená, že procesor ${cpuName} nestíhá dostatečně rychle zpracovávat herní logiku pro monstrózní ${gpuName}. Grafická karta se tak lidově řečeno "fláká" a čeká na data z procesoru, což vás stojí cenný výkon.`;
    } 
    
    // GPU brzdí procesor (běžné ve 4K)
    return isEn
      ? `In this scenario, we are looking at a GPU bottleneck of approximately ${bnValue}%. This is completely normal at ${safeRes}, as the ${gpuName} is pushed to its absolute limits rendering graphics, while the ${cpuName} has plenty of headroom.`
      : `V tomto scénáři narazíte na GPU bottleneck přibližně ${bnValue} %. V rozlišení ${safeRes} je to poměrně běžný jev – grafická karta ${gpuName} jede na 100 % a je hlavním limitem FPS, zatímco váš procesor ${cpuName} má ještě výkonnostní rezervu.`;
  };

  // 3. ODSTAVEC: Závěr a Guru Doporučení (Recommendation)
  const renderRecommendation = () => {
    if (bnValue < 10) {
      return isEn 
        ? `With an estimated performance of ${fpsValue} FPS, no major upgrades are needed. Just keep your drivers updated and enjoy the game!`
        : `S očekávaným výkonem kolem ${fpsValue} FPS nemusíte řešit žádný okamžitý upgrade. Vaše mašina je připravena, stačí aktualizovat ovladače a užít si hru!`;
    }

    if (isCpuBound) {
      return isEn
        ? `To get closer to the estimated ${fpsValue} FPS and reduce stuttering, consider upgrading your CPU. Alternatively, you can increase your resolution to 1440p or 4K to shift the heavy lifting back to the graphics card.`
        : `Co s tím? Abyste dosáhli čistých ${fpsValue} FPS, zvažte budoucí upgrade procesoru. Okamžitým "Guru hackem" je zvýšení rozlišení na 1440p nebo 4K (případně DSR), čímž přesunete zátěž zpět na grafickou kartu a eliminujete propady FPS.`;
    }

    return isEn
      ? `To boost your ${fpsValue} FPS, lower your in-game graphics settings or enable upscaling technologies like DLSS or FSR.`
      : `Pokud chcete navýšit aktuálních ${fpsValue} FPS, doporučujeme snížit detaily stínů a textur ve hře, nebo zapnout technologie upscalingu jako je DLSS či FSR. Vaše grafika to ocení.`;
  };

  // Určení ikony a barvy podle stavu
  const getStatusColor = () => bnValue < 10 ? '#10b981' : (isCpuBound ? '#ef4444' : '#f59e0b');
  const StatusIcon = bnValue < 10 ? CheckCircle2 : AlertTriangle;

  return (
    <div style={{ marginTop: '20px', lineHeight: '1.7', color: '#d1d5db', fontSize: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: `4px solid ${getStatusColor()}` }}>
        <StatusIcon color={getStatusColor()} size={20} />
        <span style={{ fontWeight: 'bold', color: '#fff' }}>
          {isEn ? 'Hardware Guru Deep Dive Analysis' : 'Hloubková analýza Hardware Guru'}
        </span>
      </div>
      
      <p style={{ marginBottom: '15px' }}>{renderIntro()}</p>
      <p style={{ marginBottom: '15px' }}>{renderAnalysis()}</p>
      
      <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '15px 20px', borderRadius: '16px', marginTop: '20px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>
          <Info size={16} /> {isEn ? 'Guru Recommendation' : 'Guru Doporučení'}
        </h4>
        <p style={{ margin: 0, fontWeight: '500' }}>{renderRecommendation()}</p>
      </div>
    </div>
  );
}
