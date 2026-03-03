import React from 'react';

export default function SupportPage() {
  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white font-sans selection:bg-purple-500/30">
      {/* Hlavní kontejner */}
      <main className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">
        
        {/* Nadpis a Úvod */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">
            Podpora projektu
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            KRMÍŠ TENHLE STROJ
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed italic">
            "Podpoř TheHardwareGuru! 🚀 Každý dar jde na hosting, Vercel a doménu. 
            Díky tobě udržíme web online 24/7."
          </p>
        </div>

        {/* Karta s možnostmi platby */}
        <div className="w-full max-w-2xl bg-[#111318] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          {/* Efekt záře na pozadí */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full group-hover:bg-purple-600/30 transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col gap-6">
            
            {/* Možnost 1: Stripe (Karty) */}
            <a 
              href={stripeLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white text-black p-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">💳</span>
                <div className="text-left">
                  <div className="font-black uppercase leading-none">Platební karta</div>
                  <div className="text-xs opacity-60">Apple Pay, Google Pay, Karty</div>
                </div>
              </div>
              <span className="text-2xl font-light">→</span>
            </a>

            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-white/10"></div>
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Nebo</span>
              <div className="h-[1px] flex-1 bg-white/10"></div>
            </div>

            {/* Možnost 2: Revolut */}
            <a 
              href={`https://revolut.me/${revolutTag}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-[#0075eb] text-white p-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_20px_rgba(0,117,235,0.2)]"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white text-[#0075eb] rounded-full w-10 h-10 flex items-center justify-center font-black text-xl">R</div>
                <div className="text-left">
                  <div className="font-black uppercase leading-none">Revolut Me</div>
                  <div className="text-xs text-blue-100/60 text-left italic lowercase">@{revolutTag}</div>
                </div>
              </div>
              <span className="text-2xl font-light">→</span>
            </a>

          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em] font-bold">
            Fixní náklady: Vercel Hosting • Database • Domain Auto-scripts
          </p>
        </div>

      </main>
    </div>
  );
}
