"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Wrench, Settings, Activity, Home } from 'lucide-react';
import Link from 'next/link';

const TweaksList = () => {
  const [tweaky, setTweaky] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    async function get() {
      const { data } = await supabase.from('tweaky').select('*').order('created_at', { ascending: false });
      setTweaky(data || []);
      setLoading(false);
    }
    get();
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
       <h1 style={{ textAlign: 'center', fontSize: '50px', fontWeight: '900' }}>GURU <span style={{ color: '#eab308' }}>TWEAKY</span></h1>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '50px auto' }}>
          {tweaky.map(t => (
            <Link href={`/tweaky/${t.slug}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(17,19,24,0.9)', padding: '30px', borderRadius: '28px', border: '1px solid #eab30844' }}>
                {t.image_url && t.image_url !== 'EMPTY' && <img src={t.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '15px' }} />}
                <h2 style={{ fontSize: '24px', marginTop: '15px' }}>{t.title}</h2>
                <p style={{ color: '#9ca3af' }}>{t.description}</p>
                <div style={{ color: '#eab308', fontWeight: 'bold', marginTop: '15px' }}>OTEVŘÍT NÁVOD →</div>
              </div>
            </Link>
          ))}
       </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(TweaksList), { ssr: false });
