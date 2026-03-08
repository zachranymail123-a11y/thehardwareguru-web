'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Sparkles, ChevronRight, X, Activity, Target, Cpu, Gamepad2, Flame, Lightbulb, RefreshCw, CheckCircle2 } from 'lucide-react';

// --- BEZPEČNÝ SUPABASE INIT PRO CANVAS ---
let createClient = () => {
  const chain = { neq: () => chain, order: () => chain, limit: () => Promise.resolve({ data: [] }) };
  return { from: () => ({ select: () => chain }) };
};
try { const mod = '@supabase/supabase-js'; createClient = require(mod).createClient; } catch (e) {}

let supabaseUrl = '';
let supabaseKey = '';
try {
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
} catch (e) {}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GURU AI NAVIGATOR - ULTIMATE PERFECTION EDITION
 * Obsahuje: Behaviorální archetypy, Anti-Fatigue paměť (Seen items), 
 * Contextual Keyword Matching (čte url) a Cyberpunk Scanning UX.
 */
export default function SestavyBubble() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState('Skener...');
  const [archetypeIcon, setArchetypeIcon] = useState(<Activity size={12} />);
  const [isScanning, setIsScanning] = useState(true);
  const [rerollTrigger, setRerollTrigger] = useState(0); // Pro manuální refresh
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');
  const langPrefix = isEn ? '/en' : '';

  // 🛡️ GURU SHIELD: Blokace adminu
  const isAdmin = pathname.includes('/admin') || (typeof window !== 'undefined' && window.location.pathname.includes('/admin'));

  useEffect(() => {
    setIsClient(true);
    if (isAdmin) return;
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isAdmin]);

  // 🚀 GURU ULTIMATE AI ENGINE
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined') return;

    let isMounted = true;

    const fetchAndAnalyze = async () => {
      if (isMounted) setIsScanning(true);
      
      try {
        // 1. NAČTENÍ PROFILU A HISTORIE (Anti-Fatigue)
        let profile = JSON.parse(localStorage.getItem('guru_archetype') || '{"hw":0, "games":0, "deals":0, "tips":0}');
        let seenItems = JSON.parse(localStorage.getItem('guru_ai_seen') || '[]');
        
        // Bodování podle URL
        if (pathname.includes('/clanky') || pathname.includes('/tweaky')) profile.hw += 1.5;
        if (pathname.includes('/ocekavane-hry') || pathname.includes('/mikrorecenze')) profile.games += 1.5;
        if (pathname.includes('/deals')) profile.deals += 2.0; 
        if (pathname.includes('/tipy') || pathname.includes('/rady') || pathname.includes('/slovnik')) profile.tips += 1.0;

        // Normalizace profilu (Decay)
        if (profile.hw > 15 || profile.games > 15 || profile.deals > 15 || profile.tips > 15) {
           profile.hw *= 0.7; profile.games *= 0.7; profile.deals *= 0.7; profile.tips *= 0.7;
        }
        localStorage.setItem('guru_archetype', JSON.stringify(profile));

        // 2. DETEKCE ARCHETYPU
        let dominantType = 'hw';
        let maxScore = 0;
        for (const [key, value] of Object.entries(profile)) {
          if (value > maxScore) { maxScore = value; dominantType = key; }
        }

        // 3. EXTRAKCE KLÍČOVÝCH SLOV Z URL PRO SÉMANTICKÝ MATCH
        const currentSlug = pathname.split('/').pop() || '';
        const keywords = currentSlug.split('-').filter(w => w.length > 3); // Slova delší než 3 znaky (např. 'rtx', 'recenze')

        // 4. FETCH VĚTŠÍHO POOLU DAT
        const [postsRes, dealsRes, tipsRes] = await Promise.all([
          supabase.from('posts').select('title, title_en, slug, slug_en, image_url, type').order('created_at', { ascending: false }).limit(15),
          supabase.from('game_deals').select('title, title_en:title, slug:id, slug_en:id, image_url, price_cs, price_en, affiliate_link').order('created_at', { ascending: false }).limit(5),
          supabase.from('tipy').select('title, title_en, slug, slug_en, image_url').order('created_at', { ascending: false }).limit(5)
        ]);

        let combinedPool = [];
        (postsRes.data || []).forEach(p => combinedPool.push({ ...p, sourceTable: 'posts', finalUrl: `${langPrefix}/${p.type === 'expected' ? 'ocekavane-hry' : 'clanky'}/${isEn ? (p.slug_en || p.slug) : p.slug}` }));
        (dealsRes.data || []).forEach(d => combinedPool.push({ ...d, type: 'deal', sourceTable: 'deals', finalUrl: d.affiliate_link || `${langPrefix}/deals` }));
        (tipsRes.data || []).forEach(t => combinedPool.push({ ...t, type: 'tip', sourceTable: 'tipy', finalUrl: `${langPrefix}/tipy/${isEn ? (t.slug_en || t.slug) : t.slug}` }));

        // 5. GURU DEEP SCORING ALGORITHM
        let scoredItems = combinedPool
          .filter(item => item.slug !== currentSlug && item.slug_en !== currentSlug) // Vyřadí aktuální
          .map(item => {
            let itemScore = Math.random() * 3; // Vyšší random pro reroll variabilitu

            const itemTitle = (item.title || '').toLowerCase();
            const itemTitleEn = (item.title_en || '').toLowerCase();

            // A) Archetype Boost (Masivní priorita)
            if (dominantType === 'hw' && item.type === 'hardware') itemScore += 15;
            if (dominantType === 'games' && item.type === 'game') itemScore += 15;
            if (dominantType === 'games' && item.type === 'expected') itemScore += 18; 
            if (dominantType === 'deals' && item.type === 'deal') itemScore += 20;
            if (dominantType === 'tips' && item.type === 'tip') itemScore += 15;

            // B) Contextual Keyword Boost (Sémantický match s aktuálním článkem)
            keywords.forEach(kw => {
               if (itemTitle.includes(kw) || itemTitleEn.includes(kw)) itemScore += 8;
            });

            // C) Anti-Fatigue (Už to viděl/klikl? Zahoď to dolů)
            if (seenItems.includes(item.slug)) itemScore -= 50;

            return { ...item, itemScore };
          });

        const top3 = scoredItems.sort((a, b) => b.itemScore - a.itemScore).slice(0, 3);
        
        // Simulace skenování (Cyberpunk UX delay)
        setTimeout(() => {
          if (!isMounted) return;
          
          if (dominantType === 'hw') { setUserProfile(isEn ? 'Hardware Geek' : 'HW Nadšenec'); setArchetypeIcon(<Cpu size={12} color="#66fcf1" />); }
          else if (dominantType === 'games') { setUserProfile(isEn ? 'Hardcore Gamer' : 'Pařmen'); setArchetypeIcon(<Gamepad2 size={12} color="#ff0055" />); }
          else if (dominantType === 'deals') { setUserProfile(isEn ? 'Deal Hunter' : 'Lovec Slev'); setArchetypeIcon(<Flame size={12} color="#f97316" />); }
          else { setUserProfile(isEn ? 'Tech Padawan' : 'Tech Učeň'); setArchetypeIcon(<Lightbulb size={12} color="#a855f7" />); }
          
          setRecommendations(top3);
          setIsScanning(false);
        }, 800);

      } catch (error) {
        console.error("Guru AI Navigator Error:", error);
        if (isMounted) setIsScanning(false);
      }
    };

    fetchAndAnalyze();
    return () => { isMounted = false; };
  }, [pathname, isAdmin, isEn, rerollTrigger]);

  const handleItemClick = (slug) => {
    // Uložení do Anti-Fatigue paměti
    let seenItems = JSON.parse(localStorage.getItem('guru_ai_seen') || '[]');
    if (!seenItems.includes(slug)) {
      seenItems.push(slug);
      if (seenItems.length > 20) seenItems.shift(); // Pamatuje si posledních 20 kliknutí
      localStorage.setItem('guru_ai_seen', JSON.stringify(seenItems));
    }
  };

  if (!isClient || isAdmin || !isVisible) return null;

  return (
    <div className="guru-ai-container">
      <style>{`
        @keyframes guruSlideUp { from { transform: translateY(150px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes guruPulse { 0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(168, 85, 247, 0); } 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); } }
        @keyframes scanBar { 0% { width: 0%; opacity: 1; } 90% { width: 100%; opacity: 1; } 100% { width: 100%; opacity: 0; } }
        @keyframes fadeInStagger { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

        .guru-ai-container { position: fixed; bottom: 30px; left: 30px; z-index: 9998; animation: guruSlideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; font-family: sans-serif; }
        @media (max-width: 768px) { .guru-ai-container { bottom: 90px; left: 15px; } }

        .guru-ai-panel {
          background: rgba(12, 14, 18, 0.98); border: 1px solid rgba(168, 85, 247, 0.4);
          border-radius: 20px; padding: 20px; width: 340px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), inset 0 0 30px rgba(168, 85, 247, 0.05);
          backdrop-filter: blur(20px); transition: all 0.4s ease; position: relative; overflow: hidden;
        }

        .guru-ai-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; margin-bottom: 15px; }
        
        .guru-scan-line { position: absolute; top: 0; left: 0; height: 2px; background: #a855f7; animation: scanBar 0.8s ease-out forwards; box-shadow: 0 0 10px #a855f7; }

        .guru-ai-rec-item {
          display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px;
          text-decoration: none; transition: 0.3s; background: rgba(0,0,0,0.4);
          border: 1px solid transparent; margin-bottom: 10px;
          animation: fadeInStagger 0.4s ease forwards; opacity: 0;
        }
        .guru-ai-rec-item:nth-child(1) { animation-delay: 0.1s; }
        .guru-ai-rec-item:nth-child(2) { animation-delay: 0.2s; }
        .guru-ai-rec-item:nth-child(3) { animation-delay: 0.3s; }

        .guru-ai-rec-item:hover { background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); transform: translateX(6px); }
        .guru-ai-rec-item:last-child { margin-bottom: 0; }

        .guru-reroll-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #9ca3af;
          border-radius: 8px; padding: 4px 8px; font-size: 10px; font-weight: 900; cursor: pointer;
          display: flex; align-items: center; gap: 4px; transition: 0.2s; text-transform: uppercase;
        }
        .guru-reroll-btn:hover { background: rgba(168, 85, 247, 0.2); color: #fff; border-color: #a855f7; }
        .guru-reroll-btn:active .reroll-icon { transform: rotate(180deg); transition: 0.3s; }

        .guru-ai-minimized {
          width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4); animation: guruPulse 2s infinite;
          border: 2px solid #e9d5ff; transition: 0.3s;
        }
        .guru-ai-minimized:hover { transform: scale(1.1) rotate(5deg); }
      `}</style>

      {isMinimized ? (
        <div className="guru-ai-minimized" onClick={() => setIsMinimized(false)} title={isEn ? "Open AI Navigator" : "Otevřít AI Navigátor"}>
          <Brain color="#fff" size={28} />
        </div>
      ) : (
        <div className="guru-ai-panel">
          {isScanning && <div className="guru-scan-line"></div>}
          
          <button 
            onClick={() => setIsMinimized(true)}
            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '5px' }}
          >
            <X size={18} />
          </button>

          <div className="guru-ai-header">
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: isScanning ? '#374151' : '#a855f7', padding: '10px', borderRadius: '12px', display: 'flex', transition: '0.3s' }}>
                <Brain color="#fff" size={22} className={isScanning ? "animate-pulse" : ""} />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: 0, fontSize: '15px', fontWeight: '950', letterSpacing: '0.5px' }}>
                  GURU AI NAVIGATOR
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  {isScanning ? (
                    <span style={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {isEn ? '> scanning footprint...' : '> analyzuji stopu...'}
                    </span>
                  ) : (
                    <>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {archetypeIcon}
                        <span style={{ color: '#e5e7eb', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                           {userProfile}
                        </span>
                      </span>
                      <CheckCircle2 size={12} color="#10b981" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="guru-ai-list" style={{ minHeight: '220px' }}>
            {isScanning ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px', opacity: 0.5 }}>
                <Activity className="animate-spin" size={30} color="#a855f7" />
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#a855f7' }}>{isEn ? "COMPUTING NEURAL PATHS..." : "VÝPOČET NEURONOVÝCH TRAS..."}</span>
              </div>
            ) : recommendations.length > 0 ? (
              <>
                {recommendations.map((post, idx) => {
                  const title = isEn ? (post.title_en || post.title) : post.title;
                  const isExternal = post.finalUrl.startsWith('http');
                  
                  let badgeText = isEn ? 'READ MORE' : 'ČÍST VÍCE';
                  let badgeColor = '#a855f7'; 
                  
                  if (post.type === 'deal') {
                    badgeText = isEn ? `BUY (${post.price_en || ''})` : `KOUPIT (${post.price_cs || ''})`;
                    badgeColor = '#f97316'; 
                  } else if (post.type === 'game' || post.type === 'expected') {
                    badgeText = isEn ? 'GAME NEWS' : 'HERNÍ INFO';
                    badgeColor = '#ff0055'; 
                  }

                  const WrapperTag = isExternal ? 'a' : Link;
                  const wrapperProps = isExternal 
                    ? { href: post.finalUrl, target: "_blank", rel: "nofollow sponsored" }
                    : { href: post.finalUrl };

                  return (
                    <WrapperTag 
                      key={idx + rerollTrigger} // Klíč reaguje na reroll pro restart animace
                      {...wrapperProps}
                      className="guru-ai-rec-item"
                      onClick={() => handleItemClick(post.slug)}
                    >
                      <img 
                        src={post.image_url || 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=100&q=80'} 
                        alt={title}
                        style={{ width: '55px', height: '55px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h5 style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 'bold', margin: '0 0 5px 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {title}
                        </h5>
                        <span style={{ color: badgeColor, fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {badgeText}
                        </span>
                      </div>
                      <ChevronRight size={18} color="#9ca3af" />
                    </WrapperTag>
                  )
                })}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                  <button className="guru-reroll-btn" onClick={() => setRerollTrigger(prev => prev + 1)}>
                    <RefreshCw size={12} className="reroll-icon" /> {isEn ? 'REROLL PREDICTIONS' : 'PŘEGENEROVAT'}
                  </button>
                </div>
              </>
            ) : null}
          </div>

        </div>
      )}
    </div>
  );
}
