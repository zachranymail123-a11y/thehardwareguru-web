"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Home, Lightbulb, Book, PenTool, ChevronLeft, ShieldCheck, Heart } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PojemDetail() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [pojem, setPojem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    async function loadPojem() {
      const lang = params?.lang || 'cs';
      const slug = params?.slug;
      const isEn = lang === 'en';
      if (!slug) return;

      const column = isEn ? 'slug_en' : 'slug';
      const { data } = await supabase.from('slovnik').select('*').eq(column, slug).single();

      if (data) setPojem(data);
      setLoading(false);
    }
    loadPojem();
  }, [mounted, params]);

  if (!mounted) return null;

  const lang = params?.lang || 'cs';
  const isEn = lang === 'en';
  const baseUrl = isEn ? '/en' : '';

  // --- GURU PŘEKLADY ---
  const t = {
    loading: isEn ? "GURU LOADING..." : "GURU NAČÍTÁ...",
    notFound: isEn ? "Pojem nenalezen / Not found" : "Pojem nenalezen",
    back: isEn ? "Back to Dictionary" : "Zpět do slovníku",
    navHome: isEn ? "HOMEPAGE" : "DOMŮ",
    navTips: isEn ? "TIPS" : "TIPY",
    navDict: isEn ? "DICTIONARY" : "SLOVNÍK",
    navAdvice: isEn ? "ADVICE" : "PRAKTICKÉ RADY",
    supportWidget: isEn ? "SUPPORT GURU" : "PODPOŘIT GURU",
    cardTitle: isEn ? "Did you learn something new?" : "Dalo ti to něco nového?",
    cardDesc: isEn 
      ? "If this quick advice helped you or you learned something completely new, consider supporting the The Hardware Guru project. Every support helps us keep the servers running. Thank you for every gift!" 
      : "Pokud ti tato rychlá rada pomohla nebo ses dozvěděl něco úplně nového, zvaž podporu projektu The Hardware Guru. Každá podpora nám pomáhá udržet provoz serveru a všech služeb v provozu. Děkujeme za každý dar!",
    cardBtn: isEn ? "SUPPORT PROJECT" : "PODPOŘIT PROJEKT",
    modalTitle: isEn ? "FEEDING THIS MACHINE?" : "KRMÍŠ TENHLE STROJ?",
    modalDesc: isEn ? "Your contribution goes towards fixed hosting and infrastructure costs." : "Tvůj příspěvek jde na fixní náklady hostingu, serverů a infrastruktury webu.",
    qrLabel: isEn ? "QR Payment / Transfer (CZ)" : "QR Platba / Převod (CZ)"
  };

  if (loading) return (
    <div style={{ background: '#0a0b0d', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: '#a855f7', fontWeight: 'bold' }}>{t.loading}</div>
    </div>
  );

  if (!pojem) return (
    <div style={{ background: '#0a0b0d', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: '#fff', textAlign: 'center' }}>
        <h2>{t.notFound}</h2>
        <Link href={`${baseUrl}/slovnik`} style={{ color: '#a855f7' }}>{t.back}</Link>
      </div>
    </div>
  );

  const title = isEn ? (pojem.title_en || pojem.title) : pojem.title;
  const description = isEn ? (pojem.description_en || pojem.description) : pojem.description;
  const currentSlug = isEn ? pojem.slug : pojem.slug_en; // Pro přepínač jazyků

  return (
    <div style={{ minHeight: '100vh', color: '#fff', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .nav-link { color: #fff; text-decoration: none; font-weight: bold; transition: 0.2s; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .nav-link:hover { color: #a855f7; }
        .lang-switch { background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 4px 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px; transition: 0.2s; border: 1px solid rgba(168, 85, 247, 0.5); }
        .lang-switch:hover { background: #a855f7; color: #fff; }
        @media (max-width: 768px) { .nav-container { flex-direction: column; gap: 15px; padding: 20px !important; } }
      `}</style>

      {/* --- GLOBÁLNÍ NAVIGACE --- */}
      <nav className="nav-container" style={{ padding: '20px 40px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', position: 'sticky', top: 0, zIndex: 1000 }}>
        <Link href="/" className="nav-link"><Home size={18} /> {t.navHome}</Link>
        <Link href="/tipy" className="nav-link"><Lightbulb size={18} /> {t.navTips}</Link>
        <Link href={`${baseUrl}/slovnik`} className="nav-link" style={{color: '#a855f7'}}><Book size={18} /> {t.navDict}</Link>
        <Link href="/rady" className="nav-link"><PenTool size={18} /> {t.navAdvice}</Link>
        
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
        {/* GURU FIX: Zobrazujeme aktuální jazyk jako label */}
        {isEn ? (
          <Link href={`/slovnik/${pojem.slug || ''}`} className="lang-switch">EN</Link>
        ) : (
          <Link href={`/en/slovnik/${pojem.slug_en || ''}`} className="lang-switch">CZ</Link>
        )}
      </nav>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
        <Link href={`${baseUrl}/slovnik`} style={{ color: '#a855f7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontWeight: 'bold', transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
          <ChevronLeft size={20} /> {t.back}
        </Link>

        <article style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '40px', borderRadius: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginBottom: '40px' }}>
          <h1 style={{ color: '#a855f7', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase', lineHeight: '1.1' }}>{title}</h1>
          <div style={{ lineHeight: '1.8', fontSize: '18px', color: '#d1d5db', textAlign: 'justify', marginBottom: '60px' }} dangerouslySetInnerHTML={{ __html: description }} />

          {/* GURU SUPPORT CARD */}
          <div style={{ marginTop: '60px', padding: '40px', borderRadius: '24px', border: '1px solid rgba(212, 163, 24, 0.3)', background: 'rgba(212, 163, 24, 0.05)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><div style={{ border: '2px solid #d4a318', borderRadius: '50%', padding: '10px' }}><ShieldCheck size={30} color="#d4a318" /></div></div>
            <h2 style={{ color: '#d4a318', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>{t.cardTitle}</h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px', lineHeight: '1.6', fontSize: '16px' }}>{t.cardDesc}</p>
            <button onClick={() => setShowSupportModal(true)} style={{ background: '#d4a318', color: '#000', padding: '18px 36px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto', transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <Heart size={20} fill="#000" /> {t.cardBtn}
            </button>
          </div>
        </article>
      </div>

      {/* ROCKET WIDGET */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
        <button onClick={() => setShowSupportModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{ background: 'rgba(212, 163, 24, 0.95)', padding: '12px 24px', borderRadius: '16px', border: '2px solid #ffcc00', color: '#fff', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>{t.supportWidget} ⚡</div>
          <div style={{ width: '56px', height: '56px', background: '#d4a318', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', border: '2px solid #ffcc00' }}>🚀</div>
        </button>
      </div>

      {/* SUPPORT MODAL */}
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
