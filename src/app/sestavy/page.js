import React from 'react';
import { Youtube, Disc as Discord, Tv } from 'lucide-react';

export default function SestavyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-400 selection:text-black">
      
      {/* Ořezaná navigace přesně podle tvé homepage */}
      <nav className="w-full border-b border-white/5 bg-black/40 backdrop-blur-md flex justify-center py-4 sticky top-0 z-50">
         <div className="flex gap-4">
           <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="border border-[#00e701]/50 text-[#00e701] px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#00e701] hover:text-black transition-all">KICK</a>
           <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" className="border border-[#ff0000]/50 text-[#ff0000] px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#ff0000] hover:text-white transition-all">YOUTUBE</a>
           <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" className="border border-[#5865f2]/50 text-[#5865f2] px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#5865f2] hover:text-white transition-all">DISCORD</a>
         </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Hlavní nadpis */}
        <h1 className="text-5xl md:text-7xl font-black text-center mb-12 uppercase italic tracking-tighter">
          Herní <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Sestavy</span>
        </h1>

        {/* Guru Glassmorphism Karta */}
        <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
           
           {/* Glow efekt na pozadí karty */}
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>

           <div className="relative z-10">
             <div className="space-y-6 text-gray-400 text-lg md:text-xl leading-relaxed italic font-light mb-12">
               <p>
                 Hardware trh se totálně <span className="text-white font-bold underline decoration-yellow-400/50">utrhl ze řetězu</span>. Ceny komponent se mění doslova každou hodinu a statické tabulky jsou v tuhle chvíli úplně k hovnu.
               </p>
               <p>
                 Nechci vám věšet bulíky na nos neaktuálními cenami. Chci, abyste za svý prachy dostali <span className="text-yellow-400 font-bold uppercase not-italic">maximum výkonu</span>, který je zrovna tenhle den dostupný.
               </p>
             </div>

             {/* Box pro výzvu k akci */}
             <div className="bg-black/50 border border-yellow-400/20 rounded-2xl p-8 md:p-10 text-center">
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic mb-6">Chceš mašinu bez kompromisů?</h2>
                <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
                  Individuální návrhy sestav dělám osobně na mém Discordu. <br/>
                  Podmínkou pro tuhle službu je aktivní <span className="text-yellow-400 font-bold underline">Subscribe na mém Kicku</span>.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="bg-yellow-400 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-yellow-500 hover:scale-105 transition-all">
                    <Tv size={22} /> SUBSCRIBE NA KICKU
                  </a>
                  <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" className="bg-[#5865f2] text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#4752c4] hover:scale-105 transition-all">
                    <Discord size={22} /> DOVAL NA DISCORD
                  </a>
                </div>
             </div>
           </div>
        </div>

      </main>
      
      {/* Patička */}
      <footer className="py-10 border-t border-white/5 text-center">
        <div className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
          &copy; 2026 THE HARDWARE GURU | NO BULLSHIT PC BUILDING
        </div>
      </footer>
    </div>
  );
}
