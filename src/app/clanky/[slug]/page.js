import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClanekPage(props) {
  // 1. Ošetření parametrů (aby to nepadalo na nové verzi Next.js)
  const params = await props.params;
  const { slug } = params;

  // 2. Oprava adresy (vyhodí .html, sjednotí pomlčky)
  let cleanSlug = slug.replace('.html', '').trim();
  cleanSlug = cleanSlug.replace(/-+/g, '-'); 
  cleanSlug = cleanSlug.replace(/^-|-$/g, '');

  // 3. Odkazy na sociální sítě (Tohle tam vložíme)
  const socialLinks = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '20px 0 30px 0' }}>
      <a href="https://kick.com/thehardwareguru" target="_blank" 
         style={{ flex: '1', textAlign: 'center', background: '#05ff5b', color: '#000', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
         🟢 KICK
      </a>
      <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" 
         style={{ flex: '1', textAlign: 'center', background: '#ff0000', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
         🔴 YOUTUBE
      </a>
      <a href="https://discord.com/invite/n7xThr8" target="_blank" 
         style={{ flex: '1', textAlign: 'center', background: '#5865F2', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
         🔵 DISCORD
      </a>
      <a href="https://www.instagram.com/thehardwareguru_czech/" target="_blank" 
         style={{ flex: '1', textAlign: 'center', background: '#E1306C', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
         📸 INSTAGRAM
      </a>
    </div>
  );

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 4. Hledání článku
    let { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', cleanSlug)
      .single();
