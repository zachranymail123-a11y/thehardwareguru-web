import React from 'react';

export default function TipyPage() {
  // TADY BUDOU DATA ZE SUPABASE (Zatím ukázka pro schválení designu)
  const tipyData = [
    {
      id: 1,
      title: "Undervolting: Nižší teploty, stejný výkon ⚡",
      description: "Jak zkrotit moderní CPU a GPU bez ztráty FPS. Návod na bezpečné ladění napětí pro stabilnější stroj.",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop",
      youtubeId: "vBfOLeI8qYI",
      category: "HARDWARE",
      date: "3. Března 2026"
    },
    {
      id: 2,
      title: "Lokální AI: Tvůj vlastní Guru v PC 🤖",
      description: "Návod, jak rozjet LLM modely lokálně přes LM Studio nebo Ollama. Soukromí a výkon bez cloudu.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
      youtubeId: "vBfOLeI8qYI",
      category: "AI",
      date: "2. Března 2026"
    },
    {
      id: 3,
      title: "Optimalizace Windows 11 pro Gaming 🎮",
      description: "Které služby vypnout a jak nastavit registry, aby tě systém nebrzdil v nejvypjatějších momentech.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
      youtubeId: "vBfOLeI8qYI",
      category: "SOFTWARE",
      date: "1. Března 2026"
    }
  ];

  return (
    <div style={{ backgroundColor: '#0a0b0d', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '80px 20px' }}>
      
      {/* HLAVIČKA SEKCE */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{ color: '#a855f7', fontSize: '12px', letterSpacing: '5px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' }}>
          Databáze znalostí
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: '900', margin: '0', letterSpacing: '-3px', lineHeight: '1' }}>
          TIPY A TRIKY ⚡
        </h1>
        <div style={{ width: '60px', h: '4px', background: '#a855f7', margin: '30px auto' }}></div>
      </div>

      {/* GRID ČLÁNKŮ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
        
        {tipyData.map((tip) => (
          <article key={tip.id} style={{
            background: '#111318',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '32px',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}>
            {/* OBRÁZEK S KATEGORIÍ */}
            <div style={{ width: '100%', height: '220px', position: 'relative' }}>
              <img src={tip.image} alt={tip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#a855f7', padding: '6px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)' }}>
                {tip.category}
              </div>
            </div>

            <div style={{ padding: '30px' }}>
              <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '10px' }}>{tip.date}</div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px', lineHeight: '1.2' }}>{tip.title}</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {tip.description}
              </p>

              {/* YOUTUBE PREVIEW / PLAY ICON */}
              <div style={{ 
                background: '#0a0b0d', border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '16px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>▶</div>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Zhlédnout video návod</span>
              </div>
            </div>
          </article>
        ))}

      </div>

      {/* FOOTER SEKCE */}
      <div style={{ marginTop: '100px', textAlign: 'center', opacity: '0.3' }}>
        <p style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>THE HARDWARE GURU • AI AUTOMATED CONTENT</p>
      </div>
    </div>
  );
}
