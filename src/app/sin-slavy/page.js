"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, ArrowLeft, Heart } from 'lucide-react';
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
    <div style={{ minHeight: '100vh', background: '#0a0b0d', color: '#fff', padding: '120px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href={isEn ? "/en" : "/"} style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <ArrowLeft size={20} /> {isEn ? 'BACK TO GURU' : 'ZPĚT KE GURUMU'}
        </Link>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Trophy size={64} color="#a855f7" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '48px', fontWeight: '900', textTransform: 'uppercase' }}>
            {isEn ? 'HALL OF FAME' : 'SÍŇ SLÁVY'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '18px' }}>
            {isEn ? 'The elite community supporting the project.' : 'Elitní komunita, která drží projekt při životě.'}
          </p>
        </header>

        <div style={{ display: 'grid', gap: '15px' }}>
          {darci.map((d, i) => (
            <div key={d.id} style={{ 
              background: '#111', 
              padding: '20px 30px', 
              borderRadius: '16px', 
              border: '1px solid #1f2937', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: i < 3 ? '0 0 20px rgba(168, 85, 247, 0.15)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: i < 3 ? '#a855f7' : '#333' }}>#{i + 1}</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{d.name} {i === 0 && '👑'}</span>
              </div>
              <div style={{ fontWeight: '900', color: '#a855f7' }}>{d.amount} Kč</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '80px', background: 'rgba(168, 85, 247, 0.05)', padding: '40px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #a855f7' }}>
            <h2 style={{ marginBottom: '15px' }}>{isEn ? 'Want to be on this list?' : 'Chceš být na tomto seznamu?'}</h2>
            <Link href={isEn ? "/en/support" : "/support"} style={{ background: '#a855f7', color: '#fff', padding: '15px 30px', borderRadius: '14px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={20} fill="#fff" /> {isEn ? 'SUPPORT THE PROJECT' : 'PODPOŘIT PROJEKT'}
            </Link>
        </div>
      </div>
    </div>
  );
}
