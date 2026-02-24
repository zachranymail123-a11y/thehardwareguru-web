export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// --- KONFIGURACE SUPABASE ---
const supabase = createClient(
  'https://luepzmdwgrbtnevlznbx.supabase.co', 
  'sb_publishable_wa3MgO-wdn8oWrZbJReNPw_CT9Bp2mq' // <--- SEM VLOŽ SVŮJ KLÍČ !!!
);

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  // 1. Počkáme na slug z URL
  const { slug } = await params;

  // 2. Hledáme v databázi podle sloupce 'slug'
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  // 3. Pokud nastala chyba (např. RLS) nebo článek není, hodíme 404
  if (error || !post) {
    console.error("Detail chyby:", error);
    return notFound();
  }

  return (
    <main className="min-h-screen text-white font-sans relative">
      {/* POZADÍ - Dynamický thumbnail z YouTube */}
      <div className="fixed inset-0 -z-50 bg-black"></div>
      <div className="fixed inset-0 -z-40 opacity-40">
         <img 
          src={`https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`} 
          className="w-full h-full object-cover blur-xl scale-110"
          alt="Background"
        />
      </div>
      <div className="fixed inset-0 -z-30 bg-gradient-to-t from-black via-black/80 to-black/20"></div>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400 font-black uppercase mb-10 hover:text-white transition-colors group">
          <span className="group-hover:-translate-x-2 transition-transform">←</span> Zpět na centrálu
        </Link>

        <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-white drop-shadow-2xl border-l-8 border-purple-600 pl-6">
          {post.title}
        </h1>

        <div className="aspect-video w-full mb-12 rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${post.video_id}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-zinc-900/90 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/5 text-zinc-300 font-medium leading-relaxed shadow-2xl">
            {post.content}
          </div>
        </div>
        
        <div className="mt-20 text-center border-t border-white/5 pt-12">
          <a href="https://kick.com/thehardwareguru" target="_blank" className="inline-block bg-[#53FC18] text-black px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-all shadow-lg hover:shadow-[#53FC18]/20 uppercase italic">
            Doraž na Stream! ⚡
          </a>
        </div>
      </div>
    </main>
  );
}