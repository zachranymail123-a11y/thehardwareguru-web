"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GuidesArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('rady')
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
          {isEn ? <>PRACTICAL <span style={{ color: '#66fcf1' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#66fcf1' }}>RADY</span></>}
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          {isEn ? 'Step-by-step technical solutions to keep your hardware alive.' : 'Technická řešení krok za krokem, která udrží tvůj hardware naživu.'}
        </p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={48} color="#66fcf1" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {items.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '35px', background: 'rgba(17, 19, 24, 0.85)', borderRadius: '24px', border: '1px solid rgba(102, 252, 241, 0.2)', height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#66fcf1'}>
                    <div style={{ color: '#66fcf1', marginBottom: '20px' }}><ShieldCheck size={44} /></div>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '15px' }}>{displayTitle}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.7', marginBottom: '25px', flex: 1 }}>{displayDesc}</p>
                    <div style={{ color: '#66fcf1', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isEn ? 'READ FULL GUIDE' : 'ČÍST CELOU RADU'} <ChevronRight size={20} />
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
