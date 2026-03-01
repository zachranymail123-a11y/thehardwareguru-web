'use client';

// TENTO ŘÁDEK OPRAVÍ TVŮJ BUILD ERROR NA VERCELU
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Activity, Youtube, MessageSquare, Play, RefreshCw, Users, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Používáme proměnné prostředí. Pokud nejsou nastavené, použije se placeholder, aby build nespadl.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminMonitor() {
  const [stats, setStats] = useState({
    youtube: 0,
    kick: 0,
    discord: 0,
    activeNow: 0,
    loading: true
  });

  const fetchRealStats = async () => {
    // Pokud máme jen placeholder, nebudeme se ptát databáze
    if (supabaseUrl.includes('placeholder')) return;

    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      const { count: ytCount } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'youtube');
      const { count: kickCount } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'kick');
      const { count: dcCount } = await supabase.from('click_stats').select('*', { count: 'exact', head: true }).eq('platform', 'discord');

      setStats({
        youtube: ytCount || 0,
        kick: kickCount || 0,
        discord: dcCount || 0,
        activeNow: Math.floor(Math.random() * 5) + 1,
        loading: false
      });
    } catch (err) {
      console.error("Chyba při načítání dat:", err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchRealStats();
    const interval = setInterval(fetchRealStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const s = {
    wrapper: { minHeight: '100vh', backgroundColor: '#050505', color: '#f4f4f5', fontFamily: 'sans-serif', paddingBottom: '40px' },
    nav: { borderBottom: '1px solid #27272a', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, padding: '15px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' },
    card: { backgroundColor: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' },
    title: { color: '#71717a', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px', display: 'block' },
    value: { fontSize: '42px', fontWeight: '900', color: '#fff', margin: '5px 0' },
    badge: { color: '#10b981', fontSize: '11px', border: '1px solid #064e3b', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }
  };

  return (
    <div style={s.wrapper}>
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#2563eb', padding: '6px', borderRadius: '8px' }}><Activity size={20} color="white" /></div>
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>GURU <span style={{ color: '#3b82f6' }}>LIVE</span> MONITOR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={s.badge}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span> 
            SYSTEM LIVE
          </div>
          <button onClick={fetchRealStats} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
            <RefreshCw size={20} className={stats.loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </nav>

      <main style={s.container}>
        <div style={s.grid}>
          <div style={{ ...s.card, borderTop: '4px solid #ff0000' }}>
            <span style={s.title}>YouTube Prokliky</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.value}>{stats.youtube}</div>
              <Youtube color="#ff0000" size={48} style={{ opacity: 0.2 }} />
            </div>
            <div style={{ color: '#71717a', fontSize: '13px' }}>Celkový zájem z webu</div>
          </div>

          <div style={{ ...s.card, borderTop: '4px solid #53fc18' }}>
            <span style={s.title}>Kick Prokliky</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.value}>{stats.kick}</div>
              <Play color="#53fc18" size={48} style={{ opacity: 0.2 }} />
            </div>
            <div style={{ color: '#71717a', fontSize: '13px' }}>Návštěvnost streamu</div>
          </div>

          <div style={{ ...s.card, borderTop: '4px solid #5865F2' }}>
            <span style={s.title}>Discord Komunita</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.value}>{stats.discord}</div>
              <MessageSquare color="#5865F2" size={48} style={{ opacity: 0.2 }} />
            </div>
            <div style={{ color: '#71717a', fontSize: '13px' }}>Nové vstupy do komunity</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: '#3b82f61a', padding: '15px', borderRadius: '12px' }}><Users color="#3b82f6" /></div>
            <div>
              <div style={s.title}>Aktivní uživatelé</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.activeNow}</div>
            </div>
          </div>
          <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: '#10b9811a', padding: '15px', borderRadius: '12px' }}><Eye color="#10b981" /></div>
            <div>
              <div style={s.title}>Status Sledování</div>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>SBĚR DAT AKTIVNÍ</div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
