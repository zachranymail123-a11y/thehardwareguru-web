import React from 'react';
import { createClient } from '@supabase/supabase-js';

// Force dynamic zaručí, že uvidíš aktuální kliky při každém refreshi stránky
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RealtimeStatsPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: logs, error } = await supabase
        .from('affiliate_clicks_log')
        .select('platform, category');

    if (error) {
        return <div style={{ color: 'red', padding: '50px', textAlign: 'center' }}>Chyba při načítání dat: {error.message}</div>;
    }

    // Spočítání kliků (přidáno sticky pro Mobile Button a popup pro Exit Popup)
    const stats = {
        amazon: { total: 0, cpu: 0, gpu: 0, mb: 0, ram: 0, sticky: 0, popup: 0 },
        heureka: { total: 0, cpu: 0, gpu: 0, mb: 0, ram: 0, sticky: 0, popup: 0 }
    };

    logs?.forEach(log => {
        if (stats[log.platform]) {
            stats[log.platform].total += 1;
            
            // Sjednotíme názvy kategorií, pokud by se lehce lišily (např. mobile_sticky -> sticky)
            let cat = log.category;
            if (cat) {
                if (cat.includes('sticky') || cat === 'mobile_button') cat = 'sticky';
                if (cat.includes('popup') || cat === 'exit_intent') cat = 'popup';
            }

            if (stats[log.platform][cat] !== undefined) {
                stats[log.platform][cat] += 1;
            }
        }
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', padding: '50px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ color: '#eab308', fontSize: '30px', fontWeight: '900', marginBottom: '30px', textAlign: 'center' }}>
                    📈 GURU REAL-TIME AFFILIATE RADAR
                </h1>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    
                    {/* AMAZON BOX */}
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '20px', padding: '30px' }}>
                        <h2 style={{ color: '#f59e0b', margin: '0 0 20px 0', fontSize: '24px', display: 'flex', justifyContent: 'space-between' }}>
                            🇺🇸 AMAZON <span>{stats.amazon.total} kliků</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CPU:</span> <b>{stats.amazon.cpu}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GPU:</span> <b>{stats.amazon.gpu}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Desky:</span> <b>{stats.amazon.mb}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RAM:</span> <b>{stats.amazon.ram}</b></div>
                            
                            <div style={{ borderTop: '1px solid rgba(245, 158, 11, 0.3)', margin: '5px 0' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fcd34d' }}><span>Mobile Sticky:</span> <b>{stats.amazon.sticky}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fcd34d' }}><span>Exit Popup:</span> <b>{stats.amazon.popup}</b></div>
                        </div>
                    </div>

                    {/* HEUREKA BOX */}
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '20px', padding: '30px' }}>
                        <h2 style={{ color: '#3b82f6', margin: '0 0 20px 0', fontSize: '24px', display: 'flex', justifyContent: 'space-between' }}>
                            🇨🇿 HEUREKA <span>{stats.heureka.total} kliků</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CPU:</span> <b>{stats.heureka.cpu}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GPU:</span> <b>{stats.heureka.gpu}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Desky:</span> <b>{stats.heureka.mb}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RAM:</span> <b>{stats.heureka.ram}</b></div>
                            
                            <div style={{ borderTop: '1px solid rgba(59, 130, 246, 0.3)', margin: '5px 0' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}><span>Mobile Sticky:</span> <b>{stats.heureka.sticky}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}><span>Exit Popup:</span> <b>{stats.heureka.popup}</b></div>
                        </div>
                    </div>

                </div>

                <p style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280' }}>
                    Pro načtení nejnovějších kliků stačí refreshnout (F5) tuto stránku.
                </p>
            </div>
        </div>
    );
}
