import Page, { generateMetadata as baseMetadata } from '../../../gpu/[slug]/page';

/**
 * GURU EN PROXY - GPU DETAIL
 * Cesta: src/app/en/gpu/[slug]/page.js
 * 🛡️ FIX: Zcela odstraněno spreadování (...props), protože to způsobuje 
 * synchronní čtení vlastností objektu params a shazuje Next.js 15.
 */

export default async function ProxyPage({ params }) {
  // Posíláme pouze explicitní params, žádný spread objekt
  return <Page params={params} isEn={true} />;
}

export async function generateMetadata({ params }) {
  // Stejně tak pro metadata
  return baseMetadata({ params, isEn: true });
}
