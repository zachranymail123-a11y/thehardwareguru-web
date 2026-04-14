import React from 'react';
import { ShoppingCart, Flame, Gamepad2, ShieldCheck, Tag, ChevronRight, Zap } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';

export const revalidate = 60; // Obnova cache každou minutu

export const metadata = {
    title: 'GURU Obchod | Hry, klíče a VIP produkty | The Hardware Guru',
    description: 'Oficiální e-shop The Hardware Guru. Kupuj herní klíče, digitální produkty a VIP služby přímo od zdroje za nejlepší ceny.',
    alternates: {
        canonical: 'https://thehardwareguru.cz/obchod',
        languages: { 'cs': 'https://thehardwareguru.cz/obchod', 'en': 'https://thehardwareguru.cz/en/store' }
    }
};

// Tahání produktů přímo z Fungies API
async function fetchFungiesProducts() {
    const publicKey = process.env.NEXT_PUBLIC_FUNGIES_PUBLIC_KEY;
    const secretKey = process.env.FUNGIES_SECRET_KEY;

    if (!publicKey || !secretKey) {
        console.warn("Fungies klíče nenalezeny v .env.local!");
        return [];
    }

    try {
        // Standardní endpoint Fungies pro produkty
        const res = await fetch('https://api.fungies.io/v1/products', {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'x-public-key': publicKey,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 60 }
        });

        if (!res.ok) {
            console.error("Chyba při načítání Fungies API:", res.statusText);
            return [];
        }

        const data = await res.json();
        return data.products || data.items || data || [];
    } catch (error) {
        console.error("Fungies API fetch error:", error);
        return [];
    }
}

export default async function GuruStorePage() {
    const products = await fetchFungiesProducts();

    // Fallback data pro případ, že API ještě není plně nastavené nebo nemáš vytvořené produkty
    const displayProducts = products.length > 0 ? products : [
        {
            id: 'demo-1',
            name: 'GURU VIP Konzultace',
            description: 'Osobní 30minutová konzultace výběru komponent a optimalizace PC přímo s Hardware Guru.',
            price: 499,
            currency: 'CZK',
            imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=1000&auto=format&fit=crop',
            checkoutUrl: '#'
        },
        {
            id: 'demo-2',
            name: 'Cyberpunk 2077 (Steam Key)',
            description: 'Digitální klíč pro PC. Okamžité doručení na e-mail po zaplacení.',
            price: 699,
            currency: 'CZK',
            imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1000&auto=format&fit=crop',
            checkoutUrl: '#'
        }
    ];

    return (
        <div className="guru-store-wrapper" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '120px', paddingBottom: '120px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.05)', marginBottom: '20px' }}>
                        <ShoppingCart size={16} /> GURU OFICIÁLNÍ E-SHOP
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        GURU <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}>OBCHOD</span>
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginTop: '15px', maxWidth: '600px', margin: '15px auto 0' }}>
                        Podpoř chod webu nákupem prémiových herních klíčů, VIP služeb a digitálních produktů přímo od zdroje. Žádní prostředníci, okamžité doručení.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                    {displayProducts.map((product) => (
                        <div key={product.id} className="store-product-card group" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            <div style={{ position: 'relative', height: '200px', width: '100%', background: '#0b0c10', overflow: 'hidden' }}>
                                <img src={product.imageUrl || product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' }} className="group-hover:scale-110" loading="lazy" />
                                <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#ff0055', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: '950', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 5px 15px rgba(255,0,85,0.4)' }}>
                                    <Flame size={12} /> HOT
                                </div>
                            </div>
                            
                            <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h3 style={{ fontSize: '22px', fontWeight: '950', margin: '0 0 10px 0', color: '#fff', lineHeight: '1.2' }}>{product.name}</h3>
                                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                                    {product.description?.substring(0, 120)}{product.description?.length > 120 ? '...' : ''}
                                </p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '950', color: '#a855f7' }}>
                                        {product.price} <span style={{ fontSize: '14px', color: '#6b7280' }}>{product.currency || 'CZK'}</span>
                                    </div>
                                    
                                    {/* Odkaz na Hosted Checkout Fungies */}
                                    <a 
                                        href={product.checkoutUrl || product.url || '#'} 
                                        className="buy-button"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#a855f7', color: '#fff', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', fontSize: '14px', textTransform: 'uppercase', transition: '0.3s' }}
                                    >
                                        <ShoppingCart size={16} /> KOUPIT
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* GURU GARANCE */}
                <section style={{ background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '40px', display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '60px' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
                            <ShieldCheck size={16} /> GURU GARANCE BEZPEČÍ
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#fff', margin: '0 0 15px 0' }}>100% BEZPEČNÝ NÁKUP</h2>
                        <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>Všechny platby jsou šifrovány a bezpečně zpracovány přes platební bránu Stripe. Digitální klíče pocházejí z oficiálních distribucí a jsou doručeny okamžitě na tvůj e-mail.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={32} color="#66fcf1" />
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={32} color="#10b981" />
                        </div>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .store-product-card:hover { transform: translateY(-8px); border-color: rgba(168, 85, 247, 0.4); box-shadow: 0 15px 40px rgba(0,0,0,0.5), 0 0 20px rgba(168, 85, 247, 0.1); }
                .buy-button:hover { transform: scale(1.05); box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4); }
            `}} />
        </div>
    );
}
