'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Wallet, Rocket, Monitor, Home, Lightbulb, Book, PenTool } from 'lucide-react';

export default function GuruBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    budget: '30000',
    usage: 'Gaming',
    preference: 'Žádná'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/guru-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.url); // Přesměrování na /sestavy/[slug]
      }
    } catch (err) {
      alert("Guru má teď moc práce, zkus to za vteřinu.");
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* NAVIGACE (Guru Standard) */}
      <nav style={navStyle}>
        <a href="/" style={navItemStyle}><Home size={18} /> HOMEPAGE</a>
        <a href="/tipy" style={navItemStyle}><Lightbulb size={18} /> TIPY</a>
        <a href="/sestavy" style={{...navItemStyle, color: '#a855f7'}}><Cpu size={18} /> GURU BUILDER</a>
        <a href="/rady" style={navItemStyle}><PenTool size={18} /> RADY</a>
      </nav>

      <main style={containerStyle}>
        <div style={headerStyle}>
          <Cpu size={60} color="#a855f7" />
          <h1 style={titleStyle}>GURU PC BUILDER</h1>
          <p style={subtitleStyle}>Nehádej, co koupit. Nech si sestavit mašinu podle aktuálních cen na trhu.</p>
        </div>

        <div style={glassCardStyle}>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><Wallet size={18} color="#a855f7" /> TVŮJ ROZPOČET (Kč)</label>
              <input 
                type="number" 
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                style={inputStyle}
                placeholder="Např. 25000"
                required
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}><Monitor size={18} color="#a855f7" /> HLAVNÍ VYUŽITÍ</label>
              <select 
                value={formData.usage}
                onChange={(e) => setFormData({...formData, usage: e.target.value})}
                style={inputStyle}
              >
                <option value="Gaming">Gaming (Hraní her)</option>
                <option value="Streaming">Streaming & Tvorba</option>
                <option value="AI & Work">AI, Programování & Práce</option>
                <option value="Office">Kancelář & Škola</option>
              </select>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}><Rocket size={18} color="#a855f7" /> PREFERENCE ZNAČKY</label>
              <select 
                value={formData.preference}
                onChange={(e) => setFormData({...formData, preference: e.target.value})}
                style={inputStyle}
              >
                <option value="Žádná">Je mi to fuk (Nejlepší výkon/cena)</option>
                <option value="NVIDIA/Intel">Tým Modro-Zelený (NVIDIA + Intel)</option>
                <option value="AMD Full">Tým Červený (AMD CPU + GPU)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={loading ? btnDisabledStyle : btnStyle}
            >
              {loading ? 'GURU POČÍTÁ A HLEDÁ CENY...' : 'SESTAVIT MAŠINU'}
            </button>
          </form>
        </div>

        <p style={footerNoteStyle}>
          * Guru builder používá Serper API k ověření aktuálních cen na českém trhu.
        </p>
      </main>
    </div>
  );
}

// --- STYLY (Sjednoceno s tvým webem) ---
const pageStyle = {
  backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff',
  backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed'
};

const navStyle = {
  display: 'flex', justifyContent: 'center', gap: '25px', padding: '20px',
  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
  position: 'sticky', top: 0, zIndex: 100
};

const navItemStyle = {
  color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
};

const containerStyle = { maxWidth: '600px', margin: '0 auto', padding: '60px 20px 100px' };

const headerStyle = { textAlign: 'center', marginBottom: '40px' };
const titleStyle = { fontSize: '42px', fontWeight: '900', marginTop: '20px', letterSpacing: '2px' };
const subtitleStyle = { color: '#9ca3af', marginTop: '10px', fontSize: '16px' };

const glassCardStyle = {
  background: 'rgba(17, 19, 24, 0.8)', padding: '40px', borderRadius: '30px',
  border: '1px solid rgba(168, 85, 247, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 0 40px rgba(168, 85, 247, 0.1)'
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '25px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labelStyle = { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7' };

const inputStyle = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  padding: '15px', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none'
};

const btnStyle = {
  background: '#a855f7', color: '#fff', border: 'none', padding: '20px', borderRadius: '15px',
  fontWeight: '900', fontSize: '18px', cursor: 'pointer', transition: '0.3s', marginTop: '10px',
  boxShadow: '0 10px 20px rgba(168, 85, 247, 0.3)'
};

const btnDisabledStyle = { ...btnStyle, background: '#4b5563', cursor: 'not-allowed', boxShadow: 'none' };
const footerNoteStyle = { textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#4b5563' };
