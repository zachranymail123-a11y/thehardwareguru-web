/**
 * GURU MASTER PROXY: Detail Tweaku (Slug)
 * GURU FIX: Přímý re-export řeší chybu "Unsupported Server Component type" při produkčním buildu.
 * Tento soubor zajišťuje existenci cesty /en/tweaky/[slug] a plnou funkčnost detailu.
 */
export { default } from '../../../tweaky/[slug]/page';
