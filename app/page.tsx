export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// --- ODKAZY NA TVOJE SOCIÁLNÍ SÍTĚ ---
const KICK_URL = "https://kick.com/thehardwareguru";
const YOUTUBE_URL = "https://www.youtube.com/@TheHardwareGuru_Czech";
const DISCORD_URL = "https://discord.gg/n7xThr8";

// --- KONFIGURACE SUPABASE ---
const supabase = createClient(
  'https://luepzmdwgrbtnevlznbx.supabase.co', 
  'sb_publishable_wa3MgO-wdn8oWrZbJReNPw_CT9Bp2mq' // <--- TADY VLOŽ SVŮJ KLÍČ !!!
);

export default async function Home() {
  // Stáhneme články seřazené od nejnovějšího
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen font-sans text-white relative overflow-x-hidden selection:bg-green-400 selection:text-black">
      
      {/* --- POZADÍ --- */}
      <div className="fixed inset-0 -z-50 bg-black"></div>
      <div className="fixed inset-0 -z-40 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2665&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Gaming Background"
        />
      </div>
      <div className="fixed inset-0 -z-30 bg-gradient-to-t from-black via-black/90 to-purple-900/20 mix-blend-multiply"></div>

      {/* --- HERO SEKCE --- */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4 pt-10">
        
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">
          THE HARDWARE
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400">GURU</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-bold text-gray-400 mb-16 uppercase tracking-[0.3em] bg-black/60 px-6 py-3 rounded-xl backdrop-blur-md border border-white/5">
          Analýzy • Hardware • Gaming bez servítek
        </p>

        {/* --- TLAČÍTKA --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
          <a href={KICK_URL} target="_blank" className="group relative bg-[#53FC18] hover:bg-[#42ca12] text-black h-32 md:h-40 rounded-2xl flex items-center justify-center gap-6 transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(83,252,24,0.6)] border-4 border-black">
            <div className="text-left">
              <div className="text-sm font-black uppercase tracking-widest opacity-80">Sleduj Stream</div>
              <div className="text-4xl md:text-5xl font-black italic">KICK</div>
            </div>
          </a>

          <a href={YOUTUBE_URL} target="_blank" className="group relative bg-[#FF0000] hover:bg-[#cc0000] text-white h-32 md:h-40 rounded-2xl flex items-center justify-center gap-6 transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,0,0,0.6)] border-4 border-black">
            <div className="text-left">
              <div className="text-sm font-black uppercase tracking-widest opacity-80">Nová videa</div>
              <div className="text-4xl md:text-5xl font-black italic">YOUTUBE</div>
            </div>
          </a>

           <a href={DISCORD_URL} target="_blank" className="group relative bg-[#5865F2] hover:bg-[#4752c4] text-white h-32 md:h-40 rounded-2xl flex items-center justify-center gap-6 transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(88,101,242,0.6)] border-4 border-black">
            <div className="text-left">
              <div className="text-sm font-black uppercase tracking-widest opacity-80">Komunita</div>
              <div className="text-4xl md:text-5xl font-black italic">DISCORD</div>
            </div>
          </a>
        </div>
      </section>

      <div className="h-4 w-full bg-gradient-to-r from-purple-900 via-purple-500 to-purple-900 shadow-[0_0_30px_rgba(168,85,247,0.8)]"></div>

      {/* --- STREAM REPORTS --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center gap-6 mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-xl">
            POSLEDNÍ <span className="text-purple-500">REPORTY</span>
          </h2>
          <div className="h-2 flex-grow bg-zinc-800 rounded-full"></div>
        </div>

        {/* Stav, když není nic v DB */}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-32 border-4 border-dashed border-zinc-800 rounded-3xl bg-black/50">
             <p className="text-3xl font-black text-red-500 uppercase">Zatím žádné reporty...</p>
             <p className="text-zinc-500 mt-2 italic">Zkontroluj Supabase nebo spusť automat!</p>
             {error && <p className="text-xs text-red-400 mt-4">Chyba: {error.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts && posts.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`}>
              <article className="group h-full flex flex-col bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden hover:border-purple-500 hover:-translate-y-3 transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-purple-900/20">
                
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={`https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`} 
                    alt="Thumbnail"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all">
                    <div className="w-16 h-16 rounded-full bg-purple-600/90 flex items-center justify-center backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform border border-white/20">
                      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-zinc-900 to-black">
                  <h3 className="text-xl font-bold mb-4 leading-snug text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-8 font-medium flex-grow">
                    {post.content}
                  </p>
                  
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-6 mt-auto">
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {new Date(post.created_at).toLocaleDateString('cs-CZ')}
                     </span>
                     <span className="text-white font-black text-xs uppercase group-hover:text-purple-400 transition-colors flex items-center gap-2">
                        Číst Report <span className="text-lg">→</span>
                     </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-black py-16 text-center border-t border-zinc-900">
        <p className="text-zinc-700 text-xs font-bold uppercase tracking-[0.6em] mb-4">
          &copy; 2026 THE HARDWARE GURU
        </p>
      </footer>
    </main>
  );
}