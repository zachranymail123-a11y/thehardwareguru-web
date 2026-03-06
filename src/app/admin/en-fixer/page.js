"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database, Play, Loader2, Globe, Shield, Zap, CircleSlash, AlertTriangle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EnFixerDashboard() {
  const [tables, setTables] = useState([
    { id: 'posts', name: 'Články (posts)', count: 0 },
    { id: 'tipy', name: 'Tipy', count: 0 },
    { id: 'tweaky', name: 'Tweaky', count: 0 },
    { id: 'rady', name: 'Praktické Rady', count: 0 },
    { id: 'slovnik', name: 'Slovník', count: 0 }
  ]);
  const [isFixing, setIsFixing] = useState(false);
  const [isAutoLoop, setIsAutoLoop] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [log, setLog] = useState([]);
  
  const stopLoopRef = useRef(false);

  // 🚀 GURU MASTER DETECTION: Tato funkce MUSÍ být shodná s backendem.
  // Detekuje: skutečný NULL, prázdný string "", string "NULL" (z importů) nebo jen mezery.
  const needsFixing = (item, tableId) => {
    const isValEmpty = (v) => {
      if (v === null || v === undefined) return true;
      const s = String(v).trim();
      return s === '' || s.toLowerCase() === 'null';
    };

    // Základní kritéria pro všechny tabulky
    if (isValEmpty(item.title_en)) return true;
    if (isValEmpty(item.description_en)) return true;
    
    // Hardcore SEO kontrola pro posts (podle tvého screenshotu)
    if (tableId === 'posts') {
      if (isValEmpty(item.seo_description_en)) return true;
      if (isValEmpty(item.seo_keywords_en)) return true;
    }
    
    return false;
  };

  const refreshCounts = async () => {
    const newTables = [...tables];
    for (let table of newTables) {
      try {
        const { data, error } = await supabase.from(table.id).select('*');
        if (!error && data) {
          table.count = data.filter(item => needsFixing(item, table.id)).length;
        }
      } catch (e) { console.error(`Failed count for ${table.id}`); }
    }
    setTables([...newTables]);
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  const addLog = (msg, type = 'info') => {
    setLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 100));
  };

  const runFixBatch = async (tableId) => {
    setCurrentTable(tableId);
    addLog(`GURU BATCH: Odesílám požadavek pro ${tableId}...`, 'info');

    try {
      const res = await fetch('/api/admin/en-fixer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: tableId, limit: 3 }) 
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (data.processedIds && data.processedIds.length > 0) {
        addLog(`ÚSPĚCH: Backend opravil ${data.processedIds.length} záznamů v ${tableId}.`, 'success');
        return data.processedIds.length; 
      } else {
        addLog(`VAROVÁNÍ: Backend nevrátil žádné ID, i když frontend vidí chyby. Možná sync lag.`, 'error');
        return 0; 
      }
    } catch (err) {
      addLog(`KRITICKÁ CHYBA: ${err.message}`, 'error');
      return -1;
    }
  };

  const startAutoLoop = async (tableId) => {
    if (isFixing) return;
    
    stopLoopRef.current = false;
    setIsAutoLoop(true);
    setIsFixing(true);
    addLog(`🚀 START OPERACE: Nekonečná smyčka pro ${tableId}`, 'info');

    let totalFixed = 0;
    
    // 🔄 GURU INFINITE LOOP: Jede, dokud frontend nevidí nulu
    while (!stopLoopRef.current) {
      // 1. Refreshneme si realitu
      const { data } = await supabase.from(tableId).select('*');
      const currentCount = data ? data.filter(item => needsFixing(item, tableId)).length : 0;
      
      if (currentCount === 0) {
        addLog(`🏁 CÍL DOSAŽEN: Tabulka ${tableId} je 100% vyčištěna!`, 'success');
        break;
      }

      addLog(`Smyčka: Zbývá ${currentCount} položek. Volám backend...`, 'info');
      
      const fixedInBatch = await runFixBatch(tableId);
      
      if (fixedInBatch > 0) {
        totalFixed += fixedInBatch;
        // Krátká pauza pro OpenAI (rate limit protection)
        await new Promise(r => setTimeout(r, 1500));
      } else if (fixedInBatch === 0) {
        addLog(`Zásek: Backend nenašel data, zkouším znova za 3s...`, 'error');
        await new Promise(r => setTimeout(r, 3000));
      } else {
        addLog(`Smyčka přerušena kvůli chybě.`, 'error');
        break;
      }
      
      // Update počitadel v UI během běhu
      await refreshCounts();
    }

    setIsAutoLoop(false);
    setIsFixing(false);
    setCurrentTable(null);
    if (stopLoopRef.current) addLog(`🛑 OPERACE MANUÁLNĚ ZASTAVENA. Celkem opraveno: ${totalFixed}`, 'error');
    refreshCounts();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '120px auto', padding: '0 20px', color: '#fff' }}>
      <header style={{ marginBottom: '40px', borderBottom: '2px solid #1f2937', paddingBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#a855f7', padding: '10px', borderRadius: '12px', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
            <Shield size={32} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>GURU EN <span style={{ color: '#a855f7' }}>FIXER 3.0</span></h1>
            <p style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>FULL-AUTO SYNCHRONIZAČNÍ ENGINE</p>
          </div>
        </div>
        
        {isAutoLoop && (
          <button 
            onClick={() => { stopLoopRef.current = true; }}
            style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 0 30px rgba(255, 68, 68, 0.5)', animation: 'pulse 1s infinite' }}
          >
            ZASTAVIT OPERACI
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
        {/* LEVÝ PANEL: STATUS TABULEK */}
        <div style={{ background: 'rgba(17, 19, 24, 0.9)', border: '1px solid #1f2937', borderRadius: '24px', padding: '35px', height: 'fit-content' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '900', marginBottom: '30px', color: '#a855f7' }}><Database size={22} /> DATABÁZE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tables.map(table => (
              <div key={table.id} style={{ background: '#0a0b0d', padding: '25px', borderRadius: '18px', border: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
                {currentTable === table.id && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#a855f7' }}></div>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '17px', color: '#fff' }}>{table.name}</div>
                    <div style={{ fontSize: '14px', color: table.count > 0 ? '#ff4444' : '#10b981', fontWeight: '900', marginTop: '5px' }}>
                      {table.count > 0 ? `${table.count} POLOŽEK K OPRAVĚ` : 'KOMPLETNĚ PŘELOŽENO'}
                    </div>
                  </div>
                  {table.count > 0 ? <AlertTriangle color="#ff4444" size={24} /> : <Zap color="#10b981" fill="#10b981" size={24} />}
                </div>
                
                <button 
                  disabled={isFixing || table.count === 0}
                  onClick={() => startAutoLoop(table.id)}
                  style={{ 
                    width: '100%', background: isFixing ? '#1a1a1a' : '#a855f7', border: 'none', color: '#fff', 
                    padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900', fontSize: '13px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
                    transition: '0.3s', opacity: (isFixing || table.count === 0) ? 0.4 : 1 
                  }}
                >
                  {currentTable === table.id ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />} 
                  {isAutoLoop && currentTable === table.id ? 'SPOUŠTÍM SMYČKU...' : 'SPUSTIT AUTO-LOOP'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PRAVÝ PANEL: LOGY */}
        <div style={{ background: '#000', border: '1px solid #1f2937', borderRadius: '24px', padding: '35px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '900', marginBottom: '30px', color: '#a855f7' }}><Globe size={22} /> GURU PROTOKOL</h2>
          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', minHeight: '500px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            {log.length === 0 && <div style={{ color: '#444' }}>Systém připraven k akci, Guru. Vyber tabulku.</div>}
            {log.map((entry, i) => (
              <div key={i} style={{ marginBottom: '12px', color: entry.type === 'error' ? '#ff4444' : entry.type === 'success' ? '#10b981' : '#ccc', borderLeft: `3px solid ${entry.type === 'success' ? '#10b981' : entry.type === 'error' ? '#ff4444' : '#333'}`, paddingLeft: '15px', lineHeight: '1.5' }}>
                <span style={{ opacity: 0.4, fontSize: '10px', marginRight: '10px' }}>[{entry.time}]</span> {entry.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}
