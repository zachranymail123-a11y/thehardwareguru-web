'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 🚩 DIAGNOSTIKA 1: Kontrola klíčů
    if (!supabaseUrl || !supabaseKey) {
      console.warn('📊 Tracker: Chybí NEXT_PUBLIC klíče. Pokud jsi je právě přidal do Vercelu, musíš udělat nový Deploy.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const track = async () => {
      console.log(`📊 Tracker: Zkouším zapsat návštěvu stránky: ${pathname}`);
      
      const { error } = await supabase
        .from('page_views')
        .insert({ page_path: pathname });

      if (error) {
        // 🚩 DIAGNOSTIKA 2: Chyba při zápisu (často RLS v Supabase)
        console.error('📊 Tracker CHYBA:', error.message);
      } else {
        console.log('📊 Tracker: Úspěšně uloženo do databáze! ✅');
      }
    };

    track();
  }, [pathname]);

  return null;
}
