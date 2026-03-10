/**
 * GURU MASTER PROXY: Detail Očakávanej Hry (Slug) (EN)
 * GURU FIX: Relatívna cesta rieši chybu "Module not found" pri produkčnom builde.
 * Cesta smeruje z /app/en/ocekavane-hry/[slug] o tri úrovne vyššie 
 * do hlavného enginu v /app/ocekavane-hry/[slug]/page.
 */
export { default } from '../../../ocekavane-hry/[slug]/page';
