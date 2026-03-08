"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Swords, RefreshCw, AlertCircle, Check, ArrowLeft, Cpu, Terminal 
} from 'lucide-react';

/**
 * GURU GPU DUELS GENERATOR V1.0
 * Dedikovaný modul pro generování Programmatic SEO duelů.
 * Běží zcela odděleně od hlavního Intel Hubu.
 */

// --- 🚀 GURU ENV ENGINE ---
const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback;
  const bridge = document.getElementById('guru-env-bridge');
  const bridgeMap = {
    'NEXT_PUBLIC_SUPABASE_URL': bridge?.getAttribute('data-url'),
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': bridge?.getAttribute('data-key')
  };
  const envMap = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  };
  return bridgeMap[key] || envMap[key] || fallback;
};

// --- GURU ENGINE INIT ---
const initSupabase = () => {
  let createClient;
  try {
    const supabaseModule = require('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch (e) {
    return { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }), insert: () => Promise.resolve({ error: null }) }) };
  }
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder');
  return createClient(url, key);
};

export default function GpuDuelsGenerator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gpusList, setGpusList] = useState([]);
  const [gpuA, setGpuA] = useState('');
  const [gpuB, setGpuB] = useState('');
  const [duelGenerating, setDuelGenerating] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);
  
  const supabase = useMemo(() => initSupabase(), []);

  // 🛡️ Ochrana přístupu (Sdílí session s hlavním adminem)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('guru_admin_auth') === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  useEffect(() => { if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [consoleLogs]);

  // Načtení dostupných grafik
  useEffect(() => {
    if (isAuthenticated) {
      const loadGpus = async () => {
        addLog('Načítám HW databázi...', 'info');
        const { data, error } = await supabase.from('gpus').select('*').order('release_price_usd', { ascending: false });
        if (error) {
            addLog(`Chyba načítání GPU: ${error.message}`, 'error');
        } else if (data) {
            setGpusList(data);
            addLog(`Úspěšně načteno ${data.length} grafických karet.`, 'success');
        }
      };
      loadGpus();
    }
  }, [isAuthenticated, supabase]);

  const handleGenerateDuel = async () => {
    if (!gpuA || !gpuB) return addLog('Vyber dvě grafické karty pro duel!', 'error');
    if (gpuA === gpuB) return addLog('Nemůžeš porovnávat stejnou kartu proti sobě!', 'warning');

    const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || getEnv('OPENAI_API_KEY');
    if (!openAiKey || openAiKey === '') return addLog('CHYBÍ AI KLÍČ V ENV (NEXT_PUBLIC_OPENAI_API_KEY)!', 'error');

    setDuelGenerating(true);
    
    const cardA = gpusList.find(g => g.id === gpuA);
    const cardB = gpusList.find(g => g.id === gpuB);
    addLog(`AI připravuje ultimátní duel: ${cardA.name} vs ${cardB.name}...`, 'warning');

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAiKey}` },
        body: JSON.stringify({
          model: "gpt-4o", 
          messages: [
            { 
              role: "system", 
              content: "Jsi expertní Hardware Guru. Tvoříš vysoce odborné SEO duely grafických karet. Napiš úderný verdikt (content). Zaměř se na výkon ve 1440p/4K, RayTracing a poměr cena/výkon. ABSOLUTNÍ PRAVIDLO: Všechna pole končící na '_cs' MUSÍ BÝT STRIKTNĚ V ČEŠTINĚ! Pole '_en' v angličtině. Použij HTML tagy (h2, strong, ul, li) pro formátování obsahu. Vygeneruj JSON: { \"title_cs\": \"...\", \"title_en\": \"...\", \"content_cs\": \"...\", \"content_en\": \"...\", \"seo_description_cs\": \"...\", \"seo_description_en\": \"...\", \"slug\": \"karta-a-vs-karta-b\" }" 
            },
            { role: "user", content: `Porovnej tyto dvě karty:\nKarta A: ${cardA.name} (Architektura: ${cardA.architecture}, VRAM: ${cardA.vram_gb}GB ${cardA.memory_bus}, Takt: ${cardA.boost_clock_mhz}MHz, TDP: ${cardA.tdp_w}W, Cena: $${cardA.release_price_usd})\nKarta B: ${cardB.name} (Architektura: ${cardB.architecture}, VRAM: ${cardB.vram_gb}GB ${cardB.memory_bus}, Takt: ${cardB.boost_clock_mhz}MHz, TDP: ${cardB.tdp_w}W, Cena: $${cardB.release_price_usd})` }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      const r = await response.json();
      const content = r?.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI nevrátilo odpověď.");

      const aiData = JSON.parse(content);

      // Zápis do databáze gpu_duels
      const { error: dbError } = await supabase.from('gpu_duels').insert([{
        slug: aiData.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        gpu_a_id: cardA.id,
        gpu_b_id: cardB.id,
        title_cs: aiData.title_cs,
        title_en: aiData.title_en,
        content_cs: aiData.content_cs,
        content_en: aiData.content_en,
        seo_description_cs: aiData.seo_description_cs,
        seo_description_en: aiData.seo_description_en,
      }]);

      if (dbError) {
        if (dbError.code === '23505') throw new Error("Tento duel už v databázi existuje!");
        throw new Error(dbError.message);
      }

      addLog(`🔥 DUEL ULOŽEN DO DB: ${aiData.title_cs}`, 'success');
      setGpuA(''); setGpuB(''); 

    } catch (err) {
      addLog(`Chyba duelu: ${err.message}`, 'error');
    } finally {
      setDuelGenerating(false);
    }
  };

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: '20px' }}>
        <AlertCircle size={48} color="#ff0055" />
        <h1 style={{ fontWeight: 900 }}>PŘÍSTUP ODEPŘEN</h1>
        <p style={{ color: '#9ca3af' }}>Pro přístup k tomuto modulu se musíš nejdřív přihlásit v hlavním Admin Velínu.</p>
        <a href="/admin" style={{ padding: '10px 20px', background: '#ff0055', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Zpět na přihlášení</a>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', color: '#fff', fontFamily: 'sans-serif', padding: '40px 60px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .guru-admin-card { background: rgba(17, 19, 24, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255, 0, 85, 0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .gpu-select { width: 100%; padding: 18px; background: #000; border: 1px solid #333; color: #fff; border-radius: 12px; font-size: 15px; outline: none; margin-top: 8px; font-weight: 900; transition: 0.3s; }
        .gpu-select:focus { border-color: #ff0055; box-shadow: 0 0 15px rgba(255, 0, 85, 0.2); }
        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 12px; overflow-y: auto; color: #22c55e; height: 350px; margin-top: 30px; }
      `}} />

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HLAVIČKA MODULU */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Swords color="#ff0055" size={40} />
              <div>
                 <h1 style={{ fontSize: '32px', fontWeight: 950, margin: 0, lineHeight: 1 }}>GPU <span style={{ color: '#ff0055' }}>DUELY</span></h1>
                 <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>Programmatic SEO Engine</span>
              </div>
            </div>
            <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#111', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #333' }}>
               <ArrowLeft size={16} /> Zpět do Velínu
            </a>
        </div>

        {/* OVLÁDACÍ PANEL */}
        <div className="guru-admin-card">
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
              Vygenerovat nový duel (AI)
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
            <div>
              <label style={{ color: '#ff0055', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>🔴 Karta A (Červený roh)</label>
              <select className="gpu-select" value={gpuA} onChange={e => setGpuA(e.target.value)}>
                <option value="">-- Vyber první grafiku --</option>
                {gpusList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>🔵 Karta B (Modrý roh)</label>
              <select className="gpu-select" value={gpuB} onChange={e => setGpuB(e.target.value)}>
                <option value="">-- Vyber druhou grafiku --</option>
                {gpusList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerateDuel} 
            disabled={duelGenerating || !gpuA || !gpuB}
            style={{ 
              width: '100%', padding: '20px', background: duelGenerating ? '#444' : 'linear-gradient(135deg, #ff0055 0%, #be123c 100%)', 
              color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '950', 
              fontSize: '18px', textTransform: 'uppercase', cursor: duelGenerating ? 'not-allowed' : 'pointer',
              boxShadow: duelGenerating ? 'none' : '0 10px 30px rgba(255, 0, 85, 0.4)',
              transition: '0.3s'
            }}
          >
            {duelGenerating ? <><RefreshCw className="animate-spin inline mr-2" size={20}/> GENERUJI VERDIKT PŘES AI...</> : '⚔️ ZAHÁJIT SOUBOJ KARET'}
          </button>
        </div>

        {/* TERMINÁL */}
        <div className="terminal-box">
          <div style={{ color: '#fff', borderBottom: '1px dashed #333', paddingBottom: '10px', marginBottom: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} /> SYSTÉMOVÝ LOG
          </div>
          {consoleLogs.map((log, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <span style={{ opacity: 0.4, marginRight: '10px' }}>[{log.time}]</span>
              <span style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'warning' ? '#eab308' : '#22c55e' }}>{log.msg}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

      </div>
    </div>
  );
}
