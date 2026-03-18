import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0a0b0d', 
      color: '#fff',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '10rem', fontWeight: '950', margin: 0, color: '#f43f5e' }}>404</h1>
      <h2 style={{ fontSize: '2rem', textTransform: 'uppercase' }}>Hardware Guru: Stránka nenalezena</h2>
      <p style={{ color: '#9ca3af', margin: '20px 0' }}>Tento build se nepovedl. Zkus se vrátit na hlavní základnu.</p>
      
      <Link href="/" style={{ 
        padding: '15px 30px', 
        background: '#f43f5e', 
        borderRadius: '50px', 
        color: '#fff', 
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Home size={20} /> ZPĚT NA HLAVNÍ STRANU
      </Link>
    </div>
  );
}
