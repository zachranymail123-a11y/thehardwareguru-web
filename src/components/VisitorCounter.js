"use client";

import React, { useState, useEffect } from "react";

export default function VisitorCounter({ locale }) {
  const [count, setCount] = useState("...");

  useEffect(() => {
    async function getLiveStats() {
      try {
        const res = await fetch("/api/analytics");

        if (!res.ok) return;

        const data = await res.json();

        if (data.formatted_pageviews) {
          setCount(data.formatted_pageviews + "+");
          return;
        }

        if (data.pageviews) {
          const formatted =
            Number(data.pageviews).toLocaleString("cs-CZ") + "+";
          setCount(formatted);
        }
      } catch (e) {
        console.error("Counter fetch failed", e);
      }
    }

    getLiveStats();

    // refresh každých 10 minut
    const interval = setInterval(getLiveStats, 600000);

    return () => clearInterval(interval);
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
          OUR PAGES HAVE{" "}
          <span className="guru-counter-box">{count}</span> VIEWS 🚀
        </>
      ) : (
        <>
          NAŠE STRÁNKY MAJÍ JIŽ{" "}
          <span className="guru-counter-box">{count}</span> ZOBRAZENÍ 🚀
        </>
      )}
    </div>
  );
}
