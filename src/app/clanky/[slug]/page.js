// ... začátek stejný jako předtím
export default async function ClanekPage({ params }) {
  // Odstraníme .html z názvu, pokud tam je
  const slug = params.slug.replace('.html', ''); 
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug) // Teď už to najde správný článek v DB
    .single();
// ... zbytek stejný
