'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Definujeme klíče uvnitř useEffect - spustí se jen v prohlížeči
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Pokud klíče chybí (např. při buildu), tiše skript ukončíme
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const track = async () => {
      try {
        await supabase.from('page_views').insert({ 
          page_path: pathname 
        });
      } catch (error) {
        // Chybu jen zalogujeme, aby nezhodila celý web
        console.error('Tracking failed:', error);
      }
    };

    track();
  }, [pathname]);

  return null;
}
