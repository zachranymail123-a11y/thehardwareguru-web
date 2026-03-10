/**
 * GURU MASTER PROXY: Anglické Tweaky
 * GURU FIX: Přímý re-export řeší chybu "Unsupported Server Component type".
 * Tento pattern zajišťuje maximální stabilitu Next.js kompilátoru během produkčního buildu.
 */
export { default } from '../../tweaky/page';
