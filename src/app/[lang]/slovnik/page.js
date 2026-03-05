"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Home, Lightbulb, Book, PenTool, ChevronRight, Search } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SlovnikPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [pojmy, setPojmy] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false); // GURU: Stav pro modal

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    async function loadSlovnik() {
      const { data } = await supabase.from('slovnik').select('*').order('title', { ascending: true });
      if (data) setPojmy(data);
    }
    loadSlovnik();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [pRes, tipRes, tweakRes] = await Promise.all([
          supabase.from('posts').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tipy').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('tweaky').select('title, slug').ilike('title', `%${searchQuery}%`).limit(3)
        ]);
        let results = [];
        const isEn = params?.lang === 'en';
        if (pRes.data) results = [...results, ...pRes.data.map(x => ({ ...x, category: isEn ? 'Article' : 'Článek', link: `/clanky/${x.slug}` }))];
        if (tipRes.data) results = [...results, ...tipRes.data.map(x => ({ ...x, category: 'Tip', link: `/tipy/${x.slug}` }))];
        if (tweakRes.data) results = [...results, ...tweakRes.data.map(x => ({ ...x, category: 'Tweak', link: `/tweaky/${x.slug}` }))];
        setSearchResults(results);
      } catch (err) { console.error("Search error:", err); } finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, mounted, params?.lang]);

  if (!mounted) return null;

  const lang = params?.lang || 'cs';
  const isEn = lang === 'en';
  const baseUrl = isEn ? '/en' : '';

  const t = {
    title1: "GURU HARDWARE",
    title2: isEn ? "DICTIONARY" : "SLOVNÍK",
    subtitle: isEn ? "Your technical knowledge starts here." : "Tvé technické znalosti začínají zde.",
    searchPlaceholder: isEn ? "Search the whole site..." : "Hledat na celém webu...",
    detailBtn: isEn ? "Show detail" : "Zobrazit detail",
    navHome: isEn ? "HOMEPAGE" : "DOMŮ",
    navTips: isEn ? "TIPS" : "TIPY",
    navDict: isEn ? "DICTIONARY" : "SLOVNÍK",
    navAdvice: isEn ? "ADVICE" : "PRAKTICKÉ RADY",
    // Support texty
    supportWidget: isEn ? "SUPPORT GURU" : "PODPOŘIT GURU",
    modalTitle: isEn ? "FEEDING THIS MACHINE?" : "KRMÍŠ TENHLE STROJ?",
    modalDesc: isEn ? "Your contribution goes towards fixed hosting, server, and website infrastructure costs." : "Tvůj příspěvek jde na fixní náklady hostingu, serverů a infrastruktury webu.",
    qrLabel: isEn ? "QR Payment / Transfer (CZ)" : "QR Platba / Převod (CZ)"
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', color: '#fff', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .term-card { background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.3); padding: 30px; border-radius: 28px; transition: 0.3s ease; text-decoration: none; color: inherit; display: flex; flex-direction: column; box-sizing: border-box; }
        .term-card:hover { border-color: #a855f7; box-shadow: 0 0 25px rgba(168, 85, 247, 0.2); transform: translateY(-5px); }
        .nav-link { color: #fff; text-decoration: none; font-weight: bold; transition: 0.2s; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .nav-link:hover { color: #a855f7; }
        .lang-switch { background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 4px 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px; transition: 0.2s; border: 1px solid rgba(168, 85, 247, 0.5); }
        .lang-switch:hover { background: #a855f7; color: #fff; }
        @media (max-width: 768px) { .nav-container { flex-direction: column; gap: 15px; padding: 20px !important; } }
      `}</style>

      {/* --- NAVIGACE (FIXED LABELS) --- */}
      <nav className="nav-container" style={{ padding: '20px 40px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', position: 'sticky', top: 0, zIndex: 1000 }}>
        <Link href="/" className="nav-link"><Home size={18} /> {t.navHome}</Link>
        <Link href="/tipy" className="nav-link"><Lightbulb size={18} /> {t.navTips}</Link>
        <Link href={`${baseUrl}/slovnik`} className="nav-link" style={{color: '#a855f7'}}><Book size={18} /> {t.navDict}</Link>
        <Link href="/rady" className="nav-link"><PenTool size={18} /> {t.navAdvice}</Link>
        
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
        {/* GURU FIX: Zobrazujeme aktuální jazyk jako label, ale link vede na druhou verzi */}
        {isEn ? (
          <Link href="/slovnik" className="lang-switch">EN</Link>
        ) : (
          <Link href="/en/slovnik" className="lang-switch">CZ</Link>
        )}
      </nav>

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            {t.title1} <span style={{ color: '#a855f7' }}>{t.title2}</span>
          </h1>
          <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>{t.subtitle}</p>
        </div>

        <div style={{ maxWidth: '400px', margin: '-30px auto 40px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(17, 19, 24, 0.95)', border: '1px solid #66fcf1', borderRadius: '12px', padding: '10px 15px' }}>
            <Search size={18} color="#66fcf1" style={{ marginRight: '10px' }} />
            <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {pojmy?.map((pojem) => {
            const displayTitle = isEn && pojem.title_en ? pojem.title_en : pojem.title;
            const displayDesc = isEn && pojem.description_en ? pojem.description_en : pojem.description;
            const displaySlug = isEn && pojem.slug_en ? pojem.slug_en : pojem.slug;
            return (
              <Link key={pojem.id} href={`${baseUrl}/slovnik/${displaySlug}`} className="term-card">
                <h2 style={{ color: '#a855f7', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900' }}>{displayTitle}</h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0', flexGrow: 1 }}>
                  {displayDesc && displayDesc.substring(0, 140)}...
                </p>
                <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {t.detailBtn} <ChevronRight size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      {/* --- GURU SUPPORT SYSTEM (RAKETA + MODAL) --- */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
        <button onClick={() => setShowSupportModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{ background: 'rgba(212, 163, 24, 0.95)', padding: '12px 24px', borderRadius: '16px', border: '2px solid #ffcc00', color: '#fff', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>{t.supportWidget} ⚡</div>
          <div style={{ width: '56px', height: '56px', background: '#d4a318', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', border: '2px solid #ffcc00' }}>🚀</div>
        </button>
      </div>

      {showSupportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: '#111318', width: '100%', maxWidth: '450px', borderRadius: '32px', border: '2px solid #ffcc00', padding: '40px', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setShowSupportModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#d4a318', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>✕</button>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '0 0 15px 0' }}>{t.modalTitle.split(' ')[0]} <span style={{ color: '#ffcc00' }}>{t.modalTitle.split(' ').slice(1).join(' ')}</span></h2>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '35px', fontSize: '15px' }}>{t.modalDesc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <a href="/support-qr" style={{ background: '#d4a318', color: '#000', padding: '18px', borderRadius: '18px', textDecoration: 'none', fontWeight: 'bold' }}>🤳 {t.qrLabel}</a>
              <a href="/support-card" style={{ background: '#fff', color: '#000', padding: '18px', borderRadius: '18px', textDecoration: 'none', fontWeight: 'bold' }}>💳 Karta / Apple / Google Pay</a>
              <a href="https://revolut.me/hardwareguru" target="_blank" style={{ background: '#0075eb', color: '#fff', padding: '18px', borderRadius: '18px', textDecoration: 'none', fontWeight: 'bold' }}>R Revolut Me</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
