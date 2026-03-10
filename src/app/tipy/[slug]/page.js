/**
 * GURU MASTER PROXY: Detail Tipu (Slug)
 * GURU FIX: Přímý re-export řeší chybu "Unsupported Server Component type" při produkčním buildu.
 * Tento soubor zajišťuje existenci cesty /en/tipy/[slug] a plnou funkčnost detailu.
 */
export { default } from '../../../tipy/[slug]/page';
