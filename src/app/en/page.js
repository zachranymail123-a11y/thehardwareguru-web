import Page, { generateMetadata as baseMetadata } from '../page';

export default async function ProxyPage(props) {
    // Přesně podle tvého funkčního vzoru z bottlenecku
    return <Page {...props} isEn={true} />;
}

export async function generateMetadata(props) {
    // Voláme základní metadata s isEn: true, aby se i meta tagy přeložily
    return baseMetadata({ ...props, isEn: true });
}
