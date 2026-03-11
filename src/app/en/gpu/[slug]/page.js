import Page, { generateMetadata as baseMetadata } from '../../../gpu/[gpu]/page';

/**
 * GURU EN PROXY - GPU DETAIL
 * Cesta: src/app/en/gpu/[slug]/page.js
 * 🛡️ FIX 1: Zcela odstraněno spreadování (...props), protože to způsobuje 
 * synchronní čtení vlastností objektu params a shazuje Next.js 15.
 * 🛡️ FIX 2: Opravena cesta k souboru na [gpu] místo [slug], aby prošel Vercel build.
 */

export default async function ProxyPage({ params }) {
  // Posíláme pouze explicitní params, žádný spread objekt
  return <Page params={params} isEn={true} />;
}

export async function generateMetadata({ params }) {
  // Stejně tak pro metadata
  return baseMetadata({ params, isEn: true });
}
