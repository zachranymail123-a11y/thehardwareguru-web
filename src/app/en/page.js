import Page from '../page';

export default async function ProxyPage(props) {
    // Tady posíláme isEn={true}, aby layout i komponenty věděly, že mají mluvit anglicky
    return <Page {...props} isEn={true} />;
}

export async function generateMetadata(props) {
    // Tady by se dalo přidat volání metadat, pokud je chceš mít v EN jiné, 
    // ale pro funkčnost přepínače stačí tohle.
    return {
        title: 'Hardware Guru | PC Benchmarks & Tools',
        description: 'Ultimate hardware comparisons and bottleneck calculator.'
    };
}
