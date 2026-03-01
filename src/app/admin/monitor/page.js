'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, ArrowLeft, RefreshCw, Server } from 'lucide-react';

export default function AdminMonitor() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalVisits: 0,
    topPages: [],
    recentHistory: []
  });

  // Simulace dat (zde se později napojí tvůj Supabase/Live systém)
  useEffect(() => {
    setStats({
      activeUsers: 3,
      totalVisits: 124,
      topPages: [
        { path: '/', views: 45 },
        { path: '/produkty', views: 32 },
        { path: '/kontakt', views: 12 }
      ],
      recentHistory: [
        { time: '21:14', type: 'page_view', path: '/', ref: 'google.com' },
        { time: '21:12', type: 'page_view', path: '/admin/monitor', ref: 'direct' },
      ]
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-blue-500" /> GURU LIVE MONITOR
          </h1>
          <p className="text-zinc-400 mt-1">Sledování návštěvnosti v reálném čase</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stat Cards */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase font-semibold tracking-wider">Aktivní uživatelé</p>
              <h2 className="text-3xl font-bold text-white">{stats.activeUsers}</h2>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase font-semibold tracking-wider">Zobrazení dnes</p>
              <h2 className="text-3xl font-bold text-white">{stats.totalVisits}</h2>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
              <Server size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase font-semibold tracking-wider">Stav systému</p>
              <h2 className="text-3xl font-bold text-emerald-400">Online</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h3 className="font-bold flex items-center gap-2 text-white">
              Nejsledovanější sekce
            </h3>
          </div>
          <div className="p-4">
            {stats.topPages.map((page, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-zinc-800 last:border-0 items-center">
                <span className="text-zinc-300 font-mono text-sm">{page.path}</span>
                <span className="bg-zinc-800 px-3 py-1 rounded text-xs font-bold text-blue-400">{page.views}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h3 className="font-bold text-white">Poslední aktivita</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th className="px-4 py-3">Čas</th>
                  <th className="px-4 py-3">Stránka</th>
                  <th className="px-4 py-3">Zdroj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {stats.recentHistory.map((log, i) => (
                  <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono">{log.time}</td>
                    <td className="px-4 py-3 text-zinc-100">{log.path}</td>
                    <td className="px-4 py-3 italic text-zinc-500">{log.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
