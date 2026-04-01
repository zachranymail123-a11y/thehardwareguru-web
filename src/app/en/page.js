import React from 'react';
// Absolutní cesty přes @, tohle už Vercel prostě musí sežrat
import Navbar from '@/app/components/Navbar'; 
import Footer from '@/app/components/Footer';

export const metadata = {
  title: 'Hardware Guru | PC Benchmarks & Tools',
  description: 'The ultimate source for hardware comparisons, bottleneck calculators and GTA 6 predictions.',
};

export default function EnglishHomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar lang="en" />
      
      <div className="container mx-auto px-4 py-12">
        <section className="text-center mb-16 pt-10">
          <h1 className="text-6xl font-black mb-4 tracking-tighter italic">
            HARDWARE <span className="text-[#9333ea]">GURU</span>
          </h1>
          <p className="text-gray-400 text-xl font-light">Ultimate PC hardware benchmarks and tools for enthusiasts.</p>
        </section>

        <section className="max-w-4xl mx-auto bg-[#111] border border-purple-900/30 rounded-2xl p-8 mb-16 shadow-2xl shadow-purple-900/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">V.I.P. GURU BUILD</h2>
              <p className="text-purple-400 text-sm font-bold uppercase tracking-widest">The absolute best on the market right now</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { part: 'AMD Ryzen 7 9800X3D', type: 'CPU' },
              { part: 'GIGABYTE X870E AORUS ELITE', type: 'MOBO' },
              { part: 'Kingston 32GB 6000MT/s', type: 'RAM' },
              { part: 'ZOTAC RTX 5070 Twin Edge', type: 'GPU' },
              { part: 'MSI SPATIUM M461 2TB', type: 'SSD' },
              { part: 'Premium Case of Choice', type: 'CASE' }
            ].map((item, idx) => (
              <div key={idx} className="group flex items-center justify-between p-5 bg-[#161616] hover:bg-[#1a1a1a] rounded-xl border border-white/5 transition-all duration-300">
                <div className="flex flex-col">
                  <span className="text-[10px] text-purple-500 font-bold tracking-widest uppercase mb-1">{item.type}</span>
                  <span className="font-bold text-lg text-gray-200 group-hover:text-white">{item.part}</span>
                </div>
                <button className="bg-purple-600 hover:bg-[#9333ea] text-white px-8 py-3 rounded-lg font-black text-sm transition-all uppercase shadow-lg shadow-purple-900/20 active:scale-95">
                  BUY
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer lang="en" />
    </main>
  );
}
