"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Home, Cpu, Menu, X, Wrench } from 'lucide-react';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/hledat?q=${encodeURIComponent(query)}`);
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(10, 11, 13, 0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #eab308', padding: '15px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff'
    }}>
      {/* LOGO & MENU */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#eab308', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: '20px', fontStyle: 'italic' }}>
          <Cpu size={24} color="#7c3aed" />
          <span>GURU<span style={{ color: '#fff' }}>WEB</span></span>
        </Link>
        <div className="desktop-only" style={{ display: 'flex', gap: '15px', marginLeft: '20px' }}>
          <Link href="/" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><Home size={16}/> Domů</Link>
          <Link href="/tweaky" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><Wrench size={16}/> Tweaky</Link>
        </div>
      </div>

      {/* VYHLEDÁVÁNÍ */}
      <form onSubmit={handleSearch} className="desktop-only" style={{ flex: 1, maxWidth: '400px', margin: '0 20px', position: 'relative' }}>
        <input 
          type="text" placeholder="Hledat hry, tweaky..." value={query} onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #333', color: '#fff', outline: 'none' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
      </form>

      {/* SÍTĚ */}
      <div className="desktop-only" style={{ display: 'flex', gap: '15px' }}>
        <a href="https://kick.com/TheHardwareGuru" target="_blank" rel="noreferrer" style={{ color: '#53fc18', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>KICK</a>
        <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" style={{ color: '#5865F2', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>DISCORD</a>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) { .desktop-only { display: none !important; } .mobile-btn { display: block !important; } }
        .mobile-btn { display: none; background: none; border: none; cursor: pointer; color: #eab308; }
      `}} />

      {/* MOBILNÍ MENU BTN */}
      <button className="mobile-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* MOBILNÍ ROZBALOVACÍ MENU */}
      {isOpen && (
        <div style={{ position: 'absolute', top: '65px', left: 0, right: 0, background: '#0a0b0d', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', borderBottom: '1px solid #333' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input type="text" placeholder="Hledat..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '12px', background: '#111', border: '1px solid #333', color: '#fff' }} />
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          </form>
          <Link href="/" onClick={() => setIsOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '18px' }}>Domů</Link>
          <Link href="/tweaky" onClick={() => setIsOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '18px' }}>Tweaky</Link>
        </div>
      )}
    </nav>
  );
}
