import { DRAM_DB } from './dram-db';

export function getChip(type, vendor, model) {
  return DRAM_DB[type]?.[vendor]?.[model] || null;
}

function getRankPenalty(rank) {
  return rank === "2R" ? 1 : 0;
}

function getRankTRFCScale(rank) {
  return rank === "2R" ? 1.15 : 1;
}

function getDynamicCL(chip, mt, arch) {
  let cl = chip.timings.minCL;
  if (arch === "ddr5") {
    if (mt >= 8000) cl += 3;
    else if (mt >= 7200) cl += 2;
    else if (mt >= 6400) cl += 1;
  } else if (arch === "ddr4") {
    if (mt >= 4400) cl += 3;
    else if (mt >= 4000) cl += 2;
  }
  return cl;
}

function getDynamicOffset(baseOffset, mt, arch) {
  let extra = 0;
  if (arch === 'ddr5') {
    if (mt >= 8000) extra = 3;
    else if (mt >= 7200) extra = 2;
    else if (mt >= 6400) extra = 1;
  } else if (arch === 'ddr4') {
    if (mt >= 4400) extra = 2;
    else if (mt >= 4000) extra = 1;
  }
  return baseOffset + extra;
}

export function generateTimings(chip, mt, arch, rank) {
  if (!chip || !chip.timings) return null;
  
  const baseCL = getDynamicCL(chip, mt, arch);
  const baseOffset = chip.timings.trcdOffset || 0;
  const dynamicOffset = getDynamicOffset(baseOffset, mt, arch);
  const rankPenalty = getRankPenalty(rank);

  const trcd = baseCL + dynamicOffset + rankPenalty;
  const trp = baseCL + (chip.timings.trpOffset !== undefined ? chip.timings.trpOffset : baseOffset) + (dynamicOffset - baseOffset) + rankPenalty;
  const tras = trcd + trp;
  
  // Finální fix: Porovnáváme s dynamickou baseline, ne se statickým minimem
  const isLoosened = trcd > (baseCL + dynamicOffset); 
  
  return { cl: baseCL, trcd, trp, tras, isLoosened };
}

export function generateSecondary(chip, mt, arch, rank) {
  if (!chip || !chip.secondary || !mt) return null;
  
  const baseFreq = arch === 'ddr4' ? 3200 : 6000;
  let mtScale = mt / baseFreq;

  let trfcScale = mtScale;
  if (chip.density === "16Gb") trfcScale *= 1.1;
  if (chip.density === "8Gb") trfcScale *= 0.9;
  if (chip.scaling === "low") trfcScale *= 1.15;
  if (chip.scaling === "medium") trfcScale *= 1.05;
  trfcScale *= getRankTRFCScale(rank);

  let tfawScale = mtScale;
  if (chip.density === "16Gb") tfawScale *= 1.05;
  if (rank === "2R") tfawScale *= 1.05;
  // Zjemněný scaling tier pro tFAW
  if (chip.scaling === "low") tfawScale *= 1.08;
  if (chip.scaling === "medium") tfawScale *= 1.04;

  const trfc = Math.round(chip.secondary.trfcBase * trfcScale);
  const tfaw = chip.secondary.tfawBase ? Math.round(chip.secondary.tfawBase * tfawScale) : '-';
  
  return { 
    trfc, 
    tfaw, 
    trefiDefault: chip.secondary.trefi?.default || '-', 
    trefiMax: chip.secondary.trefi?.max || '-' 
  };
}

export function ns(timing, mt) {
  if (!timing || !mt) return 0;
  return Number(((timing * 2000) / mt).toFixed(2));
}

export function calculateCompositeLatency(cl, trcd, trp, trfc, mt) {
  const cl_ns = ns(cl, mt);
  const trcd_ns = ns(trcd, mt);
  const trp_ns = ns(trp, mt);
  const trfc_ns = ns(trfc, mt);
  
  let trfcWeight = mt > 6400 ? 0.18 : 0.15;
  let clWeight = mt > 6400 ? 0.42 : 0.45;

  const score = (cl_ns * clWeight) + (trcd_ns * 0.2) + (trp_ns * 0.2) + (trfc_ns * trfcWeight);
  return Number(score.toFixed(2));
}

// Logaritmický model efektivity (realističtější dopad tRFC)
export function getEfficiency(mt, latencyScore, trfc) {
  if (!latencyScore || latencyScore === 0) return 0;
  let trfcPenalty = trfc ? 1 + (Math.log(trfc) * 0.05) : 1; 
  return Number(((mt / latencyScore) / trfcPenalty).toFixed(2));
}

export function getDynamicVoltage(chip, mt, arch) {
  let base = chip.voltage.daily;
  if (arch === 'ddr5') {
    if (mt > 7600) base += 0.10;
    else if (mt > 7000) base += 0.05;
  } else if (arch === 'ddr4') {
    if (mt > 4000) base += 0.05;
  }
  // Soft cap podle databáze
  return Math.min(base, chip.voltage.max);
}

export function getSweetspotStatus(chip, mt) {
  const [min, max] = chip.behavior.sweetspot;
  if (mt < min) return { id: "below", msg: "Pod limitem (Neefektivní)" };
  if (mt > max) return { id: "above", msg: "Za sweetspotem (Zátěž IMC)" };
  return { id: "optimal", msg: "Optimální frekvence" };
}

// Deterministická variance (Seedovaná inputem)
function getVariance(mt, cl) {
  const seed = mt + cl;
  const x = Math.sin(seed) * 10000;
  const pseudo = x - Math.floor(x);
  return (pseudo * 4) - 2; // Rozsah -2 až +2
}

function getImcPenalty(mt, arch) {
  let penalty = 0;
  if (arch === 'ddr5' && mt > 6400) {
    let over = mt - 6400;
    penalty = Math.pow(over / 120, 1.2) * 1.2;
  }
  if (arch === 'ddr4' && mt > 3600) {
    let over = mt - 3600;
    penalty = Math.pow(over / 120, 1.2) * 1.2;
  }
  return Math.min(penalty, 50); 
}

export function calculateStability(chip, mt, currentCL, rank, arch) {
  let score = 100;
  const [min, max] = chip.behavior.sweetspot;

  if (mt < min) score -= 5;

  if (mt > max) {
    const over = mt - max;
    const scaleMap = { extreme: 0, high: 5, medium: 10, low: 20 };
    const penaltyPerStep = scaleMap[chip.scaling];
    const stepSize = arch === 'ddr5' ? 400 : 200;
    
    score -= Math.ceil(over / stepSize) * penaltyPerStep;
    if (rank === "2R") score -= 15;
  }
  
  if (currentCL < chip.timings.minCL) {
    const clDiff = chip.timings.minCL - currentCL;
    const clPenalty = chip.scaling === 'low' ? 25 : (chip.scaling === 'medium' ? 20 : 15);
    score -= clDiff * clPenalty;
  }

  score -= getImcPenalty(mt, arch);
  score += getVariance(mt, currentCL);

  return Math.max(0, Math.min(100, Math.round(score)));
}
