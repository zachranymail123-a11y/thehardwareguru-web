"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, ArrowLeft, MessageSquare, Heart } from 'lucide-react';
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
      const { data } = await supabase.from('darci').select('*').order('amount', { ascending: false });
      setDarci(data || []);
      setLoading(false);
    }
    fetchDarci();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', color: '#fff', padding: '120px 20px', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link href={isEn ? "/en" : "/"} style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textTransform: 'uppercase', fontSize: '13px' }}>
          <ArrowLeft size={20} /> {isEn ? 'BACK TO GURU' : 'ZPĚT KE GURUMU'}
        </Link>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Trophy size={80} color="#a855f7" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' }} />
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: '900', textTransform: 'uppercase', lineHeight: '0.9', marginBottom: '20px' }}>
            {isEn ? 'HALL OF FAME' : 'SÍŇ SLÁVY'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '20px', fontWeight: '500' }}>
            {isEn ? 'The elite community supporting the Guru project.' : 'Elitní komunita, která drží projekt Guruho při životě.'}
          </p>
        </header>

        {/* GURU INSTRUCTIONS BOX */}
        <div style={instructionBox}>
           <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: '900', color: '#fff' }}>
             {isEn ? '🚀 HOW TO GET LISTED?' : '🚀 JAK SE DOSTAT NA SEZNAM?'}
           </h2>
           <p style={{ color: '#d1d5db', lineHeight: '1.6', fontSize: '16px', marginBottom: '25px' }}>
             {isEn 
               ? "Contributed to the project? Join our Discord and send Guru a Private Message (DM) with details: where you donated, the amount, and the name/nick you want displayed here." 
               : "Přispěl jsi na projekt? Připoj se na náš Discord a napiš Guruovi soukromou zprávu (DM) s údaji: kam jsi přispěl, kolik a jaké jméno nebo nick zde chceš mít napsaný."}
           </p>
           <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={discordBtn}>
             <MessageSquare size={20} fill="currentColor" /> {isEn ? 'JOIN DISCORD & WRITE DM' : 'PŘIPOJIT SE NA DISCORD A NAPSAT DM'}
           </a>
        </div>

        {/* DONORS LIST */}
        <div style={{ display: 'grid', gap: '15px', marginTop: '40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#a855f7', fontWeight: 'bold' }}>LOADING LEGENDS...</div>
          ) : darci.map((d, i) => (
            <div key={d.id} style={{ 
              background: 'rgba(17, 19, 24, 0.9)', 
              padding: '25px 35px', 
              borderRadius: '20px', 
              border: '1px solid #1f2937', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: i < 3 ? '0 0 30px rgba(168, 85, 247, 0.15)' : 'none',
              borderColor: i < 3 ? '#a855f7' : '#1f2937'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <span style={{ fontSize: '28px', fontWeight: '900', color: i < 3 ? '#a855f7' : '#333' }}>#{i + 1}</span>
                <span style={{ fontSize: '22px', fontWeight: '900', textTransform: 'uppercase' }}>{d.name} {i === 0 && '👑'}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#a855f7' }}>{d.amount} Kč</div>
            </div>
          ))}
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

const instructionBox = { background: 'rgba(168, 85, 247, 0.1)', border: '2px dashed #a855f7', padding: '35px', borderRadius: '24px', textAlign: 'center', marginBottom: '40px' };
const discordBtn = { background: '#5865F2', color: '#fff', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '14px', transition: '0.2s' };
