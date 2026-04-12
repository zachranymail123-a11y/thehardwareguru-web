"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Script from 'next/script';
import { 
 Swords, Zap, RefreshCw, ChevronRight, ArrowLeftRight, ShieldCheck, Flame, AlertTriangle, Gamepad2, ShoppingCart, CheckCircle, Clock
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons';

/**
 * GURU CPU DUELS ENGINE - MASTER HUB V3.3 (ENTERPRISE REVENUE MACHINE)
 * 🚀 CÍL: Supabase Header fix, Popup fallback, Haptic feedback a Dynamic CTA variants.
 */

const AMAZON_TAG = "thehardware07-20";
const CACHE_KEY = "guru_cpus_cache_v8";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6h

export default function CpuVsHub() {
  const [isEn, setIsEn] = useState(false);
  const [cpus, setCpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [cpuA, setCpuA] = useState('');
  const [cpuB, setCpuB] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastViewed, setLastViewed] = useState(null);
  const [returnVisitor, setReturnVisitor] = useState(false);

  const getAmazonLink = (query, type = "main") => {
    const cleanCpu = (query || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
    return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&camp=1789&creative=9325&ascsubtag=cpuvs-${type}-${cleanCpu}`;
  };
  
  const heurekaGlobalLink = "https://www.heureka.cz/?h%5Bfraze%5D=procesor+cena&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link";
  const amazonGlobalLink = getAmazonLink("gaming processor", "top");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const enMode = window.location.pathname.startsWith('/en');
      setIsEn(enMode);

      if (localStorage.getItem("guru_visited_vs")) setReturnVisitor(true);
      localStorage.setItem("guru_visited_vs", "1");

      const prev = localStorage.getItem("guru_last_viewed_cpu");
      if (prev) {
        try {
          const parsed = JSON.parse(prev);
          if (Date.now() - parsed.time < 1000 * 60 * 60 * 24) setLastViewed(parsed.name);
        } catch(e) { localStorage.removeItem("guru_last_viewed_cpu"); }
      }

      if (!enMode && !document.querySelector('script[src*="trixam.min.js"]')) {
        const script = document.createElement('script');
        script.src = "//serve.affiliate.heureka.cz/js/trixam.min.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    let timeout;
    const handler = (e) => {
      const freshExitShown = sessionStorage.getItem("exitShown");
      if (e.clientY <= 0 && e.relatedTarget === null && !freshExitShown) {
        if (Math.random() < 0.3) return;
        timeout = setTimeout(() => {
            if (!sessionStorage.getItem("exitShown")) {
                sessionStorage.setItem("exitShown", "1");
                const go = confirm(isEn ? "Wait! Check the best CPU deals before you leave?" : "Počkej! Chceš vidět nejlepší ceny procesorů než odejdeš?");
                if (go) {
                  const url = isEn ? amazonGlobalLink : heurekaGlobalLink;
                  const win = window.open(url, '_blank');
                  if (win) win.opener = null;
                }
            }
        }, 200);
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => { clearTimeout(timeout); document.removeEventListener('mouseleave', handler); };
  }, [isEn, amazonGlobalLink, heurekaGlobalLink]);

  useEffect(() => {
    async function loadData() {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (raw) {
            const cached = JSON.parse(raw);
            if (cached && Date.now() - cached.time < CACHE_TTL) {
              setCpus(cached.data.cpus);
              setExistingDuels(cached.data.duels);
              setLoading(false);
              return;
            }
          }
        } catch (e) { localStorage.removeItem(CACHE_KEY); }
      }
      try {
        // 🔥 FIX #1: SUPABASE HEADERS RESTORE 🔥
        const headers = { 
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` 
        };
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

        const [cRes, dRes] = await Promise.all([
          fetch(`${url}/rest/v1/cpus?select=id,name&order=performance_index.desc.nullslast`, { headers }),
          fetch(`${url}/rest/v1/cpu_duels?select=id,title_cs,title_en,slug,slug_en&order=created_at.desc&limit=10`, { headers })
        ]);

        const cData = await cRes.json();
        const dData = await dRes.json();
        setCpus(cData || []);
        setExistingDuels(dData || []);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: { cpus: cData, duels: dData }, time: Date.now() }));
      } catch (err) { console.error("Sync error"); } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const cpuMap = useMemo(() => Object.fromEntries(cpus.map(c => [c.id, c])), [cpus]);
  const selectedCpuA = cpuMap[Number(cpuA)];
  const selectedCpuB = cpuMap[Number(cpuB)];

  // 🔥 FIX #5: FEATURED GUARD 🔥
  const featuredCpu = useMemo(() => {
    if (!cpus.length) return null;
    const pool = [...cpus.slice(0, 3), ...cpus.slice(-3)];
    return pool[Math.floor(Math.random() * pool.length)];
  }, [cpus]);

  // 🔥 FIX #6: DYNAMIC CTA VARIANTS 🔥
  const ctaText = useMemo(() => {
    const poolEn = ["🔥 BEST PRICE NOW", "⚡ LIMITED DEAL", "💸 SAVE TODAY"];
    const poolCz = ["🔥 NEJLEPŠÍ CENA", "⚡ OMEZENÁ NABÍDKA", "💸 UŠETŘI DNES"];
    const pool = isEn ? poolEn : poolCz;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [selectedCpuB, isEn]);

  useEffect(() => {
    if (selectedCpuB?.name) {
      const prev = localStorage.getItem("guru_last_viewed_cpu");
      const parsed = prev ? JSON.parse(prev) : null;
      if (parsed?.name !== selectedCpuB.name) {
        localStorage.setItem("guru_last_viewed_cpu", JSON.stringify({ name: selectedCpuB.name, time: Date.now() }));
      }
      
      // 🔥 FIX #2: MEMORY LEAK GUARD (REUSE LINK) 🔥
      if (isEn) {
        const linkId = `preload-${selectedCpuB.id}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'preload'; link.as = 'document';
          link.href = getAmazonLink(selectedCpuB.name, "preload");
          document.head.appendChild(link);
        }
      }

      const btn = document.querySelector('.dynamic-cta-btn');
      btn?.classList.remove('pulse-button');
      void btn?.offsetWidth;
      btn?.classList.add('pulse-button');
    }
  }, [selectedCpuB, isEn]);

  const handleStartDuel = () => {
    if (!selectedCpuA || !selectedCpuB || cpuA === cpuB) return;
    const slugify = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").trim();
    const rawSlug = `${slugify(selectedCpuA.name)}-vs-${slugify(selectedCpuB.name)}`;
    window.location.href = isEn ? `/en/cpuvs/en-${rawSlug}` : `/cpuvs/${rawSlug}`;
  };

  // 🔥 FIX #3: DELAY CLICK FALLBACK (POPUP BLOCKER PROOF) 🔥
  const handleDelayedClick = (e, url) => {
    e.preventDefault();
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    
    const win = window.open('', '_blank');
    setTimeout(() => {
      if (win) {
        win.location.href = url;
      } else {
        window.location.href = url;
      }
    }, 120);
  };

  return (
    <div className="guru-hub-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '140px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      {/* 🔥 FIX #4: SCHEMA URL UPGRADE 🔥 */}
      <Script id="hub-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": isEn ? "CPU Gaming Comparisons 2026" : "Srovnání procesorů 2026",
        "itemListElement": cpus.slice(0, 10).map((c, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": c.name,
          "url": `${baseUrl}${isEn ? '/en' : ''}/cpu/${(c.slug || c.name).toLowerCase().replace(/\s+/g,'-')}`
        }))
      })}} />

      <div className="guru-hub-container">
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="hub-badge"><ShieldCheck size={14} /> GURU VS ENGINE</div>
          <h1 className="guru-main-title">
            {isEn ? "COMPARE" : "POROVNEJTE"} <span className="guru-highlight-title">{isEn ? "PROCESSORS" : "PROCESORY"}</span>
          </h1>
          
          {lastViewed && (
            <div style={{marginTop:'20px'}}>
              <a href={isEn ? getAmazonLink(lastViewed, "retarget") : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(lastViewed + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`} onClick={(e) => handleDelayedClick(e, isEn ? getAmazonLink(lastViewed, "retarget") : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(lastViewed + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`)} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{fontSize:'12px', color:'#f59e0b', fontWeight:'900', textTransform:'uppercase', textDecoration:'underline'}}>
                🔥 {isEn ? `STILL INTERESTED IN ${lastViewed}? CHECK PRICE` : `STÁLE TĚ ZAJÍMÁ ${lastViewed}? MRKNI NA CENU`}
              </a>
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <a 
              href={isEn ? amazonGlobalLink : heurekaGlobalLink} 
              onClick={(e) => handleDelayedClick(e, isEn ? amazonGlobalLink : heurekaGlobalLink)}
              className={`guru-buy-winner-btn hover-scale pulse-button ${!isEn ? 'heureka-btn heureka-hn-link' : 'amazon-btn'}`} 
              {...(!isEn && { "data-trixam-positionid": "276026", "data-trixam-content": "Text link", "data-trixam-medium": "affiliate" })}
            >
              <ShoppingCart size={18} /> 
              <span>{isEn ? '🔥 HOT 🔥 CHEAPEST CPU DEALS (LIVE PRICES)' : '🔥 HOT 🔥 NEJLEVNĚJŠÍ CPU DNES (LIVE CENY)'}</span>
            </a>
            
            <div style={{fontSize:'10px', opacity:0.6, marginTop:'8px'}}>
              {isEn ? "As an Amazon Associate I earn from qualifying purchases." : "Jako Amazon partner vydělávám z kvalifikovaných nákupů."}
            </div>
          </div>

          <section style={{ marginTop: '30px', maxWidth: '700px', margin: '30px auto', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
              {isEn 
                ? "Compare AMD Ryzen and Intel Core processors. See gaming FPS benchmarks, performance tests and live CPU prices updated daily." 
                : "Srovnejte procesory AMD Ryzen a Intel Core. Podívejte se na herní FPS benchmarky, testy výkonu a aktuální ceny procesorů aktualizované denně."}
            </p>
          </section>
        </header>

        <div className="hub-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <section className="generator-panel">
                  {loading ? (
                    <div style={{padding: '40px', textAlign: 'center', opacity: 0.3}} className="pulse-button">⚡ LOADING GURU DATABASE...</div>
                  ) : (
                    <>
                      <select className="guru-dropdown" value={cpuA} onChange={e => setCpuA(e.target.value)}>
                        <option value="">{isEn ? "-- Select CPU A --" : "-- Vyber CPU A --"}</option>
                        {cpus.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                      </select>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <button onClick={() => {const t=cpuA; setCpuA(cpuB); setCpuB(t);}} className="swap-btn" style={{borderRadius: '50%'}}><ArrowLeftRight size={20}/></button>
                      </div>
                      <select className="guru-dropdown" value={cpuB} onChange={e => setCpuB(e.target.value)}>
                        <option value="">{isEn ? "-- Select CPU B --" : "-- Vyber CPU B --"}</option>
                        {cpus.map(c => <option key={c.id} value={String(c.id)} disabled={String(c.id) === cpuA}>{c.name}</option>)}
                      </select>
                    </>
                  )}
                  
                  {!selectedCpuB && !loading && featuredCpu && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                      <a href={isEn ? getAmazonLink(featuredCpu.name, "default") : heurekaGlobalLink} onClick={(e) => handleDelayedClick(e, isEn ? getAmazonLink(featuredCpu.name, "default") : heurekaGlobalLink)} className="guru-buy-winner-btn hover-scale" style={{background:'linear-gradient(135deg,#10b981,#059669)', width: '100%', boxSizing: 'border-box', fontSize: '13px'}}>
                        <ShoppingCart size={14} /> <span>🔥 {isEn ? `BEST DEAL NOW: ${featuredCpu.name}` : `NEJLEPŠÍ DEAL DNES: ${featuredCpu.name}`}</span>
                      </a>
                    </div>
                  )}

                  {selectedCpuB && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <a
                            href={isEn ? getAmazonLink(selectedCpuB.name, "dynamic") : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(selectedCpuB.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`}
                            onClick={(e) => handleDelayedClick(e, isEn ? getAmazonLink(selectedCpuB.name, "dynamic") : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(selectedCpuB.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`)}
                            className="guru-buy-winner-btn dynamic-cta-btn hover-scale"
                            style={{background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', width: '100%', boxSizing: 'border-box', fontSize: '13px'}}
                            {...(!isEn && { "data-trixam-positionid": "276026", "data-trixam-content": "Text link", "data-trixam-medium": "affiliate" })}
                        >
                            <ShoppingCart size={14} /> <span>{ctaText} ↓ {selectedCpuB.name}</span>
                        </a>
                        
                        {selectedCpuA && (
                          <div style={{marginTop:'15px'}}>
                            <a href={isEn ? getAmazonLink(selectedCpuA.name, "crosssell") : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(selectedCpuA.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`} onClick={(e) => handleDelayedClick(e, isEn ? getAmazonLink(selectedCpuA.name, "crosssell") : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(selectedCpuA.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`)} style={{fontSize:'12px', color:'#f59e0b', textDecoration: 'underline', fontWeight: '900'}}>
                              🔥 {isEn ? `Better deal? Check ${selectedCpuA.name} price` : `Lepší nabídka? Mrkni na cenu ${selectedCpuA.name}`}
                            </a>
                          </div>
                        )}
                    </div>
                  )}

                  <button className="guru-battle-btn" onClick={handleStartDuel} disabled={!selectedCpuA || !selectedCpuB || cpuA === cpuB}>
                    <Zap fill="currentColor" size={24} /> {isEn ? "START BATTLE" : "SPUSTIT SOUBOJ"}
                  </button>
                </section>
            </div>

            <section className="history-panel">
              <h2 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '15px' }}><Flame size={20} color="#f97316" style={{display:'inline', marginRight:'10px'}}/> {isEn ? "RECENT" : "POSLEDNÍ"}</h2>
              {existingDuels.map((duel) => (
                <a href={`/${isEn ? 'en/' : ''}cpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} key={duel.id} className="compact-duel-item">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</span>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>Srovnat výkon a ceny →</span>
                  </div>
                  <ChevronRight size={18} color="#66fcf1" />
                </a>
              ))}
            </section>
        </div>
      </div>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
          <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }
        .pulse-button { animation: pulse-cta 2s infinite; }
        .sr-only { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
        .guru-hub-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hub-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 16px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .guru-main-title { font-size: clamp(2.2rem, 6vw, 4.5rem); font-weight: 950; color: #fff; text-transform: uppercase; line-height: 1; margin: 0; }
        .hub-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; margin-top: 40px; }
        .generator-panel { background: rgba(15, 17, 21, 0.95); backdrop-filter: blur(15px); border-radius: 30px; padding: 40px; border: 1px solid rgba(102, 252, 241, 0.2); }
        .guru-dropdown { width: 100%; padding: 18px 20px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 16px; font-size: 16px; font-weight: bold; outline: none; margin-bottom: 20px; }
        .swap-btn { background: none; border: 1px solid #333; color: #66fcf1; padding: 10px; cursor: pointer; transition: 0.3s; }
        .guru-battle-btn { width: 100%; padding: 20px; background: linear-gradient(135deg, #ff0055 0%, #990033 100%); color: #fff; border: 1px solid rgba(255,0,85,0.5); border-radius: 16px; font-weight: 950; font-size: 18px; text-transform: uppercase; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 12px; }
        .guru-battle-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }
        .compact-duel-item { background: rgba(15, 17, 21, 0.7); border: 1px solid rgba(255,255,255,0.05); padding: 14px 18px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; transition: 0.3s; margin-bottom: 10px; color: #fff; }
        .compact-duel-item:hover { border-color: #66fcf1; transform: translateX(5px); }
        .popular-duels a { color: #60a5fa; text-decoration: underline; font-size: 14px; font-weight: bold; display: block; margin-bottom: 8px; }
        .section-h2 { font-size: 1.4rem; font-weight: 950; text-transform: uppercase; margin-bottom: 15px; color: #fff; }
        .guru-buy-winner-btn { border-radius: 14px; text-decoration: none; font-weight: 950; font-size: 15px; text-transform: uppercase; transition: 0.3s; color: #fff; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: none; cursor: pointer; }
        .guru-buy-winner-btn:hover span { transform: translateX(3px); transition: 0.3s; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); }
        .amazon-btn { background: #f59e0b; color: #000; }
        .hover-scale:hover { transform: translateY(-2px) scale(1.01); filter: brightness(1.1); }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        @media (max-width: 768px) {
            .guru-hub-wrapper { padding-top: 80px !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-h1 { font-size: 1.8rem !important; }
            .guru-buy-winner-btn { width: 100%; justify-content: center; padding: 16px 24px; font-size: 14px; }
        }
      `}} />
    </div>
  );
}
