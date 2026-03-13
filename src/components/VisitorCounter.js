"use client";

import React, { useState, useEffect } from 'react';

/**
 * GURU VISITOR COUNTER V1.0 (CLIENT SIDE)
 * Cesta: src/components/VisitorCounter.js
 * 🚀 Důvod: Fetchujeme data až v prohlížeči, aby SSR build na Vercelu neházel chybu 404/500.
 */

export default function VisitorCounter({ locale }) {
  const [count, setCount] = useState("8 589+");

  useEffect(() => {
    async function getLiveStats() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          if (data.totalUsers) setCount(data.totalUsers);
        }
      } catch (e) {
        console.error("Counter fetch failed", e);
      }
    }
    getLiveStats();
  }, []);

  return (
    <div style={{ marginBottom: '25px', color: '#a855f7', fontWeight: '950', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
      {locale === 'en' 
        ? <>COMMUNITY SITE VISITED BY <span className="guru-counter-box">{count}</span> FANS 💪🏼</>
        : <>KOMUNITNÍ WEB NAVŠTÍVILO JIŽ <span className="guru-counter-box">{count}</span> FANOUŠKŮ 💪🏼</>
      }
    </div>
  );
}
