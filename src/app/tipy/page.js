"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, Loader2, ChevronRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TipyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('tipy')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setItems(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div style={globalStyles}>
      <header style={{ maxWidth: '800px', margin: '20px auto 40px', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
          GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS' : 'TIPY'}</span>
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          {isEn ? 'Quick hacks and technical wisdom for every geek.' : 'Rychlé hacky a technická moudra pro každého geeka.'}
        </p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={48} color="#a855f7" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {items.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/tipy/${displaySlug}` : `/tipy/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(17, 19, 24, 0.85)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(168, 85, 247, 0.2)', height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#a855f7'}>
                    <div style={{ color: '#a855f7', marginBottom: '15px' }}><Lightbulb size={32} /></div>
                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>{displayTitle}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>{displayDesc}</p>
                    <div style={{ color: '#a855f7', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {isEn ? 'LEARN MORE' : 'ZJISTIT VÍCE'} <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
