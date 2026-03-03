"use client";
import React, { useState } from 'react';

export default function TipyPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // DATA (Později půjdou ze Supabase)
  const tipyData = [
    {
      id: 1,
      title: "Undervolting: Nižší teploty, stejný výkon ⚡",
      description: "Jak zkrotit moderní CPU a GPU bez ztráty FPS. Návod na bezpečné ladění napětí pro stabilnější stroj.",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop",
      category: "HARDWARE",
      date: "3. Března 2026"
    },
    {
      id: 2,
      title: "Lokální AI: Tvůj vlastní Guru v PC 🤖",
      description: "Návod, jak rozjet LLM modely lokálně přes LM Studio nebo Ollama. Soukromí a výkon bez cloudu.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
      category: "AI",
      date: "2. Března 2026"
    }
  ];

  // FILTROVÁNÍ (Chytré vyhledávání)
  const filteredTipy = tipyData.filter(tip => 
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ 
      backgroundColor: '#0a0b0d', 
      backgroundImage: 'url("/bg-guru.png")', // TVOJE POZADÍ
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: 'sans-serif', 
      padding: '40px 20px' 
    }}>
      
      {/* SOCIAL BAR (Kick, YT, Discord) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        <a href="https://kick.com/TheHardwareGuru" target="_blank" style={{ color: '#53fc18', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', border: '1px solid #53fc18', padding: '5px 15px', borderRadius: '10px' }}>KICK</a>
        <a href="https://youtube.com/@TheHardwareGuru_Czech" target="_blank" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', border: '1px solid #ff0000', padding: '5px 15px', borderRadius: '10px' }}>YOUTUBE</a>
        <a href="https://discord.gg/TheHardwareGuru" target="_blank" style={{ color: '#5865F2', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', border: '1px solid #5865F2', padding: '5px 15px', borderRadius: '10px' }}>DISCORD</a>
      </div>

      {/* SEARCH BOX */}
      <div style={{ maxWidth: '600px', margin: '0 auto 60px auto', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Hledat v databázi Guru tipů..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '18px 25px', borderRadius: '20px',
            background: 'rgba(17, 19, 24, 0.8)', border: '2px solid #3b0764',
            color: '#fff', fontSize: '16px', outline: 'none',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
          }}
        />
        <span style={{ position: 'absolute', right: '25px', top: '18px', opacity: '0.5' }}>🔍</span>
      </div>

      {/* GRID ČLÁNKŮ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        {filteredTipy.length > 0 ? filteredTipy.map((tip) => (
          <article key={tip.id} style={{
            background: 'rgba(17, 19, 24, 0.9)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '28px', overflow: 'hidden'
          }}>
            <img src={tip.image} alt={tip.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '25px' }}>
              <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold' }}>{tip.category}</span>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '10px 0' }}>{tip.title}</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>{tip.description}</p>
            </div>
          </article>
        )) : (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#4b5563' }}>
            Žádný Guru tip pro tento výraz neexistuje... ⚡
          </div>
        )}
      </div>
    </div>
  );
}
