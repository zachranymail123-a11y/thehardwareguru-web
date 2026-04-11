import FpsKalkulackaPage, { generateMetadata as originalMetadata } from '../../fps-kalkulacka/page';

/**
 * GURU FPS ENGINE - EN PROXY (FIXED)
 * Explicitně balí originální stránku a natvrdo jí předává informaci, že je v EN.
 */

export async function generateMetadata(props) {
    const p = await props.params;
    return originalMetadata({ ...props, params: { ...p, lang: 'en' } });
}

export default async function EnFpsCalculatorProxy(props) {
    const p = await props.params;
    // Předáváme params i speciální prop přímo do hlavní komponenty
    return <FpsKalkulackaPage {...props} params={{ ...p, lang: 'en' }} isEnProxy={true} />;
}
