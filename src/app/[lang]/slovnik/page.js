"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // GURU: Bezpečnější cesta pro parametry v "use client"

// Inicializace klienta VENKU, aby se nevytvářel znovu při každém překreslení
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SlovnikPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [pojmy, setPojmy] = useState([]);

  // 1. POJISTKA PROTI HYDRATAČNÍ CHYBĚ
  // Web se začne vykreslovat až ve chvíli, kdy je JS v prohlížeči plně načtený
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadSlovnik() {
      try {
        const { data, error } = await supabase
          .from('slovnik')
          .select('*')
          .order('title', { ascending: true });
        
        if (error) throw error;
        if (data) setPojmy(data);
      } catch (err) {
        console.error("Chyba při načítání dat:", err);
      }
    }
    loadSlovnik();
  }, [mounted]);

  // Pokud ještě nejsme na klientovi, nevracíme nic (prevence bílé smrti a chyb)
  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }} />;

  const lang = params?.lang || 'cs';
  const isEn = lang === 'en';

  return (
    <div style={{ padding: '50px', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1 style={{ color: '#a855f7', textTransform: 'uppercase', fontWeight: 900 }}>
        {isEn ? "Hardware Dictionary" : "Hardware Slovník"}
      </h1>

      <div style={{ display: 'grid', gap: '20px', marginTop: '40px' }}>
        {pojmy.map((p) => {
          // GURU LOGIKA: Bezpečný výběr textu
          const title = isEn ? (p.title_en || p.title) : p.title;
          const slug = isEn ? (p.slug_en || p.slug) : p.slug;
          
          return (
            <Link 
              key={p.id} 
              href={isEn ? `/en/slovnik/${slug}` : `/slovnik/${slug}`}
              style={{ 
                border: '1px solid rgba(168, 85, 247, 0.4)', 
                padding: '25px', 
                borderRadius: '15px',
                textDecoration: 'none',
                color: 'inherit',
                transition: '0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a855f7'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)'}
            >
              <h2 style={{ margin: 0 }}>{String(title)}</h2>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
