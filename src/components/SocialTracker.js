'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// DOPLŇ SVÉ SUPABASE ÚDAJE
const supabase = createClient('TVOJE_SUPABASE_URL', 'TVŮJ_ANON_KEY');

export default function SocialTracker() {
  useEffect(() => {
    const handleGlobalClick = async (e) => {
      // Najdeme nejbližší odkaz (a tag) na který uživatel klikl
      const link = e.target.closest('a');
      if (!link) return;

      const url = link.href.toLowerCase();
      let platform = null;

      // Rozlišení platformy podle URL
      if (url.includes('kick.com')) platform = 'kick';
      if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
      if (url.includes('discord.gg') || url.includes('discord.com')) platform = 'discord';

      if (platform) {
        try {
          await supabase.from('click_stats').insert([{ platform }]);
          console.log(`Klik na ${platform} uložen.`);
        } catch (error) {
          console.error('Chyba při ukládání prokliku:', error);
        }
      }
    };

    // Přidáme listener na celý dokument
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return null; // Komponenta je neviditelná, jen hlídá kliky
}
