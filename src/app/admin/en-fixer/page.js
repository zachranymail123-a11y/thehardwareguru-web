"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { Database, Play, Loader2, Globe, Shield } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EnFixerDashboard() {
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

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

  // GURU SYNC: Načtení počtu NULL záznamů
  const refreshCounts = async () => {
    const newTables = [...tables];
    for (let table of newTables) {
      const { count, error } = await supabase
        .from(table.id)
        .select('*', { count: 'exact', head: true })
        .is('title_en', null);
      if (!error) table.count = count || 0;
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
    setIsFixing(false);
    setCurrentTable(tableId);
    addLog(`Spouštím GURU EN FIXER pro tabulku: ${tableId}`, 'info');

    try {
      let totalProcessed = 0;
      let hasMore = true;

      while (hasMore) {
        const res = await fetch('/api/admin/en-fixer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableName: tableId, limit: 3 }) 
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        if (data.processedIds && data.processedIds.length > 0) {
          totalProcessed += data.processedIds.length;
          addLog(`Opraveno ${totalProcessed} záznamů...`, 'success');
          await refreshCounts();
        } else {
          hasMore = false;
        }
      }
      addLog(`Dokončeno. Celkem opraveno ${totalProcessed} záznamů.`, 'success');
    } catch (err) {
      addLog(`KRITICKÁ CHYBA: ${err.message}`, 'error');
    } finally {
      setIsFixing(false);
      setCurrentTable(null);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Shield size={40} color="#a855f7" />
          <h1 style={titleStyle}>GURU EN <span style={{ color: '#a855f7' }}>FIXER</span></h1>
        </div>
        <p style={{ color: '#9ca3af', marginTop: '10px' }}>
          {isEn ? 'Bulk fix for missing English translations across all sections.' : 'Hromadné doplnění chybějící angličtiny ve všech sekcích webu.'}
        </p>
      </header>

      <div style={gridStyle}>
        {/* LEVÝ PANEL: TABULKY */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}><Database size={20} /> {isEn ? 'DATABASE STATUS' : 'STAV DATABÁZE'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tables.map(table => (
              <div key={table.id} style={itemStyle}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{table.name}</div>
                  <div style={{ fontSize: '12px', color: table.count > 0 ? '#ef4444' : '#10b981' }}>
                    {table.count > 0 ? (isEn ? `${table.count} items need EN fix` : `${table.count} záznamů vyžaduje EN fix`) : (isEn ? 'All synced' : 'Vše v pořádku')}
                  </div>
                </div>
                <button 
                  disabled={isFixing || table.count === 0}
                  onClick={() => runFix(table.id)}
                  style={{
                    ...btnStyle,
                    opacity: (isFixing || table.count === 0) ? 0.5 : 1,
                    background: currentTable === table.id ? '#1f2937' : '#a855f7'
                  }}
                >
                  {currentTable === table.id ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                  {isEn ? 'FIX' : 'OPRAVIT'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PRAVÝ PANEL: LOGY */}
        <div style={{ ...cardStyle, background: '#000' }}>
          <h2 style={sectionTitleStyle}><Globe size={20} /> {isEn ? 'LIVE PROTOCOL' : 'ŽIVÝ PROTOKOL'}</h2>
          <div style={logContainerStyle}>
            {log.length === 0 && <div style={{ color: '#444' }}>{isEn ? 'Waiting for activity...' : 'Zatím žádná aktivita...'}</div>}
            {log.map((entry, i) => (
              <div key={i} style={{ 
                fontSize: '13px', 
                marginBottom: '8px', 
                color: entry.type === 'error' ? '#ff4444' : entry.type === 'success' ? '#10b981' : '#888',
                fontFamily: 'monospace'
              }}>
                <span style={{ opacity: 0.5 }}>[{entry.time}]</span> {entry.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle = { maxWidth: '1100px', margin: '40px auto', padding: '0 20px', color: '#fff' };
const headerStyle = { marginBottom: '40px', borderBottom: '1px solid #1f2937', paddingBottom: '30px' };
const titleStyle = { fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' };
const cardStyle = { background: 'rgba(17, 19, 24, 0.8)', border: '1px solid #1f2937', borderRadius: '16px', padding: '30px' };
const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#a855f7' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: '15px 20px', borderRadius: '12px', border: '1px solid #222' };
const btnStyle = { border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' };
const logContainerStyle = { height: '350px', overflowY: 'auto', padding: '10px' };
