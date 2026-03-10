// ... existing code ...
import { 
  ChevronLeft, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Swords, 
  Calendar,
  Trophy,
  Zap,
  Cpu,
  Activity,
  BarChart3,
  Gamepad2
} from 'lucide-react';

/**
 * GURU CPU DUELS ENGINE - DETAIL V67.2 (100% NATIVE API & NO-AI)
// ... existing code ...
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU: Standardní slugify pro bezpečné URL
const slugify = (text) => {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
};

// 🛡️ GURU ENGINE: Vyhledávání CPU z DB (Nativní Fetch)
const findCpu = async (slugPart) => {
// ... existing code ...
             <div className="spec-row">
               <div className="spec-val" style={{ color: '#e5e7eb' }}>{cpuA.architecture}</div>
               <div className="spec-label">{isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA'}</div>
               <div className="spec-val" style={{ color: '#e5e7eb' }}>{cpuB.architecture}</div>
             </div>
          </div>
        </section>

        {/* 🚀 GURU: DEEP DIVE CROSS-LINKS PRO NOVÉ CPU LANDING PAGES */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Activity size={36} className="text-[#66fcf1]" /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              {[cpuA, cpuB].filter(Boolean).map((cpu, i) => {
                  const safeSlug = cpu.slug || slugify(cpu.name);
                  return (
                  <div key={i} className="fps-matrix-card">
                      <div className="matrix-gpu-title" style={{ color: getVendorColor(cpu.vendor) }}>{cpu.name}</div>
                      <div className="matrix-links">
                          <a href={`/${isEn ? 'en/' : ''}cpu/${safeSlug}`} className="matrix-link">
                              <Cpu size={14} /> {isEn ? 'Full Profile' : 'Kompletní Profil'}
                          </a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-performance/${safeSlug}`} className="matrix-link">
                              <BarChart3 size={14} /> {isEn ? 'Performance Specs' : 'Výkon a Parametry'}
                          </a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-recommend/${safeSlug}`} className="matrix-link">
                              <ShieldCheck size={14} /> {isEn ? 'Guru Verdict' : 'Guru Verdikt'}
                          </a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-fps/${safeSlug}/cyberpunk-2077`} className="matrix-link">
                              <Gamepad2 size={14} /> Cyberpunk 2077 FPS
                          </a>
                      </div>
                  </div>
                  );
              })}
          </div>
        </section>

        {/* GLOBÁLNÍ CTA TLAČÍTKA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
// ... existing code ...
        .text-green-400 { color: #4ade80; }
        .text-red-400 { color: #f87171; }
        .text-neutral-400 { color: #a3a3a3; }
        .font-black { font-weight: 900; }

        /* 🚀 GURU: DEEP DIVE STYLY */
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .matrix-gpu-title { font-size: 15px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
        .matrix-links { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 13px; font-weight: bold; transition: 0.2s; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid transparent; }
        .matrix-link:hover { color: #fff; background: rgba(102, 252, 241, 0.05); transform: translateX(5px); border-color: rgba(102, 252, 241, 0.3); }

        @media (max-width: 768px) {
          .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }
// ... existing code ...
