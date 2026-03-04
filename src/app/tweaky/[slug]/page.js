"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

const TweakDetail = () => {
  const { slug } = useParams();
  const [tweak, setTweak] = useState(null);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (slug) {
      supabase.from('tweaky').select('*').eq('slug', slug).single().then(({ data }) => setTweak(data));
    }
  }, [slug]);

  if (!tweak) return <div style={{ color: '#eab308', textAlign: 'center', padding: '100px' }}>Načítám Guru návod...</div>;

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/tweaky" style={{ color: '#9ca3af', textDecoration: 'none' }}>← Zpět na seznam</Link>
        <div style={{ background: 'rgba(17,19,24,0.9)', padding: '40px', borderRadius: '28px', border: '1px solid #eab308', marginTop: '20px' }}>
          <h1 style={{ fontSize: '40px', fontStyle: 'italic' }}>{tweak.title}</h1>
          {tweak.image_url && tweak.image_url !== 'EMPTY' && <img src={tweak.image_url} style={{ width: '100%', borderRadius: '15px', margin: '20px 0' }} />}
          <div dangerouslySetInnerHTML={{ __html: tweak.content }} style={{ color: '#ccc', lineHeight: '1.8', fontSize: '17px' }} />
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TweakDetail), { ssr: false });
