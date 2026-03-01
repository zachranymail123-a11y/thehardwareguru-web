'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicializace mimo komponentu (vytvoří se jen jednou za běh aplikace)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default function Tracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    if (!supabase) return;

    // --- 1. SLEDOVÁNÍ NÁVŠTĚVY STRÁNKY ---
    const trackVisit = async () => {
      // Prevence double-trackingu v Strict Mode nebo při rychlém klikání
      if (lastTrackedPath.current === pathname) return;
      lastTrackedPath.current = pathname;

      try {
        await supabase.from('page_views').insert({
          page_path: pathname,
          event_type: 'page_view',
          referrer: document.referrer || 'direct',
          user_agent: navigator.userAgent.substring(0, 255) // Volitelné: info o prohlížeči
        });
      } catch (err) {
        console.error('📊 Tracker Error (Visit):', err);
      }
    };

    trackVisit();

    // --- 2. SLEDOVÁNÍ EXTERNÍCH KLIKŮ ---
    const handleExternalClick = (e) => {
      const link = e.target.closest('a');
      if (!link || !link.href) return;

      const url = link.href.toLowerCase();
      let platform = '';

      if (url.includes('kick.com')) platform = 'Kick';
      else if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'YouTube';
      else if (url.includes('discord.com') || url.includes('discord.gg')) platform = 'Discord';

      if (platform) {
        // Používáme fire-and-forget přístup
        supabase.from('page_views').insert({
          page_path: pathname, // Na jaké stránce byl, když klikl na odchod
          event_type: `exit_${platform.toLowerCase()}`,
          metadata: { target_url: url }
        }).then(() => {
          console.log(`📊 Tracker: Odchod na ${platform} zapsán.`);
        });
      }
    };

    // Nasloucháme mousedown (pro rychlost) i auxclick (pro klik kolečkem myši)
    window.addEventListener('mousedown', handleExternalClick);
    window.addEventListener('auxclick', handleExternalClick);

    return () => {
      window.removeEventListener('mousedown', handleExternalClick);
      window.removeEventListener('auxclick', handleExternalClick);
    };
  }, [pathname]);

  return null;
}
