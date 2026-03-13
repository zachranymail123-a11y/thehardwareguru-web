import Page, { generateMetadata as baseMetadata } from '../../support/page';

/**
 * GURU EN PROXY - SUPPORT PAGE
 * Cesta: src/app/en/support/page.js
 * 🛡️ FIX: Doplněna chybějící proxy routa pro anglickou verzi podpory.
 * 🛡️ NEXT.JS 15 SAFE: Nepoužívá spreadování parametrů.
 */

export default async function ProxyPage() { 
  // Předáváme isEn={true} do hlavní komponenty
  return <Page isEn={true} />; 
}

// Pokud máš v support/page.js funkci generateMetadata, tato proxy ji správně přepošle
export async function generateMetadata(props) { 
  if (baseMetadata) {
    return baseMetadata({ ...props, isEn: true }); 
  }
  // Fallback, pokud by v původním souboru metadata chyběla
  return {
    title: 'Support | The Hardware Guru',
    description: 'Support our work and help us build the ultimate hardware database.'
  };
}
