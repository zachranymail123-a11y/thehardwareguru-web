'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 🚩 DIAGNOSTIKA: Kontrola klíčů
    if (!supabaseUrl || !supabaseKey) {
      console.warn('📊 Tracker: Chybí NEXT_PUBLIC klíče. Udělej Redeploy ve Vercelu.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- 1. SLEDOVÁNÍ NÁVŠTĚVY STRÁNKY ---
    const trackVisit = async () => {
      console.log(`📊 Tracker: Zápis návštěvy: ${pathname}`);
      const { error } = await supabase.from('page_views').insert({ page_path: pathname });
      if (error) console.error('📊 Tracker CHYBA:', error.message);
      else console.log('📊 Tracker: Stránka uložena ✅');
    };

    trackVisit();

    // --- 2. SLEDOVÁNÍ EXTERNÍCH KLIKŮ (Kick / YouTube) ---
    const handleExternalClick = async (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const url = link.href;
      let label = '';

      if (url.includes('kick.com')) {
        label = 'ODCHOD: Kick';
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        label = 'ODCHOD: YouTube';
      }

      if (label) {
        console.log(`📊 Tracker: Zápis prokliku na: ${label}`);
        const { error } = await supabase.from('page_views').insert({ page_path: label });
        if (error) console.error('📊 Tracker CHYBA (Click):', error.message);
        else console.log(`📊 Tracker: ${label} uložen ✅`);
      }
    };

    // Aktivace odposlechu kliknutí na celém webu
    window.addEventListener('click', handleExternalClick);

    // Úklid při opuštění komponenty
    return () => window.removeEventListener('click', handleExternalClick);
  }, [pathname]);

  return null;
}
