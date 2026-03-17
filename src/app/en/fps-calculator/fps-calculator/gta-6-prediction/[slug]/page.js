import Gta6PredictionPage from '../../../fps-kalkulacka/gta-6-predikce/[slug]/page';

/**
 * EN PROXY - GTA 6 PREDICTION
 * Přesměrovává logiku na hlavní komponentu s příznakem pro EN jazyk.
 */

export const dynamic = 'force-dynamic';

export default async function Gta6PredictionEnProxy(props) {
  // Předáme props do hlavní komponenty a přidáme info, že jsme v EN verzi
  return await Gta6PredictionPage({ 
    ...props, 
    isEn: true 
  });
}
