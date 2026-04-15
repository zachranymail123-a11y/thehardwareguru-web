import GuruBenchmarkHub from '../../../components/GuruBenchmarkHub';

export const metadata = {
    title: 'GURU Benchmark Hub | Test CPU and GPU | The Hardware Guru',
    description: 'Comprehensive online tool for CPU and GPU stress testing. Find out your PC performance and get smart upgrade recommendations.',
    alternates: {
        canonical: 'https://thehardwareguru.cz/en/benchmark',
        languages: { 'cs': 'https://thehardwareguru.cz/benchmark' }
    }
};

export default function BenchmarkPageEN() {
    const translations = {
        title: 'Ultimate PC Performance Test',
        description: 'One tool to reveal the true power of your PC. Test raw CPU single-core strength and GPU shader compute performance directly in your browser.',
        startCpu: 'Start CPU Test',
        startGpu: 'Start GPU Test',
        testingCpu: 'TESTING PROCESSOR...',
        testingGpu: 'TESTING GRAPHICS...',
        noWebgl: 'Your browser does not support WebGL. Try Chrome.',
        yourScore: 'Your Score',
        time: 'Time',
        testAgain: 'Test Again',
        upgradeTitle: 'GURU Upgrade Analysis',
        upgradeDesc: 'Based on your test results, we found the best upgrade paths for your system. Do not let outdated hardware slow you down.',
        needCpu: '👉 Your processor is struggling. Check out modern gaming CPUs:',
        needGpu: '👉 Your graphics card is falling behind. Find deals on new GPUs:',
        leaderboard: 'TOP 5 Hall of Fame',
        exploreMore: 'Explore the GURU Ecosystem',
        linkBottleneck: 'Bottleneck Calculator',
        linkFps: 'FPS Calculator',
        linkCpuDuels: 'CPU Duels',
        linkGpuDuels: 'GPU Duels',
        linkArticles: 'Articles & Guides'
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "The Hardware Guru - Benchmark Hub",
        "url": "https://thehardwareguru.cz/en/benchmark",
        "description": "Tool for measuring compute power of your graphics card and processor.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "author": { "@type": "Organization", "name": "The Hardware Guru", "url": "https://thehardwareguru.cz" }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <GuruBenchmarkHub t={translations} locale="en" />
        </>
    );
}
