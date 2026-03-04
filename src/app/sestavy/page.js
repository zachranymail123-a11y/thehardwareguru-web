"use client"; // TADY JE TA OPRAVA PRO VERCEL BUILD

import React from 'react';
import { Youtube, Disc as Discord, Tv } from 'lucide-react';

export default function SestavyPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Horní navigace */}
      <nav className="border-b border-yellow-400/20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-yellow-400 uppercase italic">THE HARDWARE GURU</div>
          <div className="flex gap-6">
            <a href="https://kick.com/thehardwareguru" target="_blank" className="hover:text-yellow-400 transition-all hover:scale-110"><Tv size={22} /></a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="hover:text-yellow-400 transition-all hover:scale-110"><Youtube size={22} /></a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="hover:text-yellow-400 transition-all hover:scale-110"><Discord size={22} /></a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter italic uppercase leading-none">
          Herní <span className="text-yellow-400 text-glow">Sestavy</span>
        </h1>

        {/* Guru Text */}
        <div className="space-y-8 text-xl md:text-2xl text-gray-300 leading-relaxed font-medium italic">
          <p>
            Hardware trh se totálně <span className="text-white font-black underline decoration-yellow-400 decoration-4">utrhl ze řetězu</span>. 
            Ceny komponent se mění doslova každou hodinu a statické tabulky jsou v tuhle chvíli úplně k hovnu.
          </p>
          <p>
            Nechci vám věšet bulíky na nos neaktuálními cenami. Chci, abyste za svý prachy dostali <span className="text-yellow-400 font-bold uppercase">maximum výkonu</span>, který je zrovna tenhle den dostupný.
          </p>
        </div>

        {/* CALL TO ACTION BOX */}
        <div className="mt-20 bg-yellow-400 p-10 md:p-16 rounded-none transform -rotate-1 shadow-[15px_15px_0px_0px_rgba(255,255,255,0.05)] border-4 border-white">
          <h2 className="text-black text-4xl md:text-5xl font-black uppercase mb-6 italic leading-none text-center">
            Chceš mašinu bez kompromisů?
          </h2>
          <p className="text-black text-xl md:text-2xl font-bold mb-10 max-w-2xl mx-auto">
            Individuální návrhy sestav dělám osobně na mém Discordu. 
            Podmínkou pro tuhle službu je aktivní <span className="underline italic">Subscribe na mém Kicku</span>.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a 
              href="https://kick.com/thehardwareguru" 
              target="_blank"
              className="bg-black text-white px-10 py-5 font-black uppercase tracking-widest text-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              <Tv size={28} /> SUBSCRIBE NA KICKU
            </a>
            <a 
              href="https://discord.com/invite/n7xThr8" 
              target="_blank"
              className="border-4 border-black text-black px-10 py-5 font-black uppercase tracking-widest text-xl hover:bg-black hover:text-yellow-400 transition-all flex items-center justify-center gap-3"
            >
              <Discord size={28} /> DOVAL NA DISCORD
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-yellow-400/10 text-center">
        <div className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">
          &copy; 2026 THE HARDWARE GURU | NO BULLSHIT PC BUILDING
        </div>
      </footer>

      {/* Tento blok vyžadoval "use client" */}
      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
        }
      `}</style>
    </div>
  );
}
