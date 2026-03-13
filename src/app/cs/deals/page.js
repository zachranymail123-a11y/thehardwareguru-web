import Page, { generateMetadata as baseMetadata } from '../../deals/page';

/**
 * GURU CS PROXY - OCHRANA PROTI 404 PRE /cs/deals
 * Cesta: src/app/cs/deals/page.js
 * 🛡️ FIX: Absolútne bezpečný proxy súbor. Nezasahuje do bežiaceho kódu, 
 * iba presmeruje návštevníka na správnu českú verziu zliav.
 * 🛡️ NEXT.JS 15 SAFE: Nepoužíva spreadovanie parametrov.
 */

export default async function ProxyPage({ params }) { 
  // Načíta tvoju hlavnú stránku zo src/app/deals/page.js
  return <Page params={params} isEn={false} />; 
}

export async function generateMetadata({ params }) { 
  if (baseMetadata) {
    return baseMetadata({ params, isEn: false }); 
  }
  return {
    title: 'Nejlepší herní slevy a akce | The Hardware Guru'
  };
}
