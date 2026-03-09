import React from 'react';
import { 
  ShoppingCart, 
  ChevronLeft, 
  Calendar, 
  ShieldCheck, 
  Flame, 
  Ghost, 
  Heart, 
  Swords, 
  Zap, 
  Trophy 
} from 'lucide-react';

/**
 * GURU ENGINE - ARTICLE DETAIL V24.0 (SUPREME DESIGN & STABLE FETCH)
 * Cesta: src/app/clanky/[slug]/page.js
 * 🛡️ FIX 1: Opraveny překlepy GURU_PLACE_HOLDER -> GURU_PLACEHOLDER dle ChatGPT.
 * 🛡️ FIX 2: Revalidace snížena na 60s + přidán Cache Buster pro Supabase REST.
 * 🛡️ FIX 3: Nativní fetch API a standardní HTML <a> tagy pro navigaci.
 * 🛡️ FIX 4: Opravena detekce obrázku + Fallback na Davinci placeholder.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU: Fallback URL pro tvůj high-tech placeholder ze Supabase Storage
const GURU_PLACEHOLDER = `${supabaseUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png`;

// Pomocná funkce pro získání dat přes nativní fetch (imunní vůči chybám v sandboxu)
async function getPostData(slug) {
  if (!supabaseUrl || !supabaseKey) return null;
  
  // Přidáváme timestamp pro bypass Supabase REST cache dle doporučení ChatGPT
  const url = `${supabaseUrl}/rest/v1/posts?select=*&or=(slug.eq.${slug},slug_en.eq.${slug})&limit=1&_=${Date.now()}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 } // Změněno z 3600 na 60 dle doporučení ChatGPT
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const slug = params?.slug;
  const post = await getPostData(slug);

  if (!post) return { title: '404 | The Hardware Guru' };

  const isEn = post.slug_en === slug;
  const title = isEn && post.title_en ? post.title_en : post.title;
  const desc = isEn && post.seo_description_en ? post.seo_description_en : post.seo_description;

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: post.image_url ? [post.image_url] : [GURU_PLACEHOLDER], // Opraven překlep v názvu konstanty
    }
  };
}

export default async function ArticleDetail({ params }) {
  const slug = params?.slug;
  const post = await getPostData(slug);

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#ff0055', fontSize: '30px', fontWeight: '900', textTransform: 'uppercase' }}>404 - DATA NENALEZENA</h1>
      </div>
    );
  }

  // 2. GURU JAZYKOVÁ LOGIKA
  const isEn = post.slug_en === slug;
  const title = isEn && post.title_en ? post.title_en : post.title;
  const content = isEn && post.content_en ? post.content_en : post.content;
  const priceDisplay = isEn ? (post.price_en || '') : (post.price_cs || '');
  const backLink = isEn ? '/en/clanky' : '/clanky';
  
  // 🚀 GURU IMAGE FIX: Opraven název konstanty a validace URL
  const displayImage = (post.image_url && post.image_url.startsWith('http')) ? post.image_url : GURU_PLACEHOLDER;

  const buyBtnText = isEn 
    ? `BUY FOR BEST PRICE ${priceDisplay ? `(${priceDisplay})` : ''}` 
    : `KOUPIT ZA NEJLEPŠÍ CENU ${priceDisplay ? `(${priceDisplay})` : ''}`;

  const isLeak = (post.type || '').toLowerCase().trim().includes('leak');

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px',
        color: '#fff', fontFamily: 'sans-serif'
    }}>
      
      <main style={{ 
          maxWidth: '950px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.96)', 
          borderRadius: '35px', border: '1px solid rgba(102, 252, 241, 0.15)', 
          boxShadow: '0 35px 80px -20px rgba(0, 0, 0, 0.9)', overflow: 'hidden', backdropFilter: 'blur(20px)' 
      }}>
        
        {/* --- 🚀 HLAVNÍ OBRÁZEK S FALLBACKEM NA DAVINCI --- */}
        <div style={{ width: '100%', height: '480px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <img src={displayImage} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 60%)' }}></div>
          
          <div style={{ position: 'absolute', top: '35px', left: '35px' }}>
            <a href={backLink} style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.7)', 
                color: '#66fcf1', padding: '14px 22px', border: '1px solid rgba(102, 252, 241, 0.3)',
                borderRadius: '14px', textDecoration: 'none', fontWeight: '950', fontSize: '13px', 
                textTransform: 'uppercase', transition: '0.3s', backdropFilter: 'blur(10px)' 
            }}>
              <ChevronLeft size={16} /> {isEn ? 'BACK TO FEED' : 'ZPĚT DO FEEDU'}
            </a>
          </div>

          <div style={{ position: 'absolute', bottom: '35px', right: '35px', display: 'flex', gap: '12px' }}>
            {isLeak && (
              <div style={{ background: '#66fcf1', color: '#0b0c10', padding: '10px 20px', borderRadius: '14px', fontWeight: '950', fontSize: '13px', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(102, 252, 241, 0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ghost size={16} /> LEAKS & RUMORS
              </div>
            )}
            {post.affiliate_link && (
              <div style={{ background: '#f97316', color: '#fff', padding: '10px 20px', borderRadius: '14px', fontWeight: '950', fontSize: '13px', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={16} fill="currentColor" /> {isEn ? 'HOT DEAL' : 'GURU CENA'}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '50px 60px 70px 60px' }}>
          
          {/* --- HLAVIČKA --- */}
          <header style={{ marginBottom: '60px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', color: '#6b7280', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isLeak ? '#66fcf1' : '#ff0055' }}>
                 {isLeak ? <Ghost size={18} /> : <ShieldCheck size={18} />} 
                 {isLeak ? 'UNCONFIRMED INTEL' : 'GURU VERIFIED'}
              </span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }} suppressHydrationWarning>
                <Calendar size={16} /> {new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.05', margin: '0', textShadow: '0 10px 30px rgba(0,0,0,0.5)', fontStyle: 'italic' }}>
              {title}
            </h1>
          </header>

          {/* --- OBSAH ČLÁNKU --- */}
          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* --- 🚀 GURU AFFILIATE BOX --- */}
          {post.affiliate_link && (
            <div style={{ 
              marginTop: '80px', padding: '60px 40px', 
              background: 'linear-gradient(145deg, rgba(15,17,21,0.98) 0%, rgba(20,10,5,0.98) 100%)', 
              border: '1px solid rgba(249, 115, 22, 0.4)', borderLeft: '6px solid #f97316', borderRadius: '30px', 
              textAlign: 'center', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.9)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
              <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px', textShadow: '0 0 20px rgba(249, 115, 22, 0.5)', fontStyle: 'italic' }}>
                {isEn ? "Don't miss this hit!" : "NENECH SI TUHLE PECKU UJÍT!"}
              </h3>
              <p style={{ color: '#d1d5db', marginBottom: '40px', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
                {isEn 
                  ? "We found the best price for your machine upgrade. Instant key delivery and Guru-verified store." 
                  : "Našli jsme pro tebe tu nejlepší cenu na trhu pro upgrade tvé mašiny. Okamžité doručení klíče a Guru-ověřený obchod."}
              </p>
              <a href={post.affiliate_link} target="_blank" rel="nofollow sponsored" className="guru-affiliate-cta" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '22px 50px', 
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff',
                  fontWeight: '950', fontSize: '1.3rem', textTransform: 'uppercase', borderRadius: '20px',
                  textDecoration: 'none', boxShadow: '0 15px 40px rgba(234, 88, 12, 0.4)', transition: '0.3s',
                  border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <ShoppingCart size={30} /> {buyBtnText}
              </a>
            </div>
          )}

          {/* --- 🚀 GURU SUPREME SUPPORT SECTION --- */}
          <div style={{ marginTop: '90px', paddingTop: '60px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 40px 0', textAlign: 'center', fontStyle: 'italic', opacity: 0.9 }}>
              {isEn ? "ENJOYED THE INTEL? SUPPORT THE GURU!" : "LÍBIL SE TI ČLÁNEK? PODPOŘ NÁS!"}
            </h4>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '25px', width: '100%' }}>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-cta-btn deals">
                <Flame size={24} fill="currentColor" /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
              </a>
              <a href={isEn ? "/en/support" : "/support"} className="guru-cta-btn support">
                <Heart size={24} fill="currentColor" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </a>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-affiliate-cta:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 25px 60px rgba(234, 88, 12, 0.6); filter: brightness(1.1); }
        
        .guru-cta-btn {
            flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 14px; 
            padding: 22px 35px; border-radius: 22px; font-weight: 950; font-size: 16px; 
            text-transform: uppercase; text-decoration: none !important; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .guru-cta-btn.deals { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3); }
        .guru-cta-btn.support { background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); color: #000 !important; box-shadow: 0 10px 30px rgba(234, 179, 8, 0.3); }
        
        .guru-cta-btn:hover { transform: translateY(-6px) scale(1.02); filter: brightness(1.1); border-color: rgba(255,255,255,0.3); }
        .guru-cta-btn.deals:hover { box-shadow: 0 20px 50px rgba(249, 115, 22, 0.5); }
        .guru-cta-btn.support:hover { box-shadow: 0 20px 50px rgba(234, 179, 8, 0.5); }

        .guru-prose { color: #d1d5db; font-size: 1.2rem; line-height: 1.9; }
        .guru-prose h2 { color: #66fcf1; font-size: 2.3rem; font-weight: 950; margin-top: 2.5em; margin-bottom: 1em; text-transform: uppercase; letter-spacing: 1px; font-style: italic; }
        .guru-prose p { margin-bottom: 1.6em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose a { color: #f97316; font-weight: bold; text-decoration: none; border-bottom: 2px dashed rgba(249, 115, 22, 0.4); transition: 0.3s; }
        .guru-prose a:hover { border-bottom-style: solid; color: #ea580c; }
        .guru-prose li::before { content: '⚡'; position: absolute; left: 0; color: #66fcf1; font-weight: bold; }

        @media (max-width: 768px) {
          .guru-prose { font-size: 1.1rem; }
          .guru-cta-btn { width: 100%; font-size: 14px; }
        }
      `}} />
    </div>
  );
}
