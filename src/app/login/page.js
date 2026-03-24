"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ChevronLeft, Mail, Lock, LogIn, UserPlus, 
  AlertCircle, CheckCircle2, ShieldCheck 
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage({ isEn = false }) {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    if (isLoginMode) {
      // Přihlášení
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setStatus({ loading: false, error: isEn ? 'Invalid email or password.' : 'Neplatný e-mail nebo heslo.', success: null });
      } else {
        setStatus({ loading: false, error: null, success: isEn ? 'Logged in successfully!' : 'Úspěšně přihlášeno!' });
        router.push(isEn ? '/en/poradna' : '/poradna');
      }
    } else {
      // Registrace
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setStatus({ loading: false, error: error.message, success: null });
      } else {
        // Supabase standardně vyžaduje potvrzení e-mailu
        if (data?.user?.identities?.length === 0) {
            setStatus({ loading: false, error: isEn ? 'This email is already registered.' : 'Tento e-mail je již zaregistrován.', success: null });
        } else {
            setStatus({ 
                loading: false, 
                error: null, 
                success: isEn ? 'Registration successful! Check your email to confirm your account.' : 'Registrace úspěšná! Zkontroluj si e-mail pro potvrzení účtu.' 
            });
        }
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setStatus({ loading: false, error: null, success: null });
    setFormData({ email: '', password: '' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '500px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/poradna" : "/poradna"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO HELP DESK' : 'ZPĚT NA PORADNU'}
          </a>
        </div>

        <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', padding: '6px 16px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
              <ShieldCheck size={14} /> GURU AUTH
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0' }}>
              {isLoginMode ? (isEn ? 'Welcome Back' : 'Vítej zpět') : (isEn ? 'Create Account' : 'Vytvořit účet')}
            </h1>
          </div>

          {status.success && (
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '15px', borderRadius: '12px', marginBottom: '25px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={20} /> {status.success}
            </div>
          )}

          {status.error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '15px', borderRadius: '12px', marginBottom: '25px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <AlertCircle size={20} /> {status.error}
            </div>
          )}

          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: '20px' }}>
              <label className="guru-label"><Mail size={14}/> E-mail</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="guru-input" placeholder="guru@example.com" />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label className="guru-label"><Lock size={14}/> {isEn ? 'Password' : 'Heslo'}</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="guru-input" placeholder="••••••••" minLength="6" />
            </div>

            <button type="submit" disabled={status.loading} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', width: '100%', padding: '16px', border: 'none', borderRadius: '12px', fontWeight: '950', fontSize: '1rem', textTransform: 'uppercase', cursor: status.loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', opacity: status.loading ? 0.7 : 1 }}>
              {status.loading ? (isEn ? 'PROCESSING...' : 'ZPRACOVÁVÁM...') : (
                isLoginMode ? <><LogIn size={18} /> {isEn ? 'LOGIN' : 'PŘIHLÁSIT SE'}</> : <><UserPlus size={18} /> {isEn ? 'REGISTER' : 'ZAREGISTROVAT SE'}</>
              )}
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
              {isLoginMode 
                ? (isEn ? "Don't have an account? Sign up" : "Nemáš účet? Registruj se") 
                : (isEn ? "Already have an account? Log in" : "Už máš účet? Přihlas se")
              }
            </button>
          </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #a855f7; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(168, 85, 247, 0.3); transition: 0.3s; }
        .guru-label { display: flex; align-items: center; gap: 8px; color: #9ca3af; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .guru-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; color: #fff; font-family: inherit; font-size: 1rem; transition: 0.3s; box-sizing: border-box; }
        .guru-input:focus { outline: none; border-color: #a855f7; background: rgba(0,0,0,0.8); }
      `}} />
    </div>
  );
}
