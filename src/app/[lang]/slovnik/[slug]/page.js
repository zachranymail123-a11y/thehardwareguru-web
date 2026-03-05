"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Home, ChevronLeft, Book } from 'lucide-react';

export default function PojemDetail({ params }) {
  // MAGIE: Zjistíme jazyk i slug z URL
  const lang = params?.lang || 'cs';
  const slug = params?.slug;
  const isEn = lang === 'en';

  const [pojem, setPojem] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function loadPojem() {
      // Hledáme buď v českém slugu, nebo v anglickém
      const column = isEn ? 'slug_en' : 'slug';
      
      const { data, error } = await supabase
        .from('slovnik')
        .select('*')
        .eq(column, slug)
        .single();

      if (data) setPojem(data);
      setLoading(false);
    }
    if (slug) loadPojem();
  }, [slug, isEn]);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  if (!pojem) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Pojem nenalezen / Not found</div>;

  // Dynamický výběr obsahu
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
        <Link href={`${baseUrl}/slovnik`} style={{ color: '#a855f7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontWeight: 'bold' }}>
          <ChevronLeft size={20} /> {backBtn}
        </Link>

        <article style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '40px', borderRadius: '28px' }}>
          <h1 style={{ color: '#a855f7', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase' }}>
            {title}
          </h1>
          
          <div 
            style={{ lineHeight: '1.8', fontSize: '18px', color: '#d1d5db' }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </article>
      </div>
    </div>
  );
}
