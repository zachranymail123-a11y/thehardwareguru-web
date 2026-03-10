"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Rocket, Plus, Trash2, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MonetizeAdmin() {
  const [darci, setDarci] = useState([]);
  const [partneri, setPartneri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('darci');

  // Form states
  const [donorForm, setDonorForm] = useState({ name: '', amount: 0 });
  const [partnerForm, setPartnerForm] = useState({ name: '', url: '', description: '', description_en: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [d, p] = await Promise.all([
      supabase.from('darci').select('*').order('amount', { ascending: false }),
      supabase.from('partneri').select('*').order('created_at', { ascending: false })
    ]);
    setDarci(d.data || []);
    setPartneri(p.data || []);
    setLoading(false);
  }

  // --- HANDLERS DARCI ---
  const handleAddDonor = async () => {
    if (!donorForm.name) return;
    const { error } = await supabase.from('darci').insert([donorForm]);
    if (!error) { 
      setDonorForm({ name: '', amount: 0 }); 
      fetchData(); 
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!confirm('GURU: Smazat dárce ze síně slávy?')) return;
    await supabase.from('darci').delete().eq('id', id);
    fetchData();
  };

  // --- HANDLERS PARTNERI ---
  const handleAddPartner = async () => {
    if (!partnerForm.name || !partnerForm.url) return;
    const { error } = await supabase.from('partneri').insert([partnerForm]);
    if (!error) { 
      setPartnerForm({ name: '', url: '', description: '', description_en: '' }); 
      fetchData(); 
    }
  };

  const handleDeletePartner = async (id) => {
    if (!confirm('GURU: Smazat partnera a reklamu?')) return;
    await supabase.from('partneri').delete().eq('id', id);
    fetchData();
  };

  return (
    <div style={{ padding: '120px 20px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase' }}>GURU <span style={{ color: '#eab308' }}>CASH ADMIN</span></h1>
        <p style={{ color: '#9ca3af' }}>Manuální správa Síně slávy a Partnerů webu.</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('darci')} style={{ ...tabStyle, borderColor: activeTab === 'darci' ? '#a855f7' : '#333', background: activeTab === 'darci' ? 'rgba(168, 85, 247, 0.1)' : '#111' }}>
          <Trophy size={18} /> SÍŇ SLÁVY
        </button>
        <button onClick={() => setActiveTab('partneri')} style={{ ...tabStyle, borderColor: activeTab === 'partneri' ? '#eab308' : '#333', background: activeTab === 'partneri' ? 'rgba(234, 179, 8, 0.1)' : '#111' }}>
          <Rocket size={18} /> PARTNEŘI
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 className="animate-spin" size={48} color="#eab308" /></div>
      ) : activeTab === 'darci' ? (
        <div style={sectionBox}>
          <h2 style={{ color: '#a855f7', marginBottom: '20px', textTransform: 'uppercase' }}>Přidat dárce (Síň slávy)</h2>
          <div style={formRow}>
            <input placeholder="Jméno legendy" value={donorForm.name} onChange={e => setDonorForm({...donorForm, name: e.target.value})} style={inputStyle} />
            <input type="number" placeholder="Částka (Kč)" value={donorForm.amount} onChange={e => setDonorForm({...donorForm, amount: e.target.value})} style={inputStyle} />
            <button onClick={handleAddDonor} style={{ ...btnStyle, background: '#a855f7' }}><Plus /> PŘIDAT</button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ padding: '15px' }}>JMÉNO</th>
                <th style={{ padding: '15px' }}>ČÁSTKA</th>
                <th style={{ padding: '15px' }}>AKCE</th>
              </tr>
            </thead>
            <tbody>
              {darci.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '15px' }}>{d.name}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#a855f7' }}>{d.amount} Kč</td>
                  <td style={{ padding: '15px' }}><button onClick={() => handleDeleteDonor(d.id)} style={delBtn}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={sectionBox}>
          <h2 style={{ color: '#eab308', marginBottom: '20px', textTransform: 'uppercase' }}>Přidat partnera (Reklama nad 500 Kč)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={formRow}>
              <input placeholder="Název projektu/streamu" value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} style={inputStyle} />
              <input placeholder="URL (včetně https://)" value={partnerForm.url} onChange={e => setPartnerForm({...partnerForm, url: e.target.value})} style={inputStyle} />
            </div>
            <textarea placeholder="Popis CZ (krátký, úderný)" value={partnerForm.description} onChange={e => setPartnerForm({...partnerForm, description: e.target.value})} style={{...inputStyle, height: '80px'}} />
            <textarea placeholder="Popis EN (Guru technical translation)" value={partnerForm.description_en} onChange={e => setPartnerForm({...partnerForm, description_en: e.target.value})} style={{...inputStyle, height: '80px'}} />
            <button onClick={handleAddPartner} style={{ ...btnStyle, background: '#eab308', color: '#000' }}><Plus /> ULOŽIT PARTNERA</button>
          </div>
          <div style={{ marginTop: '40px' }}>
             {partneri.map(p => (
               <div key={p.id} style={{ background: '#111', padding: '15px', borderRadius: '12px', border: '1px solid #333', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <div style={{ fontWeight: 'bold', color: '#eab308' }}>{p.name}</div>
                   <div style={{ fontSize: '12px', color: '#666' }}>{p.url}</div>
                 </div>
                 <button onClick={() => handleDeletePartner(p.id)} style={delBtn}><Trash2 size={16} /></button>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}

const tabStyle = { flex: 1, padding: '15px', background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: '0.2s' };
const sectionBox = { background: '#0a0b0d', border: '1px solid #1f2937', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const formRow = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
const inputStyle = { flex: 1, minWidth: '200px', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' };
const btnStyle = { padding: '12px 25px', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };
const tableStyle = { width: '100%', marginTop: '30px', borderCollapse: 'collapse', textAlign: 'left' };
const delBtn = { background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', transition: '0.2s' };
