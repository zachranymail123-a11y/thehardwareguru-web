"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ChevronLeft, Send, User, Mail, Cpu, MessageSquare, 
  AlertCircle, CheckCircle2, ShieldCheck, HelpCircle, Zap
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PoradnaPage({ isEn = false }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', components: '', question: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  
  // Nový state pro historii dotazů
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        setFormData(prev => ({ ...prev, email: session.user.email || '' }));
      }
      setLoadingUser(false);
    };
    checkUser();

    // Načtení historie dotazů
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('pc_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setQuestionsList(data);
      setLoadingQuestions(false);
    };
    fetchQuestions();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setStatus({ loading: true, error: null, success: false });

    const newQuestion = {
      user_id: user.id,
      name: formData.name,
      email: formData.email,
      components: formData.components,
      question: formData.question
    };

    const { error, data } = await supabase
      .from('pc_questions')
      .insert([newQuestion])
      .select();

    if (error) {
      setStatus({ loading: false, error: isEn ? 'Something went wrong. Please try again.' : 'Něco se pokazilo. Zkus to prosím znovu.', success: false });
    } else {
      setStatus({ loading: false, error: null, success: true });
      setFormData({ name: '', email: user.email || '', components: '', question: '' });
      // Přidání nového dotazu hned do seznamu (aby uživatel nemusel refreshovat)
      if (data && data.length > 0) {
        setQuestionsList(prev => [data[0], ...prev]);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    }).format(new Date(dateString));
  };

  if (loadingUser) return <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d' }}></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en" : "/"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO HOME' : 'ZPĚT NA HLAVNÍ STRANU'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
            <ShieldCheck size={14} /> {isEn ? 'VIP GURU SUPPORT' : 'VIP GURU PODPORA'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            PC <span style={{ color: '#a855f7' }}>{isEn ? 'HELP DESK' : 'PORADNA'}</span>
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '15px', fontSize: '1.1rem' }}>
            {isEn ? 'Having issues with your build or planning an upgrade? Ask away.' : 'Máš problém se sestavou nebo plánuješ upgrade? Zeptej se.'}
          </p>
        </header>

        {/* --- SEKCE FORMULÁŘE --- */}
        {!user ? (
          <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '50px 20px', textAlign: 'center', marginBottom: '60px' }}>
            <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: '950', marginBottom: '15px', color: '#fff' }}>{isEn ? 'MEMBERS ONLY' : 'GURU RADÍ JEN ČLENŮM'}</h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
              {isEn ? 'You need to log in to submit a question. This helps us filter out bots and spammers.' : 'Pro položení dotazu do poradny se musíš přihlásit. Odfiltrujeme tak boty a spammery.'}
            </p>
            <a href={isEn ? "/en/login" : "/login"} style={{ background: '#a855f7', color: '#fff', padding: '16px 35px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase' }}>
              {isEn ? 'LOGIN / REGISTER' : 'PŘIHLÁSIT SE / REGISTROVAT'}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', marginBottom: '60px' }}>
            
            {status.success && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', color: '#4ade80' }}>
                <CheckCircle2 size={24} />
                <div>
                  <strong style={{ display: 'block', fontSize: '1.1rem' }}>{isEn ? 'Question Submitted!' : 'Dotaz odeslán!'}</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{isEn ? 'The Guru will take a look at it soon.' : 'Guru se na to co nejdřív podívá.'}</span>
                </div>
              </div>
            )}

            {status.error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '15px', borderRadius: '12px', marginBottom: '30px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} /> {status.error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label className="guru-label"><User size={14}/> {isEn ? 'Your Name / Nickname' : 'Tvé jméno / Přezdívka'}</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="guru-input" placeholder={isEn ? 'What should the Guru call you?' : 'Jak ti má Guru říkat?'} />
              </div>
              <div>
                <label className="guru-label"><Mail size={14}/> E-mail</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="guru-input" disabled style={{ opacity: 0.6 }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="guru-label"><Cpu size={14}/> {isEn ? 'Your PC Specs (Optional)' : 'Tvoje PC Sestava (Volitelné)'}</label>
              <textarea name="components" value={formData.components} onChange={handleChange} className="guru-input" rows="2" placeholder={isEn ? 'E.g. RTX 4070, Ryzen 5 7600, 32GB RAM...' : 'Např. RTX 4070, Ryzen 5 7600, 32GB RAM...'}></textarea>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label className="guru-label"><MessageSquare size={14}/> {isEn ? 'Your Question' : 'Tvůj dotaz'}</label>
              <textarea required name="question" value={formData.question} onChange={handleChange} className="guru-input" rows="6" placeholder={isEn ? 'What do you need help with? Be as detailed as possible...' : 'Co potřebuješ vyřešit? Napiš to co nejpodrobněji...'}></textarea>
            </div>

            <button type="submit" disabled={status.loading} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', width: '100%', padding: '18px', border: 'none', borderRadius: '12px', fontWeight: '950', fontSize: '1rem', textTransform: 'uppercase', cursor: status.loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', opacity: status.loading ? 0.7 : 1 }}>
              {status.loading ? (isEn ? 'SUBMITTING...' : 'ODESÍLÁM...') : <><Send size={18} /> {isEn ? 'ASK THE GURU' : 'ODESLAT DOTAZ GURUVI'}</>}
            </button>
          </form>
        )}

        {/* --- SEKCE HISTORIE DOTAZŮ --- */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <HelpCircle size={24} color="#a855f7" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: 0, textTransform: 'uppercase' }}>
              {isEn ? 'RECENT DISCUSSIONS' : 'CO SE ŘEŠÍ V KOMUNITĚ'}
            </h2>
          </div>

          {loadingQuestions ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>{isEn ? 'LOADING...' : 'NAČÍTÁM...'}</div>
          ) : questionsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(15, 17, 21, 0.5)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              {isEn ? 'No questions yet. Be the first to ask!' : 'Zatím tu nejsou žádné dotazy. Zeptej se jako první!'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {questionsList.map((q) => (
                <div key={q.id} style={{ background: 'rgba(15, 17, 21, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '1.1rem', display: 'block' }}>{q.name}</strong>
                        {q.components && <span style={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase' }}>{q.components}</span>}
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>{formatDate(q.created_at)}</span>
                    </div>
                    <p style={{ color: '#d1d5db', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{q.question}</p>
                  </div>

                  {q.is_answered && q.answer && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.05)', borderTop: '1px solid rgba(34, 197, 94, 0.2)', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '0.85rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px' }}>
                        <Zap size={14} /> GURU ODPOVĚĎ
                      </div>
                      <p style={{ color: '#fff', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
        .guru-label { display: flex; align-items: center; gap: 8px; color: #9ca3af; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .guru-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; color: #fff; font-family: inherit; font-size: 1rem; transition: 0.3s; box-sizing: border-box; }
        .guru-input:focus { outline: none; border-color: #a855f7; background: rgba(0,0,0,0.8); }
        @media (max-width: 768px) {
          form > div:first-of-type { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}
