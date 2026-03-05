"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // GURU: Bezpečnější pro parametry
import { Home, ChevronLeft, Book } from 'lucide-react';

// GURU FIX: Supabase klienta vytvoříme MIMO komponentu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PojemDetail() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [pojem, setPojem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. POJISTKA PROTI HYDRATAČNÍM CHYBÁM
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. NAČTENÍ DETAILU POJMU
  useEffect(() => {
    if (!mounted) return;

    async function loadPojem() {
      const lang = params?.lang || 'cs';
      const slug = params?.slug;
      const isEn = lang === 'en';

      if (!slug) return;

      // Hledáme buď v českém slugu, nebo v anglickém podle aktuálního jazyka URL
      const column = isEn ? 'slug_en' : 'slug';
      
      const { data, error } = await supabase
        .from('slovnik')
        .select('*')
        .eq(column, slug)
        .single();

      if (data) setPojem(data);
      setLoading(false);
    }
    
    loadPojem();
  }, [mounted, params]);

  // Pokud nejsme na klientovi, nevracíme nic (prevence "Application error")
  if (!mounted) return null;

  if (loading) return (
    <div style={{ background: '#0a0b0d', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: '#a855f7', fontWeight: 'bold' }}>GURU LOADING...</div>
    </div>
  );

  if (!pojem) return (
    <div style={{ background: '#0a0b0d', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: '#fff', textAlign: 'center' }}>
        <h2>Pojem nenalezen / Not found</h2>
        <Link href="/slovnik" style={{ color: '#a855f7' }}>Zpět do slovníku</Link>
      </div>
    </div>
  );

  // GURU LOGIKA: Výběr obsahu podle jazyka
  const isEn = params?.lang === 'en';
  const title = isEn ? (pojem.title_en || pojem.title) : pojem.title;
  const description = isEn ? (pojem.description_en || pojem.description) : pojem.description;
  const backBtn = isEn ? "Back to Dictionary" : "Zpět do slovníku";
  const baseUrl = isEn ? '/en' : '';

  return (
    <div style={{ 
        minHeight: '100vh', 
        color: '#fff',
        backgroundColor: '#0a0b0d',
        backgroundImage: 'url("/bg-guru.png")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link 
          href={`${baseUrl}/slovnik`} 
          style={{ 
            color: '#a855f7', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '40px', 
            fontWeight: 'bold',
            transition: '0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
          <ChevronLeft size={20} /> {backBtn}
        </Link>

        <article style={{ 
          background: 'rgba(17, 19, 24, 0.85)', 
          backdropFilter: 'blur(10px)', 
          border: '1px solid rgba(168, 85, 247, 0.3)', 
          padding: '40px', 
          borderRadius: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <h1 style={{ 
            color: '#a855f7', 
            fontSize: 'clamp(32px, 5vw, 48px)', 
            fontWeight: '900', 
            marginBottom: '30px', 
            textTransform: 'uppercase',
            lineHeight: '1.1'
          }}>
            {title}
          </h1>
          
          <div 
            style={{ 
              lineHeight: '1.8', 
              fontSize: '18px', 
              color: '#d1d5db',
              textAlign: 'justify' 
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </article>
      </div>
    </div>
  );
}
