"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Home, FileText, Lightbulb, Wrench, BookOpen, HeartPulse, Heart } from 'lucide-react';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/hledat?q=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0a0b0d', // Tmavé pozadí přesně jako na fotce
      borderBottom: '1px solid #1f2937', padding: '15px 30px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff'
    }}>
      {/* LOGO (Tvoje fialové HARDWARE GURU) */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ color: '#a855f7', fontFamily: 'serif', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Hardware Guru
        </span>
      </Link>

      {/* VYHLEDÁVÁNÍ (Nové, funkční, uprostřed) */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '300px', margin: '0 20px', position: 'relative' }}>
        <input 
          type="text" placeholder="Hledat..." value={query} onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '8px 15px 8px 35px', borderRadius: '8px', background: 'transparent', border: '1px solid #374151', color: '#fff', outline: 'none', fontSize: '14px' }}
        />
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
      </form>

      {/* HLAVNÍ MENU (Podle tvé fotky) */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}><Home size={16}/> Domů</Link>
        <Link href="/clanky" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}><FileText size={16}/> Články</Link>
        <Link href="/tipy" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}><Lightbulb size={16}/> Tipy</Link>
        <Link href="/tweaky" style={{ color: '#eab308', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}><Wrench size={16}/> Guru Tweaky</Link>
        <Link href="/slovnik" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}><BookOpen size={16}/> Slovník</Link>
        <Link href="/rady" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}><HeartPulse size={16}/> Rady</Link>
      </div>

      {/* BAREVNÁ TLAČÍTKA A SÍTĚ (Přesně jako na fotce) */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '20px' }}>
        <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noreferrer" style={{ background: '#53fc18', color: '#000', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '12px' }}>KICK</a>
        <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{ background: '#ff0000', color: '#fff', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '12px' }}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{ background: '#5865F2', color: '#fff', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: '900', fontSize: '12px' }}>DISCORD</a>
        <a href="/podpora" style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #eab308', color: '#eab308', padding: '5px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}><Heart size={14} fill="#eab308" /> Podpora</a>
      </div>
    </nav>
  );
}
