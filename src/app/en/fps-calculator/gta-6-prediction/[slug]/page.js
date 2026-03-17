import Gta6PredictionPage from '../../../../fps-kalkulacka/gta-6-predikce/[slug]/page';

/**
 * EN PROXY - GTA 6 PREDICTION (FIXED PATH)
 * 🛡️ FIX: Opravena relativní cesta importu pro hlubokou strukturu složek.
 */

export const dynamic = 'force-dynamic';

export default async function Gta6PredictionEnProxy(props) {
  // Předáme props do hlavní komponenty a přidáme příznak pro EN verzi
  return await Gta6PredictionPage({ 
    ...props, 
    isEn: true 
  });
}
