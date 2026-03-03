"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TipyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tipyData, setTipyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTipy() {
      const { data, error } = await supabase
        .from('tipy')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setTipyData(data);
      setLoading(false);
    }
    fetchTipy();
  }, []);

  const filteredTipy = tipyData.filter(tip => 
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tip.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px' 
    }}>
      
      {/* SOCIAL BAR S OPRAVENÝM DISCORDEM */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        <a href="https://kick.com/TheHardwareGuru" target="_blank" style={{ color: '#53fc18', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: '1px solid #53fc18', padding: '8px 16px', borderRadius: '12px' }}>KICK</a>
        <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: '1px solid #ff0000', padding: '8px 16px', borderRadius: '12px' }}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" style={{ color: '#5865F2', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: '1px solid #5865F2', padding: '8px 16px', borderRadius: '12px' }}>DISCORD</a>
      </div>

      {/* SEARCH BOX */}
      <div style={{ maxWidth: '600px', margin: '0 auto 60px auto' }}>
        <input 
          type="text" 
          placeholder="Hledat v Guru databázi..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '18px 25px', borderRadius: '20px',
            background: 'rgba(17, 19, 24, 0.9)', border: '2px solid #a855f7',
            color: '#fff', fontSize: '16px', outline: 'none',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.2)'
          }}
        />
      </div>

      {/* GRID ČLÁNKŮ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '35px' }}>
        {loading ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Načítám Guru vědomosti...</p> : 
          filteredTipy.map((tip) => (
          <article key={tip.id} style={{
            background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '28px', overflow: 'hidden'
          }}>
            <img src={tip.image_url} alt={tip.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            <div style={{ padding: '25px' }}>
              <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{tip.category}</span>
              <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '12px 0' }}>{tip.title}</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>{tip.description}</p>
              
              {tip.youtube_id && (
                <div style={{ background: '#000', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ff000033' }}>
                  <span style={{ color: '#ff0000' }}>▶</span>
                  <span style={{ fontSize: '12px' }}>Video návod přiložen</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
