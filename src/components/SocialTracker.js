'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- BEZPEČNÁ INICIALIZACE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Klienta vytvoříme JEN pokud máme validní URL začínající http. 
// Tím zabráníme chybě "Invalid supabaseUrl" během buildu na Vercelu.
const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export default function SocialTracker() {
  useEffect(() => {
    // Pokud supabase klient neexistuje (špatná URL nebo build), nic neděláme
    if (!supabase) return;

    const handleGlobalClick = async (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const url = link.href.toLowerCase();
      let platform = null;

      if (url.includes('kick.com')) platform = 'kick';
      if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
      if (url.includes('discord.gg') || url.includes('discord.com')) platform = 'discord';

      if (platform) {
        try {
          // Zapíšeme proklik do tabulky, kterou jsi vytvořil v SQL Editoru
          await supabase.from('click_stats').insert([{ platform }]);
          console.log(`Klik na ${platform} uložen.`);
        } catch (error) {
          console.error('Chyba při ukládání prokliku:', error);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return null;
}
