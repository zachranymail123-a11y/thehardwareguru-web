/**
 * GURU MASTER PROXY: Detail Očekávané Hry (Slug) (EN)
 * GURU FIX: Použití absolutního aliasu (@/app) řeší chybu "Module not found" na Vercelu.
 * Tento soubor aktivuje cestu /en/ocekavane-hry/[slug], zatímco veškerou logiku 
 * a elitní design obstarává hlavní soubor v src/app/ocekavane-hry/[slug]/page.js.
 */
export { default } from '@/app/ocekavane-hry/[slug]/page';
