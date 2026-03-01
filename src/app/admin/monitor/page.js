'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart3, Users, ExternalLink, MousePointer2, RefreshCcw, Globe } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function GuruMonitor() {
  const [loading, setLoading] = useState(true);
  const [topPaths, setTopPaths] = useState([]);
  const [exitStats, setExitStats] = useState([]);
  const [recentViews, setRecentViews] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. TOP ČLÁNKY (pouze page_views)
    const { data: paths } = await supabase
      .from('page_views')
      .select('page_path')
      .eq('event_type', 'page_view');

    const pathCounts = paths.reduce((acc, curr) => {
      acc[curr.page_path] = (acc[curr.page_path] || 0) + 1;
      return acc;
    }, {});

    const sortedPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setTopPaths(sortedPaths);

    // 2. ODCHODY NA SOCIÁLNÍ SÍTĚ
    const { data: exits } = await supabase
      .from('page_views')
      .select('event_type')
      .ilike('event_type', 'exit_%');

    const exitCounts = exits.reduce((acc, curr) => {
      const platform = curr.event_type.replace('exit_', '').toUpperCase();
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    setExitStats(Object.entries(exitCounts).map(([name, count]) => ({ name, count })));

    // 3. POSLEDNÍCH 50 AKCÍ
    const { data: recent } = await supabase
      .from('page_views')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    setRecentViews(recent || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh každých 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-orange-500 italic">GURU LIVE MONITOR</h1>
          <p className="text-zinc-500 text-sm">Sledování návštěvnosti v reálném čase</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-all border border-zinc-700"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEVÝ SLOUPEC: TOP SEKCE */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-3">
            <BarChart3 className="text-orange-500 w-5 h-5" />
            <h2 className="font-bold uppercase tracking-widest text-sm">Nejsledovanější sekce</h2>
          </div>
          <div className="space-y-4">
            {topPaths.map((item, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400 group-hover:text-white transition-colors truncate max-w-[200px]">{item.path}</span>
                  <span className="font-mono text-orange-500">{item.count}x</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-1000" 
                    style={{ width: `${(item.count / topPaths[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-2 mb-6 border-b border-zinc-900 pb-3">
            <ExternalLink className="text-blue-500 w-5 h-5" />
            <h2 className="font-bold uppercase tracking-widest text-sm">Odchody z webu</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {exitStats.map((stat, i) => (
              <div key={i} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 font-bold mb-1">{stat.name}</div>
                <div className="text-xl font-black text-white">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRAVÝ SLOUPEC: LIVE FEED */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-6 border-b border-zinc-900 bg-zinc-950/50 sticky top-0">
            <Users className="text-green-500 w-5 h-5" />
            <h2 className="font-bold uppercase tracking-widest text-sm">Posledních 50 návštěv</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-zinc-600 border-b border-zinc-900">
                  <th className="p-4">Čas</th>
                  <th className="p-4">Typ</th>
                  <th className="p-4">Stránka</th>
                  <th className="p-4">Zdroj (Referrer)</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {recentViews.map((view) => (
                  <tr key={view.id} className="border-b border-zinc-900/50 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-zinc-500">
                      {new Date(view.created_at).toLocaleTimeString('cs-CZ')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        view.event_type === 'page_view' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {view.event_type.replace('page_view', 'VISIT').replace('exit_', 'OUT_')}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 truncate max-w-[150px]">{view.page_path}</td>
                    <td className="p-4 text-zinc-500 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{view.referrer || 'Direct'}</span>
                    </td>
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
