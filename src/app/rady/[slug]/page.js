/**
 * GURU MASTER PROXY: Detail Rady (Slug)
 * GURU FIX: Přímý re-export řeší chybu "Unsupported Server Component type" při produkčním buildu.
 * Tento soubor zajišťuje existenci cesty /en/rady/[slug] a plnou funkčnost detailu.
 */
export { default } from '../../../rady/[slug]/page';
