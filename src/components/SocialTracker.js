'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- BEZPEČNÁ INICIALIZACE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Klienta vytvoříme JEN pokud máme validní URL začínající http.
const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export default function SocialTracker() {
  useEffect(() => {
    if (!supabase) return;

    // --- 1. ZÁPIS NÁVŠTĚVY STRÁNKY ---
    // Tento kód se spustí hned při načtení jakékoli stránky
    const recordPageView = async () => {
      try {
        await supabase.from('page_views').insert([{ 
          path: window.location.pathname 
        }]);
      } catch (err) {
        console.error('Chyba při zápisu návštěvy:', err);
      }
    };

    recordPageView();

    // --- 2. SLEDOVÁNÍ KLIKŮ NA SOCIÁLNÍ SÍTĚ ---
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
