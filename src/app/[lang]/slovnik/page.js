"use client";
import React, { useState, useEffect, use } from 'react'; // ZKONTROLUJ TENHLE IMPORT
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function SlovnikPage({ params }) {
  // Tento řádek je v Next.js 15 povinný, jinak to hází ten error, co vidíš
  const resolvedParams = use(params); 
  const lang = resolvedParams?.lang || 'cs';
  const isEn = lang === 'en';

  const [pojmy, setPojmy] = useState([]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function loadSlovnik() {
      const { data } = await supabase.from('slovnik').select('*').order('title');
      if (data) setPojmy(data);
    }
    loadSlovnik();
  }, []);

  return (
    <div style={{ padding: '50px', color: '#fff', background: '#000' }}>
      <h1>{isEn ? "Dictionary" : "Slovník"}</h1>
      <div style={{ display: 'grid', gap: '20px' }}>
        {pojmy.map(p => (
          <div key={p.id} style={{ border: '1px solid #a855f7', padding: '20px' }}>
            <h2>{isEn ? (p.title_en || p.title) : p.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
