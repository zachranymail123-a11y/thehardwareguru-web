'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, RefreshCw, Server, Globe, ArrowUpRight } from 'lucide-react';

export default function AdminMonitor() {
  const [stats] = useState({
    activeUsers: 3,
    totalVisits: 124,
    topPages: [{ path: '/', views: 45 }, { path: '/produkty', views: 32 }, { path: '/sestavy', views: 18 }],
    recentHistory: [
      { time: '21:20:05', path: '/', ref: 'google.com' },
      { time: '21:18:42', path: '/admin/monitor', ref: 'direct' },
    ]
  });

  const s = {
    wrapper: { minHeight: '100-screen', backgroundColor: '#050505', color: '#f4f4f5', fontFamily: 'sans-serif', paddingBottom: '40px' },
    nav: { borderBottom: '1px solid #27272a', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', sticky: 'top', padding: '15px 24px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' },
    card: { backgroundColor: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '16px' },
    title: { color: '#71717a', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' },
    value: { fontSize: '36px', fontWeight: '900', color: '#fff', margin: '8px 0' },
    tableCard: { backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' },
    th: { padding: '12px 24px', textAlign: 'left', fontSize: '10px', color: '#52525b', borderBottom: '1px solid #27272a', textTransform: 'uppercase' },
    td: { padding: '16px 24px', fontSize: '14px', borderBottom: '1px solid #18181b' }
  };

  return (
    <div style={s.wrapper}>
      <nav style={s.nav}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#2563eb', padding: '6px', borderRadius: '8px' }}><Activity size={20} color="white" /></div>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>GURU <span style={{ color: '#3b82f6' }}>LIVE</span> MONITOR</span>
          </div>
          <div style={{ color: '#10b981', fontSize: '12px', border: '1px solid #064e3b', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span> SYSTEM ONLINE
          </div>
        </div>
      </nav>

      <main style={s.container}>
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.title}>Live Traffic</div>
            <div style={s.value}>{stats.activeUsers}</div>
            <div style={{ color: '#a1a1aa', fontSize: '14px' }}>Aktuálně na webu</div>
          </div>
          <div style={s.card}>
            <div style={s.title}>Denní zobrazení</div>
            <div style={s.value}>{stats.totalVisits}</div>
            <div style={{ color: '#a1a1aa', fontSize: '14px' }}>Za posledních 24h</div>
          </div>
          <div style={s.card}>
            <div style={s.title}>Stav serveru</div>
            <div style={{ ...s.value, color: '#10b981' }}>100%</div>
            <div style={{ color: '#a1a1aa', fontSize: '14px' }}>Všechny systémy běží</div>
          </div>
        </div>

        <div style={s.tableCard}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #27272a', fontWeight: 'bold' }}>POSLEDNÍ AKTIVITA</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={s.th}>Čas</th>
                <th style={s.th}>URL Stránka</th>
                <th style={s.th}>Zdroj</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentHistory.map((log, i) => (
                <tr key={i}>
                  <td style={s.td}>{log.time}</td>
                  <td style={{ ...s.td, color: '#fff' }}>{log.path}</td>
                  <td style={{ ...s.td, color: '#71717a', fontStyle: 'italic' }}>{log.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
