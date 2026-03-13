import Page, { generateMetadata as baseMetadata } from '../../gpu-index/page';

/**
 * GURU EN PROXY - GPU INDEX
 * Cesta: src/app/en/gpu-index/page.js
 */

export default async function ProxyPage({ params }) { 
  return <Page params={params} isEn={true} />; 
}

export async function generateMetadata({ params }) { 
  return baseMetadata({ params, isEn: true }); 
}
