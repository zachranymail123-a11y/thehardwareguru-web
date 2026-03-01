'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export default function SocialTracker() {
  useEffect(() => {
    // Kontrola inicializace
    if (!supabase) {
      console.error("TRACKER: Supabase není připojen. Zkontroluj proměnné ve Vercelu.");
      return;
    }

    // 1. ZÁPIS NÁVŠTĚVY STRÁNKY
    const recordPageView = async () => {
      const path = window.location.pathname;
      const { error } = await supabase.from('page_views').insert([{ path }]);
      
      if (error) {
        console.error("TRACKER ERROR (návštěva):", error.message);
      } else {
        console.log("TRACKER OK: Návštěva zapsána:", path);
      }
    };

    recordPageView();

    // 2. SLEDOVÁNÍ KLIKŮ
    const handleGlobalClick = async (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const url = link.href.toLowerCase();
      let platform = null;

      if (url.includes('kick.com')) platform = 'kick';
      if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
      if (url.includes('discord.gg') || url.includes('discord.com')) platform = 'discord';

      if (platform) {
        const { error } = await supabase.from('click_stats').insert([{ platform }]);
        if (error) {
          console.error(`TRACKER ERROR (proklik ${platform}):`, error.message);
        } else {
          console.log(`TRACKER OK: Proklik na ${platform} uložen.`);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return null; 
}
