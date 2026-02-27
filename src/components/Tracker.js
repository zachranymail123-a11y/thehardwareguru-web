'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- 1. SLEDOVÁNÍ NÁVŠTĚVY STRÁNKY ---
    const trackVisit = async () => {
      await supabase.from('page_views').insert({ page_path: pathname });
    };
    trackVisit();

    // --- 2. SLEDOVÁNÍ EXTERNÍCH KLIKŮ (KICK, YT, DISCORD) ---
    const handleExternalClick = (e) => {
      // Hledáme odkaz, i když uživatel klikne na ikonu uvnitř odkazu
      const link = e.target.closest('a');
      if (!link) return;

      const url = link.href.toLowerCase();
      let label = '';

      if (url.includes('kick.com')) label = 'ODCHOD: Kick';
      else if (url.includes('youtube.com') || url.includes('youtu.be')) label = 'ODCHOD: YouTube';
      else if (url.includes('discord.com') || url.includes('discord.gg')) label = 'ODCHOD: Discord';

      if (label) {
        // Tady nepoužíváme "await", aby se skript nezdržoval a hned střílel data
        supabase.from('page_views').insert({ page_path: label }).then(() => {
          console.log(`📊 Tracker: Proklik na ${label} zapsán.`);
        });
      }
    };

    // "mousedown" je mnohem rychlejší než "click" – získáme drahocenné milisekundy
    window.addEventListener('mousedown', handleExternalClick);

    return () => window.removeEventListener('mousedown', handleExternalClick);
  }, [pathname]);

  return null;
}
