"use client";

import React from 'react';
import { Youtube, Disc as Discord, Tv, ExternalLink } from 'lucide-react';

export default function SestavyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Navigace - Match s tvým screenem */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
             <div className="text-xl font-black tracking-tighter text-white uppercase italic">THE HARDWARE GURU</div>
             {/* Simulace tvého menu */}
             <div className="hidden md:flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <a href="/" className="hover:text-white transition-colors">HOMEPAGE</a>
                <a href="#" className="text-white border-b border-yellow-400 pb-1">Sestavy</a>
                <a href="#" className="hover:text-white transition-colors italic text-yellow-400">🔥 TIPY</a>
             </div>
          </div>
          <div className="flex gap-3">
            <a href="https://kick.com/thehardwareguru" target="_blank" className="bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/20 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-[#00e701] hover:text-black transition-all">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="bg-[#ff0000]/10 text-[#ff0000] border border-[#ff0000]/20 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-[#ff0000] hover:text-white transition-all">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="bg-[#5865f2]/10 text-[#5865f2] border border-[#5865f2]/20 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-[#5865f2] hover:text-white transition-all">DISCORD</a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-24">
        <div className="flex flex-col items-center text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase italic leading-none">
                HERNÍ <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">SESTAVY</span>
            </h1>
            <div className="h-1 w-24 bg-yellow-400 mb-10 rounded-full"></div>
            
            <div className="max-w-3xl space-y-6 text-lg md:text-xl text-gray-400 leading-relaxed italic font-light">
                <p>
                    Hardware trh se v roce 2026 totálně <span className="text-white font-bold underline decoration-yellow-400/50">utrhl ze řetězu</span>. 
                    Ceny komponent skáčou každou hodinu a statické tabulky jsou v tuhle chvíli úplně k hovnu.
                </p>
                <p>
                    Nechci vám věšet bulíky na nos neaktuálními cenami. Chci, abyste za svý prachy dostali <span className="text-white font-bold uppercase not-italic">absolutní maximum</span>, které je v daný moment na trhu.
                </p>
            </div>
        </div>

        {/* Hlavní karta v tvém stylu */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-[#111111] border border-white/10 rounded-[2rem] p-8 md:p-16 overflow-hidden shadow-2xl">
                {/* Background dekorace */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-3xl md:text-5xl font-black uppercase mb-6 italic text-center leading-tight">
                        Chceš brutální <br/> <span className="text-yellow-400">herní mašinu?</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl text-center mb-12 max-w-xl">
                        Individuální návrhy sestav řeším osobně na mém Discordu. 
                        Podmínkou pro návrh je aktivní <span className="text-white font-bold underline decoration-yellow-400">Subscribe na mém Kicku</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <a 
                        href="https://kick.com/thehardwareguru" 
                        target="_blank"
                        className="bg-yellow-400 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(250,204,21,0.2)]"
                        >
                        <Tv size={24} /> Subscribe na Kicku
                        </a>
                        <a 
                        href="https://discord.com/invite/n7xThr8" 
                        target="_blank"
                        className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                        >
                        <Discord size={24} /> Doval na Discord
                        </a>
                    </div>

                    <div className="mt-10 flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        <span className="w-8 h-[1px] bg-gray-800"></span>
                        Podporou na Kicku udržuješ Guru projekt v chodu
                        <span className="w-8 h-[1px] bg-gray-800"></span>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <div className="text-gray-600 text-[9px] font-black uppercase tracking-[0.5em] opacity-40">
          &copy; 2026 THE HARDWARE GURU | NO BULLSHIT PC BUILDING
        </div>
      </footer>
    </div>
  );
}
