import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, ChevronLeft, ShieldCheck, Zap, Flame, Heart, 
  Cpu, Monitor, Smartphone, ArrowRight, Star, Layers, Swords, BookOpen
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU BUILD DETAIL V2.2 (COMMISSION HIDDEN)
 * 🚀 CÍL: Maximální konverze bez prozrazení výše provize.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function BuildDetail(props) {
  const { slug } = await props.params;
  const { data: build, error } = await supabase
    .from('posts')
    .select('*')
    .or(`slug.eq."${slug}",slug_en.eq."${slug}"`)
    .single();
  
  if (error || !build) notFound();

  const isEn = build.slug_en === slug;
  const title = isEn ? (build.title_en || build.title) : build.title;
  const content = isEn ? (build.content_en || build.content) : build.content;

  const SHOPCOM_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=3ea952dd";
  const CUBENEST_LINK = "https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=231eaccc";

  return (
    <div className="guru-build-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <Link href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </Link>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <SeznamAd zoneId={408654} width={970} height={210} />
        </div>

        <article className="main-card">
          <header style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="category-badge"><Zap size={14} /> GURU RECOMMENDED BUILD</div>
            <h1 className="build-title">{title}</h1>
          </header>

          <div className="content-area" dangerouslySetInnerHTML={{ __html: content }} />

          <div className="ehub-section">
            <h2 className="section-title">{isEn ? 'WHERE TO BUY?' : 'KDE NAKOUPIT?'}</h2>
            <div className="partner-grid">
              <div className="partner-card shopcom">
                <div className="partner-info">
                  <span className="p-brand">SHOPCOM.CZ</span>
                  <span className="p-tag">{isEn ? 'GURU CHOICE' : 'GURU VOLBA'}</span>
                </div>
                <h3>{isEn ? 'Hardware' : 'Hardware'}</h3>
                <p>{isEn ? 'Best prices for components.' : 'Nejlepší ceny komponentů.'}</p>
                <a href={SHOPCOM_LINK} target="_blank" rel="nofollow sponsored" className="p-btn">
                  <ShoppingCart size={18} /> {isEn ? 'BUY' : 'NAKOUPIT'}
                </a>
              </div>
              <div className="partner-card cubenest">
                <div className="partner-info">
                  <span className="p-brand">CUBENEST</span>
                  <span className="p-tag">{isEn ? 'VERIFIED' : 'PROVĚŘENO'}</span>
                </div>
                <h3>{isEn ? 'Setup' : 'Setup'}</h3>
                <p>{isEn ? 'Elite desk accessories.' : 'Elitní doplňky na stůl.'}</p>
                <a href={CUBENEST_LINK} target="_blank" rel="nofollow sponsored" className="p-btn">
                  <ShoppingCart size={18} /> {isEn ? 'EQUIP' : 'VYBAVIT'}
                </a>
              </div>
            </div>
          </div>
        </article>

        <section className="seo-hub">
          <div className="hub-grid">
            <Link href={isEn ? "/en/cpuvs/ranking" : "/cpuvs/ranking"} className="hub-item">Žebříček CPU</Link>
            <Link href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="hub-item">Žebříček GPU</Link>
            <Link href={isEn ? "/en/slovnik" : "/slovnik"} className="hub-item">Slovník</Link>
          </div>
        </section>
      </main>

      <div className="sticky-bottom-anchor">
          <SeznamAd zoneId={408651} width={300} height={100} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; }
        .main-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; padding: 40px; backdrop-filter: blur(20px); }
        .build-title { font-size: 3rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; }
        .partner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
        .partner-card { padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 15px; }
        .shopcom { background: rgba(168, 85, 247, 0.05); border-left: 4px solid #a855f7; }
        .cubenest { background: rgba(102, 252, 241, 0.05); border-left: 4px solid #66fcf1; }
        .p-tag { font-size: 9px; background: #10b981; color: #000; padding: 2px 8px; border-radius: 4px; font-weight: 900; text-transform: uppercase; }
        .p-btn { background: #fff; color: #000; padding: 15px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: 950; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; display: flex; justify-content: center; padding: 10px; background: #0a0b0d; z-index: 9999; }
        @media (max-width: 768px) { .partner-grid { grid-template-columns: 1fr; } }
      `}} />
    </div>
  );
}
