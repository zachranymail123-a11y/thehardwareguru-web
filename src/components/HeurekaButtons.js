import React from 'react';
import { ShoppingCart, Search } from 'lucide-react';

/**
 * GURU MONEY MAKER COMPONENT V5.1 - HEUREKA INTEGRATION
 * ID Pozice: 276035 (Guru_Global_Searchbar)
 */
const HeurekaButtons = ({ isEn = false }) => {
    if (isEn) return null;

    return (
        <div className="heureka-mega-cta" style={{ width: '100%', maxWidth: '600px', margin: '20px auto' }}>
            
            {/* 1. HLAVNÍ NÁKUPNÍ TLAČÍTKO */}
            <div className="heureka-buttons-row" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <a 
                    href="https://www.heureka.cz/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=276035" 
                    target="_blank" 
                    rel="nofollow sponsored"
                    className="guru-heureka-btn main"
                    style={{
                        flex: '1',
                        minWidth: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '18px 25px',
                        background: '#f15a24',
                        color: '#fff',
                        borderRadius: '16px',
                        fontWeight: '950',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        fontSize: '14px',
                        transition: '0.3s',
                        boxShadow: '0 10px 25px rgba(241, 90, 36, 0.3)'
                    }}
                >
                    <ShoppingCart size={20} /> POROVNAT CENY NA HEURECE
                </a>
            </div>

            {/* 2. GURU SEARCHBAR (PROPOJENÝ S ID 276035) */}
            <div className="heureka-search-wrap" style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: '25px', 
                borderRadius: '24px', 
                border: '1px solid rgba(241, 90, 36, 0.2)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '15px', 
                    color: '#f15a24', 
                    fontSize: '11px', 
                    fontWeight: '950', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px' 
                }}>
                    <Search size={14} /> Nenalezli jste svou kartu? Hledejte zde:
                </div>
                
                {/* Affiliate redirect URL s tvým ID */}
                <form 
                    action="https://www.heureka.cz/exit/276035/" 
                    method="GET" 
                    target="_blank"
                    style={{ position: 'relative', display: 'flex', gap: '10px' }}
                >
                    {/* Povinné parametry Heureky pro sledování vyhledávání z boxu */}
                    <input type="hidden" name="z" value="276035" />
                    
                    <input 
                        name="q" 
                        type="text" 
                        placeholder="Např. RTX 5080, Ryzen 7 9800X3D..."
                        autoComplete="off"
                        style={{
                            width: '100%',
                            padding: '15px 20px',
                            background: '#0a0b0d',
                            border: '2px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            outline: 'none',
                            transition: '0.3s'
                        }}
                        className="guru-search-field"
                    />
                    <button 
                        type="submit"
                        style={{
                            background: '#f15a24',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0 25px',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: '0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Search size={22} strokeWidth={3} />
                    </button>
                </form>
                
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <span style={{ fontSize: '9px', color: '#4b5563', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Guru Verified Affiliate Partner
                    </span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-heureka-btn:hover {
                    transform: scale(1.03);
                    filter: brightness(1.1);
                    box-shadow: 0 15px 35px rgba(241, 90, 36, 0.5);
                }
                .guru-search-field:focus {
                    border-color: #f15a24 !important;
                    box-shadow: 0 0 15px rgba(241, 90, 36, 0.2);
                }
                @media (max-width: 768px) {
                    .heureka-buttons-row { flex-direction: column; }
                    .guru-heureka-btn { width: 100%; }
                    .heureka-search-wrap { padding: 15px; }
                }
            `}} />
        </div>
    );
};

export default HeurekaButtons;
