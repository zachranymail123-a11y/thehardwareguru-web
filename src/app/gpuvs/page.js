import React, { useState, useEffect } from 'react';
import { 
  Swords, ChevronRight, Zap, RefreshCw, Flame, Cpu, ShieldCheck
} from 'lucide-react';

/**
 * GURU GPU DUELS INDEX - MASTER LOGIC V3.6 (BUILD PROTECTION)
 * Cesta: src/app/gpuvs/page.js
 * Oprava: Robustní ošetření modulů pro prostředí náhledu i produkce.
 * Primární komponenta přejmenována na App pro soulad s prostředím.
 */

// --- 🛡️ GURU BUILD SHIELD ---
// Pomocná funkce pro bezpečné načítání modulů v prostředí Canvas
const getModule = (path) => {
  try {
    return require(path);
  } catch (e) {
    return null;
  }
};

const supabaseLib = getModule('@supabase/supabase-js');
const nextNav = getModule('next/navigation');
const nextLink = getModule('next/link');

const createClient = supabaseLib ? supabaseLib.createClient : null;
const useRouter = nextNav ? nextNav.useRouter : () => ({ push: (url) => console.log(`Routing to: ${url}`) });
const usePathname = nextNav ? nextNav.usePathname : () => '/gpuvs';
const Link = nextLink ? (nextLink.default || nextLink) : ({ children, href, className, ...props }) => (
  <a href={href} className={className} {...props}>{children}</a>
);

// Inicializace Supabase s fallbackem
const supabase = (createClient && process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : { 
      from: () => ({ 
        select: () => ({ 
          order: () => ({ limit: () => Promise.resolve({ data: [] }) }),
          order: () => Promise.resolve({ data: [] }) 
        }) 
      }) 
    };

const App = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isEn = pathname ? pathname.startsWith('/en') : false;

  const [gpus, setGpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [gpuA, setGpuA] = useState('');
  const [gpuB, setGpuB] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!createClient) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [gData, dData] = await Promise.all([
          supabase.from('gpus').select('id, name').order('name', { ascending: true }),
          supabase.from('gpu_duels').select('id, title_cs, title_en, slug, slug_en').order('created_at', { ascending: false }).limit(20)
        ]);

        if (gData.error) throw gData.error;
        if (dData.error) throw dData.error;

        setGpus(gData.data || []);
        setExistingDuels(dData.data || []);
      } catch (err) {
        console.error("Guru Sync Error:", err);
        setError(isEn ? "Database connection unstable." : "Připojení k databázi nestabilní.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isEn]);

  const handleStartDuel = () => {
    if (!gpuA || !gpuB || gpuA === gpuB) return;
    const cardA = gpus.find(g => g.id === gpuA);
    const cardB = gpus.find(g => g.id === gpuB);
    if (!cardA || !cardB) return;

    const rawSlug = `${cardA.name}-vs-${cardB.name}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    
    if (isEn) {
      router.push(`/en/gpuvs/en-${rawSlug}`);
    } else {
      router.push(`/gpuvs/${rawSlug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white font-sans" style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      {/* 🛡️ GURU HYPER-SHIELD Script (Prevence TypeError u SwG) */}
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          window.swgSubscriptions = window.swgSubscriptions || {};
          if (typeof window.swgSubscriptions.attachButton !== 'function') {
            window.swgSubscriptions.attachButton = function() { console.log('Hyper-Shield Activated'); };
          }
        })();
      `}} />

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-24">
        
        {/* HERO HLAVIČKA */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[#ff0055] text-xs font-black uppercase tracking-[0.3em] mb-6 px-5 py-2 border border-[#ff0055] rounded-full bg-[#ff0055]/10">
            <Swords size={18} /> GURU VS ENGINE
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none mb-6">
            {isEn ? "COMPARE ANY" : "POROVNEJTE"} <br/> 
            <span className="text-[#ff0055]">{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
          </h1>
          <p className="text-[#9ca3af] text-lg max-w-xl mx-auto">
            {isEn ? "Detailed technical analysis, FPS assessment and value tracking by Guru AI." : "Detailní technická analýza, odhad FPS a zhodnocení výhodnosti pomocí Guru AI."}
          </p>
        </div>

        {/* VÝBĚROVÝ PANEL */}
        <section className="bg-[#111318]/95 border-2 border-[#a855f7]/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl mb-20">
            {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center font-bold mb-8">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <label className="block text-[#ff0055] text-[10px] font-black uppercase mb-3 tracking-widest">🔴 {isEn ? "FIRST GPU" : "PRVNÍ GRAFIKA"}</label>
                  <select 
                    className="w-full p-4 bg-black border border-white/10 rounded-xl text-white font-bold outline-none focus:border-[#ff0055] transition-all cursor-pointer appearance-none" 
                    value={gpuA} 
                    onChange={e => setGpuA(e.target.value)}
                  >
                    <option value="">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => <option key={g.id} value={g.id} className="bg-[#0a0b0d]">{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#3b82f6] text-[10px] font-black uppercase mb-3 tracking-widest">🔵 {isEn ? "SECOND GPU" : "DRUHÁ GRAFIKA"}</label>
                  <select 
                    className="w-full p-4 bg-black border border-white/10 rounded-xl text-white font-bold outline-none focus:border-[#3b82f6] transition-all cursor-pointer appearance-none" 
                    value={gpuB} 
                    onChange={e => setGpuB(e.target.value)}
                  >
                    <option value="">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => <option key={g.id} value={g.id} className="bg-[#0a0b0d]">{g.name}</option>)}
                  </select>
                </div>
            </div>

            <button 
              className="group relative w-full p-6 bg-gradient-to-r from-[#ff0055] to-[#be123c] text-white rounded-2xl font-black text-lg uppercase tracking-wider shadow-[0_10px_30px_rgba(255,0,85,0.4)] hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={handleStartDuel} 
              disabled={!gpuA || !gpuB || gpuA === gpuB || loading}
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap fill="currentColor" size={20} className="group-hover:scale-125 transition-transform" />}
                {isEn ? "Start Hardware Battle" : "Spustit souboj železa"}
              </div>
            </button>
            
            {gpuA === gpuB && gpuA !== '' && (
              <p className="text-[#ff0055] text-xs font-bold text-center mt-4 uppercase tracking-widest">
                {isEn ? "You cannot compare the same card!" : "Nemůžete porovnávat stejnou kartu!"}
              </p>
            )}
        </section>

        {/* EXISTUJÍCÍ SOUBOJE */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black uppercase italic whitespace-nowrap">
              {isEn ? "POPULAR" : "POPULÁRNÍ"} <span className="text-[#ff0055]">{isEn ? "BATTLES" : "SOUBOJE"}</span>
            </h2>
            <div className="h-px bg-white/10 w-full"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-600 font-black tracking-widest uppercase italic">
              <RefreshCw className="animate-spin mr-3" size={20} /> GURU SYSTEM SCANNING...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {existingDuels.length > 0 ? existingDuels.map((duel) => (
                <Link 
                  href={isEn ? `/en/gpuvs/${duel.slug_en || duel.slug}` : `/gpuvs/${duel.slug}`} 
                  key={duel.id} 
                  className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-[#ff0055] hover:translate-x-2 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-2 bg-[#ff0055]/10 rounded-lg text-[#ff0055]">
                      <Swords size={20} />
                    </div>
                    <span className="text-lg font-black tracking-tight group-hover:text-[#ff0055] transition-colors">
                      {isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-white" />
                </Link>
              )) : (
                <div className="text-center py-12 text-gray-600 font-bold italic uppercase tracking-widest">
                   {isEn ? "No duels found. Be the first to start one!" : "V databázi zatím nejsou žádné souboje. Odpal to první!"}
                </div>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
