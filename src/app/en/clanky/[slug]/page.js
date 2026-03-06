/**
 * GURU MASTER PROXY: Detail Článku (Slug)
 * GURU FIX: Přímý re-export řeší chybu "Unsupported Server Component type" při produkčním buildu.
 * Tento soubor zajišťuje existenci cesty /en/clanky/[slug] a plnou funkčnost detailu.
 */
export { default } from '../../../clanky/[slug]/page';
