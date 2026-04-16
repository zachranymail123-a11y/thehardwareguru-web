"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Activity, Zap, ShieldCheck, CheckCircle, AlertOctagon, Info, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { DRAM_DB } from '../lib/dram-db';
import { getChip, generateTimings, generateSecondary, ns, getSweetspotStatus, calculateStability, calculateCompositeLatency, getDynamicVoltage, getEfficiency } from '../lib/dram-engine';

export default function DramCalculator({ isEn }) {
  const [type, setType] = useState('ddr5');
  const [vendor, setVendor] = useState('hynix');
  const [model, setModel] = useState('A-die');
  const [rank, setRank] = useState('1R'); 
  const [mt, setMt] = useState(6000);
  const [userCL, setUserCL] = useState(26);

  const vendors = Object.keys(DRAM_DB[type] || {});
  const models = Object.keys(DRAM_DB[type]?.[vendor] || {});
  const currentChip = getChip(type, vendor, model);
  const availableRanks = currentChip?.ranks || ["1R"];

  useEffect(() => { setMt(type === 'ddr4' ? 3600 : 6000); }, [type]);
  useEffect(() => { if (!vendors.includes(vendor) && vendors.length > 0) setVendor(vendors[0]); }, [type, vendor, vendors]);
  useEffect(() => { if (!models.includes(model) && models.length > 0) setModel(models[0]); }, [vendor, type, model, models]);
  useEffect(() => {
    if (currentChip) {
        setUserCL(currentChip.timings.minCL);
        setRank("1R"); 
    }
  }, [model, vendor, type]);

  // ENGINE OPTIMIZATION: Přepočet pouze při změně vstupů
  const results = useMemo(() => {
    if (!type || !vendor || !model || mt <= 0) return null;
    const chip = getChip(type, vendor, model);
    if (!chip) return null;

    const timings = generateTimings(chip, mt, type, rank);
    const finalCL = userCL > 0 ? userCL : timings.cl;
    const finalTimings = { ...timings, cl: finalCL }; // Fix mutace

    const secondary = generateSecondary(chip, mt, type, rank);
    const latency = ns(finalCL, mt);
    const compLatency = calculateCompositeLatency(finalCL, finalTimings.trcd, finalTimings.trp, secondary.trfc, mt);
    const efficiency = getEfficiency(mt, compLatency, secondary.trfc);
    const sweetStatus = getSweetspotStatus(chip, mt);
    const stability = calculateStability(chip, mt, finalCL, rank, type);
    const dynVoltage = getDynamicVoltage(chip, mt, type);

    return { chip, timings: finalTimings, secondary, latency, compLatency, efficiency, sweetStatus, stability, dynVoltage };
  }, [type, vendor, model, mt, userCL, rank]);

  const getStabilityLabel = (score) => {
    if (score >= 90) return isEn ? "Rock Solid" : "Naprosto stabilní";
    if (score >= 75) return isEn ? "Stable" : "Stabilní";
    if (score >= 55) return isEn ? "Risky" : "Hraniční / Nestabilní";
    if (score >= 35) return isEn ? "Unstable" : "Kriticky nestabilní";
    return isEn ? "Boot Failure Likley" : "Pád systému pravděpodobný";
  };

  const getLatencyColor = (val) => {
    if (val < 55) return "#22c55e"; // Zelená
    if (val < 65) return "#facc15"; // Žlutá
    return "#ef4444"; // Červená
  };

  return (
    <div className="guru-dram-calc">
      <div className="calc-controls">
        <div className="input-group">
          <label><Cpu size={14} /> {isEn ? 'Architecture' : 'Architektura'}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="guru-select">
            {Object.keys(DRAM_DB).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label><ShieldCheck size={14} /> {isEn ? 'Vendor' : 'Výrobce'}</label>
          <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="guru-select">
            {vendors.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label><Activity size={14} /> {isEn ? 'IC Model' : 'Model čipu'}</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="guru-select">
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label><Layers size={14} /> {isEn ? 'Memory Rank' : 'Počet Ranků'}</label>
          <select value={rank} onChange={(e) => setRank(e.target.value)} className="guru-select">
            {availableRanks.map(r => <option key={r} value={r}>{r} (Single Rank)</option>)}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
            <div className="input-group" style={{ flex: 2 }}>
              <label><Zap size={14} /> {isEn ? 'Freq (MT/s)' : 'Frekvence'}</label>
              <input type="number" min="2133" max="12000" step="100" value={mt} onChange={(e) => setMt(Number(e.target.value))} className="guru-input" />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>{isEn ? 'Target CL' : 'Cílové CL'}</label>
              <input type="number" min={currentChip?.timings.minCL || 10} max="60" step="2" value={userCL} onChange={(e) => setUserCL(Number(e.target.value))} className="guru-input" />
            </div>
        </div>
      </div>

      {results && (
        <div className="results-container">
          <div className="score-board">
             <div className="latency-box">
               <span className="latency-val" style={{ color: getLatencyColor(results.compLatency) }}>{results.compLatency} ns</span>
               <span className="latency-label">{isEn ? 'True Latency Index' : 'Index skutečné latence'}</span>
               <div style={{ marginTop: '10px', fontSize: '11px', color: '#9ca3af' }}>
                   Abs. CAS: <span style={{color: '#fff'}}>{results.latency} ns</span> | {isEn ? 'Perf Rating:' : 'Rating:'} <strong style={{color: '#66fcf1'}}>{results.efficiency}</strong>
               </div>
               <div className={`sweet-badge sweet-${results.sweetStatus.id}`}>
                 <Info size={14} /> {results.sweetStatus.msg}
               </div>
             </div>
             
             <div className={`stability-box ${results.stability > 75 ? 'stab-good' : (results.stability > 40 ? 'stab-warn' : 'stab-bad')}`}>
                <div style={{ fontSize: '32px', fontWeight: '950', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {results.stability}% {results.stability > 75 ? <CheckCircle size={24} /> : <AlertOctagon size={24} />}
                </div>
                <div className="stability-bar-bg"><div className="stability-bar-fill" style={{ width: `${results.stability}%` }}></div></div>
                <span className="stability-text">{getStabilityLabel(results.stability)}</span>
                {rank === "2R" && results.stability < 100 && <div className="rank-warning">{isEn ? 'Dual Rank Penalty Active' : 'Aktivní Dual Rank penalizace'}</div>}
             </div>
          </div>

          <div className="stats-grid">
            <div className="guru-card">
              <h3>{isEn ? 'ESTIMATED TIMINGS' : 'ODHAD ČASOVÁNÍ'}</h3>
              <p className="card-data" style={{ color: results.timings.isLoosened ? '#facc15' : '#fff' }}>
                {results.timings.cl} - {results.timings.trcd} - {results.timings.trp} - {results.timings.tras}
              </p>
              <small>CL - tRCD - tRP - tRAS</small>
            </div>

            <div className="guru-card">
              <h3>{isEn ? 'SECONDARY TIMINGS' : 'SEKUNDÁRNÍ ČASOVÁNÍ'}</h3>
              <p className="card-data">{results.secondary.trfc} / {results.secondary.tfaw}</p>
              <small>tRFC (D. {results.chip.density} / {rank}) / tFAW</small>
              <div className="trefi-block">
                 <span><strong>tREFI:</strong> JEDEC: {results.secondary.trefiDefault} | Max: {results.secondary.trefiMax}</span>
              </div>
            </div>

            <div className="guru-card">
              <h3>{isEn ? 'DYNAMIC VOLTAGE' : 'DOPORUČENÉ NAPĚTÍ'}</h3>
              <p className="card-data" style={{ color: results.dynVoltage >= results.chip.voltage.max ? '#ef4444' : '#eab308' }}>
                {results.dynVoltage.toFixed(2)} V
              </p>
              <small>{isEn ? 'Safe limit:' : 'Bezpečný limit:'} <strong>{results.chip.voltage.max} V</strong></small>
              {results.dynVoltage >= results.chip.voltage.max && (
                <div className="voltage-warning"><AlertTriangle size={10} /> LIMIT REACHED</div>
              )}
            </div>

            <div className="guru-card">
              <h3>{isEn ? 'IC BEHAVIOR' : 'CHOVÁNÍ ČIPU'}</h3>
              <p className="card-data" style={{ color: '#66fcf1', fontSize: '1.2rem' }}>{results.chip.behavior.sweetspot[0]}-{results.chip.behavior.sweetspot[1]} MT/s</p>
              <small>{isEn ? 'Voltage Scaling:' : 'Škálování napětí:'} <strong style={{textTransform: 'uppercase'}}>{results.chip.scaling}</strong></small>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .guru-dram-calc { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; color: #fff; }
        .calc-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 900; color: #a855f7; text-transform: uppercase; }
        .guru-select, .guru-input { background: #0a0b0d; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: bold; outline: none; }
        .guru-select:focus, .guru-input:focus { border-color: #a855f7; box-shadow: 0 0 10px rgba(168, 85, 247, 0.2); }
        .results-container { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px; }
        .score-board { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .latency-box, .stability-box { background: rgba(10, 11, 13, 0.9); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 20px; text-align: center; padding: 25px; position: relative; }
        .stability-text { display: block; margin-top: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: inherit; }
        .rank-warning { font-size: 9px; margin-top: 10px; color: #ef4444; font-weight: bold; }
        .stab-good { color: #22c55e; border-color: rgba(34, 197, 94, 0.3); }
        .stab-warn { color: #facc15; border-color: rgba(250, 204, 21, 0.3); }
        .stab-bad { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
        .sweet-badge { display: inline-flex; align-items: center; gap: 5px; margin-top: 12px; padding: 4px 10px; border-radius: 50px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
        .sweet-optimal { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .sweet-above { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .sweet-below { background: rgba(250, 204, 21, 0.1); color: #facc15; }
        .stability-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-top: 10px;}
        .stability-bar-fill { height: 100%; background: currentColor; transition: width 0.4s ease-out; }
        .latency-val { display: block; font-size: 3.2rem; font-weight: 950; text-shadow: 0 0 20px rgba(0,0,0,0.5); }
        .latency-label { color: #a855f7; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .guru-card { background: #0a0b0d; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 18px; text-align: center; position: relative; }
        .guru-card h3 { font-size: 10px; color: #9ca3af; font-weight: 900; margin: 0 0 8px 0; }
        .card-data { font-size: 1.5rem; font-weight: 950; margin: 0 0 4px 0; }
        .guru-card small { color: #6b7280; font-size: 10px; font-weight: bold; }
        .voltage-warning { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); font-size: 8px; color: #ef4444; font-weight: 900; display: flex; align-items: center; gap: 3px; }
        .trefi-block { margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); color: #a855f7; font-size: 10px; }
        @media (max-width: 600px) { .score-board { grid-template-columns: 1fr; } }
      `}} />
    </div>
  );
}
