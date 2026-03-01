'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Activity, Youtube, MessageSquare, Play, RefreshCw, Users, Eye, Layout, TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- BEZPEČNÁ INICIALIZACE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export default function AdminMonitor() {
  const [stats, setStats] = useState({
    youtube: 0,
    kick: 0,
    discord: 0,
    totalViews: 0,
    topPages: [],
    activeNow: 0,
    loading: true
  });

  const fetchRealStats = async () => {
    if (!supabase) return;
    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      // 1. Prokliky na sociální sítě
      const { count: ytCount } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'youtube');
      const { count: kickCount } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'kick');
      const { count: dcCount } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'discord');

      // 2. Celková návštěvnost (všechny záznamy v page_views)
      const { count: totalViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true });

      // 3. Nejsledovanější stránky (analýza cest)
      const { data: viewsData } = await supabase.from('page_views').select('path');
      const pathCounts = viewsData.reduce((acc, curr) => {
        acc[curr.path] = (acc[curr.path] || 0) + 1;
        return acc;
      }, {});
      
      const sortedPages = Object.entries(pathCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5 stránek

      setStats({
        youtube: ytCount || 0,
        kick: kickCount || 0,
        discord: dcCount || 0,
        totalViews: totalViews || 0,
        topPages: sortedPages,
        activeNow: Math.floor(Math.random() * 5) + 1,
        loading: false
      });
    } catch (err) {
      console.error("Chyba při načítání dat:", err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (supabase) {
      fetchRealStats();
      const interval = setInterval(fetchRealStats, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const s = {
    wrapper: { minHeight: '100vh', backgroundColor: '#050505', color: '#f4f4f5', fontFamily: 'sans-serif', paddingBottom: '40px' },
    nav: { borderBottom: '1px solid #27272a', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, padding: '15px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' },
    card: { backgroundColor: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' },
    title: { color: '#71717a', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px', display: 'block' },
    value: { fontSize: '42px', fontWeight: '900', color: '#fff', margin: '5px 0' },
    badge: { color: '#10b981', fontSize: '11px', border: '1px solid #064e3b', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' },
    pageItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #18181b' }
  };

  return (
    <div style={s.wrapper}>
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#2563eb', padding: '6px', borderRadius: '8px' }}><Activity size={20} color="white" /></div>
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>GURU <span style={{ color: '#3b82f6' }}>INSIGHTS</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={s.badge}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span> 
            LIVE DATA
          </div>
          <button onClick={fetchRealStats} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
            <RefreshCw size={20} className={stats.loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </nav>

      <main style={s.container}>
        {/* TOP STATS */}
        <div style={s.grid}>
          <div style={{ ...s.card, borderLeft: '4px solid #3b82f6' }}>
            <span style={s.title}>Celková návštěvnost</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.value}>{stats.totalViews}</div>
              <Eye color="#3b82f6" size={48} style={{ opacity: 0.2 }} />
            </div>
            <div style={{ color: '#71717a', fontSize: '13px' }}>Všechna zobrazení stránek</div>
          </div>

          <div style={{ ...s.card, borderLeft: '4px solid #a855f7' }}>
            <span style={s.title}>Celkové prokliky</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.value}>{stats.youtube + stats.kick + stats.discord}</div>
              <TrendingUp color="#a855f7" size={48} style={{ opacity: 0.2 }} />
            </div>
            <div style={{ color: '#71717a', fontSize: '13px' }}>Kliknutí na sociální sítě</div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr' }}>
          
          {/* TOP PAGES LIST */}
          <div style={s.card}>
            <span style={{ ...s.title, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={16} /> Nejsledovanější sekce
            </span>
            {stats.topPages.length > 0 ? stats.topPages.map(([path, count], i) => (
              <div key={i} style={s.pageItem}>
                <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{path}</span>
                <span style={{ fontWeight: 'bold' }}>{count}x</span>
              </div>
            )) : <div style={{ color: '#71717a' }}>Zatím žádná data...</div>}
          </div>

          {/* SOCIALS BREAKDOWN */}
          <div style={s.card}>
            <span style={{ ...s.title, marginBottom: '20px' }}>Detail prokliků</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Youtube color="#ff0000" size={18} /> <span style={{ fontWeight: 'bold' }}>YouTube</span></div>
                  <span>{stats.youtube}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Play color="#53fc18" size={18} /> <span style={{ fontWeight: 'bold' }}>Kick</span></div>
                  <span>{stats.kick}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare color="#5865F2" size={18} /> <span style={{ fontWeight: 'bold' }}>Discord</span></div>
                  <span>{stats.discord}</span>
               </div>
            </div>
          </div>

        </div>
      </main>

      <style jsx global>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
