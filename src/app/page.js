import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vypne cache - zajistí, že uvidíš vždy nové články okamžitě
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme data
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Funkce pro náhledovku
  const getThumbnail = (post) => {
    // Ověříme, že video_id existuje a má smysluplnou délku
    if (post.video_id && post.video_id.length > 5) {
        return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    }
    // Záložní obrázek pro HW novinky
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid #45a29e; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { background: #66fcf1; color: #0b0c10; box-shadow: 0 0 15px #66fcf1; transform: scale(1.05); }
        .read-more { color: #66fcf1; text-transform: uppercase; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: '#1f2833', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" className="nav-link">INSTAGRAM</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
        </div>
      </nav>

      {/* BIO */}
      <header style={{ maxWidth: '1200px', margin: '60px auto', padding: '40px', background: 'linear-gradient(145deg, #1f2833, #0b0c10)', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
        <div style={{ flex: '1', minWidth: '
