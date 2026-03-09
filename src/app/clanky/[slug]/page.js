import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Calendar, ShieldCheck, Flame, Heart } from 'lucide-react';
import { autoLinkGpu } from '../../../lib/guruAutoLinks';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  const { data: post } = await supabase
    .from('posts')
    .select('title, title_en, seo_description, seo_description_en, image_url, slug, slug_en')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (!post) return { title: '404 | The Hardware Guru' };

  const isEn = post.slug_en === slug && slug !== post.slug;
  const title = isEn && post.title_en ? post.title_en : post.title;
  const desc = isEn && post.seo_description_en ? post.seo_description_en : post.seo_description;

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: post.image_url ? [post.image_url] : [],
    }
  };
}

export default async function ArticleDetail({ params }) {

  const { slug } = params;

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .single();

  if (error || !post) {
    notFound();
  }

  const isEn = post.slug_en === slug && slug !== post.slug;
  const title = isEn && post.title_en ? post.title_en : post.title;

  const rawContent = isEn && post.content_en ? post.content_en : post.content;

  // funkční doplnění (bez změny designu)
  const content = await autoLinkGpu(rawContent);

  const priceDisplay = isEn ? (post.price_en || '') : (post.price_cs || '');
  const buyBtnText = isEn 
    ? `BUY FOR BEST PRICE ${priceDisplay ? `(${priceDisplay})` : ''}` 
    : `KOUPIT ZA NEJLEPŠÍ CENU ${priceDisplay ? `(${priceDisplay})` : ''}`;

  const backLink = isEn ? '/en/clanky' : '/clanky';

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
        
        {post.image_url && (
          <div style={{ width: '100%', height: '450px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={post.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 17, 21, 1) 0%, transparent 100%)' }}></div>
            
            <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
              <Link href={backLink} className="guru-back-btn">
                <ChevronLeft size={16} /> {isEn ? 'BACK TO ARTICLES' : 'ZPĚT NA ČLÁNKY'}
              </Link>
            </div>

            {post.affiliate_link && (
              <div style={{ position: 'absolute', top: '30px', right: '30px', background: '#f97316', color: '#fff', padding: '8px 16px', borderRadius: '12px', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} fill="currentColor" /> {isEn ? 'HOT DEAL INSIDE' : 'OBSAHUJE SLEVU'}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '40px 50px 60px 50px' }}>
          
          <header style={{ marginBottom: '50px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#66fcf1' }}>
                <ShieldCheck size={16} /> GURU ENGINE
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> {new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0', textShadow: '0 0 20px rgba(102, 252, 241, 0.2)' }}>
              {title}
            </h1>
          </header>

          <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />

        </div>
      </main>
    </div>
  );
}
