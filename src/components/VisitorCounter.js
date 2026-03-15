"use client";

import React, { useState, useEffect } from "react";

export default function VisitorCounter({ locale }) {
  const [count, setCount] = useState("...");

  useEffect(() => {
    async function getLiveStats() {
      try {
        const res = await fetch("/api/analytics");

        if (res.ok) {
          const data = await res.json();

          if (data.pageviews) {
            const formatted = Number(data.pageviews).toLocaleString("cs-CZ") + "+";
            setCount(formatted);
          }
        }
      } catch (e) {
        console.error("Counter fetch failed", e);
      }
    }

    getLiveStats();
  }, []);

  return (
    <div
      style={{
        marginBottom: "25px",
        color: "#a855f7",
        fontWeight: "950",
        fontSize: "15px",
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}
    >
      {locale === "en" ? (
        <>
          COMMUNITY SITE VISITED BY{" "}
          <span className="guru-counter-box">{count}</span> FANS 💪🏼
        </>
      ) : (
        <>
          KOMUNITNÍ WEB NAVŠTÍVILO JIŽ{" "}
          <span className="guru-counter-box">{count}</span> FANOUŠKŮ 💪🏼
        </>
      )}
    </div>
  );
}
