"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Rocket, ArrowLeft, ExternalLink } from 'lucide-react';
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
    <div style={{ minHeight: '100vh', background: '#0a0b0d', color: '#fff', padding: '120px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link href={isEn ? "/en" : "/"} style={{ color: '#eab308', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <ArrowLeft size={20} /> {isEn ? 'BACK' : 'ZPĚT'}
        </Link>
        <header style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', textTransform: 'uppercase' }}>
            {isEn ? <>OUR <span style={{ color: "#eab308" }}>PARTNERS</span></> : <>NAŠI <span style={{ color: "#eab308" }}>PARTNEŘI</span></>}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '18px' }}>
            {isEn ? 'Projects and creators supported by Hardware Guru.' : 'Projekty a tvůrci, které Hardware Guru podporuje.'}
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {partneri.map(p => (
            <a key={p.id} href={p.url} target="_blank" style={cardStyle}>
              <div style={logoCircle}>{p.name.charAt(0)}</div>
              <h3 style={{ margin: '15px 0 10px', fontSize: '22px' }}>{p.name}</h3>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
                {isEn ? p.description_en : p.description}
              </p>
              <div style={{ marginTop: '20px', color: '#eab308', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEn ? 'VISIT SITE' : 'NAVŠTÍVIT WEB'} <ExternalLink size={16} />
              </div>
            </a>
          ))}
          <Link href={isEn ? "/en/support" : "/support"} style={addCard}>
            <Rocket size={40} color="#eab308" />
            <span style={{ marginTop: '15px', fontWeight: 'bold' }}>{isEn ? 'BECOME A PARTNER' : 'STAŇ SE PARTNEREM'}</span>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{isEn ? 'Promotion for supporters' : 'Reklama pro podporovatele'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: '#111', border: '1px solid #1f2937', padding: '30px', borderRadius: '24px', textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', transition: '0.3s' };
const logoCircle = { width: '60px', height: '60px', background: '#222', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#eab308', border: '2px solid #eab308' };
const addCard = { ...cardStyle, borderStyle: 'dashed', borderColor: '#eab308', alignItems: 'center', justifyContent: 'center', textAlign: 'center' };
