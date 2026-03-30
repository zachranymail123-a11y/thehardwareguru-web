import React from 'react';
import Script from 'next/script';
import Link from 'next/link'; // 🔥 OPRAVA: Chybějící import Linku
import { 
  Lightbulb, ChevronRight, Activity, Heart, ShieldCheck, Trophy, Rocket, 
  Play, Flame, ShoppingCart, Ghost, Swords, Cpu, Gamepad2, Layers, 
  MessageSquare, Award, Bell, Bookmark, Share2, Clock, Compass, Shuffle, 
  Link2, Monitor, Smartphone, Tv, LifeBuoy
} from 'lucide-react';
import SeznamAd from '../components/SeznamAd';

/**
 * GURU HOMEPAGE V18.9 - BUILD FIX & MONEY MAKER
 * 🚀 CÍL: Oprava ReferenceError a zachování maximální monetizace (ID: 71c85dea).
 */

export async function generateMetadata({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  const baseUrl = 'https://thehardwareguru.cz';

  const title = isEn ? 'Hardware Guru – CPU, GPU comparison, FPS calculator and PC Builds' : 'Hardware Guru – CPU, GPU srovnání, FPS kalkulačka a PC Sestavy';
  const description = isEn ? 'Your technology base for CPU, GPU comparison, bottleneck calculation, PC builds and latest HW news.' : 'Vaše technologická základna pro srovnání CPU, GPU, výpočet bottlenecku, PC sestavy a nejnovější HW novinky.';

  return {
    title, 
    description,
    alternates: {
      canonical: isEn ? `${baseUrl}/en` : `${baseUrl}/`, 
      languages: { 'cs-CZ': `${baseUrl}/`, 'en-US': `${baseUrl}/en` }
    },
    openGraph: { title, description, url: isEn ? `${baseUrl}/en` : `${baseUrl}/`, siteName: 'The Hardware Guru', type: 'website' }
  };
}

const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response.json();
  } catch (error) {
    clearTimeout(id);
    return null;
  }
};

const getThumbnail = (post) => {
  if (post.image_url) return post.image_url;
  if (post.video_id && post.video_id.length > 5) return `https://img.youtube.com/vi/${post.video_id}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000';
};

export default async function HomePage({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const fetchOpts = { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, next: { revalidate: 60 } };

  // 🔥 OSTRÉ EHUB TRACKING LINKY (ID: 71c85dea)
  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";

  let p = [], duelsRes = [], cpuDuelsRes = [];

  try {
    [p, duelsRes, cpuDuelsRes] = await Promise.all([
      fetchWithTimeout(`${supabaseUrl}/rest/v1/posts?select=id,title,title_en,slug,slug_en,created_at,image_url,video_id,type&type=neq.expected&order=created_at.desc&limit=35`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/gpu_duels?select=id,title_cs,title_en,slug,slug_en,created_at&order=created_at.desc&limit=11`, fetchOpts),
      fetchWithTimeout(`${supabaseUrl}/rest/v1/cpu_duels?select=id,title_cs,title_en,slug,slug_en,created_at&order=created_at.desc&limit=11`, fetchOpts)
    ]);
  } catch (err) {}

  const latestPosts = p || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', fontFamily: 'sans-serif' }}>
      
      <style>{`
        .guru-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; max-width: 1200px; margin: 40px auto; padding: 60px 40px; background: rgba(15, 17, 21, 0.9); border-radius: 32px; border: 1px solid rgba(102, 252, 241, 0.2); backdrop-filter: blur(15px); }
        .action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 30px; }
        .btn-main { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 950; font-size: 11px; text-transform: uppercase; transition: 0.3s; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #fff; text-align: center; }
        .btn-main:hover { transform: translateY(-3px); background: rgba(255,255,255,0.08); }
        .live-btn { border-color: #53fc1850; color: #53fc18; }
        .gpu-btn { border-color: #ff005550; color: #ff0055; }
        .cpu-btn { border-color: #66fcf150; color: #66fcf1; }
        .deal-btn { background: rgba(249, 115, 22, 0.1); border-color: #f97316; color: #f97316; }
        .hub-btn { background: rgba(168, 85, 247, 0.1); border-color: #a855f7; color: #a855f7; }
        
        .partner-strip { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1200px; margin: 0 auto 60px; padding: 0 20px; }
        .partner-card { background: rgba(15, 17, 21, 0.8); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; transition: 0.3s; }
        .partner-card:hover { transform: scale(1.02); border-color: rgba(255,255,255,0.2); }
        .p-tag { font-size: 10px; font-weight: 950; color: #a855f7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: block; }
        .p-link { color: #fff; text-decoration: none; font-weight: 900; font-size: 13px; display: flex; align-items: center; gap: 5px; margin-top: 15px; }

        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 1024px) { .guru-hero-grid { grid-template-columns: 1fr; text-align: center; } .action-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .ad-desktop-wrapper { display: none !important; } .ad-mobile-wrapper { display: flex !important; } .partner-strip { grid-template-columns: 1fr; } }
      `}</style>

      {/* --- 🚀 TOP REKLAMA ABOVE THE FOLD --- */}
      <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        <div className="ad-desktop-wrapper">
          <SeznamAd zoneId={408654} width={970} height={210} />
        </div>
        <div className="ad-mobile-wrapper">
          <SeznamAd zoneId={408651} width={300} height={250} />
        </div>
      </div>

      {/* --- 🚀 HERO SECTION --- */}
      <header className="guru-hero-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '20px' }}>
            <ShieldCheck size={18} />
            <span style={{ fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '10px' }}>VAŠE TECHNOLOGICKÁ ZÁKLADNA</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '950', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '20px' }}>
            HARDWARE GURU – <span style={{ color: '#66fcf1' }}>CPU</span>, <span style={{ color: '#ff0055' }}>GPU</span> A <span style={{ color: '#a855f7' }}>PC SESTAVY</span>
          </h1>
          <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '16px' }}>S 20 lety praxe v servisu vím, kde každá mašina tlačí. Moje mise: vymýtit lagy a zkrotit FPS.</p>
          
          <div className="action-grid">
            <a href="https://kick.com/TheHardwareGuru" target="_blank" className="btn-main live-btn"><Tv size={14}/> LIVE</a>
            <Link href="/gpuvs" className="btn-main gpu-btn"><Swords size={14}/> GPU VS</Link>
            <Link href="/cpuvs" className="btn-main cpu-btn"><Cpu size={14}/> CPU VS</Link>
            <Link href="/fps-kalkulacka" className="btn-main hub-btn"><Gamepad2 size={14}/> ROZJEDU TO?</Link>
            <Link href="/bottleneck-kalkulacka" className="btn-main cpu-btn"><Layers size={14}/> BOTTLENECK</Link>
            <Link href="/support" className="btn-main"><MessageSquare size={14}/> PORADNA</Link>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="btn-main deal-btn"><Flame size={14}/> SLEVY HRY</a>
            <Link href="/sestavy" className="btn-main hub-btn"><ShoppingCart size={14}/> HW HUB</Link>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: '950', color: '#66fcf1', boxShadow: '0 0 40px rgba(102, 252, 241, 0.3)' }}>HG</div>
        </div>
      </header>

      {/* --- 💰 EHUB AFFILIATE STRIP (ID: 71c85dea) --- */}
      <section className="partner-strip">
        <div className="partner-card">
           <span className="p-tag">GURU EXKLUZIVNĚ</span>
           <h3 style={{ fontSize: '20px', fontWeight: '950' }}>SHOPCOM.CZ</h3>
           <p style={{ color: '#6b7280', fontSize: '14px' }}>Komponenty a PC sestavy za nejlepší ceny na trhu.</p>
           <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="p-link">KOUPIT HARDWARE <ChevronRight size={14} /></a>
        </div>
        <div className="partner-card">
           <span className="p-tag" style={{ color: '#66fcf1' }}>PROVĚŘENO GURUEM</span>
           <h3 style={{ fontSize: '20px', fontWeight: '950' }}>CUBENEST</h3>
           <p style={{ color: '#6b7280', fontSize: '14px' }}>Elitní doplňky na stůl, MagSafe nabíječky a stojánky.</p>
           <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="p-link">VYBAVIT SETUP <ChevronRight size={14} /></a>
        </div>
      </section>

      {/* --- 🚀 CONTENT GRID --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {latestPosts.slice(0, 6).map(post => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(31, 40, 51, 0.95)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(102, 252, 241, 0.1)' }}>
                <img src={getThumbnail(post)} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{isEn ? post.title_en : post.title}</h3>
                  <div style={{ marginTop: '15px', color: '#66fcf1', fontWeight: 'bold', fontSize: '12px' }}>ČÍST VÍCE →</div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>

      {/* --- 💰 STICKY BOTTOM ANCHOR --- */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

    </div>
  );
}
