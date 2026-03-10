"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Rocket, ArrowLeft, ExternalLink, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PartnersPage() {
  const [partneri, setPartneri] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchPartneri() {
      const { data } = await supabase.from('partneri').select('*').order('created_at', { ascending: false });
      setPartneri(data || []);
      setLoading(false);
    }
    fetchPartneri();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', color: '#fff', padding: '120px 20px', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <Link href={isEn ? "/en" : "/"} style={{ color: '#eab308', textDecoration: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textTransform: 'uppercase', fontSize: '14px' }}>
          <ArrowLeft size={20} /> {isEn ? 'BACK TO BASE' : 'ZPĚT NA ZÁKLADNU'}
        </Link>
        
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <Rocket size={80} color="#eab308" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.6))' }} />
          <h1 style={{ fontSize: 'clamp(45px, 8vw, 72px)', fontWeight: '900', textTransform: 'uppercase', lineHeight: '0.85', marginBottom: '25px' }}>
            {isEn ? <>GURU <span style={{ color: "#eab308" }}>PARTNERS</span></> : <>NAŠI <span style={{ color: "#eab308" }}>PARTNEŘI</span></>}
          </h1>
        </header>

        {/* --- GURU INSTRUCTIONS (READABILITY ULTRA FIX) --- */}
        <div style={instructionBox}>
           <h2 style={{ margin: '0 0 30px 0', fontSize: '36px', fontWeight: '900', color: '#eab308', textTransform: 'uppercase', letterSpacing: '1px' }}>
             {isEn ? '📢 WANT ADVERTISING HERE?' : '📢 CHCEŠ TADY REKLAMU?'}
           </h2>
           
           <div style={{ marginBottom: '35px' }}>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                {isEn ? 'Advertising for web / stream / social media' : 'Reklama na web / stream / sociální sítě'}
              </p>
              <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '600', lineHeight: '1.6' }}>
                {isEn 
                  ? "Supported the project with more than 500 CZK? Join our Discord and send Guru a Private Message (DM) with: Your Name/Nick, amount, and links to your Web/Stream/YouTube." 
                  : "Podpořil jsi projekt částkou nad 500 Kč? Připoj se na náš Discord a napiš Guruovi soukromou zprávu (DM) s údaji: Tvé jméno/nick, kolik jsi přispěl a odkazy na tvůj web, stream, YouTube nebo sociální sítě."}
              </p>
           </div>

           <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={discordBtn}>
             <MessageSquare size={28} fill="currentColor" /> {isEn ? 'JOIN DISCORD & SEND DM' : 'PŘIPOJIT SE NA DISCORD A POSLAT DM'}
           </a>
        </div>

        {/* --- PARTNERS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#eab308', fontWeight: '900', gridColumn: '1/-1', fontSize: '24px' }}>SCANNING...</div>
          ) : partneri.map(p => (
            <a key={p.id} href={p.url} target="_blank" rel="noreferrer" style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div style={logoCircle}>{p.name.charAt(0)}</div>
                {p.amount && <div style={amountBadge}>{p.amount} Kč</div>}
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{p.name}</h3>
              <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', flex: 1, marginBottom: '25px' }}>
                {isEn ? (p.description_en || p.description) : p.description}
              </p>
              <div style={{ marginTop: 'auto', color: '#eab308', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', textTransform: 'uppercase', borderTop: '1px solid rgba(234,179,8,0.2)', paddingTop: '20px' }}>
                {isEn ? 'VISIT PROJECT' : 'NAVŠTÍVIT PROJEKT'} <ExternalLink size={18} />
              </div>
            </a>
          ))}

          <Link href={isEn ? "/en/support" : "/support"} style={addCard}>
            <Rocket size={54} color="#eab308" style={{ marginBottom: '20px' }} />
            <span style={{ fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', color: '#fff' }}>{isEn ? 'YOUR AD HERE' : 'TVŮJ PROJEKT ZDE'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const instructionBox = { 
  background: '#000', 
  border: '4px solid #eab308', 
  padding: '60px 40px', 
  borderRadius: '35px', 
  textAlign: 'center', 
  marginBottom: '60px', 
  boxShadow: '0 0 50px rgba(234, 179, 8, 0.2)'
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

const cardStyle = { background: '#000', border: '1px solid #1f2937', padding: '40px', borderRadius: '32px', textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', transition: '0.3s', borderBottom: '6px solid #eab308' };
const logoCircle = { width: '72px', height: '72px', background: '#111', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '900', color: '#eab308', border: '2px solid #eab308' };
const amountBadge = { background: '#eab308', color: '#000', padding: '6px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '900' };
const addCard = { ...cardStyle, borderStyle: 'dashed', borderBottomWidth: '2px', background: 'rgba(234, 179, 8, 0.05)', alignItems: 'center', justifyContent: 'center', textAlign: 'center' };
