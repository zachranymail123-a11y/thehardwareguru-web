"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Rocket, ArrowLeft, ExternalLink, MessageSquare, Heart, ShieldCheck } from 'lucide-react';
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
      // GURU ENGINE: Načítáme všechny schválené partnery
      const { data } = await supabase.from('partneri').select('*').order('created_at', { ascending: false });
      setPartneri(data || []);
      setLoading(false);
    }
    fetchPartneri();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', color: '#fff', padding: '120px 20px', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* BACK LINK */}
        <Link href={isEn ? "/en" : "/"} style={{ color: '#eab308', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
          <ArrowLeft size={20} /> {isEn ? 'BACK TO BASE' : 'ZPĚT NA ZÁKLADNU'}
        </Link>
        
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <Rocket size={80} color="#eab308" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.6))' }} />
          <h1 style={{ fontSize: 'clamp(45px, 8vw, 72px)', fontWeight: '900', textTransform: 'uppercase', lineHeight: '0.85', marginBottom: '25px', letterSpacing: '-2px' }}>
            {isEn ? <>GURU <span style={{ color: "#eab308" }}>PARTNERS</span></> : <>NAŠI <span style={{ color: "#eab308" }}>PARTNEŘI</span></>}
          </h1>
          <p style={{ color: '#e5e7eb', fontSize: '22px', fontWeight: '600', maxWidth: '800px', margin: '0 auto' }}>
            {isEn ? 'Premium exposure for those who power the hardware revolution.' : 'Prémiový prostor pro ty, kteří pohánějí hardwarovou revoluci.'}
          </p>
        </header>

        {/* --- GURU INSTRUCTIONS (READABILITY FIX) --- */}
        <div style={instructionBox}>
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#eab308', color: '#000', padding: '8px 20px', borderRadius: '50px', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>
                {isEn ? 'Advertising Opportunity' : 'Nabídka Reklamy'}
              </div>
           </div>
           
           <h2 style={{ margin: '0 0 20px 0', fontSize: '32px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>
             {isEn ? '📢 GET YOUR AD HERE' : '📢 CHCEŠ TADY REKLAMU?'}
           </h2>
           
           <p style={{ color: '#fff', lineHeight: '1.5', fontSize: '20px', marginBottom: '30px', maxWidth: '850px', margin: '0 auto 30px' }}>
             {isEn ? (
               <>
                 Supported the project with more than <strong>500 CZK</strong>? <br/>
                 <strong style={{ color: '#eab308', fontSize: '24px' }}>Advertising for your web / stream / social media.</strong><br/>
                 Join our Discord and send Guru a <strong>Private Message (DM)</strong> with: <br/>
                 <span style={{ color: '#9ca3af' }}>Your Name, amount, and links to your Web/Stream/YouTube.</span>
               </>
             ) : (
               <>
                 Podpořil jsi projekt částkou nad <strong>500 Kč</strong>? <br/>
                 <strong style={{ color: '#eab308', fontSize: '24px' }}>Reklama na web / stream / sociální sítě.</strong><br/>
                 Připoj se na náš Discord a napiš Guruovi <strong>soukromou zprávu (DM)</strong> s údaji: <br/>
                 <span style={{ color: '#9ca3af' }}>Tvé jméno/nick, kolik jsi přispěl a odkazy na tvůj Web/Stream/YouTube.</span>
               </>
             )}
           </p>

           <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={discordBtn}>
             <MessageSquare size={26} fill="currentColor" /> {isEn ? 'JOIN DISCORD & SEND DM' : 'PŘIPOJIT SE NA DISCORD A POSLAT DM'}
           </a>
        </div>

        {/* --- PARTNERS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px', marginTop: '60px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#eab308', fontWeight: '900', gridColumn: '1/-1', fontSize: '24px' }}>GURU IS SCANNING...</div>
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
                {isEn ? 'EXPLORE PROJECT' : 'NAVŠTÍVIT PROJEKT'} <ExternalLink size={18} />
              </div>
            </a>
          ))}

          {/* EMPTY SLOT / CTA */}
          <Link href={isEn ? "/en/support" : "/support"} style={addCard}>
            <div style={{ background: 'rgba(234,179,8,0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
               <Rocket size={54} color="#eab308" />
            </div>
            <span style={{ fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', color: '#fff' }}>{isEn ? 'YOUR PROJECT HERE' : 'TVŮJ PROJEKT ZDE'}</span>
            <span style={{ fontSize: '15px', color: '#eab308', fontWeight: 'bold', marginTop: '10px' }}>{isEn ? 'Support & Promote' : 'Podpoř web a získej reklamu'}</span>
          </Link>
        </div>

        {/* FOOTER CTA */}
        <div style={{ marginTop: '100px', textAlign: 'center', paddingBottom: '60px' }}>
            <Link href={isEn ? "/en/support" : "/support"} style={bigSupportBtn}>
              <Heart size={24} fill="#000" /> {isEn ? 'SUPPORT THE GURU ECOSYSTEM' : 'PODPOŘIT EKOSYSTÉM GURUHO'}
            </Link>
        </div>
      </div>
    </div>
  );
}

// --- GURU STYLES CORE ---
const instructionBox = { 
  background: 'rgba(0, 0, 0, 0.85)', 
  border: '3px dashed #eab308', 
  padding: '60px 40px', 
  borderRadius: '35px', 
  textAlign: 'center', 
  marginBottom: '50px', 
  boxShadow: '0 0 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(234,179,8,0.1)',
  backdropFilter: 'blur(10px)'
};

const discordBtn = { 
  background: '#5865F2', 
  color: '#fff', 
  padding: '22px 45px', 
  borderRadius: '18px', 
  textDecoration: 'none', 
  fontWeight: '900', 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '15px', 
  fontSize: '18px', 
  transition: '0.3s', 
  boxShadow: '0 10px 25px rgba(88, 101, 242, 0.4)',
  textTransform: 'uppercase'
};

const cardStyle = { 
  background: 'rgba(10, 11, 15, 0.95)', 
  border: '1px solid #1f2937', 
  padding: '40px', 
  borderRadius: '32px', 
  textDecoration: 'none', 
  color: '#fff', 
  display: 'flex', 
  flexDirection: 'column', 
  transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
  borderBottom: '6px solid #eab308',
  boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
};

const logoCircle = { 
  width: '72px', 
  height: '72px', 
  background: '#000', 
  borderRadius: '20px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontSize: '36px', 
  fontWeight: '900', 
  color: '#eab308', 
  border: '2px solid #eab308' 
};

const amountBadge = { 
  background: '#eab308', 
  color: '#000', 
  padding: '6px 16px', 
  borderRadius: '10px', 
  fontSize: '14px', 
  fontWeight: '900' 
};

const addCard = { 
  ...cardStyle, 
  borderStyle: 'dashed', 
  borderBottomWidth: '2px',
  background: 'rgba(234, 179, 8, 0.03)',
  alignItems: 'center', 
  justifyContent: 'center', 
  textAlign: 'center' 
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
