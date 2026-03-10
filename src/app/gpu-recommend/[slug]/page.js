/**
 * GURU MASTER PROXY: GPU Recommendation Pages
 * Tento soubor zajišťuje existenci cesty /en/gpu-recommend/[slug]
 * GURU FIX: Přímý re-export řeší chybu "Unsupported Server Component type" a sjednocuje logiku.
 */
export { default, generateMetadata } from '../../../gpu-recommend/[slug]/page';
