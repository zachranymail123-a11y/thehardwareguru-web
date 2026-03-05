"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Heart } from 'lucide-react';

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

  const isEn = params?.lang === 'en';
  const baseUrl = isEn ? '/en' : '';

  // JAZYKOVÉ MAPOVÁNÍ
  const t = {
    loading: isEn ? "GURU LOADING..." : "GURU NAČÍTÁ...",
    notFound: isEn ? "Pojem nenalezen / Not found" : "Pojem nenalezen",
    back: isEn ? "Back to Dictionary" : "Zpět do slovníku",
    supportWidget: isEn ? "SUPPORT GURU" : "PODPOŘIT GURU",
    // Support Card na konci článku
    cardTitle: isEn ? "Did you learn something new?" : "Dalo ti to něco nového?",
    cardDesc: isEn 
      ? "If this quick advice helped you or you learned something completely new, consider supporting the The Hardware Guru project. Every support helps us keep the servers running. Thank you!" 
      : "Pokud ti tato rychlá rada pomohla nebo ses dozvěděl něco úplně nového, zvaž podporu projektu The Hardware Guru. Každá podpora nám pomáhá udržet provoz serveru a všech služeb v provozu. Děkujeme!",
    cardBtn: isEn ? "SUPPORT PROJECT" : "PODPOŘIT PROJEKT",
    // Modal texty
    modalTitle: isEn ? "FEEDING THIS MACHINE?" : "KRMÍŠ TENHLE STROJ?",
    modalDesc: isEn 
      ? "Your contribution goes towards fixed hosting, server, and website infrastructure costs." 
      : "Tvůj příspěvek jde na fixní náklady hostingu, serverů a infrastruktury webu.",
    qrLabel: isEn ? "QR Payment / Transfer (CZ)" : "QR Platba / Převod (CZ)",
    cardLabel: "Karta / Apple / Google Pay",
    revolutLabel: "Revolut Me"
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

  return (
    <div style={{ minHeight: '100vh', color: '#fff', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* BACK BUTTON */}
        <Link href={`${baseUrl}/slovnik`} style={{ color: '#a855f7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontWeight: 'bold', transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
          <ChevronLeft size={20} /> {t.back}
        </Link>

        {/* MAIN ARTICLE */}
        <article style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '40px', borderRadius: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginBottom: '40px' }}>
          <h1 style={{ color: '#a855f7', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase', lineHeight: '1.1' }}>
            {title}
          </h1>
          
          <div style={{ lineHeight: '1.8', fontSize: '18px', color: '#d1d5db', textAlign: 'justify', marginBottom: '60px' }} dangerouslySetInnerHTML={{ __html: description }} />

          {/* GURU SUPPORT CARD (Na konci textu) */}
          <div style={{ marginTop: '60px', padding: '40px', borderRadius: '24px', border: '1px solid rgba(212, 163, 24, 0.3)', background: 'rgba(212, 163, 24, 0.05)', textAlign: 'center' }}>
            <ShieldCheck size={40} color="#d4a318" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: '#d4a318', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>{t.cardTitle}</h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px', lineHeight: '1.6', fontSize: '15px' }}>{t.cardDesc}</p>
            <button onClick={() => setShowSupportModal(true)} style={{ background: '#d4a318', color: '#000', padding: '15px 30px', borderRadius: '14px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto', transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <Heart size={18} fill="#000" /> {t.cardBtn}
            </button>
          </div>
        </article>
      </div>

      {/* FLOATING ROCKET WIDGET */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
        <button onClick={() => setShowSupportModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{ background: 'rgba(212, 163, 24, 0.95)', padding: '12px 24px', borderRadius: '16px', border: '2px solid #ffcc00', color: '#fff', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(212, 163, 24, 0.4)' }}>
            {t.supportWidget} ⚡
          </div>
          <div style={{ width: '56px', height: '56px', background: '#d4a318', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', boxShadow: '0 0 20px rgba(212, 163, 24, 0.6)', border: '2px solid #ffcc00' }}>
            🚀
          </div>
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
              <a href="/support-card" style={{ background: '#fff', color: '#000', padding: '18px', borderRadius: '18px', textDecoration: 'none', fontWeight: 'bold' }}>💳 {t.cardLabel}</a>
              <a href="https://revolut.me/hardwareguru" target="_blank" style={{ background: '#0075eb', color: '#fff', padding: '18px', borderRadius: '18px', textDecoration: 'none', fontWeight: 'bold' }}>R {t.revolutLabel}</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
