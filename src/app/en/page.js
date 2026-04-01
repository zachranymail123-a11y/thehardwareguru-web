import React from 'react';
// Importujeme komponenty, které na homepage používáš (přizpůsob cesty, pokud jsou jinde)
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Hardware Guru | PC Benchmarks & Tools',
  description: 'The ultimate source for hardware comparisons, bottleneck calculators and GTA 6 predictions.',
};

export default function EnglishHomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar lang="en" />
      
      <div className="container mx-auto px-4 py-12">
        {/* HERO SECTION */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 tracking-tighter">
            HARDWARE <span className="text-[#9333ea]">GURU</span>
          </h1>
          <p className="text-gray-400 text-xl">Ultimate PC hardware benchmarks and tools.</p>
        </section>

        {/* V.I.P. GURU BUILD SECTION */}
        <section className="bg-[#111] border border-purple-900/30 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/50">
              <span className="text-yellow-500">👑</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-widest">V.I.P. GURU BUILD</h2>
              <p className="text-gray-500 text-sm italic">The best components currently on the market.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { part: 'AMD Ryzen 7 9800X3D', type: 'CPU' },
              { part: 'GIGABYTE X870E AORUS ELITE', type: 'MOBO' },
              { part: 'Kingston 32GB 6000MT/s', type: 'RAM' },
              { part: 'ZOTAC RTX 5070 Twin Edge', type: 'GPU' },
              { part: 'MSI SPATIUM M461 2TB', type: 'SSD' },
              { part: 'Case of your choice', type: 'CASE' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                <span className="font-medium">{item.part}</span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold text-xs transition-all uppercase">
                  BUY
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tady schválně CHYBÍ ten Smarty banner, protože v EN nedává smysl */}

        <section className="text-center py-10 border-t border-gray-900">
          <p className="text-gray-500">Need a custom build? Configure yours in our tools.</p>
        </section>
      </div>

      <Footer lang="en" />
    </main>
  );
}
