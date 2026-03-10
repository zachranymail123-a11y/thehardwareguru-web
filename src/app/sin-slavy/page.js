"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, ArrowLeft, MessageSquare, Heart, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HallOfFame() {
  const [darci, setDarci] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchDarci() {
      // GURU ENGINE: Načítáme legendy seřazené podle výše příspěvku
      const { data } = await supabase.from('darci').select('*').order('amount', { ascending: false });
      setDarci(data || []);
      setLoading(false);
    }
    fetchDarci();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', color: '#fff', padding: '120px 20px', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* BACK LINK */}
        <Link href={isEn ? "/en" : "/"} style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textTransform: 'uppercase', fontSize: '14px' }}>
          <ArrowLeft size={20} /> {isEn ? 'BACK TO BASE' : 'ZPĚT NA ZÁKLADNU'}
        </Link>
        
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <Trophy size={80} color="#a855f7" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))' }} />
          <h1 style={{ fontSize: 'clamp(45px, 8vw, 72px)', fontWeight: '900', textTransform: 'uppercase', lineHeight: '0.85', marginBottom: '25px' }}>
            {isEn ? <>HALL OF <span style={{ color: "#a855f7" }}>FAME</span></> : <>SÍŇ <span style={{ color: "#a855f7" }}>SLÁVY</span></>}
          </h1>
          <p style={{ color: '#e5e7eb', fontSize: '20px', fontWeight: '600' }}>
            {isEn ? 'The elite legends supporting the Hardware Guru ecosystem.' : 'Elitní legendy, které drží ekosystém Hardware Guruho v chodu.'}
          </p>
        </header>

        {/* --- GURU INSTRUCTIONS (READABILITY ULTRA FIX) --- */}
        <div style={instructionBox}>
           <h2 style={{ margin: '0 0 30px 0', fontSize: '36px', fontWeight: '900', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px' }}>
             {isEn ? '🚀 HOW TO GET LISTED?' : '🚀 JAK SE DOSTAT NA SEZNAM?'}
           </h2>
           
           <div style={{ marginBottom: '35px' }}>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                {isEn ? 'Join the legends of the scene' : 'Staň se legendou scény'}
              </p>
              <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '600', lineHeight: '1.6' }}>
                {isEn ? (
                  <>Contributed to the project? Join our Discord and send Guru a <strong>Private Message (DM)</strong> with: <br/><span style={{ color: '#a855f7', fontSize: '22px' }}>Your Name / Nick and the amount you donated.</span></>
                ) : (
                  <>Přispěl jsi na projekt? Připoj se na náš Discord a napiš Guruovi <strong>soukromou zprávu (DM)</strong> s údaji: <br/><span style={{ color: '#a855f7', fontSize: '22px' }}>Tvé jméno / nick a kolik jsi přispěl.</span></>
                )}
              </p>
           </div>

           <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={discordBtn}>
             <MessageSquare size={28} fill="currentColor" /> {isEn ? 'JOIN DISCORD & SEND DM' : 'PŘIPOJIT SE NA DISCORD A POSLAT DM'}
           </a>
        </div>

        {/* --- DONORS LIST --- */}
        <div style={{ display: 'grid', gap: '15px', marginTop: '60px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#a855f7', fontWeight: '900', fontSize: '24px' }}>
              <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto' }} />
            </div>
          ) : darci.map((d, i) => (
            <div key={d.id} style={{ 
              ...donorCardStyle,
              borderColor: i < 3 ? '#a855f7' : '#1f2937',
              boxShadow: i < 3 ? '0 10px 40px rgba(168, 85, 247, 0.2)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <span style={{ fontSize: '32px', fontWeight: '900', color: i < 3 ? '#a855f7' : '#333', width: '50px' }}>#{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <span style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}>{d.name}</span>
                   {i === 0 && <Crown size={24} color="#a855f7" fill="#a855f7" />}
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#a855f7' }}>{d.amount} Kč</div>
            </div>
          ))}
        </div>

        {/* FOOTER CTA */}
        <div style={{ marginTop: '100px', textAlign: 'center', paddingBottom: '60px' }}>
            <Link href={isEn ? "/en/support" : "/support"} style={bigSupportBtn}>
              <Heart size={24} fill="#000" /> {isEn ? 'SUPPORT THE GURU PROJECT' : 'PODPOŘIT PROJEKT GURUHO'}
            </Link>
        </div>
      </div>
    </div>
  );
}

// --- GURU STYLES CORE ---
const instructionBox = { 
  background: '#000', 
  border: '4px solid #a855f7', 
  padding: '60px 40px', 
  borderRadius: '35px', 
  textAlign: 'center', 
  marginBottom: '60px', 
  boxShadow: '0 0 50px rgba(168, 85, 247, 0.2)'
};

const discordBtn = { 
  background: '#5865F2', 
  color: '#fff', 
  padding: '25px 50px', 
  borderRadius: '20px', 
  textDecoration: 'none', 
  fontWeight: '900', 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '15px', 
  fontSize: '20px', 
  transition: '0.3s', 
  textTransform: 'uppercase',
  boxShadow: '0 10px 30px rgba(88, 101, 242, 0.4)'
};

const donorCardStyle = { 
  background: '#000', 
  border: '1px solid #1f2937', 
  padding: '30px 45px', 
  borderRadius: '25px', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  transition: '0.3s' 
};

const bigSupportBtn = { 
  background: '#fff', 
  color: '#000', 
  padding: '22px 50px', 
  borderRadius: '20px', 
  textDecoration: 'none', 
  fontWeight: '900', 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '15px', 
  fontSize: '20px', 
  transition: '0.3s',
  textTransform: 'uppercase',
  boxShadow: '0 10px 30px rgba(255,255,255,0.1)'
};
