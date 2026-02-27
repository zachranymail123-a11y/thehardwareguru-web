'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const track = async () => {
      await supabase.from('page_views').insert({ page_path: pathname });
    };
    track();
  }, [pathname]);

  return null;
}
