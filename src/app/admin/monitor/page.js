'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, RefreshCw, Server, Globe, ArrowUpRight } from 'lucide-react';

export default function AdminMonitor() {
  const [stats, setStats] = useState({
    activeUsers: 3,
    totalVisits: 124,
    topPages: [
      { path: '/', views: 45 },
      { path: '/produkty', views: 32 },
      { path: '/sestavy', views: 18 }
    ],
    recentHistory: [
      { time: '21:20:05', type: 'page_view', path: '/', ref: 'google.com' },
      { time: '21:18:42', type: 'page_view', path: '/admin/monitor', ref: 'direct' },
      { time: '21:15:10', type: 'page_view', path: '/gpu-srovnani', ref: 'facebook.com' },
    ]
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity size={22} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              GURU <span className="text-blue-500">LIVE</span> MONITOR
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              SYSTEM ONLINE
            </span>
            <button onClick={() => window.location.reload()} className="text-zinc-400 hover:text-white transition-colors">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase text-right">Live Traffic</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">{stats.activeUsers}</h2>
            <p className="text-zinc-400 text-sm mt-1 font-medium">Aktuálně na webu</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:border-emerald-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                <Eye size={24} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase text-right">Daily Load</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">{stats.totalVisits}</h2>
            <p className="text-zinc-400 text-sm mt-1 font-medium">Zobrazení za 24h</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:border-purple-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                <Server size={24} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase text-right">Node Health</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">100<span className="text-lg text-zinc-500 font-normal">%</span></h2>
            <p className="text-zinc-400 text-sm mt-1 font-medium">Stabilita serveru</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Table */}
          <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2 italic">
                <Globe size={18} className="text-blue-400" /> POSLEDNÍ AKTIVITA
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase border-b border-zinc-800/50">
                    <th className="px-6 py-4">Čas</th>
                    <th className="px-6 py-4">Lokace / URL</th>
                    <th className="px-6 py-4">Zdroj</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30 text-sm">
                  {stats.recentHistory.map((log, i) => (
                    <tr key={i} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-6 py-4 font-mono text-zinc-500 group-hover:text-blue-400 transition-colors">{log.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="text-white font-medium">{log.path}</span>
                           <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-white" />
                        </div>
                      </td>
                      <td className="px-6 py-4 italic text-zinc-500">{log.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Sections Sidebar */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm h-fit">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-bold text-white italic">NEJSLEDOVANĚJŠÍ</h3>
            </div>
            <div className="p-6 space-y-4">
              {stats.topPages.map((page, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono text-zinc-400">{page.path}</span>
                    <span className="text-blue-400 font-bold">{page.views}</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${(page.views / stats.totalVisits) * 200}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
