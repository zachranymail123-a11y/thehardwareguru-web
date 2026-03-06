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
        <Link href={isEn ? "/en" : "/"} style={{ color: '#eab308', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textTransform: 'uppercase', fontSize: '13px' }}>
          <ArrowLeft size={20} /> {isEn ? 'BACK TO GURU' : 'ZPĚT KE GURUMU'}
        </Link>
        
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <Rocket size={80} color="#eab308" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.5))' }} />
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: '900', textTransform: 'uppercase', lineHeight: '0.9', marginBottom: '20px' }}>
            {isEn ? <>OUR <span style={{ color: "#eab308" }}>PARTNERS</span></> : <>NAŠI <span style={{ color: "#eab308" }}>PARTNEŘI</span></>}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '20px', fontWeight: '500' }}>
            {isEn ? 'Premium promotion for projects supporting the Guru ecosystem.' : 'Prémiová propagace pro projekty, které podporují Guru ekosystém.'}
          </p>
        </header>

        {/* GURU PARTNER INSTRUCTIONS BOX */}
        <div style={instructionBox}>
           <h2 style={{ margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>
             {isEn ? '📢 WANT YOUR AD HERE?' : '📢 CHCEŠ TADY REKLAMU?'}
           </h2>
           <p style={{ color: '#d1d5db', lineHeight: '1.6', fontSize: '17px', marginBottom: '25px', maxWidth: '800px', margin: '0 auto 25px' }}>
             {isEn 
               ? "Supported the project with more than 500 CZK? Join our Discord and send Guru a Private Message (DM) with: Your Name/Nick, contribution amount, and links to your web, stream, or social media." 
               : "Podpořil jsi projekt částkou nad 500 Kč? Připoj se na náš Discord a napiš Guruovi soukromou zprávu (DM) s údaji: Tvé jméno/nick, kolik jsi přispěl a odkazy na tvůj web, stream, YouTube nebo sociální sítě."}
           </p>
           <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={discordBtn}>
             <MessageSquare size={22} fill="currentColor" /> {isEn ? 'JOIN DISCORD & SEND DM' : 'PŘIPOJIT SE NA DISCORD A POSLAT DM'}
           </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginTop: '50px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#eab308', fontWeight: 'bold', gridColumn: '1/-1' }}>LOADING PARTNERS...</div>
          ) : partneri.map(p => (
            <a key={p.id} href={p.url} target="_blank" rel="noreferrer" style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={logoCircle}>{p.name.charAt(0)}</div>
                {p.amount && <div style={amountBadge}>{p.amount} Kč</div>}
              </div>
              <h3 style={{ margin: '20px 0 10px', fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{p.name}</h3>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', flex: 1, marginBottom: '20px' }}>
                {isEn ? (p.description_en || p.description) : p.description}
              </p>
              <div style={{ marginTop: 'auto', color: '#eab308', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', textTransform: 'uppercase' }}>
                {isEn ? 'VISIT PROJECT' : 'NAVŠTÍVIT PROJEKT'} <ExternalLink size={16} />
              </div>
            </a>
          ))}

          {/* BECOME A PARTNER CARD */}
          <Link href={isEn ? "/en/support" : "/support"} style={addCard}>
            <Rocket size={48} color="#eab308" style={{ marginBottom: '15px' }} />
            <span style={{ fontWeight: '900', fontSize: '20px', textTransform: 'uppercase' }}>{isEn ? 'BECOME A PARTNER' : 'STAŇ SE PARTNEREM'}</span>
            <span style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>{isEn ? 'Promote your stream/web here' : 'Propaguj svůj stream nebo web'}</span>
          </Link>
        </div>

        <div style={{ marginTop: '80px', textAlign: 'center' }}>
            <Link href={isEn ? "/en/support" : "/support"} style={{ background: '#fff', color: '#000', padding: '18px 40px', borderRadius: '16px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '18px', transition: '0.2s' }}>
              <Heart size={22} fill="#000" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURUHO'}
            </Link>
        </div>
      </div>
    </div>
  );
}

const instructionBox = { background: 'rgba(234, 179, 8, 0.1)', border: '2px dashed #eab308', padding: '40px', borderRadius: '28px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 0 40px rgba(234, 179, 8, 0.05)' };
const discordBtn = { background: '#5865F2', color: '#fff', padding: '18px 35px', borderRadius: '14px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '16px', transition: '0.2s', boxShadow: '0 4px 15px rgba(88, 101, 242, 0.3)' };
const cardStyle = { background: 'rgba(17, 19, 24, 0.9)', border: '1px solid #1f2937', padding: '35px', borderRadius: '28px', textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', transition: '0.3s', borderBottom: '5px solid #eab308' };
const logoCircle = { width: '64px', height: '64px', background: '#000', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: '#eab308', border: '2px solid #eab308' };
const amountBadge = { background: '#eab308', color: '#000', padding: '5px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '900' };
const addCard = { ...cardStyle, borderStyle: 'dashed', borderBottom: '2px dashed #eab308', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.8 };
