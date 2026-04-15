import GuruBenchmarkHub from '../../components/GuruBenchmarkHub';

export const metadata = {
    title: 'GURU Benchmark Hub | Otestuj CPU a GPU | The Hardware Guru',
    description: 'Komplexní online nástroj pro zátěžový test procesoru i grafické karty. Zjisti svůj výkon a získej inteligentní návrhy na upgrade.',
    alternates: {
        canonical: 'https://thehardwareguru.cz/benchmark',
        languages: { 'en': 'https://thehardwareguru.cz/en/benchmark' }
    }
};

export default function BenchmarkPageCZ() {
    const translations = {
        title: 'Komplexní Test Výkonu PC',
        description: 'Jeden nástroj, který odhalí sílu tvého PC. Otestuj hrubou výpočetní sílu procesoru (Single-Core) a shaderový výkon grafické karty (WebGL) přímo v prohlížeči.',
        startCpu: 'Spustit CPU Test',
        startGpu: 'Spustit GPU Test',
        testingCpu: 'TESTUJI PROCESOR...',
        testingGpu: 'TESTUJI GRAFIKU...',
        noWebgl: 'Tvůj prohlížeč nepodporuje WebGL. Zkus Chrome.',
        yourScore: 'Tvoje Skóre',
        time: 'Čas',
        testAgain: 'Testovat znovu',
        upgradeTitle: 'GURU Analýza Upgradu',
        upgradeDesc: 'Na základě tvých výsledků jsme vybrali ty nejlepší možnosti pro tvůj další upgrade. Nenech se brzdit slabým hardwarem.',
        needCpu: '👉 Tvůj procesor dostává zabrat. Podívej se na moderní herní CPU:',
        needGpu: '👉 Tvá grafika ztrácí dech. Zkontroluj aktuální slevy na nové GPU:',
        leaderboard: 'TOP 5 Výsledků',
        exploreMore: 'Prozkoumej celý GURU Ekosystém',
        linkBottleneck: 'Bottleneck Kalkulačka',
        linkFps: 'FPS Kalkulačka',
        linkCpuDuels: 'CPU Duely',
        linkGpuDuels: 'GPU Duely',
        linkArticles: 'Články a Rady'
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "The Hardware Guru - Benchmark Hub",
        "url": "https://thehardwareguru.cz/benchmark",
        "description": "Nástroj pro měření výpočetního výkonu grafické karty a procesoru.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CZK" },
        "author": { "@type": "Organization", "name": "The Hardware Guru", "url": "https://thehardwareguru.cz" }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <GuruBenchmarkHub t={translations} locale="cs" />
        </>
    );
}
