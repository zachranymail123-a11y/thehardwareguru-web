'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation'; // DŮLEŽITÉ: Sleduje změny URL
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export default function SocialTracker() {
  const pathname = usePathname(); // Získáme aktuální cestu (např. /moje-pc)

  // 1. SLEDOVÁNÍ NÁVŠTĚV STRÁNEK (Spustí se při každé změně URL)
  useEffect(() => {
    if (!supabase) return;

    const recordPageView = async () => {
      try {
        const { error } = await supabase.from('page_views').insert([{ 
          path: pathname // Zapíše cestu, kde zrovna jsi
        }]);
        
        if (error) {
          console.error("TRACKER ERROR (návštěva):", error.message);
        } else {
          console.log("TRACKER OK: Návštěva zapsána:", pathname);
        }
      } catch (err) {
        console.error('Chyba zápisu návštěvy:', err);
      }
    };

    recordPageView();
  }, [pathname]); // PŘIDÁNO: useEffect reaguje na každou změnu adresy

  // 2. SLEDOVÁNÍ KLIKŮ (Stačí nastavit jednou při mountu)
  useEffect(() => {
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
          const { error } = await supabase.from('click_stats').insert([{ platform }]);
          if (error) {
            console.error(`TRACKER ERROR (proklik ${platform}):`, error.message);
          } else {
            console.log(`TRACKER OK: Proklik na ${platform} uložen.`);
          }
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
