import CpuOverclockingPage, { generateMetadata as originalGenerateMetadata } from '../../../../overclocking/cpu/[slug]/page';

// 1. Zabalíme a přesměrujeme metadata (přidáme 'en-' do slugu, aby to hlavní stránka poznala)
export async function generateMetadata({ params }) {
    const p = await params;
    return originalGenerateMetadata({ 
        params: Promise.resolve({ ...p, slug: `en-${p.slug}` }) 
    });
}

// 2. Vykreslíme hlavní českou komponentu, ale podvrhneme jí 'en-' slug pro aktivaci EN mutace
export default async function EnCpuOverclockingPage({ params }) {
    const p = await params;
    return <CpuOverclockingPage params={Promise.resolve({ ...p, slug: `en-${p.slug}` })} />;
}
