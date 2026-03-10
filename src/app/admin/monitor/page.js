'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Activity, Youtube, MessageSquare, Play, RefreshCw, Eye, TrendingUp, Calendar } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) ? createClient(supabaseUrl, supabaseKey) : null;

export default function AdminMonitor() {
  const [stats, setStats] = useState({
    youtube: 0, kick: 0, discord: 0,
    totalViews: 0, topPages: [], history: [], loading: true
  });

  const fetchRealStats = async () => {
    if (!supabase) return;
    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // 1. Základní počty (prokliky a celková návštěvnost)
      const { count: yt } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'youtube');
      const { count: kick } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'kick');
      const { count: dc } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'discord');
      const { count: total } = await supabase.from('page_views').select('*', { count: 'exact', head: true });

      // 2. Data pro historii (posledních 14 dní)
      const { data: historyData } = await supabase.from('page_views')
        .select('created_at')
        .gte('created_at', fourteenDaysAgo.toISOString());

      // Zpracování historie po dnech
      const dayCounts = {};
      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayCounts[d.toISOString().split('T')[0]] = 0;
      }

      historyData.forEach(row => {
        const date = row.created_at.split('T')[0];
        if (dayCounts[date] !== undefined) dayCounts[date]++;
      });

      const processedHistory = Object.entries(dayCounts).sort().reverse();

      // 3. Top Stránky
      const { data: viewsData } = await supabase.from('page_views').select('path');
      const counts = viewsData.reduce((acc, curr) => { acc[curr.path] = (acc[curr.path] || 0) + 1; return acc; }, {});
      const sortedPages = Object.entries(counts).sort(([,a], [,b]) => b - a).slice(0, 5);

      setStats({
        youtube: yt || 0, kick: kick || 0, discord: dc || 0,
        totalViews: total || 0, topPages: sortedPages,
        history: processedHistory, loading: false
      });
    } catch (err) { console.error("Chyba dat:", err); }
  };

  useEffect(() => { if (supabase) fetchRealStats(); }, []);

  const s = {
    wrapper: { minHeight: '100vh', backgroundColor: '#050505', color: '#f4f4f5', fontFamily: 'sans-serif', paddingBottom: '40px' },
    nav: { borderBottom: '1px solid #27272a', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, padding: '15px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' },
    card: { backgroundColor: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '16px' },
    title: { color: '#71717a', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em' },
    value: { fontSize: '42px', fontWeight: '900', color: '#fff', margin: '10px 0' },
    bar: (val, max) => ({ height: '8px', width: `${(val/max)*100}%`, backgroundColor: '#3b82f6', borderRadius: '4px', minWidth: '4px' })
  };

  const maxDaily = Math.max(...stats.history.map(([, count]) => count), 1);

  return (
    <div style={s.wrapper}>
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={24} color="#3b82f6" />
          <span style={{ fontSize: '20px', fontWeight: '900' }}>GURU <span style={{ color: '#3b82f6' }}>TRENDS</span></span>
        </div>
        <button onClick={fetchRealStats} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
          <RefreshCw size={22} className={stats.loading ? 'animate-spin' : ''} />
        </button>
      </nav>

      <main style={s.container}>
        <div style={s.grid}>
          <div style={{ ...s.card, borderLeft: '4px solid #3b82f6' }}>
            <span style={s.title}>Celkem za vše</span>
            <div style={s.value}>{stats.totalViews}</div>
          </div>
          <div style={{ ...s.card, borderLeft: '4px solid #a855f7' }}>
            <span style={s.title}>Odchody na sítě</span>
            <div style={s.value}>{stats.youtube + stats.kick + stats.discord}</div>
          </div>
        </div>

        {/* TRENDY ZA 14 DNÍ */}
        <div style={{ ...s.card, marginBottom: '32px' }}>
          <div style={{ ...s.title, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} /> Trendy (Posledních 14 dní)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.history.map(([date, count], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '100px', fontSize: '12px', color: '#71717a' }}>{new Date(date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })}</div>
                <div style={{ flex: 1, backgroundColor: '#18181b', borderRadius: '4px', height: '8px' }}>
                  <div style={s.bar(count, maxDaily)}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ZBYTEK STATISTIK (TOP STRÁNKY A SÍTĚ) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={s.card}>
            <span style={s.title}>Nejsledovanější stránky</span>
            <div style={{ marginTop: '15px' }}>
              {stats.topPages.map(([path, count], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #18181b', fontSize: '14px' }}>
                  <span style={{ color: '#3b82f6' }}>{path}</span>
                  <span>{count}x</span>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <span style={s.title}>Kliky na sociální sítě</span>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#ff0000' }}>YouTube</span> <span>{stats.youtube}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#53fc18' }}>Kick</span> <span>{stats.kick}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5865F2' }}>Discord</span> <span>{stats.discord}</span></div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
