/**
 * GURU MASTER PROXY: Detail Očekávané Hry (Slug) (EN)
 * GURU FIX: Přímý re-export řeší chybu "Unsupported Server Component type" na Vercelu pro anglickou mutaci detailu.
 * * Tento soubor aktivuje cestu /en/ocekavane-hry/[slug], zatímco veškerou logiku, 
 * databázové dotazy a elitní design obstarává hlavní soubor v src/app/ocekavane-hry/[slug]/page.js.
 */
export { default } from '../../../ocekavane-hry/[slug]/page';
