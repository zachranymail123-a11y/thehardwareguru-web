import Page, { generateMetadata as baseMetadata } from '../../../../../gpu-performance/[slug]/[game]/[resolution]/page';

/**
 * GURU EN PROXY - GPU PERFORMANCE RESOLUTION
 * Cesta: src/app/en/gpu-performance/[slug]/[game]/[resolution]/page.js
 * 🛡️ FIX: Používá parametr [slug] pro shodu s českou verzí a úspěšný build.
 */

export default async function ProxyPage(props) {
  // Přeposíláme isEn={true} do hlavní komponenty
  return <Page {...props} isEn={true} />;
}

export async function generateMetadata(props) {
  // Generujeme metadata s příznakem angličtiny
  return baseMetadata({ ...props, isEn: true });
}
