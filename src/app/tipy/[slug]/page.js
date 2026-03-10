import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🚀 GURU SEO: Dynamické Meta Tagy pro vyhledávače a sociální sítě
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  // Hledáme podle slug nebo slug_en pro jistotu podpory obou jazyků v tabulce tipy
  const { data: tip } = await supabase
    .from('tipy')
    .select('title, title_en, seo_description, seo_description_en, image_url, slug, slug_en')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (!tip) return { title: '404 | The Hardware Guru' };

  // Detekce angličtiny podle toho, zda URL odpovídá anglickému slugu
  const isEn = tip.slug_en === slug && slug !== tip.slug;
  const title = isEn && tip.title_en ? tip.title_en : tip.title;
  const desc = isEn && tip.seo_description_en ? tip.seo_description_en : tip.seo_description;

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: tip.image_url ? [tip.image_url] : [],
    }
  };
}

export default async function TipDetail({ params }) {
  const { slug } = params;

  // 1. GURU FETCH: Získání dat z databáze tipy
  const { data: tip, error } = await supabase
    .from('tipy')
    .select('*')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (error || !tip) {
    notFound();
  }

  // 2. GURU JAZYKOVÁ LOGIKA (Ošetřeno i bez [locale] v URL)
  const isEn = tip.slug_en === slug && slug !== tip.slug;
  const title = isEn && tip.title_en ? tip.title_en : tip.title;
  const content = isEn && tip.content_en ? tip.content_en : tip.content;
  const priceDisplay = isEn ? (tip.price_en || '') : (tip.price_cs || '');
  const buyBtnText = isEn 
    ? `BUY FOR BEST PRICE ${priceDisplay ? `(${priceDisplay})` : ''}` 
    : `KOUPIT ZA NEJLEPŠÍ CENU ${priceDisplay ? `(${priceDisplay})` : ''}`;
  const backLink = isEn ? '/en/tipy' : '/tipy';

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px' 
    }}>
      
      <main style={{ 
          maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 17, 21, 0.95)', 
          borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden', backdropFilter: 'blur(15px)' 
      }}>
        
        {/* --- 🚀 HRDINSKÝ OBRÁZEK TIPU --- */}
        {tip.image_url && (
          <div style={{ width: '100%', height: '450px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={tip.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Přechod do ztracena (Gradient) */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            
            {/* Tlačítko Zpět */}
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={backLink} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO TIPS' : 'ZPĚT NA TIPY'}
              </Link>
            </div>

            {/* Affiliate Badge (pokud je dostupný) */}
            {tip.affiliate_link && (
              <div style={{ position: 'absolute', top: '30px', right: '30px', background: '#f97316', color: '#fff', padding: '8px 16px', borderRadius: '12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} fill="currentColor" /> {isEn ? 'HOT DEAL INSIDE' : 'OBSAHUJE SLEVU'}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '40px 50px 60px 50px' }}>
          
          {/* --- HLAVIČKA TIPU --- */}
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#66fcf1' }}><ShieldCheck size={16} /> GURU ENGINE</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {new Date(tip.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0', textShadow: '0 0 20px rgba(102, 252, 241, 0.2)' }}>
              {title}
            </h1>
          </header>

          {/* --- OBSAH TIPU --- */}
          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

          {/* --- 🚀 GURU AFFILIATE NÁKUPNÍ BOX (Specifický pro daný tip) --- */}
          {tip.affiliate_link && (
            <div style={{ 
              marginTop: '70px', padding: '50px 40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.9) 0%, rgba(15, 17, 21, 0.95) 100%)', 
              border: '2px solid rgba(249, 115, 22, 0.5)', borderRadius: '24px', 
              textAlign: 'center', boxShadow: '0 20px 50px rgba(249, 115, 22, 0.15)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
              
              <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                {isEn ? "Don't miss this hit!" : "Nenech si tuhle pecku ujít!"}
              </h3>
              
              <p style={{ color: '#9ca3af', marginBottom: '35px', fontSize: '17px', maxWidth: '600px', margin: '0 auto 35px auto', lineHeight: '1.6' }}>
                {isEn 
                  ? "We found the best deal for you. Instant key delivery and Guru-verified store." 
                  : "Našli jsme pro tebe tu nejlepší cenu na trhu. Okamžité doručení klíče a Guru-ověřený obchod."}
              </p>

              <a 
                href={tip.affiliate_link} 
                target="_blank" 
                rel="nofollow sponsored" 
                className="guru-affiliate-cta"
              >
                <ShoppingCart size={26} />
                {buyBtnText}
              </a>
            </div>
          )}

          {/* --- 🚀 GURU GLOBÁLNÍ CTA (Podpora webu a Slevy - zobrazí se vždy) --- */}
          <div style={{ 
            marginTop: '70px', 
            paddingTop: '50px', 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '25px' 
          }}>
            <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
              {isEn ? "Did this tip help you? Support us either by buying games at the best prices or directly." : "Líbil se ti tento tip? Podpoř nás buď nákupem her za ty nejlepší ceny, nebo přímo."}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
              <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
                <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
              </a>
              <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
                <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* --- GURU TYPOGRAPHY & BUTTON CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Tlačítko zpět */
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; backdrop-filter: blur(5px); border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.2); }

        /* Tlačítko nákupu (Specifický Affiliate) */
        .guru-affiliate-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          padding: 22px 45px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff !important; font-weight: 950; font-size: 18px; text-transform: uppercase;
          border-radius: 18px; text-decoration: none !important; transition: 0.3s;
          box-shadow: 0 10px 35px rgba(234, 88, 12, 0.4); border: 1px solid rgba(255,255,255,0.1);
        }
        .guru-affiliate-cta:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 50px rgba(234, 88, 12, 0.6); filter: brightness(1.1); }

        /* Globální podpora & slevy tlačítka */
        .guru-support-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          padding: 18px 30px; background: #eab308; color: #000 !important;
          font-weight: 950; font-size: 15px; text-transform: uppercase;
          border-radius: 16px; text-decoration: none !important; transition: 0.3s;
          box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2);
        }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase;
          border-radius: 16px; text-decoration: none !important; transition: 0.3s;
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1);
        }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        /* Formátování obsahu z CKEditoru */
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #66fcf1; font-size: 2.2rem; font-weight: 950; margin-top: 2.5em; margin-bottom: 1em; text-transform: uppercase; letter-spacing: 1px; }
        .guru-prose h3 { color: #fff; font-size: 1.6rem; font-weight: 900; margin-top: 2em; margin-bottom: 1em; }
        .guru-prose p { margin-bottom: 1.5em; }
        .guru-prose a { color: #f97316; text-decoration: none; font-weight: bold; border-bottom: 2px dashed rgba(249, 115, 22, 0.5); transition: 0.3s; padding-bottom: 2px; }
        .guru-prose a:hover { color: #ea580c; border-bottom-style: solid; border-bottom-color: #ea580c; }
        .guru-prose img { width: 100%; border-radius: 20px; margin: 2.5em 0; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .guru-prose ul, .guru-prose ol { padding-left: 1.5em; margin-bottom: 1.5em; }
        .guru-prose li { margin-bottom: 0.8em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        .guru-prose blockquote { border-left: 5px solid #66fcf1; padding: 25px 30px; font-style: italic; color: #e5e7eb; background: rgba(102, 252, 241, 0.05); border-radius: 0 16px 16px 0; margin: 2.5em 0; font-size: 1.25rem; }
        
        /* Responzivita */
        @media (max-width: 768px) {
          .guru-prose { font-size: 1.05rem; }
          .guru-prose h2 { font-size: 1.8rem; }
          .guru-affiliate-cta { font-size: 15px; padding: 18px 30px; width: 100%; }
        }
      `}} />
    </div>
  );
}
