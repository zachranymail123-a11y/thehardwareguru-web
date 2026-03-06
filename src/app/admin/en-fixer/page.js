"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database, Play, Loader2, Globe, Shield, Zap, CircleSlash } from 'lucide-react';

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

  // 🚀 GURU DEEP DETECTION: Musí odpovídat backendu na 100%
  const needsFixing = (item, tableId) => {
    const isValEmpty = (v) => !v || String(v).trim() === '' || String(v).toLowerCase() === 'null';

    if (isValEmpty(item.title_en)) return true;
    if (isValEmpty(item.description_en)) return true;
    
    if (tableId === 'posts') {
      if (isValEmpty(item.seo_description_en)) return true;
      if (isValEmpty(item.seo_keywords_en)) return true;
    }
    
    return false;
  };

  const refreshCounts = async () => {
    const newTables = [...tables];
    for (let table of newTables) {
      const { data, error } = await supabase.from(table.id).select('*');
      if (!error && data) {
        table.count = data.filter(item => needsFixing(item, table.id)).length;
      }
    }
    setTables(newTables);
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  const addLog = (msg, type = 'info') => {
    setLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const runFix = async (tableId) => {
    if (isFixing && !isAutoLoop) return false;
    setIsFixing(true);
    setCurrentTable(tableId);
    addLog(`GURU SURGERY: Zpracovávám ${tableId}...`, 'info');

    try {
      const res = await fetch('/api/admin/en-fixer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: tableId, limit: 3 }) 
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (data.processedIds && data.processedIds.length > 0) {
        addLog(`Úspěch: Opraveny ${data.processedIds.length} záznamy v ${tableId}.`, 'success');
        await refreshCounts();
        return true; 
      } else {
        addLog(`Backend nehlásí žádná data k opravě pro ${tableId}.`, 'success');
        await refreshCounts(); // Znovu přepočítáme, jestli se backend a frontend shodují
        return false; 
      }
    } catch (err) {
      addLog(`CHYBA: ${err.message}`, 'error');
      return false;
    } finally {
      if (!isAutoLoop) {
        setIsFixing(false);
        setCurrentTable(null);
      }
    }
  };

  const startAutoLoop = async (tableId) => {
    stopLoopRef.current = false;
    setIsAutoLoop(true);
    setIsFixing(true);
    addLog(`🚀 START AUTO-GURU MÓDU PRO: ${tableId}`, 'info');

    let hasMore = true;
    while (hasMore && !stopLoopRef.current) {
      // Vždy před každým krokem zkontrolujeme, jestli je co dělat
      const { data } = await supabase.from(tableId).select('*');
      const currentCount = data ? data.filter(item => needsFixing(item, tableId)).length : 0;
      
      if (currentCount === 0) {
        hasMore = false;
        break;
      }

      hasMore = await runFix(tableId);
      
      if (hasMore && !stopLoopRef.current) {
        addLog(`Smyčka: Čekám 2s na další dávku (zbývá cca ${currentCount})...`, 'info');
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setIsAutoLoop(false);
    setIsFixing(false);
    setCurrentTable(null);
    if (stopLoopRef.current) addLog(`🛑 AUTO-GURU MÓD BYL ZASTAVEN.`, 'error');
    else addLog(`🏁 AUTO-GURU MÓD DOKONČEN. Tabulka ${tableId} je čistá!`, 'success');
    refreshCounts();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '120px auto', padding: '0 20px', color: '#fff' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #1f2937', paddingBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Shield size={40} color="#a855f7" />
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>GURU EN <span style={{ color: '#a855f7' }}>FIXER 2.0</span></h1>
        </div>
        {isAutoLoop && (
          <button 
            onClick={() => { stopLoopRef.current = true; }}
            style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 0 20px rgba(255, 68, 68, 0.4)' }}
          >
            ZASTAVIT OPERACI
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        <div style={{ background: 'rgba(17, 19, 24, 0.8)', border: '1px solid #1f2937', borderRadius: '16px', padding: '30px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#a855f7' }}><Database size={20} /> STAV DATABÁZE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tables.map(table => (
              <div key={table.id} style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '16px', color: '#fff' }}>{table.name}</div>
                    <div style={{ fontSize: '12px', color: table.count > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{table.count} k opravě</div>
                  </div>
                  <Database size={20} color={table.count > 0 ? '#ef4444' : '#10b981'} />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    disabled={isFixing || table.count === 0}
                    onClick={() => runFix(table.id)}
                    style={{ flex: 1, border: '1px solid #a855f7', background: 'transparent', color: '#a855f7', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', opacity: (isFixing || table.count === 0) ? 0.3 : 1 }}
                  >
                    FIX 3 KS
                  </button>
                  <button 
                    disabled={isFixing || table.count === 0}
                    onClick={() => startAutoLoop(table.id)}
                    style={{ flex: 2, background: '#a855f7', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: (isFixing || table.count === 0) ? 0.3 : 1 }}
                  >
                    {currentTable === table.id && isAutoLoop ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />} AUTO-FIX (LOOP)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#000', border: '1px solid #1f2937', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#a855f7' }}><Globe size={20} /> GURU PROTOKOL</h2>
          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', minHeight: '400px' }}>
            {log.length === 0 && <div style={{ color: '#444' }}>Systém připraven k operaci...</div>}
            {log.map((entry, i) => (
              <div key={i} style={{ marginBottom: '8px', color: entry.type === 'error' ? '#ff4444' : entry.type === 'success' ? '#10b981' : '#888', borderLeft: `2px solid ${entry.type === 'success' ? '#10b981' : entry.type === 'error' ? '#ff4444' : '#333'}`, paddingLeft: '10px' }}>
                <span style={{ opacity: 0.5, fontSize: '10px' }}>[{entry.time}]</span> {entry.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
