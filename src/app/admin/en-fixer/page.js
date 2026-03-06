"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database, Play, Loader2, Globe, Shield } from 'lucide-react';

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
  const [currentTable, setCurrentTable] = useState(null);
  const [log, setLog] = useState([]);

  // GURU SYNC: Robustní počítadlo (Catch NULL & Empty strings)
  const refreshCounts = async () => {
    const newTables = [...tables];
    for (let table of newTables) {
      // Pro počítání použijeme filtr, který detekuje jak NULL, tak ""
      const { data, error } = await supabase
        .from(table.id)
        .select('title_en');
      
      if (!error && data) {
        const needsFix = data.filter(item => !item.title_en || item.title_en.trim() === '').length;
        table.count = needsFix;
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
    if (isFixing) return;
    setIsFixing(true);
    setCurrentTable(tableId);
    addLog(`Start GURU FIX: ${tableId}`, 'info');

    try {
      const res = await fetch('/api/admin/en-fixer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: tableId, limit: 3 }) 
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (data.processedIds && data.processedIds.length > 0) {
        addLog(`Úspěch: Opraveno ${data.processedIds.length} záznamů.`, 'success');
        await refreshCounts();
      } else {
        addLog(`Tabulka ${tableId} je čistá.`, 'success');
      }
    } catch (err) {
      addLog(`CHYBA: ${err.message}`, 'error');
    } finally {
      setIsFixing(false);
      setCurrentTable(null);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '120px auto', padding: '0 20px', color: '#fff' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #1f2937', paddingBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Shield size={40} color="#a855f7" />
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>GURU EN <span style={{ color: '#a855f7' }}>FIXER</span></h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        <div style={{ background: 'rgba(17, 19, 24, 0.8)', border: '1px solid #1f2937', borderRadius: '16px', padding: '30px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#a855f7' }}><Database size={20} /> STAV DATABÁZE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tables.map(table => (
              <div key={table.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: '15px 20px', borderRadius: '12px', border: '1px solid #222' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{table.name}</div>
                  <div style={{ fontSize: '12px', color: table.count > 0 ? '#ef4444' : '#10b981' }}>{table.count} k opravě</div>
                </div>
                <button 
                  disabled={isFixing || table.count === 0}
                  onClick={() => runFix(table.id)}
                  style={{ border: 'none', background: '#a855f7', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', opacity: (isFixing || table.count === 0) ? 0.5 : 1 }}
                >
                  {currentTable === table.id ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />} FIX
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#000', border: '1px solid #1f2937', borderRadius: '16px', padding: '30px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#a855f7' }}><Globe size={20} /> PROTOKOL</h2>
          <div style={{ height: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px' }}>
            {log.map((entry, i) => (
              <div key={i} style={{ marginBottom: '8px', color: entry.type === 'error' ? '#ff4444' : entry.type === 'success' ? '#10b981' : '#888' }}>
                <span style={{ opacity: 0.5 }}>[{entry.time}]</span> {entry.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
