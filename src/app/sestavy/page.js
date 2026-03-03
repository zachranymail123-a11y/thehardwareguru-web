'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Wallet, Rocket, Home, Lightbulb, PenTool, MessageSquare, MonitorPlay, Youtube } from 'lucide-react';

export default function GuruBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    budget: '30000',
    usage: 'Gaming', // Natvrdo pro herní mašiny
    preference: 'Červeno-Zelený' // Výchozí tým
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
        router.push(data.url);
      } else {
        alert(data.error || "Došlo k chybě při hledání cen.");
        setLoading(false);
      }
    } catch (err) {
      alert("Guru má teď moc práce s ověřováním cen na Alze, zkus to za vteřinu.");
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
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
          <p style={subtitleStyle}>Aktuální herní mašiny. Ceny ověřeny na Alza.cz, Smarty.cz a Mironet.cz.</p>
        </div>

        <div style={glassCardStyle}>
          <form onSubmit={handleSubmit} style={formStyle}>
            {/* ROZPOČET */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}><Wallet size={18} color="#a855f7" /> TVŮJ ROZPOČET (Kč)</label>
              <input 
                type="number" 
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                style={inputStyle}
                placeholder="Např. 35000"
                required
              />
            </div>

            {/* TÝM GURU - TVRDÉ VOLBY */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}><Rocket size={18} color="#a855f7" /> TÝM GURU</label>
              <select 
                value={formData.preference}
                onChange={(e) => setFormData({...formData, preference: e.target.value})}
                style={inputStyle}
              >
                <option value="Červeno-Zelený">Červeno-Zelený (AMD CPU + NVIDIA GPU)</option>
                <option value="Červený">Červený (AMD CPU + AMD GPU)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={loading ? btnDisabledStyle : btnStyle}
            >
              {loading ? 'GURU PROVĚŘUJE SKLADY E-SHOPŮ...' : 'SESTAVIT HERNÍ STROJ'}
            </button>
          </form>
        </div>

        <p style={footerNoteStyle}>
          * Guru builder kontroluje reálnou dostupnost komponent na českém trhu. <br/>
          Striktně AM5 (B850/X870) | Pouze RTX 4000/5000 nebo Radeon 9070/XT.
        </p>

        {/* GURU KOMUNITA */}
        <div style={communityContainerStyle}>
          <h3 style={communityTitleStyle}>JSI V TOM S NÁMI? PŘIPOJ SE!</h3>
          <div style={socialsContainerStyle}>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>
              <MessageSquare size={16} /> DISCORD
            </a>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18', '#000')}>
              <MonitorPlay size={16} /> KICK
            </a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#FF0000')}>
              <Youtube size={16} /> YOUTUBE
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- STYLY ---
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
const footerNoteStyle = { textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#4b5563', lineHeight: '1.6' };

const communityContainerStyle = { marginTop: '60px', textAlign: 'center' };
const communityTitleStyle = { color: '#a855f7', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' };
const socialsContainerStyle = { display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' };

const socialBtnStyle = (bgColor, textColor = '#fff') => ({
  display: 'inline-flex', alignItems: 'center', gap: '8px', background: bgColor, color: textColor,
  padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none'
});
