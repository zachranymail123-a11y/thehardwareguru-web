'use client';
import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, X, Activity, Target, Cpu, Gamepad2, Flame, Lightbulb, RefreshCw, CheckCircle2 } from 'lucide-react';

/**
 * GURU AI NAVIGATOR - ULTIMATE PERFECTION EDITION (Fix & Filter V2)
 * * Změny:
 * 1. Syntax Fix: Opraven mismatch tagu span/h4, který shazoval build.
 * 2. Module Recovery: Robustní fallback pro next/link a supabase v Canvasu.
 * 3. Supreme Anti-Cron Filter: Totální filtrace streamů (🔴) a shorts.
 * 4. UX: Zachován osobní pozdrav GURU průvodce.
 */

// --- 🛡️ GURU SAFE MODULE LOADER (Fix pro chyby resolve/build) ---
let Link = ({ children, ...props }) => <a {...props}>{children}</a>;
let usePathname = () => '';
let createClient = () => {
  const chain = { 
    select: () => chain, 
    neq: () => chain, 
    or: () => chain,
    order: () => chain, 
    limit: () => Promise.resolve({ data: [] }) 
  };
  return { from: () => chain };
};

try {
  const NextLink = require('next/link');
  Link = NextLink.default || NextLink;
} catch (e) {}

try {
  const NextNav = require('next/navigation');
  usePathname = NextNav.usePathname;
} catch (e) {}

try {
  const Supa = require('@supabase/supabase-js');
  createClient = Supa.createClient;
} catch (e) {}

// --- GURU INIT: Základní nastavení ---
let initialUrl = '';
let initialKey = '';
if (typeof process !== 'undefined') {
  initialUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  initialKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

const defaultSupabase = createClient(initialUrl || 'https://placeholder.supabase.co', initialKey || 'placeholder');

export default function SestavyBubble() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState('Skener...');
  const [archetypeIcon, setArchetypeIcon] = useState(<Activity size={12} />);
  const [isScanning, setIsScanning] = useState(true);
  const [rerollTrigger, setRerollTrigger] = useState(0); 
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');
  const langPrefix = isEn ? '/en' : '';

  const isAdmin = pathname.includes('/admin') || (typeof window !== 'undefined' && window.location.pathname.includes('/admin'));

  useEffect(() => {
    setIsClient(true);
    if (isAdmin) return;
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isAdmin]);

  // 👁️ GURU SITE-WIDE TRACKING
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined') return;
    const currentSlug = pathname.split('/').pop();
    if (currentSlug && (pathname.includes('/clanky') || pathname.includes('/tipy') || pathname.includes('/tweaky'))) {
      let seenItems = JSON.parse(localStorage.getItem('guru_ai_seen') || '[]');
      if (!seenItems.includes(currentSlug)) {
        seenItems.push(currentSlug);
        if (seenItems.length > 100) seenItems.shift();
        localStorage.setItem('guru_ai_seen', JSON.stringify(seenItems));
      }
    }
  }, [pathname, isAdmin]);

  // 🚀 GURU ULTIMATE AI ENGINE
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined') return;

    let isMounted = true;

    const fetchAndAnalyze = async () => {
      if (isMounted) setIsScanning(true);
      
      try {
        let activeSupabase = defaultSupabase;
        const bridge = document.getElementById('guru-env-bridge');
        if (bridge) {
          const bUrl = bridge.getAttribute('data-url');
          const bKey = bridge.getAttribute('data-key');
          if (bUrl && bKey && bUrl !== initialUrl) {
            activeSupabase = createClient(bUrl, bKey);
          }
        }

        // 1. Profiling
        let profile = JSON.parse(localStorage.getItem('guru_archetype') || '{"hw":0, "games":0, "deals":0, "tips":0}');
        let seenItems = JSON.parse(localStorage.getItem('guru_ai_seen') || '[]');
        
        if (pathname.includes('/clanky') || pathname.includes('/tweaky')) profile.hw += 1.5;
        if (pathname.includes('/ocekavane-hry')) profile.games += 1.5;
        if (pathname.includes('/deals')) profile.deals += 2.0; 
        if (pathname.includes('/tipy')) profile.tips += 1.0;

        if (profile.hw > 15 || profile.games > 15 || profile.deals > 15 || profile.tips > 15) {
           profile.hw *= 0.7; profile.games *= 0.7; profile.deals *= 0.7; profile.tips *= 0.7;
        }
        localStorage.setItem('guru_archetype', JSON.stringify(profile));

        let dominantType = 'hw';
        let maxScore = 0;
        for (const [key, value] of Object.entries(profile)) {
          if (value > maxScore) { maxScore = value; dominantType = key; }
        }

        const currentSlug = pathname.split('/').pop() || '';
        const keywords = currentSlug.split('-').filter(w => w.length > 3);

        // 2. Fetch Data (Zvětšený pool pro lepší filtraci)
        const safeFetch = async (promise) => {
          const res = await promise;
          return { data: res.data || [] };
        };

        const [postsRes, dealsRes, tipsRes] = await Promise.all([
          safeFetch(activeSupabase.from('posts').select('title, title_en, slug, slug_en, image_url, type').order('created_at', { ascending: false }).limit(40)),
          safeFetch(activeSupabase.from('game_deals').select('title, image_url, price_cs, price_en, affiliate_link').order('created_at', { ascending: false }).limit(10)),
          safeFetch(activeSupabase.from('tipy').select('title, title_en, slug, slug_en, image_url').order('created_at', { ascending: false }).limit(10))
        ]);

        let combinedPool = [];
        (postsRes.data || []).forEach(p => combinedPool.push({ ...p, source: 'posts', finalUrl: `${langPrefix}/${p.type === 'expected' ? 'ocekavane-hry' : 'clanky'}/${isEn ? (p.slug_en || p.slug) : p.slug}` }));
        (dealsRes.data || []).forEach(d => combinedPool.push({ ...d, type: 'deal', source: 'deals', finalUrl: d.affiliate_link || `${langPrefix}/deals`, slug: d.title }));
        (tipsRes.data || []).forEach(t => combinedPool.push({ ...t, type: 'tip', source: 'tipy', finalUrl: `${langPrefix}/tipy/${isEn ? (t.slug_en || t.slug) : t.slug}` }));

        // 🚀 3. SUPREME ANTI-CRON FILTER (Likvidace 🔴 Streamů a Shorts)
        let filteredItems = combinedPool.filter(item => {
          const title = (item.title || '').toLowerCase();
          const isCurrent = item.slug === currentSlug || item.slug_en === currentSlug;
          const isSeen = seenItems.includes(item.slug) || seenItems.includes(item.slug_en);
          
          // Klíčová slova, která cron hází k streamům a youtube balastu
          const trashWords = ['🔴', 'live', 'guru je live', 'stream', 'shorts', '#shorts', 'záznam'];
          const isTrash = trashWords.some(word => title.includes(word));
          
          return !isCurrent && !isSeen && !isTrash;
        });

        if (filteredItems.length < 3) filteredItems = combinedPool.slice(0, 10);

        // 4. Scoring
        let scoredItems = filteredItems.map(item => {
          let score = Math.random() * 5; 
          const title = (item.title || '').toLowerCase();
          const titleEn = (item.title_en || '').toLowerCase();

          if (dominantType === 'hw' && item.type === 'hardware') score += 15;
          if (dominantType === 'games' && (item.type === 'game' || item.type === 'expected')) score += 15;
          if (dominantType === 'deals' && item.type === 'deal') score += 20;
          if (dominantType === 'tips' && item.type === 'tip') score += 15;

          keywords.forEach(kw => { if (title.includes(kw) || titleEn.includes(kw)) score += 10; });
          return { ...item, score };
        });

        const top3 = scoredItems.sort((a, b) => b.score - a.score).slice(0, 3);
        
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

  if (!isClient || isAdmin || !isVisible) return null;

  return (
    <div className="guru-ai-container">
      <style>{`
        @keyframes guruSlideUp { from { transform: translateY(150px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes guruPulse { 0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(168, 85, 247, 0); } 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); } }
        @keyframes scanBar { 0% { width: 0%; opacity: 1; } 90% { width: 100%; opacity: 1; } 100% { width: 100%; opacity: 0; } }
        @keyframes fadeInStagger { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

        .guru-ai-container { position: fixed; bottom: 20px; left: 20px; z-index: 9998; animation: guruSlideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; font-family: sans-serif; }
        @media (max-width: 768px) { .guru-ai-container { bottom: 80px; left: 10px; } }

        .guru-ai-panel {
          background: rgba(12, 14, 18, 0.98); border: 1px solid rgba(168, 85, 247, 0.4);
          border-radius: 16px; padding: 15px; width: 280px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(168, 85, 247, 0.05);
          backdrop-filter: blur(20px); transition: all 0.4s ease; position: relative; overflow: hidden;
        }

        .guru-ai-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 12px; }
        .guru-scan-line { position: absolute; top: 0; left: 0; height: 2px; background: #a855f7; animation: scanBar 0.8s ease-out forwards; box-shadow: 0 0 10px #a855f7; }

        .guru-ai-rec-item {
          display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px;
          text-decoration: none; transition: 0.3s; background: rgba(0,0,0,0.4);
          border: 1px solid transparent; margin-bottom: 8px;
          animation: fadeInStagger 0.4s ease forwards; opacity: 0;
        }
        .guru-ai-rec-item:nth-child(1) { animation-delay: 0.1s; }
        .guru-ai-rec-item:nth-child(2) { animation-delay: 0.2s; }
        .guru-ai-rec-item:nth-child(3) { animation-delay: 0.3s; }

        .guru-ai-rec-item:hover { background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); transform: translateX(5px); }
        .guru-ai-rec-item:last-child { margin-bottom: 0; }

        .guru-reroll-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #9ca3af;
          border-radius: 8px; padding: 4px 8px; font-size: 9px; font-weight: 900; cursor: pointer;
          display: flex; align-items: center; gap: 4px; transition: 0.2s; text-transform: uppercase;
        }
        .guru-reroll-btn:hover { background: rgba(168, 85, 247, 0.2); color: #fff; border-color: #a855f7; }

        .guru-ai-minimized {
          width: 50px; height: 50px; background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
          box-shadow: 0 10px 20px rgba(168, 85, 247, 0.4); animation: guruPulse 2s infinite;
          border: 2px solid #e9d5ff; transition: 0.3s;
        }
        .guru-ai-minimized:hover { transform: scale(1.1) rotate(5deg); }
      `}</style>

      {isMinimized ? (
        <div className="guru-ai-minimized" onClick={() => setIsMinimized(false)} title={isEn ? "Open GURU Guide" : "Otevřít GURU průvodce"}>
          <Brain color="#fff" size={24} />
        </div>
      ) : (
        <div className="guru-ai-panel">
          {isScanning && <div className="guru-scan-line"></div>}
          <button 
            onClick={() => setIsMinimized(true)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '5px' }}
          >
            <X size={16} />
          </button>

          <div className="guru-ai-header">
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: isScanning ? '#374151' : '#a855f7', padding: '8px', borderRadius: '10px', display: 'flex', transition: '0.3s', alignItems: 'center' }}>
                <Brain color="#fff" size={20} className={isScanning ? "animate-pulse" : ""} />
              </div>
              <div style={{ paddingTop: '2px', paddingRight: '15px' }}>
                <h4 style={{ color: '#fff', margin: 0, fontSize: '11px', fontWeight: '950', letterSpacing: '0.2px', lineHeight: '1.4' }}>
                  {isEn 
                    ? "HI, I'M GURU, YOUR PERSONAL GUIDE THROUGH THIS AWESOME SITE." 
                    : "AHOJ, JSEM GURU, TVŮJ OSOBNÍ PRŮVODCE TÍMTO VYMAKANÝM WEBEM."}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  {isScanning ? (
                    <span style={{ color: '#9ca3af', fontSize: '9px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {isEn ? '> scanning profile...' : '> skenuji profil...'}
                    </span>
                  ) : (
                    <>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {archetypeIcon}
                        <span style={{ color: '#e5e7eb', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                           {userProfile}
                        </span>
                      </span>
                      <CheckCircle2 size={10} color="#10b981" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="guru-ai-list" style={{ minHeight: '170px' }}>
            {isScanning ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', opacity: 0.5, paddingTop: '40px' }}>
                <Activity className="animate-spin" size={24} color="#a855f7" />
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#a855f7' }}>{isEn ? "COMPUTING..." : "HLEDÁM OBSAH..."}</span>
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
                      key={idx + rerollTrigger}
                      {...wrapperProps}
                      className="guru-ai-rec-item"
                    >
                      <img 
                        src={post.image_url || 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=100&q=80'} 
                        alt={title}
                        style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h5 style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 'bold', margin: '0 0 3px 0', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {title}
                        </h5>
                        {/* 🚀 GURU FIX: Opraven mismatch tagu z </h4> na </span> */}
                        <span style={{ color: badgeColor, fontSize: '9px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {badgeText}
                        </span>
                      </div>
                      <ChevronRight size={16} color="#9ca3af" />
                    </WrapperTag>
                  )
                })}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <button className="guru-reroll-btn" onClick={() => setRerollTrigger(prev => prev + 1)}>
                    <RefreshCw size={10} className="reroll-icon" /> {isEn ? 'REROLL' : 'PŘEGENEROVAT'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', marginTop: '40px', fontWeight: 'bold' }}>
                {isEn ? "NO NEW CONTENT" : "ŽÁDNÝ NOVÝ OBSAH"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
