'use client';
import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, X, Activity, Cpu, Gamepad2, Flame, Lightbulb, RefreshCw, CheckCircle2 } from 'lucide-react';
import SeznamAd from './SeznamAd';

/**
 * GURU AI NAVIGATOR - SEZNAM AD & GAME AFFILIATE EDITION
 * 🚀 CÍL: 100% integrace Seznam reklamy a herního affiliate obsahu.
 */

// --- 🛡️ GURU SAFE MODULE LOADER ---
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

// --- GURU INIT ---
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

        localStorage.setItem('guru_archetype', JSON.stringify(profile));

        let dominantType = 'hw';
        let maxScore = 0;
        for (const [key, value] of Object.entries(profile)) {
          if (value > maxScore) { maxScore = value; dominantType = key; }
        }

        // 2. Fetch Data (Získáváme mix pro herní weby)
        const [postsRes, tipsRes] = await Promise.all([
          activeSupabase.from('posts').select('title, title_en, slug, slug_en, image_url, type').order('created_at', { ascending: false }).limit(30),
          activeSupabase.from('tipy').select('title, title_en, slug, slug_en, image_url').order('created_at', { ascending: false }).limit(10)
        ]);

        let combinedPool = [];
        (postsRes.data || []).forEach(p => combinedPool.push({ ...p, source: 'posts', finalUrl: `${langPrefix}/${p.type === 'expected' ? 'ocekavane-hry' : 'clanky'}/${isEn ? (p.slug_en || p.slug) : p.slug}` }));
        (tipsRes.data || []).forEach(t => combinedPool.push({ ...t, type: 'tip', source: 'tipy', finalUrl: `${langPrefix}/tipy/${isEn ? (t.slug_en || t.slug) : t.slug}` }));

        // 3. Filter & Score
        let scoredItems = combinedPool
          .filter(item => !seenItems.includes(item.slug))
          .map(item => ({ ...item, score: Math.random() * 10 }));

        const finalRecs = scoredItems.sort((a, b) => b.score - a.score).slice(0, 5);
        
        setTimeout(() => {
          if (!isMounted) return;
          if (dominantType === 'hw') { setUserProfile(isEn ? 'Hardware Geek' : 'HW Nadšenec'); setArchetypeIcon(<Cpu size={12} color="#66fcf1" />); }
          else if (dominantType === 'games') { setUserProfile(isEn ? 'Hardcore Gamer' : 'Pařmen'); setArchetypeIcon(<Gamepad2 size={12} color="#ff0055" />); }
          else if (dominantType === 'deals') { setUserProfile(isEn ? 'Deal Hunter' : 'Lovec Slev'); setArchetypeIcon(<Flame size={12} color="#f97316" />); }
          else { setUserProfile(isEn ? 'Tech Padawan' : 'Tech Učeň'); setArchetypeIcon(<Lightbulb size={12} color="#a855f7" />); }
          
          setRecommendations(finalRecs);
          setIsScanning(false);
        }, 800);

      } catch (error) {
        if (isMounted) setIsScanning(false);
      }
    };

    fetchAndAnalyze();
    return () => { isMounted = false; };
  }, [pathname, isAdmin, rerollTrigger]);

  if (!isClient || isAdmin || !isVisible) return null;

  return (
    <div className="guru-ai-container">
      <style>{`
        .guru-ai-container { position: fixed; bottom: 20px; left: 20px; z-index: 9998; font-family: sans-serif; }
        @media (max-width: 768px) { .guru-ai-container { display: none !important; } }
        .guru-ai-panel { background: rgba(12, 14, 18, 0.98); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 16px; padding: 15px; width: 300px; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px); position: relative; }
        .guru-ai-header { display: flex; gap: 12px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
        .guru-ai-rec-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; text-decoration: none; background: rgba(0,0,0,0.4); margin-bottom: 8px; transition: 0.2s; border: 1px solid transparent; }
        .guru-ai-rec-item:hover { background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.3); }
        .guru-ad-slot { margin: 10px 0; background: #000; border-radius: 8px; overflow: hidden; display: flex; justify-content: center; border: 1px solid rgba(255,255,255,0.05); }
      `}</style>

      {isMinimized ? (
        <div className="guru-ai-minimized" onClick={() => setIsMinimized(false)} style={{ width: '50px', height: '50px', background: '#a855f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Brain color="#fff" size={24} />
        </div>
      ) : (
        <div className="guru-ai-panel">
          <button onClick={() => setIsMinimized(true)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={16} /></button>
          
          <div className="guru-ai-header">
            <div style={{ background: '#a855f7', padding: '8px', borderRadius: '10px' }}><Brain color="#fff" size={20} /></div>
            <div>
              <h4 style={{ color: '#fff', margin: 0, fontSize: '11px', fontWeight: '950' }}>{isEn ? "GURU AI GUIDE" : "AHOJ, JSEM GURU PRŮVODCE"}</h4>
              <span style={{ color: '#9ca3af', fontSize: '9px', textTransform: 'uppercase' }}>{userProfile}</span>
            </div>
          </div>

          <div className="guru-ai-list">
            {recommendations.slice(0, 2).map((post, idx) => (
              <Link key={idx} href={post.finalUrl} className="guru-ai-rec-item">
                <img src={post.image_url} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                <div style={{ flex: 1 }}><h5 style={{ color: '#fff', fontSize: '11px', margin: 0 }}>{isEn ? (post.title_en || post.title) : post.title}</h5></div>
                <ChevronRight size={14} color="#9ca3af" />
              </Link>
            ))}

            {/* 🔥 GURU MONEY MAKER: SEZNAM REKLAMA UVNITŘ PANELU */}
            <div className="guru-ad-slot">
              <SeznamAd zoneId={408651} width={300} height={250} />
            </div>

            {recommendations.slice(2, 5).map((post, idx) => (
              <Link key={idx + 2} href={post.finalUrl} className="guru-ai-rec-item">
                <img src={post.image_url} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                <div style={{ flex: 1 }}><h5 style={{ color: '#fff', fontSize: '11px', margin: 0 }}>{isEn ? (post.title_en || post.title) : post.title}</h5></div>
                <ChevronRight size={14} color="#9ca3af" />
              </Link>
            ))}
          </div>

          <button onClick={() => setRerollTrigger(prev => prev + 1)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9ca3af', fontSize: '9px', padding: '8px', cursor: 'pointer', borderRadius: '8px', marginTop: '5px' }}>
            <RefreshCw size={10} style={{ marginRight: '5px' }} /> {isEn ? 'REFRESH TIPS' : 'PŘEGENEROVAT TIPY'}
          </button>
        </div>
      )}
    </div>
  );
}
